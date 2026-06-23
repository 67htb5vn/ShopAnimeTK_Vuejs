// src/composables/usePortoScripts.ts
import { onMounted, onUnmounted } from 'vue'

export function usePortoScripts(scripts: string[]) {

  const load = (src: string) => new Promise<void>((res) => {
    if (document.querySelector(`script[src="${src}"]`)) return res()
    const s = document.createElement('script')
    s.src = src; s.async = false; s.classList.add('porto-script')
    s.onload = () => res(); document.body.appendChild(s)
  })

  onMounted(async () => {
    for (const src of scripts) await load(src)
    console.log('🎉 Porto JS Loaded!')
  })

  onUnmounted(() => {
    document.querySelectorAll('.porto-script').forEach(s => s.remove())
    console.log('🧹 Porto JS Cleaned!')
  })
}