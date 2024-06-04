<template>
  <div id="app">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand href="#">
        <img src="@/assets/logo.png" alt="OptiCycle Logo" class="logo"> OptiCycle
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/" tag="router-link">Home</b-nav-item>
          <b-nav-item v-if="!isLoggedIn" to="/login" tag="router-link">Login</b-nav-item>
          <b-nav-item v-if="isLoggedIn" @click="logout">Logout</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <router-view></router-view>
  </div>
</template>

<script>
import { state, mutations } from '@/state';

export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return state.isLoggedIn;
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      mutations.setLoggedIn(false);
      this.$router.push('/login');
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.logo {
  height: 30px;
  margin-right: 10px;
}
</style>
