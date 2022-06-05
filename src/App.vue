<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";
import { hasSession } from "@verida/account-web-vault";

const { VUE_APP_CONTEXT_NAME } = process.env;

export default defineComponent({
  name: "App",
  props: {},
  data() {
    return {
      isLoggedIn: hasSession(VUE_APP_CONTEXT_NAME),
    };
  },

  methods: {
    setLogin() {
      this.isLoggedIn = hasSession(VUE_APP_CONTEXT_NAME);
    },
  },
});
</script>
