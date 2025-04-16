<template>
    <div>
      <el-card>
        <!-- 筛选表单 -->
        <el-form :model="queryParams" inline class="filter-form">
          <el-form-item label="ID">
            <el-input-number v-model="queryParams.id" :min="1" :controls="false" clearable />
          </el-form-item>
          <el-form-item label="操作类型" class="wide-select">
            <el-select v-model="queryParams.action_type" placeholder="请选择" clearable>
              <el-option
                v-for="type in actionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="模型名称">
            <el-input v-model="queryParams.model_name" clearable />
          </el-form-item>
          <el-form-item label="对象ID">
            <el-input v-model="queryParams.object_id" clearable />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="queryParams.username" clearable />
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input v-model="queryParams.ip_address" clearable />
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
  
        <!-- 日志表格 -->
        <el-table :data="logs" style="width: 100%; margin-top: 20px;" border>
          <el-table-column prop="id" label="ID" width="100" />
          <el-table-column prop="action_type" label="操作类型" width="120">
            <template #default="scope">
              {{ actionTypeLabel(scope.row.action_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="model_name" label="模型名称" width="150">
            <template #default="scope">
              {{ scope.row.model_name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="object_id" label="对象ID" width="120">
            <template #default="scope">
              {{ scope.row.object_id || '-' }}
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
          <el-table-column prop="ip_address" label="IP地址" width="150">
            <template #default="scope">
              {{ scope.row.ip_address || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="user" label="用户名" width="100">
            <template #default="scope">
              {{ scope.row.user || '匿名' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="text" @click="deleteLog(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 分页 -->
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
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import axios from 'axios';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  // 日志列表和分页
  const logs = ref([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  
  // 筛选参数
  const queryParams = ref({
    id: null,
    action_type: '',
    model_name: '',
    object_id: '',
    username: '',  // 替换 user_id
    ip_address: '',
    timestamp_gte: '',
    timestamp_lte: '',
  });
  const timeRange = ref([]);
  
  // 操作类型映射
  const actionTypes = [
    { value: 'create', label: '创建' },
    { value: 'read', label: '读取' },
    { value: 'update', label: '更新' },
    { value: 'delete', label: '删除' },
    { value: 'import', label: '导入'},
    { value: 'export', label: '导出'},
    { value: 'login', label: '登录' },
    { value: 'logout', label: '登出' },
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
  
  // 获取日志列表
  const fetchLogs = async () => {
    try {
      const params = {
        page: currentPage.value,
        page_size: pageSize.value,
        ...queryParams.value,
        timestamp_gte: timeRange.value?.[0] || '',
        timestamp_lte: timeRange.value?.[1] || '',
      };
      // 移除空值
      Object.keys(params).forEach((key) => {
        if (!params[key] && params[key] !== 0) delete params[key];
      });
  
      const response = await axios.get('/user-action-logs/', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      logs.value = response.data.results || [];
      total.value = response.data.count || 0;
    } catch (error) {
      ElMessage.error('获取日志列表失败');
      console.error(error);
      logs.value = [];
      total.value = 0;
    }
  };
  
  // 删除日志
  const deleteLog = (row) => {
    ElMessageBox.confirm(`确定删除日志 ID ${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        try {
          await axios.delete(`/user-action-logs/${row.id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          });
          ElMessage.success('日志删除成功');
          fetchLogs();
        } catch (error) {
          const message = error.response?.data?.detail || '删除日志失败';
          ElMessage.error(message);
          console.error(error);
        }
      })
      .catch(() => {
        // 用户取消
      });
  };
  
  // 重置筛选
  const resetFilters = () => {
    queryParams.value = {
      id: null,
      action_type: '',
      model_name: '',
      object_id: '',
      username: '',  // 替换 user_id
      ip_address: '',
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
  
  // 监听时间范围变化
  watch(timeRange, () => {
    queryParams.value.timestamp_gte = timeRange.value?.[0] || '';
    queryParams.value.timestamp_lte = timeRange.value?.[1] || '';
  });
  
  // 初始化
  onMounted(() => {
    fetchLogs();
  });
  </script>
  
  <style scoped>
  .filter-form {
    margin-bottom: 20px;
  }
  
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

    .wide-select :deep(.el-select) {
    width: 150px; /* 加宽到 200px，可根据需要调整 */
    }   
  </style>