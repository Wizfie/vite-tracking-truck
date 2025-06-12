<template>
  <section id="timeline" class="w-full md:w-2/3 dark:bg-gray-900">
    <span class="font-bold text-2xl mb-4">Timeline</span>
    <div class="border-2 rounded-sm sm:min-h-fit md:h-[500px] px-4 py-4 mt-4">
      <ol
        class="relative space-y-2 before:absolute before:-ml-px before:h-full before:w-0.5 before:rounded-full before:bg-gray-200"
      >
        <li
          v-for="(item, idx) in timelines"
          :key="item.id"
          class="relative -ms-1.5 flex items-start gap-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition"
          @click="$emit('select', item)"
        >
          <span class="size-3 shrink-0 rounded-full bg-blue-600"></span>

          <div class="-mt-2">
            <time class="text-sm font-medium text-gray-800 dark:text-white">{{
              new Date(item.timeStamp).toLocaleString()
            }}</time>

            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ item.address }}
            </h3>

            <p class="mt-0.5 text-sm text-gray-700 dark:text-white">
              Koordinat: {{ item.latitude }}, {{ item.longitude }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  timelines: {
    type: Array,
    default: () => [],
  },
});
</script>
