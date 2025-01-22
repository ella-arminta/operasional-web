<template>
    <div class="bg-white w-full h-[90px] rounded-lg relative mb-5 shadow-sm">
        <div class="flex items-center justify-between px-4 py-2 h-full"> <!-- Set h-full here to make the child follow the parent's height -->
            <div class="flex flex-col justify-center"> <!-- Ensure content is centered vertically -->
                <h1 class="text-2xl font-bold text-pinkDark">{{ title }}</h1>
                <p class="text-md text-gray-500">{{ breadcrumb }}</p>
            </div>
            <div class="flex items-center justify-center h-full"> <!-- Set h-full here too -->
                <p class="text-lg text-gray-500 mr-5">{{ name }}</p>
                <div class="bg-pinkDark text-white w-10 h-10 rounded-full flex items-center justify-center">
                    <p>{{ inisial }}</p>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import Cookies from 'js-cookie';

export default {
    data() {
        const path = window.location.pathname;
        const breadcrumb = path
            .split('/')
            .slice(1)
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' / ');

        const title =
            path.split('/').pop()?.charAt(0).toUpperCase() + path.split('/').pop()?.substring(1);

        const userdata = JSON.parse(Cookies.get('userdata'));
        console.log(userdata);
        const name = userdata.email;
        const inisial = name.split(' ').map((n) => n.charAt(0)).join('');

        return {
            title,
            breadcrumb,
            name,
            inisial,
        };
    },
};
</script>
