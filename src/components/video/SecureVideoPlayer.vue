<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { api } from "../../services/api"

const LOW_DATA_KEY = "formula_video_low_data_mode"
const VOLUME_KEY = "formula_video_volume"
const PLAYBACK_RATE_KEY = "formula_video_playback_rate"
const POSITION_PREFIX = "formula_video_position:"
const STALL_TIMEOUT_MS = 6000

const props = defineProps({
  lessonId: { type: String, default: "" },
  sourceUrl: { type: String, default: "" },
  startSeconds: { type: Number, default: 0 },
  autoplay: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  poster: { type: String, default: "" },
})

const emit = defineEmits(["progress", "completed", "started", "ended", "error"])

const playerRootRef = ref(null)
const videoRef = ref(null)
const youtubeRef = ref(null)
const videoUrl = ref("")
const runtimeSrc = ref("")
const playerType = ref("mp4")
const youtubeVideoId = ref("")
const signedUrlExpiresAt = ref(null)
const sourceError = ref("")
const loading = ref(false)
const buffering = ref(false)
const networkLost = ref(false)
const metadataLoaded = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const lowDataMode = ref(localStorage.getItem(LOW_DATA_KEY) === "true")
const slowNetworkPrompt = ref(false)
const slowNetworkDismissed = ref(false)
const pendingAutoplay = ref(false)
const youtubePlaying = ref(false)
const youtubeMuted = ref(false)
const savedInitialVolume = Number(localStorage.getItem(VOLUME_KEY))
const youtubeVolume = ref(Number.isFinite(savedInitialVolume)
  ? Math.round(savedInitialVolume <= 1 ? savedInitialVolume * 100 : savedInitialVolume)
  : 80)
let progressTimer
let stallTimer
let youtubePlayer
let youtubeProgressTimer
let youtubeApiPromise

const canLoadVideo = computed(() => Boolean(props.lessonId || props.sourceUrl))
const storageKey = computed(() => `${POSITION_PREFIX}${props.lessonId || props.sourceUrl || "video"}`)
const preloadMode = computed(() => "metadata")
const canResumeLowData = computed(() => Boolean(
  lowDataMode.value
    && !runtimeSrc.value
    && (videoUrl.value || (playerType.value === "youtube" && youtubeVideoId.value)),
))

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve(window.YT)
    }
    const existing = document.querySelector("script[src='https://www.youtube.com/iframe_api']")
    if (existing) {
      const waitForExisting = window.setInterval(() => {
        if (!window.YT?.Player) return
        window.clearInterval(waitForExisting)
        resolve(window.YT)
      }, 100)
      return
    }
    const script = document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    script.async = true
    document.head.appendChild(script)
  })

  return youtubeApiPromise
}

function destroyYouTubePlayer() {
  window.clearInterval(youtubeProgressTimer)
  youtubeProgressTimer = null
  if (youtubePlayer?.destroy) youtubePlayer.destroy()
  youtubePlayer = null
  youtubePlaying.value = false
}

function syncFromYouTube() {
  if (!youtubePlayer?.getCurrentTime) return
  currentTime.value = Math.max(0, Number(youtubePlayer.getCurrentTime() || 0))
  duration.value = Math.max(0, Number(youtubePlayer.getDuration?.() || duration.value || 0))
  youtubeMuted.value = Boolean(youtubePlayer.isMuted?.())
  youtubeVolume.value = Number(youtubePlayer.getVolume?.() ?? youtubeVolume.value)
  localStorage.setItem(storageKey.value, String(Math.floor(currentTime.value)))
  localStorage.setItem(VOLUME_KEY, String(youtubeVolume.value))
}

function syncFromVideo() {
  if (playerType.value === "youtube") return syncFromYouTube()
  const video = videoRef.value
  if (!video) return
  currentTime.value = Math.max(0, Number(video.currentTime || 0))
  duration.value = Number.isFinite(video.duration) ? video.duration : 0
  localStorage.setItem(storageKey.value, String(Math.floor(currentTime.value)))
  localStorage.setItem(VOLUME_KEY, String(video.volume))
  localStorage.setItem(PLAYBACK_RATE_KEY, String(video.playbackRate))
}

function saveProgress(completed = false) {
  if (playerType.value === "youtube") syncFromYouTube()
  const position = Math.floor(videoRef.value?.currentTime ?? currentTime.value ?? 0)
  if (completed) emit("completed", position)
  else emit("progress", position)
}

