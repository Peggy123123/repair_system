<template>
<div 
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
    @click="$emit('click')"
>
    <div class="flex flex-col gap-2">
        <h3 class="text-start text-sm text-gray-400">{{ statusConfig.label }}</h3>
    
        <div class="flex items-center">
            <div
                class="text-center text-3xl font-bold flex-shrink-0 basis-11/12"
                :class="count > 0 ? 'text-red-600' : 'text-gray-400'"
            >
                {{ count }}
            </div>

            <font-awesome-icon
                v-if="count > 0"
                icon="chevron-right"
                class="text-gray-400 flex-shrink-0 basis-1/12"
            />
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { REPAIR_STATUS_CONFIG, type RepairStatus } from '@/types'

interface Props {
  status: RepairStatus
  count: number
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const statusConfig = computed(() => REPAIR_STATUS_CONFIG[props.status])

</script>
