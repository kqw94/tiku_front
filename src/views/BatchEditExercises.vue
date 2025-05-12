<!-- src/components/BatchEditExercise.vue -->
<template>
  <div class="batch-edit-exercises" ref="exerciseContainer">
    <div class="exercise-list">
      <el-empty v-if="exercisesData.length === 0" description="暂无匹配的题目数据" />
      <el-card v-for="exercise in exercisesData" :key="exercise.exercise_id" class="exercise-card" shadow="hover">
        <div class="exercise-id">{{ exercise.exercise_id }}</div>
        <el-checkbox
          v-model="exercise.deleteStatus"
          label=""
          class="delete-checkbox"
          @change="handleDeleteStatusChange"
        />
        <div class="exercise-content">
          <div class="left-panel">
            <!-- 编辑模式 -->
            <div class="section">
              <h3>题干</h3>
              <el-input
                type="textarea"
                :rows="8"
                v-model="exercise.stem"
                :placeholder="`请输入题目 ${exercise.exercise_id} 的题干`"
                @input="debouncedCheckModified(exercise, 'stem')"
              />
            </div>

            <div class="section">
              <h3>问题</h3>
              <el-form>
                <el-form-item
                  v-for="q in exercise.questions || []"
                  :key="q.question_id || q.question_order"
                  :label="getTextLength(q.question_stem) <= 10 ? (q.question_stem || '未定义') : ''"
                  :label-width="getTextLength(q.question_stem) <= 10 ? 'auto' : '0'"
                >
                  <!-- 对于长 question_stem，使用 textarea -->
                  <el-input
                    v-if="getTextLength(q.question_stem) > 10"
                    type="textarea"
                    :rows="4"
                    v-model="q.question_stem"
                    placeholder="请输入问题题干"
                    class="question-stem-textarea"
                    @input="debouncedCheckModified(exercise, 'questions')"
                  />
                  <!-- 对于长 question_answer，使用 textarea -->
                  <el-input
                    v-if="getTextLength(q.question_answer) > 10"
                    type="textarea"
                    :rows="4"
                    v-model="q.question_answer"
                    :placeholder="`请输入选项 ${q.question_stem || '未定义'}`"
                    class="question-answer-textarea"
                    @input="debouncedCheckModified(exercise, 'questions')"
                  />
                  <!-- 对于短 question_answer，使用单行输入框 -->
                  <el-input
                    v-else
                    v-model="q.question_answer"
                    :placeholder="`请输入选项 ${q.question_stem || '未定义'}`"
                    @input="debouncedCheckModified(exercise, 'questions')"
                  />
                </el-form-item>
                <el-form-item v-if="!exercise.questions || exercise.questions.length === 0">
                  <el-button type="info" disabled>暂无问题</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="section">
              <h3>答案</h3>
              <el-input
                type="textarea"
                :rows="3"
                v-model="exercise.answer.answer_content"
                placeholder="请输入答案"
                :disabled="!exercise.answer"
                @input="debouncedCheckModified(exercise, 'answer')"
              />
              <el-radio-group
                v-model="exercise.answer.render_type"
                size="small"
                class="render-type-group"
                :disabled="!exercise.answer"
                @change="debouncedCheckModified(exercise, 'answer')"
              >
                <el-radio-button label="HTML">HTML</el-radio-button>
                <el-radio-button label="markdown">Markdown</el-radio-button>
                <el-radio-button label="plain">纯文本</el-radio-button>
              </el-radio-group>
              <el-collapse @change="activeNames => handleCollapseChange(activeNames, exercise, 'answers')">
                <el-collapse-item title="历史答案" name="answers">
                  <el-table :data="exercise.answers || []" style="width: 100%">
                    <el-table-column v-if="exercise.isLoadingAnswers" label="加载中" align="center">
                      <el-icon><loading /></el-icon>
                    </el-table-column>
                    <template v-else>
                      <el-table-column prop="answer_content" label="答案内容" min-width="200" />
                      <el-table-column prop="render_type" label="渲染类型" width="100" />
                      <el-table-column prop="mark" label="来源" width="80" />
                      <el-table-column label="操作" width="100" align="center">
                        <template #default="scope">
                          <el-button size="small" @click="fillAnswer(exercise, scope.row)">填充</el-button>
                        </template>
                      </el-table-column>
                    </template>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>

            <div class="section">
              <h3>解析</h3>
              <el-input
                type="textarea"
                :rows="16"
                v-model="exercise.analysis.analysis_content"
                placeholder="请输入解析"
                :disabled="!exercise.analysis"
                @input="debouncedCheckModified(exercise, 'analysis')"
              />
              <el-radio-group
                v-model="exercise.analysis.render_type"
                size="small"
                class="render-type-group"
                :disabled="!exercise.analysis"
                @change="debouncedCheckModified(exercise, 'analysis')"
              >
                <el-radio-button label="HTML">HTML</el-radio-button>
                <el-radio-button label="markdown">Markdown</el-radio-button>
                <el-radio-button label="plain">纯文本</el-radio-button>
              </el-radio-group>
              <el-collapse @change="activeNames => handleCollapseChange(activeNames, exercise, 'analyses')">
                <el-collapse-item title="历史解析" name="analyses">
                  <el-table :data="exercise.analyses || []" style="width: 100%">
                    <el-table-column v-if="exercise.isLoadingAnalyses" label="加载中" align="center">
                      <el-icon><loading /></el-icon>
                    </el-table-column>
                    <template v-else>
                      <el-table-column prop="analysis_content" label="解析内容" min-width="200" />
                      <el-table-column prop="render_type" label="渲染类型" width="100" />
                      <el-table-column prop="mark" label="来源" width="80" />
                      <el-table-column label="操作" width="100" align="center">
                        <template #default="scope">
                          <el-button size="small" @click="fillAnalysis(exercise, scope.row)">填充</el-button>
                        </template>
                      </el-table-column>
                    </template>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>

            <!-- 题目详细信息 -->
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
              <div v-for="q in exercise.questions || []" :key="q.question_id || q.question_order" class="question-item">
                <!-- <div class="question-stem" v-html="renderContent(q.question_stem || '未定义', q.render_type || 'HTML')"></div>
                <div class="question-answer" v-html="renderContent(stripPTags(q.question_answer || ''), q.render_type || 'HTML')"></div> -->
                <span v-html="`${renderContent(q.question_stem) || '未定义'}  ${renderContent(stripPTags(q.question_answer || ''), q.render_type || 'HTML')}`"></span>
              </div>
              <div v-if="!exercise.questions || exercise.questions.length === 0" class="question-item">
                <span>暂无问题</span>
              </div>
            </div>



            <div class="section">
              <h3>答案预览</h3>
              <div
                class="html-content"
                v-html="renderContent(exercise.answer?.answer_content, exercise.answer?.render_type)"
              ></div>
            </div>

            <div class="section">
              <h3>解析预览</h3>
              <div
                class="html-content"
                v-html="renderContent(exercise.analysis?.analysis_content, exercise.analysis?.render_type)"
              ></div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="floating-bar">
      <el-button type="primary" @click="saveCurrentPage">保存当前页面</el-button>
      <el-button
        type="danger"
        :disabled="!hasSelectedForDeletion"
        @click="deleteSelectedExercises"
      >
        删除选中题目
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
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import katex from 'katex';
import { Loading } from '@element-plus/icons-vue';
import { cloneDeep, debounce } from 'lodash';

