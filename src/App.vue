<template>
	<view>
		<!-- 全局加载提示 -->
		<view v-if="loading" class="global-loading">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue'

	// 响应式数据
	const loading = ref(false)

	// 生命周期
	onMounted(() => {
		console.log('App mounted')

		// 获取系统信息
		uni.getSystemInfo({
			success: (res) => {
				console.log('设备信息:', res)
			}
		})
	})

	// App 生命周期
	const onLaunch = () => {
		console.log('App Launch')
	}

	const onShow = () => {
		console.log('App Show')
	}

	const onHide = () => {
		console.log('App Hide')
	}

	// 暴露给模板使用
	defineExpose({
		loading
	})
</script>

<style lang="scss">
	/* 全局样式 */
	* {
		box-sizing: border-box;
	}

	page {
		background-color: #f5f6fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
	}
	
	/* TabBar 样式 */
	.uni-tabbar {
		.uni-tabbar__icon {
			width: 24px !important;
			height: 24px !important;
		}
	}
	
	/* 为底部TabBar预留空间 */
	.page-container {
		padding-bottom: 60px;
	}

	.global-loading {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.8);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;

		.loading-content {
			text-align: center;

			.loading-spinner {
				width: 40px;
				height: 40px;
				border: 3px solid #f3f3f3;
				border-top: 3px solid #667eea;
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin: 0 auto 10px;
			}

			.loading-text {
				font-size: 14px;
				color: #666;
			}
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	/* 通用类 */
	.container {
		padding: 20px;
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		margin-bottom: 15px;
	}

	.btn {
		height: 44px;
		line-height: 44px;
		text-align: center;
		border-radius: 22px;
		font-size: 16px;
		font-weight: bold;

		&.btn-primary {
			background: #667eea;
			color: white;
		}

		&.btn-secondary {
			background: #f8f9fa;
			color: #666;
			border: 1px solid #dee2e6;
		}
	}

	.text-primary {
		color: #667eea;
	}

	.text-center {
		text-align: center;
	}

	.flex {
		display: flex;
	}

	.flex-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.flex-between {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>