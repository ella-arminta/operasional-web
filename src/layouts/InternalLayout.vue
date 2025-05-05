<template>
	<div class="app internal"
		:class="{ 'sidebar-expanded': !isSidebarCollapsed, 'sidebar-collapsed': isSidebarCollapsed }">
		<Alert />
		<MenuSidebar @sidebar-toggle="handleSidebarToggle" />
		<div class="main-content">
			<router-view />
		</div>
	</div>
</template>


<script>
import Alert from '../components/Alert.vue'
import MenuSidebar from '../components/MenuSidebar.vue'
export default {
	components: {
		MenuSidebar,
		Alert,
	},
	data() {
		return {
			isSidebarCollapsed: false
		}
	},
	mounted() {
		// Check local storage for sidebar status
		const savedState = localStorage.getItem('smallMenu')
		if (savedState !== null) {
			this.isSidebarCollapsed = savedState === 'true'
		}
	},
	methods: {
		handleSidebarToggle(isCollapsed) {
			this.isSidebarCollapsed = isCollapsed
			localStorage.setItem('smallMenu', isCollapsed)
		}
	}
}
</script>

<style>
:root {
	--sidebar-width: 280px;
	--sidebar-collapsed-width: 70px;
	--transition-speed: 0.3s;
	--main-content-width: calc(110% - var(--sidebar-width));
}

/* Reset to ensure no default margin and padding */
html,
body {
	margin: 0;
	padding: 0;
	height: 100%;
	width: 100%;
	overflow-x: hidden;
}

.app.internal {
	position: relative;
	min-height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: row;
}

.wide-alert {
	width: calc(100% - var(--sidebar-width));
	margin-left: var(--sidebar-width);
	transition: margin-left var(--transition-speed), width var(--transition-speed);
}

.sidebar-collapsed .wide-alert {
	width: calc(100% - var(--sidebar-collapsed-width));
	margin-left: var(--sidebar-collapsed-width);
}

/* Main content styling with flex layout */
.main-content {
	flex: 1;
	min-width: 0;
	z-index: 10;
	box-sizing: border-box;
	padding: 1px;
	width: var(--main-content-width);
	position: absolute;
	top: 0;
	bottom: 0;
	transition: all var(--transition-speed);
}

/* Adjust main content when sidebar is expanded/collapsed */
.sidebar-expanded .main-content {
	width: var(--main-content-width);
	left: var(--sidebar-width);
}

.sidebar-collapsed .main-content {
	width: calc(100% - var(--sidebar-collapsed-width));
	left: var(--sidebar-collapsed-width);
}

/* Mobile Styles - Fixed width issue */
@media (max-width: 768px) {
	.main-content {
		width: 100% !important;
		margin-left: auto !important;
		margin-right: auto !important;
		position: relative;
		left: 0 !important;
		max-width: 95%;
		/* Restrict width to create centering effect */
	}

	.sidebar-expanded .main-content,
	.sidebar-collapsed .main-content {
		width: 100% !important;
		left: 0 !important;
	}

	/* Ensure content fills available space with better centering */
	.app.internal.mobile .main-content {
		width: 95% !important;
		left: 0 !important;
		right: 0 !important;
		padding: 10px;
		position: relative;
		margin: 0 auto;
		/* Center the content */
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Center card contents on mobile */
	.app.internal.mobile .card,
	.app.internal.mobile .card-body {
		margin: 0 auto;
	}
}

.main-content .card,
.main-content .card-body {
	width: 100%;
}
</style>