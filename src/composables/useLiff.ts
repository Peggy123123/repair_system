import { ref } from 'vue'
import type Liff from '@line/liff'

// Module-level singleton state
const LIFF_ID = import.meta.env.VITE_LINE_LIFF_ID as string | undefined
const isLiffAvailable = !!LIFF_ID

const isInitializing = ref(false)
const isLiffLoggedIn = ref(false)
const isInLineClient = ref(false)

let liffInstance: typeof Liff | null = null
let initPromise: Promise<void> | null = null

async function initLiff(): Promise<void> {
  if (!isLiffAvailable) return
  if (liffInstance) return

  if (initPromise) return initPromise

  initPromise = (async () => {
    isInitializing.value = true
    try {
      const liffModule = await import('@line/liff')
      const liff = liffModule.default
      await liff.init({ liffId: LIFF_ID! })
      liffInstance = liff
      isLiffLoggedIn.value = liff.isLoggedIn()
      isInLineClient.value = liff.isInClient() // 是否在line內部瀏覽器
    } catch (error) {
      initPromise = null
      throw error
    } finally {
      isInitializing.value = false
    }
  })()

  return initPromise
}

function loginWithLine(redirectUri?: string): void {
  if (!liffInstance) return
  liffInstance.login({ redirectUri })
}

function getAccessToken(): string | null {
  if (!liffInstance) return null
  return liffInstance.getAccessToken()
}

function logoutLiff(): void {
  if (!liffInstance) return
  if (liffInstance.isLoggedIn()) {
    liffInstance.logout()
  }
  isLiffLoggedIn.value = false
}

export function useLiff() {
  return {
    isLiffAvailable,
    isInitializing,
    isLiffLoggedIn,
    isInLineClient,
    initLiff,
    loginWithLine,
    getAccessToken,
    logoutLiff,
  }
}
