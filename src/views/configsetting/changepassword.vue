<template>
  <div class="change-password-page">
    <el-card class="box-card">
      <h2>Change Password</h2>
      <el-form :model="passwordForm" ref="passwordForm" label-width="120px">
        <el-form-item label="Old Password" prop="oldPassword" :rules="[{ required: true, message: 'Please enter old password', trigger: 'blur' }]">
          <el-input type="password" v-model="passwordForm.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="New Password" prop="newPassword" :rules="[{ required: true, message: 'Please enter new password', trigger: 'blur' }]">
          <el-input type="password" v-model="passwordForm.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="Confirm Password" prop="confirmPassword" :rules="[{ required: true, message: 'Please confirm password', trigger: 'blur' }]">
          <el-input type="password" v-model="passwordForm.confirmPassword"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitChangePassword">Submit</el-button>
          <el-button @click="resetForm">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { changePassword } from '@/api/user' // 调用你的修改密码 API

export default {
  name: 'ChangePassword',
  data() {
    return {
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    async submitChangePassword() {
      const { oldPassword, newPassword, confirmPassword } = this.passwordForm

      if (!oldPassword || !newPassword || !confirmPassword) {
        this.$message.error('Please fill in all fields')
        return
      }

      if (newPassword !== confirmPassword) {
        this.$message.error('New password and confirm password do not match')
        return
      }

      try {
        const res = await changePassword(this.passwordForm)
        if (res === 1){
            this.$message.success('Password changed successfully')
        }else{
            this.$message.error('Failed to change password')
        }
        
      } catch (err) {
        this.$message.error(err.message || 'Failed to change password')
      }
    },
    resetForm() {
      this.$refs.passwordForm.resetFields();
    }
  }
}
</script>

<style scoped>
.change-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
}

.box-card {
  width: 400px;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
