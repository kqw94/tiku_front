<template>
    <div class="home">
      <h1>欢迎，{{ user.username }}!</h1>
      <!-- <p>角色：{{ user.role }}</p> -->
      <!-- 移除退出按钮 -->
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'UserHome',
    setup() {
      const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
      return { user };
    },
  };
  </script>
  
  <style scoped>
  .home {
    padding: 20px;
  }
  </style>