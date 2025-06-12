<template>
  <section class="container px-4 mx-auto mt-4">
    <h2 class="text-2xl font-medium text-gray-800 dark:text-white">
      List Kendaraan
      <!-- <span class="text-gray-500 dark:text-gray-400">({{ trips.length }})</span> -->
    </h2>

    <!-- Search input -->
    <div class="flex items-center gap-2 mt-4 mb-2">
      <input
        :value="searchQuery"
        @input="onInputSearch"
        type="text"
        placeholder="Cari Plat Nomor, supir, perusahaan..."
        class="px-3 py-2 border rounded-md w-full max-w-xs text-sm focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
      />
    </div>

    <!-- <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">Updated Time...</p> -->

    <div class="flex flex-col mt-6">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div
            class="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg"
          >
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                  >
                    Trip ID
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                    @click="$emit('sort', 'company')"
                  >
                    Perusahaan
                    <span v-if="props.sortBy === 'company'">{{
                      props.sortOrder === "asc" ? "▲" : "▼"
                    }}</span>
                  </th>

                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                    @click="$emit('sort', 'status')"
                  >
                    Status
                    <span v-if="props.sortBy === 'status'">{{
                      props.sortOrder === "asc" ? "▲" : "▼"
                    }}</span>
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                    @click="$emit('sort', 'Tujuan')"
                  >
                    Tujuan
                    <span v-if="props.sortBy === 'Tujuan'">{{
                      props.sortOrder === "asc" ? "▲" : "▼"
                    }}</span>
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                    @click="$emit('sort', 'username')"
                  >
                    Supir
                    <span v-if="props.sortBy === 'username'">{{
                      props.sortOrder === "asc" ? "▲" : "▼"
                    }}</span>
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                    @click="$emit('sort', 'platNumber')"
                  >
                    Plat Nomor
                    <span v-if="props.sortBy === 'platNumber'">{{
                      props.sortOrder === "asc" ? "▲" : "▼"
                    }}</span>
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                    @click="$emit('sort', 'startTime')"
                  >
                    Waktu
                    <span v-if="props.sortBy === 'startTime'">{{
                      props.sortOrder === "asc" ? "▲" : "▼"
                    }}</span>
                  </th>

                  <th
                    scope="col"
                    class="px-4 py-3.5 text-sm font-normal text-left text-gray-500 dark:text-gray-400 cursor-pointer"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900"
              >
                <tr
                  v-for="(trip, index) in trips"
                  :key="trip.id"
                  :class="[
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    selectedTrip === trip.id ? 'selected-row' : '',
                  ]"
                >
                  <td class="px-4 py-4 text-sm font-medium whitespace-nowrap">
                    <div>
                      <h2 class="font-medium text-gray-800 dark:text-white">
                        {{ trip.id }}
                      </h2>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm font-medium whitespace-nowrap">
                    <div>
                      <h2 class="font-medium text-gray-800 dark:text-white">
                        {{ trip.vehicle?.company }}
                      </h2>
                    </div>
                  </td>
                  <td class="px-12 py-4 text-sm font-medium whitespace-nowrap">
                    <div
                      class="inline px-3 py-1 text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800"
                    >
                      {{ trip.status }}
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm whitespace-nowrap">
                    <div>
                      <h4 class="text-gray-700 dark:text-gray-200">Tujuan</h4>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm whitespace-nowrap">
                    <div class="flex items-center">
                      <p>
                        {{ trip.user?.username.toUpperCase() }}
                      </p>
                    </div>
                  </td>

                  <td class="px-4 py-4 text-sm whitespace-nowrap">
                    <p>{{ trip.vehicle.platNumber }}</p>
                  </td>
                  <td class="px-4 py-4 text-sm whitespace-nowrap">
                    <div>
                      <p>Mulai : {{ formatDate(trip.startTime) }}</p>
                      <p>Selesai : {{ formatDate(trip.endTime) }}</p>
                    </div>
                  </td>

                  <td class="px-4 py-4 text-sm whitespace-nowrap">
                    <button
                      @click="
                        router.push({
                          name: 'trip-detail',
                          params: { id: trip.id },
                        })
                      "
                      class="px-3 py-1 cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { formatDate } from "@/utils";
const router = useRouter();
const props = defineProps({
  trips: {
    type: Array,
    default: () => [],
  },
  selectedTrip: {
    type: [String, Number, null],
    default: null,
  },
  sortBy: {
    type: String,
    default: "startTime",
  },
  sortOrder: {
    type: String,
    default: "desc",
  },
});
const emit = defineEmits(["select-trip", "search", "sort", "items-per-page"]);
const searchQuery = ref("");
let debounceTimeout = null;

function onInputSearch(e) {
  const value = e.target.value;
  searchQuery.value = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit("search", value);
  }, 500); // 400ms debounce
}
</script>

<style scoped>
.selected-row {
  background-color: rgba(229, 231, 235);
}
</style>
