import request from '@/request';

const baseURL = 'api/tools'

// 分页获取任务
export function getTools() {
  return request.get(`${baseURL}`)
}

export function updateTools(data) {
  return request.put(`${baseURL}`, data)
}

export function reloadTools() {
  return request.post(`${baseURL}/reload`)
}