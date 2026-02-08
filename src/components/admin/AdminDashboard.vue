<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">儀表板</h2>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="file-alt" 
                class="h-6 w-6 text-gray-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">總申請數</dt>
                <dd class="text-lg font-medium text-gray-900">{{ allRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="clock" 
                class="h-6 w-6 text-red-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">待處理</dt>
                <dd class="text-lg font-medium text-gray-900">{{ pendingRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="cog" 
                class="h-6 w-6 text-blue-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">處理中</dt>
                <dd class="text-lg font-medium text-gray-900">{{ inProgressRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="tools" 
                class="h-6 w-6 text-orange-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">維修中</dt>
                <dd class="text-lg font-medium text-gray-900">{{ repairingRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="check-circle" 
                class="h-6 w-6 text-green-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">已完成</dt>
                <dd class="text-lg font-medium text-gray-900">{{ completedRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近申請 -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">最近申請</h3>
        
        <div v-if="recentRequests.length === 0" class="text-center py-8">
          <p class="text-gray-500">尚無維修申請</p>
        </div>

        <div v-else>
          <div class="space-y-3">
            <RepairOrderCard
              v-for="request in recentRequests"
              :key="request.id"
              :request="request"
              variant="simple"
              @click="goToOrderDetail"
            />
          </div>
          <div class="mt-4 flex justify-end">
            <Button
            @click="goToAllOrders"
            text="查看所有申請"
            :fullWidth="false"
            variant="text"
            size="sm"
            custom-class="!text-gray-400 hover:!text-gray-500 hover:!bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import Button from '@/components/common/Button.vue'
import RepairOrderCard from '@/components/admin/shared/RepairOrderCard.vue'

const router = useRouter()
const repairRequestsStore = useRepairRequestsStore()

const allRequests = computed(() => repairRequestsStore.requests)
const pendingRequests = computed(() => repairRequestsStore.requests.filter(r => r.status === 'pending'))
const inProgressRequests = computed(() => repairRequestsStore.requests.filter(r => r.status === 'in_progress'))
const repairingRequests = computed(() => repairRequestsStore.requests.filter(r => r.status === 'repairing'))
const completedRequests = computed(() => repairRequestsStore.requests.filter(r => r.status === 'completed'))

const recentRequests = computed(() => {
  return [...allRequests.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

const goToOrderDetail = (orderId: string) => {
  router.push({ name: 'admin-order-detail', params: { id: orderId } })
}

const goToAllOrders = () => {
  router.push({ name: 'admin-orders' })
}
</script>
