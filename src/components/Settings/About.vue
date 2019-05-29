<template>
  <v-container>
    <v-layout>
      <v-flex>
        <div>
          YouTube-Live-Poll {{ version }}
          <a
            href="https://github.com/Last-Order/YouTube-Live-Poll"
            target="_blank"
          >https://github.com/Last-Order/YouTube-Live-Poll</a>
        </div>
        <div>Open-sourced under GPLv3. © 2019, Eridanus Sora, member of MeowSound Idols.</div>
      </v-flex>
    </v-layout>
    <v-layout>
        <v-flex>
            <v-btn color="error" flat @click="openDevTools">DevTools</v-btn>
        </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { remote } from 'electron'
import Version from "@/services/version";
export default {
  data() {
    return {
      version: ""
    };
  },
  mounted() {
    this.version = Version.getLocalVersion();
  },
  methods: {
      openDevTools() {
          remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
      }
  }
};
</script>