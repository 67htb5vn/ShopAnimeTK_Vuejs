use super::ApiResult;
use crate::{
    db::new_id,
    models::{Tag, TagInput},
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

async fn list(State(state): State<AppState>) -> ApiResult<Json<Vec<Tag>>> {
    let rows = sqlx::query_as::<_, Tag>("SELECT matag, tentag FROM tag ORDER BY matag")
        .fetch_all(&state.pool)
        .await?;
    Ok(Json(rows))
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<TagInput>,
) -> ApiResult<(StatusCode, Json<Tag>)> {
    let id = input.matag.unwrap_or_else(|| new_id("TAG"));
    let row = sqlx::query_as::<_, Tag>(
        "INSERT INTO tag (matag, tentag) VALUES ($1, $2) RETURNING matag, tentag",
    )
    .bind(id)
    .bind(input.tentag)
    .fetch_one(&state.pool)
    .await?;
    Ok((StatusCode::CREATED, Json(row)))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(input): Json<TagInput>,
) -> ApiResult<Json<Tag>> {
    let row = sqlx::query_as::<_, Tag>(
        "UPDATE tag SET tentag = $2 WHERE matag = $1 RETURNING matag, tentag",
    )
    .bind(id)
    .bind(input.tentag)
    .fetch_one(&state.pool)
    .await?;
    Ok(Json(row))
}

async fn remove(State(state): State<AppState>, Path(id): Path<String>) -> ApiResult<StatusCode> {
    sqlx::query("DELETE FROM chitiettag WHERE matag = $1")
        .bind(&id)
        .execute(&state.pool)
        .await?;
    sqlx::query("DELETE FROM tag WHERE matag = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
