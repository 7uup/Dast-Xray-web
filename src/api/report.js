import request from '@/request';

const baseURL = 'api/report'

// 分页获取任务
export function getReportList(page, size,source) {
  return request.get(`baseURL/list`)
}

export function viewReport(id) {
  return request.get(`${baseURL}/view`,{params: { id, task_id }})
}