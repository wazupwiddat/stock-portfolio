import Vue from 'vue';

export const state = Vue.observable({
  isLoggedIn: !!localStorage.getItem('token')
});

export const mutations = {
  setLoggedIn(status) {
    state.isLoggedIn = status;
  }
};
