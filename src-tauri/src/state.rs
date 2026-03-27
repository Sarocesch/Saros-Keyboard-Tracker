use parking_lot::Mutex;
use rusqlite::Connection;
use std::sync::{
    atomic::{AtomicU64, Ordering},
    Arc,
};

pub type DbPool = Arc<Mutex<Connection>>;

pub struct AppState {
    pub db: DbPool,
    pub session_keypresses: AtomicU64,
    pub session_left_clicks: AtomicU64,
    pub session_right_clicks: AtomicU64,
    pub session_middle_clicks: AtomicU64,
}

impl AppState {
    pub fn new(db: DbPool) -> Self {
        Self {
            db,
            session_keypresses: AtomicU64::new(0),
            session_left_clicks: AtomicU64::new(0),
            session_right_clicks: AtomicU64::new(0),
            session_middle_clicks: AtomicU64::new(0),
        }
    }

    pub fn total_clicks(&self) -> u64 {
        self.session_left_clicks.load(Ordering::Relaxed)
            + self.session_right_clicks.load(Ordering::Relaxed)
            + self.session_middle_clicks.load(Ordering::Relaxed)
    }
}
