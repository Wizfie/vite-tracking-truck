<template>
  <div
    class="container px-4 mx-auto mt-4 flex flex-col min-h-screen bg-white dark:bg-gray-900"
  >
    <Loading :is-loading="isLoading" />
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-6">
      <TableTrips
        :trips="trips"
        :selectedTrip="selectedTrip"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        @select-trip="selectTrip"
        @search="handleSearch"
        @sort="handleSort"
        @items-per-page="handleItemsPerPage"
      />
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :items-per-page="itemsPerPage"
        @prev="handlePrev"
        @next="handleNext"
        @page="handlePage"
        @items-per-page="handleItemsPerPage"
      />
    </div>
  </div>
</template>

<script setup>
import TableTrips from "@/components/TableTrips.vue";
import Loading from "@/components/Loading.vue";
import Pagination from "@/components/Pagination.vue";
import axios from "axios";
import { onMounted, ref } from "vue";
const trips = ref([]);
const selectedTrip = ref(null);
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const searchQuery = ref("");
const sortBy = ref("startTime");
const sortOrder = ref("desc");
const status = ref("ACTIVE");
const itemsPerPage = ref(10);

const getTrips = async (page = 1, query = searchQuery.value) => {
  isLoading.value = true;
  try {
    const res = await axios.get("/api/trip/all", {
      params: {
        page,
        limit: itemsPerPage.value,
        search: query,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        status: status.value,
      },
      withCredentials: true,
    });
    trips.value = res.data.trips;
    totalPages.value = res.data.totalPages;
    currentPage.value = res.data.page;
    // console.log(
    //   "Set currentPage:",
    //   currentPage.value,
    //   "Set totalPages:",
    //   totalPages.value
    // );
  } catch (error) {
    console.error("Error fetching active trips:", error);
  } finally {
    isLoading.value = false;
  }
};

const selectTrip = (tripId) => {
  selectedTrip.value = tripId;
};

const handleSearch = (query) => {
  searchQuery.value = query;
  getTrips(1, query);
};

const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = column;
    sortOrder.value = "asc";
  }
  getTrips(1, searchQuery.value);
};

const handleItemsPerPage = (limit) => {
  itemsPerPage.value = limit;
  getTrips(1, searchQuery.value);
};

const handlePrev = () => {
  if (currentPage.value > 1) getTrips(currentPage.value - 1, searchQuery.value);
};
const handleNext = () => {
  if (currentPage.value < totalPages.value)
    getTrips(currentPage.value + 1, searchQuery.value);
};
const handlePage = (page) => {
  getTrips(page, searchQuery.value);
};

onMounted(() => {
  getTrips();
});
</script>

<style>
.selected-row {
  background-color: #e0f7fa !important;
}
</style>
