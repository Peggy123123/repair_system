declare module 'circle-progress.vue' {
  import { DefineComponent } from 'vue'
  export const CircleProgressBar: DefineComponent<{
    max: number
    value: number
    colorFilled?: string
    colorUnfilled?: string
    colorBack?: string
    width?: number
    height?: number
  }>
}
