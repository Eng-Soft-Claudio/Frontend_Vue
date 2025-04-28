// src/services/api.ts
import axios from 'axios';

// URL base da sua API backend.
// Idealmente, virá de uma variável de ambiente.
// O 'import.meta.env.VITE_API_BASE_URL' busca a variável VITE_API_BASE_URL de um arquivo .env
// Se não encontrar, usa 'http://localhost:5000/api' como padrão (bom para desenvolvimento local)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log(`API Base URL: ${baseURL}`); // Útil para debug no console do navegador

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    // Outros headers que sua API possa sempre esperar podem ir aqui
  }
});

// Exportamos a instância configurada do Axios para ser usada em outros lugares
export default apiClient;