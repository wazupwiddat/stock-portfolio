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
        <hr />
        <h3>Expected File Format</h3>
        <p>The JSON file should be structured as follows:</p>
        <pre class="example">{{ formatExample }}</pre>
        <hr />
        <h3>Allowed Actions and Examples</h3>
        <div v-for="action in actionExamples" :key="action.name" class="action-section">
          <h4>{{ action.name }}</h4>
          <p>{{ action.description }}</p>
          <pre class="example">{{ action.example }}</pre>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from '@/services/api';

export default {
  data() {
    return {
      files: null,
      formatExample: JSON.stringify(
        {
          "BrokerageTransactions": [
            {
              "Date": "MM/DD/YYYY",
              "Action": "Action",
              "Symbol": "Symbol",
              "Description": "Description",
              "Quantity": "Quantity",
              "Price": "Price",
              "Fees & Comm": "Fees & Comm",
              "Amount": "Amount"
            }
          ]
        },
        null,
        2
      ),
      actionExamples: [
        {
          name: "Buy",
          description: "Buying shares of a stock or ETF.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Buy",
              "Symbol": "VGT",
              "Description": "VANGUARD INFORMATION TECHNOLOGY ETF",
              "Quantity": "261",
              "Price": "$382.62",
              "Fees & Comm": "",
              "Amount": "-$99,863.82"
            },
            null,
            2
          )
        },
        {
          name: "Buy to Open",
          description: "Opening a new long options position by buying options contracts.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Buy to Open",
              "Symbol": "QQQ 01/19/2024 250.00 C",
              "Description": "CALL INVESCO QQQ TR $250 EXP 01/19/24",
              "Quantity": "2",
              "Price": "$82.25",
              "Fees & Comm": "$1.32",
              "Amount": "-$16,451.32"
            },
            null,
            2
          )
        },
        {
          name: "Buy to Close",
          description: "Closing a short options position by buying options contracts.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Buy to Close",
              "Symbol": "TSLA 05/05/2023 220.00 C",
              "Description": "CALL TESLA INC $220 EXP 05/05/23",
              "Quantity": "2",
              "Price": "$1.32",
              "Fees & Comm": "$1.32",
              "Amount": "-$265.32"
            },
            null,
            2
          )
        },
        {
          name: "Sell to Open",
          description: "Opening a new short options position by selling options contracts.",
          example: JSON.stringify(
            {
              "Date": "04/17/2023",
              "Action": "Sell to Open",
              "Symbol": "SQ 05/12/2023 70.00 C",
              "Description": "CALL BLOCK INC $70 EXP 05/12/23",
              "Quantity": "10",
              "Price": "$2.04",
              "Fees & Comm": "$6.64",
              "Amount": "$2,033.36"
            },
            null,
            2
          )
        },
        {
          name: "Sell to Close",
          description: "Closing a long options position by selling options contracts.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Sell to Close",
              "Symbol": "AAPL 04/20/2023 150.00 C",
              "Description": "CALL APPLE INC $150 EXP 04/20/23",
              "Quantity": "1",
              "Price": "$0.55",
              "Fees & Comm": "$0.65",
              "Amount": "$54.35"
            },
            null,
            2
          )
        },
        {
          name: "Sell",
          description: "Selling shares of a stock or ETF.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Sell",
              "Symbol": "TSLA",
              "Description": "TESLA INC",
              "Quantity": "100",
              "Price": "$650.00",
              "Fees & Comm": "",
              "Amount": "$65,000.00"
            },
            null,
            2
          )
        },
        {
          name: "Sell Short",
          description: "Selling shares that you do not own, with the intention of buying them back later at a lower price.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Sell Short",
              "Symbol": "AMZN",
              "Description": "AMAZON.COM INC",
              "Quantity": "50",
              "Price": "$3200.00",
              "Fees & Comm": "",
              "Amount": "$160,000.00"
            },
            null,
            2
          )
        },
        {
          name: "Assigned",
          description: "Being assigned shares from a short options position.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Assigned",
              "Symbol": "MSFT",
              "Description": "MICROSOFT CORP",
              "Quantity": "100",
              "Price": "$280.00",
              "Fees & Comm": "",
              "Amount": "$28,000.00"
            },
            null,
            2
          )
        },
        {
          name: "Expired",
          description: "An options contract that has expired worthless.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Expired",
              "Symbol": "NFLX 04/21/2023 300.00 C",
              "Description": "CALL NETFLIX INC $300 EXP 04/21/23",
              "Quantity": "1",
              "Price": "$0.00",
              "Fees & Comm": "",
              "Amount": "$0.00"
            },
            null,
            2
          )
        },
        {
          name: "Options Frwd Split",
          description: "Adjusting options contracts due to a forward stock split.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Options Frwd Split",
              "Symbol": "AAPL 01/20/2023 150.00 C",
              "Description": "CALL APPLE INC $150 EXP 01/20/23",
              "Quantity": "4",
              "Price": "$0.55",
              "Fees & Comm": "$0.65",
              "Amount": "$110.00"
            },
            null,
            2
          )
        },
        {
          name: "Stock Split",
          description: "A stock split that increases the number of shares and reduces the price per share.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Stock Split",
              "Symbol": "GOOGL",
              "Description": "ALPHABET INC",
              "Quantity": "100",
              "Price": "",
              "Fees & Comm": "",
              "Amount": ""
            },
            null,
            2
          )
        },
        {
          name: "Reverse Split",
          description: "A reverse stock split that decreases the number of shares and increases the price per share.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Reverse Split",
              "Symbol": "ACB",
              "Description": "AURORA CANNABIS INC F",
              "Quantity": "200",
              "Price": "",
              "Fees & Comm": "",
              "Amount": ""
            },
            null,
            2
          )
        },
        {
          name: "Exchange or Exercise",
          description: "Exercising an options contract or exchanging one security for another.",
          example: JSON.stringify(
            {
              "Date": "04/18/2023",
              "Action": "Exchange or Exercise",
              "Symbol": "IBM",
              "Description": "INTL BUSINESS MACHINES CORP",
              "Quantity": "50",
              "Price": "$120.00",
              "Fees & Comm": "$1.00",
              "Amount": "$6,000.00"
            },
            null,
            2
          )
        }
      ]
    };
  },
  async created() {
    const accountId = this.$route.query.account_id;
    if (!accountId) {
      console.error('Account ID is required');
      this.$router.push('/');
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
        this.$router.push({ path: '/', query: { account_id: this.accountId } });
      } catch (error) {
        console.error('Error importing transactions:', error);
      }
    }
  }
};
</script>

<style scoped>
.example {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  text-align: left; /* Left justify the text */
  white-space: pre-wrap; /* Wrap long lines */
}
.action-section {
  margin-bottom: 20px;
}
</style>
