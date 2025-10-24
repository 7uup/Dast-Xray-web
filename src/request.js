// // src/request.js
// import axios from 'axios';

// const service = axios.create({
//   baseURL: 'http://localhost:8087/', // 全局 baseURL
//   timeout: 5000,
// });

// service.interceptors.request.use(
//   config => {
//     return config;
//   },
//   error => Promise.reject(error)
// );

// service.interceptors.response.use(
//   response => response.data, // 直接返回 data
//   error => Promise.reject(error)
// );

// export default service;


// src/request.js
import axios from 'axios';


//process.env.VUE_APP_BASE_API
const service = axios.create({
  baseURL: 'http://127.0.0.1:8087/', // 全局 baseURL
  timeout: 5000,
});

service.interceptors.request.use(
  config => {
    // 从 localStorage 中获取 token
    const token = localStorage.getItem('app_user_token');
    if (token) {
      // 在请求头中加入 Token
      config.headers['Token'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

service.interceptors.response.use(
  response => response.data, // 保留原逻辑：直接返回 data
  error => Promise.reject(error)
);

export default service;
