// src/views/ProfileView.vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
// O usuário já deve estar carregado na store por causa do fetchUser ou login/register
const user = authStore.user;
</script>

<template>
  <div class="profile-view">
    <h1>Meu Perfil</h1>
    <!-- Verifica se os dados do usuário existem antes de tentar acessá-los -->
    <div v-if="user" class="user-details">
      <p><strong>Nome:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <!-- Adicione outros campos que você tem no objeto user -->
    </div>
    <div v-else>
      <p>Carregando dados do perfil...</p>
      <!-- Ou poderia mostrar uma mensagem de erro se user for null inesperadamente -->
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
}
.user-details p {
  margin-bottom: 10px;
  font-size: 1.1em;
}
 .user-details strong {
    margin-right: 5px;
 }
</style>