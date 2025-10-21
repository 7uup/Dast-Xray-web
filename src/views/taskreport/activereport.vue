<template>
  <div class="report-view">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>漏洞报告管理</span>
        <div style="float: right;">
          <el-input
            v-model="keyword"
            placeholder="输入任务名搜索"
            size="small"
            clearable
            style="width: 200px; margin-right: 10px;"
          />
          <el-button type="primary" size="small" @click="fetchReports">搜索</el-button>
        </div>
      </div>

      <el-collapse v-model="activeDomain" accordion>
        <el-collapse-item
          v-for="(taskReports, domain) in groupedReports"
          :key="domain"
          :name="domain"
        >
          <template slot="title">
            <i class="el-icon-folder"></i>
            <span style="margin-left: 8px">{{ domain }}</span>
            <span style="color: gray; font-size: 13px; margin-left: 8px">
              （{{ taskReports[0].url }}）
            </span>
          </template>

          <el-table
            :data="taskReports"
            size="small"
            border
            style="width: 100%"
          >
            <el-table-column prop="report_path" label="报告路径"></el-table-column>
            <el-table-column prop="create_time" label="生成时间" width="180"></el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="viewReport(scope.row.id, scope.row.task_id)"
                >
                  查看
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="deleteReport(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <el-pagination
  background
  layout="prev, pager, next"
  :current-page="page"
  :page-size="size"
  @current-change="fetchReports"
/>


<!-- 查看报告弹窗 -->
<el-dialog
  :visible.sync="dialogVisible"
  fullscreen
  custom-class="report-dialog"
  :show-close="false"
>
  <!-- 顶部操作栏 -->
  <div class="report-header">
    <span class="report-title">漏洞报告预览</span>
    <el-button
      type="danger"
      icon="el-icon-close"
      size="mini"
      @click="dialogVisible = false"
    >
      关闭报告
    </el-button>
  </div>

  <!-- 报告内容 -->
  <iframe
    v-if="reportHtml"
    :srcdoc="reportHtml"
    class="report-iframe"
    frameborder="0"
  ></iframe>
</el-dialog>


    </el-card>
  </div>
</template>

<script>
import { getReportList } from '@/api/report';

export default {
  name: "ActiveReport",
  data() {
    return {
      page: 1,
      size: 10,
      source: 1,
      activeDomain: "",
      reports: [],
      groupedReports: {},
      dialogVisible: false,
      reportHtml: "",
      reportCache: {},
      keyword: "",
    };
  },

  created() {
    this.fetchReports();
  },

  methods: {
    /** 获取报告列表 **/
    async fetchReports(page = this.page, size = this.size, source = this.source) {
      try {
        const res = await getReportList(page, size, source);

        this.reports = res.data || [];

        // === 关键改造逻辑 ===
        this.groupedReports = this.reports.reduce((groups, report) => {
          // 如果有 groupId，就按 groupId 分组
          const key = report.groupId ? `任务组-${report.groupId}` : report.name || "单任务";

          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(report);

          return groups;
        }, {});

        this.page = page;
      } catch (e) {
        this.$message.error("加载报告失败：" + e);
      }
    },

    /** 查看报告 **/
    async viewReport(id, task_id) {
      try {
        if (this.reportCache[id]) {
          this.reportHtml = this.reportCache[id];
          this.dialogVisible = true;
          return;
        }

        const res = await viewReport(id);

        this.reportHtml = res.data;
        this.dialogVisible = true;
        this.reportCache[id] = res.data;
      } catch (e) {
        this.$message.error("读取报告失败：" + e);
      }
    },

    /** 删除报告 **/
    async deleteReport(row) {
      this.$confirm(`确定删除报告 "${row.report_path}" 吗？`, "提示", {
        type: "warning",
      })
        .then(async () => {
          try {
            const res = await axios.delete("http://localhost:8087/api/report/delete", {
              params: { path: row.report_path, task_id: row.task_id, id: row.id },
            });
            if (res.data && res.data.success !== false) {
              this.$message.success("删除成功");
              this.reportCache[row.id] = null;
              this.fetchReports();
            } else {
              this.$message.error("删除失败：" + (res.data.message || ""));
            }
          } catch (e) {
            this.$message.error("删除请求失败：" + e);
          }
        })
        .catch(() => {});
    },
  },
};
</script>


<style scoped>
.report-dialog ::v-deep(.el-dialog__body) {
  padding: 0;
  margin: 0;
  height: 100vh;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  color: #fff;
  padding: 10px 20px;
  height: 50px;
  flex-shrink: 0;
}

.report-title {
  font-size: 16px;
  font-weight: bold;
}

.report-iframe {
  flex: 1;
  width: 100%;
  height: calc(100vh - 50px);
  background: #fff;
  border: none;
}


.report-dialog ::v-deep(.el-dialog__body) {
  padding: 0;
  background-color: #000; /* 背景更沉浸式可选 */
}

</style>
