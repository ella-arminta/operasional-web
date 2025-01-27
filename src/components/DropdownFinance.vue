<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
const emit = defineEmits(["range-selected"]);

const store = useStore();
// Dropdown state
const isDropdownOpen = ref(false);

const today = new Date();
const activeType = ref("Months");
// today get Month in format January 2025
const labelFixSelected = ref(today.toLocaleString('default', { month: 'long' }) + ' ' + today.getFullYear())
const selectedRange = ref({ 
    label: today.toLocaleString('default', { month: 'long' }) + ' ' + today.getFullYear(), 
    value: {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    } 
});

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectRange = () => {
    if (activeType.value === "Custom") {
        console.log('haicustom')
        // pastikan end dan start tidak kosong 
        if (selectedRange.value.value.start == '' || selectedRange.value.value.end == '') {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Warning!',
                message: `Please fill the start and end date`,
            })
            return;
        } else if (selectedRange.value.value.start > selectedRange.value.value.end) {
            store.dispatch('triggerAlert', {
                type: 'warning',
                title: 'Warning!',
                message: `Start date must be less than end date`,
            })
            return;
        }
        
        // Set label
        const tempStartDate = new Date(selectedRange.value.value.start);
        const tempEndDate = new Date(selectedRange.value.value.end);
        selectedRange.value.label = 
            tempStartDate.getDate() + ' ' + 
            tempStartDate.toLocaleString('default', { month: 'short' }) + ' ' + 
            tempStartDate.getFullYear() + ' - ' + 
            tempEndDate.getDate() + ' ' + 
            tempEndDate.toLocaleString('default', { month: 'short' }) + ' ' + 
            tempEndDate.getFullYear();

    }

    isDropdownOpen.value = false;
    labelFixSelected.value = selectedRange.value.label;
    // Emit the selected range (this will be emitted to the parent component)
    console.log('emited selectRange')
    selectedRange.value.value.start = selectedRange.value.value.start.toISOString().split('T')[0];
    selectedRange.value.value.end = selectedRange.value.value.end.toISOString().split('T')[0];
    emit("range-selected",  selectedRange.value.value );
};

const navigate = (direction, options) => {
    if (options == 'months') {
        const currentSelected = selectedRange.value.value;
        var newMonth;
        if (direction == 'next'){
            newMonth = new Date(currentSelected.end.getFullYear(), currentSelected.end.getMonth() + 1, 1);
        } else if (direction == 'prev'){ // prev
            newMonth = new Date(currentSelected.start.getFullYear(), currentSelected.start.getMonth() - 1, 1);
        } else { // current
            newMonth = new Date();
        }
        selectedRange.value = {
            label: newMonth.toLocaleString('default', { month: 'long' }) + ' ' + newMonth.getFullYear(),
            value: {
                start: new Date(newMonth.getFullYear(), newMonth.getMonth(), 1),
                end: new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0),
            }
        };
    } 
    else if (options == 'quarters') {
        const currentSelected = selectedRange.value.value;
        var newQuarter;
        if (direction == 'next'){
            newQuarter = new Date(currentSelected.end.getFullYear(), currentSelected.end.getMonth() + 3, 1);
        } else if (direction == 'prev') { // prev
            newQuarter = new Date(currentSelected.start.getFullYear(), currentSelected.start.getMonth() - 3, 1);
        } else { // current
            newQuarter = new Date(today.getFullYear(), 0, 1);
        }
        const startQuarter = new Date(newQuarter.getFullYear(), newQuarter.getMonth(), 1);
        const endQuarter = new Date(newQuarter.getFullYear(), newQuarter.getMonth() + 3, 0);
        selectedRange.value = {
            label: startQuarter.toLocaleString('default', { month: 'short' }) + ' - ' + endQuarter.toLocaleString('default', { month: 'short' }) + ' ' + newQuarter.getFullYear(),
            value: {
                start: startQuarter,
                end: endQuarter,
            }
        };
    } 
    else if (options == 'years') {
        const currentSelected = selectedRange.value.value;
        var newYear;
        if (direction == 'next'){
            newYear = new Date(currentSelected.end.getFullYear() + 1, 0, 1);
        } else if (direction == 'prev') {
            newYear = new Date(currentSelected.start.getFullYear() - 1, 0, 1);
        } else { // current
            newYear = new Date(today.getFullYear(), 0, 1);
        }
        selectedRange.value = {
            label: newYear.getFullYear(),
            value: {
                start: new Date(newYear.getFullYear(), 0, 1),
                end: new Date(newYear.getFullYear(), 11, 31),
            }
        };
    }
    else { // custom
    }
};

const getActiveOptions = () => {
  if (activeType.value === "Months") return 'months';
  if (activeType.value === "Quarters") return 'quarters';
  if (activeType.value === "Years") return 'years';
  if (activeType.value === "Custom") return 'custom';
  return [];
};

const setActiveType = (type) => {
  activeType.value = type;
  if (type == 'Custom') {
    selectedRange.value.value.end = "";
    selectedRange.value.value.start="";
  }
  navigate('current', getActiveOptions());
};
</script>

<template>
  <div class="dropdown-filter">
    <!-- Dropdown Button -->
    <button @click="toggleDropdown" class="dropdown-button">
      {{ labelFixSelected }}
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isDropdownOpen" class="dropdown-menu">
      <!-- Tabs for Months, Quarters, and Years -->
      <div class="tab-navigation">
        <button @click="setActiveType('Months')" :class="{ active: activeType === 'Months' }">Month</button>
        <button @click="setActiveType('Quarters')" :class="{ active: activeType === 'Quarters' }">Quarter</button>
        <button @click="setActiveType('Years')" :class="{ active: activeType === 'Years' }">Year</button>
        <button @click="setActiveType('Custom')" :class="{ active: activeType === 'Custom' }">Custom</button>
      </div>

      <!-- Navigation Buttons -->
      <div class="navigation-buttons">
        <button v-if="activeType != 'Custom'" @click="navigate('prev', getActiveOptions())">Previous</button>
        <span v-if="activeType != 'Custom'">{{ selectedRange.label }}</span>
        <span v-else class="flex gap-2 flex-col">
            <div>
                Start Date : <input type="date" v-model="selectedRange.value.start" class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25" />
            </div>
            <div>
                End Date   : <input type="date" v-model="selectedRange.value.end" class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25" />
            </div>
        </span>
        <button v-if="activeType != 'Custom'" @click="navigate('next', getActiveOptions())">Next</button>
      </div>

      <!-- Select Current Option -->
      <button
        @click="selectRange()"
        class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300 w-full text-center justify-center"
      >
        Select
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown-filter {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  border: 1px solid #ccc;
  background-color: #fff;
  z-index: 1000;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tab-navigation button {
  flex: 1;
  padding: 8px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
}

.tab-navigation button.active {
  font-weight: bold;
  background-color: #e0e0e0;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.navigation-buttons button {
  padding: 8px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.select-button {
  padding: 8px;
  width: 100%;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.select-button:hover {
  background-color: #0056b3;
}

.tab-navigation button {
  background-color: var(--pink-med);
  color: white;
}
.tab-navigation button.active {
  background-color: var(--pink-light);
}
</style>