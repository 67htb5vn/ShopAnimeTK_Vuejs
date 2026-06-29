const express = require("express");
const session = require('express-session')
const bodyParser = require("body-parser");
const cors = require("cors"); // Nên cài thêm: npm install cors
const bcrypt = require('bcrypt')
const pgSession = require('connect-pg-simple')(session)
const { pool } = require("./pool");
const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

const { 
    getAllDanhmuchang, getAllHoathinh, getSanphamNoibat,  getAllSanphamDmh, getAllSanphamHh, getAllSanphamSearchHh,
    getAllSanphamChitiet, getDangnhap, getAllKhuyenmai,
    insertStudents, 
    getStudentsByID, 
    getPagination, 
    updateStudents, 
    deleteStudents 
} = require("./service");

const app = express();
const PORT = 3000;

// 1. Cấu hình Middleware
// app.use(cors()); // Cho phép các nguồn khác gọi API nếu cần
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'user_sessions'
    }),

    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,

    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}))
app.use('/img', express.static('public/img'))

// 2. Các Route API (Giữ nguyên logic nhưng dọn dẹp gọn gàng)
app.get('/api/loadDmh', async (req, res) => {
    try {
        const dataPage = await getAllDanhmuchang();
        res.json(dataPage);
    } catch (error) {
        res.status(500).send({ error: "Lỗi khi lấy danh sách" });
    }
});

app.get('/api/loadHh', async (req, res) => {
    try {
        const dataPage = await getAllHoathinh();
        res.json(dataPage);
    } catch (error) {
        res.status(500).send({ error: "Lỗi khi lấy danh sách" });
    }
});

app.get('/api/loadSanphamNoibat', async (req, res) => {
    try {
        const dataPage = await getSanphamNoibat();
        res.json(dataPage);
    } catch (error) {
        res.status(500).send({ error: "Lỗi khi lấy danh sách" });
    }
});

