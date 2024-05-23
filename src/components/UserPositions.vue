<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Positions</h1>
        <b-button @click="toggleOpenedFilter" class="mb-3">
          {{ showOpened ? 'Show All Positions' : 'Show Opened Positions' }}
        </b-button>
        <b-table :items="filteredPositions" :fields="fields" class="mt-3"></b-table>
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
        { key: 'CostBasis', label: 'Cost Basis', formatter: (value) => this.$options.filters.currency(value) },
        { key: 'Opened', label: 'Opened' },
        { key: 'GainLoss', label: 'Gain / Loss', formatter: (value) => this.$options.filters.currency(value) }
      ]
    };
  },
  computed: {
    formattedPositions() {
      return this.positions.map(position => {
        return {
          ...position,
          CostBasis: this.$options.filters.currency(position.CostBasis),
          GainLoss: this.$options.filters.currency(position.GainLoss)
        };
      });
    },
    filteredPositions() {
      if (this.showOpened) {
        return this.formattedPositions.filter(position => position.Opened);
      }
      return this.formattedPositions;
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
    }
  }
};
</script>
