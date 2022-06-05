/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createApp } from "vue";
import VueToast from "vue-toast-notification";
import App from "./App.vue";
import router from "./router";
import Account from "@verida/vue-account";

import "vue-toast-notification/dist/theme-sugar.css";
import "./assets/scss/main.scss";
import { createStore } from "vuex";

// Create a new store instance.
const store = createStore({
  state() {
    return {
      context: {},
    };
  },
  mutations: {
    setContext(state: any, payload: any) {
      state.context = payload;
    },
  },
});

const app = createApp(App);

app.use(store);

app.use(Account);

app.use(router);

app.use(VueToast, {
  position: "top",
});

app.mount("#app");
