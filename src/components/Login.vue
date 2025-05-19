<script setup>
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/store";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const username = ref("");
const password = ref("");

const login = async () => {
  try {
    if (!username.value || !password.value) {
      console.error("Username and password are required.");
      return;
    }

    const response = await axios.post("/api/auth/login", {
      username: username.value,
      password: password.value,
    });

    const token = response.data.token;
    const user = response.data.user;
    console.log("TOKEN : " + response.data.token);

    authStore.setToken(token);
    authStore.setUser(user);

    router.push({ name: "home" });
    alert("Login successful:");
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed:");
  }
};
</script>
<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
  >
    <div
      class="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-xl border-2 dark:bg-gray-800"
    >
      <div class="px-6 py-4">
        <div class="flex justify-center mx-auto">
          <img
            class="w-auto h-7 sm:h-8"
            src="https://merakiui.com/images/logo.svg"
            alt=""
          />
        </div>

        <h3
          class="mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-200"
        >
          Welcome Back
        </h3>

        <p class="mt-1 text-center text-gray-500 dark:text-gray-400">
          Login or create account
        </p>

        <form @submit.prevent="login">
          <div class="w-full mt-4">
            <input
              v-model="username"
              class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              type="text"
              placeholder="Username"
              aria-label="Username"
            />
          </div>

          <div class="w-full mt-4">
            <input
              v-model="password"
              class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
              type="password"
              placeholder="Password"
              aria-label="Password"
            />
          </div>

          <div class="flex items-center justify-between mt-4">
            <a
              href="#"
              class="text-sm text-gray-600 dark:text-gray-200 hover:text-gray-500"
              >Forget Password?</a
            >

            <button
              type="submit"
              class="px-6 py-2 justify-end text-sm cursor-pointer font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>

      <!-- <div
        class="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-gray-700"
      >
        <span class="text-sm text-gray-600 dark:text-gray-200"
          >Don't have an account?
        </span>

        <a
          href="#"
          class="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline"
          >Register</a
        >
      </div> -->
    </div>
  </div>
</template>
<style scoped></style>
