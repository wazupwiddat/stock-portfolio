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
      },
      showSecondaryYAxis: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        chartData: this.data,
        chartOptions: this.getChartOptions()
      };
    },
    watch: {
      data(newData) {
        this.chartData = newData;
      },
      options(newOptions) {
        this.chartOptions = this.getChartOptions(newOptions);
      },
      showSecondaryYAxis() {
        this.chartOptions = this.getChartOptions();
      }
    },
    methods: {
      getChartOptions(options = this.options) {
        const scales = {
          'y-axis-1': {
            type: 'linear',
            position: 'left',
            ticks: {
              beginAtZero: true
            }
          }
        };
  
        if (this.showSecondaryYAxis) {
          scales['y-axis-2'] = {
            type: 'linear',
            position: 'right',
            ticks: {
              beginAtZero: true
            },
            grid: {
              drawOnChartArea: false // only want the grid lines for one axis to show up
            }
          };
        }
  
        return {
          ...options,
          scales
        };
      }
    }
  };
  </script>
  