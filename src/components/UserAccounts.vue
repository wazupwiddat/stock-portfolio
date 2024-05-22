<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Accounts</h1>
        <b-button @click="showCreateAccountModal" variant="primary">Create Account</b-button>
        <b-table :items="accounts" :fields="fields" class="mt-3">
          <template #cell(actions)="row">
            <b-button @click="viewTransactions(row.item)" variant="info" size="sm">View Transactions</b-button>
            <b-button @click="viewPositions(row.item)" variant="info" size="sm" class="ml-2">View Positions</b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-modal id="create-account-modal" ref="createAccountModal" title="Create Account" @ok="createAccount">
      <b-form @submit.prevent="createAccount">
        <b-form-group label="Account Name">
          <b-form-input v-model="newAccountName" required></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>
  </b-container>
</template>

<script>
import api from '@/services/api'; // Use default import

export default {
  name: 'UserAccounts',
  data() {
    return {
      accounts: [],
      newAccountName: '',
      fields: [
        { key: 'ID', label: 'ID' },
        { key: 'Name', label: 'Name' },
        { key: 'actions', label: 'Actions' }
      ]
    };
  },
  async created() {
    await this.fetchAccounts();
  },
  methods: {
    async fetchAccounts() {
      try {
        const response = await api.getAccounts();
        this.accounts = response;
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    },
    showCreateAccountModal() {
      this.$refs.createAccountModal.show();
    },
    async createAccount() {
      try {
        await api.createAccount({ name: this.newAccountName });
        await this.fetchAccounts(); // Refresh accounts list
        this.newAccountName = '';
        this.$refs.createAccountModal.hide(); // Close the modal
      } catch (error) {
        console.error('Error creating account:', error);
      }
    },
    viewTransactions(account) {
      this.$router.push(`/protected/transactions?account_id=${account.ID}`);
    },
    viewPositions(account) {
      this.$router.push(`/protected/positions?account_id=${account.ID}`);
    }
  }
};
</script>
