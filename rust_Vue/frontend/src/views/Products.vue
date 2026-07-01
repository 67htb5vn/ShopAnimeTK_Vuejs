<template>
  <div v-if="error" class="alert error">{{ error }}</div>
  <section class="card product-list-card">
    <div class="list-header">
      <div>
        <strong>Danh sách sản phẩm</strong>
        <span>{{ total }} sản phẩm</span>
      </div>
      <button class="btn primary" @click="openCreate">+ Thêm sản phẩm</button>
    </div>

    <div class="control-panel product-control-panel">
      <input class="search" v-model="keyword" placeholder="Tìm theo tên hoặc mã sản phẩm..." @keyup.enter="applyFilters" />
      <select v-model="categoryFilter" @change="applyFilters">
        <option value="">Tất cả danh mục</option>
        <option v-for="c in categories" :key="c.madmh" :value="c.madmh.trim()">{{c.tendmh}}</option>
      </select>
      <select v-model="animeFilter" @change="applyFilters">
        <option value="">Tất cả anime</option>
        <option v-for="a in animes" :key="a.mahh" :value="a.mahh.trim()">{{a.tenhh}}</option>
      </select>
      <select v-model="stockFilter" @change="applyFilters">
        <option value="">Tất cả tồn kho</option>
        <option value="available">Còn hàng</option>
        <option value="low">Sắp hết</option>
        <option value="out">Hết hàng</option>
      </select>
      <select v-model="sort" @change="applyFilters">
        <option value="newest">Mới nhất</option>
        <option value="name">Tên A–Z</option>
        <option value="price_asc">Giá tăng</option>
        <option value="price_desc">Giá giảm</option>
        <option value="stock">Tồn kho thấp</option>
      </select>
      <button class="btn ghost" @click="resetAndLoad">Tải lại</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Mã</th><th>Tên sản phẩm</th><th>Giá</th><th>Tồn</th><th>Danh mục</th><th>Anime</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.masp" class="clickable-row" tabindex="0"
            @click="openEdit(p)" @keydown.enter.prevent="openEdit(p)" @keydown.space.prevent="openEdit(p)">
            <td>
              <img
                v-if="p.anhdaidien && !brokenImages.has(p.masp)"
                class="product-thumb"
                :src="productImage(p.anhdaidien)"
                :alt="p.tensp || 'Sản phẩm'"
                @error="brokenImages.add(p.masp)"
              />
              <div v-else class="product-thumb product-thumb-empty" aria-label="Chưa có ảnh">🖼️</div>
            </td>
            <td>{{ p.masp }}</td>
            <td><div class="product-name">{{ p.tensp }}</div></td>
            <td>{{ formatMoney(p.gia) }}</td>
            <td><span class="badge">{{ p.soluong ?? 0 }}</span></td>
            <td>{{ p.tendmh || p.madmh || '-' }}</td>
            <td>{{ p.tenhh || p.mahh || '-' }}</td>
            <td class="actions">
              <button class="btn ghost" @click.stop="openEdit(p)">Sửa</button>
              <button class="btn danger" @click.stop="remove(p)">Xóa</button>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td class="empty-cell" colspan="8">{{ emptyMessage }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="page" :page-size="pageSize" :total="total" :total-pages="totalPages" @update:page="changePage" @update:page-size="changePageSize" />
  </section>

  <div v-if="showForm" class="drawer" @click.self="closeForm">
    <form class="drawer-panel" @submit.prevent="save">
      <div class="drawer-header">
        <h2>{{ editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h2>
        <button type="button" class="btn ghost" @click="closeForm">Đóng</button>
      </div>

      <div class="form-grid">
        <label>Tên sản phẩm <input v-model="form.tensp" required /></label>
        <label>Giá <input v-model.number="form.gia" type="number" min="0" required /></label>
        <label>Số lượng <input v-model.number="form.soluong" type="number" min="0" required /></label>
        <label>Danh mục
          <select v-model="form.madmh">
            <option value="">-- Chọn danh mục --</option>
            <option v-for="c in categories" :key="c.madmh" :value="c.madmh">{{ c.tendmh }}</option>
          </select>
        </label>
        <label>Anime
          <select v-model="form.mahh">
            <option value="">-- Chọn anime --</option>
            <option v-for="a in animes" :key="a.mahh" :value="a.mahh">{{ a.tenhh }}</option>
          </select>
        </label>
        <label class="full">Ghi chú <textarea v-model="form.ghichu" /></label>
        <label class="full">Thông tin <textarea v-model="form.thongtin" /></label>
      </div>

      <section class="image-manager">
        <div class="image-manager-header">
          <div>
            <h3>Hình ảnh sản phẩm</h3>
            <p class="muted">Chọn nhiều ảnh, sau đó đánh dấu một ảnh đại diện.</p>
          </div>
          <label class="btn ghost upload-button">
            + Thêm ảnh
            <input ref="imageInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple @change="selectImages" />
          </label>
        </div>

        <div v-if="productImages.length || pendingImages.length" class="image-grid">
          <article v-for="image in productImages" :key="image.maha" class="image-card" :class="{ primary: image.anhdaidien === 1 }">
            <img :src="productImage(image.duongdan)" alt="Ảnh sản phẩm" />
            <span v-if="image.anhdaidien === 1" class="primary-label">Ảnh đại diện</span>
            <div class="image-card-actions">
              <button v-if="image.anhdaidien !== 1" type="button" class="btn ghost small" @click="makePrimary(image)">Chọn đại diện</button>
              <button type="button" class="btn danger small" @click="deleteProductImage(image)">Xóa</button>
            </div>
          </article>

          <article v-for="(item, index) in pendingImages" :key="item.preview" class="image-card pending" :class="{ primary: pendingPrimary === index }">
            <img :src="item.preview" :alt="item.file.name" />
            <span v-if="pendingPrimary === index" class="primary-label">Ảnh đại diện mới</span>
            <div class="image-card-actions">
              <button v-if="pendingPrimary !== index" type="button" class="btn ghost small" @click="pendingPrimary = index">Chọn đại diện</button>
              <button type="button" class="btn danger small" @click="removePendingImage(index)">Bỏ</button>
            </div>
          </article>
        </div>
        <div v-else class="image-empty">Sản phẩm chưa có hình ảnh.</div>
      </section>

      <div class="actions" style="margin-top:16px">
        <button class="btn primary" type="submit" :disabled="saving">{{ saving ? 'Đang lưu...' : 'Lưu' }}</button>
        <button class="btn ghost" type="button" @click="closeForm">Hủy</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api, formatMoney } from '../api/http'
import Pagination from '../components/Pagination.vue'
import { confirmAction, notify } from '../services/ui'

const products = ref([])
const categories = ref([])
const animes = ref([])
const keyword = ref('')
const error = ref('')
const showForm = ref(false)
const editing = ref(false)
const brokenImages = reactive(new Set())
const productImages = ref([])
const pendingImages = ref([])
const pendingPrimary = ref(null)
const imageInput = ref(null)
const saving = ref(false)
const page=ref(1),pageSize=ref(10),total=ref(0),totalPages=ref(0),categoryFilter=ref(''),animeFilter=ref(''),stockFilter=ref(''),sort=ref('newest')

function productImage(path) {
  if (!path) return ''
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path
  return `/${String(path).replace(/^\/+/, '')}`
}

const emptyForm = () => ({ masp: '', tensp: '', gia: 0, ghichu: '', madmh: '', mahh: '', thongtin: '', soluong: 0 })
const form = reactive(emptyForm())

const filtered = computed(() => {
  const q = keyword.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p => [p.masp, p.tensp, p.tendmh, p.tenhh].some(v => String(v || '').toLowerCase().includes(q)))
})

const emptyMessage = computed(() => {
  if (keyword.value || categoryFilter.value || animeFilter.value || stockFilter.value) return 'Không tìm thấy sản phẩm phù hợp.'
  return 'Chưa có sản phẩm.'
})

async function load() {
  try {
    error.value = ''
    const [p, c, a] = await Promise.all([api.get('/products',{params:{page:page.value,page_size:pageSize.value,q:keyword.value,category:categoryFilter.value,anime:animeFilter.value,stock:stockFilter.value,sort:sort.value}}), api.get('/categories'), api.get('/animes')])
    products.value = p.data.items
    total.value=p.data.total;totalPages.value=p.data.total_pages
    brokenImages.clear()
    categories.value = c.data
    animes.value = a.data
  } catch (e) { error.value = e.response?.data?.message || e.message }
}
function applyFilters(){page.value=1;load()} function changePage(value){page.value=value;load()} function changePageSize(value){pageSize.value=value;page.value=1;load()}
function resetAndLoad(){keyword.value='';categoryFilter.value='';animeFilter.value='';stockFilter.value='';sort.value='newest';page.value=1;load()}
function clearPendingImages() {
  pendingImages.value.forEach(item => URL.revokeObjectURL(item.preview))
  pendingImages.value = []
  pendingPrimary.value = null
  if (imageInput.value) imageInput.value.value = ''
}
function openCreate() {
  clearPendingImages()
  productImages.value = []
  Object.assign(form, emptyForm())
  editing.value = false
  showForm.value = true
}
async function openEdit(p) {
  clearPendingImages()
  Object.assign(form, { ...emptyForm(), ...p })
  editing.value = true
  showForm.value = true
  await loadProductImages(p.masp)
}
function closeForm() { clearPendingImages(); showForm.value = false }

function selectImages(event) {
  const selected = Array.from(event.target.files || [])
  for (const file of selected) {
    pendingImages.value.push({ file, preview: URL.createObjectURL(file) })
  }
  if (pendingPrimary.value === null && productImages.value.every(image => image.anhdaidien !== 1) && pendingImages.value.length) {
    pendingPrimary.value = 0
  }
  event.target.value = ''
}

function removePendingImage(index) {
  URL.revokeObjectURL(pendingImages.value[index].preview)
  pendingImages.value.splice(index, 1)
  if (pendingPrimary.value === index) pendingPrimary.value = pendingImages.value.length ? 0 : null
  else if (pendingPrimary.value > index) pendingPrimary.value--
}

async function loadProductImages(productId = form.masp) {
  productImages.value = (await api.get(`/products/${encodeURIComponent(productId)}/images`)).data
}

async function makePrimary(image) {
  await api.put(`/products/${encodeURIComponent(form.masp)}/images/${encodeURIComponent(image.maha)}/primary`)
  await loadProductImages()
  await load()
}

async function deleteProductImage(image) {
  if (!await confirmAction('Bạn có chắc muốn xóa hình ảnh này?')) return
  await api.delete(`/products/${encodeURIComponent(form.masp)}/images/${encodeURIComponent(image.maha)}`)
  await loadProductImages()
  await load()
  notify('Đã xóa hình ảnh sản phẩm.')
}

async function uploadPendingImages(productId) {
  const uploaded = []
  for (const item of pendingImages.value) {
    const { data } = await api.post(`/products/${encodeURIComponent(productId)}/images`, item.file, {
      params: { filename: item.file.name },
      headers: { 'Content-Type': item.file.type || 'application/octet-stream' }
    })
    uploaded.push(data)
  }
  if (pendingPrimary.value !== null && uploaded[pendingPrimary.value]) {
    await api.put(`/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(uploaded[pendingPrimary.value].maha)}/primary`)
  }
}
async function save() {
  try {
    saving.value = true
    error.value = ''
    const payload = { ...form, masp: editing.value ? form.masp : null, madmh: form.madmh || null, mahh: form.mahh || null }
    const response = editing.value
      ? await api.put(`/products/${encodeURIComponent(form.masp)}`, payload)
      : await api.post('/products', payload)
    const productId = response.data.masp
    await uploadPendingImages(productId)
    closeForm()
    await load()
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  } finally {
    saving.value = false
  }
}
async function remove(p) {
  if (!await confirmAction(`Bạn có chắc muốn xóa sản phẩm ${p.tensp}?`)) return
  await api.delete(`/products/${p.masp}`)
  await load()
  notify('Đã xóa sản phẩm.')
}
onMounted(load)
</script>
