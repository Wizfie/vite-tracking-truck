<template>
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
</template>

<script setup>
const props = defineProps({
  showAlert: {
    type: Boolean,
    default: false,
  },
  alertMessage: {
    type: String,
    default: "",
  },
});
</script>
