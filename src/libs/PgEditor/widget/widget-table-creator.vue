<template>
  <section class="editor-table-creator">
    <el-row>
      <el-col :span="24">
        行
        <el-input-number v-model="rowNum" :min="1" :max="10" label="行" size="mini"></el-input-number>
      </el-col>
      <el-col :span="24">
        列
        <el-input-number v-model="colNum" :min="1" :max="10" label="列" size="mini"></el-input-number>
      </el-col>
      <el-col :span="24">
        <el-divider content-position="left">预览</el-divider>
        <div class="table-section">
          <table>
            <tr v-for="i in rowNum" :key="'row' + i">
              <td v-for="j in colNum" :key="'col' + j"></td>
            </tr>
          </table>
        </div>
      </el-col>
      <el-col :span="24" style="text-align:right">
        <el-button type="primary" size="mini" @click="$emit('submit', { rowNum, colNum })">确定</el-button>
        <el-button size="mini" @click="$emit('cancel')">取消</el-button>
      </el-col>
    </el-row>
  </section>
</template>

<script>
export default {
  data() {
    return {
      rowNum: 1,
      colNum: 2
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-table-creator {
  /deep/ .el-col {
    margin-bottom: 8px;

    &:first-child {
      margin-top: 8px;
    }

    .el-input-number {
      margin-left: 8px;
    }
  }
  .table-section {
    width: 100%;
    margin-top: -8px;
    overflow: auto;
  }
  table {
    width: 100%;
    td {
      border: 1px solid #c9c9c9;
      padding: 10px;
    }
  }
}
</style>
