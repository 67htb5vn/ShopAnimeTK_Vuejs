export interface ProductImageSource {
    duongdan?: string
    anhdaidien?: number
}

export const productPlaceholderImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
        <rect width="100%" height="100%" fill="#f4f4f4"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              fill="#999" font-family="Arial" font-size="24">Chưa có ảnh</text>
    </svg>
`)}`

export const normalizeProductImagePath = (path?: string) => {
    const value = path?.trim().replace(/\\/g, '/').replace(/^~\//, '/')
    if (!value) return ''
    if (/^(https?:|data:|blob:)/i.test(value)) return value
    return value.startsWith('/') ? value : `/${value}`
}

export const getProductImagePaths = (product: { hinhanhsps?: ProductImageSource[] }) => {
    const images = (product.hinhanhsps || [])
        .map((image) => ({ ...image, path: normalizeProductImagePath(image.duongdan) }))
        .filter((image) => image.path)

    const main = images.find((image) => Number(image.anhdaidien) === 1)?.path
        || images[0]?.path
        || productPlaceholderImage
    const hover = images.find((image) => Number(image.anhdaidien) === 2)?.path
        || images.find((image) => image.path !== main)?.path
        || main

    return { main, hover, all: images.map((image) => image.path) }
}

export const handleProductImageError = (event: Event) => {
    const image = event.target as HTMLImageElement
    image.onerror = null
    image.src = productPlaceholderImage
}
