<template>
  <app-header @onVeridaContextSet="onVeridaContextSet"/>
  <div style="text-align: center">
    <div>
      <h1>My Profile</h1>
      <h3>Gender: {{ gender }}</h3>
    </div>

    <br/>
    <br/>
    <br/>

    <div>
      <h1>My Matches</h1>
      <ol>
        <li>{{ match_list.hasOwnProperty(0) ? match_list[0] : "" }}</li>
        <li>{{ match_list.hasOwnProperty(1) ? match_list[1] : "" }}</li>
        <li>{{ match_list.hasOwnProperty(2) ? match_list[2] : "" }}</li>
      </ol>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {Context, Messaging} from "@verida/client-ts";
import {Account} from "@verida/account";
import AppHeader from "@/components/Header.vue";
import {mapState} from "vuex";

const {VUE_APP_CONTEXT_NAME, VUE_APP_LOGO, VUE_APP_LOGIN_TEXT} = process.env;

const michaelOsofskyDID = "did:vda:0x911Ce7c9eD78fC37DC48820b894152B7C4f16840";
const erikaBlankDID = "did:vda:0x28e4FDb4f9DfD9c37383249D2d7b1F818e33541c";
const pecheDiIID = "did:vda:0x944874d92F5eb69E1Defe02e76c61e76329642fb";

const NOT_SET = "";

const MALE = "Male";
const FEMALE = "Female";
const POSITIVE = "Positive";
const NEGATIVE = "Negative";

interface IData {
  did: string;
  contextName: string | undefined;
  gender: string | undefined;
  match_list: string[];
}

async function populateMatchList(vContext: any, loggedInUserID: string, myThis: any) {
  let myMatches: string[] = [];
  if (michaelOsofskyDID === loggedInUserID) {
    myMatches = [erikaBlankDID, pecheDiIID];
  }
  if (erikaBlankDID === loggedInUserID) {
    myMatches = [michaelOsofskyDID];
  }
  if (pecheDiIID === loggedInUserID) {
    myMatches = [michaelOsofskyDID];
  }

  const match_list = [];
  for (let i=0; i<myMatches.length; i++) {
    const matchedUserId = myMatches[i];
    const profileConnection = await vContext.getClient().openPublicProfile(matchedUserId, 'Verida: Vault', 'basicProfile');
    if (undefined !== profileConnection) {
      const publicProfile = await profileConnection.getMany({}, {});
      match_list.push(publicProfile.name);
    } else {
      throw new Error("TEADATE_ERROR: profileConnection is undefined in populateMatchList");
    }
  }
  myThis.match_list = match_list;
}

async function requestGender(userID: string, messaging: Messaging, myThis: any) {
  const type = 'inbox/type/dataRequest'

  const data = {
    requestSchema: "https://common.schemas.verida.io/health/pathology/tests/covid19/pcr/v0.1.0/schema.json",
    filter: {},
    userSelect: true
  }
  const message = "Please share your gender 1248"
  const config = {
    did: userID,
    recipientContextName: 'Verida: Vault'
  }

  messaging.send(userID, type, data, message, config);

  const listener = await messaging.onMessage(function (inboxEntry: any) {
    console.log("mjo =====> New inbox message received", inboxEntry);
    const result = inboxEntry.data.data[0].result;
    let gender = NOT_SET;
    if (NEGATIVE === result) {
      gender = MALE;
    }
    if (POSITIVE === result) {
      gender = FEMALE;
    }
    if (NOT_SET === gender) {
      throw new Error("Could not set gender, received result=|" + result + "|");
    }
    myThis.gender = gender;
  });
}

function sendMessage(senderName: string, recipientDID: string, messaging: Messaging) {
  const subject = `Hello from ${senderName} on Teadate`;
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
      gender: "",
      match_list: [],
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

        const populateMatchListPromise = populateMatchList(vContext, this.did, this);
        populateMatchListPromise.then((value) => {
          console.log("Successfully populateMatchListPromise", value);
        });
        populateMatchListPromise.catch((reason) => {
          console.log("Error populateMatchListPromise", reason);
        });
        populateMatchListPromise.finally(() => {
          console.log("Finally populateMatchListPromise");
        });

        const messaging = await vContext.getMessaging();

        const genderPromise = requestGender(this.did, messaging, this);
        genderPromise.then((value) => {
          console.log("Successfully requested gender", value);
        });
        genderPromise.catch((reason) => {
          console.log("Error sending requesting gender", reason);
        });
        genderPromise.finally(() => {
          console.log("Finally reached for requesting gender");
        });

      //   const senderDID = this.did;
      //
      //   const NOT_SET = "";
      //   let recipientDID = NOT_SET;
      //   if (michaelOsofskyDID === senderDID) {
      //     recipientDID = erikaBlankDID;
      //   }
      //   if (erikaBlankDID === senderDID) {
      //     recipientDID = michaelOsofskyDID;
      //   }
      //   if (NOT_SET !== recipientDID) {
      //
      //     const profileConnection = await vContext.getClient().openPublicProfile(senderDID, 'Verida: Vault', 'basicProfile');
      //     let senderName = NOT_SET;
      //     if (undefined !== profileConnection) {
      //         const publicProfile = await profileConnection.getMany({}, {});
      //         senderName = publicProfile.name;
      //         sendMessage(senderName, recipientDID, messaging);
      //     } else {
      //         throw new Error("TEADATE_ERROR: profileConnection is undefined");
      //     }
      //   } else {
      //     throw new Error("TEADATE_ERROR: Could not find a match for logged in user |" + senderDID + "|");
      //   }
      }
    },

    setDid(did: string) {
      this.did = did;
    },
  },
});
</script>
