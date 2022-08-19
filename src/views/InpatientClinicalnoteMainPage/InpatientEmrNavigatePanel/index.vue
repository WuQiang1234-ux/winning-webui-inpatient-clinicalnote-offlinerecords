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
        <el-button type="primary" size="small" @click="showEmrCreateDialog">新增</el-button>
      </section>
    </div>
    <clinicalnote-creator-dialog
      :emrCreateDialogData="emrCreateDialogData"
      v-if="emrCreateDialogData.isShow"
      @clinicalnoteCreated="handleTabChange(selectedTab)"
    />
  </div>
</template>

<script>
import EmrTree from './EmrTree'
import ClinicalnoteCreatorDialog from './ClinicalnoteCreatorDialog'
export default {
  name: 'InpatientEmrNavigatePanel',
  components: {
    EmrTree,
    ClinicalnoteCreatorDialog,
  },
  data() {
    return {}
  },
  computed: {
    emrCreateDialogData() {
      return this.$patientRootComponentStore.state.emr.emrCreateDialogData
    },
  },
  watch: {},
  created() {
    console.log(this.$patientRootComponentStore, 'patientRootComponentStore')
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    showEmrCreateDialog() {
      this.$patientRootComponentStore.commit('emr/showEmrCreateDialog')
    },
    handleTabChange() {
      this.$refs.emrTree.getClinicalnoteTree()
    },
  },
}
</script>
<style lang="scss" scoped>
.inpatient-emr-navigate-panel-wrap {
  min-width: 300px;
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
      .el-button {
        width: 50%;
      }
    }
  }
}
</style>