function restorePreferences() {
  const video = videoRef.value
  if (!video) return
  const savedVolume = Number(localStorage.getItem(VOLUME_KEY))
  const savedRate = Number(localStorage.getItem(PLAYBACK_RATE_KEY))
  if (Number.isFinite(savedVolume)) video.volume = Math.min(1, Math.max(0, savedVolume))
  if (Number.isFinite(savedRate)) video.playbackRate = Math.min(2, Math.max(0.5, savedRate))
  video.muted = props.muted
}

function savedStartSeconds() {
  const saved = Number(localStorage.getItem(storageKey.value))
  return Math.max(Number(props.startSeconds || 0), Number.isFinite(saved) ? saved : 0)
}

function handleLoadedMetadata() {
  syncFromVideo()
  const startSeconds = savedStartSeconds()
  if (startSeconds > 0 && videoRef.value) {
    const safeDuration = Number.isFinite(videoRef.value.duration) ? videoRef.value.duration : 0
    videoRef.value.currentTime = safeDuration
      ? Math.min(startSeconds, Math.max(0, safeDuration - 2))
      : startSeconds
  }
  metadataLoaded.value = true
  loading.value = false
  if (pendingAutoplay.value) {
    pendingAutoplay.value = false
    videoRef.value?.play().catch(() => {
      loading.value = false
    })
  }
}

function handleCanPlay() {
  window.clearTimeout(stallTimer)
  buffering.value = false
  networkLost.value = false
  loading.value = false
}

function handlePlaying() {
  window.clearTimeout(stallTimer)
  sourceError.value = ""
  buffering.value = false
  networkLost.value = false
  loading.value = false
  emit("started")
}

function handlePause() {
  syncFromVideo()
  saveProgress(false)
  if (!lowDataMode.value || !runtimeSrc.value) return
  runtimeSrc.value = ""
  metadataLoaded.value = false
  buffering.value = false
}

function handleEnded() {
  saveProgress(true)
  emit("ended", Math.floor(videoRef.value?.currentTime ?? currentTime.value ?? 0))
}

function handleError() {
  sourceError.value = "Video playback failed. Tap Retry or refresh the page."
  buffering.value = false
  loading.value = false
  emit("error", sourceError.value)
}

function markBuffering() {
  buffering.value = true
  loading.value = true
  window.clearTimeout(stallTimer)
  stallTimer = window.setTimeout(() => {
    if (buffering.value) networkLost.value = true
  }, STALL_TIMEOUT_MS)
}

function handleSuspend() {
  syncFromVideo()
}

async function attachSource({ autoplay = false } = {}) {
  if (playerType.value === "youtube") return attachYouTube({ autoplay })
  if (!videoUrl.value) return
  if (signedUrlExpiresAt.value && Date.now() > signedUrlExpiresAt.value - 15000) {
    await loadSignedUrl({ attach: false })
  }
  runtimeSrc.value = videoUrl.value
  pendingAutoplay.value = autoplay
  loading.value = true
  await nextTick()
  if (videoRef.value) {
    restorePreferences()
    videoRef.value.load()
  }
}

async function loadSignedUrl({ attach = !lowDataMode.value } = {}) {
  sourceError.value = ""
  metadataLoaded.value = false
  runtimeSrc.value = ""
  videoUrl.value = ""
  youtubeVideoId.value = ""
  playerType.value = "mp4"
  signedUrlExpiresAt.value = null
  destroyYouTubePlayer()
  if (!canLoadVideo.value) {
    sourceError.value = "Video source is not configured."
    return
  }

  loading.value = true
  try {
    if (props.lessonId) {
      const { data } = await api.get(`/api/video/${props.lessonId}`)
      if (data.type === "youtube") {
        playerType.value = "youtube"
        youtubeVideoId.value = data.youtubeVideoId || ""
        if (!youtubeVideoId.value) {
          sourceError.value = "YouTube video is not configured."
          loading.value = false
          return
        }
        if (attach) await attachYouTube({ autoplay: props.autoplay })
        else loading.value = false
        return
      }
      videoUrl.value = data.url || ""
      signedUrlExpiresAt.value = data.expiresAt ? new Date(data.expiresAt).getTime() : null
    } else {
      videoUrl.value = props.sourceUrl
    }

    if (!videoUrl.value) {
      sourceError.value = "Signed video URL is empty."
      loading.value = false
      return
    }

    if (attach) await attachSource({ autoplay: props.autoplay })
    else loading.value = false
  } catch (error) {
    sourceError.value = error.response?.data?.message || "Unable to load video URL."
    loading.value = false
    emit("error", sourceError.value)
  }
}

