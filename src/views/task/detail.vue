<template> 
  <div class="task-detail"> 
    <el-card shadow="hover">
      <div class="detail-header">
        <h2>实时日志输出</h2>
        <div class="header-buttons">
          <el-button type="success" @click="refreshLogs" icon="el-icon-refresh">刷新日志</el-button>
          <el-button type="info" @click="exportLogs" icon="el-icon-download">导出日志</el-button>
          <el-button type="danger" @click="closeAll" icon="el-icon-close">关闭连接</el-button>
        </div>
      </div>

      <div class="logs-container">
        <div class="log-marquee">
          <div class="marquee-content">
            🔍 提醒：日志只存储于前端缓存，关闭浏览器页面会丢失，建议及时导出保存！
          </div>
        </div>

        <!-- Xray 日志 -->
        <div class="log-section">
          <div class="log-title">🧩 Xray 扫描日志</div>
          <div class="log-box" ref="xrayBox">
            <pre>{{ xrayLogs.join('\n') }}</pre>
          </div>
        </div>

        <!-- Crawlergo 日志 -->
        <div class="log-section">
          <div class="log-title">🕷️ 爬虫 Crawlergo 日志</div>
          <div class="log-box" ref="crawlergoBox">
            <pre>{{ crawlergoLogs.join('\n') }}</pre>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getOne } from '@/api/task'

export default {
  props: ['id'],
  data() {
    return {
      xrayLogs: [],
      crawlergoLogs: [],
      sseXray: null,
      sseCrawlergo: null,
      task: null
    }
  },
  mounted() {
    this.restoreLogsFromCache()
    this.loadTask()
  },
  beforeDestroy() {
    this.saveLogsToCache()
    this.closeAll()
  },
  methods: {
    cacheKey(type) {
      return `task_logs_${this.id}_${type}`
    },

    saveLogsToCache() {
      sessionStorage.setItem(this.cacheKey('xray'), JSON.stringify(this.xrayLogs))
      sessionStorage.setItem(this.cacheKey('crawlergo'), JSON.stringify(this.crawlergoLogs))
    },

    restoreLogsFromCache() {
      const xrayCache = sessionStorage.getItem(this.cacheKey('xray'))
      const crawlerCache = sessionStorage.getItem(this.cacheKey('crawlergo'))
      if (xrayCache) this.xrayLogs = JSON.parse(xrayCache)
      if (crawlerCache) this.crawlergoLogs = JSON.parse(crawlerCache)
    },

    async loadTask() {
      try {
        const res = await getOne(this.id)
        if (res.data) {
          this.task = res.data
          this.initSSE()
        } else {
          this.$message.warning(`未找到该任务（ID: ${this.id}）`)
        }
      } catch (e) {
        console.error('加载任务详情出错:', e)
        this.$message.error('加载任务详情失败')
      }
    },

    initSSE() {
      const xyport = this.task?.xyport || 7777
      const crawlerid = this.task?.crawlerid || this.id
      const xrayTag = encodeURIComponent(`XRAY-OUT[${xyport}]`)
      const crawlergoTag = encodeURIComponent(`CRAWLERGO-ERR[${crawlerid}]`)

      this.sseXray = new EventSource(`http://localhost:8087/sse/logs?tag=${xrayTag}`)
      this.sseCrawlergo = new EventSource(`http://localhost:8087/sse/logs?tag=${crawlergoTag}`)

      this.sseXray.onmessage = e => {
        this.xrayLogs.push(e.data)
        this.saveLogsToCache()
        if (e.data.includes("All pending requests have been scanned")) {
          this.sseXray.close()
          this.$message.success('Xray 扫描完成')
        }
        this.$nextTick(() => this.scrollToBottom('xrayBox'))
      }

      this.sseCrawlergo.onmessage = e => {
        this.crawlergoLogs.push(e.data)
        this.saveLogsToCache()
        if (e.data.includes("Task finished")) {
          this.sseCrawlergo.close()
          this.$message.success('Crawlergo 扫描完成')
        }
        this.$nextTick(() => this.scrollToBottom('crawlergoBox'))
      }

      this.sseXray.onerror = err => console.error('[SSE] Xray error', err)
      this.sseCrawlergo.onerror = err => console.error('[SSE] Crawlergo error', err)
    },

    scrollToBottom(refName) {
      const el = this.$refs[refName]
      if (el) el.scrollTop = el.scrollHeight
    },

    closeAll() {
      if (this.sseXray) this.sseXray.close()
      if (this.sseCrawlergo) this.sseCrawlergo.close()
      this.$message.info('SSE连接已关闭')
    },

    refreshLogs() {
      this.closeAll()
      this.initSSE()
      this.$message.success('日志已刷新')
    },

    exportLogs() {
      const content = [
        '=== XRAY 日志 ===',
        this.xrayLogs.join('\n'),
        '',
        '=== CRAWLERGO 日志 ===',
        this.crawlergoLogs.join('\n')
      ].join('\n')

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scan_logs_${this.id}.txt`
      a.click()
      URL.revokeObjectURL(url)
      this.$message.success('日志已导出')
    }
  }
}
</script>

<style scoped>
.task-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

/* 主容器，上下布局 */
.logs-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 每个日志块 */
.log-section {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 标题 */
.log-title {
  background-color: #1a1a1a;
  color: #00e676;
  padding: 6px 10px;
  font-weight: bold;
  font-size: 15px;
  border-radius: 6px 6px 0 0;
}

/* 日志内容区 */
.log-box {
  background: #000;
  color: #00ff6a;
  font-family: monospace;
  height: 350px;
  overflow-y: auto;
  border-radius: 0 0 8px 8px;
  padding: 12px;
  white-space: pre-wrap;
  line-height: 1.4;
  box-shadow: inset 0 0 6px rgba(0, 255, 106, 0.3);
}

.log-marquee {
  overflow: hidden;
  background: linear-gradient(90deg, #1e1e1e, #2a2a2a);
  color: #00ff88;
  padding: 8px 0;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 0 6px rgba(0, 255, 106, 0.3);
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%;
  animation: marquee 15s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

</style>
