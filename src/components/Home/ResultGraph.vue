<template>
  <v-chart v-if="resultGraphData.length > 0" :options="bar" class="chart"/>
</template>
<style>
.chart {
  width: 100%;
}
</style>

<script>
import ECharts from "vue-echarts";
import "echarts/lib/chart/bar";
export default {
  props: ["graph"],
  data() {
    return {};
  },
  computed: {
    bar() {
      if (this.resultGraphData.length > 0) {
        return {
          xAxis: {
            type: "category",
            data: Array.from(this.resultGraphData, i => i.label)
          },
          yAxis: {
            type: "value"
          },
          series: [
            {
              data: Array.from(this.resultGraphData, i => i.value),
              type: "bar"
            }
          ]
        };
      } else {
        return {};
      }
    },
    resultGraphData() {
      if (!this.graph) {
        return [];
      }
      // const optionMap = {};
      // for (const index in this.options) {
      //   optionMap[String.fromCharCode(65 + index)] = this.options[index].label;
      // }
      return Array.from(Object.keys(this.graph), index => {
        return {
          label: index,
          value: this.graph[index]
        };
      });
    }
  },
  components: {
    "v-chart": ECharts
  }
};
</script>
