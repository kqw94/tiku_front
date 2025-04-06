<template>
  <div>
    <el-button type="primary" @click="$emit('add', 'category')">添加专业</el-button>
    <el-table :data="categories" style="width: 100%; margin-top: 20px;" border>
      <el-table-column prop="category_id" label="ID" width="100" />
      <el-table-column prop="category_name" label="专业" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button type="text" @click="$emit('view-majors', scope.row)">查看科目</el-button>
          <el-button type="text" @click="$emit('edit', scope.row, 'category')">编辑</el-button>
          <el-button type="text" @click="$emit('delete', scope.row, 'category')">删除</el-button>
          <el-button type="text" @click="$emit('export-exercises', scope.row)">导出</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-if="total > 0"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryList',
  props: {
    categories: { type: Array, required: true },
    currentPage: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  emits: ['add', 'view-majors', 'edit', 'delete', 'size-change', 'current-change', 'batch-edit', 'export-exercises'],
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>