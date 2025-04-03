<template>
  <div>
    <el-button type="primary" @click="$emit('show-add-dialog', 'question')">添加题目</el-button>
    <el-table :data="questions" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="question_id" label="ID" width="100" />
      <el-table-column prop="question_content" label="题干">
        <template #default="scope">
          {{ truncateContent(scope.row.question_content) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button type="text" @click="$emit('view-details', scope.row)">查看详情</el-button>
          <el-button type="text" @click="$emit('edit-item', scope.row, 'question')">编辑</el-button>
          <el-button type="text" @click="$emit('delete-item', scope.row, 'question')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  questions: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  }
});

defineEmits([
  'show-add-dialog',
  'view-details',
  'edit-item',
  'delete-item',
  'size-change',
  'current-change'
]);

const truncateContent = (content) => {
  if (!content) return '';
  return content.length > 15 ? content.substring(0, 15) + '...' : content;
};
</script> 