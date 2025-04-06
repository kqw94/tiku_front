<template>
    <div class="register-container">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <h2>注册</h2>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input v-model="form.confirm_password" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">注册</el-button>
          <el-button @click="$router.push('/login')">去登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
import { ref, getCurrentInstance } from 'vue'; // 引入 getCurrentInstance
import { useRouter } from 'vue-router';

export default {
  name: 'UserRegister',
  setup() {
    const router = useRouter();
    const formRef = ref(null);
    const instance = getCurrentInstance(); // 获取组件实例
    const form = ref({
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
    });

    const rules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 8, message: '密码长度至少8位', trigger: 'blur' },
      ],
      confirm_password: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== form.value.password) {
              callback(new Error('两次输入密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^[0-9]{11}$/, message: '请输入11位手机号', trigger: 'blur' },
      ],
    };

    const submitForm = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const response = await instance.appContext.config.globalProperties.$axios.post('/register/', form.value);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            instance.appContext.config.globalProperties.$message.success('注册成功');
            router.push('/');
          } catch (error) {
            instance.appContext.config.globalProperties.$message.error(error.response?.data?.detail || '注册失败');
          }
        }
      });
    };

    return { form, rules, formRef, submitForm };
  },
};
</script>

<style scoped>
.register-container {
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