<template>
	<div
		class="h-full md:h-3/4 max-h-[90vh] md:max-h-[70vh] w-full md:w-3/4 bg-white md:rounded-lg shadow-sm md:my-16 overflow-scroll flex flex-col justify-center items-center"
	>
		<h2 class="text-xl md:text-3xl text-pinkDark font-bold">
			You are forbidden!
		</h2>
		<h3 class="text-md md:text-lg text-pinkDark font-bold">
			Wait for your employeer to assign you to a job!
		</h3>
		<router-link
			to="/logout"
			class="text-md lg:text-lg text-pinkDark text-start underline mt-20"
		>
			Logout</router-link
		>
	</div>
</template>
