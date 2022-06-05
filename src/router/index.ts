import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { hasSession } from "@verida/account-web-vault";
import Credential from "../views/Home.vue";
import SSOLogin from "../views/SSOLogin.vue";

const { VUE_APP_CONTEXT_NAME } = process.env;

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Credential,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/connect",
    name: "Connect",
    component: SSOLogin,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, _, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (hasSession(VUE_APP_CONTEXT_NAME)) {
      next();
    } else {
      next("/connect");
    }
  } else {
    next();
  }
});

export default router;
