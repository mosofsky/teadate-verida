<template>
  <app-header @onVeridaContextSet="onVeridaContextSet" />
  <div style="text-align: center">
    <h1>{{ contextName }}: Home Page</h1>

    <div>
      This
      <a href="https://developers.verida.io/docs/concepts/application-contexts"
        >application context</a
      >
      is called: <i>{{ contextName }}</i
      >. Change this by editing the value of VUE_APP_CONTEXT_NAME in the .env
      file included in this project.
    </div>

    <div>You logged in with DID {{ did }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Context } from "@verida/client-ts";
import { Account } from "@verida/account";
import AppHeader from "@/components/Header.vue";
import { mapState } from "vuex";
import {Profile} from "@verida/vue-account/dist/types/src/interface";

const { VUE_APP_CONTEXT_NAME, VUE_APP_LOGO, VUE_APP_LOGIN_TEXT } = process.env;

const michaelOsofskyDID = "did:vda:0x911Ce7c9eD78fC37DC48820b894152B7C4f16840";
const erikaBlankDID = "did:vda:0x28e4FDb4f9DfD9c37383249D2d7b1F818e33541c";

interface IData {
  did: string;
  contextName: string | undefined;
}

export default defineComponent({
  name: "Home",
  components: {
    AppHeader,
  },
  mounted() {
    // veridaContext and veridaAccount cannot be set in data.
    // The JSON schema compiler used inside them does not like running inside a Vue proxy object
    this.$options.veridaContext = null as null | Context;
    this.$options.veridaAccount = null as null | Account;

    this.onVeridaContextSet(this.context);
  },
  computed: mapState(["context"]),
  data(): IData {
    return {
      did: "",
      contextName: "",
    };
  },
  methods: {
    setDid(did: string) {
      this.did = did;
    },

    async onVeridaContextSet(vContext: Context) {
      if (vContext) {
        // console.log("enter", vContext);
        // You are free to delete this logging
        // we have the veridaContext.
        // console.log(vContext);
        this.$options.veridaContext = vContext;

        this.contextName = this.$options.veridaContext.getContextName();

        console.log("mjo hello 0", this.$options.veridaContext);

        // this is a Verida Account object
        this.$options.veridaAccount = this.$options.veridaContext.getAccount();

        // and this is how we get the DID
        this.did = await this.$options.veridaAccount.did();

        // const myProfile = await vContext.openProfile('public');
        // console.log("mjo 1 myProfile", myProfile);

        // const did = 'did:vda:0x6B2a1bE81ee770cbB4648801e343E135e8D2Aa6F';
        // const profileConnection = await vContext.openPublicProfile(did, 'Verida: Vault', 'basicProfile');
        // const publicProfile = await profileConnection.getMany()
        //
        // console.log('mjo Account name', publicProfile.name)
        // console.log('mjo Account country', publicProfile.country)

        console.log("mjo hello 1");
        const messaging = await vContext.getMessaging();
        console.log("mjo messaging", messaging);
        const messages = await messaging.getMessages();
        console.log("mjo messages", messages);

        const recipientDID = erikaBlankDID;
        const senderDID = this.did;
        const data = {
          data: [{
            subject: "Hello from Teadate (data)",
            message: "I love your eyes. Would you like to meet for coffee...tea...or me?"
          }]
        };
        const config = {
          did: recipientDID,
          recipientContextName: "Verida: Vault"
        };
        const sendPromise = messaging.send(
            senderDID,
            "inbox/type/message",
            data,
            "Hello from Teadate",
            config
        );
        console.log("mjo called send()");
        sendPromise.then((value) => {
             console.log("mjo then()", value);
        });
        sendPromise.catch((reason) => {
          console.log("mjo catch()", reason);
        });
        sendPromise.finally(() => {
          console.log("mjo finally()");
        });
      }
    },
  },
});
</script>