async function playLowDataVideo() {
  await attachSource({ autoplay: true })
}

async function attachYouTube({ autoplay = false } = {}) {
  if (!youtubeVideoId.value) return
  loading.value = true
  await nextTick()
  const YT = await loadYouTubeApi()
  if (!youtubeRef.value) return

  destroyYouTubePlayer()
  youtubePlayer = new YT.Player(youtubeRef.value, {
    videoId: youtubeVideoId.value,
    playerVars: {
      autoplay: autoplay ? 1 : 0,
      controls: 0,
      disablekb: 0,
      fs: 1,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady(event) {
        duration.value = Math.max(0, Number(event.target.getDuration?.() || 0))
        const savedVolume = Number(localStorage.getItem(VOLUME_KEY))
        const volume = Number.isFinite(savedVolume)
          ? Math.min(100, Math.max(0, savedVolume <= 1 ? savedVolume * 100 : savedVolume))
          : youtubeVolume.value
        event.target.setVolume?.(volume)
        if (props.muted) event.target.mute?.()
        youtubeVolume.value = volume
        youtubeMuted.value = Boolean(event.target.isMuted?.())
        const startSeconds = savedStartSeconds()
        if (startSeconds > 0) event.target.seekTo(startSeconds, true)
        metadataLoaded.value = true
        loading.value = false
        if (autoplay) event.target.playVideo?.()
      },
      onStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
          youtubePlaying.value = true
          handlePlaying()
          window.clearInterval(youtubeProgressTimer)
          youtubeProgressTimer = window.setInterval(syncFromYouTube, 1000)
        }
        if (event.data === YT.PlayerState.PAUSED) {
          youtubePlaying.value = false
          syncFromYouTube()
          saveProgress(false)
          window.clearInterval(youtubeProgressTimer)
        }
        if (event.data === YT.PlayerState.BUFFERING) markBuffering()
        if (event.data === YT.PlayerState.ENDED) {
          youtubePlaying.value = false
          syncFromYouTube()
          handleEnded()
          window.clearInterval(youtubeProgressTimer)
        }
      },
      onError() {
        handleError()
      },
    },
  })
}

function toggleYouTubePlayback() {
  if (!youtubePlayer?.getPlayerState) return
  const isPlaying = youtubePlayer.getPlayerState() === window.YT?.PlayerState?.PLAYING
  if (isPlaying) youtubePlayer.pauseVideo?.()
  else youtubePlayer.playVideo?.()
}

function seekYouTube(offsetSeconds) {
  if (!youtubePlayer?.seekTo) return
  syncFromYouTube()
  youtubePlayer.seekTo(Math.max(0, Math.min(duration.value || Number.MAX_SAFE_INTEGER, currentTime.value + offsetSeconds)), true)
}

function setYouTubePosition(value) {
  if (!youtubePlayer?.seekTo) return
  const nextTime = Number(value)
  if (!Number.isFinite(nextTime)) return
  youtubePlayer.seekTo(nextTime, true)
  currentTime.value = nextTime
}

function setYouTubeVolume(value) {
  if (!youtubePlayer?.setVolume) return
  const volume = Math.min(100, Math.max(0, Number(value) || 0))
  youtubeVolume.value = volume
  youtubePlayer.setVolume(volume)
  if (volume > 0 && youtubePlayer.isMuted?.()) youtubePlayer.unMute?.()
  youtubeMuted.value = Boolean(youtubePlayer.isMuted?.())
  localStorage.setItem(VOLUME_KEY, String(volume))
}

function toggleYouTubeMute() {
  if (!youtubePlayer) return
  if (youtubePlayer.isMuted?.()) youtubePlayer.unMute?.()
  else youtubePlayer.mute?.()
  syncFromYouTube()
}

function fullscreenPlayer() {
  if (!document.fullscreenElement) playerRootRef.value?.requestFullscreen?.()
  else document.exitFullscreen?.()
}

async function retryPlayback() {
  sourceError.value = ""
  networkLost.value = false
  buffering.value = false
  await loadSignedUrl({ attach: !lowDataMode.value })
}

