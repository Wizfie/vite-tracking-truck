<template>
  <div class="driver-tracking">
    <!-- Alert -->
    <Alert :showAlert="showAlert" :alertMessage="alertMessage" />

    <!-- Loading -->
    <Loading :is-loading="isLoading" />

    <!-- Status Trip Aktif -->
    <div
      v-if="isDriving"
      class="mb-2 p-2 bg-green-100 text-green-800 rounded text-sm"
    >
      Trip masih berjalan dengan kendaraan:
      <span class="font-semibold">
        {{ vehicles.find((v) => v.id === selectedVehicle)?.platNumber || "-" }}
      </span>
    </div>

    <!-- Pilih Kendaraan -->
    <div class="mb-4">
      <label class="block text-gray-700 dark:text-gray-200 mb-1"
        >Pilih Kendaraan</label
      >
      <select
        v-model="selectedVehicle"
        :disabled="isDriving"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-gray-100"
      >
        <option
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          :value="vehicle.id"
        >
          {{ vehicle.platNumber }} -
          {{ vehicle.brand || "Tidak diketahui" }}
        </option>
      </select>
    </div>

    <!-- Controls -->
    <DriverControls
      :isDriving="isDriving"
      @start-trip="startTrip"
      @end-trip="endTrip"
      @manual-fetch="manualFetchLocation"
    />

    <!-- countdown -->
    <DriverCoutdown :is-driving="isDriving" :countdown="formatCountdown" />

    <!-- Checkpoints -->
    <DriverCheckpoints :locations="locations" />

    <!-- Mobile Footer -->
    <DriverFooter :is-driving="isDriving" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Alert from "@/components/Alert.vue";
import Loading from "@/components/Loading.vue";
import DriverControls from "@/components/DriverControls.vue";
import DriverCheckpoints from "@/components/DriverCheckpoints.vue";
import DriverFooter from "@/components/DriverFooter.vue";
import DriverCoutdown from "@/components/DriverCoutdown.vue";
import axios from "axios";
import { useAuthStore } from "@/stores/store";

const authStore = useAuthStore();
const user = computed(() => authStore.user);
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
const intervalSeconds = ref(20);
const countdownSeconds = ref(intervalSeconds.value);
let countdownInterval = null;

const isLoading = ref(false);
const showAlert = ref(false);
const alertMessage = ref("");
const vehicles = ref([]);
const selectedVehicle = ref(null);
const activeTripId = ref(null);

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
  if (location && activeTripId.value) {
    // Simpan lokasi ke backend dengan tripId aktif
    await axios.post(
      "/api/location/add",
      {
        latitude: location.latitude,
        longitude: location.longitude,
        timeStamp: new Date().toISOString(),
        tripId: activeTripId.value,
      },
      { withCredentials: true }
    );
    locations.value.unshift({ ...location });
    currentLocation.value = location;
    showLocationAlert("Pengambilan lokasi berhasil!");
  }
};

function startTrackingSession(tripId, vehicleId) {
  activeTripId.value = tripId;
  isDriving.value = true;
  localStorage.setItem("activeTripId", tripId);
  localStorage.setItem("isDriving", "true");
  if (vehicleId) selectedVehicle.value = vehicleId;
  countdownSeconds.value = intervalSeconds.value;
  fetchAndStoreLocation();
  stopTrackingSession(); // pastikan interval tidak double
  startCountdown();
  locationInterval = setInterval(() => {}, intervalSeconds.value * 1000); // dummy, biar bisa di-clear
}

function stopTrackingSession() {
  stopCountdown();
  if (locationInterval) clearInterval(locationInterval);
  locationInterval = null;
}

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownSeconds.value = intervalSeconds.value;
  countdownInterval = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    } else {
      fetchAndStoreLocation();
      countdownSeconds.value = intervalSeconds.value;
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
};

async function restoreActiveTrip() {
  if (!user.value) return;
  try {
    const res = await axios.get(`/api/trip/user/${user.value.id}?active=true`, {
      withCredentials: true,
    });
    if (res.data.trips && res.data.trips.length > 0) {
      const trip = res.data.trips[0];
      startTrackingSession(trip.id, trip.vehicle?.id);
    } else {
      // Tidak ada trip aktif di backend, bersihkan localStorage dan state
      activeTripId.value = null;
      isDriving.value = false;
      localStorage.removeItem("activeTripId");
      localStorage.removeItem("isDriving");
      stopTrackingSession();
    }
  } catch (e) {
    console.error("Gagal mengambil trip aktif:", e);
    activeTripId.value = null;
    isDriving.value = false;
    localStorage.removeItem("activeTripId");
    localStorage.removeItem("isDriving");
    stopTrackingSession();
  }
}

const startTrip = async () => {
  if (!selectedVehicle.value) {
    showLocationAlert("Pilih kendaraan terlebih dahulu!");
    return;
  }
  isDriving.value = true;
  locations.value = [];
  await setInitialLocation().then((initialLocation) => {
    currentLocation.value = initialLocation;
  });
  try {
    const res = await axios.post(
      "/api/trip/start",
      {
        vehicleId: selectedVehicle.value,
        userId: user.value.id,
      },
      { withCredentials: true }
    );
    startTrackingSession(res.data.trip.id, selectedVehicle.value);
  } catch (error) {
    console.error("Gagal memulai trip:", error);
    showLocationAlert("Gagal memulai trip, coba lagi nanti.");
    return;
  }
};

const endTrip = async () => {
  isDriving.value = false;
  stopTrackingSession();
  localStorage.removeItem("isDriving");
  localStorage.removeItem("activeTripId");
  if (activeTripId.value) {
    try {
      await axios.patch(
        `/api/trip/${activeTripId.value}/end`,
        {},
        { withCredentials: true }
      );
      activeTripId.value = null;
    } catch (e) {
      // Optional: handle error
    }
  }
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

async function fetchVehicles() {
  try {
    const res = await axios.get("/api/vehicle/all", { withCredentials: true });

    vehicles.value = res.data.vehicles.filter(
      (vehicle) => vehicle.company === user.value.company
    );
    // Otomatis pilih kendaraan pertama jika ada
    if (vehicles.value.length > 0 && !selectedVehicle.value) {
      selectedVehicle.value = vehicles.value[0].id;
    }
  } catch (e) {
    vehicles.value = [];
  }
}

onMounted(async () => {
  await fetchVehicles();
  await restoreActiveTrip();
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap");

.driver-tracking {
  padding: 20px;
  font-family: "Poppins", sans-serif;
  background-color: #f0f4f8;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 20px auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
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
</style>
