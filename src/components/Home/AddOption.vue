<template>
    <v-card>
    <v-card-title>
      <span class="headline">{{ $vuetify.t('$vuetify.index.addOption') }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
          <v-layout>
              <v-text-field v-model="form.label" :label="$vuetify.t('$vuetify.index.addOptionLabel')"></v-text-field>
          </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="save" >{{ $vuetify.t('$vuetify.index.confirm') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
    data() {
        return {
            form: {
                label: ''
            }
        }
    },
    methods: {
        save() {
            if (!this.form.label) {
                return this.$emit('error', this.$vuetify.t('$vuetify.index.pleaseInputOptionLabel'))
            }
            this.$emit('added', this.form.label);
            this.form.label = '';
        }
    }
}
</script>
