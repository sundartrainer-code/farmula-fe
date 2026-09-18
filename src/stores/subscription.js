import { defineStore } from "pinia"
import { api } from "../services/api"

export const useSubscriptionStore = defineStore("subscription", {
  state: () => ({ status: null, plans: [], loading: false, error: null }),
  actions: {
    async loadStatus() {
      const { data } = await api.get("/subscription/status")
      this.status = data
      return data
    },
    async loadPlans() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get("/subscription/plans")
        this.plans = data.plans || []
        return this.plans
      } catch (error) {
        this.error = error.response?.data?.message || "Unable to load plans"
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
