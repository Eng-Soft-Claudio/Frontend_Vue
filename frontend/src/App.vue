<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth' // Importa a store de autenticação
import { computed } from 'vue' // Para o getter do nome do usuário

const authStore = useAuthStore()
const router = useRouter()
const userName = computed(() => authStore.user?.name || '')

// Função de logout
function handleLogout() {
  console.log('Iniciando logout...')
  authStore.logout() 
  router.push('/login')
  console.log('Redirecionado para /login após logout.')
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>

        <!-- Links Condicionais -->
        <template v-if="!authStore.isAuthenticated">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/register">Registrar</RouterLink>
        </template>
        <template v-else>
          <span>Olá, {{ userName }}!</span>
          <RouterLink to="/profile">Meu Perfil</RouterLink>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </template>
      </nav>
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
/* Estilos padrão do create-vue */
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a,
nav span,
nav button {
  /* Aplica espaçamento a todos os itens */
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

/* Estilo específico para o botão de logout */
.logout-button {
  background: none;
  border: none;
  color: hsla(160, 100%, 37%, 1); /* Cor verde primária do Vue */
  cursor: pointer;
  padding: 0 1rem; /* Mantém o padding igual aos links */
  font-size: 12px; /* Mantém o tamanho da fonte igual aos links */
  text-decoration: underline; /* Para parecer mais com um link */
  vertical-align: baseline; /* Alinha com o texto dos links */
}

.logout-button:hover {
  color: hsla(160, 100%, 37%, 0.8); /* Escurece um pouco no hover */
}

nav span {
  /* Estilo para o nome do usuário (opcional) */
  font-weight: bold;
  color: var(--color-heading);
  border-left: 1px solid var(--color-border); /* Adiciona borda à esquerda */
}

/* Ajustes para layout desktop (padrão do create-vue) */
@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
