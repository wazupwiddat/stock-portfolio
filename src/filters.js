// filters.js
import Vue from 'vue';

Vue.filter('currency', function (value) {
  if (typeof value !== "number") {
    return value;
  }
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2 });
});