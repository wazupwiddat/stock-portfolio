<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Positions</h1>
        <b-button @click="toggleOpenedFilter" class="mb-3">
          {{ showOpened ? 'Show All Positions' : 'Show Opened Positions' }}
        </b-button>
        <div v-for="(group, underlyingSymbol) in groupedPositions" :key="underlyingSymbol" class="mt-3">
          <b-card>
            <h3>{{ underlyingSymbol }}</h3>
            <p>Total Gain/Loss (Closed): {{ formatCurrency(calculateTotalGainLoss(group.closed)) }}</p>
            <b-button v-b-toggle="'collapse-' + underlyingSymbol" variant="link">Toggle Closed Positions</b-button>
            <b-table :items="group.opened" :fields="fields" class="mt-3"></b-table>
          </b-card>
          <b-collapse :id="'collapse-' + underlyingSymbol">
            <b-card>
              <b-table :items="group.closed" :fields="fields" class="mt-3"></b-table>
            </b-card>
          </b-collapse>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from '@/services/api'; // Use default import

export default {
  name: 'UserPositions',
  data() {
    return {
      positions: [],
      showOpened: false, // New data property for toggling
      fields: [
        { key: 'Symbol', label: 'Symbol' },
        { key: 'UnderlyingSymbol', label: 'Underlying Symbol' },
        { key: 'Quantity', label: 'Quantity' },
        { key: 'CostBasis', label: 'Cost Basis', formatter: value => this.formatCurrency(value) },
        { key: 'Opened', label: 'Opened' },
        { key: 'GainLoss', label: 'Gain / Loss', formatter: value => this.formatCurrency(value) }
      ],
      collapseStatus: {} // New data property to track collapse status
    };
  },
  computed: {
    filteredPositions() {
      if (this.showOpened) {
        return this.positions.filter(position => position.Opened);
      }
      return this.positions;
    },
    groupedPositions() {
      return this.filteredPositions.reduce((groups, position) => {
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
    }
  },
  async created() {
    const accountId = this.$route.query.account_id;
    if (!accountId) {
      console.error('Account ID is required');
      this.$router.push('/protected/accounts');
      return;
    }
    await this.fetchPositions(accountId);
  },
  methods: {
    async fetchPositions(accountId) {
      try {
        const response = await api.getPositions(accountId);
        this.positions = response;
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    },
    toggleOpenedFilter() {
      this.showOpened = !this.showOpened;
    },
    toggleCollapse(underlyingSymbol) {
      this.$set(this.collapseStatus, underlyingSymbol, !this.collapseStatus[underlyingSymbol]);
    },
    calculateTotalGainLoss(group) {
      return group.reduce((total, position) => total + parseFloat(position.GainLoss), 0);
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
  }
};
</script>

<style>
/* Optional: Add some custom styling for the cards and collapse sections */
</style>
