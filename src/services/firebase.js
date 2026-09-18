import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAOveZOhmyzvdO2B1wVU550CkC7GvAYA7c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "formula-41507.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "formula-41507",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "formula-41507.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1022623381940",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1022623381940:web:b6fd1a0c7a47ff7b829ae1",
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

let authReadyPromise
let tokenPromise

export function listenForAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export function waitForAuthReady() {
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }
  return authReadyPromise
}

export async function currentFirebaseIdToken() {
  const user = auth.currentUser || await waitForAuthReady()
  if (!user) return null
  if (!tokenPromise) {
    tokenPromise = user.getIdToken().finally(() => {
      tokenPromise = null
    })
  }
  return tokenPromise
}

export function loginWithGooglePopup() {
  return signInWithPopup(auth, googleProvider)
}

export function logoutFirebase() {
  return signOut(auth)
}

export function currentFirebaseUser() {
  return auth.currentUser
}
