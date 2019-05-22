<template>
  <v-list>
    <v-list-tile v-for="(item, index) in options" :key="item.label">
      <v-list-tile-content>{{ index | numberToLetter }} - {{ item.label }}</v-list-tile-content>
      <v-list-tile-action>
        <v-icon color="pink" class="poll-list-item-delete" @click="handleDelete(index)">close</v-icon>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>
<style>
.poll-list-item-delete {
    cursor: pointer;
    user-select: none;
}
</style>

<script>
export default {
  props: ["options"],
  methods: {
      handleDelete(index) {
          this.$emit('delete', index);
      }
  },
  filters: {
    numberToLetter(index) {
      return String.fromCharCode(65 + index);
    }
  }
};
</script>