function setLowDataMode(enabled) {
  lowDataMode.value = enabled
  localStorage.setItem(LOW_DATA_KEY, String(enabled))
  slowNetworkPrompt.value = false
  if (enabled && videoRef.value?.paused) {
    handlePause()
  } else if (!enabled && videoUrl.value && !runtimeSrc.value) {
    attachSource({ autoplay: false })
  }
}

function inspectConnection() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!connection || slowNetworkDismissed.value || lowDataMode.value) return
  const slow = connection.saveData === true
    || connection.effectiveType === "2g"
    || connection.effectiveType === "slow-2g"
  slowNetworkPrompt.value = Boolean(slow)
}

function dismissSlowNetworkPrompt() {
  slowNetworkDismissed.value = true
  slowNetworkPrompt.value = false
}

function handleOnline() {
  if (networkLost.value) retryPlayback()
}

function handleKeydown(event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return
  const video = videoRef.value
  const key = event.key.toLowerCase()
  if (key === " " || key === "k") {
    event.preventDefault()
    if (playerType.value === "youtube" && youtubePlayer?.getPlayerState) toggleYouTubePlayback()
    else if (!video && canResumeLowData.value) playLowDataVideo()
    else if (video?.paused) video.play().catch(() => {})
    else video?.pause()
  }
  if (key === "arrowleft" && playerType.value === "youtube" && youtubePlayer?.seekTo) {
    event.preventDefault()
    seekYouTube(-10)
  } else if (key === "arrowleft" && video) {
    event.preventDefault()
    video.currentTime = Math.max(0, video.currentTime - 10)
  }
  if (key === "arrowright" && playerType.value === "youtube" && youtubePlayer?.seekTo) {
    event.preventDefault()
    seekYouTube(10)
  } else if (key === "arrowright" && video) {
    event.preventDefault()
    video.currentTime = Math.min(duration.value || Number.MAX_SAFE_INTEGER, video.currentTime + 10)
  }
  if (key === "f") {
    event.preventDefault()
    fullscreenPlayer()
  }
  if (key === "m" && video) {
    event.preventDefault()
    video.muted = !video.muted
  } else if (key === "m" && playerType.value === "youtube" && youtubePlayer) {
    event.preventDefault()
    if (youtubePlayer.isMuted?.()) youtubePlayer.unMute?.()
    else youtubePlayer.mute?.()
  }
}

onMounted(() => {
  progressTimer = window.setInterval(() => saveProgress(false), 10000)
  inspectConnection()
  window.addEventListener("online", handleOnline)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  connection?.addEventListener?.("change", inspectConnection)
  loadSignedUrl()
})

watch(() => [props.lessonId, props.sourceUrl], loadSignedUrl)

onBeforeUnmount(() => {
  window.clearInterval(progressTimer)
  window.clearTimeout(stallTimer)
  window.removeEventListener("online", handleOnline)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  connection?.removeEventListener?.("change", inspectConnection)
  saveProgress(false)
  destroyYouTubePlayer()
})
</script>

