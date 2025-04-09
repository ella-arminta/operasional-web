<template>
  <div>
    <button @click="showModal()" type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
      {{ buttonText }}
    </button>

    <!-- Modal -->
  </div>

</template>

<script setup>
import { readonly, ref, watch } from 'vue';
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
}, { deep: true })


// const emit = defineEmits(['update']);
// const showModal = ref(false);

const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const buttonText = ref('Set Recurrence');

function save() {
  validateData()

  const result = {
    recurringType: localRecurring.value.recurringType,
    interval: localRecurring.value.interval,
    startDate: localRecurring.value.startDate,
    endDate: localRecurring.value.endDate,
    daysOfWeek: localRecurring.value.daysOfWeek,
    dayOfMonth: localRecurring.value.dayOfMonth,
    monthOfYear: localRecurring.value.monthOfYear,
    dayOfYear: localRecurring.value.dayOfYear,
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
      summary = `Every ${data.interval} month(s) on day ${data.dayOfMonth}`
      break
    case 'YEAR':
      summary = `Every year on ${months[data.monthOfYear - 1]} ${data.dayOfYear}`
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
      title: 'Warning!',
      message: 'Please set start date.',
    })
    return false
  }

  if (localRecurring.value.endDate && localRecurring.value.startDate > localRecurring.value.endDate) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Start date cannot be later than end date.',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'DAY' && (!localRecurring.value.interval || localRecurring.value.interval < 1)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Please enter a valid interval for daily recurrence.',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'WEEK' && (!localRecurring.value.interval || localRecurring.value.interval < 1)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Please enter a valid interval for weekly recurrence.',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'WEEK' && (!Array.isArray(localRecurring.value.daysOfWeek) || localRecurring.value.daysOfWeek.length === 0)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Please select at least one day of the week.',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'MONTH' && (!localRecurring.value.interval || localRecurring.value.interval < 1)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Please enter a valid interval for monthly recurrence.',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'MONTH' && (!localRecurring.value.dayOfMonth || localRecurring.value.dayOfMonth < 1 || localRecurring.value.dayOfMonth > 31)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Please enter a valid day of the month (1-31).',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'YEAR' && (!localRecurring.value.monthOfYear || localRecurring.value.monthOfYear < 1 || localRecurring.value.monthOfYear > 12)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
      message: 'Please select a valid month for yearly recurrence.',
    })
    return false
  }

  if (localRecurring.value.recurringType === 'YEAR' && (!localRecurring.value.dayOfMonth || localRecurring.value.dayOfMonth < 1 || localRecurring.value.dayOfMonth > 31)) {
    store.dispatch('triggerAlert', {
      type: 'warning',
      title: 'Warning!',
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
      { label: 'Start Date', model: 'startDate', type: 'date', selectedModel: localRecurring.value.startDate },
      { label: 'End Date', model: 'endDate', type: 'date', selectedModel: localRecurring.value.endDate },
      {
        label: 'Recurrence Type',
        model: 'recurringType',
        type: 'select',
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
      },
      // Weekly
      {
        label: 'Repeat every X weeks',
        model: 'interval',
        type: 'number',
        condition: (data) => data.recurringType.includes('WEEK'),
        selectedModel: localRecurring.value.interval,
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
      },
      // Monthly
      {
        label: 'Repeat every X months',
        model: 'interval',
        type: 'number',
        condition: (data) => data.recurringType.includes('MONTH'),
        selectedModel: localRecurring.value.interval,
      },
      {
        label: 'On day of the month',
        model: 'dayOfMonth',
        type: 'number',
        condition: (data) => data.recurringType.includes('MONTH'),
        selectedModel: localRecurring.value.dayOfMonth,
      },
      // Yearly
      {
        label: 'Month of the year',
        model: 'monthOfYear',
        type: 'select',
        options: [
          { value: '', text: 'Select Month' },
          { value: 1, text: 'January' },
          { value: 2, text: 'February' },
          { value: 3, text: 'March' },
          { value: 4, text: 'April' },
          { value: 5, text: 'May' },
          { value: 6, text: 'June' },
          { value: 7, text: 'July' },
          { value: 8, text: 'August' },
          { value: 9, text: 'September' },
          { value: 10, text: 'October' },
          { value: 11, text: 'November' },
          { value: 12, text: 'December' },
        ],
        condition: (data) => data.recurringType.includes('YEAR'),
        selectedModel: localRecurring.value.monthOfYear,
      },
      {
        label: 'Day of the month',
        model: 'dayOfYear',
        type: 'number',
        condition: (data) => data.recurringType.includes('YEAR'),
        selectedModel: localRecurring.value.dayOfYear,
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
</script>