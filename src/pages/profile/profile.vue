<template>
  <view class="profile-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading"
        content-text="{ contentText: { contentdown: '加载中...', contentrefresh: '加载中...', contentnomore: '加载完成' } }"></uni-load-more>
    </view>

    <!-- 用户信息 -->
    <view v-else class="profile-content">
      <!-- 头像区域 -->
      <view class="avatar-section" @click="setAvatar">
        <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
        <view class="avatar-edit">
          <text class="edit-icon">📷</text>
        </view>
      </view>

      <!-- 用户基本信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="label">姓名</text>
          <text class="value">{{ userInfo.name || "未设置" }}</text>
        </view>

        <view class="info-item">
          <text class="label">用户名</text>
          <text class="value">{{ userInfo.username || "未设置" }}</text>
        </view>

        <view class="info-item">
          <text class="label">角色</text>
          <text class="value role-badge" :class="getRoleClass(userInfo.userType)">  
            {{ getRoleText(userInfo.userType) }}
          </text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button class="edit-btn" @click="editProfile">编辑资料</button>
        <button class="logout-btn" @click="logout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { onShow, onLoad } from "@dcloudio/uni-app";

// 初始化store
const store = useStore();

// 响应式数据
const loading = ref(false);
const userInfo = computed(() => store.state.user.userInfo);
const isLogin = computed(() => store.state.user.isLogin);

// 获取角色文本 - 兼容字符串和数字
const getRoleText = (role: any) => {
  console.log("getRoleText 接收到的 role:", role, "类型:", typeof role);

  // 转换为数字进行比较
  const roleNum = Number(role);

  switch (roleNum) {
    case 1:
      return "学生";
    case 2:
      return "老师";
    case 3:
      return "管理员";
    default:
      return `未知角色(${role})`;  // 显示原始值便于调试
  }
};

// 获取角色样式类名 - 兼容字符串和数字
const getRoleClass = (role: any) => {
  const roleNum = Number(role);

  switch (roleNum) {
    case 1:
      return "student";
    case 2:
      return "teacher";
    case 3:
      return "admin";
    default:
      return "default";
  }
};

const fetchUserInfo = async () => {
  try {
    loading.value = true;

    // 检查登录状态
    const isLoggedIn = await store.dispatch("user/checkLogin");

    if (!isLoggedIn) {
      uni.redirectTo({
        url: "/pages/login/login",
      });
      return;
    }

    // 检查 store 状态
    console.log("=== Store 状态检查 ===");
    console.log("store.state:", store.state);
    console.log("store.state.user:", store.state.user);
    console.log("store.state.user.userInfo:", store.state.user.userInfo);
    console.log("isLogin:", store.state.user.isLogin);

    // 如果用户信息为空，尝试重新获取
    if (!userInfo.value || Object.keys(userInfo.value).length === 0) {
      console.log("用户信息为空，尝试重新获取...");

      // 尝试从本地存储获取
      const localUserInfo = uni.getStorageSync('userInfo');
      console.log("本地存储的用户信息:", localUserInfo);

      if (localUserInfo) {
        // 如果本地有，更新到 store
        store.commit('user/SET_USER_INFO', localUserInfo);
      } else {
        // 如果本地也没有，可能需要重新登录
        uni.showToast({
          title: "请重新登录",
          icon: "error",
        });
        setTimeout(() => {
          uni.redirectTo({
            url: "/pages/login/login",
          });
        }, 1500);
        return;
      }
    }

  } catch (error: any) {
    console.error("获取用户信息失败:", error);
    uni.showToast({
      title: "网络错误",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
};


// 退出登录
const logout = () => {
  uni.showModal({
    title: "确认退出",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");

        // 跳转到登录页
        uni.redirectTo({
          url: "/pages/login/login",
        });

        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};

// 编辑资料
const editProfile = () => {
  uni.showToast({
    title: "功能开发中",
    icon: "none",
  });
};

// 设置头像
const setAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      console.log("选择的图片:", res.tempFilePaths[0]);
      uni.showToast({
        title: "头像上传功能开发中",
        icon: "none",
      });
    },
  });
};

// 页面生命周期
onLoad(() => {
  console.log("Profile page onLoad");
});

onShow(() => {
  console.log("Profile page onShow");
  fetchUserInfo();
});

// 暴露给页面生命周期使用
defineExpose({
  onLoad,
  onShow,
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.profile-content {
  padding: 40rpx;
}

.avatar-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60rpx;
  position: relative;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48rpx;
  height: 48rpx;
  background-color: #007aff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 4rpx solid #fff;
}

.edit-icon {
  color: #fff;
  font-size: 24rpx;
}

.info-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.value {
  font-size: 32rpx;
  color: #666;
}

.role-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
}

/* 角色样式 */
.role-badge.student {
  background-color: #34c759;
}

.role-badge.teacher {
  background-color: #007aff;
}

.role-badge.admin {
  background-color: #ff9500;
}

.role-badge.default {
  background-color: #8e8e93;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.edit-btn,
.logout-btn {
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.edit-btn {
  background-color: #007aff;
  color: #fff;
}

.logout-btn {
  background-color: #fff;
  color: #ff3b30;
  border: 2rpx solid #ff3b30;
}

.edit-btn:active {
  background-color: #0056d3;
}

.logout-btn:active {
  background-color: #fff0f0;
}
</style>