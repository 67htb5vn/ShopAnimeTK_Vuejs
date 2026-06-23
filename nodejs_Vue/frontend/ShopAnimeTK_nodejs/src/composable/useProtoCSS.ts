import { onMounted, onUnmounted } from 'vue'

export function usePortoStyles(hrefs: string[]) {
  
  const load = (href: string) => new Promise<void>((res) => {
    // Nếu CSS đã tồn tại thì không nạp lại
    if (document.querySelector(`link[href="${href}"]`)) return res()
    
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.classList.add('porto-style')
    
    link.onload = () => res()
    link.onerror = () => res() // Tránh treo nếu file CSS lỗi
    
    document.head.appendChild(link)
  })

  onMounted(async () => {
    // Nạp đồng thời tất cả CSS để tăng tốc độ hiển thị (không dùng await trong vòng lặp)
    await Promise.all(hrefs.map(href => load(href)))
    console.log('🎨 Porto CSS Applied!')
  })

  onUnmounted(() => {
    // Dọn dẹp các link CSS đã nạp khi rời khỏi trang
    document.querySelectorAll('.porto-style').forEach(el => el.remove())
    console.log('🧹 Porto CSS Cleaned!')
  })
}