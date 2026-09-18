<script setup>
import SecureVideoPlayer from "./video/SecureVideoPlayer.vue"

defineProps({
  lessonId: { type: String, required: true },
  startSeconds: { type: Number, default: 0 },
  autoplay: { type: Boolean, default: false },
})

defineEmits(["progress", "completed", "ended"])
</script>

<template>
  <SecureVideoPlayer
    :lesson-id="lessonId"
    :start-seconds="startSeconds"
    :autoplay="autoplay"
    @progress="$emit('progress', $event)"
    @completed="$emit('completed', $event)"
    @ended="$emit('ended', $event)"
  />
</template>
