# Shop Anime Admin API - Rust/Axum/PostgreSQL

Backend này dùng Axum + SQLx + PostgreSQL cho trang admin của shop anime.

## 1. Khôi phục database

File `database/ShopAnimeTK.dump` là PostgreSQL custom dump. Khôi phục bằng `pg_restore`:

```bash
createdb ShopAnimeTK
pg_restore --clean --if-exists -d ShopAnimeTK database/ShopAnimeTK.dump
```

Nếu chỉ cần tạo bảng rỗng, có thể dùng file đã trích schema:

```bash
psql -d ShopAnimeTK -f database/extracted_schema.sql
```

## 2. Chạy backend

```bash
cp .env.example .env
# sửa DATABASE_URL trong .env cho đúng mật khẩu PostgreSQL của bạn
cargo run
```

API chạy mặc định tại: `http://127.0.0.1:8080/api`

## 3. Các nhóm API chính

- `GET /api/dashboard/stats`
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/animes`
- `GET/POST/PUT/DELETE /api/users`
- `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/status`
- `GET/POST/PUT/DELETE /api/promotions`
- `GET/POST/PUT/DELETE /api/tags`
- `GET /api/statuses`

## Ghi chú bảo mật

Bảng `nguoidung` hiện có cột `matkhau varchar(50)`. Bản demo này giữ đúng cấu trúc DB cũ, nhưng khi làm thật nên hash mật khẩu bằng Argon2/Bcrypt và thêm JWT/session cho admin.
