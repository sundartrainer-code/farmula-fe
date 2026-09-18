<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { api } from "../services/api"

const props = defineProps({
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
  lessonId: { type: String, default: "" },
  durationSeconds: { type: Number, default: 0 },
})

const root = ref(null)
const visible = ref(false)
const loaded = ref(false)
const failed = ref(false)
const imageSource = ref(props.src)
const displaySource = ref("")
let observer
let objectUrl = ""
let requestId = 0
let previewVideo

const LazyThumbnailPreviewCache = globalThis.__formulaThumbnailPreviewCache || {
  images: new Map(),
  promises: new Map(),
  queue: Promise.resolve(),
}
globalThis.__formulaThumbnailPreviewCache = LazyThumbnailPreviewCache
const previewCache = LazyThumbnailPreviewCache

const fallbackLabel = computed(() => (props.alt || "Formula").slice(0, 1).toUpperCase())

function useFallback() {
  failed.value = true
  loaded.value = true
  cleanupObjectUrl()
}

function cleanupObjectUrl() {
  if (!objectUrl) return
  URL.revokeObjectURL(objectUrl)
  objectUrl = ""
}

function cleanupVideo() {
  if (!previewVideo) return
  previewVideo.pause()
  previewVideo.removeAttribute("src")
  previewVideo.load()
  previewVideo = null
}

function captureTime(duration = 0) {
  const value = Number(duration || props.durationSeconds || 0)
  if (Number.isFinite(value) && value > 0 && value < 3) return Math.max(0.1, value * 0.25)
  return 3
}

function waitForVideoEvent(video, eventName) {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error("Video preview timed out"))
    }, 15000)
    const cleanup = () => {
      window.clearTimeout(timeout)
      video.removeEventListener(eventName, handleEvent)
      video.removeEventListener("error", handleError)
    }
    const handleEvent = () => {
      cleanup()
      resolve()
    }
    const handleError = () => {
      cleanup()
      reject(new Error("Unable to generate video preview"))
    }
    video.addEventListener(eventName, handleEvent, { once: true })
    video.addEventListener("error", handleError, { once: true })
  })
}

async function videoPreviewSource() {
  if (!props.lessonId) return ""
  if (previewCache.images.has(props.lessonId)) return previewCache.images.get(props.lessonId)
  if (previewCache.promises.has(props.lessonId)) return previewCache.promises.get(props.lessonId)

  const promise = previewCache.queue.then(async () => {
    const { data } = await api.get(`/api/video/${props.lessonId}`)
    if (!data?.url) return ""

    const video = document.createElement("video")
    previewVideo = video
    video.crossOrigin = "anonymous"
    video.muted = true
    video.playsInline = true
    video.preload = "metadata"
    video.src = data.url
    video.load()

    await waitForVideoEvent(video, "loadedmetadata")
    video.currentTime = Math.min(captureTime(video.duration), Math.max(0, Number(video.duration || 0) - 0.2))
    await waitForVideoEvent(video, "seeked")

    const width = 1280
    const height = 720
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) return ""

    context.fillStyle = "#0f172a"
    context.fillRect(0, 0, width, height)

    const ratio = Math.min(width / video.videoWidth, height / video.videoHeight)
    const drawWidth = video.videoWidth * ratio
    const drawHeight = video.videoHeight * ratio
    const x = (width - drawWidth) / 2
    const y = (height - drawHeight) / 2
    context.drawImage(video, x, y, drawWidth, drawHeight)

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    previewCache.images.set(props.lessonId, dataUrl)
    return dataUrl
  }).finally(() => {
    previewCache.promises.delete(props.lessonId)
    cleanupVideo()
  })

  previewCache.promises.set(props.lessonId, promise)
  previewCache.queue = promise.catch(() => "")
  return promise
}

async function prepareImage() {
  requestId += 1
  const currentRequest = requestId
  cleanupObjectUrl()
  displaySource.value = ""
  if (!visible.value) return

  if (imageSource.value) {
    displaySource.value = imageSource.value
    return
  }

  try {
    const dataUrl = await videoPreviewSource()
    if (currentRequest !== requestId) return
    if (!dataUrl) return useFallback()
    displaySource.value = dataUrl
  } catch {
    if (currentRequest !== requestId) return
    useFallback()
  }
}

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    visible.value = true
    return
  }

  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    visible.value = true
    observer.disconnect()
  }, { rootMargin: "240px" })
  observer.observe(root.value)
})

watch(() => props.src, (nextSource) => {
  imageSource.value = nextSource
  loaded.value = false
  failed.value = false
  prepareImage()
})

watch(visible, () => {
  prepareImage()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cleanupObjectUrl()
})
</script>

<template>
  <div ref="root" class="relative aspect-video overflow-hidden bg-slate-800">
    <div v-if="!loaded && !failed" class="skeleton-shimmer absolute inset-0" />
    <div v-if="failed || !imageSource" class="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <span class="grid h-14 w-14 place-items-center rounded-full bg-cyan-400/15 text-xl font-black text-cyan-300 ring-1 ring-cyan-300/30">
        {{ fallbackLabel }}
      </span>
    </div>
    <img
      v-if="visible && displaySource && !failed"
      :src="displaySource"
      :alt="alt"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      @load="loaded = true"
      @error="useFallback"
    />
    <slot />
  </div>
</template>
