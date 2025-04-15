// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 使用动态导入实现懒加载
const ExerciseManage = () => import('../views/ExerciseManage.vue');
const ExamPaper = () => import('../views/ExamPaper.vue');
const UserManage = () => import('../views/UserManage.vue');
const PermissionManage = () => import('../views/RoleManage.vue')
// const BatchEditExercises = () => import('../views/BatchEditExercises.vue')
const BatchEditLayout = () => import('../views/BatchEditLayout.vue')
const PlaceHolder = () => import('../views/PlaceHolder.vue')
const UserLogin = () => import('../components/Login.vue')
const UserRegister = () => import('../components/Register.vue')
const UserHome = () => import('../views/Home.vue')
const UserActionLog = () => import('../views/UserActionLog.vue')
const ImportExport = () => import('../views/ExerciseImportExport.vue')


const routes = [
 
  { path: '/login', name: 'Login', component: UserLogin },
  { path: '/register', name: 'Register', component: UserRegister },
  { path: '/', redirect: '/login' }, // 默认重定向到登录页面
  { path: '/:pathMatch(.*)*', redirect: '/login' }, // 未匹配路由也重定向到登录
  { path: '/home', name: 'Home', component: UserHome, meta: { requiresAuth: true } },
  { path: '/exercise/batch-edit', name: 'ExerciseEdit', component: BatchEditLayout }, // 题库管理
  { path: '/chapter', name: 'chapter', component: ExerciseManage }, // 试卷管理
  { path: '/exam-paper', name: 'ExamPaper', component: ExamPaper }, // 试卷管理
  { path: '/knowledge', name: 'Knowledge', component: PlaceHolder }, // 知识点管理
  { path: '/user-management', name: 'UserManage', component: UserManage }, // 用户管理
  { path: '/permission-management', name: 'PermissionManage', component: PermissionManage }, // 权限管理
  { path: '/user-log', name: 'UserActionLog', component: UserActionLog }, // 日志管理
  { path: '/import-export', name: 'ExerciseImportExport', component: ImportExport },
  { path: '/toolbox/crawler-tool', name: 'CrawlerTool', component: PlaceHolder },
  { path: '/toolbox/llm-analysis', name: 'LlmAnalysis', component: PlaceHolder },
  { path: '/toolbox/format-convert', name: 'FormatConvert', component: PlaceHolder },
  { path: '/toolbox/image-upload', name: 'ImageUpload', component: PlaceHolder },

  // 题库管理的子路由
  { path: '/exercise/major/:categoryId', name: 'Major', component: ExerciseManage },
  { path: '/exercise/major/:categoryId/chapter/:majorId', name: 'Chapter', component: ExerciseManage },
  { path: '/exercise/major/:categoryId/chapter/:majorId/examgroup/:chapterId', name: 'ExamGroup', component: ExerciseManage },
  { path: '/exercise/major/:categoryId/chapter/:majorId/examgroup/:chapterId/exercises/:examgroupId', name: 'Exercises', component: ExerciseManage }, // 修改为 exercises
  { path: '/exercise/batch-edit',name: 'BatchEditLayout',component: BatchEditLayout,},

  { path: '/exam/category/:categoryId',name: 'School',component: ExamPaper,},
  { path: '/exam/category/:categoryId/school/:school',name: 'ExamTimes',component: ExamPaper,},
  { path: '/exam/category/:categoryId/school/:school/examtime/:examtime',name: 'ExamFullNames',component: ExamPaper,}


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.path === '/login' && token) {
    next('/home'); // 已登录时访问 /login 跳转到 /home
  } else {
    next();
  }
});

export default router;