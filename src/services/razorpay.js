const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js"

let checkoutScriptPromise

export function razorpayKeyId() {
  return import.meta.env.VITE_RAZORPAY_KEY_ID
}

export function maskRazorpayKey(value) {
  if (!value) return "missing"
  return `${value.slice(0, 8)}...${value.slice(-4)}`
}

export function razorpayKeyMode(value) {
  if (value?.startsWith("rzp_live_")) return "live"
  if (value?.startsWith("rzp_test_")) return "test"
  return "unknown"
}

export async function loadRazorpayCheckout() {
  if (window.Razorpay) return true
  if (!checkoutScriptPromise) {
    checkoutScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = CHECKOUT_SCRIPT_URL
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout"))
      document.body.appendChild(script)
    })
  }
  return checkoutScriptPromise
}

export async function openRazorpayCheckout(options) {
  await loadRazorpayCheckout()
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      ...options,
      handler: resolve,
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    })

    checkout.on("payment.failed", (response) => {
      console.error("Razorpay payment failed", response.error)
      reject(new Error(response.error?.description || "Payment failed"))
    })

    checkout.open()
  })
}
