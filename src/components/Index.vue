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
            <v-btn color="primary" flat>{{ $vuetify.t('$vuetify.index.saveOptions') }}</v-btn>
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
          </v-card-text>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.result.title') }}</h3>
          </v-card-text>
          <result-graph v-if="resultGraphData.length > 0" :graph="resultGraphData" />
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
          label: "XXXXXX"
        }
      ],
      result: {
        
      },
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
      nowLanguage: "zh"
    };
  },
  mounted() {
    this.checkInstall();
    if (localStorage.getItem("language")) {
      this.nowLanguage = localStorage.getItem("language");
    }
  },
  computed: {
    resultGraphData() {
      // const optionMap = {};
      // for (const index in this.options) {
      //   optionMap[String.fromCharCode(65 + index)] = this.options[index].label;
      // }
      return Array.from(Object.keys(this.result), index => {
        return {
          label: index,
          value: this.result[index]
        };
      });
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
    async start() {
      const apiKey = localStorage.getItem("api_key");
      if (!this.videoUrl) {
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.noVideoUrl")
        );
      }
      this.startButtonLoading = true;
      try {
        this.videoId = await YouTube.getVideoId(this.videoUrl);
        this.chatId = await YouTube.getChatId(this.videoId, apiKey);
      } catch (e) {
        this.startButtonLoading = false;
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.failToGetVideoId")
        );
      }
      this.startButtonLoading = false;
      const result = {};
      for (const index in this.options) {
        result[String.fromCharCode(65 + parseInt(index))] = 0;
      }
      this.result = result;
    },
    async polling() {
      let retries = 3;
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
