<template>
	<view class="container page-container">
		<!-- 顶部栏 -->
		<view class="top-bar">
			<view class="top-left">
				<image class="app-logo" src="/static/images/logo.png" mode="aspectFit"></image>
			</view>
			<view class="top-right">
				<view class="user-avatar" @click="showRoleSwitch">
					<image class="avatar-img" :src="userInfo.avatar || '/static/images/default-avatar.png'"
						mode="aspectFill"></image>
					<view class="avatar-indicator"></view>
				</view>
			</view>
		</view>

		<!-- 问候语和统计数据容器 -->
		<view class="greeting-stats-container">
			<!-- 问候语 -->
			<view class="greeting-section">
				<text class="greeting-text">{{ greetingText }}</text>
				<text class="user-name">{{ userInfo.name || '用户' }}</text>
				<text class="weather-info">{{ weatherInfo }}</text>
			</view>

			<!-- 统计数据 -->
			<view class="stats-section">
				<text class="stats-title">今日数据</text>
				<view class="stats-grid">
					<view class="stat-item" v-for="(stat, index) in statsData" :key="index">
						<text class="stat-number">{{ stat.value }}</text>
						<text class="stat-label">{{ stat.label }}</text>
						<text class="stat-icon">{{ stat.icon }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 角色切换弹窗 -->
		<view class="role-modal" v-if="showRoleModal" @click="hideRoleSwitch">
			<view class="role-content" @click.stop>
				<view class="role-title">选择身份</view>
				<view class="role-list">
					<view class="role-item" :class="{ active: userInfo.role === 'teacher' }"
						@click="switchRole('teacher')">
						<text class="role-icon">👨‍🏫</text>
						<text class="role-name">教师</text>
						<text class="role-desc">管理学生和课程</text>
					</view>
					<view class="role-item" :class="{ active: userInfo.role === 'student' }"
						@click="switchRole('student')">
						<text class="role-icon">👨‍🎓</text>
						<text class="role-name">学生</text>
						<text class="role-desc">学习和完成作业</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 功能菜单 -->
		<view class="menu-section">
			<text class="menu-title">快捷功能</text>
			<view class="menu-grid">
				<view class="menu-item" v-for="(menu, index) in menuList" :key="index" @click="navigateTo(menu.path)">
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
				<view class="activity-item" v-for="(activity, index) in activityList" :key="index">
					<view class="activity-time">
						<text class="time-day">{{ activity.day }}</text>
						<text class="time-month">{{ activity.month }}</text>
					</view>
					<view class="activity-content">
						<text class="activity-title-text">{{ activity.title }}</text>
						<text class="activity-desc">{{ activity.desc }}</text>
						<text class="activity-status"
							:class="'status-' + activity.status">{{ activity.statusText }}</text>
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
	import { ref, computed, onMounted } from 'vue'

	// 接口定义
	interface UserInfo {
		id : string
		name : string
		phone : string
		avatar : string
		role : 'teacher' | 'student'
	}

	interface StatData {
		label : string
		value : number
		icon : string
	}

	interface MenuItem {
		name : string
		desc : string
		icon : string
		color : string
		path : string
	}

	interface Activity {
		day : string
		month : string
		title : string
		desc : string
		status : string
		statusText : string
	}

	// 响应式数据
	const showRoleModal = ref(false)
	const userInfo = ref<UserInfo>({
		id: '1',
		name: '张同学',
		phone: '138****1234',
		avatar: '',
		role: 'student'
	})

	const statsData = ref<StatData[]>([
		{ label: '今日课程', value: 3, icon: '📚' },
		{ label: '待完成', value: 2, icon: '📝' },
		{ label: '本周课时', value: 12, icon: '⏰' }
	])

	const activityList = ref<Activity[]>([
		{
			day: '25',
			month: '7月',
			title: '数学一对一课程',
			desc: '今天 14:00-15:30',
			status: 'ongoing',
			statusText: '进行中'
		},
		{
			day: '24',
			month: '7月',
			title: '英语作业提交',
			desc: '昨天已完成',
			status: 'completed',
			statusText: '已完成'
		},
		{
			day: '26',
			month: '7月',
			title: '物理实验课',
			desc: '明天 10:00-11:30',
			status: 'booked',
			statusText: '已预约'
		}
	])

	// 计算属性
	const greetingText = computed(() => {
		const hour = new Date().getHours()
		if (hour < 12) return '上午好'
		if (hour < 18) return '下午好'
		return '晚上好'
	})

	const weatherInfo = computed(() => {
		return '今天天气不错，适合学习'
	})

	const menuList = computed<MenuItem[]>(() => {
		if (userInfo.value.role === 'teacher') {
			return [
				{ name: '学生管理', desc: '管理我的学生', icon: '👥', color: '#667eea', path: '/pages/teacher/students' },
				{ name: '课程安排', desc: '安排课程时间', icon: '📅', color: '#f093fb', path: '/pages/teacher/schedule' },
				{ name: '作业批改', desc: '批改学生作业', icon: '📝', color: '#4facfe', path: '/pages/teacher/homework' },
				{ name: '教学资料', desc: '管理教学资源', icon: '📚', color: '#43e97b', path: '/pages/teacher/materials' }
			]
		} else {
			return [
				{ name: '课程预约', desc: '预约一对一课程', icon: '📅', color: '#667eea', path: '/pages/student/booking' },
				{ name: '我的课程', desc: '查看课程安排', icon: '📚', color: '#f093fb', path: '/pages/student/courses' },
				{ name: '作业提交', desc: '完成课后作业', icon: '📝', color: '#4facfe', path: '/pages/student/homework' },
				{ name: '学习记录', desc: '查看学习进度', icon: '📊', color: '#43e97b', path: '/pages/student/records' }
			]
		}
	})

	// 生命周期
	onMounted(() => {
		loadUserInfo()
		loadData()
	})

	// 页面生命周期
	const onLoad = () => {
		loadUserInfo()
		loadData()
	}

	const onShow = () => {
		loadData()
	}

	// 方法
	const loadUserInfo = () => {
		try {
			const savedUserInfo = uni.getStorageSync('userInfo')
			if (savedUserInfo) {
				userInfo.value = savedUserInfo
			}
		} catch (error: any) {
			console.error('加载用户信息失败:', error)
		}
	}

	const loadData = async () => {
		try {
			console.log('加载首页数据')
			// 这里可以调用API加载真实数据
		} catch (error: any) {
			console.error('加载数据失败:', error)
		}
	}

	const showRoleSwitch = () => {
		showRoleModal.value = true
	}

	const hideRoleSwitch = () => {
		showRoleModal.value = false
	}

	const switchRole = (role : 'teacher' | 'student') => {
		userInfo.value.role = role
		userInfo.value.name = role === 'teacher' ? '张老师' : '李同学'

		// 保存到本地存储
		uni.setStorageSync('userInfo', userInfo.value)

		hideRoleSwitch()

		uni.showToast({
			title: `已切换为${role === 'teacher' ? '教师' : '学生'}身份`,
			icon: 'success'
		})
	}

	const navigateTo = (path : string) => {
		if (!path) {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
			return
		}

		// 检查页面是否存在
		const existingPages = [
			'/pages/index/index',
			'/pages/login/login',
			'/pages/profile/profile'
		]

		if (existingPages.includes(path)) {
			uni.navigateTo({ url: path })
		} else {
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		}
	}

	const viewAllActivities = () => {
		uni.showToast({
			title: '功能开发中',
			icon: 'none'
		})
	}

	const showQuickActions = () => {
		uni.showActionSheet({
			itemList: ['新建课程', '快速预约', '添加作业', '查看统计'],
			success: (res) => {
				const actions = ['新建课程', '快速预约', '添加作业', '查看统计']
				uni.showToast({
					title: `${actions[res.tapIndex]}功能开发中`,
					icon: 'none'
				})
			}
		})
	}

	// 暴露给页面生命周期使用
	defineExpose({
		onLoad,
		onShow
	})
</script>

<style lang="scss" scoped>
	.index-container {
		min-height: 100vh;
		background: #f5f6fa;
		padding-bottom: 100px;
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		background: white;

		.top-left {
			display: flex;
			align-items: center;

			.app-logo {
				width: 40px;
				height: 40px;
			}
		}

		.top-right {
			.user-avatar {
				position: relative;
				padding: 5px;
				border-radius: 25px;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
				transition: transform 0.2s;

				&:active {
					transform: scale(0.95);
				}

				.avatar-img {
					width: 42px;
					height: 42px;
					border-radius: 21px;
					border: 2px solid white;
				}

				.avatar-indicator {
					position: absolute;
					bottom: 2px;
					right: 2px;
					width: 12px;
					height: 12px;
					border-radius: 6px;
					background: #4cd964;
					border: 2px solid white;
				}
			}
		}
	}

	.greeting-stats-container {
		margin: 0 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	}

	.greeting-section {
		padding: 20px;
		color: white;

		.greeting-text {
			display: block;
			font-size: 16px;
			margin-bottom: 5px;
		}

		.user-name {
			display: block;
			font-size: 24px;
			font-weight: bold;
			margin-bottom: 10px;
		}

		.weather-info {
			display: block;
			font-size: 14px;
			opacity: 0.8;
		}
	}

	.role-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;

		.role-content {
			background: white;
			border-radius: 16px;
			padding: 30px;
			margin: 0 40px;
			width: calc(100% - 80px);
			max-width: 300px;

			.role-title {
				text-align: center;
				font-size: 18px;
				font-weight: bold;
				color: #333;
				margin-bottom: 20px;
			}

			.role-list {
				.role-item {
					padding: 20px;
					border: 2px solid #f0f0f0;
					border-radius: 12px;
					margin-bottom: 15px;
					text-align: center;
					transition: all 0.3s;

					&.active {
						border-color: #667eea;
						background: #f8f9ff;
					}

					.role-icon {
						display: block;
						font-size: 32px;
						margin-bottom: 10px;
					}

					.role-name {
						display: block;
						font-size: 16px;
						font-weight: bold;
						color: #333;
						margin-bottom: 5px;
					}

					.role-desc {
						display: block;
						font-size: 12px;
						color: #666;
					}
				}
			}
		}
	}

	.stats-section {
		padding: 20px;
		border-top: 1px solid rgba(255, 255, 255, 0.2);

		.stats-title {
			font-size: 16px;
			font-weight: bold;
			color: white;
			margin-bottom: 15px;
		}

		.stats-grid {
			display: flex;
			justify-content: space-between;

			.stat-item {
				text-align: center;
				position: relative;
				flex: 1;

				.stat-number {
					display: block;
					font-size: 24px;
					font-weight: bold;
					color: white;
					margin-bottom: 5px;
				}

				.stat-label {
					display: block;
					font-size: 12px;
					color: rgba(255, 255, 255, 0.8);
				}

				.stat-icon {
					position: absolute;
					top: -5px;
					right: 10px;
					font-size: 20px;
					color: white;
					opacity: 0.3;
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
		bottom: 70px;
		right: 20px;
		z-index: 999;

		.fab-btn {
			width: 40px;
			height: 40px;
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