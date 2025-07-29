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

// 处理头像URL，确保使用完整的API路径
const processAvatarUrl = (avatar) => {
  if (!avatar) return '';
  
  // 如果是相对路径，添加基础URL
  if (avatar.startsWith('/')) {
    const BASE_URL = "http://127.0.0.1:8080/api";
    return BASE_URL + avatar;
  }
  
  // 如果是完整的URL，直接返回
  return avatar;
};

const mutations = {
  SET_USER_INFO(state, userInfo) {
    // 处理头像URL
    const processedUserInfo = {
      ...userInfo,
      avatar: processAvatarUrl(userInfo.avatar)
    };
    
    state.userInfo = {
      ...state.userInfo,
      ...processedUserInfo,
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
  UPDATE_USER_INFO(state, userData) {
    // 处理头像URL
    const processedUserData = {
      ...userData,
      avatar: userData.avatar ? processAvatarUrl(userData.avatar) : state.userInfo.avatar
    };
    
    state.userInfo = {
      ...state.userInfo,
      ...processedUserData,
    };
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
          userType: loginData.userType,
          avatar: response.data.avatar,
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