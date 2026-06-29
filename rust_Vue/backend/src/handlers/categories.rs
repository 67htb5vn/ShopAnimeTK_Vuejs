use super::ApiResult;
use crate::{
    db::new_id,
    models::{Category, CategoryInput},
    AppState,
};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, put},
    Json, Router,
};

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list).post(create))
        .route("/:id", put(update).delete(remove))
}

async fn list(State(state): State<AppState>) -> ApiResult<Json<Vec<Category>>> {
    let rows =
        sqlx::query_as::<_, Category>("SELECT madmh, tendmh FROM danhmuchang ORDER BY madmh")
            .fetch_all(&state.pool)
            .await?;
    Ok(Json(rows))
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<CategoryInput>,
) -> ApiResult<(StatusCode, Json<Category>)> {
    let id = input.madmh.unwrap_or_else(|| new_id("DM"));
    let row = sqlx::query_as::<_, Category>(
        "INSERT INTO danhmuchang (madmh, tendmh) VALUES ($1, $2) RETURNING madmh, tendmh",
    )
    .bind(id)
    .bind(input.tendmh)
    .fetch_one(&state.pool)
    .await?;
    Ok((StatusCode::CREATED, Json(row)))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(input): Json<CategoryInput>,
) -> ApiResult<Json<Category>> {
    let row = sqlx::query_as::<_, Category>(
        "UPDATE danhmuchang SET tendmh = $2 WHERE madmh = $1 RETURNING madmh, tendmh",
    )
    .bind(id)
    .bind(input.tendmh)
    .fetch_one(&state.pool)
    .await?;
    Ok(Json(row))
}

async fn remove(State(state): State<AppState>, Path(id): Path<String>) -> ApiResult<StatusCode> {
    sqlx::query("DELETE FROM danhmuchang WHERE madmh = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
