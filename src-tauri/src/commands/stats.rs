use crate::{db::queries, state::AppState};
use serde::Serialize;
use std::sync::atomic::Ordering;
use tauri::State;

#[derive(Serialize)]
pub struct TodayStats {
    pub total_keypresses: u64,
    pub total_clicks: u64,
    pub left_clicks: u64,
    pub right_clicks: u64,
    pub middle_clicks: u64,
    pub date: String,
}

#[tauri::command]
pub fn get_today_stats(state: State<AppState>) -> TodayStats {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    TodayStats {
        total_keypresses: state.session_keypresses.load(Ordering::Relaxed),
        total_clicks: state.total_clicks(),
        left_clicks: state.session_left_clicks.load(Ordering::Relaxed),
        right_clicks: state.session_right_clicks.load(Ordering::Relaxed),
        middle_clicks: state.session_middle_clicks.load(Ordering::Relaxed),
        date: today,
    }
}

#[tauri::command]
pub fn get_key_stats(state: State<AppState>, date: String) -> Vec<queries::KeyCount> {
    let db = state.db.lock();
    queries::get_key_counts(&db, &date).unwrap_or_default()
}

#[tauri::command]
pub fn get_mouse_stats(state: State<AppState>, date: String) -> Vec<queries::MouseCount> {
    let db = state.db.lock();
    queries::get_mouse_counts(&db, &date).unwrap_or_default()
}

#[tauri::command]
pub fn get_daily_totals(state: State<AppState>, days: u32) -> Vec<queries::DailyTotal> {
    let db = state.db.lock();
    queries::get_daily_totals(&db, days).unwrap_or_default()
}
