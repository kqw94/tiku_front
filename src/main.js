import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router'; // 引入路由配置

const app = createApp(App);
app.use(ElementPlus);
app.use(router); // 注册 vue-router
app.mount('#app');
