<script setup>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import AppShell from "../components/AppShell.vue"
import DashboardNoSubscription from "../components/DashboardNoSubscription.vue"
import DashboardOverview from "../components/DashboardOverview.vue"
import SkeletonCard from "../components/ui/SkeletonCard.vue"
import ErrorState from "../components/ui/ErrorState.vue"
import { useDashboardStore } from "../stores/dashboard"
import { useLmsStore } from "../stores/lms"
import { useVideoStore } from "../stores/video"

const lms = useLmsStore()
const dashboardStore = useDashboardStore()
const videoStore = useVideoStore()
const router = useRouter()

const dashboard = computed(() => dashboardStore.data)
const hasActiveSubscription = computed(() => dashboardStore.active)
const dashboardStats = computed(() => ({
  ...(dashboard.value?.stats || {}),
  totalVideos: videoStore.videos.length,
  completedVideos: videoStore.videos.filter((video) => video.completed).length,
  overallProgress: videoStore.videos.length
    ? Math.round(videoStore.videos.reduce((sum, video) => sum + video.progressPercent, 0) / videoStore.videos.length)
    : 0,
}))

const recentVideos = computed(() => [...videoStore.videos]
  .sort((left, right) => {
    const leftTime = left.lastWatchedAt ? new Date(left.lastWatchedAt).getTime() : 0
    const rightTime = right.lastWatchedAt ? new Date(right.lastWatchedAt).getTime() : 0
    return rightTime - leftTime || left.sortOrder - right.sortOrder
  })
  .slice(0, 2))

onMounted(async () => {
  await Promise.all([
    dashboardStore.load().catch(() => null),
    lms.loadPlans().catch(() => null),
  ])
  if (dashboardStore.active) {
    try {
      await videoStore.load()
    } catch {
      // Dashboard remains usable when the video library is temporarily unavailable.
    }
  }
})
</script>

<template>
  <AppShell>
    <SkeletonCard v-if="dashboardStore.loading" type="dashboard" />
    <ErrorState
      v-else-if="dashboardStore.error"
      title="Dashboard unavailable"
      :description="dashboardStore.error"
      @retry="dashboardStore.load({ force: true }).catch(() => {})"
    />
    <div v-else-if="hasActiveSubscription" class="space-y-8">
      <DashboardOverview
        :subscription="dashboard.subscription"
        :stats="dashboardStats"
        :recent-videos="recentVideos"
        @play-video="router.push(`/lessons/${$event.id}`)"
      />
    </div>
    <DashboardNoSubscription v-else />
  </AppShell>
</template>
