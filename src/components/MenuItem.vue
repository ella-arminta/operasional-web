<template>
	<div class="menu-item" :class="{ opened: expanded }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
		<div class="label break-words" :class="{
			activated: isActive,
			'small-label': smallMenu && depth === 0 && !isMobile
		}" @click="path != '' ? navigateToPath() : toggleMenu()" :style="{ paddingLeft: calculatePadding() }">
			<div class="left">
				<i v-if="icon" class="material-icons material-icons-outlined">{{ icon }}</i>
				<span v-if="showLabel">{{ label }}</span>
			</div>
			<!-- Always show the expand icon if the item has children, regardless of depth -->
			<div v-if="data && data.length > 0" class="right">
				<i class="expand material-icons" :class="{ opened: expanded }">expand_more</i>
			</div>
		</div>
		<div v-show="showChildren" :class="{ 'small-menu': smallMenu && !isMobile && depth === 0 }"
			class="items-container" :style="{ height: containerHeight }" ref="container">
			<MenuItem :class="{ opened: showChildren }" v-for="(item, index) in data" :key="index" :data="item.children"
				:label="item.label" :icon="item.icon" :path="item.path" :depth="depth + 1" :is-mobile="isMobile"
				:small-menu="smallMenu" />
		</div>

		<!-- Hover submenu for collapsed sidebar - first level only -->
		<transition name="fade">
			<div v-if="smallMenu && !isMobile && depth === 0 && data && data.length > 0 && isHovering"
				class="hover-submenu">
				<div class="hover-menu-container">
					<div class="hover-menu-title">{{ label }}</div>
					<div v-for="(item, index) in data" :key="index" class="hover-menu-item" :class="{
						'active': isChildActive(item),
						'has-children': item.children && item.children.length > 0
					}" @click="navigateToChildPath(item)" @mouseenter="activeHoverChild = item"
						@mouseleave="activeHoverChild = null">
						<i v-if="item.icon" class="material-icons material-icons-outlined">{{ item.icon }}</i>
						<span>{{ item.label }}</span>

						<!-- If this item has children, show a chevron -->
						<i v-if="item.children && item.children.length > 0"
							class="material-icons submenu-indicator">chevron_right</i>

						<!-- Nested submenu -->
						<div v-if="item.children && item.children.length > 0 && activeHoverChild === item"
							class="nested-submenu">
							<div v-for="(subItem, subIndex) in item.children" :key="subIndex" class="hover-menu-item"
								:class="{ 'active': isChildActive(subItem) }"
								@click.stop="navigateToChildPath(subItem)">
								<i v-if="subItem.icon" class="material-icons material-icons-outlined">{{ subItem.icon
									}}</i>
								<span>{{ subItem.label }}</span>

								<!-- Even deeper levels would go here if needed -->
								<i v-if="subItem.children && subItem.children.length > 0"
									class="material-icons submenu-indicator">chevron_right</i>
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

// Props
const props = defineProps({
	data: {
		type: Array,
		default: () => [],
	},
	label: {
		type: String,
		default: '',
	},
	icon: {
		type: String,
		default: '',
	},
	depth: {
		type: Number,
		default: 0,
	},
	path: {
		type: String,
		default: '',
	},
	isMobile: {
		type: Boolean,
		default: false
	},
	smallMenu: {
		type: Boolean,
		default: false
	}
});

// State
const showChildren = ref(false);
const expanded = ref(false);
const containerHeight = ref('0px');
const route = useRoute();
const router = useRouter();
const store = useStore();
const isHovering = ref(false);
const hoverTimer = ref(null);
const activeHoverChild = ref(null);

// Hover handlers with slight delay for better UX
const handleMouseEnter = () => {
	if (props.smallMenu && !props.isMobile && props.depth === 0 && props.data && props.data.length > 0) {
		clearTimeout(hoverTimer.value);
		hoverTimer.value = setTimeout(() => {
			isHovering.value = true;
		}, 100);
	}
};

