import { storeToRefs } from "pinia"
import { useAuthStore } from "../stores/auth"

export function useAuth() {
  const auth = useAuthStore()
  const { user, loading, error } = storeToRefs(auth)
  return {
    user,
    loading,
    error,
    isAuthenticated: auth.isAuthenticated,
    loginWithGoogle: auth.loginWithGoogle,
    logout: auth.logout,
    hydrate: auth.hydrate
  }
}
