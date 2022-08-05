<template>
  <div v-loading="clinicalnoteData.loading" :class="classNames.EditorArea">
    <div ref="editorContainer" :class="classNames.EditorWrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :userInfo="userInfo"
        :parameterConfiguration="{
          editorType: 'archiveReview',
          inpatEmrSetId:
            currentActiveLoadedClinicalnote.options.content.emrSetId
        }"
        :toolbarOptions="toolbarOptions"
      />
    </div>
    <!-- 已归档的病历簿不显示操作按钮 -->
    <!-- permisstionKey每次权限切换更新重新渲染，修改签名框不消失问题及签名框定位问题 -->
    <div
      v-if="!clinicalnoteRecordArchived && emrLoaded"
      :key="permisstionKey"
      :class="classNames.EditorOperation"
    >
      <editorButton
        v-if="
          isShowBtnById(operationActionPermisstionIds.REVISE_SUBMIT) &&
            (mode == DcEditorRenderModes.SET_WORK_MODE_APP ||
              mode == DcEditorRenderModes.SET_WORK_MODE_BROWSE)
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.REVISE_SUBMIT)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.REVISE_SUBMIT
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        type="primary"
        buttonName="提交阅改"
        @buttonClick="handleSaveAction(clinicalnoteData.content.emrSetId)"
      ></editorButton>
      <editorButton
        v-if="
          isShowBtnById(operationActionPermisstionIds.REVISE_PASS) &&
            mode != DcEditorRenderModes.SET_WORK_MODE_APP &&
            mode != DcEditorRenderModes.SET_WORK_MODE_BROWSE
        "
        :disabled="isDisableBtnById(operationActionPermisstionIds.REVISE_PASS)"
        :operationActionPermisstionId="
          operationActionPermisstionIds.REVISE_PASS
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        type="primary"
        buttonName="阅改通过"
        @buttonClick="handleRevisePassAction(clinicalnoteData.content.emrSetId)"
      ></editorButton>
    </div>
    <dialog-coll v-if="dialogCollVisible" ref="DialogColl" @close="dialogCollVisible = false"></dialog-coll>
    <DocumentUpdatePrompt :visible.sync="documentUpdatePromptDialogVisible"></DocumentUpdatePrompt>
  </div>
</template>
<script>
import apiMedicalManager from '@/api/dailyManager/medicalManager.js'
import pgBaseEditor from './BaseEditorPg'
export * from './BaseEditorPg'
export const OperationActionPermisstionIds = {
  REVISE_PASS: '100000000',
  REVISE_SUBMIT: '100000001'
}
import { apiSaveInpatientClinicalnoteContent } from '@/api/navigate'

export default {
  name: 'ClinicalnoteRevise',
  components: {},
  extends: pgBaseEditor,
  computed: {
    operationActionPermisstionIds() {
      return OperationActionPermisstionIds
    }
  },
  methods: {
    async handleRevisePassAction() {
      let inpEmrSetId = this.clinicalnoteData.content.emrSetId
      await apiMedicalManager.reviseSubmitAction({ inpEmrSetId }).catch(() => {
        {
          this.$message({
            message: '阅改失败',
            type: 'warning',
            showClose: true
          })
        }
      })

      this.$message({
        message: '阅改通过!',
        type: 'success',
        showClose: true
      })

      this.controlClinicalnoteContentStateAsync()
      //病历审核刷新导航列表
      this.$root.eventHub.$emit('revise/refreshNavigation')
    },
    async handleSaveAction(emrSetId, isShowProcess = true) {
      emrSetId = emrSetId || this.clinicalnoteData.content.emrSetId
      try {
        isShowProcess && this.showClinicalnoteProcessing(true)
        await this.sendingDataSourceInformation(
          this.clinicalnoteData.serial,
          emrSetId
        ) //其他数据源信息
        await this.saveClinicalnoteContentAsync(isShowProcess, emrSetId)
        this.controlClinicalnoteContentStateAsync()
        //病历阅改刷新导航列表
        this.$root.eventHub.$emit('revise/refreshNavigation')
        //重置内容改动状态
        this.handleResetXDocsChanged(emrSetId, 'update')
      } finally {
        isShowProcess && this.showClinicalnoteProcessing(false)
      }
    },
    async controlClinicalnoteContentStateAsync() {
      const result = await this.queryClinicalnotePermissionAsync()
      this.operationPermisstionData = result
      this.permisstionKey = +new Date()
      // this.$nextTick(() => {
      //   setTimeout(() => {
      //     const pgEditor = this.getEditor()
      //     pgEditor.switchContentRenderMode(
      //       DcEditorRenderModes.SET_PRINT_PREVIEW
      //     )
      //   }, 500)
      // })
    },
    async queryClinicalnotePermissionAsync(_emrSetId) {
      const { content } = this.clinicalnoteData
      let emrSetId = _emrSetId ?? content.emrSetId

      const res = await apiMedicalManager.getRevisePermission({
        inpEmrSetId: emrSetId
      })

      const { data } = res

      return {
        //病历是否可编辑由后台传的病历状态和多人编辑的冻结状态控制
        editable: data.canEdit,
        permissionVOList: data.permissionVOList
      }
    },
    async saveClinicalnoteContentAsync(isShowProcess = true, inpatEmrSetId) {
      inpatEmrSetId = inpatEmrSetId || this.clinicalnoteData.content.emrSetId
      isShowProcess && this.showClinicalnoteProcessing(true)

      let content = await this.getClinicalnoteContent(
        this.clinicalnoteData.serial ? inpatEmrSetId : ''
      )
      let inpatEmrRecordId = null
      if (this.clinicalnoteData.serial) {
        inpatEmrRecordId = this.loadedSubDocList?.find(
          el => el.id == inpatEmrSetId
        )?.inpatEmrRecordId
      } else {
        inpatEmrRecordId = this.clinicalnoteData.content?.inpatEmrRecordId
      }
      console.log('保存时的病历内容 ---------- ', content)

      if (!content) {
        isShowProcess && this.showClinicalnoteProcessing(false)
        return
      }
      const { base64Str, structuralData, inpEmrContentBodyData } = content
      if (!base64Str) {
        isShowProcess && this.showClinicalnoteProcessing(false)
        return
      }

      const { bizRoleId, encounterId } = this.currentPatientInfo
      const params = {
        operationType: 'commitCheck', //病历阅改功能添加暂存标志
        inpatEmrSetId,
        emrRecordAddInfo: {
          bizRoleId,
          encounterId,
          inpatEmrSetId,
          inpatEmrRecordId
        },
        emrContentAddInfo: {
          inpEmrContentBodyData,
          inpatEmrContentData: base64Str
        },
        emrSectionAddInfos: structuralData.sectionData,
        emrSectionDataElementAddInfos: structuralData.dataElementData
      }

      await apiSaveInpatientClinicalnoteContent(params)
        .then(
          async res => {
            //更新病历版本号
            await this.upDateVersion(res, true, 5)
            if (isShowProcess) {
              if (res?.success) {
                this.$message({
                  message: res?.errorDetail?.message || '提交阅改成功',
                  type: 'success',
                  showClose: true
                })
              } else {
                this.$message({
                  message: res?.errorDetail?.message || '提交阅改失败',
                  type: 'success',
                  showClose: true
                })
              }
            }
          }
          // () => {
          //   isShowProcess &&
          //     this.$message({
          //       message: '提交阅改失败',
          //       type: 'warning',
          //       showClose: true
          //     })
          // }
        )
        .finally(() => {
          isShowProcess && this.showClinicalnoteProcessing(false)
        })
        .catch(e => {
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
    }
  }
}
</script>