const handleMouseLeave = () => {
	if (props.smallMenu && !props.isMobile && props.depth === 0 && props.data && props.data.length > 0) {
		clearTimeout(hoverTimer.value);
		hoverTimer.value = setTimeout(() => {
			isHovering.value = false;
		}, 300);
	}
};

// Calculate padding based on depth and menu state
const calculatePadding = () => {
	if (props.smallMenu && props.depth === 0 && !props.isMobile) {
		return '10px'; // When sidebar is collapsed and it's a top-level item
	}
	return props.depth * 15 + 20 + 'px'; // Normal padding calculation
};

// Computed
const showLabel = computed(() => {
	// Show labels on mobile even when smallMenu is true
	if (props.isMobile) return true;

	// For desktop, only show labels when not collapsed or for child items
	return !props.smallMenu || props.depth > 0;
});

const isActive = computed(() => {
	return route.path === props.path ||
		(props.path !== '' && route.path.startsWith(props.path));
});

// Check if a child item is active
const isChildActive = (item) => {
	if (item.path && (route.path === item.path || route.path.startsWith(item.path))) {
		return true;
	}

	// Check this item's children recursively
	if (item.children && item.children.length > 0) {
		return item.children.some(child => isChildActive(child));
	}

	return false;
};

// Navigate to a child path
const navigateToChildPath = (item) => {
	if (item.path) {
		router.push(item.path);
		isHovering.value = false; // Close the menu after navigation
	} else if (item.children && item.children.length > 0) {
		// If no direct path but has children, just keep the submenu open
		// This allows clicking on parent categories with no path
		event.stopPropagation();
	}
};

// Check if any parent path needs to be expanded
const checkParentPath = () => {
	if (props.path && isActive.value && props.depth > 0) {
		// If this is an active child item, let parent know to expand
		if (props.path !== '' && route.path.startsWith(props.path)) {
			return true;
		}
	}

	// Check children recursively
	if (props.data && props.data.length > 0) {
		for (const child of props.data) {
			if (child.path && route.path.startsWith(child.path)) {
				return true;
			}

			// Check grandchildren recursively
			if (child.children && child.children.length > 0) {
				const hasActiveGrandchild = child.children.some(grandchild =>
					grandchild.path && route.path.startsWith(grandchild.path)
				);
				if (hasActiveGrandchild) {
					return true;
				}
			}
		}
	}

	return false;
};

// Methods
const toggleMenu = () => {
	expanded.value = !expanded.value;
	if (!showChildren.value) {
		showChildren.value = true;
		nextTick(() => {
			// Get actual height
			if (container.value) {
				containerHeight.value = `${container.value.scrollHeight}px`;
				setTimeout(() => {
					containerHeight.value = 'fit-content';
					if (navigator.userAgent.indexOf('Firefox') !== -1) {
						containerHeight.value = '-moz-max-content';
					}
					container.value.style.overflow = 'visible';
				}, 300);
			}
		});
	} else {
		if (container.value) {
			containerHeight.value = `${container.value.scrollHeight}px`;
			container.value.style.overflow = 'hidden';
			setTimeout(() => {
				containerHeight.value = '0px';
			}, 10);
			setTimeout(() => {
				showChildren.value = false;
			}, 300);
		}
	}
};

const navigateToPath = () => {
	router.push(props.path);
};

// Refs
const container = ref(null);

// Set initial state based on route
onMounted(() => {
	// Check if this menu item should be expanded (if it contains the active route)
	if (checkParentPath()) {
		expanded.value = true;
		showChildren.value = true;
		nextTick(() => {
			containerHeight.value = 'fit-content';
			if (navigator.userAgent.indexOf('Firefox') !== -1) {
				containerHeight.value = '-moz-max-content';
			}
			if (container.value) {
				container.value.style.overflow = 'visible';
			}
		});
	}
});

// Clean up on component unmount
onUnmounted(() => {
	// Clear any pending timers
	if (hoverTimer.value) {
		clearTimeout(hoverTimer.value);
	}
});

