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
      meta: { requiredAuth: true },
    },
    {
      path: "/driver",
      name: "driver",
      component: () => import("@/views/DriverView.vue"),
      meta: { requiredAuth: true },
    },
    // {
    //   path: "/admin",
    //   name: "admin",
    //   component: () => import("@/views/AdminView.vue"),
    //   meta: { requiredAuth: true, requiredRole: "admin" },
    // },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  let user = authStore.user;

  if (to.name === "login" && user) {
    return next({ name: "home" });
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
    // Cek role user jika route butuh role tertentu
    if (to.meta.requiredRole && user.role !== to.meta.requiredRole) {
      return next({ name: "not-found" });
    }
    next();
  } else {
    next();
  }
});
