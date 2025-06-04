<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overscroll-none overflow-y-auto touch-none select-none"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative"
    >
      <button
        @click="$emit('close')"
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Tambah Kendaraan
      </h2>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block text-gray-700 dark:text-gray-200 mb-1"
            >Plat Nomor</label
          >
          <input
            @input="form.platNumber = form.platNumber.toUpperCase()"
            v-model="form.platNumber"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-gray-100"
            placeholder="B 1234 ABC"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 dark:text-gray-200 mb-1"
            >Merk</label
          >
          <input
            @input="form.brand = form.brand.toUpperCase()"
            v-model="form.brand"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Toyota, Honda, dll"
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 dark:text-gray-200 mb-1"
            >Tipe</label
          >
          <input
            @input="form.type = form.type.toUpperCase()"
            v-model="form.type"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Truk, Pickup, dll"
          />
        </div>
        <div class="mb-4" v-if="!isUser">
          <label class="block text-gray-700 dark:text-gray-200 mb-1"
            >Perusahaan</label
          >
          <input
            v-model="form.company"
            @input="form.company = form.company.toUpperCase()"
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Nama Perusahaan"
          />
        </div>
        <div v-else class="mb-4">
          <label class="block text-gray-700 dark:text-gray-200 mb-1"
            >Perusahaan</label
          >
          <input
            v-model="form.company"
            class="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-400 cursor-not-allowed"
            readonly
            disabled
          />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from "vue";
const props = defineProps({
  show: Boolean,
  user: Object,
});
const emit = defineEmits(["close", "submit"]);
const form = reactive({
  platNumber: "",
  brand: "",
  type: "",
  company: "",
});

const isUser = computed(() => props.user?.role === "USER");

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.platNumber = "";
      form.brand = "";
      form.type = "";
      form.company = isUser.value ? props.user?.company || "" : "";
    }
  }
);

function submitForm() {
  emit("submit", { ...form });
}
</script>
