<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ $vuetify.t('$vuetify.index.setAPIKey') }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-layout>
          <v-text-field v-model="form.apiKey" label="API Key"></v-text-field>
        </v-layout>
        <v-layout>
          <a :href="$vuetify.t('$vuetify.index.howToGetAPIKeyLink')" target="_blank">{{ $vuetify.t('$vuetify.index.howToGetAPIKey') }}</a>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="save">{{ $vuetify.t('$vuetify.index.confirm') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      form: {
        apiKey: ""
      }
    };
  },
  methods: {
    save() {
      if (!this.form.apiKey) {
        return this.$emit(
          "error",
          this.$vuetify.t("$vuetify.index.pleaseInputAPIKey")
        );
      }
      localStorage.setItem("api_key", this.form.apiKey);
      this.$emit("saved");
    }
  }
};
</script>
