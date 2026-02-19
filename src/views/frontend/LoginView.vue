<template>
  <div class="min-h-[calc(100vh-90px)] flex items-center justify-center bg-primary px-4 sm:px-6 lg:px-8">
    <!-- 自動登入 loading -->
    <div v-if="isAutoLoggingIn" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
      <p class="mt-4 text-white text-sm">自動登入中...</p>
    </div>

    <div v-else class="max-w-md w-full space-y-8 bg-white px-8 py-4 rounded-xl">
      <div>
        <h2 class="text-center text-2xl font-extrabold text-primary">
          鈦客星電腦診所
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          請登入以開始使用
        </p>
      </div>

      <div class="mt-8 space-y-6">
        <!-- 帳號密碼登入表單 - LINE 內部瀏覽器時隱藏 -->
        <template v-if="!isInLineClient">
          <form @submit.prevent="handleFormLogin" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                帳號
              </label>
              <input
                id="username"
                v-model="loginForm.username"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入帳號"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="請輸入密碼"
              />
            </div>

            <div v-if="loginError" class="text-red-600 text-sm">
              {{ loginError }}
            </div>

            <Button
              type="submit"
              :disabled="isLoading"
              :loading="isLoading"
              :loading-text="'登入中...'"
              text="登入"
              variant="primary"
              size="md"
              :full-width="true"
            />
          </form>

          <!-- 分隔線 -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gray-50 text-gray-500">或</span>
            </div>
          </div>
        </template>

        <!-- LINE 登入按鈕 -->
        <div class="text-center">
          <div v-if="loginError && isInLineClient" class="text-red-600 text-sm mb-4">
            {{ loginError }}
          </div>
          <Button
            @click="handleLineLogin"
            :disabled="isLoading"
            :loading="isLoading"
            :loading-text="'登入中...'"
            text="使用 LINE 登入"
            :icon="['fab', 'line']"
            variant="primary"
            size="md"
            :full-width="true"
            custom-class="!bg-green-600 !hover:bg-green-700 !focus:ring-green-500"
          />
        </div>

        <div class="text-center">
          <p class="text-xs text-gray-500">
            登入即表示您同意我們的服務條款
          </p>
          <div class="mt-2">
            <router-link
              to="/admin/login"
              class="text-xs text-gray-400 hover:text-gray-600"
            >
              管理員登入
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFrontendUserStore } from '@/stores/frontendUser'
import { loginUser, loginUserByLine } from '@/services/api'
import { useLiff } from '@/composables/useLiff'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const frontendUserStore = useFrontendUserStore()
const { isLiffAvailable, isLiffLoggedIn, isInLineClient, initLiff, loginWithLine, getAccessToken } = useLiff()

// 表單登入狀態
const loginForm = ref({
  username: '',
  password: ''
})
const isLoading = ref(false)
const isAutoLoggingIn = ref(false)
const loginError = ref('')

// 用 LINE access token 登入後端
const loginWithLineToken = async () => {
  const accessToken = getAccessToken()
  if (!accessToken) throw new Error('無法取得 LINE 存取權杖')

  const result = await loginUserByLine(accessToken)
  frontendUserStore.setUser({
    id: result.user.id,
    lineUserId: result.user.lineUserId,
    displayName: result.user.displayName,
    avatarUrl: result.user.avatarUrl
  })
  router.push('/form')
}

// LIFF 自動登入（onMounted）
onMounted(async () => {
  if (!isLiffAvailable) return

  isAutoLoggingIn.value = true
  try {
    await initLiff()

    if (isLiffLoggedIn.value) {
      await loginWithLineToken()
      return
    }

    // 在 LINE 內部瀏覽器但未登入（罕見情況），觸發 LINE 登入
    if (isInLineClient.value) {
      loginWithLine()
      return
    }
  } catch {
    // 自動登入失敗，顯示登入表單
  } finally {
    isAutoLoggingIn.value = false
  }
})

// 帳號密碼登入
const handleFormLogin = async () => {
  isLoading.value = true
  loginError.value = ''

  try {
    const result = await loginUser(loginForm.value.username, loginForm.value.password)
    frontendUserStore.setUser({
      id: result.user.id,
      lineUserId: result.user.lineUserId,
      displayName: result.user.displayName,
      avatarUrl: result.user.avatarUrl
    })
    router.push('/form')
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// LINE 登入按鈕
const handleLineLogin = async () => {
  if (!isLiffAvailable) {
    loginError.value = 'LINE 登入功能尚未設定，請使用帳號密碼登入'
    return
  }

  isLoading.value = true
  loginError.value = ''

  try {
    await initLiff()

    if (isLiffLoggedIn.value) {
      await loginWithLineToken()
      return
    }

    // 外部瀏覽器：重導至 LINE OAuth 頁面
    loginWithLine(window.location.href)
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : 'LINE 登入失敗'
  } finally {
    isLoading.value = false
  }
}
</script>
