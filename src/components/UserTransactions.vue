<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Transactions</h1>
        <b-button @click="showCreateTransactionModal" variant="primary">Create Transaction</b-button>
        <b-button @click="goToImportPage" variant="secondary" class="ml-2">Import Transactions</b-button>
        <b-table :items="formattedTransactions" :fields="fields" class="mt-3"></b-table>
        <b-pagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :total-rows="totalTransactions"
          :per-page="pageSize"
          @change="fetchTransactions"
          class="mt-3"
        ></b-pagination>
      </b-col>
    </b-row>
    <b-modal id="create-transaction-modal" ref="createTransactionModal" title="Create Transaction" @ok="createTransaction">
      <b-form @submit.prevent="createTransaction">
        <b-form-group label="Date">
          <b-form-input v-model="newTransaction.date" type="date" required></b-form-input>
        </b-form-group>
        <b-form-group label="Action">
          <b-form-input v-model="newTransaction.action" required></b-form-input>
        </b-form-group>
        <b-form-group label="Symbol">
          <b-form-input v-model="newTransaction.symbol" required></b-form-input>
        </b-form-group>
        <b-form-group label="Description">
          <b-form-input v-model="newTransaction.description" required></b-form-input>
        </b-form-group>
        <b-form-group label="Quantity">
          <b-form-input v-model="newTransaction.quantity" type="number" required></b-form-input>
        </b-form-group>
        <b-form-group label="Price">
          <b-form-input v-model="newTransaction.price" type="number" step="0.01" required></b-form-input>
        </b-form-group>
        <b-form-group label="Fees/Commission">
          <b-form-input v-model="newTransaction.fees_comm" type="number" step="0.01" required></b-form-input>
        </b-form-group>
        <b-form-group label="Amount">
          <b-form-input v-model="newTransaction.amount" type="number" step="0.01" required></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>
  </b-container>
</template>

<script>
import api from '@/services/api'; // Use default import

export default {
  name: 'UserTransactions',
  data() {
    return {
      transactions: [],
      newTransaction: {
        date: '',
        action: '',
        symbol: '',
        description: '',
        quantity: '',
        price: '',
        fees_comm: '',
        amount: '',
        account_id: ''
      },
      fields: [
        { key: 'ID', label: 'ID' },
        { key: 'Date', label: 'Date' },
        { key: 'Action', label: 'Action' },
        { key: 'Symbol', label: 'Symbol' },
        { key: 'Description', label: 'Description' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'Price', label: 'Price', formatter: (value) => this.$options.filters.currency(value) },
        { key: 'FeesComm', label: 'Fees/Commission', formatter: (value) => this.$options.filters.currency(value) },
        { key: 'Amount', label: 'Amount', formatter: (value) => this.$options.filters.currency(value) },
      ],
      currentPage: 1,
      pageSize: 10,
      totalTransactions: 0
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalTransactions / this.pageSize);
    },
    formattedTransactions() {
      return this.transactions.map(transaction => {
        return {
          ...transaction,
          Price: this.$options.filters.currency(transaction.Price),
          FeesComm: this.$options.filters.currency(transaction.FeesComm),
          Amount: this.$options.filters.currency(transaction.Amount)
        };
      });
    }
  },
  async created() {
    const accountId = this.$route.query.account_id;
    if (!accountId) {
      console.error('Account ID is required');
      this.$router.push('/protected/accounts');
      return;
    }
    this.newTransaction.account_id = accountId;
    await this.fetchTransactions();
  },
  methods: {
    async fetchTransactions() {
      try {
        const accountId = this.newTransaction.account_id;
        const response = await api.getTransactions(accountId, this.currentPage, this.pageSize);
        this.transactions = response.transactions;
        this.totalTransactions = response.total;
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    },
    showCreateTransactionModal() {
      this.$refs.createTransactionModal.show();
    },
    async createTransaction() {
      try {
        await api.createTransaction({ ...this.newTransaction, account_id: parseInt(this.newTransaction.account_id, 10) });
        await this.fetchTransactions();
        this.newTransaction = {
          date: '',
          action: '',
          symbol: '',
          description: '',
          quantity: '',
          price: '',
          fees_comm: '',
          amount: '',
          account_id: this.newTransaction.account_id
        };
        this.$refs.createTransactionModal.hide();
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    },
    goToImportPage() {
      this.$router.push({ path: '/protected/transactions/import', query: { account_id: this.newTransaction.account_id } });
    }
  }
};
</script>
