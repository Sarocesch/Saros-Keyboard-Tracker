pub const CREATE_TABLES: &str = "
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -8000;

CREATE TABLE IF NOT EXISTS key_counts (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    date     TEXT    NOT NULL,
    key_name TEXT    NOT NULL,
    count    INTEGER NOT NULL DEFAULT 0,
    UNIQUE(date, key_name)
);

CREATE TABLE IF NOT EXISTS mouse_counts (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    date   TEXT    NOT NULL,
    button TEXT    NOT NULL,
    count  INTEGER NOT NULL DEFAULT 0,
    UNIQUE(date, button)
);

CREATE INDEX IF NOT EXISTS idx_key_counts_date   ON key_counts(date);
CREATE INDEX IF NOT EXISTS idx_mouse_counts_date ON mouse_counts(date);
";
