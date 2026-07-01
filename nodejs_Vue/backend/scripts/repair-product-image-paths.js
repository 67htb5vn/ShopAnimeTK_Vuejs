const fs = require('fs')
const path = require('path')
const { pool } = require('../pool')

const publicRoot = path.resolve(__dirname, '../../frontend/ShopAnimeTK_nodejs/public')
const productsRoot = path.join(publicRoot, 'img', 'products')
const shouldApply = process.argv.includes('--apply')

const listFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath]
})

const toPublicPath = (filePath) => `/${path.relative(publicRoot, filePath).replace(/\\/g, '/')}`
const toStableFileKey = (filePath) => path.basename(filePath).toLowerCase().replace(/_\d+(?=\.[^.]+$)/, '')

const repair = async () => {
    const filesByName = new Map()
    const filesByStableKey = new Map()
    for (const filePath of listFiles(productsRoot)) {
        const key = path.basename(filePath).toLowerCase()
        const matches = filesByName.get(key) || []
        matches.push(filePath)
        filesByName.set(key, matches)

        const stableKey = toStableFileKey(filePath)
        const stableMatches = filesByStableKey.get(stableKey) || []
        stableMatches.push(filePath)
        filesByStableKey.set(stableKey, stableMatches)
    }

    const result = await pool.query(`
        SELECT TRIM(maha) AS maha, TRIM(masp) AS masp, duongdan
        FROM public.hinhanhsp
    `)

    const recoverable = []
    const unresolved = []
    for (const image of result.rows) {
        const currentRelative = String(image.duongdan || '').replace(/^~?\/?/, '')
        if (currentRelative && fs.existsSync(path.join(publicRoot, currentRelative))) continue

        const exactMatches = filesByName.get(path.basename(currentRelative).toLowerCase()) || []
        const stableMatches = filesByStableKey.get(toStableFileKey(currentRelative)) || []
        const matches = exactMatches.length ? exactMatches : stableMatches
        if (matches.length === 1) {
            recoverable.push({ ...image, newPath: toPublicPath(matches[0]) })
        } else {
            unresolved.push(image)
        }
    }

    if (shouldApply) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            for (const image of recoverable) {
                await client.query(
                    'UPDATE public.hinhanhsp SET duongdan = $1 WHERE TRIM(maha) = $2',
                    [image.newPath, image.maha]
                )
            }
            await client.query('COMMIT')
        } catch (error) {
            await client.query('ROLLBACK')
            throw error
        } finally {
            client.release()
        }
    }

    console.log(`Có thể sửa: ${recoverable.length}`)
    console.log(`Không tìm thấy file tương ứng: ${unresolved.length}`)
    console.log(`Chế độ: ${shouldApply ? 'ĐÃ CẬP NHẬT DATABASE' : 'CHỈ KIỂM TRA'}`)
    if (unresolved.length) console.table(unresolved.slice(0, 20))
}

repair()
    .catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
    .finally(() => pool.end())
