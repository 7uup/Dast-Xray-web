<template>
  <div class="webhook-config">
    <el-card shadow="hover">
      <div class="header">
        <span>Webhook 配置管理</span>
        <el-button type="primary" size="small" @click="openDialog('add')">新增配置</el-button>
      </div>

      <!-- Webhook 表格 -->
      <el-table
        :data="webhooks"
        border
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="160" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="webhookurl" label="Webhook URL" />
        <el-table-column prop="secret" label="签名密钥" />
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color:red" @click="deleteWebhook(scope.row)">删除</el-button>
            <el-button type="text" size="small" style="color:green" @click="webhookTest(scope.row)">测试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入Webhook名称"></el-input>
        </el-form-item>

        <el-form-item label="Webhook URL" prop="webhookurl">
          <el-input v-model="form.webhookurl" placeholder="请输入Webhook地址"></el-input>
        </el-form-item>

        <el-form-item label="签名密钥" prop="secret">
          <el-input v-model="form.secret" placeholder="可选，用于验证签名"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/request";
import { testWebHook,updateWebhook,createWebhook ,deleteWebhook,getWebhookById,getWebhooks} from "@/api/webhook";

export default {
  name: "WebhookConfig",
  data() {
    return {
      loading: false,
      webhooks: [],
      dialogVisible: false,
      dialogTitle: "新增 Webhook",
      form: {
        id: "",
        name: "",
        webhookurl: "",
        secret: "",
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        webhookurl: [{ required: true, message: "请输入Webhook URL", trigger: "blur" }],
      },
    };
  },
  created() {
    this.loadWebhooks();
  },
  methods: {
    /** ✅ 随机生成12位数字ID */
    generateId() {
      return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    },

    /** ✅ 获取所有 WebHook */
    async loadWebhooks() {
      this.loading = true;
      try {
        const res = await getWebhooks();
        if (res) {
          this.webhooks = Array.isArray(res) ? res : [res];
        }
      } catch (e) {
        this.$message.error("加载失败：" + e.message);
      } finally {
        this.loading = false;
      }
    },

    async webhookTest(row) {
      try {
        const res = await testWebHook(row.id);
        if (res) {
          this.$message.success("已发送测试");
        }
      } catch (e) {
        this.$message.error("测试失败" + e.message);
      } finally {
        this.loading = false;
      }
    },

    /** ✅ 打开弹窗 */
    openDialog(type, row) {
      if (type === "add") {
        this.dialogTitle = "新增 Webhook";
        this.form = { id: "", name: "", webhookurl: "", secret: "" };
      } else if (type === "edit") {
        this.dialogTitle = "编辑 Webhook";
        this.form = { ...row };
      }
      this.dialogVisible = true;
    },

    /** ✅ 提交表单 */
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return;

        try {
          if (!this.form.id) {
            // 新增
            this.form.id = this.generateId();
            await createWebhook(this.form)
            this.$message.success("新增成功");
          } else {
            // 更新
            await updateWebhook(this.form)
            this.$message.success("修改成功");
          }
          this.dialogVisible = false;
          this.loadWebhooks();
        } catch (err) {
          this.$message.error("操作失败：" + err.message);
        }
      });
    },

    /** ✅ 删除 WebHook */
    deleteWebhook(row) {
      this.$confirm(`确定删除「${row.name}」吗？`, "提示", {
        type: "warning",
      }).then(async () => {
        try {
          await deleteWebhook(row.id);
          this.$message.success("删除成功");
          this.loadWebhooks();
        } catch (err) {
          this.$message.error("删除失败：" + err.message);
        }
      });
    },
  },
};
</script>

<style scoped>
.webhook-config {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
