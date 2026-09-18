import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"

const SKIP_SECONDS = 10
const PROGRESS_INTERVAL_MS = 10000
const CONTROLS_IDLE_MS = 3000

export function useVideoPlayer({ startSeconds = ref(0), onProgress, onCompleted } = {}) {
  const videoRef = ref(null)
  const playerRef = ref(null)
  const isPlaying = ref(false)
  const isMuted = ref(false)
  const isLoading = ref(true)
  const isBuffering = ref(false)
  const isFullscreen = ref(false)
  const showControls = ref(true)
  const showSecurityWarning = ref(false)
  const securityWarning = ref("")
  const currentTime = ref(0)
  const duration = ref(0)
  const videoHeight = ref(0)
  const bufferedEnd = ref(0)
  const volume = ref(1)
  const playbackRate = ref(1)
  const hasStarted = ref(false)

  let progressTimer
  let hideControlsTimer
  let devtoolsTimer
  let fullscreenHandler
  let hlsInstance

  const remainingTime = computed(() => Math.max(0, duration.value - currentTime.value))
  const progressPercent = computed(() => duration.value ? (currentTime.value / duration.value) * 100 : 0)
  const bufferedPercent = computed(() => duration.value ? (bufferedEnd.value / duration.value) * 100 : 0)
  const canReplay = computed(() => duration.value > 0 && currentTime.value >= Math.max(0, duration.value - 1))
  const sourceQualityLabel = computed(() => {
    const height = videoHeight.value
    if (!height) return "Auto"
    if (height >= 2000) return "2160p"
    if (height >= 1300) return "1440p"
    if (height >= 900) return "1080p"
    if (height >= 650) return "720p"
    if (height >= 430) return "480p"
    return `${height}p`
  })

  function formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds || 0))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const secs = String(total % 60).padStart(2, "0")
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${secs}`
    return `${minutes}:${secs}`
  }

  function syncFromVideo() {
    const video = videoRef.value
    if (!video) return
    currentTime.value = video.currentTime || 0
    duration.value = Number.isFinite(video.duration) ? video.duration : 0
    videoHeight.value = video.videoHeight || 0
    isMuted.value = video.muted
    volume.value = video.volume
    playbackRate.value = video.playbackRate

    if (video.buffered?.length) {
      bufferedEnd.value = video.buffered.end(video.buffered.length - 1)
    }
  }

  function seekToStart() {
    const video = videoRef.value
    const requestedStart = Math.max(0, Number(startSeconds.value || 0))
    if (!video || requestedStart <= 0) return
    const safeDuration = Number.isFinite(video.duration) ? video.duration : 0
    video.currentTime = safeDuration ? Math.min(requestedStart, Math.max(0, safeDuration - 2)) : requestedStart
    syncFromVideo()
  }

  async function play() {
    const video = videoRef.value
    if (!video) return
    try {
      await video.play()
      hasStarted.value = true
    } catch {
      isLoading.value = false
      throw new Error("Video source is not playable")
    }
  }

  function pause() {
    videoRef.value?.pause()
  }

  async function togglePlay() {
    const video = videoRef.value
    if (!video) return
    if (video.paused) await play().catch(() => {})
    else pause()
  }

  async function replay() {
    const video = videoRef.value
    if (!video) return
    video.currentTime = 0
    await play().catch(() => {})
  }

  function seek(value) {
    const video = videoRef.value
    if (!video || !duration.value) return
    video.currentTime = Math.min(duration.value, Math.max(0, Number(value)))
    syncFromVideo()
  }

  function seekBy(seconds) {
    const video = videoRef.value
    if (!video) return
    seek((video.currentTime || 0) + seconds)
  }

  function setVolume(value) {
    const video = videoRef.value
    if (!video) return
    const nextVolume = Math.min(1, Math.max(0, Number(value)))
    video.volume = nextVolume
    video.muted = nextVolume === 0
    syncFromVideo()
  }

  function toggleMute() {
    const video = videoRef.value
    if (!video) return
    video.muted = !video.muted
    if (!video.muted && video.volume === 0) video.volume = 0.6
    syncFromVideo()
  }

  function setPlaybackRate(value) {
    const video = videoRef.value
    if (!video) return
    const nextRate = Math.min(2, Math.max(0.5, Number(value)))
    video.playbackRate = nextRate
    playbackRate.value = nextRate
  }

  async function toggleFullscreen() {
    const root = playerRef.value
    if (!root) return
    if (!document.fullscreenElement) await root.requestFullscreen?.()
    else await document.exitFullscreen?.()
  }

  function saveProgress(completed = false) {
    const position = Math.floor(videoRef.value?.currentTime || 0)
    if (completed) onCompleted?.(position)
    else onProgress?.(position)
  }

  function startProgressTimer() {
    window.clearInterval(progressTimer)
    progressTimer = window.setInterval(() => saveProgress(false), PROGRESS_INTERVAL_MS)
  }

  function revealControls() {
    showControls.value = true
    window.clearTimeout(hideControlsTimer)
    if (isPlaying.value) {
      hideControlsTimer = window.setTimeout(() => {
        showControls.value = false
      }, CONTROLS_IDLE_MS)
    }
  }

  function showWarning(message) {
    securityWarning.value = message
    showSecurityWarning.value = true
    window.setTimeout(() => {
      showSecurityWarning.value = false
    }, 2800)
  }

  function blockInteraction(event) {
    event.preventDefault()
    showWarning("This learning video is protected.")
  }

  function handleKeydown(event) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return
    const key = event.key.toLowerCase()
    const handled = [" ", "arrowleft", "arrowright", "f", "m"].includes(key)
    if (handled) event.preventDefault()
    if (event.key === "PrintScreen") showWarning("Screen capture may violate course access rules.")
    if (!handled) return
    revealControls()
    if (key === " ") togglePlay()
    if (key === "arrowleft") seekBy(-SKIP_SECONDS)
    if (key === "arrowright") seekBy(SKIP_SECONDS)
    if (key === "f") toggleFullscreen()
    if (key === "m") toggleMute()
  }

  function handleVisibilityChange() {
    if (document.hidden) showWarning("Playback is protected while the tab is inactive.")
  }

  function handleBlur() {
    showWarning("Playback is protected while the window is inactive.")
  }

  function detectDevTools() {
    const threshold = 180
    const widthGap = window.outerWidth - window.innerWidth
    const heightGap = window.outerHeight - window.innerHeight
    if (widthGap > threshold || heightGap > threshold) showWarning("Developer tools detected. Video access is monitored.")
  }

  function bindVideoElement() {
    const video = videoRef.value
    if (!video) return
    video.controls = false
    video.disablePictureInPicture = true
    video.disableRemotePlayback = true
    video.controlsList?.add?.("nodownload")
    video.controlsList?.add?.("noplaybackrate")
    video.controlsList?.add?.("nofullscreen")
    video.draggable = false
    video.volume = volume.value
    video.playbackRate = playbackRate.value
  }

  function attachSource(url, type) {
    const video = videoRef.value
    destroyHls()
    if (!video || !url) return false

    if (type === "hls" && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url
      return true
    }

    if (type === "hls") {
      import("hls.js").then(({ default: Hls }) => {
        if (!videoRef.value || videoRef.value !== video || !Hls.isSupported()) {
          isLoading.value = false
          return
        }
        hlsInstance = new Hls({
          startLevel: -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 18,
          maxMaxBufferLength: 30,
          enableWorker: true,
        })
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const preferredLevel = data.levels
            .map((level, index) => ({ index, height: level.height || 0 }))
            .filter((level) => level.height <= 720)
            .sort((left, right) => right.height - left.height)[0]
          if (preferredLevel) hlsInstance.startLevel = preferredLevel.index
        })
        hlsInstance.loadSource(url)
        hlsInstance.attachMedia(video)
      })
      return false
    }

    video.src = url
    return true
  }

  function destroyHls() {
    hlsInstance?.destroy()
    hlsInstance = null
  }

  function setRuntimeSource(url, resumeSeconds = currentTime.value, type = "mp4") {
    const video = videoRef.value
    if (!video || !url) return
    const wasPlaying = !video.paused
    video.addEventListener("loadedmetadata", () => {
      if (resumeSeconds > 0) video.currentTime = resumeSeconds
      syncFromVideo()
      if (wasPlaying) video.play().catch(() => {})
    }, { once: true })
    if (attachSource(url, type)) video.load()
  }

  function clearRuntimeSource() {
    const video = videoRef.value
    if (!video) return
    video.pause()
    destroyHls()
    video.removeAttribute("src")
    video.load()
  }

  onMounted(() => {
    nextTick(bindVideoElement)
    startProgressTimer()
    window.addEventListener("keydown", handleKeydown)
    window.addEventListener("blur", handleBlur)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    fullscreenHandler = () => {
      isFullscreen.value = Boolean(document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", fullscreenHandler)
    devtoolsTimer = window.setInterval(detectDevTools, 2500)
  })

  onBeforeUnmount(() => {
    saveProgress(false)
    window.clearInterval(progressTimer)
    window.clearInterval(devtoolsTimer)
    window.clearTimeout(hideControlsTimer)
    window.removeEventListener("keydown", handleKeydown)
    window.removeEventListener("blur", handleBlur)
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    if (fullscreenHandler) document.removeEventListener("fullscreenchange", fullscreenHandler)
    clearRuntimeSource()
  })

  watch(isPlaying, revealControls)

  return {
    videoRef,
    playerRef,
    isPlaying,
    isMuted,
    isLoading,
    isBuffering,
    isFullscreen,
    showControls,
    showSecurityWarning,
    securityWarning,
    currentTime,
    duration,
    sourceQualityLabel,
    remainingTime,
    bufferedPercent,
    progressPercent,
    volume,
    playbackRate,
    canReplay,
    formatTime,
    syncFromVideo,
    seekToStart,
    play,
    pause,
    togglePlay,
    replay,
    seek,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    saveProgress,
    revealControls,
    blockInteraction,
    setRuntimeSource,
    clearRuntimeSource,
  }
}
