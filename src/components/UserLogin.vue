<template>
  <b-container>
    <b-row>
      <b-col>
        <b-form @submit.prevent="onSubmit">
          <b-form-group label="Email">
            <b-form-input v-model="email" type="email" required></b-form-input>
          </b-form-group>
          <b-form-group label="Password">
            <b-form-input v-model="password" type="password" required></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">Login</b-button>
        </b-form>
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
        this.$router.push('/protected/accounts');
      } catch (error) {
        alert('Login failed');
      }
    },
  },
};
</script>
