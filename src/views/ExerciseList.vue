<template>
  <div>
    <el-table :data="exercises" style="width: 100%">
      <el-table-column prop="exercise_id" label="题目ID" width="150" />
      <el-table-column label="题干" min-width="200">
        <template #default="scope">
          <el-tooltip :content="getStemContent(scope.row.stem)" placement="top" :show-after="1000">
            <div v-html="scope.row.stem || ''" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="问题" min-width="200">
        <template #default="scope">
          <el-tooltip
            v-for="(q, index) in scope.row.questions || []"
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
          <el-tooltip
            :content="getAnswerContent(scope.row.answer)"
            placement="top"
            :show-after="1000"
          >
            <div v-html="scope.row.answer?.answer_content || ''" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="解析" min-width="200">
        <template #default="scope">
          <el-tooltip
            :content="getAnalysisContent(scope.row.analysis)"
            placement="top"
            :show-after="1000"
          >
            <div v-html="scope.row.analysis?.analysis_content || ''" class="truncate"></div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            type="danger"
            size="small"
            @click="$emit('delete', scope.row, 'exercise')"
          >
            删除
          </el-button>
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
          <el-input
            type="textarea"
            v-model="editForm.stem"
            :rows="3"
            placeholder="请输入题干内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="问题">
          <div v-for="(question, index) in editForm.questions" :key="index">
            <el-form-item :label="`选项 ${question.question_stem || String.fromCharCode(65 + index)}`">
              <el-input
                v-model="question.question_stem"
                placeholder="请输入选项标识（如 A、B）"
                style="width: 100px; margin-right: 10px;"
              ></el-input>
              <el-input
                v-model="question.question_answer"
                placeholder="请输入选项内容"
                style="width: calc(100% - 110px);"
              ></el-input>
            </el-form-item>
          </div>
          <el-form-item v-if="!editForm.questions || editForm.questions.length === 0">
            <el-button type="info" disabled>暂无问题</el-button>
          </el-form-item>
        </el-form-item>
        <el-form-item label="答案">
          <el-input
            type="textarea"
            v-model="editForm.answer"
            :rows="3"
            placeholder="请输入答案内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="解析">
          <el-input
            type="textarea"
            v-model="editForm.analysis"
            :rows="3"
            placeholder="请输入解析内容"
          ></el-input>
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
      questions: [],
      answer: '',
      analysis: '',
    });

    // 编辑按钮点击事件
    const handleEdit = (row) => {
      editForm.value = {
        exercise_id: row.exercise_id,
        stem: row.stem || '',
        questions: (row.questions || []).map((q, index) => ({
          question_order: q.question_order || index + 1,
          question_stem: q.question_stem || String.fromCharCode(65 + index), // 默认 A, B, C...
          question_answer: q.question_answer || '',
        })),
        answer: row.answer?.answer_content || '',
        analysis: row.analysis?.analysis_content || '',
      };
      editDialogVisible.value = true;
    };

    // 保存编辑
    const saveEdit = () => {
      const editedExercise = {
        exercise_id: editForm.value.exercise_id,
        stem: editForm.value.stem || '',
        questions: editForm.value.questions.map((q, index) => ({
          question_order: q.question_order || index + 1,
          question_stem: q.question_stem || String.fromCharCode(65 + index),
          question_answer: q.question_answer || '',
        })),
        answer: {
          answer_content: editForm.value.answer || '',
          render_type: 'HTML', // 默认值，可根据实际需求调整
          from_model: '', // 默认值
          mark: '', // 默认值
        },
        analysis: {
          analysis_content: editForm.value.analysis || '',
          render_type: 'markdown', // 默认值，可根据实际需求调整
          mark: '', // 默认值
        },
      };
      emit('save-exercise', editedExercise);
      editDialogVisible.value = false;
    };

    // 格式化方法
    const formatQuestion = (question) => {
      if (!question) return '';
      const cleanAnswer = (question.question_answer || '').replace(/<\/?p>/g, '');
      return `${question.question_stem || ''} ${cleanAnswer}`;
    };

    const getStemContent = (stem) => {
      return (stem || '').replace(/<[^>]+>/g, '');
    };

    const getAnswerContent = (answer) => {
      return (answer?.answer_content || '').replace(/<[^>]+>/g, '');
    };

    const getAnalysisContent = (analysis) => {
      return (analysis?.analysis_content || '').replace(/<[^>]+>/g, '');
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