// src/views/RegisterView.vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Refs para os campos do formulário
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

// Função para lidar com o submit do formulário
async function handleRegister() {
  if (password.value.trim() !== passwordConfirm.value.trim()) {
    authStore.error = 'As senhas não coincidem.'
    return;
  }
  // Chama a ação 'register' da store
  await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value 
  })
  // Se o registro/auto-login NÃO gerou erro na store
  if (!authStore.error) {
    if (router.currentRoute.value.path !== '/') {
      await router.push('/')
    }
  } 
}
</script>
<template>
  <div class="register-view">
    <h1>Registrar</h1>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="name">Nome:</label>
        <input type="text" id="name" v-model="name" required autocomplete="name" />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Senha (mín. 8 caracteres):</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          minlength="8"
          autocomplete="new-password"
        />
      </div>
      <div class="form-group">
        <label for="passwordConfirm">Confirmar Senha:</label>
        <input
          type="password"
          id="passwordConfirm"
          v-model="passwordConfirm"
          required
          minlength="8"
          autocomplete="new-password"
        />
      </div>
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Registrando...' : 'Registrar' }}
      </button>
    </form>
    <p>Já tem uma conta? <router-link to="/login">Faça login</router-link></p>
  </div>
</template>
<style scoped>
/* Reutiliza ou adapta os estilos do LoginView */
.register-view {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.register-form .form-group {
  margin-bottom: 15px;
  text-align: left;
}

.register-form label {
  display: block;
  margin-bottom: 5px;
}

.register-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.error-message {
  color: red;
  margin-bottom: 15px;
  text-align: left;
  font-size: 0.9em;
}

button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background-color: #36a374;
}
p {
  margin-top: 20px;
}
</style>
