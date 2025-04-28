// src/views/LoginView.vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth'; // Importa nossa store
import { useRouter } from 'vue-router'; // Para redirecionar após login

const authStore = useAuthStore();
const router = useRouter();

// Refs para os campos do formulário (v-model)
const email = ref('');
const password = ref('');

// Função para lidar com o submit do formulário
async function handleLogin() {
  // Chama a ação 'login' da store com as credenciais
  await authStore.login({
    email: email.value,
    password: password.value
  });

  // Se o login NÃO gerou erro na store (verificamos o estado de erro da store)
  if (!authStore.error) {
    // Redireciona para a página inicial (ou dashboard)
    // A ação 'login' na store já faz isso, mas podemos garantir aqui também
    // ou redirecionar para uma página específica se necessário.
    console.log('Login bem-sucedido na view, redirecionando...');
     if (router.currentRoute.value.path !== '/') { // Evita redirecionar se já está na home
         await router.push('/');
     }
  } else {
    // O erro já foi tratado e armazenado na store (authStore.error)
    // Podemos usar esse erro para exibir uma mensagem na UI (veja template)
    console.error('Erro de login detectado na view:', authStore.error);
  }
}
</script>

<template>
  <div class="login-view">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          autocomplete="username"
        />
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          autocomplete="current-password"
        />
      </div>

      <!-- Exibe mensagem de erro da store -->
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <!-- Botão de submit, desabilitado enquanto o login está em progresso -->
      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
     <p>
        Não tem uma conta? <router-link to="/register">Registre-se</router-link>
     </p>
  </div>
</template>

<style scoped>
/* Estilos básicos para o formulário (adicione seus próprios estilos) */
.login-view {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center; /* Centraliza texto e link */
}

.login-form .form-group {
  margin-bottom: 15px;
  text-align: left; /* Alinha labels e inputs à esquerda */
}

.login-form label {
  display: block;
  margin-bottom: 5px;
}

.login-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Garante que padding não aumente a largura total */
}

.error-message {
  color: red;
  margin-bottom: 15px;
  text-align: left;
  font-size: 0.9em;
}

button {
  padding: 10px 20px;
  background-color: #42b983; /* Cor verde Vue */
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