<!-- src/components/ExerciseFilter.vue -->
<template>
    <div class="exercise-filter">
      <h3>属性筛选</h3>
      <el-collapse v-model="activePanels" accordion>
        <!-- 搜索面板 -->
        <el-collapse-item title="搜索" name="search">
          <el-form label-position="top">
            <el-form-item label="搜索类型">
              <el-select v-model="filters.search_type" placeholder="搜索类型" style="width: 100%;">
                <el-option label="ID" value="id" />
                <el-option label="内容" value="content" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="filters.search" placeholder="请输入搜索关键词" @keyup.enter="applyFilters" />
            </el-form-item>
          </el-form>
        </el-collapse-item>
  
        <!-- 分类层级 -->
        <el-collapse-item title="分类层级" name="category">
          <el-form label-position="top">
            <el-form-item label="类别">
              <el-select v-model="filters.category" placeholder="选择类别" clearable>
                <el-option v-for="item in categories" :key="item.category_id" :label="item.category_name" :value="item.category_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="专业">
              <el-select v-model="filters.major" placeholder="选择专业" clearable>
                <el-option v-for="item in majors" :key="item.major_id" :label="item.major_name" :value="item.major_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="章节">
              <el-select v-model="filters.chapter" placeholder="选择章节" clearable>
                <el-option v-for="item in chapters" :key="item.chapter_id" :label="item.chapter_name" :value="item.chapter_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="考试组">
              <el-select v-model="filters.exam_group" placeholder="选择考试组" clearable>
                <el-option v-for="item in examGroups" :key="item.examgroup_id" :label="item.examgroup_name" :value="item.examgroup_id" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>
  
        <!-- 属性筛选 -->
        <el-collapse-item title="题目属性" name="attributes">
          <el-form label-position="top">
            <el-form-item label="题型">
              <el-select v-model="filters.exercise_type" placeholder="选择题型" clearable>
                <el-option v-for="item in exerciseTypes" :key="item.type_id" :label="item.type_name" :value="item.type_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源">
              <el-select v-model="filters.source" placeholder="选择来源" clearable>
                <el-option v-for="item in sources" :key="item.source_id" :label="item.source_name" :value="item.source_id" />
              </el-select>
            </el-form-item>
            <el-form-item label="难度">
              <el-slider v-model="filters.level" :min="1" :max="5" show-stops />
            </el-form-item>
            <el-form-item label="分数">
              <el-input-number v-model="filters.score_min" :min="0" :max="100" placeholder="最低分" />
              <el-input-number v-model="filters.score_max" :min="0" :max="100" placeholder="最高分" style="margin-left: 10px;" />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
  
      <div class="actions">
        <exercise-actions :filtered-count="filteredCount" @action-triggered="handleAction" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  import axios from 'axios';
  import ExerciseActions from './ExerciseActions.vue';
  
  const activePanels = ref('search'); // 默认展开搜索面板
  const filters = ref({
    search: '',
    search_type: 'id',
    category: null,
    major: null,
    chapter: null,
    exam_group: null,
    exercise_type: null,
    source: null,
    level: 1,
    score_min: null,
    score_max: null,
  });
  const filteredCount = ref(0);
  
  const categories = ref([]);
  const majors = ref([]);
  const chapters = ref([]);
  const examGroups = ref([]);
  const exerciseTypes = ref([]);
  const sources = ref([]);
  
  const fetchOptions = async () => {
    try {
      const endpoints = {
        categories: '/api/categories/',
        majors: '/api/majors/',
        chapters: '/api/chapters/',
        examGroups: '/api/exam-groups/',
        exerciseTypes: '/api/exercise-types/',
        sources: '/api/sources/',
      };
      const responses = await Promise.all(
        Object.values(endpoints).map(url => axios.get(`http://127.0.0.1:8000${url}`))
      );
      [categories.value, majors.value, chapters.value, examGroups.value, exerciseTypes.value, sources.value] = responses.map(res => res.data);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };
  
  const applyFilters = () => {
    emit('filter-changed', { ...filters.value });
  };
  
  watch(filters, () => {
    applyFilters();
  }, { deep: true });
  
  const handleAction = (action) => {
    console.log('Action triggered:', action);
  };
  
  const emit = defineEmits(['filter-changed']);
  onMounted(fetchOptions);
  </script>
  
  <style scoped>
  .exercise-filter {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #303133;
  }
  .el-collapse {
    flex: 1;
    overflow-y: auto;
    border: none;
  }
  .el-collapse-item__header {
    font-weight: bold;
    color: #606266;
    background-color: #f9fafc;
    padding: 0 10px;
  }
  .el-form-item {
    margin-bottom: 15px;
  }
  .actions {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e6e6e6;
  }
  </style>