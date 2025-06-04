<template>
  <div
    v-if="isDriving"
    class="mb-2 text-center text-sm text-blue-600 dark:text-blue-300 font-semibold"
  >
    Pengambilan lokasi otomatis dalam {{ countdown }}
  </div>
</template>

<script setup>
const props = defineProps({
  isDriving: {
    type: Boolean,
    default: false,
  },
  countdown: {
    type: Number,
    default: 0,
  },
});
</script>
