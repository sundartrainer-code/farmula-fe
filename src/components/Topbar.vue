<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { Menu, Moon, Sun, X } from "@lucide/vue"
import { useAuthStore } from "../stores/auth"

defineProps({
  isDark: { type: Boolean, default: false },
  menuOpen: { type: Boolean, default: false },
})

defineEmits(["toggle-menu", "toggle-theme", "logout"])
const auth = useAuthStore()
const route = useRoute()
const userInitial = computed(() => (auth.user?.displayName || auth.user?.email || "F").charAt(0).toUpperCase())
const title = computed(() => route.meta.title || "Course Dashboard")
</script>

<template>
  <header class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
    <div class="flex items-center gap-3 lg:hidden">
      <button
        class="btn-muted h-10 w-10 p-0"
        type="button"
        :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="$emit('toggle-menu')"
      >
        <X v-if="menuOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>
      <RouterLink to="/courses" class="font-black">Formula</RouterLink>
    </div>
    <div class="hidden lg:block">
      <p class="text-sm font-bold uppercase text-cyan-500">Professional LMS</p>
      <h1 class="text-xl font-black">{{ title }}</h1>
    </div>
    <div class="flex items-center gap-3">
      <button
        class="btn-muted h-10 w-10 p-0"
        type="button"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="isDark ? 'Light mode' : 'Dark mode'"
        @click="$emit('toggle-theme')"
      >
        <Sun v-if="isDark" :size="19" />
        <Moon v-else :size="19" />
      </button>
      <div class="grid h-10 w-10 place-items-center rounded-full bg-slate-900 font-black text-white dark:bg-white dark:text-slate-950">{{ userInitial }}</div>
      <button class="btn-muted hidden sm:inline-flex" type="button" @click="$emit('logout')">Logout</button>
    </div>
  </header>
</template>
