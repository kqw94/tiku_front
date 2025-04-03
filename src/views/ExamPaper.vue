<template>
  <div>
    <el-card>
      <el-button type="primary" @click="showAddExamDialog">添加试卷</el-button>
      <el-table :data="exams" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="exam_id" label="ID" width="100" />
        <el-table-column prop="exam_full_name" label="试卷名称" width="200" />
        <el-table-column prop="from_school" label="来源学校" width="150" />
        <el-table-column prop="exam_time" label="考试时间" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="text" @click="editExam(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteExam(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
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

    <!-- 添加/编辑试卷弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%">
      <el-form :model="examForm" label-width="80px" :rules="rules" ref="examFormRef">
        <el-form-item label="试卷名称" prop="exam_full_name">
          <el-input v-model="examForm.exam_full_name" />
        </el-form-item>
        <el-form-item label="来源学校" prop="from_school">
          <el-input v-model="examForm.from_school" />
        </el-form-item>
        <el-form-item label="考试时间" prop="exam_time">
          <el-input v-model="examForm.exam_time" />
        </el-form-item>
        <el-form-item label="试卷编码" prop="exam_code">
          <el-input v-model="examForm.exam_code" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExam">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const exams = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const examForm = ref({
  exam_id: null,
  exam_full_name: '',
  from_school: '',
  exam_time: '',
  exam_code: '',
});
const examFormRef = ref(null);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const rules = {
  exam_full_name: [{ required: true, message: '请输入试卷名称', trigger: 'blur' }],
};

// 获取分页数据
const fetchExams = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/exams/', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
      },
    });
    exams.value = response.data.results; // 分页数据
    total.value = response.data.count;   // 总记录数
  } catch (error) {
    ElMessage.error('获取试卷列表失败');
    console.error(error);
  }
};

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchExams(); // 每页数量变化时重新加载
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchExams(); // 页码变化时重新加载
};

const showAddExamDialog = () => {
  dialogTitle.value = '添加试卷';
  examForm.value = { exam_id: null, exam_full_name: '', from_school: '', exam_time: '', exam_code: '' };
  dialogVisible.value = true;
};

const editExam = (row) => {
  dialogTitle.value = '编辑试卷';
  examForm.value = { ...row };
  dialogVisible.value = true;
};

const saveExam = () => {
  examFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (examForm.value.exam_id) {
          await axios.put(`http://127.0.0.1:8000/api/exams/${examForm.value.exam_id}/`, examForm.value);
          ElMessage.success('试卷更新成功');
        } else {
          await axios.post('http://127.0.0.1:8000/api/exams/', examForm.value);
          ElMessage.success('试卷添加成功');
        }
        dialogVisible.value = false;
        fetchExams();
      } catch (error) {
        ElMessage.error('保存试卷失败');
        console.error(error);
      }
    }
  });
};

const deleteExam = (row) => {
  ElMessageBox.confirm('确定删除该试卷吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/exams/${row.exam_id}/`);
      ElMessage.success('试卷删除成功');
      fetchExams();
    } catch (error) {
      ElMessage.error('删除试卷失败');
      console.error(error);
    }
  });
};

onMounted(() => {
  fetchExams();
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>