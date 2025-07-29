<template>
  <view class="container page-container">
    <!-- 顶部栏 -->
    <view class="top-bar">
      <view class="top-left">
        <image
          class="app-logo"
          src="/static/images/logo.png"
          mode="aspectFit"
        ></image>
        <!-- 水彩点缀元素 -->
        <view class="watercolor-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
      <view class="top-right">
        <view class="user-avatar" @click="goToProfile">
          <image
            class="avatar-img"
            :src="userInfo.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          ></image>
          <view class="avatar-indicator"></view>
        </view>
      </view>
    </view>

    <!-- 问候语和统计数据容器 -->
    <view class="greeting-stats-container">
      <!-- 问候语 -->
      <view class="greeting-section">
        <text class="greeting-text">{{ greetingText }}</text>
        <text class="user-name">{{ userInfo.name || "用户" }}</text>
        <text class="weather-info">{{ weatherInfo }}</text>
      </view>

      <!-- 统计数据 -->
      <view class="stats-section">
        <text class="stats-title">今日数据</text>
        <view class="stats-grid">
          <view
            class="stat-item"
            v-for="(stat, index) in statsData"
            :key="index"
          >
            <text class="stat-number">{{ stat.value }}</text>
            <text class="stat-label">{{ stat.label }}</text>
            <text class="stat-icon">{{ stat.icon }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <text class="menu-title">快捷功能</text>
      <view class="menu-grid">
        <view
          class="menu-item"
          v-for="(menu, index) in menuList"
          :key="index"
          @click="navigateTo(menu.path)"
        >
          <view class="menu-icon-bg" :style="{ background: menu.color }">
            <text class="menu-icon">{{ menu.icon }}</text>
          </view>
          <text class="menu-name">{{ menu.name }}</text>
          <text class="menu-desc">{{ menu.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 最近活动 -->
    <view class="activity-section">
      <view class="activity-header">
        <text class="activity-title">最近活动</text>
        <text class="activity-more" @click="viewAllActivities">查看全部</text>
      </view>
      <view class="activity-list">
        <view
          class="activity-item"
          v-for="(activity, index) in activityList"
          :key="index"
        >
          <view class="activity-time">
            <text class="time-day">{{ activity.day }}</text>
            <text class="time-month">{{ activity.month }}</text>
          </view>
          <view class="activity-content">
            <text class="activity-title-text">{{ activity.title }}</text>
            <text class="activity-desc">{{ activity.desc }}</text>
            <text
              class="activity-status"
              :class="'status-' + activity.status"
              >{{ activity.statusText }}</text
            >
          </view>
        </view>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="fab-container">
      <view class="fab-btn" @click="showQuickActions">
        <text class="fab-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { onLoad, onShow } from '@dcloudio/uni-app'


// 接口定义
interface UserInfo {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: number;
}

interface StatData {
  label: string;
  value: number;
  icon: string;
}

interface MenuItem {
  name: string;
  desc: string;
  icon: string;
  color: string;
  path: string;
}

interface Activity {
  day: string;
  month: string;
  title: string;
  desc: string;
  status: string;
  statusText: string;
}

// 初始化store
const store = useStore();

// 响应式数据
const userInfo = ref<UserInfo>({
  id: "",
  name: "",
  phone: "",
  avatar: "",
  role: 1,
});

const statsData = ref<StatData[]>([
  { label: "今日课程", value: 0, icon: "📚" },
  { label: "待完成", value: 0, icon: "📝" },
  { label: "本周课时", value: 0, icon: "⏰" },
]);

const activityList = ref<Activity[]>([]);

// 计算属性
const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "上午好";
  if (hour < 18) return "下午好";
  return "晚上好";
});

const weatherInfo = computed(() => {
  return "今天天气不错，适合学习";
});

const menuList = computed<MenuItem[]>(() => {
  if (userInfo.value.role === 0) {
    return [
      {
        name: "学生管理",
        desc: "管理我的学生",
        icon: "👥",
        color: "#667eea",
        path: "/pages/teacher/students",
      },
      {
        name: "课程安排",
        desc: "安排课程时间",
        icon: "📅",
        color: "#f093fb",
        path: "/pages/teacher/schedule",
      },
      {
        name: "作业批改",
        desc: "批改学生作业",
        icon: "📝",
        color: "#4facfe",
        path: "/pages/teacher/homework",
      },
      {
        name: "教学资料",
        desc: "管理教学资源",
        icon: "📚",
        color: "#43e97b",
        path: "/pages/teacher/materials",
      },
    ];
  } else {
    return [
      {
        name: "课程预约",
        desc: "预约一对一课程",
        icon: "📅",
        color: "#667eea",
        path: "/pages/student/booking",
      },
      {
        name: "我的课程",
        desc: "查看课程安排",
        icon: "📚",
        color: "#f093fb",
        path: "/pages/student/courses",
      },
      {
        name: "作业提交",
        desc: "完成课后作业",
        icon: "📝",
        color: "#4facfe",
        path: "/pages/student/homework",
      },
      {
        name: "学习记录",
        desc: "查看学习进度",
        icon: "📊",
        color: "#43e97b",
        path: "/pages/student/records",
      },
    ];
  }
});

// 方法
const checkLogin = () => {
  // 从Vuex获取登录状态
  const isLoggedIn = store.getters["user/isLoggedIn"];
  console.log('检查登录状态:', isLoggedIn);

  if (!isLoggedIn) {
    console.log('用户未登录，跳转到登录页');
    // 如果未登录，跳转到登录页
    uni.redirectTo({
      url: "/pages/login/login",
    });
    return false;
  }
  console.log('用户已登录');
  return true;
};

const loadUserInfo = () => {
  // 从Vuex获取用户信息
  const storeUserInfo = store.getters["user/userInfo"];
  console.log('从Vuex获取的用户信息:', storeUserInfo);

  if (storeUserInfo) {
    userInfo.value = {
      id: storeUserInfo.id || "",
      name: storeUserInfo.name || "",
      username: storeUserInfo.username || "",
      avatar: storeUserInfo.avatar || "",
      role: storeUserInfo.userType || 1, // 1:学生, 2:老师, 3:管理员
    };
    console.log('设置后的用户信息:', userInfo.value);
  }
};

const loadData = async () => {
  try {
    console.log("加载首页数据");

    // 根据用户角色获取不同的数据
    if (userInfo.value.role === 2) {
      // 教师数据
      statsData.value = [
        { label: "今日课程", value: 3, icon: "📚" },
        { label: "待批改", value: 5, icon: "📝" },
        { label: "本周课时", value: 12, icon: "⏰" },
      ];

      // 教师活动列表
      activityList.value = [
        {
          day: "25",
          month: "7月",
          title: "数学一对一课程",
          desc: "今天 14:00-15:30",
          status: "ongoing",
          statusText: "进行中",
        },
        {
          day: "24",
          month: "7月",
          title: "批改英语作业",
          desc: "昨天已完成",
          status: "completed",
          statusText: "已完成",
        },
        {
          day: "26",
          month: "7月",
          title: "物理实验课",
          desc: "明天 10:00-11:30",
          status: "booked",
          statusText: "已预约",
        },
      ];
    } else {
      // 学生数据
      statsData.value = [
        { label: "今日课程", value: 2, icon: "📚" },
        { label: "待完成", value: 3, icon: "📝" },
        { label: "本周课时", value: 8, icon: "⏰" },
      ];

      // 学生活动列表
      activityList.value = [
        {
          day: "25",
          month: "7月",
          title: "数学一对一课程",
          desc: "今天 14:00-15:30",
          status: "ongoing",
          statusText: "进行中",
        },
        {
          day: "24",
          month: "7月",
          title: "英语作业提交",
          desc: "昨天已完成",
          status: "completed",
          statusText: "已完成",
        },
        {
          day: "26",
          month: "7月",
          title: "物理实验课",
          desc: "明天 10:00-11:30",
          status: "booked",
          statusText: "已预约",
        },
      ];
    }

    // 这里可以调用API加载真实数据
    // const response = await api.getHomeData(userInfo.value.role);
    // statsData.value = response.data.stats;
    // activityList.value = response.data.activities;
  } catch (error: any) {
    console.error("加载数据失败:", error);
    uni.showToast({
      title: "加载数据失败",
      icon: "none",
    });
  }
};

const goToProfile = () => {
  uni.navigateTo({
    url: "/pages/profile/profile",
  });
};

const navigateTo = (path: string) => {
  if (!path) {
    uni.showToast({
      title: "功能开发中",
      icon: "none",
    });
    return;
  }

  // 检查页面是否存在
  const existingPages = [
    "/pages/index/index",
    "/pages/login/login",
    "/pages/profile/profile",
  ];

  if (existingPages.includes(path)) {
    uni.navigateTo({ url: path });
  } else {
    uni.showToast({
      title: "功能开发中",
      icon: "none",
    });
  }
};

const viewAllActivities = () => {
  uni.showToast({
    title: "功能开发中",
    icon: "none",
  });
};

const showQuickActions = () => {
  // 根据用户角色显示不同的快捷操作
  const actions =
    userInfo.value.role === 2
      ? ["新建课程", "批改作业", "添加教材", "查看统计"]
      : ["预约课程", "提交作业", "查看课表", "学习记录"];

  uni.showActionSheet({
    itemList: actions,
    success: (res) => {
      uni.showToast({
        title: `${actions[res.tapIndex]}功能开发中`,
        icon: "none",
      });
    },
  });
};

// 页面生命周期
onLoad(() => {
  console.log('=== 主页 onLoad 触发 ===');
  if (checkLogin()) {
    loadUserInfo();
    loadData();
  }
});

onShow(() => {
  console.log('=== 主页 onShow 触发 ===');
  console.log('当前 store 状态:', store.state);
  console.log('用户信息:', store.getters['user/userInfo']);
  console.log('登录状态:', store.getters['user/isLoggedIn']);
  
  if (checkLogin()) {
    console.log('用户已登录，加载用户信息');
    loadUserInfo();
    loadData();
  } else {
    console.log('用户未登录或登录已过期');
  }
});
</script>

<style lang="scss" scoped>
.page-container {
  background-color: #d2d9fb;
}

.index-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 100px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 10px;
  position: relative;
  z-index: 10;

  .top-left {
    display: flex;
    align-items: center;
    position: relative;

    /* 水彩晕染效果 */
    &::after {
      content: "";
      position: absolute;
      bottom: -15px;
      left: 5px;
      width: 60px;
      height: 30px;
      background: radial-gradient(
        circle at center,
        rgba(102, 126, 234, 0.5) 0%,
        rgba(118, 75, 162, 0.2) 50%,
        rgba(118, 75, 162, 0) 70%
      );
      filter: blur(8px);
      z-index: -1;
      opacity: 0.7;
      border-radius: 50%;
      animation: watercolor-pulse 8s infinite alternate ease-in-out;
    }

    /* 第二个水彩效果 */
    &::before {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 15px;
      width: 40px;
      height: 20px;
      background: radial-gradient(
        circle at center,
        rgba(243, 147, 251, 0.4) 0%,
        rgba(118, 75, 162, 0.1) 60%,
        rgba(118, 75, 162, 0) 80%
      );
      filter: blur(6px);
      z-index: -1;
      opacity: 0.6;
      border-radius: 50%;
      animation: watercolor-pulse-2 6s infinite alternate-reverse ease-in-out;
    }

    /* 添加小水彩点缀 */
    .watercolor-dots {
      position: absolute;
      bottom: -5px;
      left: 30px;
      width: 100%;
      height: 20px;
      z-index: -1;
      pointer-events: none;

      .dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        filter: blur(2px);
        opacity: 0.4;

        &:nth-child(1) {
          background-color: rgba(102, 126, 234, 0.6);
          left: 5px;
          bottom: 2px;
          animation: float-dot 7s infinite ease-in-out;
        }

        &:nth-child(2) {
          background-color: rgba(243, 147, 251, 0.5);
          left: 20px;
          bottom: 8px;
          width: 6px;
          height: 6px;
          animation: float-dot 5s 1s infinite ease-in-out;
        }

        &:nth-child(3) {
          background-color: rgba(118, 75, 162, 0.5);
          left: 35px;
          bottom: 5px;
          width: 4px;
          height: 4px;
          animation: float-dot 9s 2s infinite ease-in-out;
        }
      }
    }

    /* 水彩效果动画 */
    @keyframes watercolor-pulse {
      0% {
        opacity: 0.7;
        transform: scale(1) translate(0, 0);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.1) translate(2px, 1px);
      }
      100% {
        opacity: 0.7;
        transform: scale(1) translate(-2px, 0);
      }
    }

    @keyframes watercolor-pulse-2 {
      0% {
        opacity: 0.6;
        transform: scale(1) translate(0, 0);
      }
      50% {
        opacity: 0.4;
        transform: scale(1.15) translate(-3px, 2px);
      }
      100% {
        opacity: 0.6;
        transform: scale(1) translate(3px, 0);
      }
    }

    @keyframes float-dot {
      0% {
        transform: translateY(0) scale(1);
        opacity: 0.4;
      }
      50% {
        transform: translateY(-3px) scale(1.2);
        opacity: 0.6;
      }
      100% {
        transform: translateY(0) scale(1);
        opacity: 0.4;
      }
    }

    .app-logo {
      width: 42px;
      height: 42px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      transition: transform 0.3s ease;
      position: relative;
      z-index: 2;

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .top-right {
    .user-avatar {
      position: relative;
      padding: 3px;
      border-radius: 9999px; /* 使用极大的值确保完全圆形 */
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 10px rgba(118, 75, 162, 0.25);
      transition: all 0.3s ease;
      width: 50px; /* 确保宽高一致 */
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:active {
        transform: scale(0.95);
        box-shadow: 0 2px 5px rgba(118, 75, 162, 0.2);
      }

      .avatar-img {
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        border: 2px solid white;
        object-fit: cover;
      }

      .avatar-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 14px;
        height: 14px;
        border-radius: 9999px;
        background: #4cd964;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.greeting-stats-container {
  margin: 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(118, 75, 162, 0.25);
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 5px 15px rgba(118, 75, 162, 0.2);
  }
}

.greeting-section {
  padding: 24px;
  color: white;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    z-index: 1;
  }

  .greeting-text {
    display: block;
    font-size: 16px;
    margin-bottom: 6px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 2;
  }

  .user-name {
    display: block;
    font-size: 26px;
    font-weight: bold;
    margin-bottom: 12px;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 2;
  }

  .weather-info {
    display: block;
    font-size: 14px;
    opacity: 0.9;
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.15);
    padding: 6px 12px;
    border-radius: 20px;
    display: inline-block;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
}

