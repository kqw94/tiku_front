import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router'; // 引入路由配置
import axios from 'axios';

// 配置 Axios
axios.defaults.baseURL = 'http://127.0.0.1:8000/api/';

// 请求拦截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => Promise.reject(error));

  

// 响应拦截器
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 添加重试计数器
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    if (error.response?.status === 401 && originalRequest._retryCount < 1) {
      originalRequest._retryCount += 1;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // 刷新令牌失败，清除认证数据并重定向
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.push('/login');
          return Promise.reject(refreshError);
        }
      } else {
        // 无刷新令牌，重定向到登录
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.push('/login');
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
