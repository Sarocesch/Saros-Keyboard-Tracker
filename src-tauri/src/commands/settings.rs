use crate::{db::queries, state::AppState};
use tauri::State;

#[tauri::command]
pub async fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let autostart = app.autostart_manager();
    if enabled {
        autostart.enable().map_err(|e| e.to_string())
    } else {
        autostart.disable().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub async fn get_autostart_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    use tauri_plugin_autostart::ManagerExt;
    app.autostart_manager()
        .is_enabled()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reset_all_data(state: State<AppState>) -> Result<(), String> {
    let db = state.db.lock();
    queries::delete_all(&db).map_err(|e| e.to_string())
}
