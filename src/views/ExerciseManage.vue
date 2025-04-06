<!-- src/views/ExerciseManage.vue -->
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" style="margin-bottom: 20px;">
      <el-breadcrumb-item :to="{ path: '/chapter' }">章节</el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentMajor" :to="{ path: `/exercise/major/${currentCategoryId}` }">
        {{ currentCategoryName }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentChapter" :to="{ path: `/exercise/major/${currentCategoryId}/chapter/${currentMajorId}` }">
        {{ currentMajorName }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentExamGroup" :to="{ path: `/exercise/major/${currentCategoryId}/chapter/${currentMajorId}/examgroup/${currentChapterId}` }">
        {{ currentChapterName }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentExercise">
        {{ currentExamGroupName }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <category-list
        v-if="!currentMajor"
        :categories="categories"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @add="showAddDialog"
        @view-majors="viewMajors"
        @edit="editItem"
        @delete="deleteItem"
        @export-exercises="exportExercises"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <major-list
        v-else-if="!currentChapter"
        :majors="majors"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @add="showAddDialog"
        @view-chapters="viewChapters"
        @edit="editItem"
        @delete="deleteItem"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <chapter-list
        v-else-if="!currentExamGroup"
        :chapters="chapters"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @add="showAddDialog"
        @view-exam-groups="viewExamGroups"
        @edit="editItem"
        @delete="deleteItem"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <exam-group-list
        v-else-if="!currentExercise"
        :exam-groups="examGroups"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @add="showAddDialog"
        @view-exercises="viewExercises"
        @edit="editItem"
        @delete="deleteItem"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <exercise-list
        v-else
        :exercises="exercises"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @add="showAddDialog"
        @edit="editItem"
        @delete="deleteItem"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 编辑/添加弹窗 -->
    <edit-dialog
      :dialog-title="dialogTitle"
      :form-label="formLabel"
      :form="form"
      v-model="dialogVisible"
      @save="saveItem"
    />

    <!-- 题目列表弹窗 -->
    <el-dialog title="题目列表" v-model="exerciseDialogVisible" width="80%">
      <exercise-list
        :exercises="exercises"
        :current-page="exercisePage"
        :page-size="exercisePageSize"
        :total="exerciseTotal"
        @size-change="handleExerciseSizeChange"
        @current-change="handleExerciseCurrentChange"
        @edit="editItem"
        @delete="deleteItem"
        @save-exercise="saveExercise"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exerciseDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import CategoryList from './CategoryList.vue';
import MajorList from './MajorList.vue';
import ChapterList from './ChapterList.vue';
import ExamGroupList from './ExamGroupList.vue';
import ExerciseList from './ExerciseList.vue';
import EditDialog from './EditDialog.vue';

export default {
  name: 'ExerciseManage',
  components: {
    CategoryList,
    MajorList,
    ChapterList,
    ExamGroupList,
    ExerciseList,
    EditDialog,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const categories = ref([]);
    const majors = ref([]);
    const chapters = ref([]);
    const examGroups = ref([]);
    const exercises = ref([]);

    const currentMajor = ref(false);
    const currentChapter = ref(false);
    const currentExamGroup = ref(false);
    const currentExercise = ref(false);
    const currentCategoryId = ref(null);
    const currentCategoryName = ref('');
    const currentMajorId = ref(null);
    const currentMajorName = ref('');
    const currentChapterId = ref(null);
    const currentChapterName = ref('');
    const currentExamGroupId = ref(null);
    const currentExamGroupName = ref('');

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const form = ref({ id: null, name: '' });
    const formLabel = ref('');
    const currentType = ref('');

    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    const exerciseDialogVisible = ref(false); // 题目弹窗可见性
    const exercisePage = ref(1); // 题目分页
    const exercisePageSize = ref(10);
    const exerciseTotal = ref(0);

    // 获取所有 Category
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        categories.value = response.data.results || [];
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取分类列表失败');
        console.error(error);
      }
    };

    // 获取 Majors
    const fetchMajors = async (categoryId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/majors/${categoryId}/`, {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        majors.value = response.data.results || [];
        currentCategoryName.value = categories.value.find(c => c.category_id === categoryId)?.category_name || '未知分类';
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取专业列表失败');
        console.error(error);
      }
    };

    // 获取 Chapters
    const fetchChapters = async (majorId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/chapters/${majorId}/`, {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        chapters.value = response.data.results || [];
        currentMajorName.value = majors.value.find(m => m.major_id === majorId)?.major_name || '未知专业';
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取章节列表失败');
        console.error(error);
      }
    };

    // 获取 ExamGroups
    const fetchExamGroups = async (chapterId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/examgroups/${chapterId}/`, {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        examGroups.value = response.data.results || [];
        currentChapterName.value = chapters.value.find(c => c.chapter_id === chapterId)?.chapter_name || '未知章节';
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取考点列表失败');
        console.error(error);
      }
    };

    // 获取 Exercises (弹窗版本)
    const fetchExercises = async (examgroupId) => {
      try {
        const params = {
          page: exercisePage.value,
          page_size: exercisePageSize.value,
          examgroup_id: examgroupId,
        };
        const response = await axios.get('http://127.0.0.1:8000/api/exercises/', { params });
        exercises.value = response.data.results || [];
        exerciseTotal.value = response.data.count || 0;
        exerciseDialogVisible.value = true;
        currentExamGroupName.value = examGroups.value.find(c => c.examgroup_id === examgroupId)?.examgroup_name || '未知考点';
      } catch (error) {
        ElMessage.error('获取题目列表失败');
        console.error(error);
      }
    };

// ExamManage.vue
const saveExercise = async (exerciseData) => {
  try {
    const url = exerciseData.exercise_id
      ? `http://127.0.0.1:8000/api/exercises/${exerciseData.exercise_id}/`
      : 'http://127.0.0.1:8000/api/exercises/';
    const method = exerciseData.exercise_id ? 'put' : 'post';
    await axios({
      method,
      url,
      data: {
        exercise_id: exerciseData.exercise_id,
        stem: exerciseData.stem,
        questions: exerciseData.questions, // 包含 question_order
        answer: exerciseData.answer,
        analysis: exerciseData.analysis,
        // exam_id: currentExamId.value,
      },
    });
    ElMessage.success(exerciseData.exercise_id ? '更新成功' : '添加成功');
    fetchExercises(currentExamGroupId.value); // 刷新列表
  } catch (error) {
    ElMessage.error('保存失败');
    console.error(error.response ? error.response.data : error);
  }
};

    // 查看下一级
    const viewMajors = (row) => {
      currentMajor.value = true;
      currentChapter.value = false;
      currentExamGroup.value = false;
      currentExercise.value = false;
      currentCategoryId.value = row.category_id;
      currentPage.value = 1;
      fetchMajors(row.category_id);
      router.push(`/exercise/major/${row.category_id}`);
    };

    const viewChapters = (row) => {
      currentChapter.value = true;
      currentExamGroup.value = false;
      currentExercise.value = false;
      currentMajorId.value = row.major_id;
      currentPage.value = 1;
      fetchChapters(row.major_id);
      router.push(`/exercise/major/${currentCategoryId.value}/chapter/${row.major_id}`);
    };

    const viewExamGroups = (row) => {
      currentExamGroup.value = true;
      currentExercise.value = false;
      currentChapterId.value = row.chapter_id;
      currentPage.value = 1;
      fetchExamGroups(row.chapter_id);
      router.push(`/exercise/major/${currentCategoryId.value}/chapter/${currentMajorId.value}/examgroup/${row.chapter_id}`);
    };

    const viewExercises = (row) => {
      exercisePage.value = 1; // 重置分页
      currentExamGroupId.value = row.examgroup_id;
      fetchExercises(row.examgroup_id);
    };

    // 添加/编辑弹窗
    const showAddDialog = (type) => {
      currentType.value = type;
      dialogTitle.value = `添加${type === 'category' ? '专业' : type === 'major' ? '科目' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'}`;
      formLabel.value = `${type === 'category' ? '专业' : type === 'major' ? '科目' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'}名称`;
      form.value = { id: null, name: '' };
      dialogVisible.value = true;
    };

    const editItem = (row, type) => {
      currentType.value = type;
      dialogTitle.value = `编辑${type === 'category' ? '分类' : type === 'major' ? '专业' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'}`;
      formLabel.value = `${type === 'category' ? '分类' : type === 'major' ? '专业' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'}名称`;
      form.value = { id: row[`${type}_id`], name: row[`${type}_name`] || '' };
      dialogVisible.value = true;
    };

    // 保存数据
    const saveItem = async (formData) => {
      const type = currentType.value;
      let url = '';
      let data = {};

      switch (type) {
        case 'category':
          url = form.value.id
            ? `http://127.0.0.1:8000/api/crud/categories/${form.value.id}/`
            : 'http://127.0.0.1:8000/api/crud/categories/create/';
          data = { category_name: formData.name };
          break;
        case 'major':
          url = form.value.id
            ? `http://127.0.0.1:8000/api/crud/majors/${form.value.id}/`
            : 'http://127.0.0.1:8000/api/crud/majors/create/';
          data = { major_name: formData.name, category_id: currentCategoryId.value };
          break;
        case 'chapter':
          url = form.value.id
            ? `http://127.0.0.1:8000/api/crud/chapters/${form.value.id}/`
            : 'http://127.0.0.1:8000/api/crud/chapters/create/';
          data = { chapter_name: formData.name, major_id: currentMajorId.value };
          break;
        case 'examgroup':
          url = form.value.id
            ? `http://127.0.0.1:8000/api/crud/examgroups/${form.value.id}/`
            : 'http://127.0.0.1:8000/api/crud/examgroups/create/';
          data = { examgroup_name: formData.name, chapter_id: currentChapterId.value };
          break;
        case 'exercise':
          url = form.value.id
            ? `http://127.0.0.1:8000/api/exercises/${form.value.id}/`
            : 'http://127.0.0.1:8000/api/exercises/';
          data = {
            exercise_id: formData.id || `${Date.now()}`,
            stem: { stem_content: formData.name },
            exam_group_id: currentExamGroupId.value,
          };
          break;
      }

      try {
        const method = form.value.id ? 'put' : 'post';
        await axios({ method, url, data });
        ElMessage.success(form.value.id ? '更新成功' : '添加成功');
        dialogVisible.value = false;
        refreshList();
      } catch (error) {
        ElMessage.error('保存失败');
        console.error(error.response ? error.response.data : error);
      }
    };

    // 删除数据
    const deleteItem = (row, type) => {
      ElMessageBox.confirm(
        `确定删除${type === 'category' ? '分类' : type === 'major' ? '专业' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'} ${row[`${type}_name`] || row.exercise_id} 吗？`,
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).then(async () => {
        const idField = type === 'exercise' ? 'exercise_id' : `${type}_id`;
        let url = '';
        switch (type) {
          case 'category':
            url = `http://127.0.0.1:8000/api/crud/categories/${row[idField]}/`;
            break;
          case 'major':
            url = `http://127.0.0.1:8000/api/crud/majors/${row[idField]}/`;
            break;
          case 'chapter':
            url = `http://127.0.0.1:8000/api/crud/chapters/${row[idField]}/`;
            break;
          case 'examgroup':
            url = `http://127.0.0.1:8000/api/crud/examgroups/${row[idField]}/`;
            break;
          case 'exercise':
            url = `http://127.0.0.1:8000/api/exercises/${row[idField]}/`;
            break;
        }

        try {
          await axios.delete(url);
          ElMessage.success('删除成功');
          refreshList();
        } catch (error) {
          ElMessage.error('删除失败');
          console.error(error.response ? error.response.data : error);
        }
      }).catch(() => {
        ElMessage.info('已取消删除');
      });
    };

  const exportExercises = async (row) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/export-exercises-by-category/${row.category_id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          responseType: 'blob'  // 支持流式下载
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `exercises_category_${row.category_id}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        ElMessage.success('导出成功');
      } catch (error) {
        ElMessage.error('导出失败: ' + (error.response?.data?.error || error.message));
        console.error(error);
      }
  };

    // 刷新当前列表
    const refreshList = () => {
      if (currentExercise.value) {
        fetchExercises(currentExamGroupId.value);
      } else if (currentExamGroup.value) {
        fetchExamGroups(currentChapterId.value);
      } else if (currentChapter.value) {
        fetchChapters(currentMajorId.value);
      } else if (currentMajor.value) {
        fetchMajors(currentCategoryId.value);
      } else {
        fetchCategories();
      }
    };

    // 分页事件
    const handleSizeChange = (val) => {
      pageSize.value = val;
      refreshList();
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
      refreshList();
    };

    // 题目分页事件
    const handleExerciseSizeChange = (val) => {
      exercisePageSize.value = val;
      fetchExercises(currentExamGroupId.value);
    };

    const handleExerciseCurrentChange = (val) => {
      exercisePage.value = val;
      fetchExercises(currentExamGroupId.value);
    };

    // 监听路由变化
    watch(() => route.path, (newPath) => {
      currentPage.value = 1;
      const majorMatch = newPath.match(/\/exercise\/major\/(\d+)/);
      const chapterMatch = newPath.match(/\/exercise\/major\/(\d+)\/chapter\/(\d+)/);
      const examGroupMatch = newPath.match(/\/exercise\/major\/(\d+)\/chapter\/(\d+)\/examgroup\/(\d+)/);
      const exercisesMatch = newPath.match(/\/exercise\/major\/(\d+)\/chapter\/(\d+)\/examgroup\/(\d+)\/exercises\/(\d+)/);

      if (exercisesMatch) {
        currentMajor.value = true;
        currentChapter.value = true;
        currentExamGroup.value = true;
        currentExercise.value = true;
        currentCategoryId.value = Number(exercisesMatch[1]);
        currentMajorId.value = Number(exercisesMatch[2]);
        currentChapterId.value = Number(exercisesMatch[3]);
        currentExamGroupId.value = Number(exercisesMatch[4]);
        fetchExercises(currentExamGroupId.value);
      } else if (examGroupMatch) {
        currentMajor.value = true;
        currentChapter.value = true;
        currentExamGroup.value = true;
        currentExercise.value = false;
        currentCategoryId.value = Number(examGroupMatch[1]);
        currentMajorId.value = Number(examGroupMatch[2]);
        currentChapterId.value = Number(examGroupMatch[3]);
        fetchExamGroups(currentChapterId.value);
      } else if (chapterMatch) {
        currentMajor.value = true;
        currentChapter.value = true;
        currentExamGroup.value = false;
        currentExercise.value = false;
        currentCategoryId.value = Number(chapterMatch[1]);
        currentMajorId.value = Number(chapterMatch[2]);
        fetchChapters(currentMajorId.value);
      } else if (majorMatch) {
        currentMajor.value = true;
        currentChapter.value = false;
        currentExamGroup.value = false;
        currentExercise.value = false;
        currentCategoryId.value = Number(majorMatch[1]);
        fetchMajors(currentCategoryId.value);
      } else {
        currentMajor.value = false;
        currentChapter.value = false;
        currentExamGroup.value = false;
        currentExercise.value = false;
        fetchCategories();
      }
    });

    onMounted(() => {
      refreshList();
    });

    return {
      categories,
      majors,
      chapters,
      examGroups,
      exercises,
      currentMajor,
      currentChapter,
      currentExamGroup,
      currentExercise,
      currentCategoryId,
      currentCategoryName,
      currentMajorId,
      currentMajorName,
      currentChapterId,
      currentChapterName,
      currentExamGroupId,
      currentExamGroupName,
      dialogVisible,
      dialogTitle,
      form,
      formLabel,
      currentType,
      currentPage,
      pageSize,
      total,
      exerciseDialogVisible,
      exercisePage,
      exercisePageSize,
      exerciseTotal,
      fetchCategories,
      fetchMajors,
      fetchChapters,
      fetchExamGroups,
      fetchExercises,
      saveExercise,
      viewMajors,
      viewChapters,
      viewExamGroups,
      viewExercises,
      showAddDialog,
      editItem,
      saveItem,
      deleteItem,
      exportExercises,
      handleSizeChange,
      handleCurrentChange,
      handleExerciseSizeChange,
      handleExerciseCurrentChange,
      refreshList,
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
</style>