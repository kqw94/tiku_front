<template>
    <div>
      <el-card>
        <el-button type="primary" @click="showAddDialog">添加角色</el-button>
        <el-table :data="roles" style="width: 100%; margin-top: 20px;" border>
          <el-table-column prop="id" label="ID" width="100" />
          <el-table-column prop="name" label="角色名称" width="200" />
          <el-table-column prop="description" label="描述" width="300" />
          <el-table-column label="操作" width="300">
            <template #default="scope">
              <el-button type="text" @click="editRole(scope.row)">编辑</el-button>
              <el-button type="text" @click="deleteRole(scope.row)">删除</el-button>
              <el-button type="text" @click="assignPermissions(scope.row)">分配权限</el-button>
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
  
      <!-- 角色添加/编辑对话框 -->
      <el-dialog :title="dialogTitle" v-model="dialogVisible" width="30%">
        <el-form :model="roleForm" :rules="rules" ref="roleFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="roleForm.description" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">保存</el-button>
        </template>
      </el-dialog>
  
      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" v-model="permissionDialogVisible" width="50%">
        <el-form :model="permissionForm" label-width="100px">
          <el-table :data="permissionForm.permissions" border style="width: 100%;">
            <el-table-column prop="model_name" label="功能模块" width="150">
              <template #default="scope">
                <el-select v-model="scope.row.model_name" placeholder="选择模块" @change="updatePermission(scope.row)">
                  <el-option v-for="model in availableModels" :key="model.value" :label="model.label" :value="model.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="添加" width="80" align="center">
              <template #default="scope">
                <el-checkbox v-model="scope.row.can_create" @change="updatePermission(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="查看" width="80" align="center">
              <template #default="scope">
                <el-checkbox v-model="scope.row.can_read" @change="updatePermission(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="编辑" width="80" align="center">
              <template #default="scope">
                <el-checkbox v-model="scope.row.can_update" @change="updatePermission(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="删除" width="80" align="center">
              <template #default="scope">
                <el-checkbox v-model="scope.row.can_delete" @change="updatePermission(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button type="text" @click="deletePermission(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" style="margin-top: 10px;" @click="addPermission">添加权限</el-button>
        </el-form>
        <template #footer>
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  const roles = ref([]);
  const dialogVisible = ref(false);
  const permissionDialogVisible = ref(false);
  const dialogTitle = ref('');
  const roleForm = ref({ id: null, name: '', description: '' });
  const permissionForm = ref({ roleId: null, permissions: [] });
  const roleFormRef = ref(null);
  
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  
  // 可用的功能模块（中文形式）
  const availableModels = ref([
    { label: '习题', value: 'Exercise' },
    { label: '专业', value: 'Category' },
    { label: '科目', value: 'Major' },
    { label: '章节', value: 'Chapter' },
    { label: '考点', value: 'ExamGroup'},
    { label: '试卷', value: 'Exam' },
    { label: '学校', value: 'School' },
    { label: '用户', value: 'User' },
    { label: '角色', value: 'Role' },
  ]);
  
  const rules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  };
  
  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/roles/', {
        params: { page: currentPage.value, page_size: pageSize.value },
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      roles.value = response.data.results || [];
      total.value = response.data.count || 0;
    } catch (error) {
      ElMessage.error('获取角色列表失败');
      console.error(error);
      roles.value = [];
      total.value = 0;
    }
  };
  
  // 获取角色的权限
  const fetchPermissions = async (roleId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/role-permissions/?role=${roleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      permissionForm.value.permissions = response.data.map(perm => ({
        id: perm.id,
        model_name: perm.model_name,
        can_create: perm.can_create,
        can_read: perm.can_read,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
      }));
    } catch (error) {
      ElMessage.error('获取权限列表失败');
      console.error(error);
      permissionForm.value.permissions = [];
    }
  };
  
  const showAddDialog = () => {
    dialogTitle.value = '添加角色';
    roleForm.value = { id: null, name: '', description: '' };
    dialogVisible.value = true;
  };
  
  const editRole = (row) => {
    dialogTitle.value = '编辑角色';
    roleForm.value = { ...row };
    dialogVisible.value = true;
  };
  
  const saveRole = () => {
    roleFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (roleForm.value.id) {
            await axios.put(
              `http://127.0.0.1:8000/api/roles/${roleForm.value.id}/`,
              roleForm.value,
              { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );
            ElMessage.success('角色更新成功');
          } else {
            await axios.post('http://127.0.0.1:8000/api/roles/', roleForm.value, {
              headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            ElMessage.success('角色添加成功');
          }
          dialogVisible.value = false;
          fetchRoles();
        } catch (error) {
          ElMessage.error('保存角色失败');
          console.error(error);
        }
      }
    });
  };
  
  const deleteRole = (row) => {
    ElMessageBox.confirm(`确定删除角色 ${row.name} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/roles/${row.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        ElMessage.success('角色删除成功');
        fetchRoles();
      } catch (error) {
        ElMessage.error('删除角色失败');
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
  
  // 分配权限相关方法
  const assignPermissions = (row) => {
    permissionForm.value.roleId = row.id;
    fetchPermissions(row.id);
    permissionDialogVisible.value = true;
  };
  
  const addPermission = () => {
    permissionForm.value.permissions.push({
      id: null,
      model_name: '',
      can_create: false,
      can_read: false,
      can_update: false,
      can_delete: false,
    });
  };
  
  const deletePermission = (index) => {
    const perm = permissionForm.value.permissions[index];
    if (perm.id) {
      ElMessageBox.confirm(`确定删除 ${perm.model_name} 的权限吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/role-permissions/${perm.id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
          permissionForm.value.permissions.splice(index, 1);
          ElMessage.success('权限删除成功');
        } catch (error) {
          ElMessage.error('删除权限失败');
          console.error(error);
        }
      });
    } else {
      permissionForm.value.permissions.splice(index, 1);
    }
  };
  
  const updatePermission = async (perm) => {
    if (perm.id && perm.model_name) {
      try {
        await axios.put(
          `http://127.0.0.1:8000/api/role-permissions/${perm.id}/`,
          {
            role: permissionForm.value.roleId,
            model_name: perm.model_name,
            can_create: perm.can_create,
            can_read: perm.can_read,
            can_update: perm.can_update,
            can_delete: perm.can_delete,
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
        );
        ElMessage.success('权限更新成功');
      } catch (error) {
        ElMessage.error('更新权限失败');
        console.error(error);
      }
    }
  };
  
  const savePermissions = async () => {
    try {
      for (const perm of permissionForm.value.permissions) {
        if (!perm.model_name) continue; // 跳过未选择模块的行
        const data = {
          role: permissionForm.value.roleId,
          model_name: perm.model_name,
          can_create: perm.can_create,
          can_read: perm.can_read,
          can_update: perm.can_update,
          can_delete: perm.can_delete,
        };
        if (perm.id) {
          await axios.put(
            `http://127.0.0.1:8000/api/role-permissions/${perm.id}/`,
            data,
            { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
          );
        } else {
          const response = await axios.post('http://127.0.0.1:8000/api/role-permissions/', data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
          perm.id = response.data.id; // 更新前端的 id
        }
      }
      ElMessage.success('权限保存成功');
      permissionDialogVisible.value = false;
    } catch (error) {
      ElMessage.error('保存权限失败');
      console.error(error);
    }
  };
  
  const handleSizeChange = (val) => {
    pageSize.value = val;
    fetchRoles();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchRoles();
  };
  
  onMounted(() => {
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