<template>
  <div
    class="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4"
  >
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
      Profile
    </h1>
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-xl"
    >
      <p class="text-gray-700 dark:text-gray-300 mb-4">
        <strong>Username :</strong> {{ user.username.toUpperCase() }}
      </p>
      <p class="text-gray-600 dark:text-gray-400">profile details here.</p>
    </div>
    <div
      class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-xl"
    >
      <div class="flex flex-col md:flex-row justify-between mb-4 mx-6">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Daftar Kendaraan
        </h2>
        <button
          class="bg-blue-500 rounded-sm p-2 flex gap-2 items-center text-center justify-center cursor-pointer text-white focus:outline-none focus:ring-2 focus:ring-blue-800 hover:bg-blue-600 transition-colors duration-300"
          @click="showModal = true"
        >
          <svg
            id="fi_4315609"
            enable-background="new 0 0 512 512"
            height="20"
            viewBox="0 0 512 512"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="m256 0c-141.2 0-256 114.8-256 256s114.8 256 256 256 256-114.8 256-256-114.8-256-256-256z"
              fill="#4bae4f"
              fill-rule="evenodd"
            ></path>
            <path
              d="m116 279.6v-47.3c0-4.8 3.9-8.8 8.8-8.8h98.9v-98.8c0-4.8 3.9-8.8 8.8-8.8h47.3c4.8 0 8.7 3.9 8.7 8.8v98.9h98.8c4.8 0 8.8 3.9 8.8 8.8v47.3c0 4.8-3.9 8.7-8.8 8.7h-98.9v98.8c0 4.8-3.9 8.8-8.7 8.8h-47.3c-4.8 0-8.8-3.9-8.8-8.8v-98.9h-98.8c-4.9.1-8.8-3.9-8.8-8.7z"
              fill="#fff"
            ></path>
          </svg>
          Kendaraan
        </button>
      </div>
      <ul class="max-h-80 overflow-y-auto pr-2">
        <li v-for="(vehicle, index) in vehicles" :key="index" class="mb-5">
          <div
            class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-slate-200 min-h-[100px] relative"
          >
            <div class="text-sm text-gray-700 dark:text-gray-200">
              <p>
                Plat Nomor :
                <span>
                  <strong class="mx-2">{{ vehicle.platNumber }}</strong>
                </span>
              </p>
              <p>
                Merk :
                <strong class="mx-2">
                  {{ vehicle.brand || "Tidak diketahui" }}
                </strong>
              </p>
              <p>
                Tipe :
                <strong class="mx-2">
                  {{ vehicle.type || "Tidak diketahui" }}
                </strong>
              </p>
            </div>
            <p class="font-bold text-green-600 mt-2 md:mt-0">
              Kendaraan {{ index + 1 }}
            </p>
          </div>
        </li>
      </ul>
    </div>
    <VehicleModal
      :show="showModal"
      :user="user"
      @close="showModal = false"
      @submit="handleAddVehicle"
    />
  </div>
</template>
<script setup>
import { useAuthStore } from "@/stores/store";
import VehicleModal from "@/components/VehicleModal.vue";
import { ref, computed } from "vue";
import axios from "axios";
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const showModal = ref(false);

const vehicles = ref([]);

async function fetchVehicles() {
  try {
    const res = await axios.get("/api/vehicle/all", { withCredentials: true });

    vehicles.value = res.data.vehicles.filter(
      (vehicle) => vehicle.company === user.value.company
    );
  } catch (e) {
    vehicles.value = [];
  }
}

fetchVehicles();

async function handleAddVehicle(vehicle) {
  try {
    // Tambahkan company dari user
    const payload = { ...vehicle, company: user.value.company };
    await axios.post("/api/vehicle/add", payload, { withCredentials: true });
    await fetchVehicles();
    alert("Berhasil menambahkan kendaraan baru.");
  } catch (e) {
    console.log(e.response?.data?.error || e.message);
  }
  showModal.value = false;
}
</script>
<style scoped></style>
