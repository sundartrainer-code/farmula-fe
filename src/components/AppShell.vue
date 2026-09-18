<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import Sidebar from "./Sidebar.vue"
import Topbar from "./Topbar.vue"
import { useAuthStore } from "../stores/auth"
import { useDashboardStore } from "../stores/dashboard"

const auth = useAuthStore()
const dashboard = useDashboardStore()
const router = useRouter()
const isDark = ref(localStorage.getItem("formula_theme") !== "light")
const mobileSidebarOpen = ref(false)

function applyTheme() {
  document.documentElement.classList.toggle("dark", isDark.value)
  localStorage.setItem("formula_theme", isDark.value ? "dark" : "light")
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

async function logout() {
  mobileSidebarOpen.value = false
  await auth.logout()
  router.push("/login")
}

onMounted(() => {
  applyTheme()
  dashboard.load().catch(() => {})
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
    <Sidebar :mobile-open="mobileSidebarOpen" @close="mobileSidebarOpen = false" @logout="logout" />

    <main class="lg:pl-72">
      <Topbar
        :is-dark="isDark"
        :menu-open="mobileSidebarOpen"
        @toggle-menu="mobileSidebarOpen = !mobileSidebarOpen"
        @toggle-theme="toggleTheme"
        @logout="logout"
      />
      <section class="p-5 sm:p-8">
        <slot />
      </section>
    </main>
  </div>
</template>
