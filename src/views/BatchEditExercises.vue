<!-- src/views/BatchEditExercises.vue -->
<template>
  <div class="batch-edit-exercises" ref="exerciseContainer">
    <div class="exercise-list">
      <el-empty v-if="exercisesData.length === 0" description="暂无匹配的题目数据" />
      <div v-else class="selection-bar">
        <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
        <span style="margin-left: 10px;">已选中 {{ selectedExercises.length }} 道题目</span>
      </div>
      <el-card v-for="exercise in exercisesData" :key="exercise.exercise_id" class="exercise-card" shadow="hover">
        <div class="exercise-content">
          <el-checkbox v-model="selectedExercises" :label="exercise.exercise_id" class="exercise-checkbox" />
          
          
          <div class="left-panel">
            
           
           
            <!-- 编辑模式 -->
            <div class="section">
              <h3>题干</h3>
              <el-input type="textarea" :rows="8" v-model="exercise.stem" :placeholder="`请输入题目 ${exercise.exercise_id} 的题干`" />
            </div>

            <div class="section">
              <h3>问题</h3>
              <el-form>
                <el-form-item v-for="q in exercise.questions" :key="q.question_id" :label="q.question_stem">
                  <el-input v-model="q.question_answer" :placeholder="`请输入选项 ${q.question_stem}`" />
                </el-form-item>
              </el-form>
            </div>

            <div class="section">
              <h3>答案</h3>
              <el-input type="textarea" :rows="3" v-model="exercise.answer.answer_content" placeholder="请输入答案" />
              <el-radio-group v-model="exercise.answer.render_type" size="small" class="render-type-group">
                <el-radio-button label="HTML">HTML</el-radio-button>
                <el-radio-button label="markdown">Markdown</el-radio-button>
                <el-radio-button label="plain">纯文本</el-radio-button>
              </el-radio-group>
              <el-collapse v-if="exercise.answers && exercise.answers.length > 0">
                <el-collapse-item title="历史答案">
                  <el-table :data="exercise.answers" style="width: 100%">
                    <el-table-column prop="answer_content" label="答案内容" min-width="200" />
                    <el-table-column prop="render_type" label="渲染类型" width="100" />
                    <el-table-column prop="mark" label="来源" width="80" />
                    <el-table-column label="操作" width="100" align="center">
                      <template #default="scope">
                        <el-button size="small" @click="fillAnswer(exercise, scope.row)">填充</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>

            <div class="section">
              <h3>解析</h3>
              <el-input type="textarea" :rows="16" v-model="exercise.analysis.analysis_content" placeholder="请输入解析" />
              <el-radio-group v-model="exercise.analysis.render_type" size="small" class="render-type-group">
                <el-radio-button label="HTML">HTML</el-radio-button>
                <el-radio-button label="markdown">Markdown</el-radio-button>
                <el-radio-button label="plain">纯文本</el-radio-button>
              </el-radio-group>
              <el-collapse v-if="exercise.analyses && exercise.analyses.length > 0">
                <el-collapse-item title="历史解析">
                  <el-table :data="exercise.analyses" style="width: 100%">
                    <el-table-column prop="analysis_content" label="解析内容" min-width="200" />
                    <el-table-column prop="render_type" label="渲染类型" width="100" />
                    <el-table-column prop="mark" label="评分" width="80" />
                    <el-table-column label="操作" width="100" align="center">
                      <template #default="scope">
                        <el-button size="small" @click="fillAnalysis(exercise, scope.row)">填充</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>
              <!-- 新增：题目详细信息（放在左下角） -->
        <div class="section">
          <el-collapse class="details-collapse">
            <el-collapse-item title="题目详细信息" name="details">
              <el-collapse class="sub-collapse">
                <el-collapse-item title="章节目录" name="category">
                  <div class="info-item">
                    <p><strong>类别:</strong> {{ exercise.category_name || '未知' }}</p>
                    <p><strong>专业:</strong> {{ exercise.major_name || '未知' }}</p>
                    <p><strong>章节:</strong> {{ exercise.chapter_name || '未知' }}</p>
                    <p><strong>考试组:</strong> {{ exercise.examgroup_name || '未知' }}</p>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="院校真题" name="exam">
                  <div class="info-item">
                    <p><strong>学校:</strong> {{ exercise.from_school || '未知' }}</p>
                    <p><strong>考试时间:</strong> {{ exercise.exam_time || '未知' }}</p>
                    <p><strong>考试代码:</strong> {{ exercise.exam_code || '未知' }}</p>
                    <p><strong>考试全名:</strong> {{ exercise.exam_full_name || '未知' }}</p>
                  </div>
                </el-collapse-item>
                <el-collapse-item title="题目属性" name="attributes">
                  <div class="info-item">
                    <p><strong>来源:</strong> {{ exercise.source_name || '未知' }}</p>
                    <p><strong>难度:</strong> {{ exercise.level || '未知' }}</p>
                    <p><strong>分数:</strong> {{ exercise.score || '未知' }}</p>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </el-collapse-item>
          </el-collapse>
        </div>
          </div>

          <div class="right-panel">
            <!-- 预览模式 -->
            <div class="section">
              <h3>题干预览</h3>
              <div v-html="renderStem(exercise)" class="html-content"></div>
            </div>

            <div class="section">
              <h3>问题预览</h3>
              <div v-for="q in exercise.questions" :key="q.question_id" class="question-item">
                <span v-html="`${q.question_stem}: ${q.question_answer}`"></span>
              </div>
            </div>

            <div class="section">
              <h3>答案预览</h3>
              <div class="html-content" v-html="renderContent(exercise.answer.answer_content, exercise.answer.render_type)"></div>
            </div>

            <div class="section">
              <h3>解析预览</h3>
              <div class="html-content" v-html="renderContent(exercise.analysis.analysis_content, exercise.analysis.render_type)"></div>
            </div>
            
          </div>
        </div>
      </el-card>
    </div>

    <div class="floating-bar">
      <el-button type="primary" @click="saveCurrentPage">保存当前页面</el-button>
      <el-button type="warning" @click="openBulkEditDialog" :disabled="selectedExercises.length === 0">
        批量修改 ({{ selectedExercises.length }})
      </el-button>
      <el-pagination
        background
        layout="prev, pager, next, jumper, sizes, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 批量修改对话框 -->
    <el-dialog title="批量修改题目属性" v-model="bulkEditDialogVisible" width="400px" class="bulk-edit-dialog">
      <el-form :model="bulkEditForm" label-position="top" label-width="80px">
        <el-form-item label="考试组">
          <el-cascader
            v-model="bulkEditForm.examGroupPath"
            :options="cascaderOptions"
            :props="{ value: 'id', label: 'name', lazy: true, lazyLoad: lazyLoadCascader }"
            placeholder="请选择考试组"
            clearable
            style="width: 100%;"
            @change="handleExamGroupChange"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-slider v-model="bulkEditForm.level" :min="1" :max="5" show-stops />
        </el-form-item>
        <el-form-item label="分数">
          <el-input-number v-model="bulkEditForm.score" :min="0" :max="100" :step="0.5" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bulkEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBulkEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';

