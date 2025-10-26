import { createRouter, createWebHistory } from 'vue-router'
import { useFrontendUserStore } from '@/stores/frontendUser'
import { useAdminStore } from '@/stores/admin'
import LoginView from '@/views/frontend/LoginView.vue'
import FormView from '@/views/frontend/FormView.vue'
import MyRequestsView from '@/views/frontend/MyRequestsView.vue'
import RequestDetailView from '@/views/frontend/RequestDetailView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminDashboard from '@/components/admin/AdminDashboard.vue'
import AdminOrders from '@/components/admin/AdminOrders.vue'
import AdminOrderDetail from '@/components/admin/AdminOrderDetail.vue'
import AdminUsers from '@/components/admin/AdminUsers.vue'
import AdminUserRequests from '@/components/admin/AdminUserRequests.vue'
import AdminAdmins from '@/components/admin/AdminAdmins.vue'
import AdminLoginView from '@/views/admin/AdminLoginView.vue'
import Step1DeviceSelection from '@/components/form/Step1DeviceSelection.vue'
import Step2CategorySelection from '@/components/form/Step2CategorySelection.vue'
import Step3FormDetails from '@/components/form/Step3FormDetails.vue'
import RecordsOverview from '@/components/records/RecordsOverview.vue'
import RecordsList from '@/components/records/RecordsList.vue'

const router = createRouter({
  history: createWebHistory('/repair_system/'),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/form',
      name: 'form',
      component: FormView,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/form/step1'
        },
        {
          path: 'step1',
          name: 'form-step1',
          component: Step1DeviceSelection
        },
        {
          path: 'step2',
          name: 'form-step2',
          component: Step2CategorySelection
        },
        {
          path: 'step3',
          name: 'form-step3',
          component: Step3FormDetails
        }
      ]
    },
    {
      path: '/my-requests',
      name: 'my-requests',
      component: MyRequestsView,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'records-overview',
          component: RecordsOverview
        },
        {
          path: ':status',
          name: 'records-list',
          component: RecordsList,
          props: true
        }
      ]
    },
    {
      path: '/my-requests/detail/:id',
      name: 'request-detail',
      component: RequestDetailView,
      meta: { requiresAuth: true },
      props: true
    },
    // 後台路由
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: AdminDashboard
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: AdminOrders
        },
        {
          path: 'orders/:id',
          name: 'admin-order-detail',
          component: AdminOrderDetail,
          props: true
        },
        {
          path: 'users',
          name: 'admin-users',
          component: AdminUsers
        },
        {
          path: 'users/:userId/requests',
          name: 'admin-user-requests',
          component: AdminUserRequests,
          props: true
        },
        {
          path: 'admins',
          name: 'admin-admins',
          component: AdminAdmins
        }
      ]
    }
  ]
})

// 路由守衛
router.beforeEach((to, _from, next) => {
  const frontendUserStore = useFrontendUserStore()
  const adminStore = useAdminStore()

  // 前台路由需要前台使用者登入
  if (to.meta.requiresAuth && !to.meta.requiresAdmin) {
    if (!frontendUserStore.isLoggedIn) {
      next('/')
      return
    }
  }

  // 後台路由需要管理員登入
  if (to.meta.requiresAdmin) {
    if (!adminStore.isLoggedIn) {
      next('/admin/login')
      return
    }
  }

  // 如果前台使用者已登入但訪問前台登入頁
  if (to.name === 'login' && frontendUserStore.isLoggedIn) {
    next('/form')
    return
  }

  // 如果管理員已登入但訪問後台登入頁
  if (to.name === 'admin-login' && adminStore.isLoggedIn) {
    next('/admin')
    return
  }

  next()
})

export default router
