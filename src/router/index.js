import { useAuthStore } from "@/stores/store.js";
import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";

export const excludedPaths = ["login", "register", "not-found"];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
      meta: { requiredAuth: true, requiredRole: "ADMIN" },
    },
    {
      path: "/driver",
      name: "driver",
      component: () => import("@/views/DriverView.vue"),
      meta: { requiredAuth: true, requiredRole: "USER" },
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/ProfileView.vue"),
      meta: { requiredAuth: true },
    },
    {
      path: "/history-driver",
      name: "history-driver",
      component: () => import("@/views/HistoryDriverView.vue"),
      meta: { requiredAuth: true, requiredRole: "USER" },
    },
    {
      path: "/history",
      name: "history",
      component: () => import("@/views/HistoryView.vue"),
      meta: { requiredAuth: true, requiredRole: "ADMIN" },
    },
    {
      path: "/history/checkpoint",
      name: "checkpoint-detail",
      component: () => import("@/views/CheckpointDetailView.vue"),
      meta: { requiredAuth: true, requiredRole: "USER" },
    },
    {
      path: "/trip/:id",
      name: "trip-detail",
      component: () => import("@/views/TripDetailView.vue"),
      meta: { requiredAuth: true },
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("@/views/ChatView.vue"),
      meta: { requiredAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

function redirectByRole(user, next) {
  if (user.role === "ADMIN") {
    return next({ name: "home" });
  } else if (user.role === "USER") {
    return next({ name: "driver" });
  } else {
    return next({ name: "not-found" });
  }
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  let user = authStore.user;

  // Jika sudah login dan akses /login, redirect sesuai role
  if (to.name === "login" && user) {
    return redirectByRole(user, next);
  }

  if (to.meta.requiredAuth) {
    if (!user) {
      // Cek session ke backend jika user belum ada di state
      try {
        const res = await axios.get("/api/auth/validate", {
          withCredentials: true,
        });
        if (res.data && res.data.valid && res.data.user) {
          authStore.setUser(res.data.user);
          user = res.data.user;
        } else {
          return next({ name: "login" });
        }
      } catch {
        return next({ name: "login" });
      }
    }
    // Jika role user tidak cocok dengan route, redirect ke halaman sesuai role
    if (to.meta.requiredRole && user.role !== to.meta.requiredRole) {
      return redirectByRole(user, next);
    }
    next();
  } else {
    next();
  }
});
