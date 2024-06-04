<template>
  <b-container>
    <b-row>
      <b-col>
        <div v-if="accounts.length === 0" class="text-center mt-5">
          <b-button variant="primary" @click="showCreateAccountModal">Create Account</b-button>
        </div>
        <div v-if="accounts.length > 0">
          <div class="text-right mb-2">
            <b-button size="sm" variant="primary" @click="showCreateAccountModal">Create Account</b-button>
          </div>
          <b-tabs v-model="activeTabIndex" @input="handleTabChange">
            <b-tab v-for="account in accounts" :key="account.ID" :title="account.Name">
              <div>
                <b-navbar toggleable="lg" type="light" variant="light">
                  <b-navbar-toggle target="nav-tabs-collapse"></b-navbar-toggle>
                  <b-collapse id="nav-tabs-collapse" is-nav>
                    <b-navbar-nav>
                      <b-nav-item :to="`/protected/positions?account_id=${account.ID}`" tag="router-link">Positions</b-nav-item>
                      <b-nav-item :to="`/protected/transactions?account_id=${account.ID}`" tag="router-link">Transactions</b-nav-item>
                    </b-navbar-nav>
                  </b-collapse>
                </b-navbar>
                <div v-if="account.detailsLoaded">
                  <div class="d-flex justify-content-center align-items-center mt-3">
                    <b-card class="text-center" style="width: 50%;">
                      <h3>Total Realized Gain/Loss: {{ formatCurrency(calculateTotalGainLoss(account.closedPositions || [])) }}</h3>
                    </b-card>
                  </div>
                  <div class="mt-3">
                    <line-chart :data="prepareChartData(account.closedPositions || [])" :options="chartOptions" :showSecondaryYAxis="false"></line-chart>
                  </div>
                  <b-card class="mt-3">
                    <b-table :items="account.openPositions || []" :fields="fields" class="mt-3"></b-table>
                  </b-card>
                  <div class="text-center mt-3">
                    <b-button variant="danger" @click="confirmDeleteAccount(account)">Delete Account</b-button>
                  </div>
                </div>
                <div v-else>
                  <b-spinner label="Loading..."></b-spinner>
                </div>
              </div>
            </b-tab>
          </b-tabs>
        </div>
      </b-col>
    </b-row>

    <!-- Create Account Modal -->
    <b-modal id="create-account-modal" ref="createAccountModal" title="Create Account" @ok="createAccount">
      <b-form @submit.stop.prevent="createAccount">
        <b-form-group label="Account Name">
          <b-form-input v-model="newAccountName" required></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>

    <!-- Confirm Delete Account Modal -->
    <b-modal id="confirm-delete-account-modal" ref="confirmDeleteAccountModal" title="Delete Account" @ok="deleteAccount">
      <p>Are you sure you want to delete this account?</p>
    </b-modal>
  </b-container>
</template>

<script>
import api from '@/services/api';
import LineChart from '@/components/LineChart.vue';

