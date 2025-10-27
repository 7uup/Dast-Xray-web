<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">系统登录</h2>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="0px">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width:100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { login } from '@/api/user';
import { setToken } from '@/utils/auth';

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    };
  },
  methods: {
    handleLogin() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return;
        this.loading = true;
        try {
          const res = await login(this.form);
          // request.js 已经返回了 res.data，这里直接取 res.code
          if (res.code === '200') {
            const token = res.data;
            setToken(token);
            console.log('Token before commit:', token)
this.$store.commit('user/SET_TOKEN', token)
console.log('Token in store after commit:', this.$store.state.user.token)
console.log('Token in localStorage:', localStorage.getItem('app_user_token'))

            this.$message.success('登录成功');
            this.$router && this.$router.replace({ path: '/' });
          } else {
            this.$message.error(res.msg || '登录失败');
          }
        } catch (err) {
          this.$message.error('登录请求失败');
        } finally {
          this.loading = false;
        }
      });
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.login-card {
  width: 360px;
  padding: 24px;
}
.title {
  text-align: center;
  margin-bottom: 18px;
}
</style>
