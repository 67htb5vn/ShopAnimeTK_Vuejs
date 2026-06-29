use super::{ApiError, ApiResult};
use crate::{
    models::{AdminSession, ChangePasswordInput, LoginInput, LoginResponse, UpdateProfileInput},
    AppState,
};
use axum::{
    extract::{Request, State},
    http::{header::AUTHORIZATION, HeaderMap},
    middleware::Next,
    response::Response,
    routing::{get, post},
    Json, Router,
};
use uuid::Uuid;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/login", post(login))
        .route("/me", get(me))
        .route("/profile", axum::routing::put(update_profile))
        .route("/password", axum::routing::put(change_password))
        .route("/logout", post(logout))
}

fn bearer_token(headers: &HeaderMap) -> Option<&str> {
    headers
        .get(AUTHORIZATION)?
        .to_str()
        .ok()?
        .strip_prefix("Bearer ")
        .filter(|token| !token.is_empty())
}

async fn session_user(state: &AppState, headers: &HeaderMap) -> ApiResult<(String, AdminSession)> {
    let token = bearer_token(headers)
        .ok_or_else(|| ApiError::unauthorized("Phiên đăng nhập không hợp lệ"))?;
    let user = state
        .sessions
        .read()
        .await
        .get(token)
        .cloned()
        .ok_or_else(|| ApiError::unauthorized("Phiên đăng nhập đã hết hạn"))?;
    Ok((token.to_string(), user))
}

async fn login(
    State(state): State<AppState>,
    Json(input): Json<LoginInput>,
) -> ApiResult<Json<LoginResponse>> {
    let username = input.taikhoan.trim();
    if username.is_empty() || input.matkhau.is_empty() {
        return Err(ApiError::bad_request("Vui lòng nhập tài khoản và mật khẩu"));
    }

    let user = sqlx::query_as::<_, (String, Option<String>, String, Option<String>)>(
        r#"
        SELECT TRIM(mand), ten, taikhoan, email
        FROM nguoidung
        WHERE taikhoan = $1
          AND matkhau = $2
          AND phanquyen = B'1'
          AND trangthai = B'1'
        LIMIT 1
        "#,
    )
    .bind(username)
    .bind(&input.matkhau)
    .fetch_optional(&state.pool)
    .await?;

    let (mand, ten, taikhoan, email) = user.ok_or_else(|| {
        ApiError::unauthorized("Tài khoản hoặc mật khẩu không đúng, hoặc bạn không có quyền admin")
    })?;
    let user = AdminSession {
        mand,
        ten,
        taikhoan,
        email,
    };
    let token = Uuid::new_v4().to_string();
    state
        .sessions
        .write()
        .await
        .insert(token.clone(), user.clone());

    Ok(Json(LoginResponse { token, user }))
}

async fn me(State(state): State<AppState>, headers: HeaderMap) -> ApiResult<Json<AdminSession>> {
    let (_, user) = session_user(&state, &headers).await?;
    Ok(Json(user))
}

async fn update_profile(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<UpdateProfileInput>,
) -> ApiResult<Json<AdminSession>> {
    let (token, current) = session_user(&state, &headers).await?;
    if input.ten.trim().is_empty() {
        return Err(ApiError::bad_request("Tên hiển thị không được để trống"));
    }
    sqlx::query("UPDATE nguoidung SET ten=$2, email=$3 WHERE TRIM(mand)=TRIM($1)")
        .bind(&current.mand)
        .bind(input.ten.trim())
        .bind(input.email.as_deref().map(str::trim).filter(|value| !value.is_empty()))
        .execute(&state.pool)
        .await?;
    let updated = AdminSession {
        ten: Some(input.ten.trim().to_string()),
        email: input.email.as_deref().map(str::trim).filter(|value| !value.is_empty()).map(str::to_string),
        ..current
    };
    state.sessions.write().await.insert(token, updated.clone());
    Ok(Json(updated))
}

async fn change_password(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(input): Json<ChangePasswordInput>,
) -> ApiResult<Json<serde_json::Value>> {
    let (_, current) = session_user(&state, &headers).await?;
    if input.matkhau_moi.len() < 6 {
        return Err(ApiError::bad_request("Mật khẩu mới phải có ít nhất 6 ký tự"));
    }
    let result = sqlx::query(
        "UPDATE nguoidung SET matkhau=$3 WHERE TRIM(mand)=TRIM($1) AND matkhau=$2",
    )
    .bind(&current.mand)
    .bind(&input.matkhau_hientai)
    .bind(&input.matkhau_moi)
    .execute(&state.pool)
    .await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::bad_request("Mật khẩu hiện tại không đúng"));
    }
    Ok(Json(serde_json::json!({ "message": "Đổi mật khẩu thành công" })))
}

async fn logout(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> ApiResult<Json<serde_json::Value>> {
    if let Some(token) = bearer_token(&headers) {
        state.sessions.write().await.remove(token);
    }
    Ok(Json(serde_json::json!({ "message": "Đã đăng xuất" })))
}

pub async fn require_admin(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> ApiResult<Response> {
    if request.uri().path().ends_with("/auth/login") {
        return Ok(next.run(request).await);
    }

    let token = bearer_token(request.headers())
        .ok_or_else(|| ApiError::unauthorized("Vui lòng đăng nhập bằng tài khoản admin"))?;
    if !state.sessions.read().await.contains_key(token) {
        return Err(ApiError::unauthorized("Phiên đăng nhập đã hết hạn"));
    }
    Ok(next.run(request).await)
}
