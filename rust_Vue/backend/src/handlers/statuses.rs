use super::ApiResult;
use crate::{models::StatusRow, AppState};
use axum::{extract::State, routing::get, Json, Router};

pub fn routes() -> Router<AppState> {
    Router::new().route("/", get(list))
}

async fn list(State(state): State<AppState>) -> ApiResult<Json<Vec<StatusRow>>> {
    let rows = sqlx::query_as::<_, StatusRow>(
        "SELECT TRIM(matt) AS matt, tentrangthai FROM trangthai ORDER BY matt",
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(rows))
}
