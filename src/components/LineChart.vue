<template>
    <line-chart-generator :data="chartData" :options="chartOptions" :height="height"/>
  </template>
  
  <script>
  import { Line } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement } from 'chart.js';
  
  ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement);
  
  export default {
    name: 'LineChart',
    components: {
      LineChartGenerator: Line
    },
    props: {
      data: {
        type: Object,
        required: true
      }, 
      height: {
        type: Number,
        default: 400
      },
      options: {
        type: Object,
        default: () => ({
          responsive: true, 
          maintainAspectRatio: false
        })
      }
    },
    data() {
      return {
        chartData: this.data,
        chartOptions: {
          ...this.options,
          scales: {
            'y-axis-1': {
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: true
              }
            },
            'y-axis-2': {
              type: 'linear',
              position: 'right',
              ticks: {
                beginAtZero: true
              },
              grid: {
                drawOnChartArea: false // only want the grid lines for one axis to show up
              }
            }
          }
        }
      };
    },
    watch: {
      data(newData) {
        this.chartData = newData;
      },
      options(newOptions) {
        this.chartOptions = {
          ...newOptions,
          scales: {
            'y-axis-1': {
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: true
              }
            },
            'y-axis-2': {
              type: 'linear',
              position: 'right',
              ticks: {
                beginAtZero: true
              },
              grid: {
                drawOnChartArea: false // only want the grid lines for one axis to show up
              }
            }
          }
        };
      }
    }
  };
  </script>
  