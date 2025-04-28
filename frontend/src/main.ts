// src/main.ts

import './assets/main.css' // Estilos globais

import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importa Pinia

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth' // Importa a store de autenticação

// Cria a instância da aplicação Vue
const app = createApp(App)

// Cria e instala o Pinia (gerenciador de estado)
const pinia = createPinia()
app.use(pinia)

// ----- Bloco de Inicialização da Autenticação -----
// Obtém uma instância da store DEPOIS que o Pinia foi instalado
const authStore = useAuthStore();

// Tenta buscar os dados do usuário se um token existir no localStorage
// Fazemos isso ANTES de montar a aplicação principal
// Envolvemos em uma função async auto-executável para usar await
(async () => {
  try {
      await authStore.fetchUser(); // Tenta carregar os dados do usuário
      console.log("Verificação inicial de usuário concluída.");
  } catch (error) {
      console.error("Erro durante a verificação inicial do usuário:", error);
      // Pode optar por chamar authStore.logout() aqui se fetchUser falhar gravemente
  } finally {
      // Instala o Router DEPOIS de potencialmente ter os dados do usuário
      // Isso é importante se as guardas de rota dependerem do estado de autenticação
      app.use(router);

      // Monta a aplicação Vue no elemento #app do index.html
      // Fazemos isso por último para garantir que tudo esteja pronto
      app.mount('#app');
      console.log("Aplicação montada.");
  }
})();
// ----- Fim do Bloco de Inicialização da Autenticação -----

// Nota: A ordem importa:
// 1. Criar App Vue
// 2. Criar e Usar Pinia (app.use(pinia))
// 3. Obter instância da Auth Store
// 4. (async) Tentar authStore.fetchUser()
// 5. Usar Router (app.use(router)) - Dentro do finally para garantir execução
// 6. Montar App (app.mount('#app')) - Dentro do finally para garantir execução