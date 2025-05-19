import { defineStore } from "pinia";
import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: Cookies.get("authToken") || null,
    user: Cookies.get("userData") ? JSON.parse(Cookies.get("userData")) : null,
  }),

  actions: {
    setToken(token) {
      this.token = token;
      Cookies.set("authToken", token, {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
    },

    setUser(user) {
      this.user = user;
      Cookies.set("userData", JSON.stringify(user), {
        expires: 1,
        secure: true,
        sameSite: "Strict",
      });
    },

    clearToken() {
      this.token = null;
      this.user = null;
      Cookies.remove("userData");
      Cookies.remove("authToken");
    },
  },
});
