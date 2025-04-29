<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiClient from '@/services/api'

// --- Interfaces ---
interface Category {
  _id: string
  name: string
}
// Interface para dados do formulário (similar ao modelo, mas imagem é File | null)
interface ProductFormData {
  _id?: string // Só existe no modo edição
  name: string
  description: string
  price: number | null // Use null para campo numérico vazio
  category: string // Armazena o ID da categoria selecionada
  stock: number | null
  image: File | null // Armazena o objeto File da imagem selecionada
  currentImageUrl?: string // Para exibir imagem atual na edição
}

const router = useRouter()
const route = useRoute()

// --- Estado ---
const productData = ref<ProductFormData>({
  // Valores iniciais
  name: '',
  description: '',
  price: null,
  category: '',
  stock: null,
  image: null,
  currentImageUrl: undefined,
})
const categories = ref<Category[]>([]) // Lista de categorias para select
const imagePreviewUrl = ref<string | null>(null) // Para prévia da imagem selecionada
const productId = ref<string | null>(null)
const isLoading = ref(false) // Loading de dados para edição
const isSubmitting = ref(false)
const error = ref<string | null>(null) // Erro geral ou de carregamento
const formError = ref<string | null>(null) // Erro específico do submit

const isEditMode = computed(() => !!productId.value)
const pageTitle = computed(() => (isEditMode.value ? 'Editar Produto' : 'Adicionar Novo Produto'))

// --- Funções ---

// Busca categorias para o select
async function fetchCategories() {
  try {
    const response = await apiClient.get<Category[]>('/categories')
    categories.value = response.data
  } catch (err) {
    console.error('Erro ao buscar categorias para o formulário:', err)
    error.value = 'Falha ao carregar categorias.' // Define erro geral
  }
}

// Busca dados do produto para edição
async function fetchProductData(id: string) {
  isLoading.value = true
  error.value = null
  try {
    // GET /api/products/:id - Assumindo que esta rota existe e retorna 1 produto
    const response = await apiClient.get<any>(`/products/${id}`) // Use <any> ou defina tipo ProductOutput
    const fetchedProduct = response.data // Ajuste se a resposta for aninhada
    productData.value = {
      _id: fetchedProduct._id,
      name: fetchedProduct.name,
      description: fetchedProduct.description || '',
      price: fetchedProduct.price,
      category: fetchedProduct.category?._id || '', // Pega ID da categoria populada
      stock: fetchedProduct.stock,
      image: null, // Não preenchemos o File input, apenas mostramos a atual
      currentImageUrl: fetchedProduct.image, // Guarda URL atual para exibição
    }
    imagePreviewUrl.value = fetchedProduct.image // Mostra imagem atual na prévia inicial
  } catch (err: any) {
    console.error('Erro ao buscar dados do produto:', err)
    error.value =
      err.response?.data?.message || err.message || 'Falha ao carregar dados do produto.'
  } finally {
    isLoading.value = false
  }
}

// Lida com a seleção de arquivo de imagem
function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    productData.value.image = file
    // Gera URL temporária para prévia
    imagePreviewUrl.value = URL.createObjectURL(file)
  } else {
    productData.value.image = null
    // Se cancelou a seleção, volta a mostrar a imagem atual (se editando)
    imagePreviewUrl.value = productData.value.currentImageUrl || null
  }
}

