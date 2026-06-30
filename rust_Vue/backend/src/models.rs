use chrono::{NaiveDate, NaiveDateTime};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize)]
pub struct ErrorBody {
    pub message: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AdminSession {
    pub mand: String,
    pub ten: Option<String>,
    pub taikhoan: String,
    pub email: Option<String>,
}

#[derive(Deserialize)]
pub struct LoginInput {
    pub taikhoan: String,
    pub matkhau: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: AdminSession,
}

#[derive(Serialize)]
pub struct PageResponse<T> {
    pub items: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub page_size: i64,
    pub total_pages: i64,
}

impl<T> PageResponse<T> {
    pub fn new(items: Vec<T>, total: i64, page: i64, page_size: i64) -> Self {
        Self {
            items,
            total,
            page,
            page_size,
            total_pages: (total + page_size - 1) / page_size,
        }
    }
}

#[derive(Deserialize)]
pub struct UpdateProfileInput {
    pub ten: String,
    pub email: Option<String>,
}

#[derive(Deserialize)]
pub struct ChangePasswordInput {
    pub matkhau_hientai: String,
    pub matkhau_moi: String,
}

#[derive(Deserialize)]
pub struct ForgotPasswordInput {
    pub email: String,
}

#[derive(Serialize, FromRow)]
pub struct DashboardStats {
    pub total_products: i64,
    pub total_users: i64,
    pub total_orders: i64,
    pub total_revenue: f64,
}

#[derive(Serialize, FromRow)]
pub struct DashboardSlice {
    pub label: String,
    pub value: i64,
}

#[derive(Serialize, FromRow)]
pub struct DashboardRevenuePoint {
    pub label: String,
    pub total: f64,
}

#[derive(Serialize)]
pub struct DashboardVisuals {
    pub revenue: Vec<DashboardRevenuePoint>,
    pub order_statuses: Vec<DashboardSlice>,
    pub payment_methods: Vec<DashboardSlice>,
    pub stock_summary: Vec<DashboardSlice>,
    pub recent_orders: Vec<OrderRow>,
}

#[derive(Serialize, FromRow)]
pub struct Product {
    pub masp: String,
    pub tensp: Option<String>,
    pub gia: Option<f64>,
    pub ghichu: Option<String>,
    pub madmh: Option<String>,
    pub mahh: Option<String>,
    pub thongtin: Option<String>,
    pub soluong: Option<i32>,
    pub tendmh: Option<String>,
    pub tenhh: Option<String>,
    pub anhdaidien: Option<String>,
}

#[derive(Deserialize)]
pub struct ProductInput {
    pub masp: Option<String>,
    pub tensp: String,
    pub gia: f64,
    pub ghichu: Option<String>,
    pub madmh: Option<String>,
    pub mahh: Option<String>,
    pub thongtin: Option<String>,
    pub soluong: i32,
}

#[derive(Serialize, FromRow)]
pub struct ProductImage {
    pub maha: String,
    pub duongdan: Option<String>,
    pub masp: Option<String>,
    pub anhdaidien: Option<i32>,
}

#[derive(Serialize, FromRow)]
pub struct Category {
    pub madmh: String,
    pub tendmh: Option<String>,
}

#[derive(Deserialize)]
pub struct CategoryInput {
    pub madmh: Option<String>,
    pub tendmh: String,
}

#[derive(Serialize, FromRow)]
pub struct Anime {
    pub mahh: String,
    pub tenhh: Option<String>,
    pub mota: Option<String>,
}

#[derive(Deserialize)]
pub struct AnimeInput {
    pub mahh: Option<String>,
    pub tenhh: String,
    pub mota: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Tag {
    pub matag: String,
    pub tentag: Option<String>,
}

#[derive(Deserialize)]
pub struct TagInput {
    pub matag: Option<String>,
    pub tentag: String,
}

#[derive(Serialize, FromRow)]
pub struct Promotion {
    pub makm: String,
    pub tenkm: Option<String>,
    pub ngaybd: Option<NaiveDate>,
    pub ngaykt: Option<NaiveDate>,
    pub mucgiam: Option<f64>,
    pub dieukien: Option<String>,
    pub giatri: Option<f64>,
}

#[derive(Deserialize)]
pub struct PromotionInput {
    pub makm: Option<String>,
    pub tenkm: String,
    pub ngaybd: Option<NaiveDate>,
    pub ngaykt: Option<NaiveDate>,
    pub mucgiam: Option<f64>,
    pub dieukien: Option<String>,
    pub giatri: Option<f64>,
}

#[derive(Serialize, FromRow)]
pub struct UserRow {
    pub mand: String,
    pub ten: Option<String>,
    pub ngaysinh: Option<NaiveDate>,
    pub taikhoan: Option<String>,
    pub trangthai: Option<String>,
    pub phanquyen: Option<String>,
    pub email: Option<String>,
    pub thoigian: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct UserInput {
    pub mand: Option<String>,
    pub ten: String,
    pub ngaysinh: Option<NaiveDate>,
    pub taikhoan: String,
    pub matkhau: Option<String>,
    pub trangthai: Option<String>,
    pub phanquyen: Option<String>,
    pub email: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct OrderRow {
    pub mahd: String,
    pub ngaylap: Option<NaiveDate>,
    pub diachi: Option<String>,
    pub thanhtien: Option<f64>,
    pub htthanhtoan: Option<String>,
    pub mand: Option<String>,
    pub tenkh: Option<String>,
    pub makm: Option<String>,
    pub trangthai: Option<String>,
    pub matt: Option<String>,
    pub ngaycapnhat: Option<NaiveDateTime>,
}

#[derive(Serialize, FromRow)]
pub struct OrderItem {
    pub masp: Option<String>,
    pub tensp: Option<String>,
    pub gia: Option<f64>,
    pub soluong: Option<i32>,
}

#[derive(Serialize)]
pub struct OrderDetail {
    pub order: OrderRow,
    pub items: Vec<OrderItem>,
    pub status_history: Vec<OrderStatusHistory>,
}

#[derive(Serialize, FromRow)]
pub struct OrderStatusHistory {
    pub matt: Option<String>,
    pub tentrangthai: Option<String>,
    pub ngaycapnhat: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct UpdateOrderStatus {
    pub matt: String,
}

#[derive(Serialize, FromRow)]
pub struct StatusRow {
    pub matt: String,
    pub tentrangthai: Option<String>,
}
