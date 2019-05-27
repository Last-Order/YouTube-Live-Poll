<template>
  <v-container class="main-container" ref="mainContainer" grid-list-md :class="containerClass">
    <v-dialog v-model="showSetAPIKeyDialog" :persistent="true">
      <set-api-key-dialog @error="showErrorMessage" @saved="showSetAPIKeyDialog = false"/>
    </v-dialog>
    <v-dialog v-model="showAddOptionDialog">
      <add-option-dialog @error="showErrorMessage" @added="handleOptionAdded"/>
    </v-dialog>
    <v-snackbar v-model="error.show" color="error" :top="true" :timeout="5000">
      {{ error.message }}
      <v-btn dark flat @click="error.show = false">×</v-btn>
    </v-snackbar>
    <v-snackbar v-model="notice.show" :top="true">
      {{ notice.message }}
      <v-btn dark flat @click="notice.show = false">×</v-btn>
    </v-snackbar>
    <v-layout row wrap>
      <v-flex xs6>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.index.fillBasicInfo') }}</h3>
            <v-form>
              <v-text-field
                v-model="videoUrl"
                :label="$vuetify.t('$vuetify.index.pleaseInputVideoUrl')"
              />
              <v-select
                :items="languages"
                label="选择语言 / Select Language"
                item-text="label"
                item-value="value"
                v-model="nowLanguage"
              ></v-select>
            </v-form>
          </v-card-text>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.index.setPollOptions') }}</h3>
            <poll-option-list :options="options" @delete="handlePollOptionDelete"/>
            <v-btn
              flat
              @click="showAddOptionDialog = true"
            >{{ $vuetify.t('$vuetify.index.addOption') }}</v-btn>
            <v-btn
              color="primary"
              flat
              :disabled="status !== 'idle'"
              @click="saveOptions"
            >{{ $vuetify.t('$vuetify.index.saveOptions') }}</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.control.title') }}</h3>
            <v-btn
              color="primary"
              @click="start"
              :loading="startButtonLoading"
              :disabled="status !== 'idle'"
            >{{ $vuetify.t('$vuetify.control.start') }}</v-btn>
            <v-btn
              v-if="status === 'polling'"
              color="red"
              @click="stop"
            >{{ $vuetify.t('$vuetify.control.end') }}</v-btn>
          </v-card-text>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.result.title') }}</h3>
          </v-card-text>
          <result-graph :graph="result"/>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.display.title') }}</h3>
            <blockquote>
              <code>http://localhost:9317</code>
            </blockquote>
            <br>
            <p>{{ $vuetify.t('$vuetify.display.instruction') }}</p>
            <v-form>
              <v-checkbox
                :disabled="status !== 'idle'"
                :label="$vuetify.t('$vuetify.display.collectPollRealtime')"
                v-model="collectPollRealtime"
              ></v-checkbox>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import SetAPIKeyDialog from "./Home/SetAPIKey";
import AddOptionDialog from "./Home/AddOption";
import PollOptionList from "./Home/PollOptionList";
import ResultGraph from "./Home/ResultGraph";
import CommentListener from "../services/comment";
const fs = require("fs");
const path = require("path");
const socketio = require("socket.io-client");
import "./Index.css";

