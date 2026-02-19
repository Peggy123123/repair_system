<template>
  <div class="mb-6">
    <div class="flex gap-4">
      <!-- 關鍵字搜尋 -->
      <div class="w-[220px]">
        <label for="keyword" class="block text-gray-500 text-sm mb-1">
          關鍵字
        </label>
        <input
          id="keyword"
          v-model="localFilters.keyword"
          type="text"
          placeholder="搜尋姓名、ID、LINE ID"
          class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 成為會員時間範圍 -->
      <div class="w-[220px]">
        <label class="block text-gray-500 text-sm mb-1">
          成為會員時間
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
import DateRangePicker from 'vue3-daterange-picker'
import 'vue3-daterange-picker/src/assets/daterangepicker.scss'

interface FilterParams {
  keyword: string
  startDate: string
  endDate: string
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
    startDate: '',
    endDate: ''
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