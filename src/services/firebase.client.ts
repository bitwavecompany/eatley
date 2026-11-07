import { initializeApp, type FirebaseApp, getApps } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'
import { getAuth, type Auth } from 'firebase/auth'
import { env } from '@/config/env'

let firebaseAppInstance: FirebaseApp | null = null
let firebaseDbInstance: Database | null = null
let firebaseAuthInstance: Auth | null = null

/**
 * Initializes and returns the Firebase App instance singleton.
 * Returns null if Firebase is not properly configured in .env.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!env.isFirebaseConfigured) {
    return null
  }

  if (!firebaseAppInstance) {
    const existingApps = getApps()
    if (existingApps.length > 0) {
      firebaseAppInstance = existingApps[0]
    } else {
      firebaseAppInstance = initializeApp({
        apiKey: env.firebase.apiKey,
        authDomain: env.firebase.authDomain,
        databaseURL: env.firebase.databaseURL,
        projectId: env.firebase.projectId,
        storageBucket: env.firebase.storageBucket,
        messagingSenderId: env.firebase.messagingSenderId,
        appId: env.firebase.appId,
        ...(env.firebase.measurementId ? { measurementId: env.firebase.measurementId } : {}),
      })
    }
  }

  return firebaseAppInstance
}

/**
 * Returns the Firebase Realtime Database instance singleton.
 * Returns null if Firebase is not properly configured in .env.
 */
export function getFirebaseDb(): Database | null {
  if (!env.isFirebaseConfigured) {
    return null
  }

  if (!firebaseDbInstance) {
    const app = getFirebaseApp()
    if (app) {
      firebaseDbInstance = getDatabase(app, env.firebase.databaseURL)
    }
  }

  return firebaseDbInstance
}

/**
 * Returns the Firebase Auth instance singleton.
 * Returns null if Firebase is not properly configured in .env.
 */
export function getFirebaseAuth(): Auth | null {
  if (!env.isFirebaseConfigured) {
    return null
  }

  if (!firebaseAuthInstance) {
    const app = getFirebaseApp()
    if (app) {
      firebaseAuthInstance = getAuth(app)
    }
  }

  return firebaseAuthInstance
}

// Instancia de Auth exportada directamente para su uso en la aplicación
const app = getFirebaseApp()
export const auth: Auth = (app ? getAuth(app) : null) as unknown as Auth
