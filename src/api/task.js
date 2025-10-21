import request from '@/request';

const baseURL = 'api/tasks'

// 分页获取任务
export function getTaskList(page, size,source) {
  return request.get("api/tasks", { params: { page, size,source } })
}

export function getOne(id) {
  return request.get("api/tasks/get", { params: { taskId: id } })
}


// 添加任务
export function addTask(data) {
  return request.post("api/tasks", data)
}

// // 删除任务
// export function deleteTask(id) {
//   return axios.delete(`${baseURL}/${id}`)
// }

export function addBatchTask(data) {
  return request.post("api/tasks/batch", data)
}

export function deleteTask(id) {
  // 判断是不是纯数字ID
  const isNumeric = /^[0-9]+$/.test(id)
  const endpoint = isNumeric ? `${baseURL}/${id}` : `${baseURL}/group/${id}`
  return request.delete(endpoint)
}

// 更新任务状态
export function updateTaskStatus(id, status) {
  return request.put(`${baseURL}/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// 启动任务
export function startTask(id,source) {
  return request.get(`${baseURL}/${id}/startTask?source=${source}`)
}

export function startGroupTask(id,source) {
  return request.get(`${baseURL}/${id}/startTaskBygroup?source=${source}`)
}


// 停止任务
export function stopTask(id) {
  const isNumeric = /^[0-9]+$/.test(id)
  const endpoint = isNumeric ? `${baseURL}/${id}/stopTask` : `${baseURL}/group/${id}/stopTaskByGroup`
  return request.get(endpoint)
}


export function updateTask(data) {
  return request.post(`${baseURL}/task/edit`, data)
}


