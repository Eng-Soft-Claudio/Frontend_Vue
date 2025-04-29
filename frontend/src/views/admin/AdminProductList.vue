// src/views/admin/AdminProductList.vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

// Interfaces (ajuste conforme necessário, especialmente a Categoria populada)
interface CategoryInfo {
    _id: string;
    name: string;
    slug?: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: CategoryInfo; // Espera categoria populada
  stock?: number;
  image?: string; // URL da imagem
  imagePublicId?: string; // Para exclusão futura
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface para a resposta da API (com paginação)
interface ProductsApiResponse {
    status: string;
    results: number;
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    products: Product[];
}

const router = useRouter();
const products = ref<Product[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Estado da Paginação (pode ser expandido depois)
const currentPage = ref(1);
const totalPages = ref(1);
const totalProducts = ref(0);
const limit = ref(10); // Itens por página

async function fetchProducts(page = 1) {
  isLoading.value = true;
  error.value = null;
  try {
    // Chama a API GET /api/products com parâmetros de paginação
    const response = await apiClient.get<ProductsApiResponse>('/products', {
        params: {
            page: page,
            limit: limit.value,
            sort: '-createdAt' // Ordena pelos mais recentes por padrão
            // Adicionar filtros (q, category) aqui se necessário
        }
    });
    products.value = response.data.products;
    currentPage.value = response.data.currentPage;
    totalPages.value = response.data.totalPages;
    totalProducts.value = response.data.totalProducts;

  } catch (err: any) {
    console.error('Erro ao buscar produtos:', err);
    error.value = err.response?.data?.message || err.message || 'Falha ao carregar produtos.';
    products.value = []; // Limpa em caso de erro
  } finally {
    isLoading.value = false;
  }
}

async function deleteProduct(productId: string, productName: string) {
  if (!window.confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
    return;
  }
  // Adicionar loading específico para delete se desejar
  try {
    await apiClient.delete(`/products/${productId}`);
    // Remove da lista local (ou recarrega a página atual)
    // Recarregar pode ser mais simples se a exclusão afetar a paginação
    alert('Produto excluído com sucesso!');
    await fetchProducts(currentPage.value); // Recarrega a página atual
  } catch (err: any) {
    console.error('Erro ao excluir produto:', err);
    alert(`Erro ao excluir: ${err.response?.data?.message || err.message || 'Erro desconhecido.'}`);
  }
}

function goToAddProduct() {
  router.push({ name: 'admin-product-new' });
}

function goToEditProduct(productId: string) {
  router.push({ name: 'admin-product-edit', params: { id: productId } });
}

// Formata preço para moeda (exemplo simples)
function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

onMounted(() => fetchProducts(currentPage.value));

// --- Funções de Paginação (Exemplo Básico) ---
function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        fetchProducts(page);
    }
}

</script>

<template>
  <div class="admin-product-list">
    <h1>Gerenciar Produtos</h1>

    <div class="actions-header">
      <button @click="goToAddProduct">Adicionar Novo Produto</button>
    </div>

    <div v-if="isLoading" class="loading-message">Carregando produtos...</div>
    <div v-else-if="error" class="error-message">
      Erro: {{ error }}
      <button @click="fetchProducts(1)">Tentar Novamente</button>
    </div>
    <div v-else-if="products.length === 0">
      <p>Nenhum produto encontrado.</p>
    </div>
    <div v-else>
      <table class="products-table">
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product._id">
            <td>
              <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image-thumbnail">
              <span v-else>-</span>
            </td>
            <td>{{ product.name }}</td>
            <td>{{ product.category?.name || 'N/A' }}</td> <!-- Acessa nome da categoria populada -->
            <td>{{ formatCurrency(product.price) }}</td>
            <td>{{ product.stock ?? 'N/A' }}</td>
            <td>
              <button @click="goToEditProduct(product._id)" class="action-button edit">Editar</button>
              <button @click="deleteProduct(product._id, product.name)" class="action-button delete">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação Simples -->
       <div class="pagination" v-if="totalPages > 1">
           <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1">
             Anterior
           </button>
           <span>Página {{ currentPage }} de {{ totalPages }} ({{ totalProducts }} produtos)</span>
           <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages">
             Próxima
           </button>
       </div>

    </div>
  </div>
</template>

<style scoped>
/* Reutiliza e adapta estilos de AdminCategoryList */
.admin-product-list {
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

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.products-table th,
.products-table td {
  border: 1px solid #ddd;
  padding: 10px 12px;
  text-align: left;
  vertical-align: middle; /* Alinha verticalmente ao centro */
}

.products-table th {
  background-color: #f8f8f8;
  font-weight: bold;
}

.products-table tr:nth-child(even) {
  background-color: #fdfdfd;
}

.product-image-thumbnail {
    max-width: 60px; /* Limita largura */
    max-height: 60px; /* Limita altura */
    height: auto; /* Mantém proporção */
    display: block; /* Evita espaço extra abaixo */
    margin: auto; /* Centraliza se for menor que max-width */
}

.products-table td:last-child { /* Ações */
  white-space: nowrap;
  width: 1%;
  text-align: center;
}

.action-button { /* Reutilizado de categorias */
  padding: 5px 10px; margin: 0 4px; cursor: pointer; border-radius: 4px;
  border: 1px solid transparent; font-size: 0.9em;
}
.action-button.edit { background-color: #3498db; color: white; border-color: #2980b9; }
.action-button.edit:hover { background-color: #2980b9; }
.action-button.delete { background-color: #e74c3c; color: white; border-color: #c0392b; }
.action-button.delete:hover { background-color: #c0392b; }

button { /* Estilo geral */
    padding: 8px 15px; cursor: pointer; border-radius: 4px;
    border: 1px solid #ccc; background-color: #eee;
}
button:hover { background-color: #ddd; }
button:disabled { cursor: not-allowed; opacity: 0.6; }

.actions-header button { /* Botão Adicionar */
    background-color: hsla(160, 100%, 37%, 1); color: white;
    border-color: hsla(160, 100%, 37%, 1);
}
.actions-header button:hover { background-color: #2a8f6c; }

.pagination {
    margin-top: 25px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px; /* Espaço entre elementos */
}
.pagination span {
    font-size: 0.95em;
    color: #555;
}
</style>