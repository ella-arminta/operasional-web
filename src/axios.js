import axios from 'axios'
import Cookies from 'js-cookie'
import { decryptData } from './utils/crypto'

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_BASE_URL, // Base URL for your API
	headers: {
		'Content-Type': 'application/json',
	},
})

axiosInstance.interceptors.request.use(
	(config) => {
		if (config.url.includes('login')) {
			return config
		}

		const token = Cookies.get('token')
			? decryptData(Cookies.get('token'))
			: null

		if (token) {
			config.headers.Authorization = `Bearer ${token}`
			const user = decryptData(Cookies.get('userdata'))
			if (!config.params?.company_id) {
				config.params = {
					...config.params,
					company_id: user.company_id,
				}
			}
			if (!config.params?.store_id) {
				config.params = { ...config.params, store_id: user.store_id }
			}
		}

		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

export default axiosInstance
