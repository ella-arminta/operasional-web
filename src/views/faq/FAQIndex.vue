<template>
    <div class="content min-h-screen" :class="{ 'full-width': smallMenu }">
        <PageTitle title="Frequently Asked Questions" />

        <!-- Container FAQ -->
        <div class="faq-container">
            <!-- Loading Indicator -->
            <div v-if="loading" class="loading">
                <p>Loading FAQs...</p>
            </div>

            <!-- Error Message -->
            <div v-else-if="error" class="error">
                <p>Failed to load FAQs: {{ error }}</p>
            </div>

            <!-- List FAQ -->
            <div v-else>
                <div v-if="faqs.length > 0">
                    <div v-for="faq in faqs" :key="faq.faq_id" class="faq-item">
                        <!-- Accordion Toggle -->
                        <div class="faq-question" @click="toggleFaq(faq.faq_id)">
                            <span>{{ faq.question }}</span>
                            <i class="material-icons expand-icon" :class="{ opened: expandedFaq === faq.faq_id }">
                                {{ expandedFaq === faq.faq_id ? 'expand_less' : 'expand_more' }}
                            </i>
                        </div>

                        <!-- Answer (Show/Hide) -->
                        <transition name="fade">
                            <div class="faq-answer" v-if="expandedFaq === faq.faq_id">
                                <p>{{ faq.answer }}</p>
                            </div>
                        </transition>
                    </div>
                </div>

                <!-- No Data Available -->
                <div v-else class="no-data">
                    <p>No FAQs available at the moment.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios';
import PageTitle from '../../components/PageTitle.vue'
import { useStore } from 'vuex'

const store = useStore()
const smallMenu = computed(() => store.getters.smallMenu)

const faqs = ref([]) // Data FAQ
const loading = ref(true) // State Loading
const error = ref(null) // State Error
const expandedFaq = ref(null) // Menyimpan ID FAQ yang sedang dibuka

// Function mengambil data FAQ dari API
const fetchFAQs = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:3020/api/faq/type/2')
        faqs.value = response.data.data
    } catch (err) {
        error.value = err.message || 'Failed to fetch FAQs'
    } finally {
        loading.value = false
    }
}

// Function untuk membuka/tutup FAQ (Accordion)
const toggleFaq = (faqId) => {
    expandedFaq.value = expandedFaq.value === faqId ? null : faqId
}

// Ambil data saat komponen dimount
onMounted(fetchFAQs)
</script>

<style scoped>
/* Styling FAQ Page */
.faq-container {
    max-width: 800px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Loading dan Error */
.loading,
.error,
.no-data {
    text-align: center;
    font-size: 16px;
    color: #333;
    margin-top: 20px;
}

/* FAQ Item */
.faq-item {
    border-bottom: 1px solid #ddd;
    padding: 10px 0;
    cursor: pointer;
    transition: background 0.3s;
}

/* Hover Effect */
.faq-item:hover {
    background: rgba(0, 0, 0, 0.05);
}

/* FAQ Question */
.faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
    padding: 10px;
    cursor: pointer;
}

/* FAQ Answer */
.faq-answer {
    padding: 10px;
    background: #f8f8f8;
    font-size: 16px;
    color: #555;
    border-radius: 5px;
    margin-top: 5px;
}

/* Material Icons Styling */
.expand-icon {
    font-size: 24px;
    transition: transform 0.3s ease-in-out;
    color: #555;
}

/* Rotate icon saat expand */
.expand-icon.opened {
    transform: rotate(180deg);
}
</style>
