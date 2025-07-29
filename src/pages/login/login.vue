<template>
  <view class="login-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-content">
        <view class="navbar-title">登录</view>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="login-content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <image class="logo" :src="`/static/images/logo.png?t=${Date.now()}`" mode="aspectFit" @click="handleLogoClick"
          hover-class="logo-hover"></image>
        <text class="app-name">教育培训管理</text>
        <text class="app-desc">专业的一对一教学管理平台</text>
      </view>

      <!-- 角色选择 -->
      <view class="role-section">
        <text class="section-title">选择身份</text>
        <view class="role-tabs">
          <view class="role-tab" :class="{ active: loginForm.role === 0 }" @click="selectRole(0)"
            hover-class="role-tab-hover">
            <view class="role-icon-container">
              <text class="role-icon">👨‍🎓</text>
            </view>
            <text class="role-text">学生</text>
          </view>
          <view class="role-tab" :class="{ active: loginForm.role === 1 }" @click="selectRole(1)"
            hover-class="role-tab-hover">
            <view class="role-icon-container">
              <text class="role-icon">👨‍🏫</text>
            </view>
            <text class="role-text">老师</text>
          </view>
          <view v-if="showAdmin" class="role-tab" :class="{ active: loginForm.role === 2 }" @click="selectRole(2)"
            hover-class="role-tab-hover">
            <view class="role-icon-container">
              <text class="role-icon">👨‍💼</text>
            </view>
            <text class="role-text">管理员</text>
          </view>
        </view>
      </view>

      <!-- 登录表单 -->
      <view class="form-section">
        <view class="form-item">
          <view class="form-label">
            <view class="label-icon user-icon"></view>
            <text class="label-text">用户名</text>
          </view>
          <input class="form-input" type="text" placeholder="请输入用户名" v-model="loginForm.username"
            placeholder-class="input-placeholder" />
        </view>

        <view class="form-item">
          <view class="form-label">
            <view class="label-icon lock-icon"></view>
            <text class="label-text">密码</text>
          </view>
          <view class="input-wrapper">
            <input class="form-input" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码"
              v-model="loginForm.password" placeholder-class="input-placeholder" />
            <view class="password-toggle" @click="togglePassword" hover-class="toggle-hover">
              <view class="toggle-icon" :class="showPassword ? 'eye-off-icon' : 'eye-icon'"></view>
            </view>
          </view>
        </view>

        <!-- 记住密码 -->
        <view class="form-options">
          <view class="remember-password" @click="toggleRemember" hover-class="option-hover">
            <view class="checkbox" :class="{ checked: rememberPassword }">
              <view v-if="rememberPassword" class="check-icon"></view>
            </view>
            <text class="remember-text">记住密码</text>
          </view>
          <text class="forgot-password" @click="forgotPassword" hover-class="option-hover">忘记密码？</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <view class="button-section">
        <button class="login-btn" :class="{ disabled: !canSubmit }" :disabled="!canSubmit" @click="handleLogin"
          :loading="loading" hover-class="login-btn-hover">
          {{ loading ? "登录中..." : "登录" }}
        </button>

        <view class="register-section">
          <text class="register-text">还没有账号？</text>
          <text class="register-link" @click="goRegister" hover-class="link-hover">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { api } from "@/utils/request";

// 初始化store
const store = useStore();

// 响应式数据
const statusBarHeight = ref(0);
const showPassword = ref(false);
const rememberPassword = ref(false);
const loading = ref(false);
const showAdmin = ref(false);
const logoClickCount = ref(0);
const loginForm = ref({
  username: "",
  password: "",
  role: 0, // 默认老师身份
});

// 计算属性
const canSubmit = computed(() => {
  return (
    loginForm.value.username.trim() !== "" &&
    loginForm.value.password.length >= 6 &&
    !loading.value
  );
});

// 方法 0 代表老师->2 ｜ 1 代表学生->1 ｜ 2 代表管理员->3
const selectRole = (role: 0 | 1 | 2) => {
  loginForm.value.role = role;
  // 添加触感反馈
  if (uni.vibrateShort) {
    uni.vibrateShort({
      success: function () {
        console.log("振动成功");
      },
    });
  }
};

