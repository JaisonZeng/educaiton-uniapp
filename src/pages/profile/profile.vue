<template>
  <view class="profile-container page-container">
    <!-- 头部信息 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="user-avatar">
          <image
            class="avatar-img"
            :src="userInfo.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          ></image>
          <view class="avatar-edit" @click="editAvatar">
            <text class="edit-icon">📷</text>
          </view>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.name || "未设置姓名" }}</text>
          <text class="user-phone">{{ userInfo.phone || "未绑定手机" }}</text>
          <view class="user-role">
            <text class="role-tag">{{
              userInfo.role === "teacher" ? "教师" : "学生"
            }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stats-item" v-for="(stat, index) in statsData" :key="index">
        <text class="stat-number">{{ stat.value }}</text>
        <text class="stat-label">{{ stat.label }}</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view
        class="menu-group"
        v-for="(group, groupIndex) in menuGroups"
        :key="groupIndex"
      >
        <view class="group-title" v-if="group.title">{{ group.title }}</view>
        <view class="menu-list">
          <view
            class="menu-item"
            v-for="(item, index) in group.items"
            :key="index"
            @click="handleMenuClick(item)"
          >
            <view class="menu-left">
              <text class="menu-icon">{{ item.icon }}</text>
              <text class="menu-name">{{ item.name }}</text>
            </view>
            <view class="menu-right">
              <text class="menu-value" v-if="item.value">{{ item.value }}</text>
              <text class="menu-arrow">></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
    

  </view>
</template>

<script lang="ts">
import { mapState, mapActions } from "vuex";

export default {
  name: "Profile",
  data() {
    return {
      statsData: [
        { label: "总课时", value: 0 },
        { label: "本月课程", value: 0 },
        { label: "完成作业", value: 0 },
      ],
    };
  },
  computed: {
    ...mapState("user", ["userInfo", "isLogin"]),

    menuGroups() {
      return [
        {
          title: "个人信息",
          items: [
            { name: "编辑资料", icon: "👤", action: "editProfile" },
            { name: "修改密码", icon: "🔒", action: "changePassword" },
            {
              name: "绑定手机",
              icon: "📱",
              value: this.userInfo.phone ? "已绑定" : "未绑定",
              action: "bindPhone",
            },
          ],
        },
        {
          title: "学习管理",
          items: [
            { name: "我的课程", icon: "📚", action: "myCourses" },
            { name: "学习记录", icon: "📊", action: "studyRecords" },
            { name: "收藏资料", icon: "⭐", action: "favorites" },
          ],
        },
        {
          title: "系统设置",
          items: [
            { name: "消息通知", icon: "🔔", action: "notifications" },
            { name: "隐私设置", icon: "🛡️", action: "privacy" },
            { name: "关于我们", icon: "ℹ️", action: "about" },
          ],
        },
      ];
    },
  },
  onLoad() {
    this.checkLoginStatus();
    this.loadUserStats();
  },
  onShow() {
    this.loadUserStats();
  },
  methods: {
    ...mapActions("user", ["logout", "checkLogin"]),

    // 检查登录状态
    checkLoginStatus() {
      this.checkLogin();
      if (!this.isLogin) {
        uni.navigateTo({
          url: "/pages/login/login",
        });
      }
    },

    // 加载用户统计数据
    async loadUserStats() {
      try {
        // 这里调用API获取用户统计数据
        // const stats = await api.getUserStats()
        // this.statsData = stats

        // 模拟数据
        this.statsData = [
          { label: "总课时", value: 24 },
          { label: "本月课程", value: 6 },
          { label: "完成作业", value: 18 },
        ];
      } catch (error: any) {
        console.error("加载统计数据失败:", error);
      }
    },

    // 编辑头像
    editAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          // 这里可以上传头像
          console.log("选择的图片:", res.tempFilePaths[0]);
          uni.showToast({
            title: "头像上传功能开发中",
            icon: "none",
          });
        },
      });
    },

    // 处理菜单点击
    handleMenuClick(item) {
      switch (item.action) {
        case "editProfile":
          this.editProfile();
          break;
        case "changePassword":
          this.changePassword();
          break;
        case "bindPhone":
          this.bindPhone();
          break;
        case "myCourses":
          this.viewMyCourses();
          break;
        case "studyRecords":
          this.viewStudyRecords();
          break;
        case "favorites":
          this.viewFavorites();
          break;
        case "notifications":
          this.manageNotifications();
          break;
        case "privacy":
          this.managePrivacy();
          break;
        case "about":
          this.showAbout();
          break;
        default:
          uni.showToast({
            title: "功能开发中",
            icon: "none",
          });
      }
    },

    // 编辑资料
    editProfile() {
      uni.showModal({
        title: "编辑资料",
        content: "此功能正在开发中，敬请期待",
        showCancel: false,
      });
    },

    // 修改密码
    changePassword() {
      uni.showModal({
        title: "修改密码",
        content: "此功能正在开发中，敬请期待",
        showCancel: false,
      });
    },

    // 绑定手机
    bindPhone() {
      uni.showModal({
        title: "绑定手机",
        content: "此功能正在开发中，敬请期待",
        showCancel: false,
      });
    },

    // 我的课程
    viewMyCourses() {
      uni.switchTab({
        url: "/pages/index/index",
      });
    },

    // 学习记录
    viewStudyRecords() {
      uni.showToast({
        title: "功能开发中",
        icon: "none",
      });
    },

    // 收藏资料
    viewFavorites() {
      uni.showToast({
        title: "功能开发中",
        icon: "none",
      });
    },

    // 消息通知
    manageNotifications() {
      uni.showToast({
        title: "功能开发中",
        icon: "none",
      });
    },

    // 隐私设置
    managePrivacy() {
      uni.showToast({
        title: "功能开发中",
        icon: "none",
      });
    },

    // 关于我们
    showAbout() {
      uni.showModal({
        title: "关于我们",
        content: "教育培训管理系统 v1.0.0\n专业的一对一教学管理平台",
        showCancel: false,
      });
    },

    // 退出登录
    handleLogout() {
      uni.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            this.logout();
            uni.showToast({
              title: "已退出登录",
              icon: "success",
            });
            setTimeout(() => {
              uni.navigateTo({
                url: "/pages/login/login",
              });
            }, 1500);
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 100px;
}

