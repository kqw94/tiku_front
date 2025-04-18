import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router'; // 引入路由配置
import axios from 'axios';

// 配置 Axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';

// 全局刷新锁
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !config.url.includes('/token/refresh/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

  

// 响应拦截器
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/token/refresh/')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/token/refresh/', { refresh: refreshToken });
          const newAccessToken = response.data.access;
          const newRefreshToken = response.data.refresh; // 获取新的 refresh_token
          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken); // 更新 refresh_token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/login');
          app.config.globalProperties.$message.error('会话已过期，请重新登录');
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.push('/login');
        app.config.globalProperties.$message.error('请先登录');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);
app.use(ElementPlus);
app.use(router); // 注册 vue-router
app.config.globalProperties.$axios = axios; // 全局注入 Axios
app.mount('#app');
