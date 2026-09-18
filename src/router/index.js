import { createRouter, createWebHistory } from "vue-router"
import AuthView from "../views/AuthView.vue"
import { useAuthStore } from "../stores/auth"
import { useDashboardStore } from "../stores/dashboard"

const CoursesView = () => import("../views/CoursesView.vue")
const CourseDetailView = () => import("../views/CourseDetailView.vue")
const LessonView = () => import("../views/LessonView.vue")
const PricingView = () => import("../views/PricingView.vue")
const VideosView = () => import("../views/Videos.vue")
const ProfileView = () => import("../views/Profile.vue")
const SettingsView = () => import("../views/Settings.vue")
const AdminView = () => import("../views/AdminView.vue")

const routes = [
  { path: "/", redirect: "/courses" },
  { path: "/login", name: "login", component: AuthView, meta: { guest: true, title: "Login" } },
  { path: "/courses", name: "courses", component: CoursesView, meta: { private: true, title: "Dashboard" } },
  { path: "/videos", name: "videos", component: VideosView, meta: { private: true, activeOnly: true, title: "Videos" } },
  { path: "/courses/:courseId", name: "course-detail", component: CourseDetailView, meta: { private: true, activeOnly: true, title: "Course Details" } },
  { path: "/lessons/:lessonId", name: "lesson", component: LessonView, meta: { private: true, activeOnly: true, title: "Lesson" } },
  { path: "/pricing", name: "pricing", component: PricingView, meta: { private: true, title: "Pricing" } },
  { path: "/profile", name: "profile", component: ProfileView, meta: { private: true, title: "Profile" } },
  { path: "/settings", name: "settings", component: SettingsView, meta: { private: true, title: "Settings" } },
  { path: "/admin", name: "admin", component: AdminView, meta: { private: true, adminOnly: true, title: "Admin" } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if ((to.meta.private || to.meta.guest) && !auth.initialized) {
    await auth.hydrate().catch(() => null)
  }
  if (to.meta.private && !auth.isAuthenticated) return "/login"
  if (to.meta.guest && auth.isAuthenticated) return "/courses"
  if (to.meta.adminOnly && auth.user?.role !== "admin") return "/courses"
  if (to.meta.activeOnly) {
    const dashboard = useDashboardStore()
    if (dashboard.data && !dashboard.active) return "/pricing"
    if (!dashboard.data) {
      const targetPath = to.fullPath
      dashboard.load().then(() => {
        if (!dashboard.active && router.currentRoute.value.fullPath === targetPath) {
          router.replace("/pricing")
        }
      }).catch(() => {})
    }
  }
})

export default router
