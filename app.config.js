// app.config.js
// 环境变量获取
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:8000/api/';
const DEV_PORT = process.env.VUE_APP_DEV_PORT || 8080;

// Vue CLI devServer 配置
const devServer = {
  port: DEV_PORT,
  client: {
    overlay: {
      runtimeErrors: (error) => {
        const ignoreErrors = [
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications.',
        ];
        return !ignoreErrors.includes(error.message);
      },
    },
  },
};

// Axios 配置
const axiosConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
};

module.exports = {
  devServer,
  axios: {
    config: axiosConfig,
  },
  app: {
    env: isProduction ? 'production' : 'development',
  },
};