// Submete o formulário
async function handleSubmit() {
  isSubmitting.value = true
  formError.value = null
  console.log('\n--- Iniciando handleSubmit ---')

  // 1. Criar FormData
  const formData = new FormData()
  console.log('FormData criado.')

  // 2. Anexar campos (ignorar _id e currentImageUrl)
  console.log(`Anexando name: "${productData.value.name}"`)
  formData.append('name', productData.value.name)
  console.log(`Anexando description: "${productData.value.description}"`)
  formData.append('description', productData.value.description)
  if (productData.value.price !== null) {
    console.log(`Anexando price: "${productData.value.price.toString()}"`)
    formData.append('price', productData.value.price.toString())
  } else {
    console.log('Campo price é null, não será anexado.')
    // Você pode querer adicionar validação aqui ou confiar no backend
  }
  console.log(`Anexando category: "${productData.value.category}"`)
  formData.append('category', productData.value.category)
  if (productData.value.stock !== null) {
    console.log(`Anexando stock: "${productData.value.stock.toString()}"`)
    formData.append('stock', productData.value.stock.toString())
  } else {
    console.log('Campo stock é null, não será anexado.')
    formData.append('stock', '0') // Ou envia 0 como padrão se opcional
  }

  // 3. Anexar imagem SOMENTE se uma nova foi selecionada
  if (productData.value.image) {
    console.log('Anexando imagem ao FormData:', productData.value.image)
    if (productData.value.image instanceof File) {
      console.log('-> Tipo: É um objeto File válido.')
      formData.append('image', productData.value.image)
      console.log("-> Campo 'image' anexado ao FormData.")
    } else {
      console.error('ERRO: productData.image NÃO é um objeto File!')
      formError.value = 'Ocorreu um problema com o arquivo selecionado.'
      isSubmitting.value = false // Interrompe o submit
      return // Para a execução
    }
//   } else if (!isEditMode.value) {
//     // Se está adicionando (não editando), a imagem é obrigatória
//     console.error('ERRO: Imagem é obrigatória para criar produto.')
//     formError.value = 'Por favor, selecione uma imagem para o produto.'
//     isSubmitting.value = false // Interrompe o submit
//     return // Para a execução
  } else {
    console.log('Nenhuma nova imagem selecionada para anexar (modo edição).')
  }
  // --- Log ANTES de Enviar ---
  console.log('FormData montado. Enviando requisição para API...')
  // Logar o FormData diretamente é difícil, mas podemos logar as chaves
  // for (let key of formData.keys()) { console.log(` -> Chave no FormData: ${key}`); }
  try {
    if (isEditMode.value && productId.value) {
      // --- EDITAR (PUT com FormData) ---
      console.log(`Enviando PUT para /products/${productId.value}`)
      await apiClient.put(`/products/${productId.value}`, formData, {
        // NÃO definir Content-Type manualmente aqui! Axios/navegador faz isso.
      })
      alert('Produto atualizado com sucesso!')
    } else {
      // --- ADICIONAR (POST com FormData) ---
      console.log('Enviando POST para /products')
      await apiClient.post('/products', formData)
      alert('Produto criado com sucesso!')
    }
    router.push({ name: 'admin-products' }) // Volta para a lista
  } catch (err: any) {
    console.error(`Erro ao ${isEditMode.value ? 'atualizar' : 'criar'} produto:`, err)
    console.log('Erro Response Data:', err.response?.data)
    let specificErrorMessage = `Falha ao ${isEditMode.value ? 'atualizar' : 'criar'} produto.`
    // ... (lógica de extração de erro) ...
    formError.value = specificErrorMessage
    console.log(`Erro definido na store: "${formError.value}"`) // Log do erro final
  } finally {
    isSubmitting.value = false
  }
}

// --- Lifecycle and Watchers ---
onMounted(async () => {
  await fetchCategories() // Busca categorias sempre

  const idParam = route.params.id
  if (idParam) {
    productId.value = Array.isArray(idParam) ? idParam[0] : idParam
    await fetchProductData(productId.value) // Busca produto se ID existir
  }
})

// Limpa a prévia da imagem se o objeto File for removido (ex: ao mudar de rota)
watch(
  () => productData.value.image,
  (newImage) => {
    if (!newImage && imagePreviewUrl.value && imagePreviewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl.value) // Libera memória do blob URL
      imagePreviewUrl.value = productData.value.currentImageUrl || null // Volta para atual se editando
    }
  },
)
</script>

