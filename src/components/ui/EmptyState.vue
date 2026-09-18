<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  actionLabel: { type: String, default: "Refresh" }
})

const emit = defineEmits(["action"])
</script>

<template>
  <section class="grid min-h-[52vh] place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
    <div class="max-w-md">
      <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-800 text-3xl">＋</div>
      <h3 class="mt-6 text-2xl font-black">{{ title }}</h3>
      <p class="mt-3 text-slate-400">{{ description }}</p>
      <button class="btn-primary mt-7" type="button" @click="emit('action')">{{ actionLabel }}</button>
    </div>
  </section>
</template>
