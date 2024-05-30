import axios from 'axios';
import { jwtInterceptor, unAuthRedirect } from './jwt.interceptor'; // adjust the import path as necessary

const API_URL = process.env.VUE_APP_API_URL;

// Initialize interceptors
jwtInterceptor();
unAuthRedirect();

const api = {
  async getAccounts() {
    const response = await axios.get(`${API_URL}/protected/accounts`);
    return response.data;
  },
  async createAccount(req) {
    const response = await axios.post(`${API_URL}/protected/accounts`, req);
    return response.data;
  },
  async getTransactions(accountId, page = 1, limit = 10) {
    const response = await axios.get(`${API_URL}/protected/transactions`, {
      params: {
        account_id: accountId,
        page,
        limit
      }
    });
    return response.data;
  },
  async createTransaction(transactionData) {
    const payload = {
      Date: transactionData.Date,
      Action: transactionData.Action,
      Symbol: transactionData.Symbol,
      Description: transactionData.Description,
      Quantity: transactionData.Quantity,
      Price: transactionData.Price,
      FeesComm: transactionData.FeesComm,
      Amount: transactionData.Amount,
      AccountID: transactionData.AccountID
    };
    const response = await axios.post(`${API_URL}/protected/transactions`, payload);
    return response.data;
  },
  async updateTransaction(transactionData) {
    const payload = {
      Date: transactionData.Date,
      Action: transactionData.Action,
      Symbol: transactionData.Symbol,
      Description: transactionData.Description,
      Quantity: transactionData.Quantity,
      Price: transactionData.Price,
      FeesComm: transactionData.Fees,
      Amount: transactionData.Amount,
      AccountID: transactionData.AccountID
    };
    const response = await axios.put(`${API_URL}/protected/transactions/${transactionData.id}`, payload);
    return response.data;
  },
  async deleteTransaction(transactionId) {
    const response = await axios.delete(`${API_URL}/protected/transactions/${transactionId}`);
    return response.status === 204;
  },
  async getPositions(accountId) {
    const response = await axios.get(`${API_URL}/protected/positions`, {
      params: {
        account_id: accountId
      }
    });
    return response.data;
  },
  async login(email, password) {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  async signup(email, password) {
    const response = await axios.post(`${API_URL}/signup`, { email, password });
    return response.data;
  },
  async importTransactions(formData) {
    const response = await axios.post(`${API_URL}/protected/transactions/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  async getCurrentPrice(symbol) {
    const response = await axios.get(`${API_URL}/protected/quote`, {
      params: {
        symbol: symbol
      }
    });
    return response.data;
  }
};

export default api;
