<template>
  <div class="inpatient-emr-navigate-panel-wrap">
    <div class="inpatient-emr-navigate-panel">
      <div class="inpatient-emr-navigate-panel-header">
        <div class="panel-header-left">病历文书</div>
        <div class="panel-header-right"></div>
      </div>
      <div class="inpatient-emr-navigate-panel-body">
        <emr-tree ref="emrTree" />
      </div>
      <section class="inpatient-emr-navigate-panel-footer">
        <el-button type="primary" size="mini" @click="showEmrCreateDialog">新增</el-button>
      </section>
    </div>
  </div>
</template>

<script>
import EmrTree from './EmrTree'
export default {
  name: 'InpatientEmrNavigatePanel',
  components: {
    EmrTree,
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    showEmrCreateDialog() {},
  },
}
</script>
<style lang="scss" scoped>
.inpatient-emr-navigate-panel-wrap {
  width: 500px;
  height: 100%;
  // margin-right: 10px;
  .inpatient-emr-navigate-panel {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    background: #fff;
    .inpatient-emr-navigate-panel-header {
      .panel-header-left {
        font-weight: bold;
      }
    }
    .inpatient-emr-navigate-panel-body {
      flex: 1;
    }
    .inpatient-emr-navigate-panel-footer {
      display: flex;
      justify-content: center;
      padding: 10px;
      .el-button {
        width: 80%;
      }
    }
  }
}
</style>

