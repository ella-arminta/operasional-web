<template>
  <div>
    <button @click="showModal()" type="button" class="px-4 py-2 bg-pinkDark text-white rounded-md hover:bg-pinkOrange">
      {{ buttonText }}
    </button>

    <!-- Modal -->
  </div>

</template>

<script setup>
import { onMounted, readonly, ref, watch } from 'vue';
import { useStore } from 'vuex'

const store = useStore()
const props = defineProps({
  modelValue: Object
})
const emit = defineEmits(['update:modelValue'])
const localRecurring = ref({ ...props.modelValue })
watch(() => props.modelValue, (newVal) => { // Watch for parent changes and sync
  console.log('[Child] modelValue updated from parent:', newVal)
  localRecurring.value = { ...newVal }
  buttonText.value = getSummary(localRecurring.value);
}, { deep: true })
defineExpose({
  validate: validateData
})


// const emit = defineEmits(['update']);
// const showModal = ref(false);

const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const buttonText = ref('Set Recurrence');

function save() {
  if (!validateData()) return
  
  resetRecurringData()
  const result = {
    recurringType: localRecurring.value.recurringType,
    interval: localRecurring.value.interval,
    startDate: localRecurring.value.startDate,
    endDate: localRecurring.value.endDate,
    daysOfWeek: localRecurring.value.daysOfWeek,
    dayOfMonth: localRecurring.value.dayOfMonth,
    monthOfYear: localRecurring.value.monthOfYear,
    dayOfYear: localRecurring.value.dayOfYear,
    dayOfMonthCustom: localRecurring.value.dayOfMonthCustom,
    dayOfYearCustom: localRecurring.value.dayOfYearCustom,
  }

  buttonText.value = getSummary(result)
  // emit('update', result)
  console.log('[Child] Emitting data to parent:', result)

  emit('update:modelValue', result)

  // store success
  store.dispatch('triggerAlert', {
    type: 'success',
    title: 'Success!',
    message: 'Recurrence schedule saved.',
  })
  close()
}


function close() {
  // showModal.value = false;
}

function getSummary(data) {
  let summary = ''
  let recurringType = data.recurringType;
  if (Array.isArray(recurringType)) {
    recurringType = recurringType[0];
  }
  switch (recurringType) {
    case 'DAY':
      summary = `Every ${data.interval} day(s)`
      break
    case 'WEEK':
      const days = data.daysOfWeek.map(i => daysOfWeekLabels[i]).join(', ')
      summary = `Every ${data.interval} week(s) on ${days}`
      break
    case 'MONTH':
      const dayOfMonth = data.dayOfMonthCustom == -1 ? ' last day ' : (data.dayOfMonthCustom == 1 ? ' first day ' :' on day ' + data.dayOfMonth)
      summary = `Every ${data.interval} month(s) ${dayOfMonth}`
      break
    case 'YEAR':
      const dayOfYear = data.dayOfYearCustom == -1 ? ' last day ' : (data.dayOfYearCustom == 1 ? ' first day ' :' on day ' + data.dayOfYear)
      const interval = data.interval == 1 ? 'Every year' : `Every ${data.interval} year(s)`
      const monthLabel = data.monthOfYear.map(i => months[i]).join(', ')
      summary = `${interval} on ${monthLabel} ${dayOfYear}`
      break
    default:
      summary = 'Set Recurrence'
  }

  if (data.startDate) summary += ` starting ${data.startDate}`
  if (data.endDate) summary += ` until ${data.endDate}`

  return summary
}

