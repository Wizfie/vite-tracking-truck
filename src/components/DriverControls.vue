<template>
  <div
    class="controls gap-4 mb-6 flex flex-col md:flex-row justify-between w-full"
  >
    <button
      @click="$emit('start-trip')"
      :disabled="isDriving"
      class="btn start-btn w-full"
    >
      Mulai Berkendara
    </button>
    <button
      @click="$emit('end-trip')"
      :disabled="!isDriving"
      class="btn stop-btn w-full"
    >
      Selesai Berkendara
    </button>
    <button
      v-if="isDriving"
      @click="$emit('manual-fetch')"
      class="btn take-location-btn w-full"
    >
      Ambil Lokasi Sekarang
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  isDriving: Boolean,
});
</script>

<style scoped>
.btn {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.2s;
  border: none;
  cursor: pointer;
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
</style>
