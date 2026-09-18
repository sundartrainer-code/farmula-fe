<script setup>
import { computed, ref } from "vue"
import { useLmsStore } from "../stores/lms"

const lms = useLmsStore()
const buyingPlanId = ref("")
const purchaseError = ref("")

const plans = computed(() => [...lms.plans].sort((a, b) => Number(a.durationMonths) - Number(b.durationMonths)))

const features = {
  1: ["All video lessons", "Progress dashboard"],
  2: ["All video lessons", "Priority course access"],
  3: ["All video lessons", "Best value access", "New course releases"],
}

async function choosePlan(plan) {
  buyingPlanId.value = plan.id
  purchaseError.value = ""
  try {
    await lms.purchasePlan(plan)
    await lms.loadDashboard()
  } catch (error) {
    purchaseError.value = error.response?.data?.message || error.message || "Unable to activate subscription"
  } finally {
    buyingPlanId.value = ""
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl rounded-lg bg-white px-5 py-12 text-slate-950 shadow-2xl dark:bg-slate-950 dark:text-white sm:px-8 lg:px-10">
    <div class="text-center">
      <p class="text-sm font-black uppercase text-cyan-400">Subscription Required</p>
      <h1 class="mt-3 text-4xl font-black sm:text-5xl">Choose your subscription</h1>
      <p class="mt-4 text-base font-medium text-slate-400">Subscribe to unlock courses, lessons, videos, and progress tracking.</p>
    </div>

    <p v-if="purchaseError" class="mx-auto mt-8 max-w-2xl rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-center font-bold text-red-200">
      {{ purchaseError }}
    </p>

    <div class="mt-10 grid gap-6 lg:grid-cols-3">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="relative flex min-h-[31rem] flex-col rounded-lg border bg-slate-50 p-8 shadow-xl dark:bg-slate-900/70"
        :class="Number(plan.durationMonths) === 3 ? 'border-cyan-400 lg:-mt-6 lg:min-h-[34rem]' : 'border-slate-200 dark:border-slate-700'"
      >
        <span v-if="Number(plan.durationMonths) === 3" class="absolute right-8 top-6 rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-slate-950">Recommended</span>
        <h2 class="text-3xl font-black">{{ plan.name }}</h2>
        <p class="mt-10 text-6xl font-black">₹{{ plan.price }}</p>
        <p class="mt-3 text-sm font-bold uppercase text-slate-400">{{ plan.durationMonths }} month{{ Number(plan.durationMonths) > 1 ? "s" : "" }} access</p>
        <ul class="mt-10 space-y-4 text-slate-700 dark:text-slate-300">
          <li v-for="feature in features[Number(plan.durationMonths)] || features[1]" :key="feature" class="flex items-center gap-3">
            <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-400/15 text-sm font-black text-cyan-300">✓</span>
            <span class="font-semibold">{{ feature }}</span>
          </li>
        </ul>
        <button
          class="mt-auto w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-4 font-black text-white shadow-lg shadow-cyan-950/30 transition hover:from-cyan-300 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="buyingPlanId === plan.id"
          type="button"
          @click="choosePlan(plan)"
        >
          {{ buyingPlanId === plan.id ? "Activating..." : "Choose Plan" }}
        </button>
      </article>
    </div>
  </section>
</template>
