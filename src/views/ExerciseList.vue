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
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 编辑题目弹窗 -->
    <el-dialog title="编辑题目" v-model="editDialogVisible" width="50%">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="题干">
          <el-input type="textarea" v-model="editForm.stem" :rows="3" placeholder="请输入题干内容"></el-input>
        </el-form-item>
        <el-form-item label="问题">
          <el-input type="textarea" v-model="editForm.questions" :rows="3" placeholder="请输入问题内容"></el-input>
        </el-form-item>
        <el-form-item label="答案">
          <el-input type="textarea" v-model="editForm.answer" :rows="3" placeholder="请输入答案内容"></el-input>
        </el-form-item>
        <el-form-item label="解析">
          <el-input type="textarea" v-model="editForm.analysis" :rows="3" placeholder="请输入解析内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ExerciseList',
  props: {
    exercises: { type: Array, required: true },
    currentPage: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  emits: ['edit', 'delete', 'size-change', 'current-change', 'save-exercise'],
  setup(props, { emit }) {
    const editDialogVisible = ref(false);
    const editForm = ref({
      exercise_id: null,
      stem: '',
      questions: '',
      answer: '',
      analysis: '',
      question_order: null, // 新增字段保存 question_order
    });

    // 编辑按钮点击事件
    const handleEdit = (row) => {
      editForm.value = {
        exercise_id: row.exercise_id,
        stem: row.stem || '', // 默认空字符串避免 undefined
        questions: row.questions && row.questions.length > 0 ? row.questions[0].question_stem || '' : '',
        answer: row.answer ? row.answer.answer_content || '' : '',
        analysis: row.analysis ? row.analysis.analysis_content || '' : '',
        question_order: row.questions && row.questions.length > 0 ? row.questions[0].question_order || 1 : 1, // 保留原始 order 或默认 1
      };
      editDialogVisible.value = true;
    };

    // 保存编辑
    const saveEdit = () => {
      const editedExercise = {
        exercise_id: editForm.value.exercise_id,
        stem: { stem_content: editForm.value.stem },
        questions: [{
          question_stem: editForm.value.questions,
          question_answer: '', // 如果需要编辑答案，可以扩展表单
          question_order: editForm.value.question_order || 1, // 使用保存的 order 或默认 1
        }],
        answer: { answer_content: editForm.value.answer },
        analysis: { analysis_content: editForm.value.analysis },
      };
      emit('save-exercise', editedExercise); // 发出保存事件
      editDialogVisible.value = false;
    };

    // 格式化方法
    const formatQuestion = (question) => {
      const cleanAnswer = question.question_answer.replace(/<\/?p>/g, '');
      return `${question.question_stem} ${cleanAnswer}`;
    };

    const getStemContent = (stem) => {
      return stem.replace(/<[^>]+>/g, '');
    };

    const getAnswerContent = (answer) => {
      return answer.answer_content.replace(/<[^>]+>/g, '');
    };

    const getAnalysisContent = (analysis) => {
      return analysis.analysis_content.replace(/<[^>]+>/g, '');
    };

    return {
      editDialogVisible,
      editForm,
      handleEdit,
      saveEdit,
      formatQuestion,
      getStemContent,
      getAnswerContent,
      getAnalysisContent,
    };
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