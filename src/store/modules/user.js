import { login, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(), // 初始化时尝试获取 token
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response;
        commit('SET_TOKEN', data.data);
        setToken(data.data);
        resolve();
      }).catch(error => {
        reject(error);
      });
    });
},

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // 确保 token 在请求头中
      if (!state.token) {
        return reject('Token is missing')
      }

      getUserInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please login again.')
        }

        const { name, avatar } = data
        commit('SET_NAME', name) // 设置用户姓名
        commit('SET_AVATAR', avatar) // 设置用户头像
        resolve(data)
      }).catch(error => {
        reject(error) // 获取用户信息失败
      })
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve) => {
      removeToken() // 清除 token
      resetRouter() // 重置路由
      commit('RESET_STATE') // 重置状态
      resolve() // 登出完成
    })
  },

  // reset user token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // 清除 token
      commit('RESET_STATE') // 重置状态
      resolve() // 完成
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
