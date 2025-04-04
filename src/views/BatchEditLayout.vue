<!-- src/views/BatchEditLayout.vue -->
<template>
    <el-container style="height: 100vh; padding: 20px;">
      <el-aside width="300px" class="filter-aside">
        <exercise-filter @filter-changed="handleFilterChange" />
      </el-aside>
      <el-main class="content-main">
        <batch-edit-exercises :filtered-exercises="filteredExercises" />
      </el-main>
    </el-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import ExerciseFilter from '../components/ExerciseFilter.vue';
  import BatchEditExercises from './BatchEditExercises.vue';
  import axios from 'axios';
  
  const filteredExercises = ref([]);
  
  const handleFilterChange = (filters) => {
    console.log('Filters applied:', filters);
    fetchFilteredExercises(filters);
  };
  
  const fetchFilteredExercises = async (filters) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/exercises/', { params: filters });
      filteredExercises.value = response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch filtered exercises:', error);
    }
  };
  </script>
  
  <style scoped>
  .filter-aside {
    background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-right: 20px;
  }
  .content-main {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
  }
  </style>