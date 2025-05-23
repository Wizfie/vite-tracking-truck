<template>
  <div class="w-full md:w-1/2 mx-auto">
    <h2 class="text-2xl font-bold mb-4">Maps</h2>
    <div id="map" class="h-[150px] md:h-[500px] border-2 rounded-sm"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map = null;

// Fungsi untuk memulai peta
const initializeMap = () => {
  if (map) return; // Cegah duplikasi
  map = L.map("map").setView([-6.1908473, 106.5657185], 20); // Set titik awal dan zoom

  // Menambahkan layer OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Contoh marker
  L.marker([-6.1908473, 106.5657185])
    .addTo(map)
    .bindPopup("Hello, OpenStreetMap!")
    .openPopup();
};

onMounted(() => {
  initializeMap(); // Inisialisasi peta setelah komponen dimuat
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped></style>
