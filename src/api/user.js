import request from '@/request';

const API_URL = '/api/user';

export const login = (data) => {
  return request.post(`${API_URL}/login`, data);
};

export const getuserinfo = (token) => {
  return request.get(`${API_URL}/getUserInfo`, {
    params: { token } // 使用 params 来传递查询参数
  });
};

export const logout = () => {
  return request.post(`${API_URL}/logout`);
};

export const changePassword = (data) => {
  return request.post(`${API_URL}/updatePw`, data);
}

