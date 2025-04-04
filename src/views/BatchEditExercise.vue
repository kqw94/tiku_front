<!-- src/views/BatchEditExercises.vue -->
<template>
  <div class="batch-edit-exercises">
    <div class="top-bar">
      <el-switch v-model="isEditMode" active-text="编辑模式" inactive-text="阅览模式" @change="toggleMode" />
      <div class="search-bar">
        <el-select v-model="searchType" placeholder="搜索类型" style="width: 120px;">
          <el-option label="ID" value="id" />
          <el-option label="内容" value="content" />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="请输入搜索关键词"
          style="width: 200px; margin-left: 10px;"
          @keyup.enter="fetchExercises(true)"
          @change="fetchExercises(true)"
        />      </div>
    </div>

    <div class="exercise-list">
      <el-empty v-if="exercisesData.length === 0" description="暂无匹配的题目数据" />
      <el-card v-else v-for="exercise in exercisesData" :key="exercise.exercise_id" class="exercise-card" shadow="hover">
        <div class="exercise-content">
          <div class="section">
            <div v-if="!isEditMode" v-html="renderStem(exercise)" class="html-content"></div>
            <el-input v-else type="textarea" :rows="3" v-model="exercise.stem" :placeholder="`请输入题目 ${exercise.exercise_id} 的题干`" />
          </div>

          <div class="section">
            <div v-if="!isEditMode">
              <div v-for="q in exercise.questions" :key="q.question_id" class="question-item">
                <span v-html="`${q.question_stem}: ${q.question_answer}`"></span>
              </div>
            </div>
            <div v-else>
              <el-form>
                <el-form-item v-for="q in exercise.questions" :key="q.question_id" :label="q.question_stem">
                  <el-input v-model="q.question_answer" :placeholder="`请输入选项 ${q.question_stem}`" />
                </el-form-item>
              </el-form>
            </div>
          </div>

          <div class="section">
            <h3>答案</h3>
            <div v-if="!isEditMode" class="html-content" v-html="renderContent(exercise.answer.answer_content, exercise.answer.render_type)"></div>
            <el-input v-else v-model="exercise.answer.answer_content" placeholder="请输入答案" />
            <el-collapse v-if="isEditMode && exercise.answers && exercise.answers.length > 0">
              <el-collapse-item title="所有答案">
                <el-table :data="exercise.answers" style="width: 100%">
                  <el-table-column prop="answer_content" label="答案内容" min-width="200" />
                  <el-table-column prop="mark" label="评分" width="80" align="center" />
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="scope">
                      <el-button size="small" @click="fillAnswer(exercise, scope.row.answer_content)">填充</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>

          <div class="section">
            <h3>解析</h3>
            <div v-if="!isEditMode" class="html-content" v-html="renderContent(exercise.analysis.analysis_content, exercise.analysis.render_type)"></div>
            <el-input v-else type="textarea" :rows="10" v-model="exercise.analysis.analysis_content" placeholder="请输入解析" />
            <el-collapse v-if="isEditMode && exercise.analyses && exercise.analyses.length > 0">
              <el-collapse-item title="所有解析">
                <el-table :data="exercise.analyses" style="width: 100%">
                  <el-table-column prop="analysis_content" label="解析内容" min-width="200" />
                  <el-table-column prop="mark" label="备注" width="80" align="center" />
                  <el-table-column label="操作" width="100" align="center">
                    <template #default="scope">
                      <el-button size="small" @click="fillAnalysis(exercise, scope.row.analysis_content)">填充</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-card>
    </div>

    <div class="floating-bar">
      <el-button v-if="isEditMode" type="primary" @click="saveCurrentPage">保存当前页面</el-button>
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';

