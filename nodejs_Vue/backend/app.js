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
