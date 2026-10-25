import { initializeApp, type FirebaseApp, getApps } from 'firebase/app'
import { getDatabase, type Database } from 'firebase/database'
import { env } from '@/config/env'

let firebaseAppInstance: FirebaseApp | null = null
let firebaseDbInstance: Database | null = null

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
      firebaseDbInstance = getDatabase(app)
    }
  }

  return firebaseDbInstance
}
