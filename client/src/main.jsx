import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import 'vazirmatn/Vazirmatn-font-face.css' // اضافه کردن فونت رسمی
import './index.css'
import App from './App.jsx'

axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (window.wpApiSettings?.nonce) {
    config.headers['X-WP-Nonce'] = window.wpApiSettings.nonce;
  }
  return config;
});
axios.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  }
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
