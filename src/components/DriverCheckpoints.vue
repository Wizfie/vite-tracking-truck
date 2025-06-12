<template>
  <div class="checkpoints">
    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-700 mb-4">
      Daftar Lokasi
    </h3>
    <ul class="max-h-72 overflow-y-auto pr-2">
      <li v-for="(location, index) in locations" :key="index" class="mb-5">
        <div
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center min-h-[100px] relative"
        >
          <div class="text-sm text-gray-700 dark:text-gray-200">
            <p>Lokasi: {{ location.latitude }}, {{ location.longitude }}</p>
            <p>Jalan: {{ location.streetName || "Menunggu alamat..." }}</p>
            <p>Kota: {{ location.city || "Tidak diketahui" }}</p>
            <p>Kode Pos: {{ location.postcode || "Tidak diketahui" }}</p>
            <b>{{ location.timestamp }}</b>
          </div>
          <p v-if="index === 0" class="font-bold text-green-600 mt-2 md:mt-0">
            Lokasi Terakhir
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  locations: Array,
});
</script>
