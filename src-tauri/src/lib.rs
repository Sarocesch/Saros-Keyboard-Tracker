mod commands;
mod db;
mod hooks;
mod state;
mod tray;

use std::fs::OpenOptions;
use std::io::Write;
use tauri::Manager;

fn log_to_file(msg: &str) {
    let log_path = std::env::temp_dir().join("saros-tracker-startup.log");
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&log_path) {
        let ts = chrono::Local::now().format("%H:%M:%S%.3f");
        let _ = writeln!(f, "[{ts}] {msg}");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Overwrite log on each fresh start
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
                Ok(pool) => {
                    log_to_file("setup: database OK");
                    pool
                }
                Err(e) => {
                    log_to_file(&format!("setup: database FAILED: {e}"));
                    return Err(e.to_string().into());
                }
            };
            app.manage(state::AppState::new(db_pool));

            // Step 2: Tray icon
            log_to_file("setup: building tray icon");
            match tray::menu::build_tray(app) {
                Ok(_) => log_to_file("setup: tray OK"),
                Err(e) => {
                    // Tray failure is logged but does NOT abort startup —
                    // the user can still use the app via the window
                    log_to_file(&format!("setup: tray FAILED (non-fatal): {e}"));
                }
            }

            // Step 3: Input hooks
            log_to_file("setup: starting input hooks");
            hooks::input_hook::start(app.handle().clone());
            log_to_file("setup: input hook threads spawned");

            // Step 4: Show window explicitly
            log_to_file("setup: showing main window");
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                log_to_file("setup: window shown");
            } else {
                log_to_file("setup: WARNING — main window not found");
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
