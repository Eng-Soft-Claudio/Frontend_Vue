// src/layouts/AdminLayout.vue
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
// Você pode importar a authStore aqui se precisar de info do admin no layout
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <RouterLink to="/admin/dashboard">Dashboard</RouterLink> <!-- Opcional -->
        <RouterLink to="/admin/categories">Categorias</RouterLink>
        <RouterLink to="/admin/products">Produtos</RouterLink>
        <RouterLink to="/admin/orders">Pedidos</RouterLink> <!-- Exemplo futuro -->
        <RouterLink to="/admin/users">Usuários</RouterLink> <!-- Exemplo futuro -->
        <hr>
        <RouterLink to="/">Voltar ao Site</RouterLink>
      </nav>
    </aside>
    <main class="admin-content">
      <RouterView /> <!-- Onde as páginas admin (categorias, produtos) serão renderizadas -->
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: calc(100vh - 50px); /* Ajuste conforme seu header/footer principal */
}

.admin-sidebar {
  width: 220px;
  background-color: #f4f4f4;
  padding: 20px;
  border-right: 1px solid #ccc;
  height: 100%; /* Para ocupar a altura */
}

.admin-sidebar h2 {
  margin-top: 0;
  text-align: center;
  margin-bottom: 20px;
}

.admin-sidebar nav {
  display: flex;
  flex-direction: column;
}

.admin-sidebar nav a {
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  margin-bottom: 5px;
}

.admin-sidebar nav a:hover,
.admin-sidebar nav a.router-link-exact-active {
  background-color: hsla(160, 100%, 37%, 0.2); /* Verde Vue claro */
  color: hsla(160, 100%, 37%, 1);
}

.admin-sidebar hr {
    margin: 15px 0;
    border: 0;
    border-top: 1px solid #ccc;
}

.admin-content {
  flex-grow: 1;
  padding: 30px;
  background-color: #fff;
}
</style>