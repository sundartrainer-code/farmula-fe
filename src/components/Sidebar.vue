<script setup>
import { computed } from "vue"
import { useDashboardStore } from "../stores/dashboard"
import { useAuthStore } from "../stores/auth"

defineProps({
  mobileOpen: { type: Boolean, default: false },
})
const emit = defineEmits(["close", "logout"])
const dashboard = useDashboardStore()
const auth = useAuthStore()
const isActive = computed(() => dashboard.active)
const navItems = computed(() => {
  const base = [{ label: "Dashboard", to: "/courses" }]
  if (isActive.value) {
    const items = [
      ...base,
      { label: "Videos", to: "/videos" },
      { label: "Profile", to: "/profile" },
      { label: "Settings", to: "/settings" },
    ]
    if (auth.user?.role === "admin") items.splice(2, 0, { label: "Admin", to: "/admin" })
    return items
  }
  return [
    ...base,
    { label: "Pricing", to: "/pricing" },
    { label: "Profile", to: "/profile" },
    { label: "Settings", to: "/settings" },
  ]
})
</script>

<template>
  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
    @click="emit('close')"
  />
  <aside
    class="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:block lg:translate-x-0 lg:shadow-none"
    :class="mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <RouterLink to="/courses" class="flex items-center gap-3">
      <div class="grid h-11 w-11 place-items-center rounded-lg bg-cyan-500 font-black text-white">F</div>
      <div>
        <p class="text-2xl font-black">Formula</p>
        <p class="text-xs text-slate-500">Learning platform</p>
      </div>
    </RouterLink>
    <nav class="mt-10 space-y-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        class="block rounded-lg px-4 py-3 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        active-class="bg-cyan-500 text-white hover:bg-cyan-500 dark:text-white"
        :to="item.to"
        @click="emit('close')"
      >
        {{ item.label }}
      </RouterLink>
      <button class="block w-full rounded-lg px-4 py-3 text-left font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" type="button" @click="emit('logout')">Logout</button>
    </nav>
  </aside>
</template>
