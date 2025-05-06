<script setup>
import Alert from './components/Alert.vue'
</script>

<template>
	<div class="app">
		<Alert />
		<router-view />
		<div id="modal-container"></div>
	</div>
</template>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

:root {
	--primary: #42b983;
	--secondary: #35495e;
	--tertiary: #41b883;
	--grey: #64748b;
	--dark: #1e293b;
	--white: #fff;
	--sidebar-width: 300px;
	--light: #f5f5f5;
	--pink-dark: #c58189;
	--pink-med: #d19499;
	--pink-light: #f0bab3;
	--bg-white: #f9f9f9;
	--pink-gray: #faf1ec;
	--pink-orange: #c26872;
	--blue-primary: #31394e;
	--blue-secondary: #727fa1;
}
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: 'Lato', sans-serif;
}
body {
	background-color: var(--light);
}
.app {
	display: flex;
	width: 100%;
	position: relative;
	min-height: 100vh;
	background-color: #f9f9f9;
	main {
		flex: 1 1 0;
		padding: 2rem;

		@media (max-width: 768px) {
			padding-left: 6rem;
		}
	}
}

.onboarding-layout {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	width: 100%;
	background-color: var(--blue-secondary);
}

.content {
	width: 75%;
	margin: 5% 5%;
	z-index: 2;
}
.content.full-width {
	width: 85%;
}
// Small devices
@media (max-width: 47rem) {
	.content {
		width: 80%;
	}
	.content.full-width {
		width: 74%;
	}
}
.app.internal::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 230px;
	background-image: url('assets/bg.png');
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center;
}
</style>
