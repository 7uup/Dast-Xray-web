<template>
  <div class="config-view">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>🛠 工具配置文件管理</span>
      </div>

      <div class="config-header">
        <el-select
          v-model="selectedFile"
          placeholder="请选择配置文件"
          style="width: 300px"
          @change="loadConfig"
        >
          <el-option
            v-for="file in configFiles"
            :key="file"
            :label="file"
            :value="file"
          />
        </el-select>

        <div style="margin-left: 20px;">
          <el-button type="primary" @click="saveConfig" :disabled="!selectedFile">
            💾 保存
          </el-button>
          <el-button type="success" @click="downloadConfig" :disabled="!selectedFile">
            📥 下载
          </el-button>
          <el-button type="info" @click="toggleFullscreen">
            {{ isFullscreen ? "🧭 退出全屏" : "⛶ 全屏编辑" }}
          </el-button>
        </div>
      </div>

      <div :class="['editor-container', { fullscreen: isFullscreen }]">
        <!-- ✅ 浮动关闭按钮 -->
        <el-button
          v-if="isFullscreen"
          class="exit-fullscreen-btn"
          type="danger"
          icon="el-icon-close"
          circle
          size="small"
          @click="toggleFullscreen"
        ></el-button>

        <codemirror
          ref="cm"
          v-model="configContent"
          :options="cmOptions"
          class="code-editor"
        ></codemirror>
      </div>
    </el-card>
  </div>
</template>

<script>
import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/yaml/yaml.js";
import "codemirror/theme/material.css";
import axios from "axios";
import yaml from "js-yaml";
import { downloadConfig, loadConfigFiles ,loadConfigView, saveConfig} from '@/api/configsetting';


export default {
  name: "ToolConfig",
  components: { codemirror },
  data() {
    return {
      configFiles: [],
      selectedFile: "",
      configContent: "",
      isFullscreen: false,
      cmOptions: {
        mode: "yaml",
        theme: "material",
        lineNumbers: true,
        tabSize: 2,
        lineWrapping: true,
        styleActiveLine: true,
        indentWithTabs: false,
      },
    };
  },
  mounted() {
  this.$nextTick(() => {
    if (this.$refs.cm && this.$refs.cm.codemirror) {
      const cm = this.$refs.cm.codemirror;
      cm.refresh();

      // 同时强制匹配容器高度
      const container = document.querySelector('.editor-container');
      if (container) {
        cm.setSize("100%", container.clientHeight + "px");
      }
    }
  });
},
  created() {
    this.fetchConfigFiles();
  },
  methods: {
    async fetchConfigFiles() {
      try {
        const res = await loadConfigFiles();
        console.log("配置文件列表：", res);
        this.configFiles = res;
      } catch (e) {
        this.$message.error("获取配置文件列表失败：" + e);
      }
    },
    async loadConfig() {
      if (!this.selectedFile) return;
      try {
        const res = await loadConfigView({ filename: this.selectedFile })
        this.configContent = res;
        this.$nextTick(() => {
  if (this.$refs.cm && this.$refs.cm.codemirror) {
    this.$refs.cm.codemirror.refresh();
  }
});

      } catch (e) {
        this.$message.error("加载配置文件失败：" + e);
      }
    },
    async saveConfig() {
      try {
        yaml.load(this.configContent);
      } catch (err) {
        this.$message.error("YAML 语法错误：" + err.message);
        return;
      }

      try {
        await saveConfig({
          filename: this.selectedFile,
          content: this.configContent,
        });
        this.$message.success("保存成功！");
      } catch (e) {
        this.$message.error("保存失败：" + e);
      }
    },
    async downloadConfig() {
      try {
        const res = await downloadConfig({ filename: this.selectedFile },"blob");
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", this.selectedFile);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (e) {
        this.$message.error("下载失败：" + e);
      }
    },
toggleFullscreen() {
  this.isFullscreen = !this.isFullscreen;
  this.$nextTick(() => {
    // 通知浏览器窗口变化
    window.dispatchEvent(new Event("resize"));

    // 强制刷新 codemirror 尺寸
    if (this.$refs.cm && this.$refs.cm.codemirror) {
      const cm = this.$refs.cm.codemirror;
      cm.refresh();

      // 让 CodeMirror 高度自适应父容器
      const container = document.querySelector('.editor-container');
      if (container) {
        cm.setSize("100%", container.clientHeight + "px");
      }
    }
  });
}
,
  },
};
</script>

<style scoped>
.config-view {
  padding: 20px;
}

.config-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

/* 默认编辑器高度更大 */
.editor-container {
  position: relative;
  height: 75vh;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

/* ✅ 全屏模式样式 */
.editor-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  background: #1e1e1e;
  height: 100vh;
  padding: 10px;
}

/* ✅ 浮动的关闭按钮样式 */
.exit-fullscreen-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 3100;
  background-color: #f56c6c;
  color: white;
  border: none;
}

/* codemirror 填满容器 */
.code-editor {
  width: 100%;
  height: 100%;
  font-size: 14px;
}

.editor-container.fullscreen .CodeMirror {
  height: 100% !important;
}

.editor-container.fullscreen .CodeMirror-scroll {
  height: 100% !important;
}
</style>