function validateData() {
  if (!localRecurring.value.startDate) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please set start date when "Set Recurrence" / "Recurring Period".',
    })
    return false
  }
  console.log('local recuring type',localRecurring.value.recurringType);
  if (!localRecurring.value.recurringType || !Array.isArray(localRecurring.value.recurringType) || localRecurring.value.recurringType.length == 0) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please select a recurrence type.',
    })
    return false
  }

  if (localRecurring.value.endDate && localRecurring.value.startDate > localRecurring.value.endDate) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Start date cannot be later than end date.',
    })
    return false
  }

  if (localRecurring.value.recurringType == 'DAY' && (!localRecurring.value.interval || localRecurring.value.interval < 1)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please enter a valid interval for daily recurrence.',
    })
    return false
  }

  if (localRecurring.value.recurringType == 'WEEK' && (!localRecurring.value.interval || localRecurring.value.interval < 1)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please enter a valid interval for weekly recurrence.',
    })
    return false
  }

  if (localRecurring.value.recurringType == 'WEEK' && (!Array.isArray(localRecurring.value.daysOfWeek) || localRecurring.value.daysOfWeek.length == 0)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please select at least one day of the week.',
    })
    return false
  }

  if (localRecurring.value.recurringType == 'MONTH' && (!localRecurring.value.interval || localRecurring.value.interval < 1)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please enter a valid interval for monthly recurrence.',
    })
    return false
  }

  // console.log('recurringType', localRecurring.value.recurringType);
  console.log('dayOfMonth',typeof localRecurring.value.dayOfMonth, localRecurring.value.dayOfMonth == '');
  console.log('perifan', localRecurring.value.recurringType == 'MONTH' && (!localRecurring.value.dayOfMonth || localRecurring.value.dayOfMonth == '' || localRecurring.value.dayOfMonth == null || localRecurring.value.dayOfMonth < -1 || localRecurring.value.dayOfMonth > 31));
  localRecurring.value.dayOfMonth = localRecurring.value.dayOfMonthCustom == 'custom' ? localRecurring.value.dayOfMonth : (localRecurring.value.dayOfMonthCustom)
  if (localRecurring.value.recurringType == 'MONTH' && (!localRecurring.value.dayOfMonth || localRecurring.value.dayOfMonth == '' || localRecurring.value.dayOfMonth == null || localRecurring.value.dayOfMonth < -1 || localRecurring.value.dayOfMonth > 31 || localRecurring.value.dayOfMonth == 'custom')) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please enter a valid day of the month (1-31).',
    })
    return false
  }

  if (localRecurring.value.recurringType == 'YEAR' && (!Array.isArray(localRecurring.value.monthOfYear) || localRecurring.value.monthOfYear.length == 0)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please select a valid month for yearly recurrence.',
    })
    return false
  }

  localRecurring.value.dayOfYear = localRecurring.value.dayOfYearCustom == 'custom' ? localRecurring.value.dayOfYear : (localRecurring.value.dayOfYearCustom)
  if (localRecurring.value.recurringType == 'YEAR' && (!localRecurring.value.dayOfYear || localRecurring.value.dayOfYear == '' || localRecurring.value.dayOfYear == null || localRecurring.value.dayOfYear < -1 || localRecurring.value.dayOfYear > 31 || localRecurring.value.dayOfYear == 'custom')) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning Recurring!',
      message: 'Please enter a valid day of the month (1-31) for yearly recurrence.',
    })
    return false
  }

  return true
}

