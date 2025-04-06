<template>
  <div>
    <el-card>
      <el-button type="primary" @click="showAddDialog">添加用户</el-button>
      <el-table :data="users" style="width: 100%; margin-top: 20px;" border>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="username" label="用户名" width="200" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="150">
          <template #default="scope">
            {{ scope.row.role ? scope.row.role.name : '未分配' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button type="text" @click="editUser(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteUser(scope.row)">删除</el-button>
            <el-button type="text" @click="assignRole(scope.row)">分配角色</el-button>
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

    <!-- 用户添加/编辑对话框 -->
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

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" v-model="roleDialogVisible" width="30%">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色">
          <el-select v-model="roleForm.role" placeholder="请选择角色">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

const users = ref([]);
const roles = ref([]);
const dialogVisible = ref(false);
const roleDialogVisible = ref(false);
const dialogTitle = ref('');
const userForm = ref({ id: null, username: '', email: '' });
const roleForm = ref({ id: null, role: null });
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
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
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

const fetchRoles = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/roles/', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    });
    roles.value = response.data.results || [];
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
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
          await axios.put(
            `http://127.0.0.1:8000/api/users/${userForm.value.id}/`,
            userForm.value,
            { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
          );
          ElMessage.success('用户更新成功');
        } else {
          await axios.post('http://127.0.0.1:8000/api/users/', userForm.value, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
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
      await axios.delete(`http://127.0.0.1:8000/api/users/${row.id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      ElMessage.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      ElMessage.error('删除用户失败');
      console.error(error);
    }
  })
  .catch((error) => {
      if (error === 'cancel') {
        // 用户点击取消，不做任何操作
        console.log('用户取消删除角色');
      } else {
        ElMessage.error('删除角色时发生错误');
        console.error(error);
      }
    });
};

const assignRole = (row) => {
  roleForm.value = { 
    id: row.id, 
    role: row.role ? row.role.id : null 
  };
  roleDialogVisible.value = true;
};

const saveRole = async () => {
  try {
    await axios.put(
      `http://127.0.0.1:8000/api/users/${roleForm.value.id}/`,
      { role: roleForm.value.role },
      { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
    );
    ElMessage.success('角色分配成功');
    roleDialogVisible.value = false;
    fetchUsers();
  } catch (error) {
    ElMessage.error('角色分配失败');
    console.error(error);
  }
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
  fetchRoles();
});
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>