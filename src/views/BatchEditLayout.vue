<!-- src/views/BatchEditLayout.vue -->
<template>
    <el-container style="height: 100vh; padding: 20px;">
      <el-aside :width="isCollapsed ? '60px' : '300px'" class="filter-aside" :class="{ 'collapsed': isCollapsed }">
        <div class="toggle-button" @click="toggleCollapse">
          <el-icon :size="20">
            <ArrowLeft v-if="!isCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <exercise-filter v-if="!isCollapsed" @filter-changed="handleFilterChange" />
      </el-aside>
      <el-main class="content-main">
        <batch-edit-exercises :filters="filters" />
      </el-main>
    </el-container>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
  import ExerciseFilter from './ExerciseFilter.vue';
  import BatchEditExercises from './BatchEditExercises.vue';
  
  export default {
    name: 'BatchEditLayout',
    components: {
      ExerciseFilter,
      BatchEditExercises,
      ArrowLeft,
      ArrowRight,
    },
    setup() {
      const filters = ref({});
      const isCollapsed = ref(false);
  
      const handleFilterChange = (newFilters) => {
        filters.value = newFilters;
        // console.log('Filters applied:', newFilters);
      };
  
      const toggleCollapse = () => {
        isCollapsed.value = !isCollapsed.value;
      };
  
      return {
        filters,
        isCollapsed,
        handleFilterChange,
        toggleCollapse,
      };
    },
  };
  </script>
  
  <style scoped>
  .filter-aside {
    background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-right: 20px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .filter-aside.collapsed {
    padding: 10px;
  }
  
  .toggle-button {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s;
  }
  
  .toggle-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  .content-main {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    flex: 1;
  }
  </style>