export default {
  name: 'BatchEditExercises',
  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const route = useRoute();
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const exercisesData = ref([]);
    const exerciseContainer = ref(null);
    const selectedExercises = ref([]);
    const selectAll = ref(false);
    const bulkEditDialogVisible = ref(false);
    const bulkEditForm = ref({
      examGroupPath: null,
      level: null,
      score: null,
    });
    const cascaderOptions = ref([]); // 初始为空，依赖懒加载

    const fetchExercises = async () => {
      try {
        const params = {
          ...props.filters,
          page: currentPage.value,
          page_size: pageSize.value,
          order_by: 'id',
          order_direction: 'asc',
        };
        // console.log('Fetching with params:', params);
        const response = await axios.get('http://127.0.0.1:8000/api/exercises/', { params });
        exercisesData.value = response.data.results || [];
        total.value = response.data.count || 0;
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        exercisesData.value = [];
        total.value = 0;
      }
    };

    // 懒加载函数，参考 ExerciseFilter 的分步加载
    const lazyLoadCascader = async (node, resolve) => {
      const { level, data } = node;
      let nodes = [];

      try {
        if (level === 0) {
          // 加载类别
          const response = await axios.get('http://127.0.0.1:8000/api/categories/');
          nodes = (response.data.results || response.data).map(item => ({
            id: item.category_id,
            name: item.category_name,
            leaf: false,
          }));
        } else if (level === 1) {
          // 加载专业
          const response = await axios.get(`http://127.0.0.1:8000/api/majors/${data.id}/`);
          nodes = (response.data.results || response.data).map(item => ({
            id: item.major_id,
            name: item.major_name,
            leaf: false,
          }));
        } else if (level === 2) {
          // 加载章节
          const response = await axios.get(`http://127.0.0.1:8000/api/chapters/${data.id}/`);
          nodes = (response.data.results || response.data).map(item => ({
            id: item.chapter_id,
            name: item.chapter_name,
            leaf: false,
          }));
        } else if (level === 3) {
          // 加载考试组
          const response = await axios.get(`http://127.0.0.1:8000/api/examgroups/${data.id}/`);
          nodes = (response.data.results || response.data).map(item => ({
            id: item.examgroup_id,
            name: item.examgroup_name,
            leaf: true, // 考试组是最后一级
          }));
        }
        resolve(nodes);
      } catch (error) {
        console.error(`Failed to load level ${level} data:`, error);
        resolve([]);
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
              from_model: exercise.answer.from_model || '',
            },
            analysis: {
              analysis_content: exercise.analysis.analysis_content,
              render_type: exercise.analysis.render_type || 'markdown',
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
      scrollToTop();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchExercises();
      scrollToTop();
    };

    const scrollToTop = () => {
      if (exerciseContainer.value) {
        exerciseContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const fillAnswer = (exercise, row) => {
      exercise.answer.answer_content = row.answer_content;
      exercise.answer.render_type = row.render_type || 'HTML';
      exercise.answer.from_model = row.from_model || '';
      exercise.answer.mark = row.mark || 0;
    };

    const fillAnalysis = (exercise, row) => {
      exercise.analysis.analysis_content = row.analysis_content;
      exercise.analysis.render_type = row.render_type || 'markdown';
      exercise.analysis.mark = row.mark || 0;
    };

    const renderContent = (content, renderType) => {
      if (!content) return '';
      if (renderType === 'markdown') {
        return marked(content);
      } else if (renderType === 'HTML') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.getElementsByTagName('img');
        for (let img of images) {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
        return doc.body.innerHTML;
      }
      return content;
    };

    const renderStem = (exercise) => {
      //return `${exercise.exercise_id}. ${exercise.stem || ''}`;
      return `${exercise.stem || ''}`;
    };

    const toggleSelectAll = (val) => {
      if (val) {
        selectedExercises.value = exercisesData.value.map(ex => ex.exercise_id);
      } else {
        selectedExercises.value = [];
      }
    };

    const openBulkEditDialog = () => {
      bulkEditForm.value = { examGroupPath: null, level: null, score: null };
      bulkEditDialogVisible.value = true;
    };

    const handleExamGroupChange = (value) => {
      bulkEditForm.value.exam_group = value; // 将选中的 examgroup_id 存储
    };

    const saveBulkEdit = async () => {
      try {
        const payload = {
          exercise_ids: selectedExercises.value,
          ...(bulkEditForm.value.exam_group !== null && { exam_group: bulkEditForm.value.exam_group }),
          ...(bulkEditForm.value.level !== null && { level: bulkEditForm.value.level }),
          ...(bulkEditForm.value.score !== null && { score: bulkEditForm.value.score }),
        };
        const response = await axios.post('http://127.0.0.1:8000/api/timu/bulk-update/', payload);
        ElMessage.success(`成功更新 ${response.data.updated_ids.length} 道题目`);
        bulkEditDialogVisible.value = false;
        await fetchExercises();
        selectedExercises.value = [];
        selectAll.value = false;
      } catch (error) {
        ElMessage.error('批量修改失败');
        console.error(error.response ? error.response.data : error);
      }
    };

    watch(
      () => props.filters,
      (newFilters) => {
        console.log('Filters updated in BatchEditExercises:', newFilters);
        currentPage.value = 1;
        fetchExercises();
      },
      { deep: true }
    );

    onMounted(() => {
      currentPage.value = Number(route.query.page) || 1;
      pageSize.value = Number(route.query.page_size) || 10;
      fetchExercises();
    });

    return {
      currentPage,
      pageSize,
      total,
      exercisesData,
      exerciseContainer,
      selectedExercises,
      selectAll,
      bulkEditDialogVisible,
      bulkEditForm,
      cascaderOptions,
      saveCurrentPage,
      handleSizeChange,
      handleCurrentChange,
      fillAnswer,
      fillAnalysis,
      renderContent,
      renderStem,
      toggleSelectAll,
      openBulkEditDialog,
      saveBulkEdit,
      handleExamGroupChange,
      lazyLoadCascader,
    };
  },
};
</script>

<style scoped>
.batch-edit-exercises {
  padding: 0;
  position: relative;
  height: 100%;
  overflow-y: auto;
}

.exercise-list {
  margin-bottom: 60px;
}

.exercise-card {
  margin-bottom: 20px;
}

.exercise-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  align-items: flex-start;
}

.left-panel {
  flex: 1;
  min-width: 0;
  padding: 10px;
  background-color: #f9f9f9;
  border-right: 1px solid #ebeef5;
}

.right-panel {
  flex: 1;
  min-width: 0;
  padding: 10px;
  background-color: #fff;
  overflow-x: auto;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
}

.html-content {
  line-height: 1.6;
  color: #606266;
  word-wrap: break-word;
}

.html-content img {
  max-width: 100%;
  height: auto;
}

.question-item {
  margin: 8px 0;
}

.render-type-group {
  margin-top: 10px;
}

.floating-bar {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.el-table {
  border: 1px solid #ebeef5;
  margin-top: 10px;
}

.el-table th {
  background-color: #fafafa;
  font-weight: bold;
}

.el-table td {
  padding: 8px 0;
}

.el-input,
.el-textarea {
  width: 100%;
}

.selection-bar {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.exercise-checkbox {
  margin-right: 10px;
}

.bulk-edit-dialog :deep(.el-form-item__label) {
  font-size: 14px;
  color: #606266;
  padding-bottom: 5px;
}

.bulk-edit-dialog :deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>