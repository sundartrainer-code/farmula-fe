<script setup>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import AppShell from "../components/AppShell.vue"
import VideoCard from "../components/VideoCard.vue"
import VideosSkeleton from "../components/skeletons/VideosSkeleton.vue"
import SubscriptionPlans from "../components/SubscriptionPlans.vue"
import { useDashboardStore } from "../stores/dashboard"
import { useVideoStore } from "../stores/video"

const dashboard = useDashboardStore()
const videos = useVideoStore()
const router = useRouter()
const active = computed(() => dashboard.active)

async function loadVideos() {
  try {
    await videos.load()
  } catch {
    // The store owns the user-facing error state.
  }
}

onMounted(async () => {
  await dashboard.load().catch(() => null)
  if (dashboard.active) await loadVideos()
})
</script>

<template>
  <AppShell>
    <VideosSkeleton v-if="dashboard.loading || videos.loading" />
    <SubscriptionPlans v-else-if="!active" />
    <section v-else class="space-y-6">
      <header>
        <p class="text-sm font-black uppercase text-cyan-500">Video Library</p>
        <h1 class="mt-1 text-3xl font-black">Videos</h1>
      </header>

      <div v-if="videos.error" class="card p-8 text-center" role="alert">
        <p class="whitespace-pre-line font-bold text-red-500">{{ videos.error }}</p>
        <button class="btn-primary mt-5" type="button" @click="loadVideos">Retry</button>
      </div>

      <div v-else-if="videos.videos.length" class="grid min-w-0 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <VideoCard
          v-for="video in videos.videos"
          :key="video.id"
          :video="video"
          @play="router.push(`/lessons/${$event.id}`)"
        />
      </div>

      <div v-else class="card p-10 text-center text-slate-500">
        No videos have been uploaded yet.
      </div>

    </section>
  </AppShell>
</template>
