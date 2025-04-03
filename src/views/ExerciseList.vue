<!-- src/components/ExerciseList.vue -->
<template>
  <div>
    <el-table :data="exercises" style="width: 100%">
      <el-table-column prop="exercise_id" label="题目ID" width="150" />
      <el-table-column label="题干" min-width="200">
        <template #default="scope">
          <el-tooltip :content="getStemContent(scope.row.stem)" placement="top" :show-after="1000">
            <div v-html="scope.row.stem" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="问题" min-width="200">
        <template #default="scope">
          <el-tooltip
            v-for="(q, index) in scope.row.questions"
            :key="index"
            :content="formatQuestion(q)"
            placement="top"
            :show-after="1000"
          >
            <div v-html="formatQuestion(q)" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="答案" min-width="200">
        <template #default="scope">
          <el-tooltip :content="getAnswerContent(scope.row.answer)" placement="top" :show-after="1000">
            <div v-html="scope.row.answer.answer_content" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="解析" min-width="200">
        <template #default="scope">
          <el-tooltip :content="getAnalysisContent(scope.row.analysis)" placement="top" :show-after="1000">
            <div v-html="scope.row.analysis.analysis_content" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="$emit('edit', scope.row, 'exercise')">编辑</el-button>
          <el-button type="danger" size="small" @click="$emit('delete', scope.row, 'exercise')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="$emit('size-change', $event)"
        @current-change="$emit('current-change', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseList',
  props: {
    exercises: { type: Array, required: true },
    currentPage: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  emits: ['edit', 'delete', 'size-change', 'current-change'],
  methods: {
    formatQuestion(question) {
      const cleanAnswer = question.question_answer.replace(/<\/?p>/g, '');
      return `${question.question_stem} ${cleanAnswer}`;
    },
    getStemContent(stem) {
      return stem.replace(/<[^>]+>/g, '');
    },
    getAnswerContent(answer) {
      return answer.answer_content.replace(/<[^>]+>/g, '');
    },
    getAnalysisContent(analysis) {
      return analysis.analysis_content.replace(/<[^>]+>/g, '');
    },
  },
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>