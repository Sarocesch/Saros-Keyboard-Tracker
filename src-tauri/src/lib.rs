mod commands;
mod db;
mod hooks;
mod state;
mod tray;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
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
            let db_pool = db::init_db(app.handle()).map_err(|e| e.to_string())?;
            app.manage(state::AppState::new(db_pool));
            tray::menu::build_tray(app)?;
            hooks::input_hook::start(app.handle().clone());
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