export default {
  name: 'BatchEditExercises',
  components: {
    Loading,
  },
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
    const answerCache = ref({});
    const analysisCache = ref({});

    // 初始化题目数据，添加初始状态和改动跟踪
    const initializeExercise = (exercise) => {
      return {
        ...exercise,
        stem: exercise.stem || '',
        questions: exercise.questions || [],
        answer: exercise.answer || {
          answer_content: '',
          render_type: 'HTML',
          from_model: '',
          mark: '',
        },
        analysis: exercise.analysis || {
          analysis_content: '',
          render_type: 'markdown',
          mark: '',
        },
        answers: null,
        analyses: null,
        isLoadingAnswers: false,
        isLoadingAnalyses: false,
        deleteStatus: false,
        initialData: cloneDeep({
          stem: exercise.stem || '',
          questions: exercise.questions || [],
          answer: exercise.answer || {
            answer_content: '',
            render_type: 'HTML',
            from_model: '',
            mark: '',
          },
          analysis: exercise.analysis || {
            analysis_content: '',
            render_type: 'markdown',
            mark: '',
          },
        }),
        modifiedFields: {
          stem: false,
          questions: false,
          answer: false,
          analysis: false,
        },
      };
    };

    // 获取题目列表
    const fetchExercises = async () => {
      try {
        const params = {
          ...props.filters,
          page: currentPage.value,
          page_size: pageSize.value,
        };
        const response = await axios.get('/exercises/', { params });
        exercisesData.value = (response.data.results || []).map(initializeExercise);
        total.value = response.data.count || 0;
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        exercisesData.value = [];
        total.value = 0;
        ElMessage.error('加载题目失败');
      }
    };

    // 获取历史答案
    const fetchAnswers = async (exercise) => {
      if (exercise.answers === null && !exercise.isLoadingAnswers) {
        exercise.isLoadingAnswers = true;
        if (answerCache.value[exercise.exercise_id]) {
          exercise.answers = answerCache.value[exercise.exercise_id];
          exercise.isLoadingAnswers = false;
        } else {
          try {
            const response = await axios.get(`/answers/${exercise.exercise_id}/`);
            exercise.answers = Array.isArray(response.data.results) ? response.data.results : [];
            answerCache.value[exercise.exercise_id] = exercise.answers;
          } catch (error) {
            console.error(`Failed to fetch answers for exercise ${exercise.exercise_id}:`, error);
            exercise.answers = [];
          } finally {
            exercise.isLoadingAnswers = false;
          }
        }
      }
    };

    // 获取历史解析
    const fetchAnalyses = async (exercise) => {
      if (exercise.analyses === null && !exercise.isLoadingAnalyses) {
        exercise.isLoadingAnalyses = true;
        if (analysisCache.value[exercise.exercise_id]) {
          exercise.analyses = analysisCache.value[exercise.exercise_id];
          exercise.isLoadingAnalyses = false;
        } else {
          try {
            const response = await axios.get(`/analyses/${exercise.exercise_id}/`);
            exercise.analyses = Array.isArray(response.data.results) ? response.data.results : [];
            analysisCache.value[exercise.exercise_id] = exercise.analyses;
          } catch (error) {
            console.error(`Failed to fetch analyses for exercise ${exercise.exercise_id}:`, error);
            exercise.analyses = [];
          } finally {
            exercise.isLoadingAnalyses = false;
          }
        }
      }
    };

    // 处理折叠面板变化
    const handleCollapseChange = (activeNames, exercise, type) => {
      const isActive = Array.isArray(activeNames) ? activeNames.includes(type) : activeNames === type;
      if (isActive) {
        if (type === 'answers') {
          fetchAnswers(exercise);
        } else if (type === 'analyses') {
          fetchAnalyses(exercise);
        }
      }
    };

    // 检查字段是否修改
    const checkModified = (exercise, field) => {
      if (field === 'stem') {
        exercise.modifiedFields.stem = exercise.stem !== exercise.initialData.stem;
      } else if (field === 'questions') {
        exercise.modifiedFields.questions = !exercise.questions.every(
          (q, i) =>
            (q.question_stem || '') === (exercise.initialData.questions[i]?.question_stem || '') &&
            (q.question_answer || '') === (exercise.initialData.questions[i]?.question_answer || '')
        );
      } else if (field === 'answer') {
        const oldAnswer = exercise.initialData.answer;
        const newAnswer = exercise.answer;
        exercise.modifiedFields.answer =
          (newAnswer.answer_content || '') !== (oldAnswer.answer_content || '') ||
          (newAnswer.render_type || 'HTML') !== (oldAnswer.render_type || 'HTML');
      } else if (field === 'analysis') {
        const oldAnalysis = exercise.initialData.analysis;
        const newAnalysis = exercise.analysis;
        exercise.modifiedFields.analysis =
          (newAnalysis.analysis_content || '') !== (oldAnalysis.analysis_content || '') ||
          (newAnalysis.render_type || 'markdown') !== (oldAnalysis.render_type || 'markdown');
      }
    };

    // 防抖检查改动
    const debouncedCheckModified = debounce((exercise, field) => {
      checkModified(exercise, field);
    }, 300);

    // 检查题目是否有改动
    const hasModifiedFields = (exercise) => {
      return Object.values(exercise.modifiedFields).some((value) => value);
    };

    // 保存当前页面
    const saveCurrentPage = async () => {
      const requests = [];
      const errors = [];

      for (const exercise of exercisesData.value) {
        if (!hasModifiedFields(exercise)) {
          continue;
        }

        const payload = {};

        if (exercise.modifiedFields.stem) {
          payload.stem = exercise.stem || '';
        }

        if (exercise.modifiedFields.questions) {
          payload.questions = (exercise.questions || []).map((q) => ({
            question_order: q.question_order || 0,
            question_stem: q.question_stem || '',
            question_answer: q.question_answer || '',
          }));
        }

        if (exercise.modifiedFields.answer) {
          payload.answer = {
            answer_content: exercise.answer.answer_content || '',
            render_type: exercise.answer.render_type || 'HTML',
            from_model: exercise.answer.from_model || '',
          };
        }

        if (exercise.modifiedFields.analysis) {
          payload.analysis = {
            analysis_content: exercise.analysis.analysis_content || '',
            render_type: exercise.analysis.render_type || 'markdown',
          };
        }

        requests.push(
          axios
            .put(`/exercises/${exercise.exercise_id}/`, payload)
            .then(() => {
              exercise.initialData = cloneDeep({
                stem: exercise.stem,
                questions: exercise.questions,
                answer: exercise.answer,
                analysis: exercise.analysis,
              });
              exercise.modifiedFields = {
                stem: false,
                questions: false,
                answer: false,
                analysis: false,
              };
              return { exercise_id: exercise.exercise_id, status: 'success' };
            })
            .catch((error) => {
              const message = error.response?.data
                ? Object.values(error.response.data).flat().join('; ')
                : '未知错误';
              errors.push(`题目 ${exercise.exercise_id} 保存失败：${message}`);
              return { exercise_id: exercise.exercise_id, status: 'error', message };
            })
        );
      }

      if (requests.length === 0) {
        ElMessage.info('没有题目需要保存');
        return;
      }

      try {
        const results = await Promise.all(requests);
        const successCount = results.filter((r) => r.status === 'success').length;

        if (errors.length > 0) {
          ElMessage.error({
            message: errors.join('; '),
            duration: 5000,
          });
        }

        if (successCount > 0) {
          ElMessage.success(`成功保存 ${successCount} 道题目`);
        }
      } catch (error) {
        ElMessage.error('保存过程中发生错误');
        console.error(error);
      }
    };

    // 检查是否有选中的题目
    const hasSelectedForDeletion = computed(() => {
      return exercisesData.value.some((exercise) => exercise.deleteStatus);
    });

    // 处理删除状态变化
    const handleDeleteStatusChange = () => {
      // 触发 computed 属性更新
    };

    // 删除选中的题目
    const deleteSelectedExercises = async () => {
      const toDelete = exercisesData.value.filter((exercise) => exercise.deleteStatus);
      if (toDelete.length === 0) {
        ElMessage.warning('未选中任何题目进行删除');
        return;
      }

      try {
        const requests = toDelete.map((exercise) => axios.delete(`/exercises/${exercise.exercise_id}/`));
        await Promise.all(requests);

        exercisesData.value = exercisesData.value.filter((exercise) => !exercise.deleteStatus);
        total.value -= toDelete.length;

        ElMessage.success(`成功删除 ${toDelete.length} 道题目`);
      } catch (error) {
        const message = error.response?.data?.detail || '删除失败';
        ElMessage.error(`删除失败：${message}`);
      }
    };

    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
      fetchExercises();
      scrollToTop();
    };

    // 处理页码变化
    const handleCurrentChange = (val) => {
      currentPage.value = val;
      fetchExercises();
      scrollToTop();
    };

    // 滚动到顶部
    const scrollToTop = () => {
      if (exerciseContainer.value) {
        exerciseContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // 填充答案
    const fillAnswer = (exercise, row) => {
      if (!exercise.answer) {
        exercise.answer = { answer_content: '', render_type: 'HTML', from_model: '', mark: '' };
      }
      exercise.answer.answer_content = row.answer_content || '';
      exercise.answer.render_type = row.render_type || 'HTML';
      exercise.answer.from_model = row.from_model || '';
      exercise.answer.mark = row.mark || '';
      checkModified(exercise, 'answer');
    };

    // 填充解析
    const fillAnalysis = (exercise, row) => {
      if (!exercise.analysis) {
        exercise.analysis = { analysis_content: '', render_type: 'markdown', mark: '' };
      }
      exercise.analysis.analysis_content = row.analysis_content || '';
      exercise.analysis.render_type = row.render_type || 'markdown';
      exercise.analysis.mark = row.mark || '';
      checkModified(exercise, 'analysis');
    };

    // 去除 <p> 标签，保留内容
    const stripPTags = (html) => {
      if (!html) return '';
      return html.replace(/<p\b[^>]*>(.*?)<\/p>/gi, '$1');
    };

    // 去除 HTML 标签，获取纯文本
    const stripHtml = (html) => {
      if (!html) return '';
      return html.replace(/<[^>]+>/g, '');
    };

    // 计算纯文本长度
    const getTextLength = (html) => {
      return stripHtml(html).length;
    };

    // 辅助函数：处理 LaTeX 内容
    const processLatex = (latex) => {
      // 去掉首尾 \( \)，兼容空内容
      const cleanLatex = latex
        .replace(/^\\\(([\s\S]*)\\\)$/, '$1') // 匹配 \( \)
        .replace(/^\\\[([\s\S]*)\\\]$/, '$1')
        .replace(/^\$\$([\s\S]*)\$\$$/, '$1') // 匹配 $$ $$
        .replace(/^\$([\s\S]*)\$$/, '$1') // 匹配 $ $
        .trim();
      // 替换单个反斜杠为双反斜杠
      // return cleanLatex.replace(/\\/g, '\\\\');
      return cleanLatex;
    };

    // 渲染内容
    // 渲染内容（用于答案、解析、问题）
const renderContent = (content, renderType) => {
  if (!content) return '';

  // 处理 \( \) 包裹的 LaTeX 公式（所有模式）
  const renderLatexInContent = (text) => {

    text =  text.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
      const latex = match;
      const processedLatex = processLatex(latex);
      const span = document.createElement('span');
      try {
        // console.log('Processed LaTeX (inline):', processedLatex); // 调试
        katex.render(processedLatex, span, {
          throwOnError: false,
          displayMode: true, // Inline mode for \( \)
        });
        return `<div style="text-align: center;">${span.outerHTML}</div>`;
      } catch (error) {
        console.error('KaTeX 渲染错误 (display):', error, '原始 LaTeX:', latex);
        return `LaTeX 渲染错误: ${latex}`;
      }
    });  

    text =  text.replace(/\\\[.*?\\\]/gs, (match) => {
      const latex = match;
      const processedLatex = processLatex(latex);
      const span = document.createElement('span');
      try {
        // console.log('Processed LaTeX (inline):', processedLatex); // 调试
        katex.render(processedLatex, span, {
          throwOnError: false,
          displayMode: true, // Inline mode for \( \)
        });
        return `<div style="text-align: center;">${span.outerHTML}</div>`;
      } catch (error) {
        console.error('KaTeX 渲染错误 (display):', error, '原始 LaTeX:', latex);
        return `LaTeX 渲染错误: ${latex}`;
      }
    });    

    text =  text.replace(/\$([\s\S]*?)\$/g, (match) => {
      const latex = match;
      const processedLatex = processLatex(latex);
      const span = document.createElement('span');
      try {
        // console.log('Processed LaTeX (inline):', processedLatex); // 调试
        katex.render(processedLatex, span, {
          throwOnError: false,
          displayMode: false, // Inline mode for \( \)
        });
        return span.outerHTML;
      } catch (error) {
        console.error('KaTeX 渲染错误 (inline):', error, '原始 LaTeX:', latex);
        return `LaTeX 渲染错误: ${latex}`;
      }
    });

    text =  text.replace(/\\\(.*?\\\)/gs, (match) => {
      const latex = match;
      const processedLatex = processLatex(latex);
      const span = document.createElement('span');
      try {
        // console.log('Processed LaTeX (inline):', processedLatex); // 调试
        katex.render(processedLatex, span, {
          throwOnError: false,
          displayMode: false, // Inline mode for \( \)
        });
        return span.outerHTML;
      } catch (error) {
        console.error('KaTeX 渲染错误 (inline):', error, '原始 LaTeX:', latex);
        return `LaTeX 渲染错误: ${latex}`;
      }
    });

  return text;
    

  };

  if (renderType === 'markdown') {
    // Markdown: 先渲染 Markdown，再处理 \( \) 公式
    let preprocessedcontent = content
        .replace(/\\\(([\s\S]*?)\\\)/g, '\\\\($1\\\\)')
        .replace(/\\\[([\s\S]*?)\\\]/g, '\\\\[$1\\\\]');
    let markdownContent = marked(preprocessedcontent);
    // console.log('markdownContent', markdownContent)
    return renderLatexInContent(markdownContent);
  } else if (renderType === 'HTML') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.getElementsByTagName('img');
    const mathElements = doc.querySelectorAll('.math-tex');

    // 处理图片
    for (let img of images) {
      img.style.maxWidth = '150%';
      img.style.height = 'auto';
    }

    // 处理 <span class="math-tex"> 公式
    mathElements.forEach((el) => {
      const latex = el.textContent;
      const processedLatex = processLatex(latex);
      const span = document.createElement('span');
      try {
        // console.log('processedLatex (math-tex):', processedLatex); // 调试
        katex.render(processedLatex, span, { throwOnError: false });
        el.parentNode.replaceChild(span, el);
      } catch (error) {
        console.error('KaTeX 渲染错误 (math-tex):', error, '原始 LaTeX:', latex);
        el.textContent = `LaTeX 渲染错误: ${latex}`;
      }
    });

    // 处理 \( \) 公式
    const htmlContent = doc.body.innerHTML;
    return htmlContent;
  } else if (renderType === 'plain') {
    // Plain: 直接处理 \( \) 公式或整个内容
    if (content.match(/\\\(|\\\[\$\$/)) {
      return renderLatexInContent(content);
    }
    return content;
  }

  return renderLatexInContent(content);
};

    const renderStem = (exercise) => {
      const content = exercise.stem || '';
      if (!content) return '';

      // 假设题干可能是 HTML 或纯文本
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const mathElements = doc.querySelectorAll('.math-tex');

        // 处理 LaTeX 公式
        mathElements.forEach((el) => {
          const latex = el.textContent;
          const processedLatex = processLatex(latex);
          const span = document.createElement('span');
          try {
            // console.log('processedLatex', processedLatex)
            katex.render(processedLatex, span, { throwOnError: false });
            el.parentNode.replaceChild(span, el);
          } catch (error) {
            el.textContent = `LaTeX 渲染错误: ${latex}`;
          }
        });

        return doc.body.innerHTML;
      } catch (error) {
        // 如果不是有效 HTML，直接返回原始内容
        return content;
      }
    };


    // 监听筛选条件变化
    watch(
      () => props.filters,
      () => {
        currentPage.value = 1;
        fetchExercises();
      },
      { deep: true }
    );

    // 组件挂载时初始化
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
      saveCurrentPage,
      handleSizeChange,
      handleCurrentChange,
      fillAnswer,
      fillAnalysis,
      renderContent,
      renderStem,
      handleCollapseChange,
      debouncedCheckModified,
      stripPTags,
      stripHtml,
      getTextLength,
      hasSelectedForDeletion,
      handleDeleteStatusChange,
      deleteSelectedExercises,
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
  position: relative;
  padding-top: 30px;
}

.exercise-id {
  position: relative;
  display: inline-block;
  margin: 10px 0 0 10px;
  font-size: 12px;
  color: #909399;
  font-weight: normal;
  opacity: 0.8;
  line-height: 1;
  z-index: 1;
}

.delete-checkbox {
  display: block;
  margin: 5px 0 0 10px;
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
  display: block;
  line-height: 2;
}

.question-stem-textarea,
.question-answer-textarea {
  margin-bottom: 10px;
  width: 100%;
  resize: none;
  white-space: pre-wrap;
}

.question-stem-textarea .el-textarea__inner,
.question-answer-textarea .el-textarea__inner {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  font-family: inherit;
  line-height: 1.5;
}

.el-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.el-form-item__label {
  flex-shrink: 0;
  margin-right: 10px;
  color: #606266;
  font-size: 14px;
}

.el-form-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
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
  gap: 10px;
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
</style>