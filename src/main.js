import { createApp } from "vue"
import { createPinia } from "pinia"
import "./assets/main.css"
import App from "./App.vue"
import router from "./router"
import { useAuthStore } from "./stores/auth"

const savedTheme = localStorage.getItem("formula_theme")
document.documentElement.classList.toggle("dark", savedTheme !== "light")

const app = createApp(App)
const pinia = createPinia()

if (import.meta.env.PROD) {
  app.config.devtools = false
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
}

app.use(pinia)
app.use(router)

document.addEventListener("contextmenu", (event) => event.preventDefault())
document.addEventListener("dragstart", (event) => {
  if (event.target instanceof HTMLImageElement || event.target instanceof HTMLVideoElement) {
    event.preventDefault()
  }
})

app.mount("#app")

queueMicrotask(() => {
  useAuthStore().hydrate().catch(() => {})
})
