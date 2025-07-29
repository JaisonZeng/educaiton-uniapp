const state = {
  userInfo: {
    id: "",
    name: "",
    username: "",
    avatar: "",
    userType: 1, // 1:学生, 2:老师, 3:管理员
  },
  isLogin: false,
  token: "",
};

const getters = {
  userInfo: (state) => state.userInfo,
  isLoggedIn: (state) => state.isLogin,
  userToken: (state) => state.token,
};

const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = {
      ...state.userInfo,
      ...userInfo,
    };
  },
  SET_LOGIN_STATUS(state, status) {
    state.isLogin = status;
  },
  SET_TOKEN(state, token) {
    state.token = token;
  },
  CLEAR_USER_DATA(state) {
    state.userInfo = {
      id: "",
      name: "",
      username: "",
      avatar: "",
      userType: 1, // 1:学生, 2:老师, 3:管理员
    };
    state.isLogin = false;
    state.token = "";
  },
};

const actions = {
  // 登录
  async login({ commit }, loginData) {
    try {
      // 调用真实的登录API
      const response = await api.login(loginData);
      
      if (response.code === 200) {
        // 映射新的接口数据格式到userInfo结构
        const userInfo = {
          id: response.data.userId,
          name: response.data.nickname,
          username: response.data.username,
          token: response.data.token,
          tokenType: response.data.tokenType,
          expiresIn: response.data.expiresIn,
          userType: loginData.userType // 保存用户类型
        };

        // 保存用户信息
        commit("SET_USER_INFO", userInfo);
        commit("SET_TOKEN", response.data.token);
        commit("SET_LOGIN_STATUS", true);

        // 保存到本地存储
        uni.setStorageSync("token", response.data.token);
        uni.setStorageSync("userInfo", userInfo);

        return {
          success: true,
          data: {
            token: response.data.token,
            userInfo: userInfo
          }
        };
      } else {
        return {
          success: false,
          message: response.message || "登录失败",
        };
      }
    } catch (error) {
      console.error("登录错误:", error);
      return {
        success: false,
        message: "网络错误",
      };
    }
  },

  // 退出登录
  logout({ commit }) {
    commit("CLEAR_USER_DATA");
    uni.removeStorageSync("token");
    uni.removeStorageSync("userInfo");
  },

  // 检查登录状态
  checkLogin({ commit }) {
    try {
      const token = uni.getStorageSync("token");
      const userInfo = uni.getStorageSync("userInfo");

      if (token && userInfo) {
        commit("SET_TOKEN", token);
        commit("SET_USER_INFO", userInfo);
        commit("SET_LOGIN_STATUS", true);
        return true;
      } else {
        commit("SET_LOGIN_STATUS", false);
        return false;
      }
    } catch (error) {
      console.error("检查登录状态错误:", error);
      commit("SET_LOGIN_STATUS", false);
      return false;
    }
  },
};

// 导入API
import { api } from "@/utils/request";

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};