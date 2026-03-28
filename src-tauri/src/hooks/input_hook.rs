use crate::{db::queries, log_to_file, state::AppState};
use parking_lot::RwLock;
use rdev::{listen, Button, EventType, Key};
use std::{
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc, OnceLock,
    },
    thread,
    time::{Duration, Instant},
};
use tauri::{AppHandle, Manager};

// ── Pause flags ────────────────────────────────────────────────────────────────

/// Manual pause — toggled by the user via UI button or tray menu.
static PAUSED: AtomicBool = AtomicBool::new(false);

/// Auto-pause — set by the fullscreen/game-process watcher thread.
static AUTO_PAUSED: AtomicBool = AtomicBool::new(false);

// ── Game-process list ─────────────────────────────────────────────────────────

/// Runtime list of executable names (lowercase) that trigger auto-pause
/// when they are the foreground window's process.
static GAME_PROCESSES: OnceLock<RwLock<Vec<String>>> = OnceLock::new();

fn game_processes() -> &'static RwLock<Vec<String>> {
    GAME_PROCESSES.get_or_init(|| RwLock::new(default_game_processes()))
}

pub fn default_game_processes() -> Vec<String> {
    vec![
        "javaw.exe".into(),               // Minecraft Java + any Java game
        "java.exe".into(),
        "minecraft.windows.exe".into(),   // Minecraft Bedrock
        "robloxplayerbeta.exe".into(),    // Roblox
        "gta5.exe".into(),
        "cs2.exe".into(),
        "csgo.exe".into(),
        "r5apex.exe".into(),              // Apex Legends
        "escapefromtarkov.exe".into(),
        "valorant-win64-shipping.exe".into(),
        "fortnite.exe".into(),
        "eldenring.exe".into(),
        "sekiro.exe".into(),
    ]
}

pub fn get_game_processes() -> Vec<String> {
    game_processes().read().clone()
}

pub fn set_game_processes(processes: Vec<String>) {
    let normalised: Vec<String> = processes
        .into_iter()
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty())
        .collect();
    let count = normalised.len();
    *game_processes().write() = normalised;
    log_to_file(&format!("game-processes: list updated ({count} entries)"));
}

// ── Public pause API ──────────────────────────────────────────────────────────

pub fn is_manually_paused() -> bool {
    PAUSED.load(Ordering::Relaxed)
}

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

// ── Fullscreen + process detection (Windows) ──────────────────────────────────

/// Returns `true` when tracking should be auto-paused.
/// Two triggers:
///   1. The foreground window's process is in the game-process list.
///   2. The foreground window has no title bar AND covers the full monitor
///      (borderless / exclusive fullscreen game not in the list).
#[cfg(windows)]
fn should_auto_pause() -> bool {
    use std::mem;
    use windows_sys::Win32::Foundation::CloseHandle;
    use windows_sys::Win32::Graphics::Gdi::{
        GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST,
    };
    use windows_sys::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowLongPtrW, GetWindowRect, GetWindowThreadProcessId,
    };

    const WS_CAPTION: u32 = 0x00C0_0000;
    const GWL_STYLE: i32 = -16;

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return false;
        }

        // ── Check 1: known game process? ──────────────────────────────────
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);

        if pid != 0 {
            let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
            if !handle.is_null() {
                let mut buf = [0u16; 260];
                let mut size: u32 = buf.len() as u32;
                let ok = QueryFullProcessImageNameW(handle, 0, buf.as_mut_ptr(), &mut size);
                CloseHandle(handle);

                if ok != 0 {
                    let path = String::from_utf16_lossy(&buf[..size as usize]);
                    if let Some(exe) = path.rsplit(['\\', '/']).next() {
                        let exe_lower = exe.to_lowercase();
                        let procs = game_processes().read();
                        if procs.iter().any(|g| *g == exe_lower) {
                            return true;
                        }
                    }
                }
            }
        }

        // ── Check 2: fullscreen window without title bar? ─────────────────
        let style = GetWindowLongPtrW(hwnd, GWL_STYLE) as u32;
        if style & WS_CAPTION != 0 {
            return false; // Normal titled window — not a fullscreen game
        }

        let mut wr: windows_sys::Win32::Foundation::RECT = mem::zeroed();
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
fn should_auto_pause() -> bool {
    false
}

/// Spawns the background watcher thread. Polls every 2 seconds and flips
/// `AUTO_PAUSED` when the result of `should_auto_pause()` changes.
pub fn start_fullscreen_watcher(app: AppHandle) {
    thread::Builder::new()
        .name("game-mode-watcher".into())
        .spawn(move || {
            thread::sleep(Duration::from_secs(4));
            log_to_file("game-mode-watcher: started polling");

            loop {
                thread::sleep(Duration::from_secs(2));

                let was_auto = AUTO_PAUSED.load(Ordering::Relaxed);
                let now_auto = should_auto_pause();

                if now_auto == was_auto {
                    continue;
                }

                AUTO_PAUSED.store(now_auto, Ordering::Relaxed);
                log_to_file(&format!("game-mode-watcher: auto_paused={now_auto}"));

                if let Some(tray) = app.tray_by_id("main-tray") {
                    let tooltip = if now_auto {
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
        .expect("failed to spawn game-mode-watcher thread");
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
            thread::sleep(Duration::from_millis(800));
            let mut restart_count: u32 = 0;
            loop {
                log_to_file(&format!(
                    "rdev: installing hooks (attempt {})",
                    restart_count + 1
                ));
                let tx2 = tx_hook.clone();
                let result = listen(move |event| {
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
                    "rdev: hook stopped ({} restarts) — reason: {:?}. Restarting in 500 ms…",
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
                            "rdev: first events (total so far: {total_events})"
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