<template>
  <div class="product-form">
    <h1>{{ pageTitle }}</h1>

    <div v-if="isLoading" class="loading-message">Carregando dados do produto...</div>
    <div v-else-if="error && !isSubmitting" class="error-message">
      Erro: {{ error }}
      <RouterLink :to="{ name: 'admin-products' }">Voltar para a Lista</RouterLink>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <!-- Nome -->
      <div class="form-group">
        <label for="name">Nome do Produto:*</label>
        <input type="text" id="name" v-model="productData.name" required />
      </div>

      <!-- Descrição -->
      <div class="form-group">
        <label for="description">Descrição:</label>
        <textarea id="description" v-model="productData.description" rows="5"></textarea>
      </div>

      <!-- Linha: Preço e Estoque -->
      <div class="form-row">
        <div class="form-group form-group-half">
          <label for="price">Preço (R$):*</label>
          <input
            type="number"
            id="price"
            v-model.number="productData.price"
            required
            step="0.01"
            min="0.01"
          />
        </div>
        <div class="form-group form-group-half">
          <label for="stock">Estoque:</label>
          <input type="number" id="stock" v-model.number="productData.stock" min="0" />
        </div>
      </div>

      <!-- Categoria -->
      <div class="form-group">
        <label for="category">Categoria:*</label>
        <select id="category" v-model="productData.category" required>
          <option disabled value="">Selecione uma categoria</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
        <div v-if="categories.length === 0 && !isLoading">
          <small
            >Nenhuma categoria encontrada.
            <RouterLink :to="{ name: 'admin-categories' }">Cadastrar categorias</RouterLink></small
          >
        </div>
      </div>

      <!-- Upload de Imagem -->
      <div class="form-group">
        <label for="image">Imagem do Produto:</label>
        <input
          type="file"
          id="image"
          @change="handleImageChange"
          accept="image/png, image/jpeg, image/webp, image/gif"
        />
        <small v-if="isEditMode && !productData.image"
          >Deixe em branco para manter a imagem atual.</small
        >
        <small v-if="isEditMode && productData.image"
          >Nova imagem selecionada substituirá a atual.</small
        >
        <small v-if="!isEditMode">Selecione uma imagem.</small>
      </div>

      <!-- Prévia da Imagem -->
      <div v-if="imagePreviewUrl" class="image-preview">
        <p>Prévia:</p>
        <img :src="imagePreviewUrl" alt="Prévia da imagem" />
      </div>

      <!-- Erro de Submit -->
      <div v-if="formError" class="error-message submit-error">
        {{ formError }}
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Produto' : 'Criar Produto' }}
        </button>
        <RouterLink
          :to="{ name: 'admin-products' }"
          tag="button"
          type="button"
          class="cancel-button"
        >
          Cancelar
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Reutiliza e adapta estilos de CategoryForm */
.product-form {
  max-width: 700px;
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
.form-group input[type='text'],
.form-group input[type='number'],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}
.form-group textarea {
  resize: vertical;
}
.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 0.85em;
  color: #666;
}
.form-row {
  display: flex;
  gap: 20px;
}
.form-group-half {
  flex: 1;
} /* Ocupa metade do espaço */

.form-group input[type='file'] {
  border: none;
  padding: 0;
}

.image-preview {
  margin-top: 15px;
}
.image-preview p {
  margin-bottom: 5px;
  font-weight: bold;
}
.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border: 1px solid #eee;
  display: block;
}

.loading-message,
.error-message {
  /* Reutilizado */
}
.submit-error {
  margin-top: 15px;
}
.form-actions {
  /* Reutilizado */
}
.form-actions button,
.form-actions .cancel-button {
  /* Reutilizado */
}
.form-actions button[type='submit'] {
  /* Reutilizado */
}
.form-actions button[type='submit']:disabled {
  /* Reutilizado */
}
.form-actions .cancel-button {
  /* Reutilizado */
}
.form-actions .cancel-button:hover {
  /* Reutilizado */
}
</style>
