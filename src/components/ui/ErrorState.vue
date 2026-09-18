<script setup>
defineProps({
  icon: { type: String, default: "📹" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  showPlans: { type: Boolean, default: true }
})

const emit = defineEmits(["retry", "plans"])
</script>

<template>
  <section class="grid min-h-[52vh] place-items-center rounded-3xl border border-red-400/20 bg-red-950/10 p-6 text-center">
    <div class="card max-w-lg border-red-400/20 bg-white p-8 dark:bg-slate-950/80">
      <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-4xl">{{ icon }}</div>
      <h3 class="mt-6 text-2xl font-black">{{ title }}</h3>
      <p class="mt-3 text-slate-400">{{ description }}</p>
      <div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button class="btn-primary" type="button" @click="emit('retry')">Retry</button>
        <button v-if="showPlans" class="btn-muted" type="button" @click="emit('plans')">Manage Plan</button>
      </div>
    </div>
  </section>
</template>
