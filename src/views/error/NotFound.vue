<template>
	<div class="h-screen w-screen flex items-center justify-center">
		<div
			class="flex flex-col items-center justify-center text-center gap-4 px-40 py-20 rounded-lg bg-white shadow-md"
		>
			<h1 class="text-9xl text-pinkDark font-black">404</h1>
			<h2 class="text-xl text-pinkDark">Page Not Found</h2>
			<router-link to="/home" class="text-pinkDark w-full">
				<div
					class="text-pinkDark px-4 py-2 rounded-full bg-pinkLight hover:bg-pinkDark hover:text-white transition duration-300"
				>
					Go to Home
				</div>
			</router-link>
		</div>
	</div>
</template>