const handleLogoClick = () => {
  logoClickCount.value++;
  if (logoClickCount.value === 5) {
    showAdmin.value = true;
    uni.showToast({
      title: "管理员权限已开启",
      icon: "success",
      duration: 1500,
    });
  }
  if (logoClickCount.value > 0 && logoClickCount.value < 5) {
    uni.showToast({
      title: `再点击${5 - logoClickCount.value}次开启管理员权限`,
      icon: "none",
      duration: 1000,
    });
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleRemember = () => {
  rememberPassword.value = !rememberPassword.value;
};

const loadRememberedPassword = () => {
  const savedAccount = uni.getStorageSync("savedAccount");
  if (savedAccount) {
    loginForm.value.username = savedAccount.username;
    loginForm.value.password = savedAccount.password;
    loginForm.value.role = savedAccount.role;
    rememberPassword.value = true;
  }
};

const saveAccount = () => {
  if (rememberPassword.value) {
    uni.setStorageSync("savedAccount", {
      username: loginForm.value.username,
      password: loginForm.value.password,
      role: loginForm.value.role,
    });
  } else {
    uni.removeStorageSync("savedAccount");
  }
};

const handleLogin = async () => {
  if (!canSubmit.value) return;

  // 简单验证
  if (!loginForm.value.username.trim()) {
    uni.showToast({
      title: "请输入用户名",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  loading.value = true;

  try {
    // 准备登录数据
    const loginData = {
      username: loginForm.value.username,
      password: loginForm.value.password,
      userType: loginForm.value.role === 0 ? 1 : loginForm.value.role === 1 ? 2 : 3 // 0:学生->1, 1:老师->2, 2:管理员->3
    };

    console.log('准备登录，数据:', loginData);

    // 保存登录信息到Vuex
    const dispatchResult = await store.dispatch("user/login", loginData);
    console.log('Vuex dispatch 结果:', dispatchResult);

    if (dispatchResult.success) {
      // 检查store中的状态
      console.log('Store中的用户信息:', store.getters['user/userInfo']);
      console.log('Store中的登录状态:', store.getters['user/isLoggedIn']);

      // 保存账号密码（如果选择记住）
      saveAccount();

      uni.showToast({
        title: "登录成功",
        icon: "success",
        duration: 1500,
      });

      // 跳转到首页
      setTimeout(() => {
        console.log('准备跳转到首页');
        uni.switchTab({
          url: "/pages/index/index",
        });
      }, 1500);
    } else {
      uni.showToast({
        title: dispatchResult.message || "登录失败，请检查账号密码",
        icon: "none",
        duration: 2000,
      });
    }
  } catch (error: any) {
    console.error("登录失败:", error);
    // 这里可以根据具体错误类型显示不同提示
    uni.showToast({
      title: "登录过程发生错误",
      icon: "none",
      duration: 2000,
    });
  } finally {
    loading.value = false;
  }
};

const forgotPassword = () => {
  uni.showModal({
    title: "忘记密码",
    content: "请联系管理员重置密码",
    showCancel: false,
    confirmText: "知道了",
    success: function (res) {
      if (res.confirm) {
        console.log("用户点击确定");
      }
    },
  });
};

const goRegister = () => {
  uni.showModal({
    title: "注册账号",
    content: "请联系管理员开通账号",
    showCancel: false,
    confirmText: "知道了",
    success: function (res) {
      if (res.confirm) {
        console.log("用户点击确定");
      }
    },
  });
};

// 生命周期钩子
onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight;

  // 检查是否记住了密码
  loadRememberedPassword();
});

// 页面生命周期
const onLoad = () => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight;

  // 检查是否记住了密码
  loadRememberedPassword();
};

// 暴露给页面生命周期使用
defineExpose({
  onLoad,
});
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #4a6bdf 0%, #764ba2 100%);
  position: relative;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .navbar-content {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;

    .navbar-title {
      color: white;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }
}

.login-content {
  padding: 100px 20px 30px;
  /* 减少顶部和两侧间距 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /* 确保内容从顶部开始 */
  box-sizing: border-box;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
  /* 减少底部间距 */
  animation: fadeInDown 0.8s ease-out;

  .logo {
    width: 80px;
    /* 减小logo尺寸 */
    height: 80px;
    margin-bottom: 15px;
    /* 减少间距 */
    border-radius: 18px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  }

  .app-name {
    display: block;
    color: white;
    font-size: 24px;
    /* 稍微减小字体 */
    font-weight: bold;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .app-desc {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    letter-spacing: 0.5px;
  }
}

.role-section {
  margin-bottom: 25px;
  /* 减少底部间距 */
  animation: fadeInUp 0.8s ease-out 0.2s both;

  .section-title {
    display: block;
    color: white;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);


  }

  .role-tabs {
    display: flex;
    gap: 10px;
    justify-content: center;
    min-height: 100rpx;
  }

  .role-tab {
    flex: 1;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    padding: 12px 8px;
    text-align: center;
    transition: all 0.3s;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &.active {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);

      .role-text {
        color: #4a6bdf;
      }
    }

    &-hover {
      opacity: 0.9;
      transform: scale(0.98);
    }

    .role-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto 6px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;

      .active & {
        background: rgba(74, 107, 223, 0.1);
      }
    }

    .role-icon {
      display: block;
      font-size: 24px;
      line-height: 1;
    }

    .role-text {
      display: block;
      color: white;
      font-size: 14px;
      font-weight: bold;
    }
  }
}

