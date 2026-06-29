const { pool } = require('../pool')

const promotionMinimums = {
    KM001: 5_000_000,
    KM002: 700_000,
    KM003: 500_000,
    KM004: 300_000
}

const updatePromotionMinimums = async () => {
    const result = await pool.query(`
        UPDATE public.khuyenmai
        SET giatri = CASE TRIM(makm)
            WHEN 'KM001' THEN $1
            WHEN 'KM002' THEN $2
            WHEN 'KM003' THEN $3
            WHEN 'KM004' THEN $4
            ELSE giatri
        END
        WHERE TRIM(makm) IN ('KM001', 'KM002', 'KM003', 'KM004')
        RETURNING TRIM(makm) AS makm, dieukien, giatri
    `, Object.values(promotionMinimums))

    console.table(result.rows)
}

updatePromotionMinimums()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(() => pool.end())