// Watch for route changes to update active state
watch(() => route.path, () => {
	// If we're not already expanded but should be, expand
	if (!expanded.value && checkParentPath()) {
		expanded.value = true;
		showChildren.value = true;
		nextTick(() => {
			containerHeight.value = 'fit-content';
			if (navigator.userAgent.indexOf('Firefox') !== -1) {
				containerHeight.value = '-moz-max-content';
			}
			if (container.value) {
				container.value.style.overflow = 'visible';
			}
		});
	}
});

// Watch for smallMenu changes to reset hover state
watch(() => props.smallMenu, (newVal) => {
	if (!newVal) {
		isHovering.value = false;
	}
});
</script>

<style lang="scss" scoped>
.menu-item {
	position: relative;
	width: 100%;

	.label {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		white-space: nowrap;
		user-select: none;
		height: 50px;
		padding: 0 20px;
		margin-top: 5px;
		border-radius: 10px;
		box-sizing: border-box;
		font-size: 14px;
		color: var(--pink-dark);
		transition: all 0.3s ease;
		font-weight: bold;

		&.small-label {
			padding: 0 10px;
			display: flex;
			justify-content: center;

			span {
				display: none;
			}

			.right {
				display: none;
			}
		}

		>div {
			display: flex;
			align-items: center;
			gap: 10px;
		}

		i {
			font-size: 20px;
			color: var(--pink-dark);
			transition: all 0.3s ease;

			&.expand {
				font-size: 16px;
				color: #cacaca;

				&.opened {
					transform: rotate(180deg);
				}
			}
		}

		&:hover {
			background: #fcdcd7;
			cursor: pointer;
		}

		&.activated {
			background: var(--pink-dark);
			background: linear-gradient(90deg,
					var(--pink-dark) 0%,
					var(--pink-med) 33%,
					var(--pink-light) 100%);
			color: var(--white);

			i {
				color: var(--white);
			}
		}
	}

	.items-container {
		width: 100%;
		transition: height 0.3s ease;
		overflow: hidden;
		border-radius: 10px;

		&.small-menu {
			width: 220px;
			position: absolute;
			background: #fff;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
			top: 0;
			left: 100%;
			z-index: 100;
			padding: 10px 0;

			.label {
				width: 100% !important;
				padding-left: 20px !important;
			}
		}
	}

	/* Hover submenu for collapsed sidebar */
	.hover-submenu {
		position: fixed;
		top: auto;
		left: 70px;
		/* Match the collapsed sidebar width */
		z-index: 200;

		.hover-menu-container {
			width: 220px;
			background: white;
			border-radius: 8px;
			box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
			padding: 10px 0;
			margin-left: 5px;

			.hover-menu-title {
				font-weight: bold;
				padding: 10px 15px;
				color: var(--pink-dark);
				border-bottom: 1px solid #f0f0f0;
				margin-bottom: 5px;
			}

			.hover-menu-item {
				padding: 10px 15px;
				display: flex;
				align-items: center;
				gap: 10px;
				cursor: pointer;
				transition: background 0.2s;
				position: relative;

				i {
					font-size: 18px;
					color: var(--pink-dark);
				}

				.submenu-indicator {
					position: absolute;
					right: 10px;
					font-size: 16px;
					color: #999;
				}

				&:hover {
					background: #f5f5f5;
				}

				&.active {
					background: rgba(210, 63, 87, 0.1);
					color: var(--pink-dark);
					font-weight: 500;
				}

				&.has-children {
					position: relative;

					/* Nested submenu */
					.nested-submenu {
						position: absolute;
						top: 0;
						left: 100%;
						background: white;
						border-radius: 8px;
						min-width: 200px;
						box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
						z-index: 210;
						margin-left: 5px;
						padding: 5px 0;
					}
				}
			}
		}
	}
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateX(-10px);
}

/* Responsive styles */
@media (max-width: 768px) {
	.menu-item {
		.items-container {
			&.small-menu {
				position: static;
				width: 100%;
				box-shadow: none;
				padding: 0;
			}
		}

		.label {
			&.small-label {
				padding: 0 20px;
				justify-content: space-between;

				span {
					display: inline;
				}

				.right {
					display: flex;
				}
			}
		}
	}
}

.break-words {
	text-wrap: wrap !important;
}
</style>