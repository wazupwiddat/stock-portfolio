<template>
  <b-container>
    <b-row class="mt-3 text-left">
      <b-col>
        <b>Positions for {{ accountName }}</b>
      </b-col>
      <b-col class="text-right">
        <b-button variant="primary" @click="$router.push('/')">Back to Home</b-button>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col>
        <b-form-input
          v-model="searchQuery"
          placeholder="Search for a position..."
          @input="onSearchInput"
        ></b-form-input>
      </b-col>
    </b-row>
    <b-row class="mt-3" v-if="searchQuery && !selectedPosition">
      <b-col>
        <b-list-group>
          <b-list-group-item
            v-for="(position, index) in filteredPositions"
            :key="index"
            @click="selectPosition(position)"
            :active="selectedPosition && position.UnderlyingSymbol === selectedPosition.UnderlyingSymbol"
          >
            {{ position.UnderlyingSymbol }}
          </b-list-group-item>
        </b-list-group>
      </b-col>
    </b-row>
    <b-row class="mt-3" v-if="selectedPosition">
      <b-col>
        <b-card>
          <div>
            <h3>{{ selectedPosition.UnderlyingSymbol }}</h3>
            <p>
              Realized Gain/Loss: {{
                formatCurrency(calculateTotalGainLoss(selectedPosition.closed))
              }}
            </p>
            <div style="position: relative; height: 400px;">
              <line-chart :data="prepareChartData(selectedPosition.closed)" :options="chartOptions" :height="400" :showSecondaryYAxis="true"></line-chart>
            </div>
          </div>
          <b-table :items="selectedPosition.opened" :fields="openFields" class="mt-3"></b-table>
          <b-collapse :id="'collapse-' + selectedPosition.UnderlyingSymbol">
            <b-card>
              <b-table
                :items="selectedPosition.closed"
                :fields="closedFields"
                class="mt-3"
              ></b-table>
            </b-card>
          </b-collapse>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from '@/services/api'; // Use default import
import LineChart from '@/components/LineChart.vue'; // Adjust the import path as necessary

