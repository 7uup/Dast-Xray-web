import request from '@/request';

const baseURL = 'api/report'

// 分页获取任务
export function getReportList(page, size,source) {
  return request.get(`${baseURL}/list`,{params: { page, size,source }});
}

export function viewReport(id,task_id) {
  return request.get(`${baseURL}/view`,{params: { id, task_id }})
}


export function deleteReport(path,task_id,id) {
  return request.delete(`${baseURL}/delete`,{params: { path, task_id, id }})
}



