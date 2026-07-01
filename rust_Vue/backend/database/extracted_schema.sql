-- Schema trích từ ShopAnimeTK.sql custom dump. File này chỉ dùng khi bạn muốn tạo bảng rỗng nhanh.
-- Nếu muốn có dữ liệu mẫu, dùng pg_restore với backend/database/ShopAnimeTK.dump.

DROP TABLE IF EXISTS public.chitiettag CASCADE;
CREATE TABLE public.chitiettag (
    masp character varying(10),
    matag character varying(10)
);

DROP TABLE IF EXISTS public.cthoadon CASCADE;
CREATE TABLE public.cthoadon (
    masp character varying(10),
    mahd character varying(10),
    gia double precision,
    soluong integer
);

DROP TABLE IF EXISTS public.cttrangthai CASCADE;
CREATE TABLE public.cttrangthai (
    mahd character varying(10),
    matt character varying(10),
    ngaycapnhat timestamp without time zone
);

DROP TABLE IF EXISTS public.danhgia CASCADE;
CREATE TABLE public.danhgia (
    madg character varying(10),
    noidung character varying(500),
    sao double precision,
    thoigian date,
    mand character varying(10),
    masp character varying(10)
);

DROP TABLE IF EXISTS public.danhmuchang CASCADE;
CREATE TABLE public.danhmuchang (
    madmh character varying(10),
    tendmh character varying(50)
);

DROP TABLE IF EXISTS public.hinhanhnd CASCADE;
CREATE TABLE public.hinhanhnd (
    maha character varying(10),
    duongdan character varying(50),
    mand character varying(10)
);

DROP TABLE IF EXISTS public.hinhanhsp CASCADE;
CREATE TABLE public.hinhanhsp (
    maha character varying(10),
    duongdan character varying(250),
    masp character varying(10),
    anhdaidien integer
);

DROP TABLE IF EXISTS public.hoadon CASCADE;
CREATE TABLE public.hoadon (
    mahd character varying(10),
    ngaylap date,
    diachi character varying(300),
    thanhtien double precision,
    htthanhtoan character varying(100),
    mand character varying(10),
    makm character varying(10)
);

DROP TABLE IF EXISTS public.hoathinh CASCADE;
CREATE TABLE public.hoathinh (
    mahh character varying(10),
    tenhh character varying(50),
    mota character varying(250)
);

DROP TABLE IF EXISTS public.khuyenmai CASCADE;
CREATE TABLE public.khuyenmai (
    makm character varying(10),
    tenkm character varying(50),
    ngaybd date,
    ngaykt date,
    mucgiam double precision,
    dieukien character varying(50),
    giatri double precision
);

DROP TABLE IF EXISTS public.nguoidung CASCADE;
CREATE TABLE public.nguoidung (
    mand character varying(10),
    ten character varying(50),
    ngaysinh date,
    taikhoan character varying(50),
    matkhau character varying(50),
    trangthai bit(1),
    phanquyen bit(1),
    email character varying(50),
    maxacnhan character varying(10),
    thoigian timestamp without time zone
);

DROP TABLE IF EXISTS public.sanpham CASCADE;
CREATE TABLE public.sanpham (
    masp character varying(10),
    tensp character varying(250),
    gia double precision,
    ghichu character varying(500),
    madmh character varying(10),
    mahh character varying(10),
    thongtin character varying(500),
    soluong integer
);

DROP TABLE IF EXISTS public.tag CASCADE;
CREATE TABLE public.tag (
    matag character varying(10),
    tentag character varying(50)
);

DROP TABLE IF EXISTS public.trangthai CASCADE;
CREATE TABLE public.trangthai (
    matt character varying(10),
    tentrangthai character varying(50)
);

DROP TABLE IF EXISTS public.user_sessions CASCADE;
CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON public.user_sessions USING btree (expire);