import { computed, ref } from "vue"
import { api } from "../services/api"

export function useVideoUpload() {
  const progress = ref(0)
  const loading = ref(false)
  const success = ref(false)
  const error = ref("")
  const controller = ref(null)

  const canRetry = computed(() => Boolean(error.value))

  async function upload({ courseId, file, replace = false }) {
    if (!courseId) throw new Error("courseId is required")
    if (!file) throw new Error("file is required")

    progress.value = 0
    loading.value = true
    success.value = false
    error.value = ""
    controller.value = new AbortController()

    const formData = new FormData()
    formData.append("file", file)
    if (!replace) formData.append("courseId", courseId)

    try {
      const endpoint = replace ? `/api/storage/${courseId}` : "/api/storage/upload"
      const method = replace ? "put" : "post"
      const { data } = await api.request({
        url: endpoint,
        method,
        data: formData,
        signal: controller.value.signal,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress(event) {
          if (!event.total) return
          progress.value = Math.round((event.loaded / event.total) * 100)
        },
      })

      success.value = true
      return data
    } catch (uploadError) {
      if (uploadError.name === "CanceledError" || uploadError.code === "ERR_CANCELED") {
        error.value = "Upload cancelled."
      } else {
        error.value = uploadError.response?.data?.message || "Unable to upload video."
      }
      throw uploadError
    } finally {
      loading.value = false
      controller.value = null
    }
  }

  function cancel() {
    controller.value?.abort()
  }

  async function retry(payload) {
    return upload(payload)
  }

  return {
    progress,
    loading,
    success,
    error,
    canRetry,
    upload,
    cancel,
    retry,
  }
}
