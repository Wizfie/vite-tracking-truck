<template>
  <nav
    class="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-2 md:gap-0"
  >
    <div class="flex items-center gap-2 md:block md:gap-2 w-full md:w-auto">
      <label
        for="itemsPerPage"
        class="text-sm text-gray-600 dark:text-gray-300 hidden md:inline"
      >
        Tampil:
      </label>
      <select
        id="itemsPerPage"
        class="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100 hidden md:inline"
        :value="itemsPerPage"
        @change="$emit('items-per-page', +$event.target.value)"
      >
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
    <div class="flex items-center justify-between w-full md:w-auto gap-2">
      <button
        :class="prevClass"
        @click.prevent="$emit('prev')"
        :disabled="isPrevDisabled"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
          />
        </svg>
        <span class="hidden md:inline"> previous </span>
      </button>

      <span class="block md:hidden text-sm text-gray-600 dark:text-gray-300"
        >Halaman {{ currentPage }} / {{ totalPages }}</span
      >

      <div class="items-center gap-x-3 hidden md:flex">
        <button
          v-for="page in pages"
          :key="page"
          :class="page === currentPage ? activePageClass : pageClass"
          @click.prevent="$emit('page', page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        :class="nextClass"
        @click.prevent="$emit('next')"
        :disabled="isNextDisabled"
      >
        <span class="hidden md:inline"> Next </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 rtl:-scale-x-100"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
          />
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { toRefs, defineProps, computed } from "vue";

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
});
const { currentPage, totalPages, itemsPerPage } = toRefs(props);

const pages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const maxVisible = 5;
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;
  if (end > total) {
    end = total;
    start = end - maxVisible + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const isPrevDisabled = computed(() => currentPage.value === 1);
const isNextDisabled = computed(() => currentPage.value === totalPages.value);

const prevClass =
  "flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800";
const nextClass =
  "flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800";
const pageClass =
  "px-2 py-1 text-sm cursor-pointer text-gray-500 rounded-md dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100";
const activePageClass =
  "px-2 py-1 text-sm cursor-pointer text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60";
</script>
