<!-- src/views/ExamManage.vue -->
<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" style="margin-bottom: 20px;">
      <el-breadcrumb-item :to="{ path: '/exam-paper' }">试卷</el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentSchool" :to="{ path: `/exam/category/${currentCategoryId}` }">
        {{ currentCategoryName }}
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="currentExam">
        {{ currentSchoolName }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 专业 (Category) 列表 -->
      <div v-if="!currentSchool">
        <el-button type="primary" @click="showAddDialog('category')">添加专业</el-button>
        <el-table :data="categories" style="width: 100%; margin-top: 20px;" border>
          <el-table-column prop="category_id" label="ID" width="100" />
          <el-table-column prop="category_name" label="专业" />
          <el-table-column label="操作" width="300">
            <template #default="scope">
              <el-button type="text" @click="viewSchools(scope.row)">查看院校</el-button>
              <el-button type="text" @click="editItem(scope.row, 'category')">编辑</el-button>
              <el-button type="text" @click="deleteItem(scope.row, 'category')">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 院校 (School) 列表 -->
      <div v-else-if="!currentExam">
        <el-button type="primary" @click="showAddDialog('school')">添加院校</el-button>
        <el-table :data="schools" style="width: 100%; margin-top: 20px;" border>
          <el-table-column prop="school_id" label="ID" width="100" />
          <el-table-column prop="name" label="院校名称" />
          <el-table-column label="操作" width="300">
            <template #default="scope">
              <el-button type="text" @click="viewExams(scope.row)">查看试卷</el-button>
              <el-button type="text" @click="editItem(scope.row, 'school')">编辑</el-button>
              <el-button type="text" @click="deleteItem(scope.row, 'school')">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 试卷列表 (Exam List) -->
      <div v-else>
        <el-button type="primary" @click="showAddDialog('exam')">添加试卷</el-button>
        <el-table :data="exams" style="width: 100%; margin-top: 20px;" border>
          <el-table-column prop="exam_id" label="ID" width="100" />
          <el-table-column prop="exam_time" label="考试时间" width="150" />
          <el-table-column prop="exam_code" label="考试代码" width="150" />
          <el-table-column prop="exam_full_name" label="考试全称" />
          <el-table-column label="操作" width="300">
            <template #default="scope">
              <el-button type="text" @click="viewExercises(scope.row)">查看</el-button>
              <el-button type="text" @click="editItem(scope.row, 'exam')">编辑</el-button>
              <el-button type="text" @click="deleteItem(scope.row, 'exam')">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-if="total > 0"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑/添加弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%">
      <el-form :model="form" label-width="80px">
        <el-form-item v-if="currentType === 'category'" label="专业名称">
          <el-input v-model="form.category_name"></el-input>
        </el-form-item>
        <el-form-item v-else-if="currentType === 'school'" label="院校名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item v-else-if="currentType === 'exam'" label="考试时间">
          <el-input v-model="form.exam_time"></el-input>
        </el-form-item>
        <el-form-item v-if="currentType === 'exam'" label="考试代码">
          <el-input v-model="form.exam_code"></el-input>
        </el-form-item>
        <el-form-item v-if="currentType === 'exam'" label="考试全称">
          <el-input v-model="form.exam_full_name"></el-input>
        </el-form-item>
        <el-form-item v-if="currentType === 'exam'" label="学校名称">
          <el-input v-model="form.from_school" disabled></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveItem">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
import ExerciseList from './ExerciseList.vue'; // 引入 ExerciseList 组件

export default {
  name: 'ExamManage',
  components: {
    ExerciseList, // 注册组件
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const categories = ref([]);
    const schools = ref([]);
    const exams = ref([]);
    const exercises = ref([]); // 题目数据

    const currentSchool = ref(false);
    const currentExam = ref(false);
    const currentCategoryId = ref(null);
    const currentCategoryName = ref('');
    const currentSchoolId = ref(null);
    const currentSchoolName = ref('');

    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const form = ref({
      category_id: null,
      school_id: null,
      exam_id: null,
      category_name: '',
      name: '',
      exam_time: '',
      exam_code: '',
      exam_full_name: '',
      from_school: '',
    });
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
        const response = await axios.get('/categories/', {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        categories.value = response.data.results || [];
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取专业列表失败');
        console.error(error);
      }
    };

    // 获取学校列表
    const fetchSchools = async () => {
      try {
        const response = await axios.get('/schools/', {
          params: { page: currentPage.value, page_size: pageSize.value },
        });
        schools.value = response.data.results || [];
        total.value = response.data.count || 0;
      } catch (error) {
        ElMessage.error('获取院校列表失败');
        console.error(error);
      }
    };

    // 获取试卷列表
    const fetchExams = async (schoolId) => {
      try {
        const response = await axios.get('/exams/', {
          params: {
            school_id: schoolId,
            category_id: currentCategoryId.value,
            page: currentPage.value,
            page_size: pageSize.value,
          },
        });
        exams.value = response.data.results || [];
        total.value = response.data.count || 0;
        currentSchoolName.value = schools.value.find(s => s.school_id === schoolId)?.name || '未知院校';
      } catch (error) {
        ElMessage.error('获取试卷列表失败');
        console.error(error);
      }
    };

    // 获取题目列表
    const fetchExercises = async (examId) => {
      try {
        const response = await axios.get('/exercises/', {
          params: {
            exam_id: examId, // 假设后端支持按 exam_id 查询题目
            page: exercisePage.value,
            page_size: exercisePageSize.value,
          },
        });
        exercises.value = response.data.results || [];
        exerciseTotal.value = response.data.count || 0;
        exerciseDialogVisible.value = true;
      } catch (error) {
        ElMessage.error('获取题目列表失败');
        console.error(error);
      }
    };

const saveExercise = async (exerciseData) => {
  try {
    const url = exerciseData.exercise_id
      ? `/exercises/${exerciseData.exercise_id}/`
      : '/exercises/';
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
        exam_id: currentExamId.value,
      },
    });
    ElMessage.success(exerciseData.exercise_id ? '更新成功' : '添加成功');
    fetchExercises(currentExamId.value); // 刷新列表
  } catch (error) {
    ElMessage.error('保存失败');
    console.error(error.response ? error.response.data : error);
  }
};

    // 查看下一级
    const viewSchools = (row) => {
      currentSchool.value = true;
      currentExam.value = false;
      currentCategoryId.value = row.category_id;
      currentCategoryName.value = row.category_name;
      currentPage.value = 1;
      fetchSchools();
      router.push(`/exam/category/${row.category_id}`);
    };

    const viewExams = (row) => {
      currentExam.value = true;
      currentSchoolId.value = row.school_id;
      currentSchoolName.value = row.name;
      currentPage.value = 1;
      fetchExams(row.school_id);
      router.push(`/exam/category/${currentCategoryId.value}/school/${row.school_id}`);
    };

    // 查看题目
    // const viewExercises = (row) => {
    //   exercisePage.value = 1; // 重置分页
    //   fetchExercises(row.exam_id);
    // };

    // 添加/编辑弹窗
    const showAddDialog = (type) => {
      currentType.value = type;
      dialogTitle.value = `添加${type === 'category' ? '专业' : type === 'school' ? '院校' : '试卷'}`;
      form.value = {
        category_id: null,
        school_id: null,
        exam_id: null,
        category_name: '',
        name: '',
        exam_time: '',
        exam_code: '',
        exam_full_name: '',
        from_school: type === 'exam' ? currentSchoolName.value : '',
      };
      dialogVisible.value = true;
    };

    const editItem = (row, type) => {
      currentType.value = type;
      dialogTitle.value = `编辑${type === 'category' ? '专业' : type === 'school' ? '院校' : '试卷'}`;
      if (type === 'category') {
        form.value = { category_id: row.category_id, category_name: row.category_name };
      } else if (type === 'school') {
        form.value = { school_id: row.school_id, name: row.name };
      } else if (type === 'exam') {
        form.value = {
          exam_id: row.exam_id,
          exam_time: row.exam_time,
          exam_code: row.exam_code || '',
          exam_full_name: row.exam_full_name,
          from_school: row.from_school || currentSchoolName.value,
        };
      }
      dialogVisible.value = true;
    };

    // 保存数据
    const saveItem = async () => {
      const type = currentType.value;
      let url = '';
      let method = 'post';
      let data = {};

      switch (type) {
        case 'category':
          url = form.value.category_id
            ? `/crud/categories/${form.value.category_id}/`
            : '/crud/categories/create/';
          method = form.value.category_id ? 'put' : 'post';
          data = { category_name: form.value.category_name };
          break;
        case 'school':
          url = form.value.school_id
            ? `/schools/${form.value.school_id}/`
            : '/schools/';
          method = form.value.school_id ? 'put' : 'post';
          data = { name: form.value.name };
          break;
        case 'exam':
          url = form.value.exam_id
            ? `/exams/${form.value.exam_id}/`
            : '/exams/';
          method = form.value.exam_id ? 'put' : 'post';
          data = {
            category: currentCategoryId.value,
            school: currentSchoolId.value,
            from_school: form.value.from_school,
            exam_time: form.value.exam_time,
            exam_code: form.value.exam_code,
            exam_full_name: form.value.exam_full_name,
          };
          break;
      }

      try {
        await axios({ method, url, data });
        ElMessage.success(form.value[type + '_id'] ? '更新成功' : '添加成功');
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
        `确定删除${type === 'category' ? '专业' : type === 'school' ? '院校' : '试卷'} ${row[type === 'category' ? 'category_name' : type === 'exam' ? 'exam_full_name' : 'name']} 吗？`,
        '提示',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).then(async () => {
        let url = '';
        if (type === 'category') url = `/categories/${row.category_id}/`;
        else if (type === 'school') url = `/schools/${row.school_id}/`;
        else if (type === 'exam') url = `/exams/${row.exam_id}/`;

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

    // 刷新当前列表
    const refreshList = () => {
      if (currentExam.value) fetchExams(currentSchoolId.value);
      else if (currentSchool.value) fetchSchools();
      else fetchCategories();
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
      fetchExercises(exams.value.find(e => e.exam_id === currentExamId.value)?.exam_id);
    };

    const handleExerciseCurrentChange = (val) => {
      exercisePage.value = val;
      fetchExercises(exams.value.find(e => e.exam_id === currentExamId.value)?.exam_id);
    };

    // 当前试卷 ID
    const currentExamId = ref(null);

    // 更新 viewExercises 以记录当前 exam_id
    const updatedViewExercises = (row) => {
      currentExamId.value = row.exam_id;
      exercisePage.value = 1;
      fetchExercises(row.exam_id);
    };

    watch(
      () => route.path,
      (newPath) => {
        currentPage.value = 1;
        const schoolMatch = newPath.match(/\/exam\/category\/(\d+)/);
        const examMatch = newPath.match(/\/exam\/category\/(\d+)\/school\/(\d+)/);

        if (examMatch) {
          currentSchool.value = true;
          currentExam.value = true;
          currentCategoryId.value = Number(examMatch[1]);
          currentSchoolId.value = Number(examMatch[2]);
          fetchExams(currentSchoolId.value);
        } else if (schoolMatch) {
          currentSchool.value = true;
          currentExam.value = false;
          currentCategoryId.value = Number(schoolMatch[1]);
          fetchSchools();
        } else {
          currentSchool.value = false;
          currentExam.value = false;
          fetchCategories();
        }
      }
    );

    onMounted(() => {
      fetchCategories();
    });

    return {
      categories,
      schools,
      exams,
      exercises,
      currentSchool,
      currentExam,
      currentCategoryId,
      currentCategoryName,
      currentSchoolId,
      currentSchoolName,
      dialogVisible,
      dialogTitle,
      form,
      currentType,
      currentPage,
      pageSize,
      total,
      saveExercise,
      exerciseDialogVisible,
      exercisePage,
      exercisePageSize,
      exerciseTotal,
      fetchCategories,
      fetchSchools,
      fetchExams,
      fetchExercises,
      viewSchools,
      viewExams,
      viewExercises: updatedViewExercises, // Use the updated function name
      showAddDialog,
      editItem,
      saveItem,
      deleteItem,
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