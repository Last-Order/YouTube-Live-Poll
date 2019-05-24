<template>
  <v-container class="main-container" ref="mainContainer" grid-list-md>
    <v-dialog v-model="showSetAPIKeyDialog" :persistent="true">
      <set-api-key-dialog @error="showErrorMessage" @saved="showSetAPIKeyDialog = false"/>
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
            <v-btn flat>{{ $vuetify.t('$vuetify.index.addOption') }}</v-btn>
            <v-btn
              color="primary"
              flat
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
            <p>{{ $vuetify.t('$vuetify.display.instruction') }}</p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import SetAPIKeyDialog from "./Home/SetAPIKey";
import PollOptionList from "./Home/PollOptionList";
import ResultGraph from "./Home/ResultGraph";
import YouTube from "../services/youtube";
import utils from "../utils/common";
const fs = require("fs");
const path = require("path");
import "./Index.css";

export default {
  data() {
    return {
      apiKey: undefined,
      showSetAPIKeyDialog: false,
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
      options: [
        {
          label: "AAAAA"
        },
        {
          label: "BBBBB"
        }
      ],
      result: {},
      languages: [
        {
          label: "中文",
          value: "zh"
        },
        {
          label: "日本語",
          value: "ja"
        }
      ],
      nowLanguage: "zh",
      status: "idle",
      pollingInterval: undefined,
      nextPageToken: undefined,
      startedAt: new Date()
    };
  },
  mounted() {
    this.checkInstall();
    if (localStorage.getItem("language")) {
      this.nowLanguage = localStorage.getItem("language");
    }
  },
  watch: {
    nowLanguage: function(language) {
      localStorage.setItem("language", language);
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
      try {
        this.videoId = await YouTube.getVideoId(this.videoUrl);
        this.chatId = await YouTube.getChatId(this.videoId, this.apiKey);
      } catch (e) {
        this.startButtonLoading = false;
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.failToGetVideoId")
        );
      }
      this.startButtonLoading = false;
      // reset result
      const result = {};
      for (const index in this.options) {
        result[String.fromCharCode(65 + parseInt(index))] = 0;
      }
      this.result = result;
      this.status = "polling";
      // start polling to retrieve live comments
      this.startedAt = new Date();
      this.polling();
    },
    /**
     * Stop polling
     */
    async stop() {
      this.status = "idle";
    },
    async polling() {
      // eslint-disable-next-line
      while (true) {
        if (this.status === "idle") {
          // exit when stop
          break;
        }
        try {
          const messages = await YouTube.getChatMessages(
            this.chatId,
            this.apiKey,
            this.nextPageToken
          );
          this.nextPageToken = messages.nextPageToken;
          for (const item of messages.items) {
            // empty message
            if (!item.snippet.displayMessage) {
              continue;
            }
            // // send before start
            // if (new Date(item.snippet.publishedAt).valueOf() < this.startedAt.valueOf()) {
            //   continue;
            // }
            const charCode = item.snippet.displayMessage[0]
              .toUpperCase()
              .charCodeAt();
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
              this.result[userOption] = this.result[userOption] + 1;
            }
          }
          // cooldown
          await utils.sleep(messages.pollingIntervalMillis);
        } catch (e) {
          this.showErrorMessage(e.toString());
        }
      }
    },
    saveOptions() {
      fs.writeFileSync(
        // eslint-disable-next-line
        path.resolve(__static, "./server/options.json"),
        JSON.stringify(this.options)
      );
    },
    handlePollOptionDelete(index) {
      this.options = [
        ...this.options.slice(0, index),
        ...this.options.slice(index + 1)
      ];
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
    ResultGraph
  }
};
</script>

<style>
</style>