app.get('/api/loadSanphamDmh', async (req, res) => {
    try {
        const { MaDmh, orderby, minPrice, maxPrice, page } = req.query;
        
        const dataPage = await getAllSanphamDmh({
            madmh: MaDmh,
            orderby: orderby || 'menu_order',
            minPrice: parseFloat(minPrice) || 0,
            maxPrice: parseFloat(maxPrice) || 999999999,
            page: parseInt(page) || 1
        });
        
        res.json(dataPage);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
});

app.get('/api/loadSanphamHh', async (req, res) => {
    try {
        const { MaHh, orderby, minPrice, maxPrice, page } = req.query;
        
        const dataPage = await getAllSanphamHh({
            mahh: MaHh,
            orderby: orderby || 'menu_order',
            minPrice: parseFloat(minPrice) || 0,
            maxPrice: parseFloat(maxPrice) || 999999999,
            page: parseInt(page) || 1
        });
        
        res.json(dataPage);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
});

app.get('/api/loadSanphamSearchHh', async (req, res) => {
    try {
        let { search, MaHh, orderby, minPrice, maxPrice, page } = req.query;

        search = search?.trim() || null;
        MaHh = MaHh?.trim() || null;

        if (!MaHh) MaHh = null;

        const dataPage = await getAllSanphamSearchHh({
            search: search,
            mahh: MaHh,
            orderby: orderby || 'menu_order',
            minPrice: parseFloat(minPrice) || 0,
            maxPrice: parseFloat(maxPrice) || 999999999,
            page: parseInt(page) || 1
        });
        
        res.json(dataPage);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
});

app.get('/api/loadSanphamChitiet', async (req, res) => {
    try {
        const { MaSp } = req.query;
        const dataPage = await getAllSanphamChitiet({
            masp: MaSp
        });
        
        res.json(dataPage);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
});

// lấy giỏ hàng
app.get('/api/loadGiohang', (req, res) => {
    if (!req.session.giohang) {
        req.session.giohang = []
    }

    res.json(req.session.giohang)
});

// Lấy các khuyến mãi đang trong thời gian áp dụng.
app.get('/api/loadKhuyenmai', async (req, res) => {
    try {
        const khuyenmais = await getAllKhuyenmai();

        res.json(khuyenmais)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Không thể tải danh sách khuyến mãi' })
    }
});

app.get('/api/loadKhuyenmaithoaman', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT makm, tenkm, ngaybd, ngaykt, mucgiam, dieukien, giatri
            FROM public.khuyenmai
            WHERE ngaybd <= CURRENT_DATE
              AND ngaykt >= CURRENT_DATE
            ORDER BY mucgiam DESC
        `)

        res.json(result.rows)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Không thể tải danh sách khuyến mãi' })
    }
});



app.post('/api/addGiohang', async (req, res) => {
    try {
        const {MaSp, Quanity} = req.body
        const result = await getAllSanphamChitiet({
            masp: MaSp
        });
        const sp = result.items[0]

        if (!sp) {
            return res.status(404).json({
                error: 'Không tìm thấy sản phẩm'
            })
        }
        if (!req.session.giohang) {
            req.session.giohang = []
        }

        // Tìm sản phẩm đã tồn tại trong giỏ chưa
        const index = req.session.giohang.findIndex(
            (item) => item.masp.trim() === MaSp.trim()
        )

        if (index !== -1) {
            // Đã có -> cộng thêm số lượng
            req.session.giohang[index].soluong += Number(Quanity)

            req.session.giohang[index].thanhtien =
                req.session.giohang[index].soluong *
                req.session.giohang[index].gia
        } else {
        const sanphamMoi = {
                masp: sp.masp,
                tensp: sp.tensp,
                gia: sp.gia,
                ghichu: sp.ghichu,
                soluong: Number(Quanity),
                thanhtien: sp.gia * Number(Quanity),
                chon: true,
                mahh: sp.mahh,
                madmh: sp.madmh,
                duongdan: sp.hinhanhsps[0].duongdan
            }

            req.session.giohang.push(sanphamMoi)
        }

        req.session.save(err => {

            if (err) {
                return res.status(500).json({
                    error: 'Không lưu được session'
                })
            }

            res.json({
                success: true,
                giohang: req.session.giohang
            })
        })
        }catch (error) {
        console.error(error);
        res.status(500).send({ error: "Lỗi khi thêm sản phẩm" });
    }
});

const uploadPath = path.join(__dirname, '..', 'frontend', 'ShopAnimeTK_nodejs', 'public', 'img', 'nd')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {

        const mand = req.session.user.mand.trim()
        const ext = path.extname(file.originalname)

        cb(null, `img_${mand}${ext}`)
    }
})
const upload = multer({ storage })

// cập nhật số lượng
app.put('/api/updateSoluong', (req, res) => {

    const { masp, soluong } = req.body

    const sp =
        req.session.giohang.find(
            x => x.masp.trim() === masp.trim()
        )

    if (sp) {

        sp.soluong = soluong
        sp.thanhtien = sp.gia * soluong
    }

    res.json(req.session.giohang)
})

// xóa sản phẩm khỏi giỏ
app.delete('/api/deleteGiohang', (req, res) => {

    const { masp } = req.body

    if (!req.session.giohang) {
        req.session.giohang = []
    }
    console.log(req.session.giohang)
    req.session.giohang =
        req.session.giohang.filter(
            x => x.masp.trim() !== masp.trim()
        )

    res.json(req.session.giohang)
})

app.post( '/api/upload-avatar', upload.single('avatar'), async (req, res) => {
        try {

            if (!req.session.user) {
                return res.status(401).json({
                    message: 'Chưa đăng nhập'
                })
            }
            const mand = req.session.user.mand.trim()
            const filename = req.file.filename

            const check = await pool.query(
                `SELECT *
                FROM hinhanhnd
                WHERE mand = $1
                `, [mand]
            )

            if (check.rows.length === 0) {
                const countResult = await pool.query( 'SELECT COUNT(*) FROM hinhanhnd')
                const count = parseInt(countResult.rows[0].count) + 1
                const maha =`HAND${String(count).padStart(3, '0')}`

                await pool.query(
                    `INSERT INTO hinhanhnd(maha, mand, duongdan)
                    VALUES($1, $2, $3)
                    `, [maha, mand, filename]
                )
            } else {
                await pool.query(
                    `UPDATE hinhanhnd
                    SET duongdan = $1
                    WHERE mand = $2
                    `,[ filename, mand]
                )
            }

            res.json({
                success: true,
                filename
            })

        } catch (err) {

            console.log(err)

            res.status(500).json({
                success: false
            })
        }
    }
)

app.put('/api/editTaikhoan', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                message: 'Chưa đăng nhập'
            })
        }
        const mand = req.session.user.mand.trim()
        const {ten, ngaysinh, email, matkhaumoi } = req.body

        if (matkhaumoi) {

            await pool.query(
                `
                UPDATE nguoidung
                SET
                    ten = $1,
                    ngaysinh = $2,
                    email = $3,
                    matkhau = $4
                WHERE mand = $5
                `,
                [
                    ten,
                    ngaysinh,
                    email,
                    matkhaumoi,
                    mand
                ]
            )

        } else {

            await pool.query(
                `
                UPDATE nguoidung
                SET
                    ten = $1,
                    ngaysinh = $2,
                    email = $3
                WHERE mand = $4
                `,
                [
                    ten,
                    ngaysinh,
                    email,
                    mand
                ]
            )
        }
                // UPDATE SESSION
        req.session.user.ten = ten
        req.session.user.email = email
        req.session.user.ngaysinh = ngaysinh
        res.json({
            message: 'Cập nhật thành công'
        })

    } catch (err) {

        console.log(err)

        res.status(500).json({
            message: 'Lỗi server'
        })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const {taikhoan, matkhau, rememberMe} = req.body
        const result = await getDangnhap({
            taikhoan: taikhoan
        });

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Tài khoản không tồn tại'
            })
        }

        const user = result.rows[0]
        const check = matkhau === user.matkhau
        if (!check) {
            return res.status(401).json({
                message: 'Sai mật khẩu'
            })
        }

        req.session.user = {
            mand: user.mand,
            ten: user.ten,
            taikhoan: user.taikhoan,
            phanquyen: user.phanquyen
        }

        if (rememberMe) {
            req.session.cookie.maxAge =
                1000 * 60 * 60 * 24 * 30
        } else {
            req.session.cookie.expires = false
        }

        return res.json({
            message: 'Đăng nhập thành công',
            user: req.session.user
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Lỗi server'
        })
    }
})

app.get('/api/checkauth', (req, res) => {
    if (req.session.user) {
        return res.json({
            loggedIn: true,
            user: req.session.user
        });
    }
    res.json({
        loggedIn: false
    });
});

app.get('/api/reviews/:masp', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT TRIM(dg.madg) AS madg, dg.noidung, dg.sao, dg.thoigian,
                   TRIM(dg.mand) AS mand, TRIM(dg.masp) AS masp,
                   COALESCE(nd.ten, 'Người dùng') AS tennguoidung,
                   (
                       SELECT ha.duongdan
                       FROM public.hinhanhnd ha
                       WHERE TRIM(ha.mand) = TRIM(dg.mand)
                       LIMIT 1
                   ) AS avatar
            FROM public.danhgia dg
            LEFT JOIN public.nguoidung nd ON TRIM(nd.mand) = TRIM(dg.mand)
            WHERE TRIM(dg.masp) = $1
            ORDER BY dg.thoigian DESC, dg.madg DESC
        `, [req.params.masp.trim()])

        const count = result.rows.length
        const average = count
            ? result.rows.reduce((sum, review) => sum + Number(review.sao || 0), 0) / count
            : 0

        res.json({ reviews: result.rows, count, average })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể tải đánh giá sản phẩm' })
    }
});

const requireUser = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' })
    }
    next()
}

