use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct KeyCount {
    pub key_name: String,
    pub count: u64,
}

#[derive(Serialize, Deserialize)]
pub struct MouseCount {
    pub button: String,
    pub count: u64,
}

#[derive(Serialize, Deserialize)]
pub struct DailyTotal {
    pub date: String,
    pub total_keypresses: u64,
    pub total_clicks: u64,
}

pub fn upsert_key_count(conn: &Connection, date: &str, key_name: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO key_counts (date, key_name, count) VALUES (?1, ?2, 1)
         ON CONFLICT(date, key_name) DO UPDATE SET count = count + 1",
        rusqlite::params![date, key_name],
    )?;
    Ok(())
}

pub fn upsert_mouse_count(conn: &Connection, date: &str, button: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO mouse_counts (date, button, count) VALUES (?1, ?2, 1)
         ON CONFLICT(date, button) DO UPDATE SET count = count + 1",
        rusqlite::params![date, button],
    )?;
    Ok(())
}

pub fn get_key_counts(conn: &Connection, date: &str) -> Result<Vec<KeyCount>> {
    let mut stmt = conn.prepare(
        "SELECT key_name, count FROM key_counts WHERE date = ?1 ORDER BY count DESC",
    )?;
    let rows = stmt.query_map(rusqlite::params![date], |row| {
        Ok(KeyCount {
            key_name: row.get(0)?,
            count: row.get::<_, i64>(1)? as u64,
        })
    })?;
    rows.collect()
}

pub fn get_mouse_counts(conn: &Connection, date: &str) -> Result<Vec<MouseCount>> {
    let mut stmt = conn.prepare(
        "SELECT button, count FROM mouse_counts WHERE date = ?1 ORDER BY count DESC",
    )?;
    let rows = stmt.query_map(rusqlite::params![date], |row| {
        Ok(MouseCount {
            button: row.get(0)?,
            count: row.get::<_, i64>(1)? as u64,
        })
    })?;
    rows.collect()
}

pub fn get_daily_totals(conn: &Connection, days: u32) -> Result<Vec<DailyTotal>> {
    let mut stmt = conn.prepare(
        "SELECT
            date,
            SUM(CASE WHEN type = 'key' THEN count ELSE 0 END) as keypresses,
            SUM(CASE WHEN type = 'mouse' THEN count ELSE 0 END) as clicks
         FROM (
            SELECT date, count, 'key' as type FROM key_counts
            UNION ALL
            SELECT date, count, 'mouse' as type FROM mouse_counts
         )
         GROUP BY date
         ORDER BY date DESC
         LIMIT ?1",
    )?;
    let rows = stmt.query_map(rusqlite::params![days], |row| {
        Ok(DailyTotal {
            date: row.get(0)?,
            total_keypresses: row.get::<_, i64>(1)? as u64,
            total_clicks: row.get::<_, i64>(2)? as u64,
        })
    })?;
    let mut results: Vec<DailyTotal> = rows.collect::<Result<Vec<_>>>()?;
    results.reverse(); // chronological order for chart
    Ok(results)
}

pub fn delete_all(conn: &Connection) -> Result<()> {
    conn.execute_batch("DELETE FROM key_counts; DELETE FROM mouse_counts;")?;
    Ok(())
}
