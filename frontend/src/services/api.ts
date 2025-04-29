// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; 
import router from '@/router'; 

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log(`API Base URL: ${baseURL}`); 

const apiClient = axios.create({
  baseURL: baseURL,
  // headers: {
  //   'Content-Type': 'application/json',
  // }
});

// Interceptador de CONFIGURAÇÃO
apiClient.interceptors.request.use(config => {
  const authStore = useAuthStore(); 
  const token = authStore.token; 
  console.log('API Client Request Interceptor - Token:', token); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de RESPOSTA
apiClient.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 401) {
    console.warn("API Client Response Interceptor: Recebido 401 do backend. Deslogando...");
    const authStore = useAuthStore();
    authStore.logout(); 
    if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' });
    }
  }
  return Promise.reject(error);
});

export default apiClient;