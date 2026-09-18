<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import SecureVideoPlayer from "../components/video/SecureVideoPlayer.vue"
import { useAuthStore } from "../stores/auth"

const auth = useAuthStore()
const router = useRouter()
const showLoginModal = ref(false)
const demoStarted = ref(false)

const demoVideoUrl = import.meta.env.VITE_DEMO_VIDEO_URL || "/demo-video.mp4"

async function login() {
  await auth.loginWithGoogle()
  router.push("/courses")
}

function openLoginModal() {
  showLoginModal.value = true
}

function handleDemoPlay() {
  if (demoStarted.value) return
  demoStarted.value = true
  window.setTimeout(openLoginModal, 4500)
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
    <section class="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_.95fr]">
      <div>
        <div class="flex items-center gap-3">
          <div class="grid h-12 w-12 place-items-center rounded-lg bg-cyan-500 font-black text-white">F</div>
          <div>
            <p class="text-3xl font-black">Formula</p>
            <p class="text-sm text-slate-400">Premium learning platform</p>
          </div>
        </div>

        <p class="mt-12 text-sm font-black uppercase tracking-wide text-cyan-400">About Formula</p>
        <h1 class="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
          Learn with focused video lessons and structured course progress.
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Formula helps students study through organized video lessons, subscription access, progress tracking, and a distraction-free learning dashboard.
        </p>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div class="overflow-hidden rounded-lg bg-black">
          <SecureVideoPlayer
            v-if="demoVideoUrl"
            :source-url="demoVideoUrl"
            @started="handleDemoPlay"
            @ended="openLoginModal"
          />
          <div v-else class="grid aspect-video place-items-center p-6 text-center text-slate-400">
            Demo video URL is not configured.
          </div>
        </div>

        <button class="btn-primary mt-5 w-full" :disabled="auth.loading" type="button" @click="openLoginModal">
          {{ auth.loading ? "Connecting..." : "Continue with Google" }}
        </button>
      </div>
    </section>

    <div v-if="showLoginModal" class="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5">
      <section class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <button class="ml-auto block rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" type="button" @click="showLoginModal = false">
          Close
        </button>
        <p class="mt-2 text-sm font-black uppercase tracking-wide text-cyan-400">Continue learning</p>
        <h2 class="mt-3 text-3xl font-black">Login with Google</h2>
        <p class="mt-3 text-slate-400">Sign in to unlock the full Formula course dashboard.</p>

        <p v-if="auth.error" class="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
          {{ auth.error }}
        </p>

        <button class="btn-primary mt-7 w-full" :disabled="auth.loading" type="button" @click="login">
          {{ auth.loading ? "Connecting..." : "Continue with Google" }}
        </button>
      </section>
    </div>
  </main>
</template>
