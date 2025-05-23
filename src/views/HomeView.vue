<template>
  <div
    class="container px-4 mx-auto mt-4 flex flex-col min-h-screen bg-white dark:bg-gray-900"
  >
    <!-- Maps & detail -->
    <div class="flex flex-col md:flex-row gap-4">
      <Maps />
      <Timeline />
    </div>

    <!-- Table Kendaraan  -->
    <TableVehicle />
  </div>
</template>

<script setup>
import Maps from "@/components/maps.vue";
import Timeline from "@/components/Timeline.vue";
import TableVehicle from "@/components/TableVehicle.vue";
</script>

<style></style>
