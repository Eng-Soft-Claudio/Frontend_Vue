import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AboutView from '../views/AboutView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'

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
  ],
})

// Guarda de Navegação Global
import { useAuthStore } from '@/stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest

  // --- Lógica de Proteção ---

  // 1. Se a rota requer autenticação E o usuário NÃO está logado
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('Guarda: Rota requer auth, usuário não logado. Redirecionando para /login.')
    next({ name: 'login' })
  }
  // 2. Se a rota requer ser convidado (guest) E o usuário ESTÁ logado
  else if (requiresGuest && authStore.isAuthenticated) {
    console.log('Guarda: Rota requer guest, usuário logado. Redirecionando para / (home).')
    next({ name: 'home' })
  }
  // 3. Em todos os outros casos (rota pública, ou logado acessando rota auth, ou guest acessando rota guest)
  else {
    console.log('Guarda: Permitindo acesso à rota:', to.path)
    next()
  }
})

export default router
