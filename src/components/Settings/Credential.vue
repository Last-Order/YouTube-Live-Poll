<template>
    <v-container>
    <v-layout>
      <v-flex>
        <v-form>
            <v-text-field :label="$vuetify.t('$vuetify.setting.setAPIKey')" v-model="form.apiKey"></v-text-field>
            <v-btn color="primary" @click="save">{{ $vuetify.t('$vuetify.setting.save') }}</v-btn>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
    data() {
        return {
            form: {
                apiKey: ''
            }
        }
    },
    mounted() {
        this.form.apiKey = localStorage.getItem('api_key');
    },
    methods: {
        save() {
            localStorage.setItem('api_key', this.form.apiKey);
        }
    }
}
</script>
