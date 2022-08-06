<template>
  <el-dialog
    title="诊断"
    :class="classNames.widgetDiagnosisDialogWrap"
    :visible.sync="store.widgetDiagnosisDialog.state.isShow"
    :modal="false"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    append-to-body
    width="982px"
    top="1vh"
    @close="hideDialog"
  >
    <!--诊断组件地址 http://172.16.6.203/winex/#/business-component/diagnosis-warp -->
    <!-- @outputCheckedDiagnosis="alertCheckedDiagnosis"  :userInfo="userInfo"-->
    <!-- <diagnosis-warp ref="clinical_diagnosis" :encounterInfo="encounterInfo" :userInfo="userInfo" /> -->
    <InpCliDiagosis
      v-if="store.widgetDiagnosisDialog.state.isShow"
      ref="clinical_diagnosis"
      :encounterInfo="currentPatientInfo"
      :userInfo="userInfo"
      :isShowFooterBtns="false"
      :defaultDiagnosisType="defaultDiagnosisType"
      @outputCheckedDiagnosis="handleCheckedDiagnosis"
    />
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" size="small" @click="refreshDiagnosis">引用</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { ClassNamespace, EditorEvent } from '../constants'
import mixins from '../mixins'
export default {
  name: 'WidgetDiagnosisDialog',
  components: {
    // diagnosisWarp
  },
  mixins: [mixins.getInjectMixin()],
  props: {},
  data() {
    return {
      classNamespace: ClassNamespace
    }
  },
  computed: {
    classNames() {
      return {
        widgetDiagnosisDialogWrap: `${this.classNamespace}-widget-diagnosis-dialog-wrap`
      }
    },
    defaultDiagnosisType() {
      return this.store.widgetDiagnosisDialog.state.diagnosisType
    }
  },
  inject: ['currentPatientInfo', 'userInfo'],
  methods: {
    // alertCheckedDiagnosis(list) {
    //   console.log(list)
    //   this.$alert(`<p style="word-break: break-all;font-size:15px;max-height:400px;overflow:auto;">${JSON.stringify(list)}</p>`, '选中的诊断', {
    //     dangerouslyUseHTMLString: true,
    //   })
    // },
    async refreshDiagnosis() {
      const diagnosisRes = await this.$refs.clinical_diagnosis.getAllDiagnosis()
      console.log('获取所有的诊断信息 -------- ', diagnosisRes)
      this.eventEmitter.$emit(
        EditorEvent.PG_EVENT_REFRESH_DIAGNOSIS,
        diagnosisRes.data,
        this.$refs.clinical_diagnosis.getCurrentDiagnosisType()
      )
      this.hideDialog()
    },
    handleCheckedDiagnosis() {
      // todo 暂时无用
    },
    hideDialog() {
      this.store.widgetDiagnosisDialog.state.isShow = false
      this.store.widgetDiagnosisDialog.state.diagnosisType = ''
      this.eventEmitter.$emit(EditorEvent.PG_EVENT_DIAGNOSIS_DIALOG_CLOSE)
    }
  }
}
</script>

<style lang="scss" scoped>
$classNamespace: 'pg-editor';

.#{$classNamespace}-widget-diagnosis-dialog-wrap {
  /deep/ .el-dialog__body {
    padding: 20px 20px 0;
    height: 750px;
  }

  /deep/ .diagnosis-warp {
    box-shadow: none;
    padding: 0;
    .el-table::before {
      bottom: 4px;
    }
    // height: 450px !important;
    .diagnosis-warp-main {
      .title {
        display: none;
      }

      .diagnosis-subtable {
        padding: 8px 0;
      }
    }
  }
}

.diagnosis-container {
  height: 100%;
  width: 100%;
}
</style>
