<template>
    <div class="login-container">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <h2>登录</h2>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">登录</el-button>
          <el-button @click="$router.push('/register')">去注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
import { ref, getCurrentInstance } from 'vue'; // 引入 getCurrentInstance
import { useRouter } from 'vue-router';

export default {
  name: 'UserLogin',
  setup() {
    const router = useRouter();
    const formRef = ref(null);
    const instance = getCurrentInstance(); // 获取组件实例
    const form = ref({
      username: '',
      password: '',
    });

    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    };

    const submitForm = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const response = await instance.appContext.config.globalProperties.$axios.post('/login/', form.value);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            instance.appContext.config.globalProperties.$message.success('登录成功');
            router.push('/home');
          } catch (error) {
            instance.appContext.config.globalProperties.$message.error(error.response?.data?.detail || '登录失败');
          }
        }
      });
    };

    return { form, rules, formRef, submitForm };
  },
};
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>