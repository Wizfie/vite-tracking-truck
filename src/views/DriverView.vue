<template>
  <div class="driver-tracking">
    <div class="controls">
      <button @click="startTrip" :disabled="isDriving" class="btn start-btn">
        Mulai Berkendara
      </button>
      <button @click="endTrip" :disabled="!isDriving" class="btn stop-btn">
        Selesai Berkendara
      </button>
    </div>

    <div class="checkpoints">
      <h3 class="checkpoints-title">Daftar Lokasi</h3>
      <ul class="location-list">
        <li
          v-for="(location, index) in locations"
          :key="index"
          class="location-item"
        >
          <div
            class="location-card"
            :class="{
              checkpoint: location.isCheckpoint,
              'last-location': index === 0,
            }"
          >
            <div class="location-details">
              <p>Lokasi: {{ location.latitude }}, {{ location.longitude }}</p>
              <p>Jalan: {{ location.streetName || "Menunggu alamat..." }}</p>
              <p>Kota: {{ location.city || "Tidak diketahui" }}</p>
              <p>Provinsi: {{ location.state || "Tidak diketahui" }}</p>
              <p>{{ location.timestamp }}</p>
            </div>
            <button
              v-if="!location.isCheckpoint && isDriving"
              @click="markCheckpoint(index)"
              class="checkpoint-btn"
            >
              Tandai sebagai Checkpoint
            </button>
            <p v-if="index === 0" class="last-location-tag">Lokasi Terakhir</p>
          </div>
        </li>
      </ul>
    </div>

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
import { ref, onMounted } from "vue";

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

// Fungsi untuk mengatur lokasi default sebelum memulai pelacakan
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

// Mengambil lokasi saat ini
const getCurrentLocation = async () => {
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
          }
        },
        (error) => reject(error)
      );
    } else {
      reject("Geolocation tidak didukung oleh browser ini.");
    }
  });
};

const trackLocation = async () => {
  if (isDriving.value) {
    const location = await getCurrentLocation();
    if (location) {
      locations.value.unshift({ ...location, isCheckpoint: false });
      currentLocation.value = location;
    }
    setTimeout(trackLocation, 5000); // Perbarui setiap 5 detik
  }
};

const startTrip = () => {
  isDriving.value = true;
  locations.value = [];
  setInitialLocation().then((initialLocation) => {
    currentLocation.value = initialLocation;
    trackLocation();
  });
};

const endTrip = () => {
  isDriving.value = false;
};

const markCheckpoint = (index) => {
  const location = locations.value[index];
  if (location) {
    location.isCheckpoint = true;
  }
};

onMounted(() => {
  // Memastikan jika aplikasi dibuka dan aktif
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
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
}

.btn {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.3s, transform 0.3s ease-in-out;
  border: none;
  cursor: pointer;
  width: 48%;
}

.start-btn {
  background-color: #4caf50;
  color: white;
}

.start-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
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

.stop-btn:disabled {
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
  max-height: 300px; /* Sesuaikan tinggi yang diinginkan */
  overflow-y: auto; /* Membuat elemen scrollable secara vertikal */
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

.location-card.checkpoint {
  background-color: #e0ffe0;
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

.checkpoint-btn {
  padding: 8px 16px;
  font-size: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  flex-basis: 20%;
}

.checkpoint-btn:hover {
  background-color: #45a049;
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
  }

  .checkpoints {
    font-size: 14px;
  }

  .location-card {
    min-height: auto;
  }

  .location-number,
  .location-details,
  .checkpoint-btn {
    flex-basis: 100%;
    text-align: center;
  }
}
</style>