.header-section {
  position: relative;
  height: 240px;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .header-content {
    position: relative;
    z-index: 2;
    padding: 60px 20px 30px;
    display: flex;
    align-items: center;

    .user-avatar {
      position: relative;
      margin-right: 20px;

      .avatar-img {
        width: 80px;
        height: 80px;
        border-radius: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
      }

      .avatar-edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        .edit-icon {
          font-size: 14px;
        }
      }
    }

    .user-info {
      flex: 1;

      .user-name {
        display: block;
        color: white;
        font-size: 22px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .user-phone {
        display: block;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin-bottom: 10px;
      }

      .user-role {
        .role-tag {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      }
    }
  }
}

.stats-section {
  margin: -40px 20px 20px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;

  .stats-item {
    text-align: center;

    .stat-number {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #666;
    }
  }
}

.menu-section {
  margin: 0 20px;

  .menu-group {
    margin-bottom: 20px;

    .group-title {
      font-size: 14px;
      font-weight: bold;
      color: #666;
      margin-bottom: 10px;
      padding-left: 5px;
    }

    .menu-list {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: #f8f9fa;
        }

        .menu-left {
          display: flex;
          align-items: center;

          .menu-icon {
            font-size: 20px;
            margin-right: 12px;
          }

          .menu-name {
            font-size: 16px;
            color: #333;
          }
        }

        .menu-right {
          display: flex;
          align-items: center;

          .menu-value {
            font-size: 14px;
            color: #666;
            margin-right: 8px;
          }

          .menu-arrow {
            font-size: 16px;
            color: #ccc;
          }
        }
      }
    }
  }
}

.logout-section {
  margin: 30px 20px 0;

  .logout-btn {
    width: 100%;
    height: 50px;
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
