import { defineStore } from 'pinia'
import { ref, computed } from 'vue';
import axios from 'axios';
import type { sanphamgiohang } from '@/models/sanphamgiohang';
export const useGiohangStore = defineStore('giohang', () => {

    const giohangs = ref<sanphamgiohang[]>([])

    const loadGiohang = async () => {
        const res = await axios.get('/api/loadGiohang', {
            withCredentials: true
        })
        giohangs.value = res.data.giohang || res.data
    }

    const addLocal = (sp: sanphamgiohang) => {
        const index = giohangs.value.findIndex(x => x.masp === sp.masp)
        
        if (index !== -1) {
          const item = giohangs.value[index]
          if (!item) return

          item.soluong = Number(item.soluong ?? 0) + Number(sp.soluong ?? 1)
          item.thanhtien = Number(item.gia ?? 0) * Number(item.soluong ?? 0)
        
        } else {
            giohangs.value.push(sp)
        }
    }

    const tongSoLuong = computed(() => new Set(
        giohangs.value
            .map(item => String(item.masp || '').trim())
            .filter(Boolean)
    ).size)

    const xoaGiohang = async (masp: string) => {
          const res = await axios.delete('/api/deleteGiohang', {
             data: {masp},
              withCredentials: true
          })
          giohangs.value = res.data.giohang || res.data
    }

    const updateSoluong = async (masp: string, soluong: number) => {
        const res = await axios.put('/api/updateSoluong', {
            masp,
            soluong
        }, {
            withCredentials: true
        })

        giohangs.value = res.data.giohang || res.data
    }

    // số lượng còn lại trong kho
    const getConlai = (
        soluongKho: number,
        masp: string
    ) => {

        const item =
            giohangs.value.find(
                x => x.masp === masp
            )

        const soluongTrongGio =
            Number(item?.soluong ?? 0)

        return soluongKho - soluongTrongGio
    }

    return {
        giohangs,
        loadGiohang,
        addLocal,
        tongSoLuong,
        xoaGiohang,
        updateSoluong,
        getConlai
    }
})
