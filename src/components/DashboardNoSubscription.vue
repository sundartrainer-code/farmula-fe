<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useDashboardStore } from "../stores/dashboard"
import { useLmsStore } from "../stores/lms"

const lms = useLmsStore()
const dashboard = useDashboardStore()
const router = useRouter()
const buyingPlanId = ref("")
const purchaseError = ref("")

const plans = computed(() => [...lms.plans].sort((a, b) => Number(a.durationMonths) - Number(b.durationMonths)))
const recommendedPlan = computed(() => plans.value.find((plan) => Number(plan.durationMonths) === 3) || plans.value[0])

const previewRef = ref(null)
const previewPlaying = ref(false)
const previewMuted = ref(true)
const previewVideoId = "VuekRLsIKi0"
let previewPlayer
let youtubeApiPromise

const planFeatures = {
  1: ["All video lessons", "Progress dashboard"],
  2: ["All video lessons", "Priority course access"],
  3: ["Best value access", "New course releases"],
}

async function choosePlan(plan) {
  if (!plan?.id) return
  buyingPlanId.value = plan.id
  purchaseError.value = ""
  try {
    await lms.purchasePlan(plan)
    await Promise.all([
      lms.loadDashboard(),
      dashboard.load({ force: true }),
    ])
  } catch (error) {
    purchaseError.value = error.response?.data?.message || error.message || "Unable to activate subscription"
  } finally {
    buyingPlanId.value = ""
  }
}

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

async function mountPreviewPlayer() {
  if (!previewRef.value) return
  const YT = await loadYouTubeApi()
  if (!previewRef.value) return

  previewPlayer = new YT.Player(previewRef.value, {
    videoId: previewVideoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady(event) {
        event.target.mute?.()
        previewMuted.value = true
        event.target.playVideo?.()
      },
      onStateChange(event) {
        previewPlaying.value = event.data === YT.PlayerState.PLAYING
      },
    },
  })
}

function togglePreviewPlayback() {
  if (!previewPlayer?.getPlayerState) return
  if (previewMuted.value) {
    previewPlayer.unMute?.()
    previewPlayer.setVolume?.(80)
    previewMuted.value = false
  }
  const isPlaying = previewPlayer.getPlayerState() === window.YT?.PlayerState?.PLAYING
  if (isPlaying) previewPlayer.pauseVideo?.()
  else previewPlayer.playVideo?.()
}

function togglePreviewSound() {
  if (!previewPlayer) return
  if (previewMuted.value) {
    previewPlayer.unMute?.()
    previewPlayer.setVolume?.(80)
    previewMuted.value = false
    previewPlayer.playVideo?.()
  } else {
    previewPlayer.mute?.()
    previewMuted.value = true
  }
}

onMounted(mountPreviewPlayer)

onBeforeUnmount(() => {
  if (previewPlayer?.destroy) previewPlayer.destroy()
  previewPlayer = null
})
</script>

