import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

if (!SECRET_KEY) {
	throw new Error('SECRET_KEY is undefined! Check your .env file.')
}
export function encryptData(data) {
	return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

export function decryptData(encryptedData) {
	try {
		const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
		const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

		if (!decryptedText) {
			throw new Error('Decryption returned empty result.')
		}

		return JSON.parse(decryptedText)
	} catch (error) {
		console.error('Decryption error:', error)
		return null
	}
}
