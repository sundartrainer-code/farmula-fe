import { ref } from "vue"

export function useAsync(fn) {
  const loading = ref(false)
  const error = ref(null)
  const run = async (...args) => {
    loading.value = true
    error.value = null
    try {
      return await fn(...args)
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }
  return { loading, error, run }
}
