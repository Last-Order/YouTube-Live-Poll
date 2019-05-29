<template>
  <v-tabs v-model="settingPanelTab">
    <v-tab :key="1">{{ $vuetify.t('$vuetify.setting.credential') }}</v-tab>
    <v-tab-item :key="1">
      <credential />
    </v-tab-item>
    <v-tab :key="4">{{ $vuetify.t('$vuetify.setting.about') }}</v-tab>
    <v-tab-item :key="4">
      <about/>
    </v-tab-item>
  </v-tabs>
</template>
<script>
import About from "./About";
import Credential from "./Credential";
export default {
  data() {
    return {
      settingPanelTab: 0
    };
  },
  components: {
    About,
    Credential
  }
};
</script>