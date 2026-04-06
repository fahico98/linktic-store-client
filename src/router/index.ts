import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getToken } from '@/lib/sessions'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
    },
    {
      path: '/edit-user',
      name: 'edit-user',
      component: () => import('../views/auth/EditUserView.vue'),
    },
    {
      path: '/product-catalog',
      name: 'product-catalog',
      component: () => import('../views/ProductCatalog.vue'),
    },
    {
      path: '/shopping-cart',
      name: 'shopping-cart',
      component: () => import('../views/ShoppingCart.vue'),
    },
    {
      path: '/user-purchases',
      name: 'user-purchases',
      component: () => import('../views/UserPurchases.vue'),
    },
  ],
})

const guestOnlyRoutes = ['login', 'register']

router.beforeEach((to) => {
  const isAuthenticated = !!getToken()

  if (isAuthenticated && (to.name === 'home' || guestOnlyRoutes.includes(to.name as string))) {
    return { name: 'product-catalog' }
  }
})

export default router
