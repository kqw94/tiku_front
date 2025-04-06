<template>
  <div id="app">
    <!-- 如果是登录或注册页面，直接渲染全屏路由视图 -->
    <router-view v-if="$route.path === '/login' || $route.path === '/register'" />
    <!-- 否则，应用带侧边栏和顶部导航的布局 -->
    <el-container v-else style="height: 100vh;">
      <!-- 左侧菜单 -->
      <el-aside width="200px">
        <div class="logo">题库管理系统</div>
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="home">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-sub-menu index="question">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>题库管理</span>
            </template>
            <el-menu-item index="exercise-batch-edit">
              <el-icon><Edit /></el-icon>
              <span>题库编辑</span>
            </el-menu-item>
            <el-menu-item index="chapter">
              <el-icon><Collection /></el-icon>
              <span>章节管理</span>
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
          <el-sub-menu index="toolbox">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>工具箱</span>
            </template>
            <el-menu-item index="crawler-tool">
              <el-icon><Search /></el-icon>
              <span>爬虫工具</span>
            </el-menu-item>
            <el-menu-item index="llm-analysis">
              <el-icon><Cpu /></el-icon>
              <span>大模型解析</span>
            </el-menu-item>
            <el-menu-item index="format-convert">
              <el-icon><Edit /></el-icon>
              <span>格式转换</span>
            </el-menu-item>
            <el-menu-item index="image-upload">
              <el-icon><Upload /></el-icon>
              <span>图片上传</span>
            </el-menu-item>
          </el-sub-menu>
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
        <el-header>
          <el-row type="flex" align="middle">
            <el-col :span="12"><div></div></el-col>
            <el-col :span="12" style="text-align: right;">
              <el-dropdown @command="handleDropdownCommand">
                <span class="el-dropdown-link">
                  {{ user.username || '管理员' }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-col>
          </el-row>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted, watch } from 'vue'; // 引入 getCurrentInstance
import { useRouter, useRoute } from 'vue-router';
import { 
  House, Document, Collection, Tickets, Notebook, User, Avatar, Lock, ArrowDown,
  Tools, Search, Cpu, Edit, Upload 
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const instance = getCurrentInstance(); // 获取组件实例
const activeMenu = computed(() => route.path.split('/')[1] || 'home');
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

// 监听 localStorage 变化
const updateUser = () => {
  user.value = JSON.parse(localStorage.getItem('user') || '{}');
};

// 在组件挂载时监听 storage 事件
onMounted(() => {
  window.addEventListener('storage', updateUser);
  updateUser(); // 初始加载时更新一次
});

// 当路由变化时更新 user（可选）
watch(() => route.path, () => {
  updateUser();
});



const handleMenuSelect = (key) => {
  const routeMap = {
    'home': '/home',
    'exercise-batch-edit': '/exercise/batch-edit',
    'chapter': '/chapter',
    'exam-paper': '/exam-paper',
    'knowledge': '/knowledge',
    'user-management': '/user-management',
    'permission': '/permission-management',
    'crawler-tool': '/toolbox/crawler-tool',
    'llm-analysis': '/toolbox/llm-analysis',
    'format-convert': '/toolbox/format-convert',
    'image-upload': '/toolbox/image-upload',
  };
  router.push(routeMap[key] || '/home');
};

const handleDropdownCommand = async (command) => {
  if (command === 'logout') {
    try {
      await instance.appContext.config.globalProperties.$axios.post('/logout/', {});
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      instance.appContext.config.globalProperties.$message.success('退出成功');
      router.push('/login');
    } catch (error) {
      instance.appContext.config.globalProperties.$message.error('退出失败');
    }
  }
};

</script>

<style scoped>
.logo {
  font-size: 20px;
  font-weight: bold;
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
}
.el-header {
  height: 60px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}
.el-aside {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}
.el-menu {
  border-right: none;
}
.el-dropdown-link {
  line-height: 60px;
  cursor: pointer;
}
</style>