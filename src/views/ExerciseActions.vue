<!-- src/components/ExerciseActions.vue -->
<template>
    <div class="exercise-actions">
      <p>筛选结果：{{ filteredCount }} 道题目</p>
      <el-button type="primary" @click="triggerAction('updateHierarchy')">层级修改</el-button>
      <el-button type="success" @click="triggerAction('updateAttributes')">属性修改</el-button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ExerciseActions',
    props: {
      filteredCount: {
        type: Number,
        default: 0,
      },
    },
    emits: ['action-triggered'],
    methods: {
      triggerAction(action) {
        this.$emit('action-triggered', action);
      },
    },
  };
  </script>
  
  <style scoped>
  .exercise-actions {
    text-align: center;
  }
  p {
    margin-bottom: 10px;
    color: #606266;
  }
  .el-button {
    margin: 0 10px;
  }
  </style>