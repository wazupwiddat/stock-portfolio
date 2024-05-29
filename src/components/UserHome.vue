<template>
  <b-container>
    <b-row>
      <b-col>
        <h6></h6>
        <b-tabs v-model="activeTabIndex">
          <b-tab v-for="account in accounts" :key="account.ID" :title="account.Name">
            <div v-if="account.detailsLoaded">
              <div class="d-flex justify-content-center align-items-center mt-3">
                <b-card class="text-center" style="width: 50%;">
                  <h3>Total Realized Gain/Loss: {{ formatCurrency(calculateTotalGainLoss(account.closedPositions || [])) }}</h3>
                </b-card>
              </div>
              <div class="mt-3">
                <line-chart :data="prepareChartData(account.closedPositions || [])"></line-chart>
              </div>
              <b-card class="mt-3">
                <b-table :items="account.openPositions || []" :fields="fields" class="mt-3"></b-table>
              </b-card>
            </div>
            <div v-else>
              <b-spinner label="Loading..."></b-spinner>
            </div>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
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
      fields: [
        { key: 'Symbol', label: 'Symbol' },
        { key: 'UnderlyingSymbol', label: 'Underlying Symbol' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'CostBasis', label: 'Cost Basis', formatter: value => this.formatCurrency(value) },
        { key: 'Opened', label: 'Opened' },
        { key: 'GainLoss', label: 'Gain / Loss', formatter: value => this.formatCurrency(value) }
      ]
    };
  },
  async created() {
    await this.fetchAccounts();
    this.fetchAccountDetails(this.activeTabIndex); // Fetch details for the first tab
  },
  watch: {
    activeTabIndex(newIndex) {
      this.fetchAccountDetails(newIndex);
    }
  },
  methods: {
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
        const openPositions = positions.filter(position => position.Opened);

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
              fill: false
            },
            {
              label: 'Premium Collected',
              data: [],
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false
            },
            {
              label: 'Stock Gain/Loss',
              data: [],
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: false
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
            fill: false
          },
          {
            label: 'Premium Collected',
            data: premiumCollectedData,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false
          },
          {
            label: 'Stock Gain/Loss',
            data: stockGainLossData,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false
          }
        ]
      };
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
</style>
