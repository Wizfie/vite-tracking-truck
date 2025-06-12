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
  postcode: null,
});
let locationInterval = null;
const intervalSeconds = ref(20);
const countdownSeconds = ref(intervalSeconds.value);
let countdownInterval = null;
// Simple in-memory cache for reverse geocode results (tidak persistent)
const geocodeCache = {};

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

// Ambil lokasi terkini (lat, lon, timestamp) tanpa reverse geocoding
const getCurrentLocation = async () => {
  isLoading.value = true;
  const defaultLocation = {
    latitude: -6.2088,
    longitude: 106.8456,
    timestamp: new Date().toLocaleTimeString(),
  };
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      isLoading.value = false;
      return reject("Geolocation tidak didukung oleh browser ini.");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const timestamp = new Date().toLocaleTimeString();
        isLoading.value = false;
        resolve({ latitude, longitude, timestamp });
      },
      () => {
        isLoading.value = false;
        resolve(defaultLocation);
      }
    );
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
  isLoading.value = true;
  await getCurrentLocation().then(async (location) => {
    if (location && activeTripId.value) {
      await axios.post(
        "/api/location/create",
        {
          latitude: location.latitude,
          longitude: location.longitude,
          timeStamp: new Date().toISOString(),
          tripId: activeTripId.value,
        },
        { withCredentials: true }
      );
      currentLocation.value = location;
      await historyLocation(activeTripId.value);
      showLocationAlert("Pengambilan lokasi berhasil!");
    }
  });
  isLoading.value = false;
  startCountdown();
};

function startTrackingSession(tripId, vehicleId) {
  activeTripId.value = tripId;
  isDriving.value = true;
  localStorage.setItem("activeTripId", tripId);
  localStorage.setItem("isDriving", "true");
  if (vehicleId) selectedVehicle.value = vehicleId;
  countdownSeconds.value = intervalSeconds.value;
  fetchAndStoreLocation();
  stopTrackingSession();
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
  countdownInterval = setInterval(async () => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    } else {
      clearInterval(countdownInterval); // stop countdown
      countdownInterval = null;
      await fetchAndStoreLocation(); // fetch lokasi, lalu countdown akan dimulai ulang di fetchAndStoreLocation
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
};

// Helper fetch with timeout
function fetchWithTimeout(resource, options = {}) {
  const { timeout = 4000 } = options;
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeout)
    ),
  ]);
}

const reverseGeocode = async (latitude, longitude) => {
  const key = `${latitude},${longitude}`;
  // Jangan cache jika hasil sebelumnya gagal (alamat null)
  if (geocodeCache[key] && geocodeCache[key].streetName !== null) {
    return geocodeCache[key];
  }
  try {
    const response = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      { timeout: 4000 }
    );
    const data = await response.json();
    const result = {
      streetName: data.address?.road || "Tidak diketahui",
      city: data.address?.city || "Tidak diketahui",
      postcode: data.address?.postcode || "Tidak diketahui",
    };
    geocodeCache[key] = result;
    return result;
  } catch (error) {
    // Jangan cache hasil gagal (alamat null)
    return {
      streetName: null,
      city: null,
      postcode: null,
    };
  }
};

const historyLocation = async (tripId) => {
  try {
    const res = await axios.get(`/api/location/${tripId}`, {
      withCredentials: true,
    });
    let locationList = res.data.locations || res.data || [];
    // console.log("historyLocation response:", res.data);
    locationList.sort((a, b) => {
      const tA = new Date(a.timeStamp || a.timestamp).getTime();
      const tB = new Date(b.timeStamp || b.timestamp).getTime();
      return tB - tA;
    });
    if (Array.isArray(locationList) && locationList.length > 0) {
      const locationsWithAddress = await Promise.all(
        locationList.map(async (loc) => {
          const address = await reverseGeocode(loc.latitude, loc.longitude);
          // Format timestamp ke 24 jam (HH:mm:ss)
          let timestamp = loc.timeStamp || loc.timestamp;
          if (timestamp) {
            try {
              const dateObj = new Date(timestamp);
              timestamp = dateObj.toLocaleTimeString("id-ID", {
                hour12: true,
              });
            } catch {
              console.log("Invalid timestamp format:", timestamp);
            }
          } else {
            timestamp = "-";
          }
          return {
            ...loc,
            streetName: address.streetName,
            city: address.city,
            postcode: address.postcode,
            timestamp,
          };
        })
      );
      locations.value = locationsWithAddress;
      // console.log("locations.value:", locations.value);
    } else {
      locations.value = [];
      showLocationAlert("Tidak ada lokasi ditemukan untuk trip ini.");
    }
  } catch (error) {
    locations.value = [];
    showLocationAlert("Gagal mengambil daftar lokasi.");
    // console.error("historyLocation error:", error, error?.response?.data);
  }
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
      historyLocation(trip.id);
    } else {
      // Tidak ada trip aktif di backend, bersihkan localStorage dan postcode
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
      await axios.post(
        `/api/trip/end/${activeTripId.value}`,
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
  isLoading.value = true;
  if (countdownInterval) clearInterval(countdownInterval);
  await fetchAndStoreLocation(); // countdown akan dimulai ulang di fetchAndStoreLocation
  isLoading.value = false;
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
