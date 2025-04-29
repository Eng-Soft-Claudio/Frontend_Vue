import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import AboutView from '@/views/AboutView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'

// --- Administrador ---
const AdminDashboard = () => import('@/views/admin/AdminDashboard.vue')
const AdminCategoryList = () => import('@/views/admin/AdminCategoryList.vue')
const AdminProductList = () => import('@/views/admin/AdminProductList.vue')
const CategoryForm = () => import('@/views/admin/CategoryForm.vue')
const ProductForm = () => import('@/views/admin/ProductForm.vue')

// --- Rotas ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },

    // --- Rotas Admin ---
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: AdminDashboard,
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: AdminCategoryList,
        },
        {
          path: 'categories/new',
          name: 'admin-category-new',
          component: CategoryForm,
        },
        {
          path: 'categories/edit/:id',
          name: 'admin-category-edit',
          component: CategoryForm,
          props: true,
        },
        {
          path: 'products',
          name: 'admin-products',
          component: AdminProductList,
        },
        {
          path: 'products/new',
          name: 'admin-product-new',
          component: ProductForm,
        },
        {
          path: 'products/edit/:id',
          name: 'admin-product-edit',
          component: ProductForm,
          props: true,
        },
      ],
    },
  ],
})

// Guarda de Navegação Global
import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const requiresAdmin = to.meta.requiresAdmin
  const isAuthenticated = authStore.isAuthenticated
  const isAdminUser = authStore.userRole === 'admin'

  console.log(
    `Guarda: Para ${to.path}, Auth: ${isAuthenticated}, Admin: ${isAdminUser}, Meta:`,
    to.meta,
  )

  // --- Lógica de Proteção ---

  // 1. Rota Admin
  if (requiresAdmin) {
    if (!isAuthenticated) {
      console.log('Guarda (Admin): Não logado -> /login')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return // <<< Adiciona return
    }
    if (!isAdminUser) {
      console.log('Guarda (Admin): Não admin -> /')
      next({ name: 'home' }) // Redireciona para home (ou página 403)
      return // <<< Adiciona return
    }
  }

  // 2. Rota usuário NÃO logado
  if (requiresAuth && !isAuthenticated) {
    console.log('Guarda (Auth): Não logado -> /login')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return // <<< Adiciona return
  }

  // 3. Rota convidado E o usuário ESTÁ logado
  if (requiresGuest && isAuthenticated) {
    console.log('Guarda (Guest): Logado -> /')
    next({ name: 'home' })
    return // <<< Adiciona return
  }

  // 4. Rota outros casos
  console.log('Guarda: Acesso permitido.')
  next()
})

export default router
