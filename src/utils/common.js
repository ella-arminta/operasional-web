export const formatDate = (dateString) => {
	const date = new Date(dateString)
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()

	return `${day}/${month}/${year}`
}

// formatDatetime
export const formatDatetime = (dateString) => {
	const date = new Date(dateString)
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	const seconds = String(date.getSeconds()).padStart(2, '0')

	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

export function formatIDR(value, reparsed = false) {
	if (reparsed) {
		let cleaned = String(value)
		.replace(/\./g, '')
		.replace(',', '.');
		const parsed = parseFloat(cleaned);
		return isNaN(parsed) ? 0 : parsed;
	}

	if (value == null || isNaN(value)) return '0,00';
	
	return parseFloat(value).toLocaleString('id-ID', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

export function unformatCurrency(value) {
	if (typeof value === 'number') return value
	// Remove "Rp", spaces, dots, etc.
	const data = value.split(',')[0]
	return parseInt(data.replace(/[^\d]/g, ''), 10) || 0
}
