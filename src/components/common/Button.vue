<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-md transition-colors',
      widthClasses,
      sizeClasses,
      variantClasses,
      disabledClasses,
      customClass
    ]"
  >
    <span class="flex items-center gap-2">
      <font-awesome-icon v-if="loading" icon="spinner" class="w-4 h-4 animate-spin" />
      <font-awesome-icon v-else-if="icon" :icon="icon" class="w-4 h-4" />
      {{ loading ? loadingText || '載入中...' : text }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
    size: {
        type: String as PropType<'sm' | 'md' | 'lg'>,
        default: 'md'
    },
    variant: {
        type: String as PropType<'primary' | 'secondary' | 'outline' | 'danger' | 'text'>,
        default: 'primary'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    loadingText: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: true
    },
    icon: {
        type: [String, Array, Object] as PropType<string | string[] | object>,
        required: false
    },
    type: {
        type: String as PropType<'button' | 'submit' | 'reset'>,
        default: 'button'
    },
    fullWidth: {
        type: Boolean,
        default: true
    },
    customClass: {
        type: String,
        default: ''
    }
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const widthClasses = computed(() => {
  return props.fullWidth ? 'w-full' : ''
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    text: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
  }
  return variants[props.variant]
})

const disabledClasses = computed(() => {
  if (props.disabled || props.loading) {
    return 'opacity-50 cursor-not-allowed'
  }
  return ''
})
</script>
