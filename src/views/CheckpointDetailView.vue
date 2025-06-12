<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">Detail Checkpoint Lokasi</h2>
    <div v-if="isLoading">
      <p class="text-blue-500">Sedang memuat data lokasi dan alamat...</p>
    </div>
    <div v-else-if="!location || location.length === 0">
      <p class="text-gray-500">Data tidak ditemukan.</p>
    </div>
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <ol class="list-decimal ml-5">
        <li v-for="loc in location" :key="loc.id" class="mb-4">
          <div class="mb-1">
            <span class="font-semibold">Waktu : </span>
            <span>{{ formatDateTime(loc.timeStamp || loc.timestamp) }}</span>
          </div>
          <div class="mb-1">
            <span class="font-semibold">Koordinat : </span>
            <span>[{{ loc.latitude }}, {{ loc.longitude }}]</span>
          </div>
          <div class="mb-1">
            <span class="font-semibold">Alamat : </span>
            <span>
              <template v-if="loc.address && loc.address.streetName !== null">
                {{ loc.address?.streetName || "-" }},
                {{ loc.address?.city || "-" }},
                {{ loc.address?.postcode || "-" }}
              </template>
              <template v-else>
                <span class="italic text-gray-400">Gagal reverse geocode</span>
              </template>
            </span>
          </div>
          <hr class="my-2 border-gray-300 dark:border-gray-600" />
        </li>
      </ol>
      <div class="mt-4">
        <router-link
          :to="{ name: 'history-driver' }"
          class="text-blue-500 hover:underline"
          >Kembali ke Riwayat</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const location = ref(null);
const isLoading = ref(true);

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("id-ID", { hour12: false }) +
      " " +
      d.toLocaleTimeString("id-ID", { hour12: false })
    );
  } catch {
    return dateStr;
  }
}

// Simple persistent cache for reverse geocode using localStorage
function getGeocodeCache() {
  try {
    return JSON.parse(localStorage.getItem("geocodeCache") || "{}");
  } catch {
    return {};
  }
}
function setGeocodeCache(cache) {
  localStorage.setItem("geocodeCache", JSON.stringify(cache));
}
function clearGeocodeCache() {
  localStorage.removeItem("geocodeCache");
}
const geocodeCache = getGeocodeCache();

async function reverseGeocode(latitude, longitude) {
  const key = `${latitude},${longitude}`;
  if (geocodeCache[key] && geocodeCache[key].streetName !== null) {
    return geocodeCache[key];
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const data = await response.json();
    const result = {
      streetName: data.address?.road || "Tidak diketahui",
      city: data.address?.city || "Tidak diketahui",
      postcode: data.address?.postcode || "Tidak diketahui",
    };
    geocodeCache[key] = result;
    setGeocodeCache(geocodeCache);
    return result;
  } catch {
    return { streetName: null, city: null, postcode: null };
  }
}

// Helper: reverse geocode dengan retry sampai maxAttempts
async function reverseGeocodeWithRetry(latitude, longitude, maxAttempts = 3) {
  let attempt = 0;
  let result = null;
  while (attempt < maxAttempts) {
    result = await reverseGeocode(latitude, longitude);
    if (result && result.streetName !== null) {
      return result;
    }
    attempt++;
    // Delay antar percobaan (misal 1 detik)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return result;
}

onMounted(async () => {
  // Ambil tripId dari query/params
  let tripId = null;
  if (route.query && route.query.tripId) {
    tripId = route.query.tripId;
  } else if (route.params && route.params.tripId) {
    tripId = route.params.tripId;
  }

  isLoading.value = true;
  if (tripId) {
    // Ambil semua lokasi trip dari endpoint location
    try {
      const res = await axios.get(`/api/location/${tripId}`, {
        withCredentials: true,
      });
      const locationsArr = res.data.locations || res.data || [];
      // Reverse geocode semua lokasi, retry jika gagal
      const promises = locationsArr.map(async (loc) => {
        if (loc.latitude && loc.longitude) {
          loc.address = await reverseGeocodeWithRetry(
            loc.latitude,
            loc.longitude
          );
        } else {
          loc.address = { streetName: null, city: null, postcode: null };
        }
        return loc;
      });
      location.value = await Promise.all(promises);
    } catch (e) {
      location.value = null;
    }
  } else {
    location.value = null;
  }
  isLoading.value = false;
});

onUnmounted(() => {
  // Clear cache saat keluar dari halaman detail checkpoint
  clearGeocodeCache();
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
