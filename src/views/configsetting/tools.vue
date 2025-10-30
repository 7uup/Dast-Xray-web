<template>
  <div class="tools-setting-view">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>工具路径配置管理</span>
        <span class="warning">(需要先保存在加载load进内存)</span>
        <div style="float:right">
          <el-button type="primary" size="small" @click="fetchTools">刷新</el-button>
          <el-button type="success" size="small" @click="onSave" :loading="saving">保存</el-button>
        </div>
      </div>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="130px"
        class="tools-form"
      >
        <el-form-item label="Xray 可执行文件" prop="xrayPath">
          <el-input v-model.trim="form.xrayPath" placeholder="例如：/opt/xray/xray 或 C:\xray\xray.exe" />
        </el-form-item>

        <el-form-item label="Crawlergo 可执行文件" prop="crawlergoPath">
          <el-input v-model.trim="form.crawlergoPath" placeholder="例如：/opt/crawlergo/crawlergo" />
        </el-form-item>

        <el-form-item label="Chrome 可执行路径" prop="chromePath">
          <el-input v-model.trim="form.chromePath" placeholder="例如：/usr/bin/google-chrome 或 C:\Program Files\Chrome\chrome.exe" />
        </el-form-item>

        <el-form-item label="rad 可执行路径" prop="radPath">
          <el-input v-model.trim="form.radPath" placeholder="例如：/usr/bin/rad" />
        </el-form-item>


        <el-form-item>
          <el-button type="onload" @click="onReload">加载配置</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="info" @click="onReset">重置</el-button>
        </el-form-item>

      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';
import { getTools, updateTools,reloadTools } from '@/api/tools';

export default {
  name: 'ToolsSetting',
  data() {
    return {
      form: {
        xrayPath: '',
        crawlergoPath: '',
        chromePath: '',
        radPath: '',
        extra: ''
      },
      original: null,
      saving: false,
      testing: false,
      rules: {
        xrayPath: [
          { required: true, message: '请填写 Xray 可执行路径', trigger: 'blur' }
        ],
        crawlergoPath: [
          { required: true, message: '请填写 Crawlergo 可执行路径', trigger: 'blur' }
        ],
        chromePath: [
          { required: true, message: '请填写 Chrome 可执行路径', trigger: 'blur' }
        ],
        radPath: [
          { required: true, message: '请填写 rad 可执行路径', trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.fetchTools();
  },
  methods: {
    // 获取当前配置
    async fetchTools() {
      try {
        const data = await getTools(); // 后端：GET /api/tools 返回 JSON
        // 保持 extra 为格式化 JSON 字符串（便于编辑）
        const extraStr = data.extra ? JSON.stringify(data.extra, null, 2) : (data.extra || '');
        this.form = {
          xrayPath: data.xrayPath || '',
          crawlergoPath: data.crawlergoPath || '',
          chromePath: data.chromePath || '',
          radPath: data.radPath || '',
          extra: typeof data.extra === 'string' ? data.extra : extraStr
        };
        // 存储原始，用于重置
        this.original = JSON.parse(JSON.stringify(this.form));
        this.$message.success('加载配置成功');
      } catch (err) {
        console.error(err);
        this.$message.error('加载配置失败：' + (err.message || err));
      }
    },

    // 保存到后端
    onSave() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        // 尝试解析 extra 字段（如果为空则置为 null）
        let extraPayload = null;
        if (this.form.extra && this.form.extra.trim()) {
          try {
            extraPayload = JSON.parse(this.form.extra);
          } catch (e) {
            this.$message.error('Extra 字段不是合法 JSON：' + e.message);
            return;
          }
        }

        const payload = {
          xrayPath: this.form.xrayPath.trim(),
          crawlergoPath: this.form.crawlergoPath.trim(),
          chromePath: this.form.chromePath.trim(),
          radPath: this.form.radPath.trim(),
        };

        this.saving = true;
        try {
          // 后端：PUT /api/tools 接收 JSON 并保存（你需要后端实现此接口）
          await updateTools(payload);
          this.original = JSON.parse(JSON.stringify(this.form));
          this.$message.success('保存成功');
        } catch (err) {
          console.error(err);
          this.$message.error('保存失败：' + (err.response?.data || err.message || err));
        } finally {
          this.saving = false;
        }
      });
    },

    // 重置为后端最新内容
    onReset() {
      if (this.original) {
        this.form = JSON.parse(JSON.stringify(this.original));
        this.$message.info('已重置为上次加载的值');
      } else {
        this.fetchTools();
      }
    },

  async onReload() {
      try {
        await reloadTools();
        this.$message.success('配置已重新加载');
      } catch (err) {
        console.error(err);
        this.$message.error('重新加载配置失败：' + (err.response?.data || err.message || err));
      }
    },


  }
};
</script>

<style scoped>
.tools-setting-view {
  padding: 20px;
}
.tools-form {
  max-width: 900px;
}
.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.warning {
  color: #e74c3c;
}
</style>