export default {
  name: 'UserPositions',
  components: {
    LineChart
  },
  data() {
    return {
      positions: [],
      accountName: '',
      searchQuery: '',
      selectedPosition: null,
      openFields: [
        { key: 'Symbol', label: 'Symbol' },
        { key: 'UnderlyingSymbol', label: 'Underlying Symbol' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'CostBasis', label: 'Cost Basis', formatter: value => this.formatCurrency(value) },
        { key: 'CurrentPrice', label: 'Current Price', formatter: value => this.formatCurrency(value) },
        { key: 'UnrealizedGainLoss', label: 'Unrealized Gain/Loss', formatter: value => this.formatCurrency(value) }
      ],
      closedFields: [
        { key: 'Symbol', label: 'Symbol' },
        { key: 'UnderlyingSymbol', label: 'Underlying Symbol' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'CostBasis', label: 'Cost Basis', formatter: value => this.formatCurrency(value) },
        { key: 'GainLoss', label: 'Gain / Loss', formatter: value => this.formatCurrency(value) }
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
            },
            {
              id: 'y-axis-2',
              type: 'linear',
              position: 'right',
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                drawOnChartArea: false // only want the grid lines for one axis to show up
              }
            }
          ]
        }
      }
    };
  },
  computed: {
    groupedPositions() {
      return this.positions.reduce((groups, position) => {
        const underlyingSymbol = position.UnderlyingSymbol;
        if (!groups[underlyingSymbol]) {
          groups[underlyingSymbol] = { opened: [], closed: [] };
        }
        if (position.Opened) {
          groups[underlyingSymbol].opened.push(position);
        } else {
          groups[underlyingSymbol].closed.push(position);
        }
        return groups;
      }, {});
    },
    filteredPositions() {
      return Object.keys(this.groupedPositions)
        .filter(key => key.toLowerCase().includes(this.searchQuery.toLowerCase()))
        .map(key => ({
          UnderlyingSymbol: key,
          ...this.groupedPositions[key],
        }));
    }
  },
  async created() {
    const accountId = this.$route.query.account_id;
    if (!accountId) {
      console.error('Account ID is required');
      this.$router.push('/');
      return;
    }
    await this.fetchAccountName(accountId);
    await this.fetchPositions(accountId);
  },
  methods: {
    async fetchPositions(accountId) {
      try {
        const response = await api.getPositions(accountId);
        const positions = await Promise.all(response.map(async position => {
          let currentPrice = null;
          let unrealizedGainLoss = 0;

          if (position.Opened) {
            if (position.Symbol === position.UnderlyingSymbol) {
              currentPrice = await this.fetchCurrentPrice(position.Symbol);
            } else {
              currentPrice = position.CurrentPrice || 0; // Set to 0 or fetch if available
            }
            unrealizedGainLoss = this.calculateUnrealizedGainLoss(position, currentPrice);
          }

          return { ...position, CurrentPrice: currentPrice, UnrealizedGainLoss: unrealizedGainLoss };
        }));
        this.positions = positions;
      } catch (error) {
        console.error('Error fetching positions:', error);
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

      // Adjust for options (typically 100 shares per contract)
      if (position.Symbol !== position.UnderlyingSymbol) {
        unrealizedGainLoss *= 100;
      }

      return unrealizedGainLoss;
    },
    async fetchAccountName(accountId) {
      try {
        const response = await api.getAccount(accountId); // Assuming this API call exists
        this.accountName = response.Name;
      } catch (error) {
        console.error('Error fetching account name:', error);
      }
    },
    async selectPosition(position) {
      let newSelectedPosition = position;
      this.searchQuery = ''; // Clear the search box

      // Fetch historical prices for the selected position
      try {
        const historicalPrices = await api.getHistoricalPrices(position.UnderlyingSymbol);
        newSelectedPosition.historicalPrices = historicalPrices?.map(price => ({
          ...price,
          Date: new Date(price.Date) // Convert to Date object for comparison
        }));
        this.selectedPosition = newSelectedPosition;
      } catch (error) {
        console.error('Error fetching historical prices:', error);
        this.selectedPosition.historicalPrices = [];
      }
    },
    onSearchInput() {
      this.selectedPosition = null; // Hide the selected position when the user starts typing
    },
    calculateTotalGainLoss(group) {
      return group.reduce((total, position) => total + parseFloat(position.GainLoss), 0);
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
            },
            {
              label: 'Historical Prices',
              data: [],
              borderColor: 'rgba(75, 0, 130, 1)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y-axis-2'
            }
          ]
        };
      }

      // Sort positions by the date of the first transaction in ascending order
      const sortedPositions = [...positions].sort((a, b) => new Date(a.OpenDate) - new Date(b.OpenDate));

      // Determine the first and last transaction dates
      const firstDate = new Date(sortedPositions[0].OpenDate);
      const lastDate = new Date(sortedPositions[sortedPositions.length - 1].OpenDate);

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
      const historicalPricesData = [];
      let cumulativeGainLoss = 0;
      let cumulativePremium = 0;
      let cumulativeStockGainLoss = 0;
      let previousEndDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

      labels.forEach((label) => {
        const labelDate = new Date(label);
        const startDate = new Date(previousEndDate);
        previousEndDate = labelDate;

        const monthlyGainLoss = sortedPositions.reduce((total, position) => {
          const firstTransactionDate = new Date(position.OpenDate);
          const strippedTransactionDate = new Date(firstTransactionDate.getFullYear(), firstTransactionDate.getMonth(), firstTransactionDate.getDate());

          if (strippedTransactionDate >= startDate && strippedTransactionDate <= labelDate) {
            return total + (position.GainLoss ? parseFloat(position.GainLoss) : 0);
          }

          return total;
        }, 0);

        const monthlyPremium = sortedPositions.reduce((total, position) => {
          const firstTransactionDate = new Date(position.OpenDate);
          const strippedTransactionDate = new Date(firstTransactionDate.getFullYear(), firstTransactionDate.getMonth(), firstTransactionDate.getDate());

          if (strippedTransactionDate >= startDate && strippedTransactionDate <= labelDate && position.Symbol !== position.UnderlyingSymbol && position.Short) {
            return total + (position.GainLoss ? parseFloat(position.GainLoss) : 0);
          }

          return total;
        }, 0);

        const monthlyStockGainLoss = sortedPositions.reduce((total, position) => {
          const firstTransactionDate = new Date(position.OpenDate);
          const strippedTransactionDate = new Date(firstTransactionDate.getFullYear(), firstTransactionDate.getMonth(), firstTransactionDate.getDate());

          if (strippedTransactionDate >= startDate && strippedTransactionDate <= labelDate && position.Symbol === position.UnderlyingSymbol) {
            return total + (position.GainLoss ? parseFloat(position.GainLoss) : 0);
          }

          return total;
        }, 0);

        const historicalPrice = this.selectedPosition?.historicalPrices?.find(price => {
          const priceDate = new Date(price.Date);
          return priceDate >= startDate && priceDate <= labelDate;
        });
        const historicalClosePrice = historicalPrice ? historicalPrice.Close : null;

        cumulativeGainLoss += monthlyGainLoss;
        cumulativePremium += monthlyPremium;
        cumulativeStockGainLoss += monthlyStockGainLoss;

        cumulativeGainLossData.push(cumulativeGainLoss);
        premiumCollectedData.push(cumulativePremium);
        stockGainLossData.push(cumulativeStockGainLoss);
        historicalPricesData.push(historicalClosePrice);
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
          },
          {
            label: 'Historical Prices',
            data: historicalPricesData,
            borderColor: 'rgba(75, 0, 130, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-2'
          }
        ]
      };
    }
  }
};
</script>

<style>
/* Optional: Add some custom styling for the cards and collapse sections */
</style>
