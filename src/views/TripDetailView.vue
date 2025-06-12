<template>
  <div
    class="container px-4 mx-auto mt-4 min-h-screen bg-white dark:bg-gray-900"
  >
    <button
      @click="$router.back()"
      class="mb-4 px-4 py-2 cursor-pointer bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
    >
      ← Kembali
    </button>
    <Loading :is-loading="isLoading" />
    <div v-if="!isLoading">
      <div class="flex flex-col md:flex-row gap-8 h-full">
        <!-- MAPS CARD -->
        <div
          ref="mapsCardRef"
          class="bg-white w-full h-full dark:bg-gray-800 rounded-lg shadow-md flex-1 flex flex-col items-center"
        >
          <h2
            class="text-xl font-bold mb-4 flex items-center gap-2 w-full px-6 pt-6"
          >
            <span
              class="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243a8 8 0 1111.314 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Lokasi Terakhir
            </span>
          </h2>
          <div class="w-full flex-1 h-full p-4">
            <Maps
              ref="mapsCardRef"
              :location="selectedLocation"
              style="width: 100%; height: 100%"
              :key="
                selectedLocation &&
                (selectedLocation.id ||
                  selectedLocation.timestamp ||
                  selectedLocation.timeStamp)
              "
            />
          </div>
        </div>
        <!-- TIMELINE CARD -->
        <div
          class="bg-white w-full h-full dark:bg-gray-800 rounded-lg shadow-md flex-1 flex flex-col"
        >
          <h2
            class="text-xl font-bold mb-4 flex items-center gap-2 w-full px-6 pt-6"
          >
            <span
              class="inline-block bg-green-100 text-green-700 rounded px-2 py-1 text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3"
                />
              </svg>
              Timeline Perjalanan
            </span>
          </h2>
          <div class="w-full p-4 overflow-y-auto">
            <Timeline
              :timelines="timelines"
              style="width: 100%; height: 40rem"
              @select="handleSelectLocation"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Maps from "@/components/maps.vue";
import Timeline from "@/components/Timeline.vue";
import Loading from "@/components/Loading.vue";

const route = useRoute();
const tripId = route.params.id;
const timelines = ref([]);
const lastLocation = ref(null);
const selectedLocation = ref(null);
const isLoading = ref(false);
const mapsCardRef = ref(null);

const reverseGeocode = async (lat, lon) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    return res.data.display_name || `${lat}, ${lon}`;
  } catch {
    return `${lat}, ${lon}`;
  }
};

const getTimeline = async () => {
  isLoading.value = true;
  timelines.value = [];
  lastLocation.value = null;
  selectedLocation.value = null;
  try {
    const res = await axios.get(`/api/location/${tripId}`, {
      withCredentials: true,
    });
    const timelineData = res.data;
    const timelinesWithAddress = await Promise.all(
      timelineData.map(async (item) => ({
        ...item,
        address: await reverseGeocode(item.latitude, item.longitude),
      }))
    );
    timelines.value = timelinesWithAddress;
    lastLocation.value =
      timelineData.length > 0
        ? {
            ...timelineData[timelineData.length - 1],
            address: timelinesWithAddress[timelineData.length - 1]?.address,
          }
        : null;
    selectedLocation.value = lastLocation.value;
    console.log("Timelines:", timelines.value);
    console.log("Last Location:", lastLocation.value);
  } catch (error) {
    console.error("Error fetching timeline:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSelectLocation = async (item) => {
  selectedLocation.value = item;
  await nextTick();
  if (mapsCardRef.value) {
    mapsCardRef.value.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

onMounted(() => {
  getTimeline();
});
</script>

<style scoped>
:deep(#map) {
  min-height: 400px !important;
  height: 500px !important;
}
</style>