.stats-section {
  padding: 20px 24px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0)
    );
  }

  .stats-title {
    font-size: 16px;
    font-weight: bold;
    color: white;
    margin-bottom: 18px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;

    &::before {
      content: "📊";
      margin-right: 8px;
      font-size: 18px;
    }
  }

  .stats-grid {
    display: flex;
    justify-content: space-between;

    .stat-item {
      text-align: center;
      position: relative;
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 6px;
      padding: 15px 10px;
      border-radius: 12px;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      transition: transform 0.2s ease, background 0.2s ease;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }

      &:active {
        transform: scale(0.97);
        background: rgba(255, 255, 255, 0.15);
      }

      .stat-number {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: white;
        margin-bottom: 6px;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .stat-label {
        display: block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
      }

      .stat-icon {
        position: absolute;
        top: -5px;
        right: 10px;
        font-size: 22px;
        color: white;
        opacity: 0.4;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.menu-section {
  margin: 20px 20px 0;

  .menu-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .menu-item {
      background: white;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s;

      &:active {
        transform: scale(0.98);
      }

      .menu-icon-bg {
        width: 50px;
        height: 50px;
        border-radius: 25px;
        margin: 0 auto 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .menu-icon {
          font-size: 24px;
          color: white;
        }
      }

      .menu-name {
        display: block;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }

      .menu-desc {
        display: block;
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.activity-section {
  margin: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .activity-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .activity-more {
      font-size: 12px;
      color: #667eea;
    }
  }

  .activity-list {
    .activity-item {
      display: flex;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .activity-time {
        width: 60px;
        text-align: center;
        margin-right: 15px;

        .time-day {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
          line-height: 1;
        }

        .time-month {
          display: block;
          font-size: 12px;
          color: #999;
          margin-top: 2px;
        }
      }

      .activity-content {
        flex: 1;

        .activity-title-text {
          display: block;
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .activity-desc {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .activity-status {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: bold;

          &.status-ongoing {
            background: #e8f5e8;
            color: #4caf50;
          }

          &.status-pending {
            background: #fff3e0;
            color: #ff9800;
          }

          &.status-completed {
            background: #e3f2fd;
            color: #2196f3;
          }

          &.status-booked {
            background: #f3e5f5;
            color: #9c27b0;
          }
        }
      }
    }
  }
}

.fab-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;

  .fab-btn {
    width: 60px;
    height: 60px;
    background: #667eea;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    .fab-icon {
      font-size: 24px;
      color: white;
    }
  }
}
</style>
