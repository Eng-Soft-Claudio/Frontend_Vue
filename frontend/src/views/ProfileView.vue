// src/views/ProfileView.vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'
import apiClient from '@/services/api'

// Interface de endereço
interface Address {
  _id: string
  user: string
  label?: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

// Usaremos Partial para o formulário para facilitar o v-model inicial
type AddressFormData = Partial<Omit<Address, 'user' | 'createdAt' | 'updatedAt'>>

// Estado do usuário
const authStore = useAuthStore()
const user = authStore.user

// Estado da lista de endereços
const addresses = ref<Address[]>([])
const isLoadingAddresses = ref(false)
const addressError = ref<string | null>(null)

// Estado do Formulário
const showAddressForm = ref(false)
const editingAddress = ref<AddressFormData | null>(null)
const isSubmittingAddress = ref(false)
const formError = ref<string | null>(null)

// Função para buscar os endereços do usuário logado
async function fetchAddresses() {
  isLoadingAddresses.value = true
  addressError.value = null
  try {
    const response = await apiClient.get<{ data: { addresses: Address[] } }>('/addresses')
    addresses.value = response.data?.data?.addresses || []
  } catch (err: any) {
    addressError.value =
      err.response?.data?.message || err.message || 'Falha ao carregar endereços.'
    addresses.value = []
  } finally {
    isLoadingAddresses.value = false
  }
}

// Abrir Formulário para Adicionar
function openAddForm() {
  editingAddress.value = {
    label: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Brasil',
    phone: '',
    isDefault: false,
  }
  formError.value = null
  showAddressForm.value = true
}

// Abrir Formulário para Editar
function openEditForm(address: Address) {
  editingAddress.value = JSON.parse(JSON.stringify(address))
  formError.value = null
  showAddressForm.value = true
}

// Fechar Formulário
function closeForm() {
  showAddressForm.value = false
  editingAddress.value = null 
  formError.value = null
}

// Submeter Adição/Edição
async function handleSubmitAddress() {
  if (!editingAddress.value) return 

  isSubmittingAddress.value = true
  formError.value = null
  const addressData = editingAddress.value 
  const isEditing = !!addressData._id 

  try {
    let savedAddress: Address
    if (isEditing) {
      // --- EDITAR (PUT) ---
      const { _id, ...updateData } = addressData
      const response = await apiClient.put<{ data: { address: Address } }>(
        `/addresses/${_id}`,
        updateData,
      )
      savedAddress = response.data.data.address

      // Atualiza na lista local
      const index = addresses.value.findIndex((a) => a._id === savedAddress._id)
      if (index !== -1) {
        addresses.value[index] = savedAddress
      } else {
        await fetchAddresses()
      }
    } else {
      const response = await apiClient.post<{ data: { address: Address } }>(
        '/addresses',
        addressData,
      )
      savedAddress = response.data.data.address

      // Adiciona na lista local
      addresses.value.push(savedAddress)
      console.log('Endereço adicionado:', savedAddress)
    }
    closeForm() 
  } catch (err: any) {
    console.error(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} endereço:`, err)
    formError.value =
      err.response?.data?.message ||
      (err.response?.data?.errors
        ? err.response.data.errors.map((e: any) => e.msg).join('. ')
        : null) ||
      err.message ||
      `Falha ao ${isEditing ? 'atualizar' : 'adicionar'} endereço.`
  } finally {
    isSubmittingAddress.value = false
  }
}

// Excluir Endereço
async function handleDeleteAddress(addressId: string) {
  if (!window.confirm('Tem certeza que deseja excluir este endereço?')) {
    return
  }
  try {
    await apiClient.delete(`/addresses/${addressId}`)
    addresses.value = addresses.value.filter((a) => a._id !== addressId)
  } catch (err: any) {
    addressError.value = err.response?.data?.message || err.message || 'Falha ao excluir endereço.'
    alert(`Erro ao excluir: ${addressError.value}`)
    addressError.value = null 
  }
}

// Definir como Padrão
async function handleSetDefault(address: Address) {
  if (address.isDefault) return 

  console.log('Definindo como padrão:', address._id)
  isLoadingAddresses.value = true 
  try {
    await apiClient.put(`/addresses/${address._id}`, { ...address, isDefault: true })
    console.log('Endereço definido como padrão, recarregando lista...')
    await fetchAddresses() 
  } catch (err: any) {
    console.error('Erro ao definir endereço padrão:', err)
    addressError.value =
      err.response?.data?.message || err.message || 'Falha ao definir endereço padrão.'
    alert(`Erro: ${addressError.value}`)
    isLoadingAddresses.value = false 
  }
}

// --- Lifecycle Hook ---
onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchAddresses()
  }
})

</script>

<template>
  <div class="profile-view">
    <h1>Meu Perfil</h1>
    <div v-if="user" class="user-details">
      <!-- Detalhes do usuário -->
      <p><strong>Nome:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <!-- ... -->
    </div>
    <!-- ... -->

    <hr />

    <h2>Meus Endereços</h2>

    <!-- Formulário de Adicionar/Editar Endereço (Condicional) -->
    <div v-if="showAddressForm" class="address-form-container">
      <h3>{{ editingAddress?._id ? 'Editar Endereço' : 'Adicionar Novo Endereço' }}</h3>
      <form @submit.prevent="handleSubmitAddress">
        <!-- Campo: Label (Apelido) -->
        <div class="form-group">
          <label for="label">Apelido (ex: Casa, Trabalho):</label>
          <input type="text" id="label" v-model="editingAddress!.label">
        </div>

        <!-- Linha: Rua e Número -->
        <div class="form-row">
            <div class="form-group form-group-street">
                <label for="street">Rua/Logradouro:*</label>
                <input type="text" id="street" v-model="editingAddress!.street" required>
            </div>
            <div class="form-group form-group-number">
                <label for="number">Número:*</label>
                <input type="text" id="number" v-model="editingAddress!.number" required>
            </div>
        </div>

         <!-- Campo: Complemento -->
        <div class="form-group">
          <label for="complement">Complemento:</label>
          <input type="text" id="complement" v-model="editingAddress!.complement">
        </div>

         <!-- Campo: Bairro -->
        <div class="form-group">
          <label for="neighborhood">Bairro:*</label>
          <input type="text" id="neighborhood" v-model="editingAddress!.neighborhood" required>
        </div>

        <!-- Linha: Cidade e Estado -->
         <div class="form-row">
            <div class="form-group form-group-city">
                <label for="city">Cidade:*</label>
                <input type="text" id="city" v-model="editingAddress!.city" required>
            </div>
            <div class="form-group form-group-state">
                <label for="state">Estado (UF):*</label>
                <input type="text" id="state" v-model="editingAddress!.state" required maxlength="2" pattern="[A-Za-z]{2}">
            </div>
        </div>

         <!-- Linha: CEP e País -->
         <div class="form-row">
            <div class="form-group form-group-postalCode">
                <label for="postalCode">CEP:*</label>
                <!-- Adicionar máscara ou validação de formato se desejar -->
                <input type="text" id="postalCode" v-model="editingAddress!.postalCode" required pattern="\d{5}-?\d{3}">
                 <small>Formato: 12345-678 ou 12345678</small>
            </div>
             <div class="form-group form-group-country">
                <label for="country">País:*</label>
                <input type="text" id="country" v-model="editingAddress!.country" required>
            </div>
        </div>

        <!-- Campo: Telefone -->
        <div class="form-group">
          <label for="phone">Telefone (Opcional):</label>
          <input type="tel" id="phone" v-model="editingAddress!.phone">
        </div>

        <!-- Checkbox: Endereço Padrão -->
        <div class="form-group-checkbox">
             <input type="checkbox" id="isDefault" v-model="editingAddress!.isDefault">
             <label for="isDefault">Definir como endereço padrão</label>
        </div>

        <!-- Erro do Formulário -->
        <div v-if="formError" class="error-message form-error">
            {{ formError }}
        </div>

        <!-- Botões do Formulário -->
        <div class="form-actions">
            <button type="submit" :disabled="isSubmittingAddress">
            {{ isSubmittingAddress ? 'Salvando...' : (editingAddress?._id ? 'Atualizar Endereço' : 'Adicionar Endereço') }}
            </button>
            <button type="button" @click="closeForm" :disabled="isSubmittingAddress">Cancelar</button>
        </div>
      </form>
      <hr style="margin-top: 30px;"/>
    </div>

    <!-- Seção da Lista de Endereços -->
    <div v-if="isLoadingAddresses" class="loading-message">
      <p>Carregando endereços...</p>
    </div>
    <div v-else-if="addressError" class="error-message">
      <p>Erro ao carregar endereços: {{ addressError }}</p>
       <button @click="fetchAddresses">Tentar Novamente</button> <!-- Botão para tentar recarregar -->
    </div>
    <div v-else-if="addresses.length === 0 && !showAddressForm"> <!-- Só mostra se o form não estiver aberto -->
      <p>Você ainda não cadastrou nenhum endereço.</p>
      <button @click="openAddForm">Adicionar Novo Endereço</button>
    </div>
    <div v-else class="address-list">
      <!-- Botão Adicionar aparece aqui se a lista não estiver vazia E o form fechado -->
       <button v-if="!showAddressForm" @click="openAddForm" style="margin-bottom: 20px;">Adicionar Novo Endereço</button>

      <div v-for="address in addresses" :key="address._id" class="address-item" :class="{ 'default-address': address.isDefault }">
        <h4>
          <span v-if="address.label">{{ address.label }}</span>
          <span v-else>Endereço</span>
          <span v-if="address.isDefault" class="default-badge"> (Padrão)</span>
        </h4>
        <p>
          {{ address.street }}, {{ address.number }} {{ address.complement ? `- ${address.complement}` : '' }} <br />
          {{ address.neighborhood }} - {{ address.city }} / {{ address.state }} <br />
          CEP: {{ address.postalCode }}
          <span v-if="address.phone"> | Tel: {{ address.phone }}</span>
        </p>
        <div class="address-actions">
          <button @click="openEditForm(address)" :disabled="showAddressForm">Editar</button> <!-- Desabilita se form aberto -->
          <button @click="handleDeleteAddress(address._id)">Excluir</button>
          <button v-if="!address.isDefault" @click="handleSetDefault(address)" :disabled="showAddressForm">Definir como Padrão</button> <!-- Desabilita se form aberto -->
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- Estilos Anteriores --- */
.profile-view { max-width: 700px; margin: 30px auto; padding: 20px; }
.user-details p, .address-item p { margin-bottom: 8px; line-height: 1.5; }
.user-details strong, .address-item strong { margin-right: 5px; }
hr { margin: 30px 0; border: 0; border-top: 1px solid #eee; }
.loading-message, .error-message { padding: 15px; border-radius: 5px; margin-bottom: 20px; }
.loading-message { background-color: #eef; }
.error-message { background-color: #fdd; color: red; }
.address-list { margin-top: 15px; }
.address-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; position: relative; }
.address-item h4 { margin: 0 0 10px 0; }
.default-address { border-left: 5px solid hsla(160, 100%, 37%, 1); }
.default-badge { font-size: 0.9em; font-weight: bold; color: hsla(160, 100%, 37%, 1); }
.address-actions { margin-top: 10px; display: flex; gap: 10px; }
.address-actions button { padding: 5px 10px; font-size: 0.9em; cursor: pointer; }

/* --- Estilos do Formulário --- */
.address-form-container {
    border: 1px solid #ccc;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 8px;
    background-color: #f9f9f9;
}
.address-form-container h3 {
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}
.form-group, .form-group-checkbox {
    margin-bottom: 15px;
}
.form-group label, .form-group-checkbox label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 0.95em;
}
.form-group input[type="text"],
.form-group input[type="tel"],
.form-group input[type="email"] /* Adicionar se tiver email no form */
{
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
.form-group small { /* Ajuda para formato do CEP */
    display: block;
    margin-top: 4px;
    font-size: 0.85em;
    color: #666;
}

.form-row {
    display: flex;
    gap: 15px; /* Espaçamento entre colunas */
    margin-bottom: 15px; /* Espaçamento abaixo da linha */
}
/* Ajuste de largura das colunas (exemplo) */
.form-group-street { flex: 3; } /* Rua ocupa mais espaço */
.form-group-number { flex: 1; }
.form-group-city { flex: 2; }
.form-group-state { flex: 1; }
.form-group-postalCode { flex: 1; }
.form-group-country { flex: 1; }

.form-group-checkbox {
    display: flex;
    align-items: center;
}
.form-group-checkbox input[type="checkbox"] {
    margin-right: 10px;
}
.form-group-checkbox label {
    margin-bottom: 0; /* Remove margem inferior do label do checkbox */
    font-weight: normal; /* Deixa o label normal */
}

.form-error { /* Estilo específico para erro do form */
    margin-top: 15px;
    text-align: center; /* Centraliza erro do form */
}

.form-actions {
    display: flex;
    justify-content: flex-end; /* Alinha botões à direita */
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}
.form-actions button {
    padding: 10px 20px;
    font-size: 1em;
}
.form-actions button[type="button"] { /* Estilo para Cancelar */
    background-color: #eee;
    color: #333;
    border: 1px solid #ccc;
}
.form-actions button[type="button"]:hover {
     background-color: #ddd;
}

</style>