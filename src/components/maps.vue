<template>
  <div class="w-full md:w-1/2 mx-auto">
    <h2 class="text-2xl font-bold mb-4">Maps</h2>
    <div id="map" class="h-[150px] md:h-[500px] border-2 rounded-sm"></div>
    <div v-if="location" class="mt-4">
      <div
        v-if="location.address"
        class="text-base text-gray-700 dark:text-gray-200 text-center px-6"
      >
        <span class="font-semibold">Alamat:</span>
        {{ location.address }}
      </div>
      <div
        v-if="location.timeStamp || location.timestamp"
        class="text-xs text-gray-500 mt-1 text-center px-6"
      >
        <span class="font-semibold">Waktu update:</span>
        {{
          new Date(location.timestamp || location.timeStamp).toLocaleString(
            "id-ID",
            { dateStyle: "medium", timeStyle: "short" }
          )
        }}
      </div>
      <div
        v-if="location.latitude && location.longitude"
        class="text-xs text-gray-500 mt-1 text-center px-6"
      >
        Koordinat: {{ location.latitude }}, {{ location.longitude }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const props = defineProps({
  location: {
    type: Object,
    default: null,
  },
});

let map = null;
let marker = null;

// Fungsi untuk memulai peta
const initializeMap = () => {
  map = L.map("map").setView([-6.2, 106.8], 12); // Set titik awal dan zoom
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
};

// Fungsi untuk memperbarui marker
const updateMarker = () => {
  if (!map) return;
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
  if (props.location && props.location.latitude && props.location.longitude) {
    marker = L.marker([
      props.location.latitude,
      props.location.longitude,
    ]).addTo(map);
    map.setView([props.location.latitude, props.location.longitude], 15);
  }
};

onMounted(() => {
  initializeMap(); // Inisialisasi peta setelah komponen dimuat
  updateMarker();
});

watch(
  () => props.location,
  () => {
    updateMarker();
  }
);

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}
</style>
