<template>
  <div class="driver-tracking">
    <!-- Alert -->
    <transition name="fade">
      <div
        v-if="showAlert"
        class="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce"
        style="min-width: 220px; max-width: 90vw; justify-content: center"
      >
        <svg
          class="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span class="font-semibold text-base truncate">{{ alertMessage }}</span>
      </div>
    </transition>

    <!-- Loading Indicator with Blur Effect -->
    <div
      v-if="isLoading"
      class="loading-overlay fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex justify-center items-center"
    >
      <div class="loader"></div>
    </div>

    <!-- Controls -->
    <div
      class="controls gap-4 mb-6 flex flex-col md:flex-row justify-between w-full"
    >
      <button @click="startTrip" :disabled="isDriving" class="btn start-btn">
        Mulai Berkendara
      </button>
      <button @click="endTrip" :disabled="!isDriving" class="btn stop-btn">
        Selesai Berkendara
      </button>
      <button
        v-if="isDriving"
        @click="manualFetchLocation"
        class="btn take-location-btn"
      >
        Ambil Lokasi Sekarang
      </button>
    </div>

    <div
      v-if="isDriving"
      class="mb-2 text-center text-sm text-blue-600 dark:text-blue-300 font-semibold"
    >
      Pengambilan lokasi otomatis dalam {{ formatCountdown }}
    </div>

    <!-- Checkpoints -->
    <div class="checkpoints">
      <h3 class="checkpoints-title">Daftar Lokasi</h3>
      <ul class="location-list">
        <li
          v-for="(location, index) in locations"
          :key="index"
          class="location-item"
        >
          <div class="location-card" :class="{ 'last-location': index === 0 }">
            <div class="location-details">
              <p>Lokasi: {{ location.latitude }}, {{ location.longitude }}</p>
              <p>Jalan: {{ location.streetName || "Menunggu alamat..." }}</p>
              <p>Kota: {{ location.city || "Tidak diketahui" }}</p>
              <p>Provinsi: {{ location.state || "Tidak diketahui" }}</p>
              <b>{{ location.timestamp }}</b>
            </div>
            <p v-if="index === 0" class="last-location-tag items-center">
              Lokasi Terakhir
            </p>
          </div>
        </li>
      </ul>
    </div>

    <!-- Mobile Footer -->
    <div class="mobile-footer">
      <p>
        Tracking Kendaraan:
        <span class="status">{{
          isDriving ? "Sedang Berkendara" : "Tidak Berkendara"
        }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const isDriving = ref(false);
const locations = ref([]);
const currentLocation = ref({
  latitude: null,
  longitude: null,
  timestamp: null,
  streetName: null,
  city: null,
  state: null,
});
let locationInterval = null;
const alertMessage = ref("");
const showAlert = ref(false);
const isLoading = ref(false);
const intervalSeconds = ref(20);
const countdownSeconds = ref(intervalSeconds.value);
let countdownInterval = null;

const setInitialLocation = async () => {
  return new Promise((resolve) => {
    const defaultLocation = { latitude: -6.2088, longitude: 106.8456 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const timestamp = new Date().toLocaleTimeString();
          resolve({ latitude, longitude, timestamp });
        },
        () => resolve(defaultLocation)
      );
    } else {
      resolve(defaultLocation);
    }
  });
};

const getCurrentLocation = async () => {
  isLoading.value = true; // Show loading indicator
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const timestamp = new Date().toLocaleTimeString();

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            const streetName = data.address
              ? data.address.road
              : "Tidak diketahui";
            const city = data.address ? data.address.city : "Tidak diketahui";
            const state = data.address ? data.address.state : "Tidak diketahui";

            resolve({
              latitude,
              longitude,
              timestamp,
              streetName,
              city,
              state,
            });
          } catch (error) {
            console.error("Gagal mengambil alamat:", error);
            resolve({
              latitude,
              longitude,
              timestamp,
              streetName: null,
              city: null,
              state: null,
              error: true,
            });
          } finally {
            isLoading.value = false; // Hide loading indicator
          }
        },
        (error) => {
          isLoading.value = false; // Hide loading indicator if error
          reject(error);
        }
      );
    } else {
      isLoading.value = false; // Hide loading indicator if geolocation is not supported
      reject("Geolocation tidak didukung oleh browser ini.");
    }
  });
};

function showLocationAlert(msg) {
  alertMessage.value = msg;
  showAlert.value = true;
  setTimeout(() => {
    showAlert.value = false;
  }, 2000);
}

