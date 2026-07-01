use super::ApiResult;
use crate::{
    db::new_id,
    models::{Anime, AnimeInput},
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

async fn list(State(state): State<AppState>) -> ApiResult<Json<Vec<Anime>>> {
    let rows = sqlx::query_as::<_, Anime>("SELECT mahh, tenhh, mota FROM hoathinh ORDER BY mahh")
        .fetch_all(&state.pool)
        .await?;
    Ok(Json(rows))
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<AnimeInput>,
) -> ApiResult<(StatusCode, Json<Anime>)> {
    let id = input.mahh.unwrap_or_else(|| new_id("HH"));
    let row = sqlx::query_as::<_, Anime>(
        "INSERT INTO hoathinh (mahh, tenhh, mota) VALUES ($1, $2, $3) RETURNING mahh, tenhh, mota",
    )
    .bind(id)
    .bind(input.tenhh)
    .bind(input.mota)
    .fetch_one(&state.pool)
    .await?;
    Ok((StatusCode::CREATED, Json(row)))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(input): Json<AnimeInput>,
) -> ApiResult<Json<Anime>> {
    let row = sqlx::query_as::<_, Anime>(
        "UPDATE hoathinh SET tenhh = $2, mota = $3 WHERE mahh = $1 RETURNING mahh, tenhh, mota",
    )
    .bind(id)
    .bind(input.tenhh)
    .bind(input.mota)
    .fetch_one(&state.pool)
    .await?;
    Ok(Json(row))
}

async fn remove(State(state): State<AppState>, Path(id): Path<String>) -> ApiResult<StatusCode> {
    sqlx::query("DELETE FROM hoathinh WHERE mahh = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
