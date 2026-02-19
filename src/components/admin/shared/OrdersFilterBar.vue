<template>
  <div class="mb-6">
    <div class="flex flex-wrap gap-4">
      <!-- 關鍵字搜尋 -->
      <div>
        <label for="keyword" class="block text-gray-500 text-sm mb-1">
          關鍵字
        </label>
        <input
          id="keyword"
          v-model="localFilters.keyword"
          type="text"
          placeholder="搜尋關鍵字"
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 狀態篩選 -->
      <div>
        <label for="status-filter" class="block text-gray-500 text-sm mb-1">
          狀態
        </label>
        <select
          id="status-filter"
          v-model="localFilters.status"
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">請選擇</option>
          <option value="pending">待處理</option>
          <option value="in_progress">處理中</option>
          <option value="repairing">維修中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>

      <!-- 機型篩選 -->
      <div>
        <label for="device-filter" class="block text-gray-500 text-sm mb-1">
          機型
        </label>
        <select
          id="device-filter"
          v-model="localFilters.deviceType"
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">請選擇</option>
          <option v-for="device in DEVICE_TYPES" :key="device.id" :value="device.id">
            {{ device.name }}
          </option>
        </select>
      </div>

      <!-- 分類篩選 -->
      <div>
        <label for="category-filter" class="block text-gray-500 text-sm mb-1">
          分類
        </label>
        <select
          id="category-filter"
          v-model="localFilters.category"
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">請選擇</option>
          <option v-for="category in REPAIR_SUB_CATEGORIES" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- 申請時間範圍 -->
      <div class="w-[220px]">
        <label class="block text-gray-500 text-sm mb-1">
          申請時間
        </label>
        <DateRangePicker
          v-model="dateRange"
          :date-range="dateRange"
          :locale-data="localeData"
          :auto-apply="true"
          :ranges="false"
          :control-container-class="'block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm cursor-pointer bg-white'"
          class="w-full"
        />
      </div>

      <!-- 已印工單 -->
      <div class="flex flex-col justify-end">
        <label class="flex items-center px-2 py-2 cursor-pointer select-none text-gray-500 text-sm">
          <input
            id="is-printed"
            v-model="localFilters.isPrinted"
            type="checkbox"
            class="custom-checkbox"
          />
          <span class="text-sm font-medium text-gray-700 whitespace-nowrap">已印工單</span>
        </label>
      </div>

      <!-- 搜尋按鈕 -->
      <div class="flex flex-col justify-end">
        <button
          type="button"
          @click="handleSearch"
          class="w-full px-6 py-2 bg-primary text-white font-medium rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
        >
          搜尋
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DEVICE_TYPES, REPAIR_SUB_CATEGORIES } from '@/types/frontend'
import DateRangePicker from 'vue3-daterange-picker'
import 'vue3-daterange-picker/src/assets/daterangepicker.scss'

interface FilterParams {
  keyword: string
  status: string
  deviceType: string
  category: string
  startDate: string
  endDate: string
  isPrinted: boolean
}

interface Props {
  modelValue?: FilterParams
}

interface Emits {
  (e: 'update:modelValue', value: FilterParams): void
  (e: 'search', value: FilterParams): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    keyword: '',
    status: '',
    deviceType: '',
    category: '',
    startDate: '',
    endDate: '',
    isPrinted: false
  })
})

const emit = defineEmits<Emits>()

const localFilters = ref<FilterParams>({ ...props.modelValue })

// 日期範圍選擇器的語系設定
const localeData = {
  firstDay: 0,
  format: 'yyyy/mm/dd',
  separator: ' - ',
  applyLabel: '確定',
  cancelLabel: '取消',
  weekLabel: 'W',
  customRangeLabel: '自訂範圍',
  daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
}

// 日期範圍選擇器的值
const dateRange = ref({
  startDate: localFilters.value.startDate ? new Date(localFilters.value.startDate) : new Date(),
  endDate: localFilters.value.endDate ? new Date(localFilters.value.endDate) : new Date()
})

// 監聽日期範圍變化，同步到 localFilters
watch(dateRange, (newValue) => {
  if (newValue && newValue.startDate && newValue.endDate) {
    localFilters.value.startDate = newValue.startDate.toISOString().split('T')[0]
    localFilters.value.endDate = newValue.endDate.toISOString().split('T')[0]
  }
}, { deep: true })

// 同步 localFilters 與外部 modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = { ...newValue }
    // 更新日期範圍選擇器
    if (newValue.startDate && newValue.endDate) {
      dateRange.value = {
        startDate: new Date(newValue.startDate),
        endDate: new Date(newValue.endDate)
      }
    }
  },
  { deep: true }
)

const handleSearch = () => {
  emit('update:modelValue', localFilters.value)
  emit('search', localFilters.value)
}
</script>

<style scoped>
.custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.custom-checkbox:hover {
  border-color: #9ca3af;
}

.custom-checkbox:focus {
  outline: none;
  border-color: #c42140;
  box-shadow: 0 0 0 3px rgba(196, 33, 64, 0.1);
}

.custom-checkbox:checked {
  background-color: #c42140;
  border-color: #c42140;
}

.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 0.25rem;
  height: 0.5rem;
  border: solid white;
  border-width: 0 2px 2px 0;
}
</style>