const fetchAndStoreLocation = async () => {
  const location = await getCurrentLocation();
  if (location) {
    locations.value.unshift({ ...location, isCheckpoint: false });
    currentLocation.value = location;
    showLocationAlert("Pengambilan lokasi berhasil!");
  }
};

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownSeconds.value = intervalSeconds.value;
  countdownInterval = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
};

const trackLocation = async () => {
  if (locationInterval) clearInterval(locationInterval);
  if (isDriving.value) {
    await fetchAndStoreLocation();
  }
  startCountdown();
  locationInterval = setInterval(async () => {
    await fetchAndStoreLocation();
    countdownSeconds.value = intervalSeconds.value; // Reset countdown sesuai interval
  }, intervalSeconds.value * 1000);
};

const startTrip = async () => {
  isDriving.value = true;
  locations.value = [];
  await setInitialLocation().then((initialLocation) => {
    currentLocation.value = initialLocation;
  });
  trackLocation();
  localStorage.setItem("isDriving", "true");
};

const endTrip = () => {
  isDriving.value = false;
  if (locationInterval) clearInterval(locationInterval);
  locationInterval = null;
  stopCountdown();
  localStorage.removeItem("isDriving");
};

const manualFetchLocation = async () => {
  await fetchAndStoreLocation();
  countdownSeconds.value = intervalSeconds.value;
};

const formatCountdown = computed(() => {
  const sec = countdownSeconds.value;
  const h = Math.floor(sec / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
});

onMounted(() => {
  if (localStorage.getItem("isDriving") === "true") {
    isDriving.value = true;
    fetchAndStoreLocation();
    if (locationInterval) clearInterval(locationInterval);
    startCountdown();
    locationInterval = setInterval(async () => {
      await fetchAndStoreLocation();
      countdownSeconds.value = intervalSeconds.value;
    }, intervalSeconds.value * 1000);
  }
});
</script>

<style scoped>
.driver-tracking {
  padding: 20px;
  font-family: "Poppins", sans-serif;
  background-color: #f0f4f8;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 20px auto;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px; /* Mengatur jarak antar tombol */
}

@media (max-width: 600px) {
  .controls {
    flex-direction: column; /* Tombol akan tampil vertikal pada layar kecil */
    gap: 10px; /* Jarak antar tombol */
  }
}

.btn {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.3s, transform 0.3s ease-in-out,
    box-shadow 0.2s ease;
  border: none;
  cursor: pointer;
  width: 100%; /* Membuat tombol memenuhi lebar kontainer */
}

.start-btn {
  background-color: #4caf50;
  color: white;
}

.start-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.start-btn:active {
  transform: translateY(4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.start-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.stop-btn {
  background-color: #f44336;
  color: white;
}

.stop-btn:hover {
  background-color: #e53935;
  transform: translateY(-2px);
}

.stop-btn:active {
  transform: translateY(4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.stop-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* New Button for 'Ambil Lokasi Sekarang' */
.take-location-btn {
  background-color: #2196f3;
  color: white;
}

.take-location-btn:hover {
  background-color: #1976d2;
  transform: translateY(-2px);
}

.take-location-btn:active {
  transform: translateY(4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.take-location-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.checkpoints-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

/* Styling Scrollable List */
.location-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
}

.location-item {
  margin-bottom: 20px;
}

.location-card {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  min-height: 120px;
}

.location-number {
  font-weight: 600;
  font-size: 16px;
  flex-basis: 20%;
}

.location-details {
  font-size: 14px;
  color: #555;
  flex-basis: 55%;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  position: absolute;
  bottom: 10px;
  left: 15px;
}

.last-location-tag {
  font-weight: bold;
  color: #4caf50;
  margin-top: 10px;
}

.mobile-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #777;
}

@media (max-width: 600px) {
  .controls {
    text-align: center;
    gap: 10px; /* Menambahkan jarak antar tombol */
  }

  .location-card {
    min-height: auto;
  }

  .location-number,
  .location-details {
    flex-basis: 100%;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bouncing Alert Animation */
.fixed {
  animation: bounceInOut 4s ease-in-out;
}

@keyframes bounceInOut {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  30% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px);
  }
  70% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(50px);
  }
}

/* Loading Animation */
.loading-overlay .loader {
  border: 8px solid #f3f3f3; /* Light gray background */
  border-top: 8px solid #3498db; /* Blue color for the rotating part */
  border-radius: 50%;
  width: 80px; /* Increased size for better visibility */
  height: 80px; /* Increased size for better visibility */
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
