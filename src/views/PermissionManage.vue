<template>
  <div>
    <el-card>
      <el-button type="primary" @click="showAddDialog">添加用户</el-button>
      <el-table :data="users" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="username" label="用户名" width="200" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="text" @click="editUser(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteUser(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%">
      <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const users = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const userForm = ref({ id: null, username: '', email: '' });
const userFormRef = ref(null);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
};

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/users/', {
      params: { page: currentPage.value, page_size: pageSize.value },
    });
    users.value = response.data.results || [];
    total.value = response.data.count || 0;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
    users.value = [];
    total.value = 0;
  }
};

const showAddDialog = () => {
  dialogTitle.value = '添加用户';
  userForm.value = { id: null, username: '', email: '' };
  dialogVisible.value = true;
};

const editUser = (row) => {
  dialogTitle.value = '编辑用户';
  userForm.value = { ...row };
  dialogVisible.value = true;
};

const saveUser = () => {
  userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (userForm.value.id) {
          await axios.put(`http://127.0.0.1:8000/api/users/${userForm.value.id}/`, userForm.value);
          ElMessage.success('用户更新成功');
        } else {
          await axios.post('http://127.0.0.1:8000/api/users/', userForm.value);
          ElMessage.success('用户添加成功');
        }
        dialogVisible.value = false;
        fetchUsers();
      } catch (error) {
        ElMessage.error('保存用户失败');
        console.error(error);
      }
    }
  });
};

const deleteUser = (row) => {
  ElMessageBox.confirm(`确定删除用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${row.id}/`);
      ElMessage.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      ElMessage.error('删除用户失败');
      console.error(error);
    }
  });
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchUsers();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>