.form-section {
  margin-bottom: 25px;
  /* 减少底部间距 */
  animation: fadeInUp 0.8s ease-out 0.4s both;
  width: 100%;
  /* 确保表单占满宽度 */

  .form-item {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 14px;
    margin-bottom: 15px;
    /* 减少间距 */
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:focus-within {
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .form-label {
      display: flex;
      align-items: center;
      padding: 10px 16px 4px;
      /* 减少内边距 */
      background: rgba(74, 107, 223, 0.08);
      border-bottom: 1px solid rgba(74, 107, 223, 0.1);

      .label-icon {
        margin-right: 8px;
        width: 14px;
        height: 14px;
      }

      .label-text {
        font-size: 13px;
        font-weight: 500;
        color: #4a6bdf;
      }
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      /* 调整内边距 */
      font-size: 16px;
      color: #333;
      border: none;
      background: transparent;
      box-sizing: border-box;
      height: 48px;
      /* 固定高度 */
    }

    /* 修改placeholder样式，确保不会上移 */
    .input-placeholder {
      color: #999;
      font-size: 15px;
    }

    .input-wrapper {
      position: relative;

      .form-input {
        padding-right: 50px;
      }

      .password-toggle {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 32px;
        /* 减小尺寸 */
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
        cursor: pointer;

        &.toggle-hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .toggle-icon {
          width: 18px;
          height: 18px;
        }
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    /* 减少间距 */
    padding: 0 5px;

    .remember-password {
      display: flex;
      align-items: center;
      padding: 5px;
      border-radius: 8px;

      &.option-hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .checkbox {
        width: 16px;
        /* 减小尺寸 */
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        transition: all 0.2s;

        &.checked {
          background: white;
          border-color: white;

          .check-icon {
            width: 8px;
            height: 8px;
          }
        }
      }

      .remember-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        /* 减小字体 */
      }
    }

    .forgot-password {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      /* 减小字体 */
      text-decoration: underline;
      padding: 5px;
      border-radius: 8px;

      &.option-hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.button-section {
  margin-top: 30px;
  /* 固定顶部间距，不再使用auto */
  animation: fadeInUp 0.8s ease-out 0.6s both;

  .login-btn {
    width: 100%;
    height: 50px;
    /* 减小高度 */
    background: white;
    color: #4a6bdf;
    border: none;
    border-radius: 25px;
    font-size: 17px;
    /* 减小字体 */
    font-weight: bold;
    margin-bottom: 20px;
    transition: all 0.3s;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);

    &.disabled {
      background: rgba(255, 255, 255, 0.5);
      color: rgba(74, 107, 223, 0.5);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &-hover:not(.disabled) {
      transform: translateY(2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .register-section {
    text-align: center;

    .register-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      /* 减小字体 */
    }

    .register-link {
      color: white;
      font-size: 13px;
      /* 减小字体 */
      font-weight: bold;
      margin-left: 5px;
      text-decoration: underline;
      padding: 3px;
      border-radius: 4px;

      &.link-hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

/* 图标样式 - 使用CSS绘制 */
.user-icon {
  background: #4a6bdf;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.phone-icon {
  background: #4a6bdf;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.lock-icon {
  background: #4a6bdf;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='11' width='18' height='11' rx='2' ry='2'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.eye-icon {
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.eye-off-icon {
  background: #666;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'/%3E%3Cline x1='1' y1='1' x2='23' y2='23'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

.check-icon {
  background: #4a6bdf;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'%3E%3Cpolyline points='20,6 9,17 4,12'/%3E%3C/svg%3E") no-repeat center;
  mask-size: contain;
}

/* 动画效果 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 - 针对不同屏幕尺寸优化 */
@media screen and (max-height: 700px) {
  .login-content {
    padding-top: 80px;
  }

  .logo-section {
    margin-bottom: 20px;

    .logo {
      width: 70px;
      height: 70px;
      margin-bottom: 10px;
    }

    .app-name {
      font-size: 22px;
      margin-bottom: 6px;
    }

    .app-desc {
      font-size: 13px;
    }
  }

  .role-section {
    margin-bottom: 20px;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .button-section {
    margin-top: 20px;
  }
}

/* 针对较宽的屏幕，限制内容宽度 */
@media screen and (min-width: 500px) {
  .login-content {
    width: 90%;
    max-width: 450px;
    margin: 0 auto;
  }
}
</style>
