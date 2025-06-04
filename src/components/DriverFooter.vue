<template>
  <div class="mobile-footer">
    <p>
      Tracking Kendaraan:
      <span class="status font-bold">{{
        isDriving ? "Sedang Berkendara" : "Tidak Berkendara"
      }}</span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  isDriving: Boolean,
});
</script>

<style>
.mobile-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #777;
}
</style>
