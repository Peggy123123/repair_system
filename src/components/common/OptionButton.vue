<template>
  <button
    @click="$emit('select', option.id)"
    :class="[
      'relative flex flex-col items-center rounded-lg border-2 px-4 py-6 text-center hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors',
      isSelected 
        ? 'border-primary bg-primary/10' 
        : 'border-gray-300 bg-white'
    ]"
  >
    <font-awesome-icon 
      :icon="option.icon" 
      class="mx-auto h-8 w-8 text-gray-400 mb-4"
      :class="isSelected ? 'text-primary' : 'text-gray-400'"
    />
    <span class="text-sm font-medium" :class="isSelected ? 'text-primary' : 'text-gray-400'">
      {{ option.name }}
    </span>
  </button>
</template>

<script setup lang="ts">
interface Option {
  id: string
  name: string
  icon: string
}

interface Props {
  option: Option
  isSelected: boolean
}

defineProps<Props>()

defineEmits<{
  select: [optionId: string]
}>()
</script>
