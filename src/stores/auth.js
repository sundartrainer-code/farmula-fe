import { defineStore } from "pinia"
import { api } from "../services/api"
import { currentFirebaseIdToken, listenForAuth, loginWithGooglePopup, logoutFirebase } from "../services/firebase"
import { useDashboardStore } from "./dashboard"

const USER_KEY = "formula_user"

function mapFirebaseUser(user) {
  if (!user) return null
  return {
    firebaseUid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

function mergeBackendUser(firebaseUser, backendUser) {
  return {
    ...mapFirebaseUser(firebaseUser),
    ...(backendUser || {}),
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem(USER_KEY) || "null"),
    loading: false,
    error: null,
    unsubscribe: null,
    initialized: false,
    readyPromise: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
  },
  actions: {
    hydrate() {
      if (this.readyPromise) return this.readyPromise
      this.loading = true
      this.readyPromise = new Promise((resolve) => {
        this.unsubscribe = listenForAuth(async (firebaseUser) => {
          this.user = mapFirebaseUser(firebaseUser)
          if (this.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(this.user))
          } else {
            localStorage.removeItem(USER_KEY)
          }

          this.initialized = true
          this.loading = false
          resolve(this.user)

          if (!this.user) return

          const response = await api.get("/auth/me").catch(() => null)
          if (response?.data?.user) {
            this.user = mergeBackendUser(firebaseUser, response.data.user)
            localStorage.setItem(USER_KEY, JSON.stringify(this.user))
          }
          useDashboardStore().load({ force: true }).catch(() => {})
        })
      })
      return this.readyPromise
    },
    async loginWithGoogle() {
      this.loading = true
      this.error = null
      try {
        const { user } = await loginWithGooglePopup()
        this.user = mapFirebaseUser(user)
        const { data } = await api.get("/auth/me")
        this.user = mergeBackendUser(user, data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        await useDashboardStore().load({ force: true }).catch(() => {})
        return this.user
      } catch (error) {
        this.error = error.response?.data?.message || error.message || "Google sign-in failed"
        throw error
      } finally {
        this.loading = false
      }
    },
    async getIdToken() {
      return currentFirebaseIdToken()
    },
    async logout() {
      await api.post("/auth/logout").catch(() => {})
      await logoutFirebase()
      this.user = null
      localStorage.removeItem(USER_KEY)
    },
  },
})
