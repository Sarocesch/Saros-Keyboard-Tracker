pub mod queries;
pub mod schema;

use crate::state::DbPool;
use parking_lot::Mutex;
use rusqlite::Connection;
use std::sync::Arc;
use tauri::AppHandle;

pub fn init_db(app: &AppHandle) -> Result<DbPool, Box<dyn std::error::Error>> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&data_dir)?;

    let db_path = data_dir.join("saros_tracker.db");
    let conn = Connection::open(db_path)?;
    conn.execute_batch(schema::CREATE_TABLES)?;

    Ok(Arc::new(Mutex::new(conn)))
}
