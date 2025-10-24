import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginView from '@/views/LoginView.vue'
import FormView from '@/views/FormView.vue'
import MyRequestsView from '@/views/MyRequestsView.vue'
import RequestDetailView from '@/views/RequestDetailView.vue'
import AdminView from '@/views/AdminView.vue'
import Step1DeviceSelection from '@/components/form/Step1DeviceSelection.vue'
import Step2CategorySelection from '@/components/form/Step2CategorySelection.vue'
import Step3FormDetails from '@/components/form/Step3FormDetails.vue'
import RecordsOverview from '@/components/records/RecordsOverview.vue'
import RecordsList from '@/components/records/RecordsList.vue'

const router = createRouter({
  history: createWebHistory(),
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
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    }
  ]
})

// 路由守衛
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  
  // 如果路由需要登入但使用者未登入，重導向到登入頁
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/')
  } 
  // 如果已登入但訪問登入頁，重導向到維修頁面
  else if (to.name === 'login' && userStore.isLoggedIn) {
    next('/form')
  } 
  else {
    next()
  }
})

export default router
