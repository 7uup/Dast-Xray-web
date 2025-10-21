<template>
  <div class="scanner-container">
    <!-- 顶部标题区 -->
    <el-card shadow="hover" class="header-card">
      <div class="header">
        <div class="title-area">
          <i class="el-icon-aim title-icon"></i>
          <h2>openapi扫描任务管理</h2>
        </div>
        <div class="header-buttons">
          <el-button
            type="success"
            :loading="refreshing"
            icon="el-icon-refresh"
            @click="refreshTaskList"
          >
            {{ refreshing ? '刷新中...' : '刷新任务' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 任务列表卡片 -->
    <el-card class="table-card" shadow="never">
      <el-divider content-position="left">
        <i class="el-icon-tickets"></i> 任务列表
      </el-divider>

      <template v-if="taskList.length">
        <el-table
          :data="taskList"
          border
          stripe
          highlight-current-row
          class="task-table"
        >
          <el-table-column align="center" label="ID" width="70">
            <template slot-scope="scope">{{ scope.$index + 1 }}</template>
          </el-table-column>

          <el-table-column prop="name" label="任务名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="url" label="扫描URL" show-overflow-tooltip />
          <el-table-column label="创建者" width="120" align="center">
            <template>管理员</template>
          </el-table-column>

          <el-table-column label="状态" width="120" align="center">
            <template slot-scope="scope">
              <el-tag
                size="small"
                :type="scope.row.status === 1 ? 'warning' : scope.row.status === 2 ? 'success' : 'info'"
              >
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
  prop="create_time"
  label="创建时间"
  width="180"
  align="center"
>
  <template slot-scope="scope">
    {{ formatDate(scope.row.createtime) }}
  </template>
</el-table-column>


          <el-table-column label="操作" width="160" align="center">
            <template slot-scope="{ row }">
              <el-dropdown trigger="click" placement="bottom">
                <el-button type="primary" size="mini" plain>
                  操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-video-pause" @click.native="stopTaskById(row)">
                    停止
                  </el-dropdown-item>
                  <el-dropdown-item icon="el-icon-view" @click.native="goToDetail(row)">
                    查看详情
                  </el-dropdown-item>
                  <el-dropdown-item divided icon="el-icon-delete" @click.native="deleteTaskById(row.id)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            background
            layout="total, prev, pager, next, sizes"
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </template>

      <template v-else>
        <el-empty description="暂无扫描任务" :image-size="120" />
      </template>
    </el-card>

   
  </div>
</template>

<script>
import { getTaskList, addTask, deleteTask, updateTaskStatus, startTask, stopTask, updateTask } from '@/api/task'

export default {
  name: 'VulnerabilityScanner',
  data() {
    return {
      taskList: [],
      total: 0,
      currentPage: 1,
      pageSize: 50,
      source:2,
      refreshing: false, // ✅ 刷新状态
      showAddTaskDialog: false,
      showEditTaskDialog: false, // 新增：控制修改弹窗显示
      taskName: '',
      scanUrl: '',
      dialogOutputName: '',
      dialogSelectedFormat: 'html',
      editTask: { // 新增：用于编辑的任务对象
        id: '',
        name: '',
        url: '',
        output: '',
        format: 'html'
      }
    }
  },

  mounted() {
    this.loadTaskList()
  },

  methods: {

    formatDate(datetime) {
  if (!datetime) return '-'
  const date = new Date(datetime)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
},

    /** ✅ 状态标签转换 */
    getStatusLabel(status) {
      switch (status) {
        case 0:
          return '待扫描'
        case 1:
          return '扫描中'
        case 2:
          return '已完成'
        case 3:
          return '已停止'
        default:
          return '未知状态'
      }
    },
    goToDetail(row) {
  this.$router.push(`/task/detail/${row.id}`)
}

    ,

    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadTaskList()
    },

    /** ✅ 加载任务列表 */
    async loadTaskList() {
      this.refreshing = true
      try {
        const res = await getTaskList(this.currentPage, this.pageSize,this.source)
        console.log('后端返回:', res)

        // axios 通常返回 res.data
        const data = res.data || res
        this.taskList = data.list || []
        this.total = data.total || 0
      } catch (err) {
        console.error(err)
        this.$message.error('加载任务列表失败')
      } finally {
        this.refreshing = false
      }
    },

    /** ✅ 刷新任务按钮 */
    refreshTaskList() {
      this.loadTaskList()
      this.$message.success('刷新成功')
    },

    /** ✅ 分页切换 */
    handlePageChange(page) {
      this.currentPage = page
      this.loadTaskList()
    },

    async stopTaskById(row) {
      try {
        const res = await stopTask(row.id)
        if(res.data === 13000){
          this.$message.success('任务已停止')
          this.loadTaskList()
        }else{
          this.$message.error('停止失败')
        }
      } catch {
        this.$message.error('停止失败')
      }
    },

    /** ✅ 删除任务 */
    async deleteTaskById(id) {
      try {
        const res = await deleteTask(id)
        if(res.data === 1){
          this.$message.success('任务已删除')
          this.loadTaskList()
        }else{
          this.$message.error('删除失败')
        }
      } catch {
        this.$message.error('删除失败')
      }
    },


  }
}
</script>


<style scoped>
.scanner-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
  border-radius: 10px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
  color: #409EFF;
}

.table-card {
  border-radius: 10px;
}

.task-table {
  border-radius: 6px;
}

.status-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.progress-bar {
  width: 160px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<!-- <style scoped>
.scanner-container {
  padding: 20px;
  background: #f6f8fb;
  min-height: 100vh;
}

.header-card {
  margin-bottom: 20px;
  border-radius: 10px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
  color: #409EFF;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.table-card {
  border-radius: 10px;
}

.task-table {
  border-radius: 6px;
  font-size: 14px;
}

.task-table .el-table__row:hover {
  background-color: #f9fafc !important;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-dialog__body {
  padding-top: 10px;
}
</style> -->
