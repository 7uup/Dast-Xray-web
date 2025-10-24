import request from '@/request'

const baseURL = '/api/webhook'

// 获取 Webhook 列表
export function getWebhooks() {
  return request.get(`${baseURL}`)
}

// 根据 ID 查询单个 Webhook
export function getWebhookById(id) {
  return request.get(`${baseURL}/selectById`, {
    params: { id }
  })
}


// 根据 ID 查询单个 Webhook
export function testWebHook(id) {
  return request.get(`${baseURL}/test`, {
    params: { id }
  })
}

// 新增 Webhook
export function createWebhook(data) {
  // data 为 { id, name, url, secret, method } 等
  return request.post(`${baseURL}/insert`, data)
}

// 更新 Webhook
export function updateWebhook(data) {
  // data 为 { id, name, url, secret, method } 等
  return request.post(`${baseURL}/update`, data)
}

// 删除 Webhook
export function deleteWebhook(id) {
  return request.post(`${baseURL}/delete`, null, {
    params: { id }
  })
}
