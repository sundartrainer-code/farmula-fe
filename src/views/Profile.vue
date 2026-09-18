<script setup>
import AppShell from "../components/AppShell.vue"
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton.vue"
import { useAuthStore } from "../stores/auth"

const auth = useAuthStore()
</script>

<template>
  <AppShell>
    <ProfileSkeleton v-if="auth.loading" />
    <section v-else class="card max-w-3xl p-6">
      <h1 class="text-3xl font-black">Profile</h1>
      <p class="mt-2 text-slate-500">{{ auth.user?.email }}</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
          <p class="text-sm font-black uppercase text-cyan-500">Name</p>
          <p class="mt-1 font-bold">{{ auth.user?.displayName || "Formula Student" }}</p>
        </div>
        <div class="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
          <p class="text-sm font-black uppercase text-cyan-500">Role</p>
          <p class="mt-1 font-bold">Student</p>
        </div>
      </div>
    </section>
  </AppShell>
</template>