export default {
  data() {
    return {
      apiKey: undefined,
      showSetAPIKeyDialog: false,
      showAddOptionDialog: false,
      startButtonLoading: false,
      videoUrl: "",
      videoId: "",
      chatId: "",
      error: {
        show: false,
        message: ""
      },
      notice: {
        show: false,
        message: ""
      },
      options: [],
      result: {},
      resultBuffer: {},
      languages: [
        {
          label: "中文",
          value: "zh"
        },
        {
          label: "日本語",
          value: "ja"
        },
        {
          label: "English",
          value: "en"
        }
      ],
      nowLanguage: navigator.language.slice(0, 2),
      status: "idle",
      socketClient: undefined,
      collectPollRealtime: false,
      commentListener: undefined,
      commitResultBufferInterval: undefined,
      polledUser: {}
    };
  },
  computed: {
    containerClass() {
      return {
        "lang-ja": this.nowLanguage === "ja",
        "lang-zh": this.nowLanguage === "zh",
        "lang-en": this.nowLanguage === "en"
      };
    }
  },
  mounted() {
    this.checkInstall();
    this.socketClient = socketio("http://localhost:9317");
    if (localStorage.getItem("language")) {
      this.nowLanguage = localStorage.getItem("language");
    }
  },
  watch: {
    nowLanguage: function(language) {
      localStorage.setItem("language", language);
      this.socketClient.emit("update-language", language);
      this.$vuetify.lang.current = language;
    }
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
    /**
     * Start polling
     */
    async start() {
      if (!this.videoUrl) {
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.noVideoUrl")
        );
      }
      if (this.options.length === 0) {
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.noOptions")
        );
      }
      this.startButtonLoading = true;
      // Get live basic information
      this.commentListener = new CommentListener({
        url: this.videoUrl,
        apiKey: this.apiKey
      });
      try {
        await this.commentListener.init();
      } catch (e) {
        this.startButtonLoading = false;
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.failToGetVideoId")
        );
      }
      this.startButtonLoading = false;
      this.polledUser = {};
      // reset result
      const result = {};
      const resultBuffer = {};
      for (const index in this.options) {
        result[String.fromCharCode(65 + parseInt(index))] = 0;
        resultBuffer[String.fromCharCode(65 + parseInt(index))] = 0;
      }
      this.result = result;
      this.resultBuffer = resultBuffer;
      this.status = "polling";
      // start polling to retrieve live comments
      this.polling();
    },
    /**
     * Stop polling
     */
    async stop() {
      this.status = "idle";
      this.socketClient.emit("update-result", JSON.stringify(this.result));
      this.commentListener.disconnect();
      clearInterval(this.commitResultBufferInterval);
      this.commitResultBuffer();
    },
    async polling() {
      this.commentListener.connect();
      this.commentListener.on("comment", comment => {
        const charCode = comment.message[0].toUpperCase().charCodeAt();
        let userOption;
        // options available from 'A' to 'Z'
        if (charCode >= 65 && charCode <= 90) {
          userOption = String.fromCharCode(charCode);
        }
        // and also 'Ａ' to 'Ｚ'
        if (charCode >= 65313 && charCode <= 65338) {
          userOption = String.fromCharCode(charCode - 65248);
        }
        if (userOption && this.result[userOption] !== undefined) {
          if (!this.polledUser[comment.userId]) {
            // duplicated user
            this.incResult(userOption);
            this.polledUser[comment.userId] = true;
          }
        }
      });
      this.commentListener.on("error", e => {
        this.showErrorMessage(e.toString());
      });
      this.commitResultBufferInterval = setInterval(
        this.commitResultBuffer,
        1500
      );
    },
    incResult(key) {
      this.resultBuffer[key] += 1;
    },
    commitResultBuffer() {
      for (const key of Object.keys(this.resultBuffer)) {
        this.result[key] = this.result[key] + this.resultBuffer[key];
        this.resultBuffer[key] = 0;
      }
      if (this.collectPollRealtime) {
        // update display
        this.socketClient.emit("update-result", JSON.stringify(this.result));
      }
    },
    saveOptions() {
      fs.writeFileSync(
        // eslint-disable-next-line
        path.resolve(__static, "../runtime/options.json"),
        JSON.stringify(this.options)
      );
      this.socketClient.emit("refresh-options", "");
      this.socketClient.emit("update-language", this.nowLanguage);
      this.showNotice(this.$vuetify.t("$vuetify.index.optionSaved"));
    },
    handlePollOptionDelete(index) {
      this.options = [
        ...this.options.slice(0, index),
        ...this.options.slice(index + 1)
      ];
    },
    handleOptionAdded(label) {
      this.options.push({
        label
      });
      this.showAddOptionDialog = false;
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
    "set-api-key-dialog": SetAPIKeyDialog,
    PollOptionList,
    ResultGraph,
    AddOptionDialog
  }
};
</script>

<style>
</style>
