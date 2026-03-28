use crate::{db::queries, hooks::input_hook, state::AppState};
use tauri::State;
use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
pub async fn set_autostart<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    enabled: bool,
) -> Result<(), String> {
    let manager = app.autolaunch();
    if enabled {
        manager.enable().map_err(|e| e.to_string())
    } else {
        manager.disable().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn get_autostart_enabled<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<bool, String> {
    app.autolaunch()
        .is_enabled()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reset_all_data(state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock();
    queries::delete_all(&db).map_err(|e| e.to_string())
}

/// Returned by `get_tracking_paused` so the frontend knows whether tracking
/// is paused manually, automatically (game mode), or not at all.
#[derive(serde::Serialize)]
pub struct TrackingStatus {
    /// True when the user manually paused via button or tray menu.
    pub manual: bool,
    /// True when the fullscreen-watcher auto-paused because a game was detected.
    pub game: bool,
}

#[tauri::command]
pub fn get_tracking_paused() -> TrackingStatus {
    TrackingStatus {
        manual: input_hook::is_manually_paused(),
        game: input_hook::is_game_mode_paused(),
    }
}

#[tauri::command]
pub fn set_tracking_paused<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    paused: bool,
) -> Result<(), String> {
    input_hook::set_paused(paused);
    // Only update the tooltip for the manual-pause case; game-mode tooltip is
    // managed by the fullscreen watcher thread.
    if !input_hook::is_game_mode_paused() {
        if let Some(tray) = app.tray_by_id("main-tray") {
            let tooltip = if paused {
                "Saros Keyboard Tracker — Tracking Paused"
            } else {
                "Saros Keyboard Tracker"
            };
            let _ = tray.set_tooltip(Some(tooltip));
        }
    }
    Ok(())
}
