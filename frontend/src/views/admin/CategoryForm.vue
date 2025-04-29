// src/views/admin/CategoryForm.vue
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/services/api';

interface Category {
  _id: string;
  name: string;
  description?: string;
  slug?: string;
}
// Usamos Partial porque os campos podem começar vazios no modo 'add'
type CategoryFormData = Partial<Omit<Category, '_id' | 'slug'>>;

const router = useRouter();
const route = useRoute(); // Para acessar parâmetros da rota, como :id

const categoryId = ref<string | null>(null);
const categoryData = ref<CategoryFormData>({ name: '', description: '' });
const isLoading = ref(false); // Loading para buscar dados (edição)
const isSubmitting = ref(false);
const error = ref<string | null>(null);

// Verifica se está em modo de edição baseado no parâmetro da rota
const isEditMode = computed(() => !!categoryId.value);
const pageTitle = computed(() => isEditMode.value ? 'Editar Categoria' : 'Adicionar Nova Categoria');

async function fetchCategoryData(id: string) {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    categoryData.value = { // Preenche o formulário com dados existentes
      name: response.data.name,
      description: response.data.description || ''
    };
  } catch (err: any) {
    console.error('Erro ao buscar dados da categoria:', err);
    error.value = err.response?.data?.message || err.message || 'Falha ao carregar dados da categoria.';
    // Poderia redirecionar de volta se a categoria não for encontrada (404)
    // if (err.response?.status === 404) router.push({ name: 'admin-categories' });
  } finally {
    isLoading.value = false;
  }
}

async function handleSubmit() {
  isSubmitting.value = true;
  error.value = null;
  const dataToSend = {
    name: categoryData.value.name,
    description: categoryData.value.description || undefined // Envia undefined se vazio
  };

  try {
    if (isEditMode.value && categoryId.value) {
      // --- EDITAR (PUT) ---
      await apiClient.put(`/categories/${categoryId.value}`, dataToSend);
      alert('Categoria atualizada com sucesso!'); // Ou use notificação
    } else {
      // --- ADICIONAR (POST) ---
      await apiClient.post('/categories', dataToSend);
      alert('Categoria criada com sucesso!'); // Ou use notificação
    }
    router.push({ name: 'admin-categories' }); // Volta para a lista

  } catch (err: any) {
    console.error(`Erro ao ${isEditMode.value ? 'atualizar' : 'criar'} categoria:`, err);
    // Pega erro de validação ou outros erros
    error.value = err.response?.data?.message ||
                  (err.response?.data?.errors ? err.response.data.errors.map((e: any) => e.msg).join('. ') : null) ||
                  err.message ||
                  `Falha ao ${isEditMode.value ? 'atualizar' : 'criar'} categoria.`;
  } finally {
    isSubmitting.value = false;
  }
}

// Observa a rota para pegar o ID quando o componente é montado ou a rota muda (raro neste caso)
watch(
    () => route.params.id,
    (newId) => {
        const idParam = Array.isArray(newId) ? newId[0] : newId; // Pega o ID do parâmetro
        if (idParam && typeof idParam === 'string') {
            categoryId.value = idParam;
            fetchCategoryData(idParam); // Busca dados se for edição
        } else {
             categoryId.value = null; // Garante que está em modo de adição
             categoryData.value = { name: '', description: '' }; // Reseta o form
        }
    },
    { immediate: true } // Executa imediatamente ao montar
);

</script>

<template>
  <div class="category-form">
    <h1>{{ pageTitle }}</h1>

    <div v-if="isLoading" class="loading-message">Carregando dados...</div>
    <div v-else-if="error && !isSubmitting" class="error-message"> <!-- Só mostra erro de load se não for erro de submit -->
       Erro ao carregar: {{ error }}
        <RouterLink :to="{ name: 'admin-categories' }">Voltar para a Lista</RouterLink>
    </div>

    <!-- O formulário só aparece se não estiver carregando E se não houver erro de carregamento OU se estiver em modo de adição -->
    <form v-else @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Nome da Categoria:*</label>
        <input type="text" id="name" v-model="categoryData.name" required>
      </div>
      <div class="form-group">
        <label for="description">Descrição (Opcional):</label>
        <textarea id="description" v-model="categoryData.description" rows="4"></textarea>
      </div>

      <!-- Exibe erro de submit do formulário -->
       <div v-if="error && isSubmitting" class="error-message submit-error">
         {{ error }}
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : (isEditMode ? 'Atualizar Categoria' : 'Criar Categoria') }}
        </button>
        <RouterLink :to="{ name: 'admin-categories' }" tag="button" type="button" class="cancel-button">
          Cancelar
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.category-form {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}
.form-group textarea {
    resize: vertical; /* Permite redimensionar verticalmente */
}

.loading-message, .error-message {
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}
.loading-message { background-color: #eef; }
.error-message { background-color: #fdd; color: red; }

.submit-error {
    margin-top: 15px; /* Espaço acima do erro de submit */
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.form-actions button, .form-actions .cancel-button { /* Estiliza o link como botão */
  padding: 10px 20px;
  font-size: 1em;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none; /* Remove sublinhado do link */
  display: inline-block; /* Necessário para padding no link */
}
.form-actions button[type="submit"] {
     background-color: hsla(160, 100%, 37%, 1);
    color: white;
    border: 1px solid hsla(160, 100%, 37%, 1);
}
.form-actions button[type="submit"]:disabled {
    background-color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
}
.form-actions .cancel-button {
    background-color: #eee;
    color: #333;
    border: 1px solid #ccc;
}
.form-actions .cancel-button:hover {
     background-color: #ddd;
}
</style>