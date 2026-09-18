<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { api } from "../services/api"

const props = defineProps({
  courseId: {
    type: String,
    required: true,
  },
})

const videoRef = ref(null)
const video = ref(null)
const streamUrl = ref("")
const expiresAt = ref(0)
const loading = ref(true)
const error = ref("")
let refreshTimer = null
let progressTimer = null

const progressKey = computed(() => `formula-course-video-progress:${props.courseId}`)

function clearTimers() {
  window.clearTimeout(refreshTimer)
  window.clearInterval(progressTimer)
}

function saveResumePoint() {
  const element = videoRef.value
  if (!element) return
  localStorage.setItem(progressKey.value, String(Math.floor(element.currentTime || 0)))
}

function restoreResumePoint() {
  const element = videoRef.value
  if (!element) return
  const seconds = Number(localStorage.getItem(progressKey.value) || 0)
  if (seconds > 0 && Number.isFinite(seconds)) element.currentTime = seconds
}

function scheduleRefresh() {
  window.clearTimeout(refreshTimer)
  if (!expiresAt.value) return
  const refreshIn = Math.max(1000, expiresAt.value - Date.now() - 60000)
  refreshTimer = window.setTimeout(loadStreamLink, refreshIn)
}

async function loadStreamLink() {
  if (!video.value?.googleDriveFileId) return
  const { data } = await api.get(`/api/storage/video-link/${video.value.googleDriveFileId}`)
  streamUrl.value = data.url
  expiresAt.value = new Date(data.expiresAt).getTime()
  scheduleRefresh()
}

async function loadVideo() {
  loading.value = true
  error.value = ""
  try {
    const { data } = await api.get(`/api/storage/course/${props.courseId}`)
    video.value = data.video
    await loadStreamLink()
  } catch (loadError) {
    error.value = loadError.response?.data?.message || "Unable to load course video."
  } finally {
    loading.value = false
  }
}

async function enterFullscreen() {
  await videoRef.value?.requestFullscreen?.()
}

onMounted(() => {
  loadVideo()
  progressTimer = window.setInterval(saveResumePoint, 10000)
})

onBeforeUnmount(() => {
  saveResumePoint()
  clearTimers()
  streamUrl.value = ""
})
</script>

<template>
  <section class="course-video-player">
    <div v-if="loading" class="course-video-player__state">
      Loading video...
    </div>

    <div v-else-if="error" class="course-video-player__state course-video-player__state--error">
      {{ error }}
    </div>

    <div v-else class="course-video-player__frame">
      <video
        ref="videoRef"
        class="course-video-player__video"
        controls
        playsinline
        preload="metadata"
        :src="streamUrl"
        @loadedmetadata="restoreResumePoint"
        @pause="saveResumePoint"
        @ended="saveResumePoint"
      />

      <div class="course-video-player__actions">
        <button type="button" class="course-video-player__button" @click="enterFullscreen">
          Fullscreen
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.course-video-player {
  width: 100%;
}

.course-video-player__frame,
.course-video-player__state {
  border: 1px solid rgb(30 41 59);
  border-radius: 12px;
  background: rgb(2 6 23);
  color: rgb(226 232 240);
}

.course-video-player__state {
  display: grid;
  min-height: 280px;
  place-items: center;
  padding: 24px;
}

.course-video-player__state--error {
  color: rgb(252 165 165);
}

.course-video-player__video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px 12px 0 0;
}

.course-video-player__actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px;
}

.course-video-player__button {
  border: 0;
  border-radius: 8px;
  background: rgb(8 145 178);
  color: white;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 16px;
}
</style>
