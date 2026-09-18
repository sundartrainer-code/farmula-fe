<script setup>
import AppShell from "../components/AppShell.vue"
import SettingsSkeleton from "../components/skeletons/SettingsSkeleton.vue"
</script>

<template>
  <AppShell>
    <SettingsSkeleton v-if="false" />
    <section class="card max-w-3xl p-6">
      <h1 class="text-3xl font-black">Settings</h1>
      <div class="mt-6 space-y-4">
        <label class="flex items-center justify-between rounded-lg bg-slate-100 p-4 font-bold dark:bg-slate-800">
          Email notifications
          <input type="checkbox" checked />
        </label>
        <label class="flex items-center justify-between rounded-lg bg-slate-100 p-4 font-bold dark:bg-slate-800">
          Course reminders
          <input type="checkbox" checked />
        </label>
      </div>
    </section>
  </AppShell>
</template>
