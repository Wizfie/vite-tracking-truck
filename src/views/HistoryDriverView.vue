<template>
  <div
    class="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
  >
    <h1 class="text-3xl font-bold mt-2 mb-4">Riwayat Perjalanan</h1>
    <div v-if="!locations || locations.length === 0">
      <p class="text-lg mb-6">Belum ada riwayat perjalanan</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <router-link
          class="text-blue-500 hover:underline"
          :to="{ name: 'home' }"
        >
          &gt;&gt; Klik untuk mulai perjalanan &lt;&lt;
        </router-link>
      </p>
    </div>
    <div v-else class="w-full max-w-2xl">
      <div
        v-for="trip in locations.trips"
        :key="trip.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 p-4"
      >
        <router-link
          :to="{
            name: 'checkpoint-detail',
            query: { tripId: trip.id },
          }"
          class="block hover:bg-blue-50 dark:hover:bg-gray-700 rounded px-2 py-1 mb-2"
        >
          <div class="flex flex-col md:flex-row md:items-center md:gap-4">
            <div class="font-semibold text-lg mb-1">Trip ID: {{ trip.id }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Kendaraan: {{ trip.vehicle?.platNumber || "-" }} ({{
                trip.vehicle?.brand || "-"
              }})
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Driver: {{ trip.user?.username || "-" }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Mulai: {{ formatDate(trip.startTime) }}
              <span v-if="trip.endTime"
                >&nbsp;|&nbsp;Selesai: {{ formatDate(trip.endTime) }}</span
              >
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/store";
import axios from "axios";
import { onMounted, computed, ref } from "vue";
import { formatDate } from "@/utils/utils/utils";

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const locations = ref([]);
const getHistory = async () => {
  try {
    const active = false;
    const res = await axios.get(
      `/api/trip/user/${user.value.id}?active=${active}`,
      { withCredentials: true }
    );
    console.log(res.data);
    locations.value = res.data;
  } catch (error) {
    console.error("Error fetching history:", error);
  }
};

onMounted(() => {
  if (user.value) {
    getHistory();
  }
});
</script>

<style scoped>
.bg-white {
  background-color: #fff;
}
.dark .bg-white {
  background-color: #23272f;
}
</style>
