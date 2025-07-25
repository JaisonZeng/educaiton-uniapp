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
				<image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
				<text class="app-name">教育培训管理</text>
				<text class="app-desc">专业的一对一教学管理平台</text>
			</view>

			<!-- 角色选择 -->
			<view class="role-section">
				<text class="section-title">选择身份</text>
				<view class="role-tabs">
					<view class="role-tab" :class="{ active: loginForm.role === 'teacher' }"
						@click="selectRole('teacher')">
						<text class="role-icon">👨‍🏫</text>
						<text class="role-text">教师</text>
					</view>
					<view class="role-tab" :class="{ active: loginForm.role === 'student' }"
						@click="selectRole('student')">
						<text class="role-icon">👨‍🎓</text>
						<text class="role-text">学生</text>
					</view>
				</view>
			</view>

			<!-- 登录表单 -->
			<view class="form-section">
				<view class="form-item">
					<view class="form-label">
						<text class="label-icon">📱</text>
						<text>手机号</text>
					</view>
					<input class="form-input" type="number" placeholder="请输入手机号" v-model="loginForm.phone"
						maxlength="11" />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text class="label-icon">🔒</text>
						<text>密码</text>
					</view>
					<input class="form-input" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码"
						v-model="loginForm.password" />
					<view class="password-toggle" @click="togglePassword">
						<text class="toggle-icon">{{ showPassword ? "🙈" : "👁️" }}</text>
					</view>
				</view>

				<!-- 记住密码 -->
				<view class="form-options">
					<view class="remember-password" @click="toggleRemember">
						<view class="checkbox" :class="{ checked: rememberPassword }">
							<text v-if="rememberPassword">✓</text>
						</view>
						<text class="remember-text">记住密码</text>
					</view>
					<text class="forgot-password" @click="forgotPassword">忘记密码？</text>
				</view>
			</view>

			<!-- 登录按钮 -->
			<view class="button-section">
				<button class="login-btn" :class="{ disabled: !canSubmit }" :disabled="!canSubmit" @click="handleLogin">
					{{ loading ? "登录中..." : "登录" }}
				</button>

				<view class="register-section">
					<text class="register-text">还没有账号？</text>
					<text class="register-link" @click="goRegister">立即注册</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapActions
	} from "vuex";
	import {
		api
	} from "@/utils/request";

	export default {
		name: "Login",
		data() {
			return {
				statusBarHeight: 0,
				showPassword: false,
				rememberPassword: false,
				loading: false,
				loginForm: {
					phone: "",
					password: "",
					role: "student", // 默认学生身份
				},
			};
		},
		computed: {
			canSubmit() {
				return (
					this.loginForm.phone.length === 11 &&
					this.loginForm.password.length >= 6 &&
					!this.loading
				);
			},
		},
		onLoad() {
			// 获取系统信息
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;

			// 检查是否记住了密码
			this.loadRememberedPassword();
		},
		methods: {
			...mapActions("user", ["login"]),

			// 选择角色
			selectRole(role) {
				this.loginForm.role = role;
			},

			// 切换密码显示
			togglePassword() {
				this.showPassword = !this.showPassword;
			},

			// 切换记住密码
			toggleRemember() {
				this.rememberPassword = !this.rememberPassword;
			},

			// 加载记住的密码
			loadRememberedPassword() {
				const savedAccount = uni.getStorageSync("savedAccount");
				if (savedAccount) {
					this.loginForm.phone = savedAccount.phone;
					this.loginForm.password = savedAccount.password;
					this.loginForm.role = savedAccount.role;
					this.rememberPassword = true;
				}
			},

			// 保存账号密码
			saveAccount() {
				if (this.rememberPassword) {
					uni.setStorageSync("savedAccount", {
						phone: this.loginForm.phone,
						password: this.loginForm.password,
						role: this.loginForm.role,
					});
				} else {
					uni.removeStorageSync("savedAccount");
				}
			},

			// 处理登录
			async handleLogin() {
				if (!this.canSubmit) return;

				// 简单验证
				if (!/^1[3-9]\d{9}$/.test(this.loginForm.phone)) {
					uni.showToast({
						title: "请输入正确的手机号",
						icon: "none",
					});
					return;
				}

				this.loading = true;

				try {
					// 调用登录API
					const response = await api.login(this.loginForm);

					// 保存登录信息到Vuex
					await this.login({
						userInfo: response.data.userInfo,
						token: response.data.token,
					});

					// 保存账号密码（如果选择记住）
					this.saveAccount();

					uni.showToast({
						title: "登录成功",
						icon: "success",
					});

					// 跳转到首页
					setTimeout(() => {
						uni.switchTab({
							url: "/pages/index/index",
						});
					}, 1500);
				} catch (error: any) {
					console.error("登录失败:", error);
					// 这里可以根据具体错误类型显示不同提示
					uni.showToast({
						title: (error && error.message) ? error.message : "登录失败，请检查账号密码",
						icon: "none",
					});
				} finally {
					this.loading = false;
				}
			},

			// 忘记密码
			forgotPassword() {
				uni.showToast({
					title: "请联系管理员重置密码",
					icon: "none",
				});
			},

			// 去注册
			goRegister() {
				uni.showToast({
					title: "请联系管理员开通账号",
					icon: "none",
				});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.login-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		position: relative;
	}

	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);

		.navbar-content {
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: center;

			.navbar-title {
				color: white;
				font-size: 18px;
				font-weight: bold;
			}
		}
	}

	.login-content {
		padding: 120px 30px 30px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.logo-section {
		text-align: center;
		margin-bottom: 40px;

		.logo {
			width: 80px;
			height: 80px;
			margin-bottom: 15px;
			border-radius: 16px;
		}

		.app-name {
			display: block;
			color: white;
			font-size: 24px;
			font-weight: bold;
			margin-bottom: 8px;
		}

		.app-desc {
			display: block;
			color: rgba(255, 255, 255, 0.8);
			font-size: 14px;
		}
	}

	.role-section {
		margin-bottom: 30px;

		.section-title {
			display: block;
			color: white;
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 15px;
		}

		.role-tabs {
			display: flex;
			gap: 15px;

			.role-tab {
				flex: 1;
				background: rgba(255, 255, 255, 0.1);
				border: 2px solid rgba(255, 255, 255, 0.2);
				border-radius: 12px;
				padding: 20px;
				text-align: center;
				transition: all 0.3s;

				&.active {
					background: rgba(255, 255, 255, 0.9);
					border-color: rgba(255, 255, 255, 0.9);

					.role-text {
						color: #667eea;
					}
				}

				.role-icon {
					display: block;
					font-size: 32px;
					margin-bottom: 8px;
				}

				.role-text {
					display: block;
					color: white;
					font-size: 16px;
					font-weight: bold;
				}
			}
		}
	}

	.form-section {
		margin-bottom: 30px;

		.form-item {
			background: rgba(255, 255, 255, 0.9);
			border-radius: 12px;
			margin-bottom: 15px;
			position: relative;

			.form-label {
				display: flex;
				align-items: center;
				padding: 15px 20px 8px;
				font-size: 14px;
				font-weight: bold;
				color: #333;

				.label-icon {
					margin-right: 8px;
					font-size: 16px;
				}
			}

			.form-input {
				width: 100%;
				padding: 0 20px 15px;
				font-size: 16px;
				color: #333;
				border: none;
				background: transparent;

				&::placeholder {
					color: #999;
				}
			}

			.password-toggle {
				position: absolute;
				right: 20px;
				top: 50%;
				transform: translateY(-50%);

				.toggle-icon {
					font-size: 18px;
					color: #666;
				}
			}
		}

		.form-options {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 10px;

			.remember-password {
				display: flex;
				align-items: center;

				.checkbox {
					width: 18px;
					height: 18px;
					border: 2px solid rgba(255, 255, 255, 0.6);
					border-radius: 4px;
					margin-right: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: transparent;

					&.checked {
						background: white;
						border-color: white;
						color: #667eea;
						font-weight: bold;
					}
				}

				.remember-text {
					color: rgba(255, 255, 255, 0.9);
					font-size: 14px;
				}
			}

			.forgot-password {
				color: rgba(255, 255, 255, 0.9);
				font-size: 14px;
			}
		}
	}

	.button-section {
		margin-top: auto;

		.login-btn {
			width: 100%;
			height: 50px;
			background: white;
			color: #667eea;
			border: none;
			border-radius: 25px;
			font-size: 18px;
			font-weight: bold;
			margin-bottom: 20px;

			&.disabled {
				background: rgba(255, 255, 255, 0.5);
				color: rgba(102, 126, 234, 0.5);
			}
		}

		.register-section {
			text-align: center;

			.register-text {
				color: rgba(255, 255, 255, 0.8);
				font-size: 14px;
			}

			.register-link {
				color: white;
				font-size: 14px;
				font-weight: bold;
				margin-left: 5px;
			}
		}
	}
</style>