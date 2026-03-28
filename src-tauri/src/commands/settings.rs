use crate::{db::queries, hooks::input_hook, state::AppState};
use tauri::State;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_store::StoreExt;

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

// ── Tracking pause ────────────────────────────────────────────────────────────

/// Returned by `get_tracking_paused` so the frontend can distinguish between
/// a manual pause and an automatic game-mode pause.
#[derive(serde::Serialize)]
pub struct TrackingStatus {
    /// True when the user manually paused via button or tray menu.
    pub manual: bool,
    /// True when the game-mode watcher auto-paused (game process in focus).
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

// ── Game-process list ─────────────────────────────────────────────────────────

const STORE_FILE: &str = "settings.json";
const STORE_KEY_PROCESSES: &str = "game_processes";

#[tauri::command]
pub fn get_game_processes() -> Vec<String> {
    input_hook::get_game_processes()
}

#[tauri::command]
pub fn set_game_processes<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
    processes: Vec<String>,
) -> Result<(), String> {
    input_hook::set_game_processes(processes.clone());
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(STORE_KEY_PROCESSES, serde_json::json!(processes));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reset_game_processes<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<Vec<String>, String> {
    let defaults = input_hook::default_game_processes();
    input_hook::set_game_processes(defaults.clone());
    let store = app.store(STORE_FILE).map_err(|e| e.to_string())?;
    store.set(STORE_KEY_PROCESSES, serde_json::json!(defaults));
    store.save().map_err(|e| e.to_string())?;
    Ok(defaults)
}

/// Called once during app setup to restore the persisted game-process list.
pub fn load_game_processes<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    if let Ok(store) = app.store(STORE_FILE) {
        if let Some(val) = store.get(STORE_KEY_PROCESSES) {
            if let Ok(procs) = serde_json::from_value::<Vec<String>>(val) {
                if !procs.is_empty() {
                    input_hook::set_game_processes(procs);
                }
            }
        }
    }
}
