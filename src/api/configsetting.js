import request from '@/request';

const baseURL = 'api/config'
// 分页获取任务
export function loadConfigFiles() {
  return request.get(`${baseURL}/xray/list`);
}

// 获取某个配置文件内容
export function loadConfigView(params) {
  return request.get(`${baseURL}/xray/view`, { params });
}

// 保存配置
export function saveConfig(data) {
  return request.put(`${baseURL}/save`, data);
}

// 下载配置
export function downloadConfig(params, responseType = 'blob') {
  return request.get(`${baseURL}/download`, { params, responseType });
}
