<template>
  <v-chart :options="line" class="chart" />
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
    return {
      line: {
        xAxis: {
          type: "category",
          data: Array.from(this.graph, i => i.label)
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: Array.from(this.graph, i => i.value),
            type: "bar"
          }
        ]
      }
    };
  },
  components: {
    "v-chart": ECharts
  }
};
</script>
