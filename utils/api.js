import axios from 'axios';

const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://matrimony-backend-b7qz.onrender.com" 
}); 
  
api.interceptors.request.use((config) => { 
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("token"); 
    if (token) { 
      config.headers.Authorization = `Bearer ${token}`; 
    } 
  }
  return config; 
});

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token");
  }
  return null;
};

export default api;
