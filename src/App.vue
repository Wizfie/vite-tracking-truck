<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue";
import { excludedPaths } from "./router";

const route = useRoute();
const isDarkMode = ref(false);
const showNavbar = computed(() => {
  return !excludedPaths.includes(route.name); // Dynamically check if the navbar should be shown
});
const toggleDark = () => {
  isDarkMode.value = !isDarkMode.value;
  const html = document.documentElement;
  if (isDarkMode.value) {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  localStorage.setItem("darkMode", isDarkMode.value ? "true" : "false");
};

onMounted(() => {
  const saved = localStorage.getItem("darkMode");
  isDarkMode.value = saved === "true";
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});
</script>

<template>
  <div :class="{ dark: isDarkMode }">
    <Navbar
      v-if="showNavbar"
      :is-dark-mode="isDarkMode"
      @toggle-dark="toggleDark"
    />
    <div class="bg-white dark:bg-gray-900 px-4 py-6">
      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
