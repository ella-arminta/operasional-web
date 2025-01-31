<template>
	<div class="bg-white w-full h-[90px] rounded-lg relative mb-5 shadow-sm">
		<div
			class="flex items-center justify-between px-4 py-2 h-full flex-wrap"
		>
			<!-- Set h-full here to make the child follow the parent's height -->
			<div class="flex flex-col justify-center">
				<!-- Ensure content is centered vertically -->
				<h1
					class="text-xl text-pinkDark font-bold"
					:class="{ 'pl-2': title !== 'Home' }"
				>
					{{ title }}
				</h1>
				<div class="flex items-center">
					<button
						v-if="title !== 'Home'"
						class="flex items-center rounded-sm"
						@click="router.back()"
					>
						<i
							class="material-icons text-md text-gray-400 hover:text-pinkDark"
							>chevron_left</i
						>
					</button>
					<p class="text-sm text-gray-400 font-light">
						{{ breadcrumb }}
					</p>
				</div>
			</div>

			<div class="flex items-center justify-center h-full">
				<!-- Set h-full here too -->
				<p class="text-lg text-gray-500 mr-5">{{ name }}</p>
				<div
					class="bg-pinkDark text-white w-10 h-10 rounded-full flex items-center justify-center"
				>
					<p>{{ inisial }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Cookies from 'js-cookie'
import { useRouter } from 'vue-router'

const props = defineProps({
	title: {
		String,
		default: '',
	},
})

const router = useRouter()
const path = window.location.pathname
const breadcrumb = path
	.split('/')
	.slice(1)
	.map((s) => {
		return s.split('-')[0]
	})
	.join(' / ')

const title =
	props.title != ''
		? props.title
		: path.split('/').length > 2
			? path.split('/')[2]?.charAt(0).toUpperCase() +
				path.split('/')[2]?.substring(1)
			: path.split('/').pop()?.charAt(0).toUpperCase() +
				path.split('/').pop()?.substring(1)

const userdata = JSON.parse(Cookies.get('userdata'))
const name = userdata.email.split('@')[0]
const inisial = name
	.split(' ')
	.map((n) => n.charAt(0))
	.join('')
</script>
