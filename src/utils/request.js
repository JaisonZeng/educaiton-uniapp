// 请求基础配置
const BASE_URL = "http://127.0.0.1:8080/api"; // 替换为你的API地址

// 处理头像URL，确保使用完整的API路径
const processAvatarUrl = (avatar) => {
  if (!avatar) return '';
  
  // 如果是相对路径，添加基础URL
  if (avatar.startsWith('/')) {
    return BASE_URL + avatar;
  }
  
  // 如果是完整的URL，直接返回
  return avatar;
};

// 处理响应数据中的头像URL
const processResponseData = (data) => {
  if (!data) return data;
  
  // 如果是用户信息对象
  if (data.avatar !== undefined) {
    return {
      ...data,
      avatar: processAvatarUrl(data.avatar)
    };
  }
  
  // 如果是用户信息数组
  if (Array.isArray(data) && data.length > 0 && data[0].avatar !== undefined) {
    return data.map(item => ({
      ...item,
      avatar: processAvatarUrl(item.avatar)
    }));
  }
  
  // 如果是包含用户信息的对象
  if (data.data && data.data.avatar !== undefined) {
    return {
      ...data,
      data: {
        ...data.data,
        avatar: processAvatarUrl(data.data.avatar)
      }
    };
  }
  
  // 如果是包含用户信息数组的对象
  if (data.data && Array.isArray(data.data) && data.data.length > 0 && data.data[0].avatar !== undefined) {
    return {
      ...data,
      data: data.data.map(item => ({
        ...item,
        avatar: processAvatarUrl(item.avatar)
      }))
    };
  }
  
  return data;
};

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 显示加载提示
    uni.showLoading({
      title: "加载中...",
    });

    // 获取token
    const token = uni.getStorageSync("token");

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.header,
      },
      success: (res) => {
        uni.hideLoading();

        if (res.statusCode === 200) {
          // 请求成功
          if (res.data.code === 200) {
            resolve(res.data);
          } else {
            // 业务错误
            uni.showToast({
              title: res.data.message || "请求失败",
              icon: "none",
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // 未授权，跳转登录
          uni.showToast({
            title: "请先登录",
            icon: "none",
          });
          uni.navigateTo({
            url: "/pages/login/login",
          });
          reject(res);
        } else {
          // 其他错误
          uni.showToast({
            title: "网络错误",
            icon: "none",
          });
          reject(res);
        }
      },
      fail: (err) => {
        uni.hideLoading();
        uni.showToast({
          title: "网络连接失败",
          icon: "none",
        });
        reject(err);
      },
    });
  });
};

// API接口封装
export const api = {
  // 用户相关
  login: (data) => request({ url: "/auth/login", method: "POST", data }),
  register: (data) => request({ url: "/auth/register", method: "POST", data }),
  getUserInfo: () => request({ url: "/user/info" }),

  // 学生管理
  getStudents: (params) => request({ url: "/students", data: params }),
  addStudent: (data) => request({ url: "/students", method: "POST", data }),
  updateStudent: (id, data) =>
    request({ url: `/students/${id}`, method: "PUT", data }),
  deleteStudent: (id) => request({ url: `/students/${id}`, method: "DELETE" }),

  // 课程管理
  getCourses: (params) => request({ url: "/courses", data: params }),
  addCourse: (data) => request({ url: "/courses", method: "POST", data }),
  updateCourse: (id, data) =>
    request({ url: `/courses/${id}`, method: "PUT", data }),
  deleteCourse: (id) => request({ url: `/courses/${id}`, method: "DELETE" }),

  // 排班管理
  getSchedules: (params) => request({ url: "/schedules", data: params }),
  addSchedule: (data) => request({ url: "/schedules", method: "POST", data }),
  updateSchedule: (id, data) =>
    request({ url: `/schedules/${id}`, method: "PUT", data }),
  deleteSchedule: (id) =>
    request({ url: `/schedules/${id}`, method: "DELETE" }),
  bookSchedule: (id, data) =>
    request({ url: `/schedules/${id}/book`, method: "POST", data }),

  // 作业管理
  getHomeworks: (params) => request({ url: "/homeworks", data: params }),
  addHomework: (data) => request({ url: "/homeworks", method: "POST", data }),
  submitHomework: (id, data) =>
    request({ url: `/homeworks/${id}/submit`, method: "POST", data }),
  gradeHomework: (id, data) =>
    request({ url: `/homeworks/${id}/grade`, method: "PUT", data }),

  // 文件上传
  uploadFile: (filePath) => {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync("token");

      uni.uploadFile({
        url: BASE_URL + "/upload",
        filePath: filePath,
        name: "file",
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(data);
          }
        },
        fail: reject,
      });
    });
  },

  // 用户相关
  uploadAvatar: (filePath, userId) => {
    return new Promise((resolve, reject) => {
      const token = uni.getStorageSync("token");

      uni.uploadFile({
        url: BASE_URL + "/user/upload-avatar",
        filePath: filePath,
        name: "avatar",
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        formData: {
          userId: userId
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(data);
          }
        },
        fail: reject,
      });
    });
  },

  updateUserInfo: (data) => request({ url: "/user/update", method: "PUT", data }),
};

export default request;
