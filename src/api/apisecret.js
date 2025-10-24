import request from '@/request';

const API_URL = '/api/apisecrets';

export const getSecrets = () => {
  return request.get(`${API_URL}`);
};

export const generateSecret = (name) => {
  return request.get(`${API_URL}/generate`, {
    params: { name } // 使用 params 来传递查询参数
  });
};

export const resetSecret = (id) => {
  return request.get(`${API_URL}/reset`, {
    params: { id } // 使用 params 来传递查询参数
  });
};

export const toggleSecretStatus = (id,status) => {
  return request.get(`${API_URL}/changeStatus`, {
    params: { id,status } // 使用 params 来传递查询参数
  });
};
export const deleteSecret = (id) => {
  return request.get(`${API_URL}/delete`, {
    params: { id } // 使用 params 来传递查询参数
  });
}