<template>
  <section
    ref="playerRootRef"
    class="overflow-hidden rounded-lg bg-black text-white shadow-xl"
    tabindex="0"
    aria-label="Video player"
    @keydown="handleKeydown"
  >
    <div v-if="slowNetworkPrompt" class="flex items-center justify-between gap-3 bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-100">
      <span>Slow network detected. Enable Low Data Mode?</span>
      <span class="flex shrink-0 gap-2">
        <button class="rounded bg-amber-300 px-3 py-1 text-slate-950" type="button" @click="setLowDataMode(true)">Enable</button>
        <button class="rounded border border-amber-300/50 px-3 py-1" type="button" @click="dismissSlowNetworkPrompt">Dismiss</button>
      </span>
    </div>

    <div class="relative">
      <div v-if="loading || buffering" class="absolute inset-0 z-10 grid place-items-center bg-black/45 text-center">
        <div>
          <div class="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-cyan-400" />
          <p class="mt-3 text-sm font-black">{{ networkLost ? "Network connection is slow or unavailable." : buffering ? "Buffering..." : "Loading video..." }}</p>
          <button v-if="networkLost || sourceError" class="mt-3 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-black text-white" type="button" @click="retryPlayback">Retry</button>
        </div>
      </div>

      <div v-if="playerType === 'youtube' && youtubeVideoId && (loading || metadataLoaded || !lowDataMode)" class="relative aspect-video w-full bg-black">
        <div ref="youtubeRef" class="h-full w-full" />
        <button
          class="absolute inset-0 z-10 cursor-pointer bg-transparent"
          type="button"
          aria-label="Play or pause video"
          @click="toggleYouTubePlayback"
          @dblclick.prevent="fullscreenPlayer"
          @contextmenu.prevent
        >
          <span class="sr-only">Play or pause video</span>
        </button>
        <div
          v-if="!youtubePlaying && metadataLoaded"
          class="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/10"
        >
          <span class="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-2xl font-black text-slate-950 shadow-xl">
            ▶
          </span>
        </div>
      </div>

      <video
        v-else-if="runtimeSrc"
        :key="runtimeSrc"
        ref="videoRef"
        class="aspect-video w-full bg-black"
        :controls="metadataLoaded"
        playsinline
        controlslist="nodownload"
        disablePictureInPicture
        disableRemotePlayback
        draggable="false"
        :preload="preloadMode"
        :autoplay="autoplay"
        :muted="muted"
        :poster="poster"
        :src="runtimeSrc"
        @contextmenu.prevent
        @dragstart.prevent
        @loadstart="loading = true"
        @loadedmetadata="handleLoadedMetadata"
        @canplay="handleCanPlay"
        @playing="handlePlaying"
        @pause="handlePause"
        @waiting="markBuffering"
        @stalled="markBuffering"
        @suspend="handleSuspend"
        @timeupdate="syncFromVideo"
        @ended="handleEnded"
        @error="handleError"
      />
      <div v-else class="flex aspect-video w-full items-center justify-center bg-black px-6 text-center">
        <div>
          <p class="text-sm font-semibold text-slate-300">
            {{ loading ? "Preparing secure video..." : lowDataMode ? "Low Data Mode is on. Press Play to load this lesson." : "Waiting for video source..." }}
          </p>
          <button
            v-if="canResumeLowData"
            class="mt-4 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-black text-white"
            type="button"
            @click="playLowDataVideo"
          >
            {{ currentTime > 0 ? "Resume Video" : "Play Video" }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="playerType === 'youtube'" class="space-y-3 bg-slate-950 px-4 py-3 text-sm text-slate-300">
      <input
        class="h-2 w-full cursor-pointer accent-cyan-400"
        type="range"
        min="0"
        :max="Math.max(1, Math.floor(duration))"
        :value="Math.floor(currentTime)"
        @input="setYouTubePosition($event.target.value)"
      />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button class="rounded bg-slate-800 px-3 py-2 font-black text-white hover:bg-slate-700" type="button" @click="toggleYouTubeMute">
            {{ youtubeMuted ? "Unmute" : "Mute" }}
          </button>
          <input
            class="w-24 accent-cyan-400"
            type="range"
            min="0"
            max="100"
            :value="youtubeVolume"
            aria-label="Volume"
            @input="setYouTubeVolume($event.target.value)"
          />
        </div>
        <span>{{ Math.floor(currentTime) }}s / {{ Math.floor(duration) }}s</span>
      </div>
      <label class="inline-flex items-center gap-2 font-bold">
        <input
          class="h-4 w-4 accent-cyan-500"
          type="checkbox"
          :checked="lowDataMode"
          @change="setLowDataMode($event.target.checked)"
        />
        Low Data Mode
      </label>
    </div>

    <div v-else class="flex flex-wrap items-center justify-between gap-3 bg-slate-950 px-4 py-3 text-sm text-slate-300">
      <label class="inline-flex items-center gap-2 font-bold">
        <input
          class="h-4 w-4 accent-cyan-500"
          type="checkbox"
          :checked="lowDataMode"
          @change="setLowDataMode($event.target.checked)"
        />
        Low Data Mode
      </label>
      <span>{{ Math.floor(currentTime) }}s / {{ Math.floor(duration) }}s</span>
    </div>

    <div v-if="sourceError" class="flex flex-wrap items-center justify-between gap-3 bg-red-900/80 px-4 py-3 text-sm font-bold text-white" role="alert">
      <span>{{ sourceError }}</span>
      <button class="rounded-lg bg-white px-3 py-1.5 text-sm font-black text-red-900" type="button" @click="retryPlayback">
        Retry
      </button>
    </div>
  </section>
</template>
