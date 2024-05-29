<template>
  <b-container class="d-flex justify-content-center align-items-center vh-100">
    <b-row>
      <b-col>
        <b-card class="login-card">
          <b-form @submit.prevent="onSubmit">
            <b-form-group label="Email">
              <b-form-input v-model="email" type="email" required></b-form-input>
            </b-form-group>
            <b-form-group label="Password">
              <b-form-input v-model="password" type="password" required></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Login</b-button>
          </b-form>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from '@/services/api';
import { mutations } from '@/state';

export default {
  name: 'UserLogin',
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    async onSubmit() {
      try {
        await api.login(this.email, this.password);
        mutations.setLoggedIn(true);
        this.$router.push('/');
      } catch (error) {
        alert('Login failed');
      }
    },
  },
};
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
