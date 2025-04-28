// src/stores/auth.ts
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/services/api' // Importa nosso apiClient configurado
import router from '@/router' // Importa o router para redirecionamento

// Interface para definir a estrutura do objeto de usuário (adapte conforme sua API retorna)
interface User {
  id: string
  name: string
  email: string
  role?: string
}
interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem('authToken'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('authUser') || 'null'))
  const loading = ref(false) // Para indicar operações em andamento (ex: login)
  const error = ref<string | null>(null) // Para armazenar mensagens de erro

  // --- Getters ---
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role)

  // --- Actions ---
  // Funções assíncronas para interagir com a API e modificar o estado

  /**
   * Tenta registrar um novo usuário.
   * Em caso de sucesso (201), automaticamente faz o login do usuário.
   * Em caso de falha, define a mensagem de erro.
   */
  async function register(userData: RegisterData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post<{
        status: string
        token: string
        data: {
          user: User
        }
      }>('/auth/register', userData)
      const newToken = response.data.token
      const registeredUser = response.data.data.user
      if (!newToken || !registeredUser) {
        throw new Error('Resposta de registro inválida recebida do servidor.')
      }
      token.value = newToken
      user.value = registeredUser
      localStorage.setItem('authToken', newToken)
      localStorage.setItem('authUser', JSON.stringify(registeredUser))
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      console.log('Registro bem-sucedido. Token e usuário salvos.')
      await router.push('/')
    } catch (err: any) {
      console.error('Erro no registro:', err)
      // --- CORREÇÃO AQUI ---
      let specificErrorMessage = 'Falha no registro.'

      if (err.response?.data) {
        if (err.response.data.message) {
          // Se o backend enviou uma mensagem direta (ex: AppError de email duplicado 409)
          specificErrorMessage = err.response.data.message
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
          // Se o backend enviou um array de erros de validação (do express-validator)
          // Pega a mensagem do PRIMEIRO erro encontrado
          specificErrorMessage = err.response.data.errors[0]?.msg;
        }
      } else if (err.message) {
        // Fallback para a mensagem do erro Javascript/Axios
        specificErrorMessage = err.message
      }

      error.value = specificErrorMessage // Define a mensagem de erro correta na store
      console.log(`Erro definido na store: "${error.value}"`);
      // --- FIM DA CORREÇÃO ---
      logout()
    } finally {
      loading.value = false
    }
  }

  /**
   * Tenta fazer login com email e senha.
   * Em caso de sucesso, atualiza o token e o usuário na store e no localStorage.
   * Em caso de falha, define a mensagem de erro.
   */
  async function login(credentials: { email: string; password: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post<{
        status: string
        token: string
        data: {
          user: User
        }
      }>('/auth/login', credentials)
      const newToken = response.data.token
      const loggedInUser = response.data.data.user
      if (!newToken || !loggedInUser) {
        throw new Error('Resposta de login inválida recebida do servidor.')
      }
      token.value = newToken
      user.value = loggedInUser
      localStorage.setItem('authToken', newToken)
      localStorage.setItem('authUser', JSON.stringify(loggedInUser))
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      await router.push('/')
    } catch (err: any) {
      console.error('Erro no login:', err)
      error.value =
        err.response?.data?.message ||
        (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null) ||
        err.message ||
        'Falha no login.'
      logout()
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpa o token e o usuário da store e do localStorage.
   * Remove o header de autorização das requisições futuras.
   */
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    delete apiClient.defaults.headers.common['Authorization']
    console.log('Usuário deslogado.')
  }

  /**
   * (Opcional) Função para buscar os dados do usuário se tivermos um token,
   * mas não os dados do usuário (ex: após recarregar a página).
   */
  async function fetchUser() {
    if (token.value && !user.value) {
      console.log('Tentando buscar dados do usuário com token existente...')
      try {
        const response = await apiClient.get('/auth/me')
        user.value = response.data
        localStorage.setItem('authUser', JSON.stringify(response.data))
        console.log('Dados do usuário carregados:', user.value)
      } catch (err: any) {
        console.error('Erro ao buscar dados do usuário:', err)
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('Token inválido ou expirado. Deslogando.')
          logout()
        }
      }
    }
  }
  return {
    // State
    token,
    user,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    // Actions
    login,
    logout,
    fetchUser,
    register,
  }
})
