<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
  colData: {
    type: String,
    default: 'sellPrice'
  }
});

const chartMode = ref<'date' | 'month'>('date'); // Toggle mode
const loading = ref(true);
const localStartDate = ref(props.startDate);
const localEndDate = ref(props.endDate);

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Sell Price (IDR)',
      borderColor: '#f87979',
      backgroundColor: 'rgba(248, 121, 121, 0.5)',
      data: [],
      tension: 0.3
    }
  ]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { title: { display: true, text: 'Time' } },
    y: { title: { display: true, text: 'Sell Price (IDR)' }, beginAtZero: false }
  }
};

// Fetch gold prices with optional date range
const fetchGoldPrices = async () => {
  try {
    loading.value = true;
    let url = `${props.apiPath}`;

    if (localStartDate.value) {
      url += `?start_date=${localStartDate.value}`;
    }
    if (localEndDate.value) {
      if (localStartDate.value) {
        url += `&end_date=${localEndDate.value}`;
      } else {
        url += `?end_date=${localEndDate.value}`;
      }
    }

    const response = await axiosInstance.get(url);
    if (response.data.success) {
      processData(response.data.data);
    }
  } catch (error) {
    loading.value = false;
    console.error('Error fetching gold prices:', error);
  }
};

const processData = (data) => {
  if (chartMode.value === 'date') {
    // Mode Date: Format tanggal lengkap
    chartData.value.labels = data.map(item =>
      new Date(item.created_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    );
    chartData.value.datasets[0].data = data.map(item => item[props.colData]);
  } else {
    // Mode Month: Ambil harga terakhir di setiap hari
    const dailyLastPrice = {};

    data.forEach(item => {
      const date = new Date(item.created_at);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      // Simpan harga terakhir untuk setiap hari
      dailyLastPrice[dayKey] = item[props.colData];
    });

    // Ambil bulan dalam range startDate - endDate
    const start = new Date(localStartDate.value);
    const end = new Date(localEndDate.value);
    const monthLabels = [];
    const monthPrices = {};

    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      monthLabels.push(monthKey);
      monthPrices[monthKey] = null; // Default null
    }

    // Ambil harga terakhir dari setiap bulan
    Object.keys(dailyLastPrice).forEach(dateKey => {
      const date = new Date(dateKey);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      // Simpan harga terakhir dalam bulan tersebut
      monthPrices[monthKey] = dailyLastPrice[dateKey];
    });

    chartData.value.labels = monthLabels;
    chartData.value.datasets[0].data = monthLabels.map(month => monthPrices[month] || 0);
  }
};

const toggleChartMode = () => {
  loading.value = true;
  chartMode.value = chartMode.value === 'date' ? 'month' : 'date';
  fetchGoldPrices(); // Reload data with new mode
};

onMounted(fetchGoldPrices);
watch(() => props.apiPath, fetchGoldPrices); // Re-fetch when the API path changes

// Watch for date range changes and update chart
watch(() => [props.startDate, props.endDate], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (newStart !== oldStart || newEnd !== oldEnd) {
    localStartDate.value = newStart;
    localEndDate.value = newEnd;
    fetchGoldPrices();
  }
});
watch(chartData, (newData) => {
  loading.value = false;
}, { deep: true });

</script>

<template>
  <div class="bg-white shadow-md rounded-lg p-6 chart">
    <div class="date-filter flex gap-2 justify-start items-start mb-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-[70%]">
        <h2 class="text-2xl text-pinkDark">{{ title }}</h2>
      </div>

      <div class="flex justify-end items-start w-[30%]">
        <button @click="toggleChartMode" class="bg-pinkDark text-white p-1 md:p-3 rounded md:rounded-lg w-full md:w-auto">
          <div class="w-full flex md:gap-2" v-if="chartMode == 'date'">
            <span  class='material-icons'>switch_access_shortcut</span> Month
          </div>
          <div class="w-full flex md:gap-2" v-else>
            <span class='material-icons'>switch_access_shortcut</span> Date
          </div>
        </button>
      </div>

    </div>
    <div class="chart-container" style="height: 400px;">
      <Line v-if="!loading" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  max-width: 800px;
  width: 95%;
  margin: auto;
  text-align: center;
}
</style>