app.get('/api/addresses', requireUser, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT madc, ten, sodienthoai, tinh_tp, diachinha
            FROM public.diachi
            WHERE mand = $1
            ORDER BY madc DESC
        `, [req.session.user.mand.trim()])

        res.json({ addresses: result.rows, selected: req.session.checkoutAddress || null })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể tải địa chỉ' })
    }
})

app.post('/api/addresses', requireUser, async (req, res) => {
    try {
        const { ten, sodienthoai, tinh_tp, diachinha } = req.body
        if (!ten || !/^0\d{9}$/.test(sodienthoai || '') || !tinh_tp || !diachinha) {
            return res.status(400).json({ message: 'Thông tin địa chỉ không hợp lệ' })
        }

        const result = await pool.query(`
            INSERT INTO public.diachi (mand, ten, sodienthoai, tinh_tp, diachinha)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING madc, ten, sodienthoai, tinh_tp, diachinha
        `, [req.session.user.mand.trim(), ten.trim(), sodienthoai, tinh_tp, diachinha.trim()])

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể lưu địa chỉ' })
    }
})

app.put('/api/addresses/:id', requireUser, async (req, res) => {
    try {
        const { ten, sodienthoai, tinh_tp, diachinha } = req.body
        if (!ten || !/^0\d{9}$/.test(sodienthoai || '') || !tinh_tp || !diachinha) {
            return res.status(400).json({ message: 'Thông tin địa chỉ không hợp lệ' })
        }

        const result = await pool.query(`
            UPDATE public.diachi
            SET ten = $1, sodienthoai = $2, tinh_tp = $3, diachinha = $4
            WHERE madc = $5 AND mand = $6
            RETURNING madc, ten, sodienthoai, tinh_tp, diachinha
        `, [ten.trim(), sodienthoai, tinh_tp, diachinha.trim(), req.params.id, req.session.user.mand.trim()])

        if (!result.rows[0]) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' })
        res.json(result.rows[0])
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể cập nhật địa chỉ' })
    }
})

app.delete('/api/addresses/:id', requireUser, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM public.diachi WHERE madc = $1 AND mand = $2',
            [req.params.id, req.session.user.mand.trim()]
        )
        res.json({ success: true })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể xóa địa chỉ' })
    }
})

app.post('/api/checkout-address', requireUser, (req, res) => {
    const { ten, sodienthoai, tinh_tp, diachinha } = req.body
    if (!ten || !/^0\d{9}$/.test(sodienthoai || '') || !tinh_tp || !diachinha) {
        return res.status(400).json({ message: 'Thông tin địa chỉ không hợp lệ' })
    }

    req.session.checkoutAddress = { ten, sodienthoai, tinh_tp, diachinha }
    req.session.save((error) => {
        if (error) return res.status(500).json({ message: 'Không thể lưu địa chỉ vào session' })
        res.json(req.session.checkoutAddress)
    })
})

const isHanoiAddress = (province = '') => province
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
    .toLowerCase() === 'ha noi'

app.post('/api/checkout-session', requireUser, async (req, res) => {
    try {
        const { address, paymentMethod, promotionCode, products } = req.body
        if (!address?.ten || !/^0\d{9}$/.test(address?.sodienthoai || '') || !address?.tinh_tp || !address?.diachinha) {
            return res.status(400).json({ message: 'Địa chỉ giao hàng không hợp lệ' })
        }

        const paymentLabels = {
            bank: 'Chuyển khoản ngân hàng',
            cod: 'Thanh toán khi nhận hàng'
        }
        if (!paymentLabels[paymentMethod]) {
            return res.status(400).json({ message: 'Hình thức thanh toán không hợp lệ' })
        }

        const selectedIds = new Set((products || []).map(item => String(item.masp || '').trim()))
        const cart = req.session.giohang || []
        const selectedProducts = cart
            .filter(item => selectedIds.has(String(item.masp || '').trim()))
            .map(item => ({ masp: String(item.masp || '').trim(), soluong: Number(item.soluong) }))
            .filter(item => item.masp && Number.isInteger(item.soluong) && item.soluong > 0)

        if (selectedProducts.length === 0) {
            return res.status(400).json({ message: 'Không có sản phẩm được chọn' })
        }

        const productResult = await pool.query(`
            SELECT TRIM(masp) AS masp, gia
            FROM public.sanpham
            WHERE TRIM(masp) = ANY($1::text[])
        `, [selectedProducts.map(item => item.masp)])
        const prices = new Map(productResult.rows.map(item => [item.masp, Number(item.gia)]))
        const subtotal = selectedProducts.reduce(
            (total, item) => total + Number(prices.get(item.masp) || 0) * item.soluong,
            0
        )

        let selectedPromotion = null
        if (promotionCode) {
            const promotionResult = await pool.query(`
                SELECT TRIM(makm) AS makm, tenkm, mucgiam, giatri
                FROM public.khuyenmai
                WHERE TRIM(makm) = $1
                LIMIT 1
            `, [String(promotionCode).trim()])
            const promotion = promotionResult.rows[0]
            if (!promotion || promotion.giatri == null || subtotal < Number(promotion.giatri)) {
                return res.status(400).json({ message: 'Khuyến mãi không còn hợp lệ với đơn hàng' })
            }
            selectedPromotion = promotion
        }

        req.session.hinhthucthanhtoan = paymentLabels[paymentMethod]
        req.session.diachiduocchon = {
            ten: address.ten.trim(),
            sodienthoai: address.sodienthoai,
            tinh_tp: address.tinh_tp,
            diachinha: address.diachinha.trim()
        }
        req.session.khuyenmaiduocchon = selectedPromotion
        req.session.sanphamduocchon = selectedProducts

        req.session.save((error) => {
            if (error) return res.status(500).json({ message: 'Không thể lưu phiên thanh toán' })
            res.json({ success: true })
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể chuẩn bị phiên thanh toán' })
    }
})

app.post('/api/orders', requireUser, async (req, res) => {
    const paymentMethod = req.session.hinhthucthanhtoan
    const address = req.session.diachiduocchon
    const promotion = req.session.khuyenmaiduocchon
    const selectedProducts = req.session.sanphamduocchon || []

    if (!paymentMethod || !address || selectedProducts.length === 0) {
        return res.status(400).json({ message: 'Phiên thanh toán không đầy đủ hoặc đã hết hạn' })
    }

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        await client.query("SELECT pg_advisory_xact_lock(hashtext('shopanime_hoadon_mahd'))")

        const idResult = await client.query(`
            SELECT COALESCE(MAX(NULLIF(regexp_replace(TRIM(mahd), '\\D', '', 'g'), '')::integer), 0) + 1 AS next_id
            FROM public.hoadon
        `)
        const mahd = `HD${String(idResult.rows[0].next_id).padStart(3, '0')}`

        const productResult = await client.query(`
            SELECT TRIM(masp) AS masp, tensp, gia
            FROM public.sanpham
            WHERE TRIM(masp) = ANY($1::text[])
            FOR UPDATE
        `, [selectedProducts.map(item => item.masp)])
        const productMap = new Map(productResult.rows.map(item => [item.masp, item]))

        if (productMap.size !== selectedProducts.length) {
            throw new Error('Một hoặc nhiều sản phẩm không còn tồn tại')
        }

        const details = selectedProducts.map(item => {
            const product = productMap.get(item.masp)
            return {
                masp: item.masp,
                tensp: product.tensp,
                gia: Number(product.gia),
                soluong: Number(item.soluong)
            }
        })
        const subtotal = details.reduce((total, item) => total + item.gia * item.soluong, 0)

        let validPromotion = null
        if (promotion?.makm) {
            const promotionResult = await client.query(`
                SELECT TRIM(makm) AS makm, tenkm, mucgiam, giatri
                FROM public.khuyenmai
                WHERE TRIM(makm) = $1
                LIMIT 1
            `, [promotion.makm.trim()])
            const currentPromotion = promotionResult.rows[0]
            if (currentPromotion && currentPromotion.giatri != null && subtotal >= Number(currentPromotion.giatri)) {
                validPromotion = currentPromotion
            }
        }

        const discount = Math.round(subtotal * Number(validPromotion?.mucgiam || 0))
        const shippingFee = isHanoiAddress(address.tinh_tp) ? 0 : 25_000
        const total = Math.max(0, subtotal - discount + shippingFee)
        const fullAddress = [address.ten, address.sodienthoai, address.tinh_tp, address.diachinha].join('_')

        await client.query(`
            INSERT INTO public.hoadon (mahd, ngaylap, diachi, thanhtien, htthanhtoan, mand, makm)
            VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
        `, [mahd, fullAddress, total, paymentMethod, req.session.user.mand.trim(), validPromotion?.makm || null])

        for (const detail of details) {
            await client.query(`
                INSERT INTO public.cthoadon (masp, mahd, gia, soluong)
                VALUES ($1, $2, $3, $4)
            `, [detail.masp, mahd, detail.gia, detail.soluong])
        }

        await client.query(`
            INSERT INTO public.cttrangthai (mahd, matt, ngaycapnhat)
            VALUES ($1, 'TT001', CURRENT_TIMESTAMP)
        `, [mahd])

        await client.query('COMMIT')

        const purchasedIds = new Set(details.map(item => item.masp))
        req.session.giohang = (req.session.giohang || []).filter(
            item => !purchasedIds.has(String(item.masp || '').trim())
        )
        req.session.lastOrderId = mahd
        delete req.session.hinhthucthanhtoan
        delete req.session.diachiduocchon
        delete req.session.khuyenmaiduocchon
        delete req.session.sanphamduocchon
        delete req.session.checkoutAddress

        req.session.save((error) => {
            if (error) console.error('Không thể dọn session sau đặt hàng:', error)
        })

        res.status(201).json({ mahd })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error(error)
        res.status(500).json({ message: error.message || 'Không thể tạo đơn hàng' })
    } finally {
        client.release()
    }
})

app.get('/api/orders', requireUser, async (req, res) => {
    try {
        const allowedStatuses = new Set(['TT001', 'TT002', 'TT003', 'TT004', 'TT005'])
        const statuses = String(req.query.statuses || 'TT001')
            .split(',')
            .map(status => status.trim().toUpperCase())
            .filter(status => allowedStatuses.has(status))
        const pageSize = Math.min(20, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 4))
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
        const offset = (page - 1) * pageSize

        if (statuses.length === 0) {
            return res.status(400).json({ message: 'Trạng thái hóa đơn không hợp lệ' })
        }

        const result = await pool.query(`
            WITH order_data AS (
                SELECT TRIM(hd.mahd) AS mahd, hd.ngaylap, hd.thanhtien, hd.htthanhtoan,
                       latest.matt, latest.tentrangthai, latest.ngaycapnhat,
                       COALESCE(products.items, '[]'::json) AS products
                FROM public.hoadon hd
                JOIN LATERAL (
                    SELECT TRIM(ct.matt) AS matt, tt.tentrangthai, ct.ngaycapnhat
                    FROM public.cttrangthai ct
                    LEFT JOIN public.trangthai tt ON TRIM(tt.matt) = TRIM(ct.matt)
                    WHERE TRIM(ct.mahd) = TRIM(hd.mahd)
                    ORDER BY ct.ngaycapnhat DESC NULLS LAST
                    LIMIT 1
                ) latest ON TRUE
                LEFT JOIN LATERAL (
                    SELECT json_agg(json_build_object(
                        'masp', p.masp,
                        'tensp', p.tensp,
                        'soluong', p.soluong,
                        'hinhanh', p.hinhanh
                    )) AS items
                    FROM (
                        SELECT TRIM(ct.masp) AS masp, sp.tensp, ct.soluong,
                               (
                                   SELECT ha.duongdan
                                   FROM public.hinhanhsp ha
                                   WHERE TRIM(ha.masp) = TRIM(ct.masp)
                                   ORDER BY CASE WHEN ha.anhdaidien = 1 THEN 0 ELSE 1 END, ha.maha
                                   LIMIT 1
                               ) AS hinhanh
                        FROM public.cthoadon ct
                        LEFT JOIN public.sanpham sp ON TRIM(sp.masp) = TRIM(ct.masp)
                        WHERE TRIM(ct.mahd) = TRIM(hd.mahd)
                        ORDER BY TRIM(ct.masp)
                        LIMIT 2
                    ) p
                ) products ON TRUE
                WHERE TRIM(hd.mand) = $1
                  AND latest.matt = ANY($2::text[])
            )
            SELECT *, COUNT(*) OVER()::integer AS total_count
            FROM order_data
            ORDER BY COALESCE(ngaycapnhat, ngaylap::timestamp) DESC, mahd DESC
            LIMIT $3 OFFSET $4
        `, [req.session.user.mand.trim(), statuses, pageSize, offset])

        const totalItems = result.rows[0]?.total_count || 0
        const items = result.rows.map(({ total_count, ...order }) => order)
        res.json({
            items,
            page,
            pageSize,
            totalItems,
            totalPages: Math.max(1, Math.ceil(totalItems / pageSize))
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể tải lịch sử đơn hàng' })
    }
})

app.patch('/api/orders/:mahd/cancel', requireUser, async (req, res) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const orderResult = await client.query(`
            SELECT TRIM(hd.mahd) AS mahd,
                   (
                       SELECT TRIM(ct.matt)
                       FROM public.cttrangthai ct
                       WHERE TRIM(ct.mahd) = TRIM(hd.mahd)
                       ORDER BY ct.ngaycapnhat DESC NULLS LAST
                       LIMIT 1
                   ) AS matt
            FROM public.hoadon hd
            WHERE TRIM(hd.mahd) = $1 AND TRIM(hd.mand) = $2
            FOR UPDATE
        `, [req.params.mahd.trim(), req.session.user.mand.trim()])
        const order = orderResult.rows[0]

        if (!order) {
            await client.query('ROLLBACK')
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
        }
        if (order.matt !== 'TT001') {
            await client.query('ROLLBACK')
            return res.status(409).json({ message: 'Đơn hàng này không còn có thể hủy' })
        }

        await client.query(`
            INSERT INTO public.cttrangthai (mahd, matt, ngaycapnhat)
            VALUES ($1, 'TT005', CURRENT_TIMESTAMP)
        `, [order.mahd])
        await client.query('COMMIT')
        res.json({ success: true, message: 'Đã hủy đơn hàng' })
    } catch (error) {
        await client.query('ROLLBACK')
        console.error(error)
        res.status(500).json({ message: 'Không thể hủy đơn hàng' })
    } finally {
        client.release()
    }
})

app.get('/api/orders/:mahd', requireUser, async (req, res) => {
    try {
        const orderResult = await pool.query(`
            SELECT TRIM(mahd) AS mahd, ngaylap, diachi, thanhtien, htthanhtoan,
                   TRIM(mand) AS mand, NULLIF(TRIM(makm), '') AS makm
            FROM public.hoadon
            WHERE TRIM(mahd) = $1 AND TRIM(mand) = $2
            LIMIT 1
        `, [req.params.mahd.trim(), req.session.user.mand.trim()])
        const order = orderResult.rows[0]
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

        const detailResult = await pool.query(`
            SELECT TRIM(ct.masp) AS masp, sp.tensp, ct.gia, ct.soluong
            FROM public.cthoadon ct
            LEFT JOIN public.sanpham sp ON TRIM(sp.masp) = TRIM(ct.masp)
            WHERE TRIM(ct.mahd) = $1
        `, [order.mahd])

        let promotion = null
        if (order.makm) {
            const promotionResult = await pool.query(`
                SELECT TRIM(makm) AS makm, tenkm, mucgiam
                FROM public.khuyenmai WHERE TRIM(makm) = $1 LIMIT 1
            `, [order.makm])
            promotion = promotionResult.rows[0] || null
        }

        const subtotal = detailResult.rows.reduce(
            (sum, item) => sum + Number(item.gia) * Number(item.soluong), 0
        )
        const discount = Math.round(subtotal * Number(promotion?.mucgiam || 0))
        const addressParts = String(order.diachi || '').split('_')
        const shippingFee = isHanoiAddress(addressParts[2] || '') ? 0 : 25_000

        res.json({ ...order, details: detailResult.rows, promotion, subtotal, discount, shippingFee })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Không thể tải đơn hàng' })
    }
})

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({
            message: 'Đăng xuất thành công'
        })
    })
})


app.listen(PORT, async () => {
    try {
        console.log('Database connected')
        console.log(` Backend Server đang chạy tại: http://localhost:${PORT}`);
    } catch (error) {
        console.log(error)
    }
})
