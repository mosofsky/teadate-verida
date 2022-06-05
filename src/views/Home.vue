<template>
  <app-header @onVeridaContextSet="onVeridaContextSet"/>
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
import {defineComponent} from "vue";
import {Context, Messaging} from "@verida/client-ts";
import {Account} from "@verida/account";
import AppHeader from "@/components/Header.vue";
import {mapState} from "vuex";
import {Profile} from "@verida/vue-account/dist/types/src/interface";

const {VUE_APP_CONTEXT_NAME, VUE_APP_LOGO, VUE_APP_LOGIN_TEXT} = process.env;

const michaelOsofskyDID = "did:vda:0x911Ce7c9eD78fC37DC48820b894152B7C4f16840";
const erikaBlankDID = "did:vda:0x28e4FDb4f9DfD9c37383249D2d7b1F818e33541c";

interface IData {
  did: string;
  contextName: string | undefined;
}

function sendMessage(senderDID: string, senderName: string, recipientDID: string, messaging: Messaging) {
  const subject = `Hello from ${senderName} on Teadate at` + (new Date()).toLocaleTimeString();
  const data = {
    data: [{
      subject: subject,
      message: "I love your eyes. Would you like to meet for coffee...tea...or me?"
    }]
  };
  const config = {
    did: recipientDID,
    recipientContextName: "Verida: Vault"
  };

  console.log("Sending message from |" + senderName + "|" + " with subject |" + subject + "| to |" + recipientDID + "|");

  const sendPromise = messaging.send(
      recipientDID,
      "inbox/type/message",
      data,
      subject,
      config
  );

  sendPromise.then((value) => {
    console.log("Successfully sent message", value);
  });
  sendPromise.catch((reason) => {
    console.log("Error sending message", reason);
  });
  sendPromise.finally(() => {
    console.log("Finally reached for sending message");
  });
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
    async onVeridaContextSet(vContext: Context) {
      if (vContext) {
        this.$options.veridaContext = vContext;

        this.contextName = this.$options.veridaContext.getContextName();

        // this is a Verida Account object
        this.$options.veridaAccount = this.$options.veridaContext.getAccount();

        // and this is how we get the DID
        this.did = await this.$options.veridaAccount.did();

        const messaging = await vContext.getMessaging();

        // const messages = await messaging.getMessages();

        const senderDID = this.did;

        const NOT_SET = "";
        let recipientDID = NOT_SET;
        if (michaelOsofskyDID === senderDID) {
          recipientDID = erikaBlankDID;
        }
        if (erikaBlankDID === senderDID) {
          recipientDID = michaelOsofskyDID;
        }
        if (NOT_SET !== recipientDID) {

          const profileConnection = await vContext.getClient().openPublicProfile(senderDID, 'Verida: Vault', 'basicProfile');
          let senderName = NOT_SET;
          if (undefined !== profileConnection) {
              const publicProfile = await profileConnection.getMany({}, {});
              senderName = publicProfile.name;
              sendMessage(senderDID, senderName, recipientDID, messaging);
          } else {
              throw new Error("TEADATE_ERROR: profileConnection is undefined");
          }
        } else {
          throw new Error("TEADATE_ERROR: Could not find a match for logged in user |" + senderDID + "|");
        }
      }
    },

    setDid(did: string) {
      this.did = did;
    },
  },
});
</script>
