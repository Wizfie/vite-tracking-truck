import { useAuthStore } from "@/stores/store.js";
import { createRouter, createWebHistory } from "vue-router";

export const excludedPaths = ["login", "register", "not-found"];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
      meta: { requiredAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token;
  const user = authStore.user;

  if (to.meta.requiredAuth) {
    if (!token || !user) {
      next({ name: "login" });
    } else if (to.meta.requiredRole && user.role !== to.meta.requiredRole) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});
