<template>
  <div v-loading="clinicalnoteData.loading" :class="classNames.EditorArea">
    <div :class="classNames.EditorWrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :parameterConfiguration="{
          inpatEmrSetId:
            currentActiveLoadedClinicalnote.options.content.emrSetId
        }"
        :editorOptions="{
          ContentRenderMode: DcEditorRenderModes.SET_PRINT_PREVIEW
        }"
        :toolbarOptions="toolbarOptions"
      ></PgEditor>
    </div>
  </div>
</template>

<script>
import BaseEditor from './BaseEditorPg'
import { DcEditorRenderModes } from '@/libs/PgEditor/constants'
export default {
  name: 'InpatientClinicalnoteEditor',
  extends: BaseEditor,
  data() {
    return {
      toolbarOptions: { isShow: false },
      embedEntrance: 'nurse'
    }
  },
  mounted() {
    this.setIsShow()
  },
  methods: {
    getEditor() {
      return this.$refs.pgEditorDom
    },
    aloneEvent() {
      const pgEditor = this.getEditor()
      pgEditor.switchContentRenderMode(DcEditorRenderModes.SET_PRINT_PREVIEW)
    },
    setIsShow() {
      const apiRecomendTipSwitchData = this.AllConfigure?.data?.find(el => {
        return el.inpatEmrParamConfigCode === 'COMMON026'
      })
      if (apiRecomendTipSwitchData.inpatEmrParamConfigContent == 'true') {
        this.toolbarOptions.isShow = true
      } else {
        this.toolbarOptions.isShow = false
      }
    }
  }
}
</script>

<style lang="scss">
$classNamespace: 'inpatient-clinicalnote-editor';
.#{$classNamespace}-area {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ececec;
  flex: 1 0 auto;

  .#{$classNamespace}-wrap {
    background-color: #ececec;
    flex: 1 0 auto;
    width: 100%;
  }

  .#{$classNamespace}-operation {
    box-sizing: border-box;
    background-color: white;
    flex: none;
    height: 48px;
    text-align: right;
    width: 100%;
    .el-row {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.#{$classNamespace}-wrap {
  .no-clinicalnote-content {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 100%;
    width: 100%;

    > span {
      color: rgba(0, 0, 0, 0.2);
      display: inline;
      font-size: 36px;
      flex: 0 0 auto;
    }
  }
}

.#{$classNamespace}-operation {
  border-top: 1px solid #c9c9c9;
  padding: 8px 8px;
  .isDisableBtnById {
    background-color: #e9e9e9;
    border-color: #c9c9c9;
    color: #999;
    cursor: no-drop;
  }
  .el-button {
    font-size: 14px;
    height: 32px;
    margin: 0 10px 0 0;
    padding: 0 25px;
  }
}
</style>
