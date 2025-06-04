<template>
  <!-- Loading Indicator with Blur Effect -->
  <div
    v-if="isLoading"
    class="loading-overlay fixed top-0 left-0 z-50 w-full h-full bg-gray-900 bg-opacity-50 backdrop-blur-sm flex justify-center items-center"
  >
    <div class="loader"></div>
  </div>
</template>

<script setup>
const Props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style>
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
