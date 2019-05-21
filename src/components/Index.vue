<template>
  <v-container class="main-container" ref="mainContainer">
    <v-dialog v-model="showSetAPIKeyDialog" :persistent="true">
      <set-api-key-dialog @error="showErrorMessage" @saved="showSetAPIKeyDialog = false" />
    </v-dialog>
    <v-snackbar v-model="error.show" color="error" :top="true" :timeout="5000">
      {{ error.message }}
      <v-btn dark flat @click="error.show = false">×</v-btn>
    </v-snackbar>
    <v-snackbar v-model="notice.show" :top="true">
      {{ notice.message }}
      <v-btn dark flat @click="notice.show = false">×</v-btn>
    </v-snackbar>
  </v-container>
</template>
<script>
import SetAPIKeyDialog from "./Home/SetAPIKey";
import "./Index.css";

export default {
  data() {
    return {
      apiKey: undefined,
      showSetAPIKeyDialog: false,
      error: {
        show: false,
        message: ''
      },
      notice: {
        show: false,
        message: ''
      }
    };
  },
  mounted() {
    this.checkInstall();
  },
  methods: {
    checkInstall() {
      const apiKey = localStorage.getItem("api_key");
      if (apiKey) {
        this.apiKey = apiKey;
      } else {
        this.showSetAPIKeyDialog = true;
      }
    },
    showErrorMessage(message) {
      this.error.show = true;
      this.error.message = message;
    },
    showNotice(message) {
      this.notice.show = true;
      this.notice.message = message;
    },
    hideNotice() {
      this.notice.show = false;
    }
  },
  components: {
    'set-api-key-dialog': SetAPIKeyDialog
  }
};
</script>

<style>
</style>
