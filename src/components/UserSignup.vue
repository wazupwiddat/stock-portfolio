<template>
  <div class="container">
    <div class="signup-width">
      <h1 class="text-center">Sign Up!</h1>
      <form action="#" @submit.prevent="onSubmit">
        <input
          class="form-control w-100 mb-2"
          type="email"
          placeholder="Email"
          v-model="email"
          required
        />
        <input
          class="form-control w-100 mb-2"
          type="password"
          placeholder="Password"
          v-model="password"
          required
        />
        <input
          class="form-control w-100 mb-2"
          type="password"
          placeholder="Confirm Password"
          v-model="passwordconf"
          required
        />

        <button 
          class="btn btn-dark mt-2 w-100" 
          type="submit"
          :disabled="!passwordsMatch"
        >Sign Up!</button>
        <p>{{ message }}</p>
      </form>

      <p>Already a user? <router-link to="/login">Login</router-link></p>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'UserSignup',
  data() {
    return {
      email: '',
      password: '',
      passwordconf: '',
      message: '',
    };
  },
  computed: {
    passwordsMatch() {
      return this.password && this.passwordconf && this.password === this.passwordconf;
    },
  },
  methods: {
    async onSubmit() {
      if (!this.passwordsMatch) {
        this.message = 'Passwords do not match';
        return;
      }
      try {
        const response = await api.signup(this.email, this.password);
        if (response.status === 409) {
          this.message = 'Email already in use';
          return;
        }
        this.$router.push('/login');
      } catch (error) {
        this.message = 'Signup failed';
      }
    },
  },
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 15px;
}

button {
  margin: 0 auto;
  width: 200px;
}
.signup-width {
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
