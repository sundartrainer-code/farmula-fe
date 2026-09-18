import { defineStore } from "pinia"
import { api } from "../services/api"

let activeDashboardRequest = null

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    data: null,
    loading: false,
    error: null,
    loadedAt: 0,
  }),
  getters: {
    active: (state) => Boolean(state.data?.subscription?.active),
    subscription: (state) => state.data?.subscription || { active: false },
    courses: (state) => state.data?.courses || [],
    recentVideos: (state) => state.data?.recentVideos || [],
    stats: (state) => state.data?.stats || { totalCourses: 0, totalLessons: 0 },
  },
  actions: {
    async load({ force = false } = {}) {
      if (!force && this.data && Date.now() - this.loadedAt < 60000) return this.data
      if (activeDashboardRequest) return activeDashboardRequest
      this.loading = true
      this.error = null
      activeDashboardRequest = (async () => {
        try {
          const { data } = await api.get("/api/dashboard")
          this.data = data
          this.loadedAt = Date.now()
          return data
        } catch (error) {
          if (error.response?.status === 403) {
            this.data = { subscription: { active: false }, courses: [], recentVideos: [] }
            this.loadedAt = Date.now()
            return this.data
          }
          this.error = error.response?.data?.message || "Unable to load dashboard"
          throw error
        } finally {
          this.loading = false
          activeDashboardRequest = null
        }
      })()
      return activeDashboardRequest
    },
  },
})
