import axios from "axios"
import { currentFirebaseIdToken } from "./firebase"

const productionApiBaseUrl = "/backend"
const developmentApiBaseUrl = "http://localhost:8081"
const apiBaseUrl = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || developmentApiBaseUrl
  : productionApiBaseUrl

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 35000,
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  const token = await currentFirebaseIdToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const retryable = config
      && config.method?.toLowerCase() === "get"
      && (!error.response || error.response.status >= 500)
      && (config.__retryCount || 0) < 2

    if (!retryable) return Promise.reject(error)

    config.__retryCount = (config.__retryCount || 0) + 1
    await new Promise((resolve) => window.setTimeout(resolve, 750 * config.__retryCount))
    return api(config)
  }
)
