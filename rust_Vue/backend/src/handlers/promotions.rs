use super::ApiResult;
use crate::{
    db::new_id,
    models::{Promotion, PromotionInput},
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

async fn list(State(state): State<AppState>) -> ApiResult<Json<Vec<Promotion>>> {
    let rows = sqlx::query_as::<_, Promotion>(
        "SELECT makm, tenkm, ngaybd, ngaykt, mucgiam, dieukien, giatri FROM khuyenmai ORDER BY ngaybd DESC NULLS LAST, makm"
    ).fetch_all(&state.pool).await?;
    Ok(Json(rows))
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<PromotionInput>,
) -> ApiResult<(StatusCode, Json<Promotion>)> {
    let id = input.makm.unwrap_or_else(|| new_id("KM"));
    let row = sqlx::query_as::<_, Promotion>(
        r#"INSERT INTO khuyenmai (makm, tenkm, ngaybd, ngaykt, mucgiam, dieukien, giatri)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING makm, tenkm, ngaybd, ngaykt, mucgiam, dieukien, giatri"#,
    )
    .bind(id)
    .bind(input.tenkm)
    .bind(input.ngaybd)
    .bind(input.ngaykt)
    .bind(input.mucgiam)
    .bind(input.dieukien)
    .bind(input.giatri)
    .fetch_one(&state.pool)
    .await?;
    Ok((StatusCode::CREATED, Json(row)))
}

async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(input): Json<PromotionInput>,
) -> ApiResult<Json<Promotion>> {
    let row = sqlx::query_as::<_, Promotion>(
        r#"UPDATE khuyenmai
           SET tenkm=$2, ngaybd=$3, ngaykt=$4, mucgiam=$5, dieukien=$6, giatri=$7
           WHERE makm=$1
           RETURNING makm, tenkm, ngaybd, ngaykt, mucgiam, dieukien, giatri"#,
    )
    .bind(id)
    .bind(input.tenkm)
    .bind(input.ngaybd)
    .bind(input.ngaykt)
    .bind(input.mucgiam)
    .bind(input.dieukien)
    .bind(input.giatri)
    .fetch_one(&state.pool)
    .await?;
    Ok(Json(row))
}

async fn remove(State(state): State<AppState>, Path(id): Path<String>) -> ApiResult<StatusCode> {
    sqlx::query("DELETE FROM khuyenmai WHERE makm = $1")
        .bind(id)
        .execute(&state.pool)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
