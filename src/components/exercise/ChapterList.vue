<template>
  <div>
    <el-button type="primary" @click="$emit('show-add-dialog', 'chapter')">添加章节</el-button>
    <el-table :data="chapters" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="chapter_id" label="ID" width="100" />
      <el-table-column prop="chapter_name" label="章节" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button type="text" @click="$emit('view-exam-groups', scope.row)">查看</el-button>
          <el-button type="text" @click="$emit('edit-item', scope.row, 'chapter')">编辑</el-button>
          <el-button type="text" @click="$emit('delete-item', scope.row, 'chapter')">删除</el-button>
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
  chapters: {
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
  'view-exam-groups',
  'edit-item',
  'delete-item',
  'size-change',
  'current-change'
]);
</script> 