import request from '@/request';


// 分页获取任务
export function getTools() {
  return request.get("api/tools")
}

export function updateTools(data) {
  return request.put("api/tools", data)
}