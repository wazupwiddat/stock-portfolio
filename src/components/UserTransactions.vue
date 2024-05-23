<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Transactions</h1>
        <b-button @click="showCreateTransactionModal" variant="primary">Create Transaction</b-button>
        <b-button @click="goToImportPage" variant="secondary" class="ml-2">Import Transactions</b-button>
        <b-table :items="formattedTransactions" :fields="fields" class="mt-3" selectable>
          <template v-slot:cell(actions)="data">
            <b-button size="sm" @click="showEditTransactionModal(data.item)">Edit</b-button>
            <b-button size="sm" variant="danger" @click="deleteTransaction(data.item.ID)">Delete</b-button>
          </template>
        </b-table>
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

    <!-- Create Transaction Modal -->
    <b-modal id="create-transaction-modal" ref="createTransactionModal" title="Create Transaction" @ok="createTransaction">
      <b-form @submit.prevent="createTransaction">
        <b-form-group label="Date">
          <b-form-input v-model="newTransaction.Date" type="date" required></b-form-input>
        </b-form-group>
        <b-form-group label="Action">
          <b-form-input v-model="newTransaction.Action" required></b-form-input>
        </b-form-group>
        <b-form-group label="Symbol">
          <b-form-input v-model="newTransaction.Symbol" required></b-form-input>
        </b-form-group>
        <b-form-group label="Description">
          <b-form-input v-model="newTransaction.Description" required></b-form-input>
        </b-form-group>
        <b-form-group label="Quantity">
          <b-form-input v-model="newTransaction.Quantity" type="number" required></b-form-input>
        </b-form-group>
        <b-form-group label="Price">
          <b-form-input v-model="newTransaction.Price" required></b-form-input>
        </b-form-group>
        <b-form-group label="Fees/Commission">
          <b-form-input v-model="newTransaction.Fees" type="number" step="0.01" required></b-form-input>
        </b-form-group>
        <b-form-group label="Amount">
          <b-form-input v-model="newTransaction.Amount" required></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Edit Transaction Modal -->
    <b-modal id="edit-transaction-modal" ref="editTransactionModal" title="Edit Transaction" @ok="updateTransaction">
      <b-form @submit.prevent="updateTransaction">
        <b-form-group label="Date">
          <b-form-input v-model="selectedTransaction.Date" type="date" required></b-form-input>
        </b-form-group>
        <b-form-group label="Action">
          <b-form-input v-model="selectedTransaction.Action" required></b-form-input>
        </b-form-group>
        <b-form-group label="Symbol">
          <b-form-input v-model="selectedTransaction.Symbol" required></b-form-input>
        </b-form-group>
        <b-form-group label="Description">
          <b-form-input v-model="selectedTransaction.Description" required></b-form-input>
        </b-form-group>
        <b-form-group label="Quantity">
          <b-form-input v-model="selectedTransaction.Quantity" type="number" required></b-form-input>
        </b-form-group>
        <b-form-group label="Price">
          <b-form-input v-model="selectedTransaction.Price" required></b-form-input>
        </b-form-group>
        <b-form-group label="Fees/Commission">
          <b-form-input v-model="selectedTransaction.Fees" type="number" step="0.01" required></b-form-input>
        </b-form-group>
        <b-form-group label="Amount">
          <b-form-input v-model="selectedTransaction.Amount" required></b-form-input>
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
      selectedTransaction: {
        Date: '',
        Action: '',
        Symbol: '',
        Description: '',
        Quantity: '',
        Price: '',
        Fees: '',
        Amount: '',
        AccountID: ''
      },
      newTransaction: {
        Date: '',
        Action: '',
        Symbol: '',
        Description: '',
        Quantity: '',
        Price: '',
        Fees: '',
        Amount: '',
        AccountID: ''
      },
      fields: [
        { key: 'Date', label: 'Date' },
        { key: 'Action', label: 'Action' },
        { key: 'Symbol', label: 'Symbol' },
        { key: 'Description', label: 'Description' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'Price', label: 'Price' },
        { key: 'Fees', label: 'Fees/Commission', formatter: (value) => this.$options.filters.currency(value) },
        { key: 'Amount', label: 'Amount' },
        { key: 'actions', label: 'Actions' }
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
          Price: typeof transaction.Price === 'string' ? transaction.Price.replace(/[^\d.-]/g, '') : transaction.Price,
          Amount: typeof transaction.Amount === 'string' ? transaction.Amount.replace(/[^\d.-]/g, '') : transaction.Amount,
          Fees: this.$options.filters.currency(transaction.Fees)
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
    this.newTransaction.AccountID = accountId;
    await this.fetchTransactions();
  },
  methods: {
    async fetchTransactions() {
      try {
        const accountId = this.newTransaction.AccountID;
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
        await api.createTransaction({ ...this.newTransaction, AccountID: parseInt(this.newTransaction.AccountID, 10) });
        await this.fetchTransactions();
        this.newTransaction = {
          Date: '',
          Action: '',
          Symbol: '',
          Description: '',
          Quantity: '',
          Price: '',
          Fees: '',
          Amount: '',
          AccountID: this.newTransaction.AccountID
        };
        this.$refs.createTransactionModal.hide();
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    },
    async deleteTransaction(transactionId) {
      try {
        await api.deleteTransaction(transactionId);
        await this.fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    },
    async showEditTransactionModal(transaction) {
      this.selectedTransaction = {
        ...transaction,
        Price: typeof transaction.Price === 'string' ? transaction.Price.replace(/[^\d.-]/g, '') : transaction.Price,
        Amount: typeof transaction.Amount === 'string' ? transaction.Amount.replace(/[^\d.-]/g, '') : transaction.Amount
      };
      await this.$nextTick();
      this.$refs.editTransactionModal.show();
    },
    async updateTransaction() {
      try {
        await api.updateTransaction({ ...this.selectedTransaction, AccountID: parseInt(this.selectedTransaction.AccountID, 10) });
        await this.fetchTransactions();
        this.$refs.editTransactionModal.hide();
        this.resetSelectedTransaction();
      } catch (error) {
        console.error('Error updating transaction:', error);
      }
    },
    resetSelectedTransaction() {
      this.selectedTransaction = {
        Date: '',
        Action: '',
        Symbol: '',
        Description: '',
        Quantity: '',
        Price: '',
        Fees: '',
        Amount: '',
        AccountID: ''
      };
    },
    goToImportPage() {
      this.$router.push({ path: '/protected/transactions/import', query: { account_id: this.newTransaction.AccountID } });
    }
  },
  watch: {
    currentPage() {
      this.fetchTransactions();
    }
  }
};
</script>
