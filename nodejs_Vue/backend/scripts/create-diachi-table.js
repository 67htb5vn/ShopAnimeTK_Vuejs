const { pool } = require('../pool')

pool.query(`
    CREATE TABLE IF NOT EXISTS public.diachi (
        madc BIGSERIAL PRIMARY KEY,
        mand VARCHAR(10) NOT NULL,
        ten VARCHAR(100) NOT NULL,
        sodienthoai VARCHAR(15) NOT NULL,
        tinh_tp VARCHAR(100) NOT NULL,
        diachinha TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_diachi_mand ON public.diachi(mand)
`)
    .then(() => console.log('Bảng diachi đã sẵn sàng'))
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(() => pool.end())
