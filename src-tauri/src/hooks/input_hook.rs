use crate::{db::queries, log_to_file, state::AppState};
use rdev::{listen, Button, EventType, Key};
use std::{
    sync::mpsc,
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

    // Thread 1: rdev global hook (WH_KEYBOARD_LL / WH_MOUSE_LL)
    // Must run on a dedicated OS thread — rdev creates its own Windows message pump
    thread::Builder::new()
        .name("rdev-hook".into())
        .spawn(move || {
            log_to_file("rdev: hook thread started, installing WH_LL hooks...");
            let result = listen(move |event| match event.event_type {
                EventType::KeyPress(key) => {
                    let _ = tx_clone.send(InputEvent::KeyPress(key));
                }
                EventType::ButtonPress(btn) => {
                    let _ = tx_clone.send(InputEvent::MouseClick(btn));
                }
                _ => {}
            });
            // listen() only returns on error
            log_to_file(&format!("rdev: hook STOPPED with error: {:?}", result));
        })
        .expect("failed to spawn rdev thread");

    // Thread 2: batch writer — flushes to SQLite every 500ms
    thread::Builder::new()
        .name("input-writer".into())
        .spawn(move || {
            log_to_file("rdev: writer thread started");
            let state = app.state::<AppState>();
            let mut batch: Vec<InputEvent> = Vec::with_capacity(128);
            let mut last_flush = Instant::now();
            let mut total_events: u64 = 0;

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

                if !batch.is_empty() {
                    total_events += batch.len() as u64;
                    // Log first few events to confirm global hook works
                    if total_events <= 5 {
                        log_to_file(&format!("rdev: first events received (total so far: {total_events})"));
                    }
                    flush_batch(&state, &mut batch);
                    last_flush = Instant::now();
                } else if last_flush.elapsed() > Duration::from_secs(30) {
                    last_flush = Instant::now();
                }
            }
        })
        .expect("failed to spawn writer thread");
}

fn flush_batch(state: &tauri::State<'_, AppState>, batch: &mut Vec<InputEvent>) {
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
                state.session_keypresses.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            }
            InputEvent::MouseClick(btn) => {
                let btn_name = format!("{:?}", btn);
                let _ = queries::upsert_mouse_count(&db, &today, &btn_name);
                match btn {
                    Button::Left => state.session_left_clicks.fetch_add(1, std::sync::atomic::Ordering::Relaxed),
                    Button::Right => state.session_right_clicks.fetch_add(1, std::sync::atomic::Ordering::Relaxed),
                    Button::Middle => state.session_middle_clicks.fetch_add(1, std::sync::atomic::Ordering::Relaxed),
                    _ => 0,
                };
            }
        }
    }
}
