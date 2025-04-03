// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 使用动态导入实现懒加载
const ExerciseManage = () => import('../views/ExerciseManage.vue');
const ExamPaper = () => import('../views/ExamPaper.vue');
const PermissionManage = () => import('../views/PermissionManage.vue');
const BlankPage = () => import('../views/BlankPage.vue');

const routes = [
  { path: '/', name: 'Home', component: BlankPage }, // 首页
  { path: '/exercise', name: 'ExerciseManage', component: ExerciseManage }, // 题库管理
  { path: '/exam-paper', name: 'ExamPaper', component: ExamPaper }, // 试卷管理
  { path: '/knowledge', name: 'Knowledge', component: BlankPage }, // 知识点管理
  { path: '/user-management', name: 'PermissionManage', component: PermissionManage }, // 用户管理
  { path: '/permission', name: 'Permission', component: BlankPage }, // 权限管理
  // 题库管理的子路由
  { path: '/exercise/major/:categoryId', name: 'Major', component: ExerciseManage },
  { path: '/exercise/major/:categoryId/chapter/:majorId', name: 'Chapter', component: ExerciseManage },
  { path: '/exercise/major/:categoryId/chapter/:majorId/examgroup/:chapterId', name: 'ExamGroup', component: ExerciseManage },
  { path: '/exercise/major/:categoryId/chapter/:majorId/examgroup/:chapterId/exercises/:examgroupId', name: 'Exercises', component: ExerciseManage }, // 修改为 exercises
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;