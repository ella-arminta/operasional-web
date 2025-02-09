<template>
	<div class="menu-item" :class="{ opened: expanded }">
		<div
			class="label break-words"
			:class="{ activated: isActive }"
			@click="path != '' ? $router.push(path) : toggleMenu()"
			:style="{ paddingLeft: depth * 20 + 20 + 'px' }"
		>
			<div class="left">
				<i v-if="icon" class="material-icons material-icons-outlined">{{
					icon
				}}</i>
				<span v-if="showLabel">{{ label }}</span>
			</div>
			<!-- Only show the expand icon if the item has children -->
			<div v-if="data && data.length > 0" class="right">
				<i class="expand material-icons" :class="{ opened: expanded }"
					>expand_more</i
				>
			</div>
		</div>
		<div
			v-show="showChildren"
			:class="{ 'small-menu': smallMenu }"
			class="items-container"
			:style="{ height: containerHeight }"
			ref="container"
		>
			<MenuItem
				:class="{ opened: showChildren }"
				v-for="(item, index) in data"
				:key="index"
				:data="item.children"
				:label="item.label"
				:icon="item.icon"
				:path="item.path"
				:depth="depth + 1"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import MenuItem from './MenuItem.vue'
import Sidebar from './MenuSidebar.vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
const smallMenu = computed(() => store.getters.smallMenu)
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
})

// State
const showChildren = ref(false)
const expanded = ref(false)
const containerHeight = ref('0px')
const route = useRoute()
const store = useStore()

// Computed
const showLabel = computed(() => {
	return store.getters.smallMenu ? props.depth > 0 : true
})

const isActive = computed(() => {
	return route.path.startsWith(props.path) && props.path !== ''
})

// Methods
const toggleMenu = () => {
	expanded.value = !expanded.value
	if (!showChildren.value) {
		showChildren.value = true
		nextTick(() => {
			containerHeight.value = `${container.value.scrollHeight}px`
			setTimeout(() => {
				containerHeight.value = 'fit-content'
				if (navigator.userAgent.indexOf('Firefox') !== -1) {
					containerHeight.value = '-moz-max-content'
				}
				container.value.style.overflow = 'visible'
			}, 300)
		})
	} else {
		containerHeight.value = `${container.value.scrollHeight}px`
		container.value.style.overflow = 'hidden'
		setTimeout(() => {
			containerHeight.value = '0px'
		}, 10)
		setTimeout(() => {
			showChildren.value = false
		}, 300)
	}
}

// Refs
const container = ref(null)
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
		> div {
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
		&.small-item {
			width: fit-content;
		}
		&:hover {
			background: #fcdcd7;
			cursor: pointer;
		}
		&.activated {
			background: var(--pink-dark);
			background: linear-gradient(
				90deg,
				var(--pink-dark) 0%,
				var(--pink-med) 33%,
				var(--pink-light) 100%
			);
			color: var(--white);
			i {
				color: var(--white);
			}
		}
	}
	.items-container {
		width: 100%;
		left: calc(100% + 6px);
		transition: height 0.3s ease;
		overflow: hidden;
		border-radius: 10px;
		&.small-menu {
			width: fit-content;
			position: absolute;
			background: #fff;
			box-shadow: 0 0 10px #ebebeb;
			top: 0;
			.label {
				width: 100% !important;
				padding-left: 20px !important;
			}
		}
	}
}
.break-words {
	text-wrap: wrap !important;
}
</style>
