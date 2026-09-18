<script setup>
import VideoCard from "./VideoCard.vue"

defineProps({
  videos: { type: Array, default: () => [] },
})

defineEmits(["view-all"])
</script>

<template>
  <section class="card h-full p-5">
    <div class="flex items-center justify-between gap-4">
      <h3 class="text-xl font-black">Recent Videos</h3>
      <button class="font-bold text-cyan-500" type="button" @click="$emit('view-all')">View All</button>
    </div>
    <div v-if="videos.length" class="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
      <VideoCard v-for="video in videos" :key="video.id" :video="video" compact @play="$emit('play', $event)" />
    </div>
    <p v-else class="mt-4 text-slate-500">No videos have been uploaded yet.</p>
  </section>
</template>
