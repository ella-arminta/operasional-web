<template>
  <div>
    <div class="bg-white shadow-md rounded-lg p-2 w-full md:w-[70%] md:p-6 chart d-block mx-auto">
      <h2 class="text-center text-lg font-bold">{{ props.title }}</h2>

      <!-- Loading Spinner -->
      <div v-if="isLoading" class="flex justify-center items-center h-40 text-lg text-pinkDark">
        <svg class="mr-3 ml-1 size-10 animate-spin text-pinkDark" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        ... Loading
      </div>

      <!-- Chart -->
      <Line v-else-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import axiosInstance from '../../axios';
import { Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const props = defineProps({
    apiPath: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Gold Price Chart'
    },
    startDate: {
        type: String,
        default: ''
    },
    endDate: {
        type: String,
        default: ''
    },
    companyId: {
        type: String,
        default: ''
    },
    storeId: {
        type: String,
        default: ''
    },
    colData: {
        type: String,
        default: 'data' // Use 'data' since that's what your JSON returns
    }
});

const chartData = ref(null);
const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function (value: number) {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                    }).format(value);
                }
            }
        }
    }
};
const isLoading = ref(true);
const fetchChartData = async () => {
    isLoading.value = true;
    try {
        const response = await axiosInstance.get(props.apiPath, {
            params: {
                start_date: props.startDate,
                end_date: props.endDate,
                ...(props.companyId ? { company_id: props.companyId } : {}),
                ...(props.storeId ? { store: props.storeId } : {})
            }
        });

        const resData = response.data.data;

        chartData.value = {
            labels: resData.map(item => item.label),
            datasets: [
                {
                    label: 'Profit/Loss',
                    backgroundColor: 'rgba(248, 121, 121, 0.5)',
                    borderColor: '#f87979',
                    data: resData.map(item => item[props.colData]),
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    } catch (error) {
        console.error('Failed to fetch chart data:', error);
    } 
    finally {
        isLoading.value = false;
    }
};

watch(() => [props.startDate, props.endDate, props.apiPath, props.companyId, props.storeId], fetchChartData, { immediate: true });
</script>