<template>
  <section class="space-y-8">
    <div class="grid items-stretch gap-6 xl:grid-cols-[minmax(28rem,0.85fr)_minmax(0,1.15fr)]">
      <div class="h-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20">
        <div class="relative aspect-video bg-slate-950">
          <div ref="previewRef" class="h-full w-full" />
          <button
            class="absolute inset-0 z-10 cursor-pointer bg-transparent"
            type="button"
            aria-label="Play or pause preview video"
            @click="togglePreviewPlayback"
            @contextmenu.prevent
          >
            <span class="sr-only">Play or pause preview video</span>
          </button>
          <div
            v-if="!previewPlaying"
            class="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-black/10"
          >
            <span class="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-2xl font-black text-slate-950 shadow-xl">
              ▶
            </span>
          </div>
          <button
            class="absolute bottom-3 right-3 z-30 rounded-full bg-black/70 px-3 py-2 text-xs font-black text-white shadow-lg transition hover:bg-black"
            type="button"
            :aria-label="previewMuted ? 'Turn preview sound on' : 'Mute preview sound'"
            @click.stop="togglePreviewSound"
          >
            {{ previewMuted ? "Sound On" : "Mute" }}
          </button>
        </div>
      </div>

      <div class="relative h-full rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20 sm:p-7 lg:p-8">
        <div class="absolute right-5 top-5 hidden h-10 w-10 place-items-center rounded-xl bg-cyan-400 shadow-lg shadow-cyan-950/20 sm:right-7 sm:top-7 sm:grid sm:h-12 sm:w-12">
          <img class="h-8 w-8" src="/favicon-32x32.png" alt="Formula" />
        </div>
        <div class="sm:pr-14">
          <div class="min-w-0">
            <p class="hidden max-w-[calc(100%-0.5rem)] text-xs font-black uppercase tracking-[0.14em] text-cyan-500 dark:text-cyan-300 sm:block sm:text-sm sm:tracking-[0.18em]">Subscription Required</p>
            <h1 class="mt-3 text-3xl font-black tracking-normal text-slate-950 dark:text-white sm:text-5xl">Unlock Formula Learning</h1>
            <p class="mt-4 text-base font-semibold leading-7 text-slate-500 dark:text-slate-400 sm:text-lg sm:leading-8">
              Choose a plan to access secure video lessons, progress tracking, and premium learning tools.
            </p>
            <div class="mt-6 flex flex-col gap-3 sm:max-w-md xl:max-w-none xl:flex-row xl:items-center xl:justify-between">
              <button
                class="w-full shrink-0 rounded-lg bg-cyan-400 px-6 py-4 text-base font-black text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                type="button"
                @click="router.push('/pricing')"
              >
                Choose Plan
              </button>
              <div class="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60 sm:px-5 sm:py-4">
                <span class="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span class="text-sm font-bold text-slate-500 dark:text-slate-300 sm:whitespace-nowrap">Subscribe anytime to continue learning.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="purchaseError" class="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-center font-bold text-red-300">
      {{ purchaseError }}
    </p>

    <div class="grid gap-6 lg:grid-cols-3">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="relative flex min-h-80 flex-col rounded-[1.125rem] border bg-white p-7 shadow-xl shadow-slate-950/5 transition hover:-translate-y-1 hover:border-cyan-400/70 dark:bg-slate-900/70 dark:shadow-black/20"
        :class="Number(plan.durationMonths) === 3 ? 'border-cyan-400 dark:bg-cyan-950/20' : 'border-slate-200 dark:border-slate-800'"
      >
        <span v-if="Number(plan.durationMonths) === 3" class="absolute right-7 top-7 rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-slate-950">Recommended</span>
        <h2 class="pr-28 text-3xl font-black text-slate-950 dark:text-white">{{ plan.name }}</h2>
        <p class="mt-10 text-6xl font-black text-slate-950 dark:text-white">₹{{ plan.price }}</p>
        <p class="mt-3 text-sm font-black uppercase text-slate-400">
          {{ plan.durationMonths }} month{{ Number(plan.durationMonths) > 1 ? "s" : "" }} access
        </p>
        <ul class="mt-8 space-y-4">
          <li v-for="feature in planFeatures[Number(plan.durationMonths)] || planFeatures[1]" :key="feature" class="flex items-center gap-3">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-sm font-black text-cyan-500 dark:text-cyan-300">✓</span>
            <span class="font-bold text-slate-600 dark:text-slate-300">{{ feature }}</span>
          </li>
        </ul>
        <button
          class="mt-auto rounded-lg border border-slate-200 px-5 py-4 font-black text-slate-900 transition hover:border-cyan-400 hover:bg-cyan-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-white dark:hover:border-cyan-400 dark:hover:bg-cyan-400 dark:hover:text-slate-950"
          type="button"
          :disabled="buyingPlanId === plan.id"
          @click="choosePlan(plan)"
        >
          {{ buyingPlanId === plan.id ? "Opening..." : "Select" }}
        </button>
      </article>
    </div>
  </section>
</template>
