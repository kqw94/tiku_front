<template>
  <el-container style="height: 100vh;">
    <!-- 左侧菜单 -->
    <el-aside width="200px">
      <!-- 左上角标题 -->
      <div class="logo">题库管理系统</div>
      <el-menu :default-active="activeMenu" @select="handleMenuSelect">
        <!-- 首页 -->
        <el-menu-item index="home">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 题库管理（带子菜单） -->
        <el-sub-menu index="question">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>题库管理</span>
          </template>
          <el-menu-item index="exercise">
            <el-icon><Collection /></el-icon>
            <span>题库管理</span>
          </el-menu-item>
          <el-menu-item index="exam-paper">
            <el-icon><Tickets /></el-icon>
            <span>试卷管理</span>
          </el-menu-item>
          <el-menu-item index="knowledge">
            <el-icon><Notebook /></el-icon>
            <span>知识点管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 用户管理（带子菜单） -->
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="user-management">
            <el-icon><Avatar /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="permission">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header>
        <el-row type="flex" align="middle">
          <el-col :span="12"><div></div></el-col>
          <el-col :span="12" style="text-align: right;">
            <el-dropdown>
              <span class="el-dropdown-link">
                管理员<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-header>

      <!-- 主内容区域 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  House, 
  Document, 
  Collection, 
  Tickets, 
  Notebook, 
  User, 
  Avatar, 
  Lock, 
  ArrowDown 
} from '@element-plus/icons-vue';

const activeMenu = ref('home');
const router = useRouter();

const handleMenuSelect = (key) => {
  activeMenu.value = key;
  const routeMap = {
    'home': '/',
    'exercise': '/exercise',
    'exam-paper': '/exam-paper',
    'knowledge': '/knowledge',
    'user-management': '/user-management',
    'permission': '/permission',
  };
  router.push(routeMap[key] || '/');
};
</script>

<style scoped>
.logo {
  font-size: 20px;
  font-weight: bold;
  height: 60px; /* 与 el-header 高度一致 */
  line-height: 60px; /* 垂直居中 */
  text-align: center;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
}
.el-header {
  height: 60px; /* 固定高度，与 logo 一致 */
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px; /* 调整内边距 */
}
.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}
.el-menu {
  border-right: none; /* 移除菜单右侧边框，与 aside 对齐 */
}
.el-dropdown-link {
  line-height: 60px; /* 与 header 高度对齐 */
}
</style>