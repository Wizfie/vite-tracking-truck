<script setup>
import { ref } from "vue";

const props = defineProps({
  isDarkMode: {
    type: Boolean,
  },
});
const emit = defineEmits(["toggle-dark"]);
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const handleToggleDark = () => {
  emit("toggle-dark");
};
</script>

<template>
  <nav class="bg-white shadow-xl sticky dark:bg-gray-800">
    <div
      class="container px-4 py-4 mx-auto md:flex md:justify-between md:items-center"
    >
      <div class="flex items-center justify-between w-full">
        <!-- Brand Name -->
        <p class="font-semibold text-2xl p-2 rounded-md">Expedisi Tracking</p>

        <!-- Mobile: Toggle button -->
        <div class="flex items-center space-x-2 md:hidden">
          <button
            @click="toggleMenu"
            type="button"
            class="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
            aria-label="toggle menu"
          >
            <svg
              v-if="!isOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 8h16M4 16h16"
              />
            </svg>
            <svg
              v-if="isOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Desktop Menu Links -->
        <div class="hidden md:flex flex-1 justify-center md:mx-6 space-x-6">
          <a
            class="text-gray-700 transition-all duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md font-semibold border-b-2 border-transparent hover:border-blue-500"
            href="#"
            >Home</a
          >
          <a
            class="text-gray-700 transition-all duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md font-semibold border-b-2 border-transparent hover:border-blue-500"
            href="#"
            >History</a
          >
          <a
            class="text-gray-700 transition-all duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md font-semibold border-b-2 border-transparent hover:border-blue-500"
            href="#"
            >Profile</a
          >
          <a
            class="text-gray-700 transition-all duration-300 transform dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-md font-semibold border-b-2 border-transparent hover:border-blue-500"
            href="#"
            >Chat</a
          >
        </div>

        <!-- Dark Mode Toggle Button (Desktop) -->
        <button
          @click="handleToggleDark"
          class="hidden ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none order-last md:inline-flex cursor-pointer"
          aria-label="Toggle dark mode"
        >
          <svg
            v-if="!props.isDarkMode"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu (slide-in) -->
      <div
        :class="[
          isOpen ? 'translate-x-0 opacity-100 ' : 'opacity-0 -translate-x-full',
        ]"
        class="md:hidden absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800"
      >
        <div class="flex flex-col space-y-4">
          <a
            class="text-gray-700 transition-all duration-300 transform bg-gray-200 dark:bg-slate-500 p-2 font-bold rounded-md dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            href="#"
            >Home</a
          >
          <a
            class="text-gray-700 transition-all duration-300 transform bg-gray-200 dark:bg-slate-500 p-2 font-bold rounded-md dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            href="#"
            >History</a
          >
          <a
            class="text-gray-700 transition-all duration-300 transform bg-gray-200 dark:bg-slate-500 p-2 font-bold rounded-md dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            href="#"
            >Profile</a
          >
          <a
            class="text-gray-700 transition-all duration-300 transform bg-gray-200 dark:bg-slate-500 p-2 font-bold rounded-md dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
            href="#"
            >Chat</a
          >
          <!-- Dark mode toggle button in mobile menu -->
          <button
            @click="handleToggleDark"
            class="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle dark mode"
          >
            <svg
              v-if="!props.isDarkMode"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Mobile Menu Slide-in Transition */
.md:hidden {
  display: block;
}

@media (min-width: 768px) {
  .md:hidden {
    display: none;
  }
}
</style>
