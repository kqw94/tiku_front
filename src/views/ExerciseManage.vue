<!-- src/views/ExerciseManage.vue -->
<template>
  <div>
    <!-- 面包屑导航（保持不变） -->
    <el-breadcrumb separator="/" style="margin-bottom: 20px;">
      <el-breadcrumb-item :to="{ path: '/exercise' }">题库</el-breadcrumb-item>
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
        题目列表
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

    <edit-dialog
      :dialog-title="dialogTitle"
      :form-label="formLabel"
      :form="form"
      v-model="dialogVisible"
      @save="saveItem"
    />
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

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const form = ref({ id: null, name: '' });
    const formLabel = ref('');
    const currentType = ref('');

    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

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
        categories.value = [];
        total.value = 0;
      }
    };

    // 获取 Majors
    const fetchMajors = async (categoryId) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/majors/${categoryId}/`, {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        majors.value = response.data.results || [];
        // 从第一个 Major 中提取 category_name（假设后端未直接返回）
        currentCategoryName.value = categories.value.find(c => c.category_id === categoryId)?.category_name || '未知分类';
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取专业列表失败');
        console.error(error);
        majors.value = [];
        total.value = 0;
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
        chapters.value = [];
        total.value = 0;
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
        examGroups.value = [];
        total.value = 0;
      }
    };

    // 获取 Exercises
    const fetchExercises = async () => {
      try {
        const params = {
          page: currentPage.value,
          page_size: pageSize.value,
        };
        if (currentCategoryId.value) params.category_id = currentCategoryId.value;
        if (currentMajorId.value) params.major_id = currentMajorId.value;
        if (currentChapterId.value) params.chapter_id = currentChapterId.value;
        if (currentExamGroupId.value) params.examgroup_id = currentExamGroupId.value;

        const response = await axios.get('http://127.0.0.1:8000/api/exercises/', { params });
        exercises.value = response.data.results || [];
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取题目列表失败');
        console.error(error);
        exercises.value = [];
        total.value = 0;
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
      currentExercise.value = true;
      currentExamGroupId.value = row.examgroup_id;
      currentPage.value = 1;
      fetchExercises();
      router.push(`/exercise/major/${currentCategoryId.value}/chapter/${currentMajorId.value}/examgroup/${currentChapterId.value}/exercises/${currentExamGroupId.value}`);
    };

    // 添加/编辑弹窗
    const showAddDialog = (type) => {
      currentType.value = type;
      dialogTitle.value = `添加${type === 'category' ? '分类' : type === 'major' ? '专业' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'}`;
      formLabel.value = `${type === 'category' ? '分类' : type === 'major' ? '专业' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'}名称`;
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
    const saveItem = (formData) => {
      const type = currentType.value;
      const urlMap = {
        'category': 'categories',
        'major': 'majors',
        'chapter': 'chapters',
        'examgroup': 'examgroups',
        'exercise': 'exercises',
      };
      const url = `http://127.0.0.1:8000/api/${urlMap[type]}/`;
      let data = {};

      if (type === 'exercise') {
        // 简单实现，仅保存 exercise_id 和 stem，后续可扩展
        data = {
          exercise_id: formData.id || `${Date.now()}`, // 临时生成 ID，后端应处理
          stem: formData.name, // 使用 name 作为 stem
          exam_group: currentExamGroupId.value,
        };
      } else {
        data = { [`${type}_name`]: formData.name };
        if (type === 'major' && currentCategoryId.value) data.category = currentCategoryId.value;
        else if (type === 'chapter' && currentMajorId.value) data.major = currentMajorId.value;
        else if (type === 'examgroup' && currentChapterId.value) data.chapter = currentChapterId.value;
      }

      axios({
        method: form.value.id ? 'put' : 'post',
        url: form.value.id ? `${url}${form.value.id}/` : url,
        data,
      })
        .then(() => {
          ElMessage.success(form.value.id ? '更新成功' : '添加成功');
          dialogVisible.value = false;
          refreshList();
        })
        .catch((error) => {
          ElMessage.error('保存失败');
          console.error(error.response ? error.response.data : error);
        });
    };

    // 删除数据
    const deleteItem = (row, type) => {
      ElMessageBox.confirm(`确定删除${type === 'category' ? '分类' : type === 'major' ? '专业' : type === 'chapter' ? '章节' : type === 'examgroup' ? '考点' : '题目'} ${row[`${type}_name`] || row.exercise_id} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const idField = type === 'exercise' ? 'exercise_id' : `${type}_id`;
        axios.delete(`http://127.0.0.1:8000/api/${type}s/${row[idField]}/`)
          .then(() => {
            ElMessage.success('删除成功');
            refreshList();
          })
          .catch((error) => {
            ElMessage.error('删除失败');
            console.error(error);
          });
      });
    };

    
    // 刷新当前列表
    const refreshList = () => {
      if (currentExercise.value) {
        fetchExercises();
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
        fetchExercises();
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
      dialogVisible,
      dialogTitle,
      form,
      formLabel,
      currentType,
      currentPage,
      pageSize,
      total,
      fetchCategories,
      fetchMajors,
      fetchChapters,
      fetchExamGroups,
      fetchExercises,
      viewMajors,
      viewChapters,
      viewExamGroups,
      viewExercises,
      showAddDialog,
      editItem,
      saveItem,
      deleteItem,
      handleSizeChange,
      handleCurrentChange,
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