// src/views/admin/AdminCategoryList.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api'; // Nosso cliente Axios configurado

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug?: string; // O backend parece gerar slug implicitamente
  createdAt?: string;
  updatedAt?: string;
}

const router = useRouter();
const categories = ref<Category[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

async function fetchCategories() {
  isLoading.value = true;
  error.value = null;
  try {
    // A API GET /api/categories retorna diretamente um array de categorias
    const response = await apiClient.get<Category[]>('/categories');
    categories.value = response.data;
  } catch (err: any) {
    console.error('Erro ao buscar categorias:', err);
    error.value = err.response?.data?.message || err.message || 'Falha ao carregar categorias.';
  } finally {
    isLoading.value = false;
  }
}

async function deleteCategory(categoryId: string, categoryName: string) {
  if (!window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? Verifique se não há produtos associados.`)) {
    return;
  }
  // Idealmente, adicionaríamos um estado de loading específico para exclusão
  try {
    await apiClient.delete(`/categories/${categoryId}`);
    // Remove da lista local
    categories.value = categories.value.filter(cat => cat._id !== categoryId);
    alert('Categoria excluída com sucesso!'); // Ou use um sistema de notificação
  } catch (err: any) {
    console.error('Erro ao excluir categoria:', err);
    // Exibe o erro específico do backend (ex: "existem produtos associados")
    alert(`Erro ao excluir: ${err.response?.data?.message || err.message || 'Erro desconhecido.'}`);
    // Não recarrega a lista automaticamente em caso de erro
  }
}

function goToAddCategory() {
  router.push({ name: 'admin-category-new' });
}

function goToEditCategory(categoryId: string) {
  router.push({ name: 'admin-category-edit', params: { id: categoryId } });
}

onMounted(fetchCategories);
</script>

<template>
  <div class="admin-category-list">
    <h1>Gerenciar Categorias</h1>

    <div class="actions-header">
      <button @click="goToAddCategory">Adicionar Nova Categoria</button>
    </div>

    <div v-if="isLoading" class="loading-message">Carregando categorias...</div>
    <div v-else-if="error" class="error-message">
      Erro: {{ error }}
      <button @click="fetchCategories">Tentar Novamente</button>
    </div>
    <div v-else-if="categories.length === 0">
      <p>Nenhuma categoria encontrada.</p>
    </div>
    <table v-else class="categories-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Slug</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category._id">
          <td>{{ category.name }}</td>
          <td>{{ category.description || '-' }}</td>
          <td>{{ category.slug || '-' }}</td>
          <td>
            <button @click="goToEditCategory(category._id)" class="action-button edit">Editar</button>
            <button @click="deleteCategory(category._id, category.name)" class="action-button delete">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-category-list {
  /* Estilos gerais */
}

.actions-header {
  margin-bottom: 20px;
  text-align: right;
}

.loading-message, .error-message {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}
.loading-message { background-color: #eef; }
.error-message { background-color: #fdd; color: red; }
.error-message button { margin-left: 15px; }

.categories-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.categories-table th,
.categories-table td {
  border: 1px solid #ddd;
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
}

.categories-table th {
  background-color: #f8f8f8;
  font-weight: bold;
}

.categories-table tr:nth-child(even) {
  background-color: #fdfdfd;
}

.categories-table td:last-child {
  /* Ações */
  white-space: nowrap; /* Impede que botões quebrem linha */
  width: 1%; /* Tenta minimizar a largura */
  text-align: center;
}

.action-button {
  padding: 5px 10px;
  margin: 0 4px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 0.9em;
}

.action-button.edit {
    background-color: #3498db;
    color: white;
    border-color: #2980b9;
}
.action-button.edit:hover {
    background-color: #2980b9;
}

.action-button.delete {
    background-color: #e74c3c;
    color: white;
    border-color: #c0392b;
}
.action-button.delete:hover {
     background-color: #c0392b;
}

button { /* Estilo geral para botões */
    padding: 8px 15px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #eee;
}
button:hover {
    background-color: #ddd;
}
.actions-header button {
    background-color: hsla(160, 100%, 37%, 1);
    color: white;
    border-color: hsla(160, 100%, 37%, 1);
}
.actions-header button:hover {
    background-color: #2a8f6c;
}
</style>