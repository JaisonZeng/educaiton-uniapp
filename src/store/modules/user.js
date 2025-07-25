const state = {
	userInfo: {
		id: '',
		name: '',
		phone: '',
		avatar: '',
		role: 'student' // teacher 或 student
	},
	isLogin: false,
	token: ''
}

const mutations = {
	SET_USER_INFO(state, userInfo) {
		state.userInfo = {
			...state.userInfo,
			...userInfo
		}
	},
	SET_LOGIN_STATUS(state, status) {
		state.isLogin = status
	},
	SET_TOKEN(state, token) {
		state.token = token
	},
	CLEAR_USER_DATA(state) {
		state.userInfo = {
			id: '',
			name: '',
			phone: '',
			avatar: '',
			role: 'student'
		}
		state.isLogin = false
		state.token = ''
	}
}

const actions = {
	// 登录
	async login({
		commit
	}, loginData) {
		try {
			// 模拟登录API调用
			console.log('登录数据:', loginData)

			// 模拟成功响应
			const response = {
				success: true,
				data: {
					token: 'mock_token_' + Date.now(),
					userInfo: {
						id: '1',
						name: loginData.role === 'teacher' ? '张老师' : '李同学',
						phone: loginData.username,
						avatar: '',
						role: loginData.role
					}
				}
			}

			if (response.success) {
				// 保存用户信息
				commit('SET_USER_INFO', response.data.userInfo)
				commit('SET_TOKEN', response.data.token)
				commit('SET_LOGIN_STATUS', true)

				// 保存到本地存储
				uni.setStorageSync('token', response.data.token)
				uni.setStorageSync('userInfo', response.data.userInfo)

				return {
					success: true
				}
			} else {
				return {
					success: false,
					message: '登录失败'
				}
			}
		} catch (error) {
			console.error('登录错误:', error)
			return {
				success: false,
				message: '网络错误'
			}
		}
	},

	// 退出登录
	logout({
		commit
	}) {
		commit('CLEAR_USER_DATA')
		uni.removeStorageSync('token')
		uni.removeStorageSync('userInfo')
	},

	// 检查登录状态
	checkLogin({
		commit
	}) {
		try {
			const token = uni.getStorageSync('token')
			const userInfo = uni.getStorageSync('userInfo')

			if (token && userInfo) {
				commit('SET_TOKEN', token)
				commit('SET_USER_INFO', userInfo)
				commit('SET_LOGIN_STATUS', true)
				return true
			} else {
				commit('SET_LOGIN_STATUS', false)
				return false
			}
		} catch (error) {
			console.error('检查登录状态错误:', error)
			commit('SET_LOGIN_STATUS', false)
			return false
		}
	}
}

export default {
	namespaced: true,
	state,
	mutations,
	actions
}