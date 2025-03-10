<template>
    <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
        <PageTitle title="Bank Account List" />
        <TableData :columns="columns" :addPath="'/marketplace/bank_account/add'" :export="false" :reload="true"
            :ajaxPath="`/transaction/bank_account/${storeId}/store`" :editPath="'/marketplace/bank_account/edit'"
            :deletePath="'/transaction/bank_account'" :infoPath="'/marketplace/bank_account/detail'" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import PageTitle from '../../components/PageTitle.vue'
import TableData from '../../components/TableData.vue'
import Cookies from 'js-cookie'
import { decryptData } from '../../utils/crypto'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)
const storeId = decryptData(Cookies.get('userdata')).store_id

const columns = [
    { data: 'no', title: 'No', width: '5%' },
    { data: 'id', title: 'ID', visible: false },
    { data: 'bank_name', title: 'Bank Name' },
    { data: 'account_number', title: 'Account Number' },
    { data: 'account_holder', title: 'Account Holder' },
    {
        data: 'action',
        title: 'Action',
        width: '10%',
        searchable: false,
        orderable: false,
    },
]
</script>