mod commands;
mod db;
mod hooks;
mod state;
mod tray;

use std::fs::OpenOptions;
use std::io::Write;
use std::sync::atomic::Ordering;
use tauri::Manager;

pub fn log_to_file(msg: &str) {
    let log_path = std::env::temp_dir().join("saros-tracker-startup.log");
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&log_path) {
        let ts = chrono::Local::now().format("%H:%M:%S%.3f");
        let _ = writeln!(f, "[{ts}] {msg}");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let log_path = std::env::temp_dir().join("saros-tracker-startup.log");
    let _ = std::fs::write(&log_path, "");
    log_to_file("=== Saros Keyboard Tracker starting ===");

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            log_to_file("single-instance: second launch detected, showing window");
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            log_to_file("setup: starting");

            // Step 1: Database
            log_to_file("setup: initializing database");
            let db_pool = match db::init_db(app.handle()) {
                Ok(pool) => { log_to_file("setup: database OK"); pool }
                Err(e) => { log_to_file(&format!("setup: database FAILED: {e}")); return Err(e.to_string().into()); }
            };

            // Step 2: Restore today's session counters from DB so data survives restarts
            log_to_file("setup: restoring session counters from DB");
            let today = chrono::Local::now().format("%Y-%m-%d").to_string();
            let (keys, left, right, middle) = {
                let conn = db_pool.lock();
                db::queries::get_today_counts(&conn, &today).unwrap_or((0, 0, 0, 0))
            };
            log_to_file(&format!("setup: restored keys={keys} left={left} right={right} middle={middle}"));

            let app_state = state::AppState::new(db_pool);
            app_state.session_keypresses.store(keys, Ordering::Relaxed);
            app_state.session_left_clicks.store(left, Ordering::Relaxed);
            app_state.session_right_clicks.store(right, Ordering::Relaxed);
            app_state.session_middle_clicks.store(middle, Ordering::Relaxed);
            app.manage(app_state);

            // Step 3: Tray icon
            log_to_file("setup: building tray icon");
            match tray::menu::build_tray(app) {
                Ok(_) => log_to_file("setup: tray OK"),
                Err(e) => log_to_file(&format!("setup: tray FAILED (non-fatal): {e}")),
            }

            // Step 4: Input hooks
            log_to_file("setup: starting input hooks");
            hooks::input_hook::start(app.handle().clone());
            log_to_file("setup: input hook threads spawned");

            // Step 5: Show window — but NOT when launched by autostart (--hidden flag)
            let launched_hidden = std::env::args().any(|a| a == "--hidden");
            log_to_file(&format!("setup: launched_hidden={launched_hidden}"));
            if !launched_hidden {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    log_to_file("setup: window shown");
                } else {
                    log_to_file("setup: WARNING — main window not found");
                }
            } else {
                log_to_file("setup: autostart mode — window stays hidden in tray");
            }

            log_to_file("setup: complete");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::stats::get_today_stats,
            commands::stats::get_key_stats,
            commands::stats::get_mouse_stats,
            commands::stats::get_daily_totals,
            commands::settings::set_autostart,
            commands::settings::get_autostart_enabled,
            commands::settings::reset_all_data,
            commands::settings::get_tracking_paused,
            commands::settings::set_tracking_paused,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
