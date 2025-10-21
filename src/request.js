// src/request.js
import axios from 'axios';

const service = axios.create({
  baseURL: 'http://localhost:8087/', // 全局 baseURL
  timeout: 5000,
});

service.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

service.interceptors.response.use(
  response => response.data, // 直接返回 data
  error => Promise.reject(error)
);

export default service;
