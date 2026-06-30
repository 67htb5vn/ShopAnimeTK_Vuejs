export interface DetailProduct {
    masp: string
    tensp: string
    gia: number
    madmh: string
    mahh: string
    tendmh?: string
    diemtrungbinh: number
    sodanhgia: number
    daban: number
    hinhanhsps?: Array<{
        maha?: string
        duongdan?: string
        anhdaidien?: number
    }>
}
