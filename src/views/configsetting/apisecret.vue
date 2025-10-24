<template>
  <div>
    <!-- 生成 Secret 按钮 -->
    <el-button type="primary" @click="openGenerateDialog">生成 OpenAPI Secret</el-button>

    <!-- Secret 列表 -->
    <el-table :data="secrets" style="width: 100%" stripe>
<el-table-column prop="name" label="名称" width="200">
  <template slot-scope="scope">
    {{ scope.row.name || '未命名' }}
  </template>
</el-table-column>


  <el-table-column prop="apiSecret" label="Secret" width="300"></el-table-column>

  <el-table-column label="状态" width="120">
  <template slot-scope="scope">
    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
      {{ scope.row.status === 1 ? '开启' : '关闭' }}
    </el-tag>
  </template>
</el-table-column>


  <el-table-column label="操作" width="240">
    <template slot-scope="scope">
      <el-button @click="resetSecret(scope.row.id)" size="small" type="warning">重置</el-button>
      <el-button
        v-if="scope.row.status === 1"
        @click="toggleSecretStatus(scope.row.id,0)"
        size="small"
        type="danger"
      >
        关闭
      </el-button>
      <el-button
        v-else
        @click="toggleSecretStatus(scope.row.id,1)"
        size="small"
        type="success"
      >
        开启
        
      </el-button>

      <el-button @click="deleteSecret(scope.row.id)" size="small" type="warning">删除</el-button>
      
    </template>
  </el-table-column>
</el-table>


    <!-- 生成 Secret 的弹窗 -->
    <el-dialog title="生成 OpenAPI Secret" :visible.sync="dialogVisible" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="请输入 Secret 名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitGenerate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { generateSecret, getSecrets, resetSecret, toggleSecretStatus,deleteSecret } from '@/api/apisecret';

export default {
  data() {
    return {
      secrets: [],
      dialogVisible: false,
      form: {
        name: ''
      }
    };
  },
  created() {
    this.fetchSecrets();
  },
  methods: {
async fetchSecrets() {
  try {
    const response = await getSecrets();
    // response.data 本身就是数组
    if (Array.isArray(response)) {
      this.secrets = response;
    } else {
      this.secrets = [];
      this.$message.error('获取 Secret 列表失败');
    }
  } catch (error) {
    this.secrets = [];
    this.$message.error('获取 Secret 异常');
  }
}


,
    openGenerateDialog() {
      this.form.name = '';
      this.dialogVisible = true;
    },
    async submitGenerate() {
  if (!this.form.name.trim()) {
    this.$message.warning('请输入 Secret 名称');
    return;
  }
  try {
    const response = await generateSecret(this.form.name);
    if (response.code === '200') {
      const newSecret = response.data;
      this.$message.success(`生成成功: ${newSecret.apiSecret}`);
      this.dialogVisible = false;
      this.fetchSecrets();
    } else {
      this.$message.error('生成 Secret 失败');
    }
  } catch (error) {
    this.$message.error('生成 Secret 异常');
  }
}
,
    async resetSecret(id) {
  try {
    const response = await resetSecret(id);
    if (response.code === '200') {
      this.$message.success('Secret 重置成功');
      this.fetchSecrets();
    } else {
      this.$message.error('重置 Secret 失败');
    }
  } catch (error) {
    this.$message.error('重置 Secret 异常');
  }
}
,
    async toggleSecretStatus(id,status) {
  try {
    const response = await toggleSecretStatus(id,status);
    if (response.code === '200') {
      this.$message.success('状态修改成功');
      this.fetchSecrets();
    } else {
      this.$message.error('状态修改失败');
    }
  } catch (error) {
    this.$message.error('状态修改异常');
  }
},

async deleteSecret(id) {
      try {
        const response = await deleteSecret(id);
        if (response.code === '200') {
          this.$message.success('Secret 删除成功');
          this.fetchSecrets();
        } else {
          this.$message.error('删除 Secret 失败');
        }
      } catch (error) {
        this.$message.error('删除 Secret 异常');
      }


  }
}
}
</script>

<style scoped>
.el-button {
  margin-right: 10px;
}
</style>
