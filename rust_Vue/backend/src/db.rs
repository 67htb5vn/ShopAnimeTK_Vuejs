use sqlx::{postgres::PgPoolOptions, PgPool};
use std::time::{SystemTime, UNIX_EPOCH};

pub async fn create_pool() -> Result<PgPool, Box<dyn std::error::Error>> {
    let database_url = std::env::var("DATABASE_URL")?;

    PgPoolOptions::new()
        .max_connections(8)
        .connect(&database_url)
        .await
        .map_err(Into::into)
}

pub fn new_id(prefix: &str) -> String {
    // Các cột id trong DB là varchar(10), nên sinh id ngắn: SP12345678.
    let millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
        % 100_000_000;
    let available = 10usize.saturating_sub(prefix.len());
    let raw = format!("{:08}", millis);
    let suffix = &raw[raw.len().saturating_sub(available)..];
    format!("{}{}", prefix, suffix)
}
