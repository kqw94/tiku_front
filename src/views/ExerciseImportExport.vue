<!-- src/views/ExerciseImportExport.vue -->
<template>
    <div>
      <!-- 导入区域 -->
      <el-card class="import-card">
        <h3>导入练习题</h3>
        <el-form :model="importForm" class="import-form">
          <el-form-item label="选择 JSON 文件">
            <el-upload
              ref="uploadRef"
              accept=".json"
              :auto-upload="false"
              :limit="1"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button
              type="warning"
              :disabled="!importForm.file"
              @click="validateJson"
            >
              验证 JSON
            </el-button>
            <el-button
              type="success"
              :disabled="!isJsonValid || importForm.uploading"
              :loading="importForm.uploading"
              @click="uploadFile"
            >
              上传
            </el-button>
            <el-button type="info" @click="showTemplate">
              查看模板
            </el-button>
          </el-form-item>
          <el-form-item v-if="validationMessage">
            <el-alert
              :title="validationMessage"
              :type="isJsonValid ? 'success' : 'error'"
              :closable="false"
            />
          </el-form-item>
          <el-form-item v-if="importForm.uploading || importProgress > 0">
            <el-progress
              :percentage="importProgress"
              :text-inside="true"
              :stroke-width="20"
              :status="importProgress === 100 ? 'success' : ''"
            />
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 导出区域 -->
      <el-card class="export-card">
        <h3>导出练习题</h3>
        <el-form :model="exportForm" inline class="export-form">
          <el-form-item label="选择分类">
            <el-select
              v-model="exportForm.category_id"
              placeholder="请选择分类"
              clearable
              :loading="categoriesLoading"
              class="wide-select"
            >
              <el-option
                v-for="category in categories"
                :key="category.category_id"
                :label="category.category_name"
                :value="category.category_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择专业" v-if="exportForm.category_id">
            <el-select
              v-model="exportForm.major_id"
              placeholder="请选择专业"
              clearable
              :loading="majorsLoading"
              class="wide-select"
            >
              <el-option
                v-for="major in majors"
                :key="major.major_id"
                :label="major.major_name"
                :value="major.major_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择章节" v-if="exportForm.major_id">
            <el-select
              v-model="exportForm.chapter_id"
              placeholder="请选择章节"
              clearable
              :loading="chaptersLoading"
              class="wide-select"
            >
              <el-option
                v-for="chapter in chapters"
                :key="chapter.chapter_id"
                :label="chapter.chapter_name"
                :value="chapter.chapter_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择考试组" v-if="exportForm.chapter_id">
            <el-select
              v-model="exportForm.examgroup_id"
              placeholder="请选择考试组"
              clearable
              :loading="examgroupsLoading"
              class="wide-select"
            >
              <el-option
                v-for="examgroup in examgroups"
                :key="examgroup.examgroup_id"
                :label="examgroup.examgroup_name"
                :value="examgroup.examgroup_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!exportForm.category_id || exportForm.downloading"
              :loading="exportForm.downloading"
              @click="exportExercises"
            >
              导出
            </el-button>
          </el-form-item>
          <el-form-item v-if="exportForm.downloading || exportProgress > 0">
            <el-progress
              :percentage="exportProgress"
              :text-inside="true"
              :stroke-width="20"
              :status="exportProgress === 100 ? 'success' : ''"
            />
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 操作记录表格 -->
      <el-card class="logs-card">
        <h3>操作记录</h3>
        <el-form :model="queryParams" inline class="filter-form">
          <el-form-item label="操作类型">
            <el-select v-model="queryParams.action_type" placeholder="请选择" clearable>
              <el-option label="导入" value="import" />
              <el-option label="导出" value="export" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="queryParams.username" clearable />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ssZ"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchLogs">筛选</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
  
        <el-table :data="logs" style="width: 100%; margin-top: 20px;" border>
          <el-table-column prop="id" label="ID" width="100" />
          <el-table-column prop="action_type" label="操作类型" width="120">
            <template #default="scope">
              {{ actionTypeLabel(scope.row.action_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="details" label="详情" min-width="200">
            <template #default="scope">
              <span class="truncate">{{ scope.row.details || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="timestamp" label="时间" width="180">
            <template #default="scope">
              {{ formatTimestamp(scope.row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column prop="user" label="用户名" width="100">
            <template #default="scope">
              {{ scope.row.user || '匿名' }}
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
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
  
      <!-- 模板 JSON 弹出框 -->
      <el-dialog
        title="模板 JSON"
        v-model="templateDialogVisible"
        width="800px"
        :before-close="handleCloseTemplateDialog"
      >
        <div class="json-container">
          <pre><code>{{ formattedTemplate }}</code></pre>
        </div>
        <template #footer>
          <el-button @click="templateDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import axios from 'axios';
  import { ElMessage } from 'element-plus';
  
  // 导入表单
  const importForm = ref({
    file: null,
    uploading: false,
  });
  const isJsonValid = ref(false);
  const validationMessage = ref('');
  const importProgress = ref(0);
  const uploadRef = ref(null);
  
  // 导出表单
  const exportForm = ref({
    category_id: null,
    major_id: null,
    chapter_id: null,
    examgroup_id: null,
    downloading: false,
  });
  const exportProgress = ref(0);
  const categories = ref([]);
  const majors = ref([]);
  const chapters = ref([]);
  const examgroups = ref([]);
  const categoriesLoading = ref(false);
  const majorsLoading = ref(false);
  const chaptersLoading = ref(false);
  const examgroupsLoading = ref(false);
  
  // 操作记录
  const logs = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const queryParams = ref({
    action_type: '',
    username: '',
    timestamp_gte: '',
    timestamp_lte: '',
  });
  const timeRange = ref([]);
  
  // 模板弹出框
  const templateDialogVisible = ref(false);
  const template = [{
    "exercise_id": 163,
    "category": "计算机考研",
    "major": "C语言程序设计",
    "chapter": "函数",
    "examgroup": "函数的调用",
    "source": "研芝士题库",
    "type": "单项选择题",
    "level": 2,
    "score": 2,
    "stem": "<p>在 C 语言中，函数返回值的数据类型取决于<span style=\"text-decoration: underline;\">         </span>。</p>",
    "questions": [
      {
        "question_order": 1,
        "question_stem": "A",
        "question_answer": "<p>函数的名字</p>",
        "question_analysis": null
      },
      {
        "question_order": 2,
        "question_stem": "B",
        "question_answer": "<p>return 语句中表达式的数据类型</p>",
        "question_analysis": null
      },
      {
        "question_order": 3,
        "question_stem": "C",
        "question_answer": "<p>主函数的数据类型</p>",
        "question_analysis": null
      },
      {
        "question_order": 4,
        "question_stem": "D",
        "question_answer": "<p>在定义该函数时所指定的数据类型</p>",
        "question_analysis": null
      }
    ],
    "answer": [
      {
        "answer_content": "D",
        "mark": "原答案",
        "from_model": "",
        "render_type": "HTML"
      },
      {
        "answer_content": "  \nD  \n\n",
        "mark": "deepseek答案 20250328",
        "from_model": "deepseekv3",
        "render_type": "markdown"
      },
      {
        "answer_content": "\nD\n\n",
        "mark": "gpt-4o 20250328",
        "from_model": "GPT-4o",
        "render_type": "markdown"
      },
      {
        "answer_content": "D",
        "mark": "0331 校对",
        "from_model": "",
        "render_type": "HTML"
      }
    ],
    "analysis": [
      {
        "analysis_content": "函数返回值的类型和函数名师没有关系的，函数名只是个简单的代号，没有什么特殊的意义，return 语句中表达式的数据类型必须和 定义函数是所指定的数据类型一样才可以，否则会出错。至于主调函数，强调一下。 主调函数一般都是void 也就是空型的，没有什么特殊用处，也只是为了保持函数格式的一致。",
        "mark": "原解析",
        "render_type": "HTML"
      },
      {
        "analysis_content": "  \n在 C 语言中，函数返回值的数据类型由**函数定义时显式指定的返回类型**决定。关键点如下：  \n1. **选项 D 正确**：函数声明或定义时，返回值类型必须明确指定（如 `int func()`），后续 `return` 表达式的值会被隐式转换为该类型。  \n2. **选项 B 错误**：`return` 表达式的类型需与函数定义的类型兼容（否则可能触发隐式转换或警告），但最终返回值类型仍取决于函数定义。  \n3. **选项 A/C 无关**：函数名（A）和主调函数类型（C）均不影响返回值类型。  \n\n**示例**：  \n```c\nfloat func() { return 3; }  // 返回值实际为float，即使return表达式是int\n```  \n因此，返回值类型由定义时的类型（D）唯一确定。",
        "mark": "deepseek解析 20250328",
        "render_type": "markdown"
      },
      {
        "analysis_content": "\n在 C 语言中，函数返回值的数据类型由定义函数时指定的数据类型决定。\n- 选项 A：函数名字主要用于标识函数，与返回值的数据类型毫无关联，仅作为调用函数的标识。\n- 选项 B：return 语句中表达式的数据类型若与定义函数时指定的类型不一致，会进行类型转换，以定义函数时指定的类型为准返回值，并非由 return 语句中表达式的数据类型决定函数返回值类型。\n- 选项 C：主函数的数据类型与被调用函数的返回值类型没有直接关系，主函数在程序执行中起引导作用，不影响其他函数返回值类型。 \n所以函数返回值的数据类型取决于定义该函数时所指定的数据类型，答案选 D 。  ",
        "mark": "gpt-4o 20250328",
        "render_type": "markdown"
      },
      {
        "analysis_content": "  \n在 C 语言中，函数返回值的数据类型由**函数定义时显式指定的返回类型**决定。关键点如下：  \n1. **选项 D 正确**：函数声明或定义时，返回值类型必须明确指定（`int func()`），后续 `return` 表达式的值会被隐式转换为该类型。  \n2. **选项 B 错误**：`return` 表达式的类型需与函数定义的类型兼容（否则可能触发隐式转换或警告），但最终返回值类型仍取决于函数定义。  \n3. **选项 A/C 无关**：函数名（A）和主调函数类型（C）均不影响返回值类型。  \n\n**示例**：  \n```c\nfloat func() { return 3; }  // 返回值实际为float，即使return表达式是int\n```  \n因此，返回值类型由定义时的类型（D）唯一确定。",
        "mark": "0331 校对",
        "render_type": "markdown"
      }
    ],
    "exercise_from": {
      "is_official_exercise": 1,
      "from_school": "广东工业大学",
      "exam_time": "2016年",
      "exam_code": "831",
      "exam_full_name": "数据结构与C语言",
      "exercise_number": 24,
      "material_name": "",
      "section": "",
      "page_number": null
    },
    "image_links": []
  }];
  const formattedTemplate = JSON.stringify(template, null, 2);
  
  // 操作类型映射
  const actionTypes = [
    { value: 'import', label: '导入' },
    { value: 'export', label: '导出' },
  ];
  
  const actionTypeLabel = (value) => {
    const type = actionTypes.find((t) => t.value === value);
    return type ? type.label : value;
  };
  
  // 格式化时间
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  // 处理文件选择
  const handleFileChange = (file) => {
    importForm.value.file = file.raw;
    isJsonValid.value = false;
    validationMessage.value = '';
    importProgress.value = 0;
  };
  
  // 处理文件移除
  const handleFileRemove = () => {
    importForm.value.file = null;
    isJsonValid.value = false;
    validationMessage.value = '';
    importProgress.value = 0;
  };
  
  // 验证 JSON 格式
  const validateJson = () => {
    if (!importForm.value.file) {
      validationMessage.value = '请先选择文件';
      isJsonValid.value = false;
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (!Array.isArray(jsonData)) {
          throw new Error('JSON 必须是一个数组');
        }
        for (const item of jsonData) {
          if (!item.category || !item.type) {
            throw new Error('每个练习题必须包含 category 和 type 字段');
          }
          if (!item.stem && (!item.questions || item.questions.length === 0)) {
            throw new Error('每个练习题必须包含 stem 或 questions');
          }
          if (item.exercise_id !== undefined && !Number.isInteger(item.exercise_id)) {
            throw new Error('exercise_id 必须是整数');
          }
        }
        validationMessage.value = 'JSON 格式验证通过';
        isJsonValid.value = true;
      } catch (error) {
        validationMessage.value = `JSON 验证失败：${error.message}`;
        isJsonValid.value = false;
      }
    };
    reader.onerror = () => {
      validationMessage.value = '读取文件失败';
      isJsonValid.value = false;
    };
    reader.readAsText(importForm.value.file);
  };
  
  // 上传文件
  const uploadFile = async () => {
    if (!isJsonValid.value) {
      ElMessage.error('请先验证 JSON 格式');
      return;
    }
  
    importForm.value.uploading = true;
    importProgress.value = 0;
  
    const formData = new FormData();
    formData.append('file', importForm.value.file);
  
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/import-exercises/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              importProgress.value = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
            }
          },
        }
      );
  
      importProgress.value = 100;
      ElMessage.success(`${response.data.message}，共导入 ${response.data.count} 道题`);
      importForm.value.uploading = false;
      uploadRef.value.clearFiles();
      isJsonValid.value = false;
      validationMessage.value = '';
      fetchLogs();
    } catch (error) {
      importProgress.value = 0;
      importForm.value.uploading = false;
      const message = error.response?.data?.error || '上传失败';
      const details = error.response?.data?.details ? JSON.stringify(error.response.data.details) : '';
      ElMessage.error(details ? `${message}: ${details}` : message);
    }
  };
  
  // 显示模板
  const showTemplate = () => {
    templateDialogVisible.value = true;
  };
  
  // 关闭模板弹出框
  const handleCloseTemplateDialog = () => {
    templateDialogVisible.value = false;
  };
  
  // 获取分类列表
  const fetchCategories = async () => {
    categoriesLoading.value = true;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      categories.value = response.data.results || response.data || [];
    } catch (error) {
      ElMessage.error('获取分类列表失败');
      categories.value = [];
    } finally {
      categoriesLoading.value = false;
    }
  };
  
  // 获取专业列表
  const fetchMajors = async (category_id) => {
    majorsLoading.value = true;
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/majors/${category_id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      majors.value = response.data.results || response.data || [];
    } catch (error) {
      ElMessage.error('获取专业列表失败');
      majors.value = [];
    } finally {
      majorsLoading.value = false;
    }
  };
  
  // 获取章节列表
  const fetchChapters = async (major_id) => {
    chaptersLoading.value = true;
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/chapters/${major_id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      chapters.value = response.data.results || response.data || [];
    } catch (error) {
      ElMessage.error('获取章节列表失败');
      chapters.value = [];
    } finally {
      chaptersLoading.value = false;
    }
  };
  
  // 获取考试组列表
  const fetchExamGroups = async (chapter_id) => {
    examgroupsLoading.value = true;
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/examgroups/${chapter_id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      examgroups.value = response.data.results || response.data || [];
    } catch (error) {
      ElMessage.error('获取考试组列表失败');
      examgroups.value = [];
    } finally {
      examgroupsLoading.value = false;
    }
  };
  
  // 导出练习题
  const exportExercises = async () => {
    if (!exportForm.value.category_id) {
      ElMessage.error('请选择分类');
      return;
    }
  
    exportForm.value.downloading = true;
    exportProgress.value = 0;
  
    try {
      const params = {
        category_id: exportForm.value.category_id,
        major_id: exportForm.value.major_id || undefined,
        chapter_id: exportForm.value.chapter_id || undefined,
        examgroup_id: exportForm.value.examgroup_id || undefined,
      };
      const response = await axios.get(
        'http://127.0.0.1:8000/api/export-exercises/',
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          params,
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.lengthComputable) {
              exportProgress.value = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
            }
          },
        }
      );
  
      exportProgress.value = 100;
  
      const contentDisposition = response.headers['content-disposition'];
      let filename = `exercises_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  
      ElMessage.success('导出成功');
      exportForm.value.downloading = false;
      fetchLogs();
    } catch (error) {
      exportProgress.value = 0;
      exportForm.value.downloading = false;
      const message = error.response?.data?.error || '导出失败';
      ElMessage.error(message);
    }
  };
  
  // 获取操作记录
  const fetchLogs = async () => {
    try {
      const params = {
        page: currentPage.value,
        page_size: pageSize.value,
        ...queryParams.value,
        timestamp_gte: timeRange.value?.[0] || '',
        timestamp_lte: timeRange.value?.[1] || '',
      };
      Object.keys(params).forEach((key) => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });
  
      const response = await axios.get('http://127.0.0.1:8000/api/user-action-logs/', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      logs.value = response.data.results || [];
      total.value = response.data.count || 0;
    } catch (error) {
      ElMessage.error('获取操作记录失败');
      logs.value = [];
      total.value = 0;
    }
  };
  
  // 重置筛选
  const resetFilters = () => {
    queryParams.value = {
      action_type: '',
      username: '',
      timestamp_gte: '',
      timestamp_lte: '',
    };
    timeRange.value = [];
    currentPage.value = 1;
    fetchLogs();
  };
  
  // 分页事件
  const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    fetchLogs();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchLogs();
  };
  
  // 监听级联筛选
  watch(() => exportForm.value.category_id, (newVal) => {
    exportForm.value.major_id = null;
    exportForm.value.chapter_id = null;
    exportForm.value.examgroup_id = null;
    majors.value = [];
    chapters.value = [];
    examgroups.value = [];
    if (newVal) {
      fetchMajors(newVal);
    }
  });
  
  watch(() => exportForm.value.major_id, (newVal) => {
    exportForm.value.chapter_id = null;
    exportForm.value.examgroup_id = null;
    chapters.value = [];
    examgroups.value = [];
    if (newVal) {
      fetchChapters(newVal);
    }
  });
  
  watch(() => exportForm.value.chapter_id, (newVal) => {
    exportForm.value.examgroup_id = null;
    examgroups.value = [];
    if (newVal) {
      fetchExamGroups(newVal);
    }
  });
  
  // 初始化
  onMounted(() => {
    fetchCategories();
    fetchLogs();
  });
  </script>
  
  <style scoped>
  .import-card,
  .export-card,
  .logs-card {
    margin-bottom: 20px;
  }
  
  .import-form,
  .export-form,
  .filter-form {
    margin-bottom: 20px;
  }
  
  .import-form :deep(.el-form-item),
  .export-form :deep(.el-form-item),
  .filter-form :deep(.el-form-item) {
    margin-right: 20px;
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .truncate {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .el-table {
    border: 1px solid #ebeef5;
  }
  
  .el-table th {
    background-color: #fafafa;
    font-weight: bold;
  }
  
  .wide-select {
    width: 300px;
    min-width: 200px;
  }
  
  /* JSON 弹出框样式 */
  .json-container {
    max-height: 500px;
    overflow-y: auto;
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
  }
  
  .json-container pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  .json-container code {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    color: #333;
  }
  </style>