export default {
  name: 'BatchEditExercises',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const isEditMode = ref(false);
    const exercisesData = ref([]);
    const searchType = ref('id');
    const searchQuery = ref('');

    const fetchExercises = async (resetPage = false) => {
      try {
        if (resetPage) {
          currentPage.value = 1;  // 搜索时重置到第 1 页
        }
        const params = {
          page: currentPage.value,
          page_size: pageSize.value,
        };
        if (route.query.category_id) params.category_id = route.query.category_id;
        if (route.query.major_id) params.major_id = route.query.major_id;
        if (route.query.chapter_id) params.chapter_id = route.query.chapter_id;
        if (route.query.examgroup_id) params.examgroup_id = route.query.examgroup_id;
        if (searchQuery.value) {
          params.search = searchQuery.value;
          params.search_type = searchType.value;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/exercises/', { params });
        exercisesData.value = response.data.results || [];
        total.value = response.data.count || 0;

        router.push({
          path: '/exercise/batch-edit',
          query: {
            ...route.query,
            page: currentPage.value,
            page_size: pageSize.value,
            search: searchQuery.value || '',  // 确保空搜索也能更新
            search_type: searchType.value,
          },
        });
      } catch (error) {
        ElMessage.error('获取题目列表失败');
        console.error(error.response ? error.response.data : error);
        exercisesData.value = [];
        total.value = 0;
      }
    };


    const saveCurrentPage = async () => {
      try {
        const requests = exercisesData.value.map(exercise => {
          const questions = exercise.questions.map(q => ({
            question_order: q.question_order,
            question_answer: q.question_answer,
          }));
          return axios.put(`http://127.0.0.1:8000/api/exercises/${exercise.exercise_id}/`, {
            stem: exercise.stem,
            questions: questions,
            answer: {
              answer_content: exercise.answer.answer_content,
              render_type: exercise.answer.render_type || 'HTML',
              from_model: exercise.answer.from_model || ''
            },
            analysis: {
              analysis_content: exercise.analysis.analysis_content,
              render_type: exercise.analysis.render_type || 'markdown'
            },
          });
        });
        await Promise.all(requests);
        ElMessage.success('当前页面所有题目保存成功');
      } catch (error) {
        ElMessage.error('保存失败');
        console.error(error.response ? error.response.data : error);
      }
    };

    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
      fetchExercises();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchExercises();
    };

    const toggleMode = (val) => {
      isEditMode.value = val;
    };

    const fillAnswer = (exercise, answerContent) => {
      exercise.answer.answer_content = answerContent;
    };

    const fillAnalysis = (exercise, analysisContent) => {
      exercise.analysis.analysis_content = analysisContent;
    };

    onMounted(() => {
      currentPage.value = Number(route.query.page) || 1;
      pageSize.value = Number(route.query.page_size) || 10;
      searchQuery.value = route.query.search || '';
      searchType.value = route.query.search_type || 'id';
      fetchExercises();
    });

    return {
      currentPage,
      pageSize,
      total,
      isEditMode,
      exercisesData,
      searchType,
      searchQuery,
      handleSizeChange,
      handleCurrentChange,
      toggleMode,
      fillAnswer,
      fillAnalysis,
      saveCurrentPage,
      fetchExercises,
    };
  },
  methods: {
    renderContent(content, renderType) {
      if (renderType === 'markdown') {
        return marked(content);
      }
      return content;
    },
    renderStem(exercise) {
      return `${exercise.exercise_id}. ${exercise.stem}`;
    },
  },
};
</script>

<style scoped>
.batch-edit-exercises {
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
}

.exercise-list {
  margin-bottom: 60px;
}

.exercise-card {
  margin-bottom: 20px;
}

.exercise-content {
  padding: 10px;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin-bottom: 10px;
}

.html-content {
  line-height: 1.6;
}

.question-item {
  margin: 5px 0;
}

.floating-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 美化表格样式 */
.el-table {
  border: 1px solid #ebeef5;
}

.el-table th {
  background-color: #fafafa;
  font-weight: bold;
}

.el-table td {
  padding: 8px 0;
}
</style>