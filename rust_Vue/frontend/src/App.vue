<template>
  <RouterView v-if="route.meta.public" />
  <AdminLayout v-else />
  <AppNotifications />
</template>

<script setup>
import AdminLayout from './components/AdminLayout.vue'
import { useRoute } from 'vue-router'
import AppNotifications from './components/AppNotifications.vue'

const route = useRoute()
</script>
