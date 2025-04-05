// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 使用动态导入实现懒加载
const ExerciseManage = () => import('../views/ExerciseManage.vue');
const ExamPaper = () => import('../views/ExamPaper.vue');
const PermissionManage = () => import('../views/PermissionManage.vue');
// const BatchEditExercises = () => import('../views/BatchEditExercises.vue')
const BatchEditLayout = () => import('../views/BatchEditLayout.vue')
const PlaceHolder = () => import('../views/PlaceHolder.vue')

const routes = [
  { path: '/', name: 'Home', component: PlaceHolder }, // 首页
  { path: '/exercise/batch-edit', name: 'ExerciseEdit', component: BatchEditLayout }, // 题库管理
  { path: '/chapter', name: 'chapter', component: ExerciseManage }, // 试卷管理
  { path: '/exam-paper', name: 'ExamPaper', component: ExamPaper }, // 试卷管理
  { path: '/knowledge', name: 'Knowledge', component: PlaceHolder }, // 知识点管理
  { path: '/user-management', name: 'PermissionManage', component: PermissionManage }, // 用户管理
  { path: '/permission', name: 'Permission', component: PlaceHolder }, // 权限管理
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

export default router;