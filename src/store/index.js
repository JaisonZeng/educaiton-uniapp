import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'



const store = new Vuex.Store({
	state: {
		loading: false
	},
	mutations: {
		SET_LOADING(state, loading) {
			state.loading = loading
		}
	},
	actions: {
		setLoading({
			commit
		}, loading) {
			commit('SET_LOADING', loading)
		}
	},
	modules: {
		user
	}
})

export default store