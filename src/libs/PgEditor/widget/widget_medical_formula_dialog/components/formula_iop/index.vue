<template>
  <div class="formula-pop-wrap">
    <el-table :data="tableData" style="width: 100%" @cell-click="hanldeCellClick">
      <el-table-column prop="cursor" label="标尺刻度" width="70"></el-table-column>
      <el-table-column label="5_5g" width="180">
        <el-table-column prop="p5_5hg" label="mmHg" width="120"></el-table-column>
        <el-table-column prop="p5_5kpa" label="kpa" width="120"></el-table-column>
      </el-table-column>
      <el-table-column label="7_5g">
        <el-table-column prop="p7_5hg" label="mmHg" width="120"></el-table-column>
        <el-table-column prop="p7_5kpa" label="kpa" width="120"></el-table-column>
      </el-table-column>
      <el-table-column label="10_0g">
        <el-table-column prop="p10_0hg" label="mmHg" width="120"></el-table-column>
        <el-table-column prop="p10_0kpa" label="kpa" width="120"></el-table-column>
      </el-table-column>

      <el-table-column label="15_0g">
        <el-table-column prop="p15_0hg" label="mmHg" width="120"></el-table-column>
        <el-table-column prop="p15_0kpa" label="kpa" width="120"></el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import iopData from './iop_data'
export default {
  name: 'FormulaIop',
  props: {},
  data() {
    return {
      tableData: iopData
    }
  },
  computed: {},
  beforeDestroy() {},
  mounted() {},
  methods: {
    hanldeCellClick(row, column) {
      if (column.label === 'kpa') {
        this.$emit('input', row[column.property])
      }
    }
  }
}
</script>
