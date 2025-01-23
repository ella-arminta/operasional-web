<template>
  <div class="content min-h-screen">
    <PageTitle />
    <!-- Form section -->
    <form
      class="w-full bg-white h-auto rounded-lg shadow-sm py-3 px-4"
      @submit.prevent="submit"
    >
      <div class="flex items-center justify-between">
        <h1 class="text-xl text-pinkDark">
          {{
            mode === "edit"
              ? "Edit Company"
              : mode === "add"
                ? "Add Company"
                : "Company Detail"
          }}
        </h1>
        <div class="flex gap-4">
          <button
            v-if="mode === 'edit' && hasUnsavedChanges"
            class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
            type="button"
            @click="resetForm"
          >
            <i class="material-icons text-md">history</i>
            Reset
          </button>
          <button
            v-if="mode !== 'view'"
            class="flex items-center bg-pinkMed text-white px-4 py-2 rounded-lg gap-1 align-center hover:bg-pinkDark transition duration-300"
            type="submit"
          >
            <i class="material-icons text-md">save</i>
            Save
          </button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-6 mt-4">
        <div class="space-y-3">
          <div>
            <label
              for="code"
              class="block text-sm text-grey-900 font-medium mb-1"
            >
              Code<span class="text-pinkDark">*</span>
            </label>
            <input
              v-model="form.code"
              type="text"
              id="code"
              name="code"
              placeholder="Code"
              class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-3 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
              :class="{
                'border-pinkDark': formError.code,
                'border-pinkOrange': !formError.code,
              }"
              :readonly="mode === 'view'"
            />
            <p
              v-if="formError.code"
              class="text-pinkDark text-xs italic transition duration-300"
            >
              {{ formError.code }}
            </p>
          </div>
          <div>
            <label
              for="name"
              class="block text-sm text-grey-900 font-medium mb-1"
            >
              Name<span class="text-pinkDark">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-3 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
              :class="{
                'border-pinkDark': formError.code,
                'border-pinkOrange': !formError.code,
              }"
              :readonly="mode === 'view'"
            />
            <p
              v-if="formError.name"
              class="text-pinkDark text-xs italic transition duration-300"
            >
              {{ formError.name }}
            </p>
          </div>
        </div>

        <div>
          <label
            for="description"
            class="block text-sm text-grey-900 font-medium mb-1"
          >
            Description
          </label>
          <textarea
            v-model="form.description"
            id="description"
            name="description"
            placeholder="Type your description..."
            rows="5"
            class="w-full bg-pinkGray border border-pinkOrange border-opacity-25 transition duration-300 placeholder-pinkOrange placeholder-opacity-25 rounded-lg px-3 py-2 text-pinkDark focus:outline-none focus:ring focus:ring-pinkOrange focus:ring-opacity-25"
            :class="{
              'border-pinkDark': formError.code,
              'border-pinkOrange': !formError.code,
            }"
            :readonly="mode === 'view'"
          ></textarea>
          <p
            v-if="formError.description"
            class="text-pinkDark text-xs italic transition duration-300"
          >
            {{ formError.description }}
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axiosInstance from "../../axios";
import PageTitle from "../../components/PageTitle.vue";

const props = defineProps({
  mode: { type: String, required: true },
});

const form = ref({ code: "", name: "", description: "" });
const formCopy = ref({ code: "", name: "", description: "" });
const formError = ref({ code: "", name: "", description: "" });

const router = useRouter();
const store = useStore();

const id = router.currentRoute.value.params.id;

onMounted(async () => {
  if (props.mode !== "add" && id) {
    try {
      const response = await axiosInstance.get(`/master/company/${id}`);
      form.value = { ...response.data.data };
      formCopy.value = { ...form.value };
    } catch (error) {
      store.dispatch("triggerAlert", {
        type: "error",
        title: "Error!",
        message: "Failed to fetch company data.",
        actions: [
          {
            label: "close",
            type: "secondary",
            handler: () => store.dispatch("hideAlert"),
          },
        ],
      });
    }
  }
});

const resetError = () => {
  formError.value = { code: "", name: "", description: "" };
};

const resetForm = () => {
  form.value = { ...formCopy.value };
};

const hasUnsavedChanges = computed(() => {
  return (
    form.value.code !== formCopy.value.code ||
    form.value.name !== formCopy.value.name ||
    form.value.description !== formCopy.value.description
  );
});

const submit = async () => {
  resetError();
  try {
    const endpoint =
      props.mode === "edit" ? `/master/company/${id}` : "/master/company";
    const method = props.mode === "edit" ? "put" : "post";
    const response = await axiosInstance[method](endpoint, form.value);

    if (response.data) {
      const action = props.mode === "edit" ? "Updated" : "Created";
      store.dispatch("triggerAlert", {
        type: "success",
        title: "Success!",
        message: `Company ${response.data.data.name} ${action}.`,
        actions: [
          {
            label: "close",
            type: "secondary",
            handler: () => store.dispatch("hideAlert"),
          },
        ],
      });
      router.push("/master/company");
    }
  } catch (error) {
    console.error(error.response.data);
    const errors = error.response.data.errors || [];
    errors.forEach((err) => {
      formError.value[err.field] = err.message;
    });
    store.dispatch("triggerAlert", {
      type: "error",
      title: "Error!",
      message: `Company ${props.mode === "edit" ? "update" : "creation"} failed.`,
    });
  }
};
</script>
