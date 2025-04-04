<template>
    <div class="toolbox-placeholder">
      <el-empty description="功能开发中，敬请期待！">
        <template #image>
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#909399"/>
          </svg>
        </template>
      </el-empty>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .toolbox-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }
  .el-empty {
    padding: 50px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  </style>