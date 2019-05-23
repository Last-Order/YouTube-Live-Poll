<template>
  <v-app>
    <v-content>
      <Index/>
    </v-content>
  </v-app>
</template>

<script>
import Index from './components/Index'

export default {
  name: 'App',
  components: {
    Index
  },
  data () {
    return {
      //
    }
  }
}
</script>
