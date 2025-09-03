
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASQdYasDLzM-cE_TA28DunCt54CMVvbCA",
  authDomain: "vlearn-ashlin.firebaseapp.com",
  projectId: "vlearn-ashlin",
  storageBucket: "vlearn-ashlin.firebasestorage.app",
  messagingSenderId: "856597342573",
  appId: "1:856597342573:web:c3dc709f4637d694b3d264",
  measurementId: "G-WVSWMT0XVX"
}

const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// For demo purposes, we'll disable analytics to avoid API errors
export const analytics = null

export default app
