import Vue from 'vue';

const user = {
  state: () => ({
    token: localStorage.getItem('token')
      ? JSON.parse(localStorage.getItem('token')).value
      : null
  }),
  getters: {},
  mutations: {
    // 登录
    login(state, loginData) {
      Vue.ls.set('token', loginData.token, 7 * 24 * 60 * 60 * 1000);
      state.token = loginData.token;
    },
    //登出
    loginOut(state) {
      Vue.ls.remove('token');
      state.token = null;
    },
  },
  actions: {
    loginOut({ commit }) {
      commit('loginOut');
    },
  },
};

export default user;
