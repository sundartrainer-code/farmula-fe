import { defineStore } from "pinia"
import { api } from "../services/api"
import { maskRazorpayKey, openRazorpayCheckout, razorpayKeyId } from "../services/razorpay"

export const useLmsStore = defineStore("lms", {
  state: () => ({
    courses: [],
    currentCourse: null,
    currentLesson: null,
    lessonProgress: null,
    dashboard: null,
    plans: [],
    subscriptionStatus: null,
    loading: false,
    error: null,
  }),
  actions: {
    async loadCourses() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get("/courses")
        this.courses = data.courses || []
        return this.courses
      } catch (error) {
        this.error = error.response?.data?.message || "Unable to load courses"
        throw error
      } finally {
        this.loading = false
      }
    },
    async loadDashboard() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get("/api/dashboard")
        this.dashboard = data
        this.courses = data.courses || []
        this.subscriptionStatus = {
          active: Boolean(data.subscription?.active),
          subscription: data.subscription,
        }
        return data
      } catch (error) {
        if (error.response?.status === 403) {
          this.dashboard = {
            subscription: { active: false },
            courses: [],
            recentLessons: [],
            resources: [],
          }
          this.courses = []
          this.subscriptionStatus = { active: false, subscription: null }
          return this.dashboard
        }
        this.error = error.response?.data?.message || "Unable to load dashboard"
        throw error
      } finally {
        this.loading = false
      }
    },
    async loadCourse(courseId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get(`/courses/${courseId}`)
        this.currentCourse = {
          course: data.course,
          purchased: data.course.purchased,
          lessons: data.course.lessons || [],
          progress: data.course.progress,
        }
        return this.currentCourse
      } catch (error) {
        this.error = error.response?.data?.message || "Unable to load course"
        throw error
      } finally {
        this.loading = false
      }
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
    async loadSubscriptionStatus() {
      const { data } = await api.get("/subscription/status")
      this.subscriptionStatus = data
      return data
    },
    async purchasePlan(plan) {
      const { data: order } = await api.post("/api/create-order", {
        plan_id: plan.id,
      })
      if (!order.order_id || !order.amount || !order.currency) {
        throw new Error("Payment order response is incomplete")
      }

      const configuredKey = razorpayKeyId()
      const key = order.key_id || configuredKey
      if (!key) throw new Error("Razorpay key is not configured")
      if (configuredKey && order.key_id && configuredKey !== order.key_id) {
        console.warn("Razorpay key mismatch; using backend order key", {
          frontendKey: maskRazorpayKey(configuredKey),
          backendKey: maskRazorpayKey(order.key_id),
        })
      }

      const payment = await openRazorpayCheckout({
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Formula LMS",
        description: `${plan.name} subscription`,
        order_id: order.order_id,
        theme: { color: "#06b6d4" },
      })

      const { data } = await api.post("/api/verify-payment", {
        plan_id: plan.id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_signature: payment.razorpay_signature,
      })
      await this.loadSubscriptionStatus()
      return data.subscription
    },
    async loadLesson(lessonId) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get(`/lesson/${lessonId}`)
        this.currentLesson = data.lesson
        this.lessonProgress = data.progress
        return data
      } catch (error) {
        this.error = error.response?.data?.message || "Unable to load lesson"
        throw error
      } finally {
        this.loading = false
      }
    },
    async saveProgress(lessonId, payload) {
      const { data } = await api.put(`/progress/${lessonId}`, payload)
      this.lessonProgress = data.progress
      return data.progress
    },
  },
})
