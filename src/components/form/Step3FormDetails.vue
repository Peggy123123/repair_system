<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
        填寫報修詳情
      </h3>
      
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- 報修主題 -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">
            報修主題 <span class="text-red-500">*</span>
          </label>

          <input
            id="title"
            v-model="form.title"
            required
            type="text"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            placeholder="請輸入報修主題"
          />
        </div>

        <!-- 報修描述 -->
        <div>
          <label for="description" class="block font-medium text-sm text-gray-700">
            報修描述 <span class="text-red-500">*</span>
          </label>

          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            placeholder="請詳細描述您的問題"
          ></textarea>
        </div>

        <!-- 圖片上傳 -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            附件圖片
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <font-awesome-icon 
                icon="upload" 
                class="mx-auto h-6 w-6 text-gray-400"
              />
              <div class="flex text-sm text-gray-600 items-center justify-center">
                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                  <span>上傳檔案</span>

                  <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileUpload" accept="image/*" multiple>
                </label>
                <p class="pl-1">或拖放檔案到此處</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, GIF 最大 10MB，可上傳多張圖片</p>
            </div>
          </div>
          <!-- 已上傳的圖片預覽 -->
          <div v-if="form.attachmentUrls.length > 0" class="mt-4">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div 
                v-for="(url, index) in form.attachmentUrls" 
                :key="index"
                class="relative group"
              >
                <img 
                  :src="url" 
                  :alt="`上傳的圖片 ${index + 1}`" 
                  class="h-32 w-full object-cover rounded-md border border-gray-200"
                >
                <button
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <font-awesome-icon icon="times" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按鈕 -->
        <div class="flex justify-between gap-2">
          <Button
            @click="prevStep"
            variant="secondary"
            text="回上一步"
          />
          <Button
            @click="submitForm"
            :disabled="isSubmitting"
            variant="primary"
            text="送出申請"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import { useFrontendUserStore } from '@/stores/frontendUser'
import { DEVICE_TYPES, REPAIR_SUB_CATEGORIES } from '@/types'
import { createRepairRequest } from '@/utils/repairRequestUtils'

const router = useRouter()
const route = useRoute()
const repairRequestsStore = useRepairRequestsStore()
const frontendUserStore = useFrontendUserStore()

const isSubmitting = ref(false)

const form = reactive({
  title: '',
  description: '',
  attachmentUrl: '', // 保留向後相容
  attachmentUrls: [] as string[]
})

const selectedDevice = computed(() => route.query.device as string)
const selectedCategory = computed(() => route.query.category as string)

const deviceName = computed(() => {
  const device = DEVICE_TYPES.find(d => d.id === selectedDevice.value)
  return device?.name || ''
})

const categoryName = computed(() => {
  const category = REPAIR_SUB_CATEGORIES.find(c => c.id === selectedCategory.value)
  return category?.name || ''
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    // 處理多個檔案
    Array.from(files).forEach(file => {
      // Mock 檔案上傳 - 實際會上傳到 Cloudinary
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          form.attachmentUrls.push(result)
          // 為了向後相容，將第一張圖片設為 attachmentUrl
          if (form.attachmentUrls.length === 1) {
            form.attachmentUrl = result
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index: number) => {
  form.attachmentUrls.splice(index, 1)
  // 更新 attachmentUrl 為第一張圖片（向後相容）
  if (form.attachmentUrls.length > 0) {
    form.attachmentUrl = form.attachmentUrls[0]
  } else {
    form.attachmentUrl = ''
  }
}

const prevStep = () => {
  router.push(`/form/step2?device=${selectedDevice.value}`)
  // 切換步驟時回到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const submitForm = async () => {
  if (!frontendUserStore.currentUser) {
    alert('請先登入')
    return
  }

  isSubmitting.value = true
  
  try {
    // Mock API 呼叫
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 使用工具函數創建新的維修申請
    const newRequest = createRepairRequest({
      userId: frontendUserStore.currentUser.id,
      category: `${deviceName.value} - ${categoryName.value}`,
      title: form.title,
      description: form.description,
      attachmentUrl: form.attachmentUrl || undefined,
      attachmentUrls: form.attachmentUrls.length > 0 ? form.attachmentUrls : undefined,
      status: 'pending'
    })
    
    repairRequestsStore.requests.unshift(newRequest)
    router.push('/form/step3?completed=true')
  } catch (error) {
    alert('提交失敗，請重試')
  } finally {
    isSubmitting.value = false
  }
}
</script>