function showModal() {
  store.dispatch('triggerAlert', {
    type: 'info',
    title: 'Set Recurrence Schedule',
    inputs: [
      { label: 'Start Date', model: 'startDate', type: 'date', selectedModel: localRecurring.value.startDate, required: true },
      { label: 'End Date', model: 'endDate', type: 'date', selectedModel: localRecurring.value.endDate },
      {
        label: 'Recurrence Type',
        model: 'recurringType',
        type: 'select',
        required: true,
        options: [
          { value: 'DAY', text: 'Daily' },
          { value: 'WEEK', text: 'Weekly' },
          { value: 'MONTH', text: 'Monthly' },
          { value: 'YEAR', text: 'Yearly' },
        ],
        selectedModel: localRecurring.value.recurringType,
      },
      // Daily
      {
        label: 'Repeat every X days',
        model: 'interval',
        type: 'number',
        condition: (data) => data.recurringType.includes('DAY'),
        watchModel: ['recurringType'],
        selectedModel: localRecurring.value.interval,
        required: true,
      },
      // Weekly
      {
        label: 'Repeat every X weeks',
        model: 'interval',
        type: 'number',
        condition: (data) => data.recurringType.includes('WEEK'),
        selectedModel: localRecurring.value.interval,
        required: true,
      },
      {
        label: 'Repeat every X years',
        model: 'interval',
        type: 'number',
        condition: (data) => data.recurringType.includes('YEAR'),
        selectedModel: localRecurring.value.interval,
        required: true,
      },
      {
        label: 'Select Days',
        model: 'daysOfWeek',
        type: 'select',
        multiple: true,
        options: [
          { value: 0, text: 'Sun' },
          { value: 1, text: 'Mon' },
          { value: 2, text: 'Tue' },
          { value: 3, text: 'Wed' },
          { value: 4, text: 'Thu' },
          { value: 5, text: 'Fri' },
          { value: 6, text: 'Sat' },
        ],
        condition: (data) => data.recurringType.includes('WEEK'),
        selectedModel: localRecurring.value.daysOfWeek,
        required: true,
      },
      // Monthly
      {
        label: 'Repeat every X months',
        model: 'interval',
        type: 'number',
        condition: (data) => data.recurringType.includes('MONTH'),
        selectedModel: localRecurring.value.interval,
        required: true,
      },
      {
        label: 'On day of the month',
        model: 'dayOfMonthCustom',
        type: 'select',
        options: [
          { value: -1, text: 'Last day of month' },
          { value: 1, text: 'First day of month' },
          { value: 'custom', text: 'Custom' },
        ],
        condition: (data) => data.recurringType.includes('MONTH'),
        selectedModel: localRecurring.value.dayOfMonthCustom,
        required: true,
      },
      {
        label: 'On day of the month',
        model: 'dayOfMonth',
        type: 'number',
        condition: (data) => data.recurringType.includes('MONTH') && data.dayOfMonthCustom == 'custom',
        selectedModel: localRecurring.value.dayOfMonth,
        required: true,
      },
      // Yearly
      {
        label: 'Month of the year',
        model: 'monthOfYear',
        type: 'select',
        multiple: true,
        options: [
          { value: 0, text: 'January' },
          { value: 1, text: 'February' },
          { value: 2, text: 'March' },
          { value: 3, text: 'April' },
          { value: 4, text: 'May' },
          { value: 5, text: 'June' },
          { value: 6, text: 'July' },
          { value: 7, text: 'August' },
          { value: 8, text: 'September' },
          { value: 9, text: 'October' },
          { value: 10, text: 'November' },
          { value: 11, text: 'December' },
        ],
        condition: (data) => data.recurringType.includes('YEAR'),
        selectedModel: localRecurring.value.monthOfYear,
        required: true,
      },
      {
        label: 'Day of the month',
        model: 'dayOfYearCustom',
        type: 'select',
        options: [
          { value: -1, text: 'Last day of month' },
          { value: 1, text: 'First day of month' },
          { value: 'custom', text: 'Custom' },
        ],
        condition: (data) => data.recurringType.includes('YEAR'),
        selectedModel: localRecurring.value.dayOfYearCustom,
        required: true,
      },
      {
        label: 'Day of the month',
        model: 'dayOfYear',
        type: 'number',
        condition: (data) => data.recurringType.includes('YEAR') && data.dayOfYearCustom == 'custom',
        selectedModel: localRecurring.value.dayOfYear,
        required: true,
      },
    ],
    actions: [
      {
        label: 'Cancel',
        type: 'secondary',
        handler: () => store.dispatch('hideAlert'),
      },
      {
        label: 'Save',
        type: 'primary',
        handler: (data) => {
          console.log('Collected data:', data)
          localRecurring.value = { ...data }
          save();
        },
      },
    ],
  })
}

function resetRecurringData() {
  if (localRecurring.value.recurringType == 'DAY') {
    localRecurring.value.daysOfWeek = []
    localRecurring.value.dayOfMonth = null
    localRecurring.value.monthOfYear = []
    localRecurring.value.dayOfYear = null
  } else if (localRecurring.value.recurringType == 'WEEK') {
    localRecurring.value.dayOfMonth = null
    localRecurring.value.monthOfYear = []
    localRecurring.value.dayOfYear = null
  } else if (localRecurring.value.recurringType == 'MONTH') {
    localRecurring.value.daysOfWeek = []
    localRecurring.value.monthOfYear = []
    localRecurring.value.dayOfYear = null
  } else if (localRecurring.value.recurringType == 'YEAR') {
    localRecurring.value.daysOfWeek = []
    localRecurring.value.dayOfMonth = null
  }
}
</script>