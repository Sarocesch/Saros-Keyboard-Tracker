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

/// Manual pause — toggled by the user via UI or tray menu.
static PAUSED: AtomicBool = AtomicBool::new(false);

/// Auto-pause — set automatically by the fullscreen watcher when a
/// borderless/exclusive fullscreen window (game) is in the foreground.
/// Kept separate so manual pause and auto-pause don't interfere.
static AUTO_PAUSED: AtomicBool = AtomicBool::new(false);

// ── Public API ────────────────────────────────────────────────────────────────

/// True when tracking is suppressed for any reason (manual OR game mode).
pub fn is_paused() -> bool {
    PAUSED.load(Ordering::Relaxed) || AUTO_PAUSED.load(Ordering::Relaxed)
}

/// Only the manual pause flag — used by the UI toggle button.
pub fn is_manually_paused() -> bool {
    PAUSED.load(Ordering::Relaxed)
}

/// True when the auto-pause (game mode) is active.
pub fn is_game_mode_paused() -> bool {
    AUTO_PAUSED.load(Ordering::Relaxed)
}

pub fn set_paused(paused: bool) {
    PAUSED.store(paused, Ordering::Relaxed);
    log_to_file(&format!("tracking: manual paused={paused}"));
}

pub fn toggle_paused() -> bool {
    let was = PAUSED.fetch_xor(true, Ordering::Relaxed);
    let now = !was;
    log_to_file(&format!("tracking: toggled → manual paused={now}"));
    now
}

// ── Fullscreen detection (Windows only) ──────────────────────────────────────

/// Returns true when the foreground window covers the entire monitor AND
/// has no title bar — i.e. a fullscreen or borderless-fullscreen game.
#[cfg(windows)]
fn is_foreground_fullscreen() -> bool {
    use std::mem;
    use windows_sys::Win32::Foundation::RECT;
    use windows_sys::Win32::Graphics::Gdi::{
        GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowLongPtrW, GetWindowRect,
    };

    // WS_CAPTION = 0x00C00000 — present on all normal titled windows.
    // Fullscreen (exclusive or borderless) game windows don't have it.
    const WS_CAPTION: u32 = 0x00C0_0000;
    const GWL_STYLE: i32 = -16;

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return false;
        }

        // Quickly reject normal windows / maximised app windows
        let style = GetWindowLongPtrW(hwnd, GWL_STYLE) as u32;
        if style & WS_CAPTION != 0 {
            return false;
        }

        let mut wr: RECT = mem::zeroed();
        if GetWindowRect(hwnd, &mut wr) == 0 {
            return false;
        }

        let hmon = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
        let mut mi: MONITORINFO = mem::zeroed();
        mi.cbSize = mem::size_of::<MONITORINFO>() as u32;
        if GetMonitorInfoW(hmon, &mut mi) == 0 {
            return false;
        }

        let mr = mi.rcMonitor;
        wr.left <= mr.left && wr.top <= mr.top && wr.right >= mr.right && wr.bottom >= mr.bottom
    }
}

#[cfg(not(windows))]
fn is_foreground_fullscreen() -> bool {
    false
}

/// Spawns a background thread that polls every 2 seconds for a fullscreen
/// window and flips AUTO_PAUSED accordingly. Updates the tray tooltip too.
pub fn start_fullscreen_watcher(app: AppHandle) {
    thread::Builder::new()
        .name("fullscreen-watcher".into())
        .spawn(move || {
            // Let everything settle before we start polling
            thread::sleep(Duration::from_secs(4));
            log_to_file("fullscreen-watcher: started polling");

            loop {
                thread::sleep(Duration::from_secs(2));

                let was_auto = AUTO_PAUSED.load(Ordering::Relaxed);
                let now_fullscreen = is_foreground_fullscreen();

                if now_fullscreen == was_auto {
                    continue; // No change
                }

                AUTO_PAUSED.store(now_fullscreen, Ordering::Relaxed);
                log_to_file(&format!(
                    "fullscreen-watcher: game_mode={}",
                    now_fullscreen
                ));

                // Update tray tooltip to reflect the new state
                if let Some(tray) = app.tray_by_id("main-tray") {
                    let tooltip = if now_fullscreen {
                        "Saros Keyboard Tracker — Game Mode (auto-paused)"
                    } else if PAUSED.load(Ordering::Relaxed) {
                        "Saros Keyboard Tracker — Tracking Paused"
                    } else {
                        "Saros Keyboard Tracker"
                    };
                    let _ = tray.set_tooltip(Some(tooltip));
                }
            }
        })
        .expect("failed to spawn fullscreen-watcher thread");
}

// ── Input event types ─────────────────────────────────────────────────────────

#[derive(Debug)]
enum InputEvent {
    KeyPress(Key),
    MouseClick(Button),
}

// ── Hook startup ──────────────────────────────────────────────────────────────

pub fn start(app: AppHandle) {
    let (tx, rx) = mpsc::channel::<InputEvent>();

    // Thread 1: rdev global hook (WH_KEYBOARD_LL / WH_MOUSE_LL)
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

                let tx2 = tx_hook.clone();
                let result = listen(move |event| {
                    // Return immediately when paused (manual or auto).
                    // Keeping the callback as fast as possible prevents
                    // Windows from evicting the hook due to timeout.
                    if PAUSED.load(Ordering::Relaxed) || AUTO_PAUSED.load(Ordering::Relaxed) {
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

    // Thread 2: batch writer — flushes to SQLite every 500 ms
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
                    if total_events <= 5 {
                        log_to_file(&format!(
                            "rdev: first events received (total so far: {total_events})"
                        ));
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
