export interface AppEnv {
  appName: string
  timezone: string
  firebase: {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  firebaseRootPath: string
  esp32OfflineThresholdSec: number
  isFirebaseConfigured: boolean
}

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || ''
const rawDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || ''
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || ''

/**
 * Checks if the string is still a placeholder or empty
 */
function isPlaceholder(value: string): boolean {
  if (!value || value.trim() === '') return true
  const lower = value.toLowerCase()
  return (
    lower.includes('replace_with') ||
    lower.includes('your_api_key') ||
    lower.includes('your_project_id') ||
    lower.includes('example.com')
  )
}

const isConfigured =
  !isPlaceholder(rawApiKey) &&
  !isPlaceholder(rawDbUrl) &&
  !isPlaceholder(rawProjectId) &&
  rawDbUrl.startsWith('https://')

export const env: AppEnv = {
  appName: import.meta.env.VITE_APP_NAME || 'eatley',
  timezone: import.meta.env.VITE_APP_TIMEZONE || 'America/Guayaquil',
  firebase: {
    apiKey: rawApiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: rawDbUrl,
    projectId: rawProjectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },
  firebaseRootPath: (import.meta.env.VITE_FIREBASE_ROOT_PATH || 'eatley_v1').replace(/^\/+|\/+$/g, ''),
  esp32OfflineThresholdSec: Number(import.meta.env.VITE_ESP32_OFFLINE_THRESHOLD_SEC) || 45,
  isFirebaseConfigured: isConfigured,
}
