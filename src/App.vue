<script setup>
import { watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "./stores/auth"

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

watch(
  () => [auth.initialized, auth.isAuthenticated],
  ([initialized, authenticated]) => {
    if (initialized && !authenticated && route.meta.private) router.replace("/login")
    if (initialized && authenticated && route.meta.guest) router.replace("/courses")
  },
)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>