export default {
  name: 'UserHome',
  components: {
    LineChart
  },
  data() {
    return {
      accounts: [],
      activeTabIndex: 0,
      newAccountName: '',
      accountToDelete: null,
      fields: [
        { key: 'Symbol', label: 'Symbol' },
        { key: 'UnderlyingSymbol', label: 'Underlying Symbol' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'CostBasis', label: 'Cost Basis', formatter: value => this.formatCurrency(value) },
        { key: 'currentPrice', label: 'Current Price', formatter: value => this.formatCurrency(value) },
        { key: 'unrealizedGainLoss', label: 'Unrealized Gain/Loss', formatter: value => this.formatCurrency(value) }
      ],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              id: 'y-axis-1',
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    };
  },
  async created() {
    await this.loadAccounts();
  },
  methods: {
    async loadAccounts() {
      await this.fetchAccounts();
      if (this.accounts.length > 0) {
        this.fetchAccountDetails(0); // Fetch details for the first tab if there are accounts
      }
    },
    async fetchAccounts() {
      try {
        const response = await api.getAccounts();
        this.accounts = response.map(account => ({
          ...account,
          closedPositions: [],
          openPositions: [],
          detailsLoaded: false // Track if details have been loaded
        }));
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    },
    async fetchAccountDetails(accountIndex) {
      if (!this.accounts || !this.accounts[accountIndex]) {
        return;
      }

      const account = this.accounts[accountIndex];

      if (account.detailsLoaded) {
        // Details already loaded, short-circuit the function
        return;
      }

      try {
        const positions = await api.getPositions(account.ID);

        const closedPositions = positions.filter(position => !position.Opened);
        const openPositions = await Promise.all(positions.filter(position => position.Opened).map(async position => {
          let currentPrice = null;

          // Fetch current price only for stocks, not options
          if (position.Symbol === position.UnderlyingSymbol) {
            currentPrice = await this.fetchCurrentPrice(position.Symbol);
          }

          const unrealizedGainLoss = this.calculateUnrealizedGainLoss(position, currentPrice);

          return {
            ...position,
            currentPrice,
            unrealizedGainLoss
          };
        }));

        this.$set(this.accounts, accountIndex, {
          ...account,
          Positions: positions,
          closedPositions,
          openPositions,
          detailsLoaded: true // Mark details as loaded
        });
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    },
    async fetchCurrentPrice(symbol) {
      try {
        const response = await api.getCurrentPrice(symbol);
        return response.currentPrice;
      } catch (error) {
        console.error('Error fetching current price:', error);
        return null;
      }
    },
    calculateUnrealizedGainLoss(position, currentPrice) {
      const costBasis = position.CostBasis;
      const quantity = position.Quantity;
      let unrealizedGainLoss = (currentPrice - costBasis) * quantity;

      // Check if the position is an option
      if (position.Symbol !== position.UnderlyingSymbol) {
        unrealizedGainLoss *= 100;
      }

      return unrealizedGainLoss;
    },
    calculateTotalGainLoss(positions) {
      return positions.reduce((total, position) => total + parseFloat(position.GainLoss), 0);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    },
    prepareChartData(positions) {
      if (positions.length === 0) {
        return {
          labels: [],
          datasets: [
            {
              label: 'Cumulative Gain/Loss',
              data: [],
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y-axis-1'
            },
            {
              label: 'Premium Collected',
              data: [],
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y-axis-1'
            },
            {
              label: 'Stock Gain/Loss',
              data: [],
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y-axis-1'
            }
          ]
        };
      }

      // Sort positions by the date of the first transaction in ascending order
      const sortedPositions = [...positions].sort((a, b) => new Date(a.Transactions[0]?.Date) - new Date(b.Transactions[0]?.Date));

      // Determine the first and last transaction dates
      const firstDate = new Date(sortedPositions[0].Transactions[0]?.Date);
      const lastDate = new Date(sortedPositions[sortedPositions.length - 1].Transactions[0]?.Date);

      // Generate labels for each month-end between the first and last date
      const labels = [];
      let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

      while (currentDate <= lastDate) {
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        labels.push(endOfMonth.toISOString().split('T')[0]);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Calculate cumulative gains/losses up to each month-end
      const cumulativeGainLossData = [];
      const premiumCollectedData = [];
      const stockGainLossData = [];
      let cumulativeGainLoss = 0;
      let cumulativePremium = 0;
      let cumulativeStockGainLoss = 0;
      let previousEndDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

      labels.forEach((label) => {
        const labelDate = new Date(label);
        const startDate = new Date(previousEndDate);
        previousEndDate = labelDate;

        const monthlyGainLoss = sortedPositions.reduce((total, position) => {
          const firstTransactionDate = new Date(position.Transactions[0].Date);
          const strippedTransactionDate = new Date(firstTransactionDate.getFullYear(), firstTransactionDate.getMonth(), firstTransactionDate.getDate());

          if (strippedTransactionDate >= startDate && strippedTransactionDate <= labelDate) {
            return total + (position.GainLoss ? parseFloat(position.GainLoss) : 0);
          }

          return total;
        }, 0);

        const monthlyPremium = sortedPositions.reduce((total, position) => {
          const firstTransactionDate = new Date(position.Transactions[0].Date);
          const strippedTransactionDate = new Date(firstTransactionDate.getFullYear(), firstTransactionDate.getMonth(), firstTransactionDate.getDate());

          if (strippedTransactionDate >= startDate && strippedTransactionDate <= labelDate && position.Symbol !== position.UnderlyingSymbol && position.Transactions[0].Quantity < 0) {
            return total + (position.GainLoss ? parseFloat(position.GainLoss) : 0);
          }

          return total;
        }, 0);

        const monthlyStockGainLoss = sortedPositions.reduce((total, position) => {
          const firstTransactionDate = new Date(position.Transactions[0].Date);
          const strippedTransactionDate = new Date(firstTransactionDate.getFullYear(), firstTransactionDate.getMonth(), firstTransactionDate.getDate());

          if (strippedTransactionDate >= startDate && strippedTransactionDate <= labelDate && position.Symbol === position.UnderlyingSymbol) {
            return total + (position.GainLoss ? parseFloat(position.GainLoss) : 0);
          }

          return total;
        }, 0);

        cumulativeGainLoss += monthlyGainLoss;
        cumulativePremium += monthlyPremium;
        cumulativeStockGainLoss += monthlyStockGainLoss;

        cumulativeGainLossData.push(cumulativeGainLoss);
        premiumCollectedData.push(cumulativePremium);
        stockGainLossData.push(cumulativeStockGainLoss);
      });

      return {
        labels,
        datasets: [
          {
            label: 'Cumulative Gain/Loss',
            data: cumulativeGainLossData,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Premium Collected',
            data: premiumCollectedData,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Stock Gain/Loss',
            data: stockGainLossData,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-1'
          }
        ]
      };
    },
    handleTabChange(newIndex) {
      if (newIndex >= 0 && newIndex < this.accounts.length) {
        this.fetchAccountDetails(newIndex);
      }
    },
    showCreateAccountModal() {
      this.$refs.createAccountModal.show();
    },
    async createAccount() {
      try {
        const newAccount = {
          Name: this.newAccountName
        };
        await api.createAccount(newAccount);
        this.newAccountName = '';
        this.$refs.createAccountModal.hide();
        this.activeTabIndex = 0;
        await this.loadAccounts();
      } catch (error) {
        console.error('Error creating account:', error);
      }
    },
    confirmDeleteAccount(account) {
      this.accountToDelete = account;
      this.$refs.confirmDeleteAccountModal.show();
    },
    async deleteAccount() {
      try {
        await api.deleteAccount(this.accountToDelete.ID);
        this.accounts = this.accounts.filter(account => account.ID !== this.accountToDelete.ID);
        this.$refs.confirmDeleteAccountModal.hide();
        this.accountToDelete = null;
        if (this.activeTabIndex >= this.accounts.length) {
          this.activeTabIndex = this.accounts.length - 2;
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
}
.text-danger {
  color: red !important;
}
.ml-auto {
  margin-left: auto !important;
}
</style>
