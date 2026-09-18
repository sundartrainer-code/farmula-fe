import { defineStore } from "pinia"
import { api } from "../services/api"

export const useVideoStore = defineStore("videos", {
  state: () => ({ videos: [], loading: false, error: null }),
  actions: {
    async load() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get("/api/videos")
        const videos = Array.isArray(data) ? data : []
        this.videos = videos
        return this.videos
      } catch (error) {
        console.error("Unable to load videos from the API.", error)
        this.error = "Unable to load videos.\n\nPlease try again later."
        throw error
      } finally {
        this.loading = false
      }
    },
    updateProgress(id, watchedSeconds, completed = false) {
      const video = this.videos.find((item) => item.id === id)
      if (!video) return
      video.watchedSeconds = Math.max(0, Number(watchedSeconds || 0))
      video.progressPercent = completed
        ? 100
        : video.durationSeconds
          ? Math.min(100, Math.round((video.watchedSeconds / video.durationSeconds) * 100))
          : 0
      video.completed = completed
      video.lastWatchedAt = new Date().toISOString()
    },
  },
})
