<script setup>
import { onMounted } from "vue"
import AppShell from "../components/AppShell.vue"
import SubscriptionPlans from "../components/SubscriptionPlans.vue"
import SkeletonCard from "../components/ui/SkeletonCard.vue"
import { useLmsStore } from "../stores/lms"

const lms = useLmsStore()

onMounted(() => lms.loadPlans())
</script>

<template>
  <AppShell>
    <SkeletonCard v-if="lms.loading" type="pricing" :count="3" />
    <SubscriptionPlans v-else />
  </AppShell>
</template>
