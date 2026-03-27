use crate::{db::queries, state::AppState};
use rdev::{listen, Button, EventType, Key};
use std::{
    sync::{mpsc, Arc},
    thread,
    time::{Duration, Instant},
};
use tauri::{AppHandle, Manager};

#[derive(Debug)]
enum InputEvent {
    KeyPress(Key),
    MouseClick(Button),
}

pub fn start(app: AppHandle) {
    let (tx, rx) = mpsc::channel::<InputEvent>();
    let tx_clone = tx.clone();

    // Thread 1: rdev listener on dedicated OS thread (required for WH_LL hooks)
    thread::Builder::new()
        .name("rdev-hook".into())
        .spawn(move || {
            listen(move |event| match event.event_type {
                EventType::KeyPress(key) => {
                    let _ = tx_clone.send(InputEvent::KeyPress(key));
                }
                EventType::ButtonPress(btn) => {
                    let _ = tx_clone.send(InputEvent::MouseClick(btn));
                }
                _ => {}
            })
            .expect("rdev listen failed");
        })
        .expect("failed to spawn rdev thread");

    // Thread 2: Batching writer — flushes every 500ms or every 100 events
    thread::Builder::new()
        .name("input-writer".into())
        .spawn(move || {
            let state = app.state::<AppState>();
            let mut batch: Vec<InputEvent> = Vec::with_capacity(128);
            let mut last_flush = Instant::now();

            loop {
                match rx.recv_timeout(Duration::from_millis(500)) {
                    Ok(event) => {
                        batch.push(event);
                        while let Ok(e) = rx.try_recv() {
                            batch.push(e);
                        }
                    }
                    Err(_) => {}
                }

                if !batch.is_empty() || last_flush.elapsed() > Duration::from_secs(5) {
                    flush_batch(&state, &mut batch);
                    last_flush = Instant::now();
                }
            }
        })
        .expect("failed to spawn writer thread");
}

fn flush_batch(state: &Arc<AppState>, batch: &mut Vec<InputEvent>) {
    if batch.is_empty() {
        return;
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let db = state.db.lock();

    for event in batch.drain(..) {
        match event {
            InputEvent::KeyPress(key) => {
                let key_name = format!("{:?}", key);
                let _ = queries::upsert_key_count(&db, &today, &key_name);
                state
                    .session_keypresses
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            }
            InputEvent::MouseClick(btn) => {
                let btn_name = format!("{:?}", btn);
                let _ = queries::upsert_mouse_count(&db, &today, &btn_name);
                match btn {
                    Button::Left => state
                        .session_left_clicks
                        .fetch_add(1, std::sync::atomic::Ordering::Relaxed),
                    Button::Right => state
                        .session_right_clicks
                        .fetch_add(1, std::sync::atomic::Ordering::Relaxed),
                    Button::Middle => state
                        .session_middle_clicks
                        .fetch_add(1, std::sync::atomic::Ordering::Relaxed),
                    _ => 0,
                };
            }
        }
    }
}
