<template>
    <b-container>
      <b-row>
        <b-col>
          <h1>Import Transactions</h1>
          <b-form @submit.prevent="handleFileUpload">
            <b-form-group label="Select files to import">
              <b-form-file v-model="files" multiple required></b-form-file>
            </b-form-group>
            <b-button type="submit" variant="primary">Import</b-button>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </template>
  
  <script>
  import api from '@/services/api'; // Use default import
  
  export default {
    name: 'ImportTransactions',
    data() {
      return {
        files: null,
      };
    },
    async created() {
      const accountId = this.$route.query.account_id;
      if (!accountId) {
        console.error('Account ID is required');
        this.$router.push('/protected/accounts');
        return;
      }
      this.accountId = accountId;
    },
    methods: {
      async handleFileUpload() {
        const formData = new FormData();
        formData.append('account_id', this.accountId);
        for (let i = 0; i < this.files.length; i++) {
          formData.append('file', this.files[i]);
        }
  
        try {
          await api.importTransactions(formData);
          this.$router.push({ path: '/protected/accounts', query: { account_id: this.accountId } });
        } catch (error) {
          console.error('Error importing transactions:', error);
        }
      }
    }
  };
  </script>
  