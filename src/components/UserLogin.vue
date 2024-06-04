<template>
  <div class="container-sm">
    <div class="login-width">
      <h1 class="text-center">Login</h1>
      <form action="#" @submit.prevent="onSubmit">
        <input
          class="form-control w-100 mb-2"
          type="email"
          placeholder="Email"
          v-model="email"
        />

        <input
          class="form-control w-100 mb-2"
          type="password"
          placeholder="Password"
          v-model="password"
        />

        <button class="btn btn-dark mt-2 w-100" type="submit">Login</button>
        <p class="error-message">{{ error }}</p>
      </form>
      <p>
        Don't have an account? <router-link to="/signup">Sign Up!</router-link>
      </p>
    </div>
  </div>
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
      error: "",
    };
  },
  methods: {
    async onSubmit() {
      try {
        await api.login(this.email, this.password);
        mutations.setLoggedIn(true);
        this.$router.push('/');
        this.email = "";
        this.password = "";
      } catch (error) {
        alert('Login failed');
      }
    },
  },
};
</script>

<style scoped>
form {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  label {
    margin-bottom: 15px;
  }
  
  button {
    margin: 0 auto;
    width: 200px;
  }
  
  .error-message {
    color: red;
  }
  .login-width {
    margin: 100px auto;
    max-width: 400px;
    border: 1px solid black;
    padding: 20px;
    border-radius: 20px;
    -webkit-box-shadow: 0px 0px 15px 5px #a6a6a6;
    box-shadow: 0px 0px 15px 5px #a6a6a6;
  }
  p {
    text-align: center;
  }
  
  h1 {
    padding-bottom: 20px;
  }
</style>
