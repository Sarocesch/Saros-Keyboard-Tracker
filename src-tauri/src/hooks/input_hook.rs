use crate::{db::queries, log_to_file, state::AppState};
use rdev::{listen, Button, EventType, Key};
use std::{
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc,
    },
    thread,
    time::{Duration, Instant},
};
use tauri::{AppHandle, Manager};

/// Global pause flag — set to `true` to make the hook callback a no-op.
/// Using a module-level static so the rdev callback (which is `'static`)
/// can read it without needing to capture AppState.
static PAUSED: AtomicBool = AtomicBool::new(false);

pub fn set_paused(paused: bool) {
    PAUSED.store(paused, Ordering::Relaxed);
    log_to_file(&format!("tracking: paused={paused}"));
}

pub fn is_paused() -> bool {
    PAUSED.load(Ordering::Relaxed)
}

pub fn toggle_paused() -> bool {
    let was = PAUSED.fetch_xor(true, Ordering::Relaxed);
    let now = !was;
    log_to_file(&format!("tracking: toggled → paused={now}"));
    now
}

#[derive(Debug)]
enum InputEvent {
    KeyPress(Key),
    MouseClick(Button),
}

pub fn start(app: AppHandle) {
    let (tx, rx) = mpsc::channel::<InputEvent>();

    // Thread 1: rdev global hook (WH_KEYBOARD_LL / WH_MOUSE_LL)
    // Runs in a dedicated OS thread with its own Windows message pump.
    // Auto-restarts if listen() ever returns (Windows can evict hooks that
    // are slow to process; the restart loop makes the tracker resilient).
    let tx_hook = tx.clone();
    thread::Builder::new()
        .name("rdev-hook".into())
        .spawn(move || {
            // Give Tauri / WebView2 time to fully initialise before we
            // install the global hook — avoids a race that can cause Windows
            // to silently uninstall the hook right after install.
            thread::sleep(Duration::from_millis(800));

            let mut restart_count: u32 = 0;
            loop {
                log_to_file(&format!(
                    "rdev: installing WH_KEYBOARD_LL / WH_MOUSE_LL (attempt {})",
                    restart_count + 1
                ));

                // Each iteration of the loop needs its own clone so the
                // closure can capture it by move.
                let tx2 = tx_hook.clone();
                let result = listen(move |event| {
                    // Return immediately when paused — keeps the callback
                    // as fast as possible so Windows never evicts the hook.
                    if PAUSED.load(Ordering::Relaxed) {
                        return;
                    }
                    match event.event_type {
                        EventType::KeyPress(key) => {
                            let _ = tx2.send(InputEvent::KeyPress(key));
                        }
                        EventType::ButtonPress(btn) => {
                            let _ = tx2.send(InputEvent::MouseClick(btn));
                        }
                        _ => {}
                    }
                });

                restart_count += 1;
                log_to_file(&format!(
                    "rdev: hook stopped after {} restarts — reason: {:?}. Restarting in 500 ms…",
                    restart_count, result
                ));
                thread::sleep(Duration::from_millis(500));
            }
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
