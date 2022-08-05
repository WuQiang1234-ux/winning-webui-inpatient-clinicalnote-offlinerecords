<template>
  <div v-loading="clinicalnoteData.loading" :class="classNames.EditorArea">
    <div :class="classNames.EditorWrap">
      <PgEditor
        ref="pgEditorDom"
        :parameterConfiguration="{
          inpatEmrSetId:
            currentActiveLoadedClinicalnote.options.content.emrSetId
        }"
        :userInfo="userInfo"
        :patientInfo="currentPatientInfo"
        :toolbarOptions="toolbarOptions"
        :consultationReplyDepOptions="consultationReplyDepOptions"
      />
    </div>
    <div :class="classNames.EditorOperation">
      <editorButton
        v-if="
          consultationIsShowBtnById(operationActionPermisstionIds.RECEPTION)
        "
        :loading="receiveLoad"
        :disabled="isDisableBtnById(operationActionPermisstionIds.RECEPTION)"
        :operationActionPermisstionId="operationActionPermisstionIds.RECEPTION"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="接 收"
        @buttonClick="handleReception"
      ></editorButton>
      <editorButton
        v-if="
          consultationIsShowBtnById(operationActionPermisstionIds.DESIGNATE)
        "
        :disabled="isDisableBtnById(operationActionPermisstionIds.DESIGNATE)"
        :operationActionPermisstionId="operationActionPermisstionIds.DESIGNATE"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="指 派"
        @buttonClick="handleDesignate"
      ></editorButton>
      <!-- <editorButton buttonName="测试" @buttonClick="test"></editorButton> -->
      <!-- 新增 -->
      <editorButton
        v-if="
          consultationIsShowBtnById(
            operationActionPermisstionIds.CONSULT_CONFIRM
          )
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.CONSULT_CONFIRM)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.CONSULT_CONFIRM
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="审核确认"
        @buttonClick="handleConfirmAudit('审核确认')"
      ></editorButton>

      <editorButton
        v-if="
          consultationIsShowBtnById(
            operationActionPermisstionIds.CONSULT_SCHEDULE
          )
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.CONSULT_SCHEDULE)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.CONSULT_SCHEDULE
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="审核调度"
        @buttonClick="
          handleConfirmAudit('审核调度')
        "
      ></editorButton>
      <editorButton
        v-if="consultationIsShowBtnById(operationActionPermisstionIds.SNASER)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.SNASER)"
        :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="暂 存"
        @buttonClick="consultationHandleHandleSaveAction"
      ></editorButton>
      <SignatureButton
        v-if="
          consultationIsShowBtnById(
            operationActionPermisstionIds.SUBMIT_AND_SIGN
          ) && !isSponsor
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.SUBMIT_AND_SIGN)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.SUBMIT_AND_SIGN
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        :hasSignature="hasSignature"
        buttonName="提 交"
        @confirm="consultationHandleSubmitAction"
      ></SignatureButton>
      <editorButton
        v-if="
          consultationIsShowBtnById(
            operationActionPermisstionIds.SUBMIT_AND_SIGN
          ) && isSponsor
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.SUBMIT_AND_SIGN)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.SUBMIT_AND_SIGN
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="提 交"
        @buttonClick="consultationHandleSubmitAction"
      ></editorButton>
      <editorButton
        v-if="
          consultationIsShowBtnById(operationActionPermisstionIds.RECALL_SUBMIT)
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.RECALL_SUBMIT)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.RECALL_SUBMIT
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="撤销提交"
        type="warning"
        @buttonClick="consultationHandleRecallSubmitAction"
      ></editorButton>
      <editorButton
        v-if="consultationIsShowBtnById(operationActionPermisstionIds.FEEDBACK)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.FEEDBACK)"
        :operationActionPermisstionId="operationActionPermisstionIds.FEEDBACK"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="反 馈"
        @buttonClick="handleFeedbackAction('feedbackForm')"
      ></editorButton>
      <editorButton
        v-if="consultationIsShowBtnById(operationActionPermisstionIds.EVALUATE)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.EVALUATE)"
        :operationActionPermisstionId="operationActionPermisstionIds.EVALUATE"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="评 价"
        @buttonClick="handleFeedbackAction('ratingForm')"
      ></editorButton>
      <editorButton
        v-if="consultationIsShowBtnById(operationActionPermisstionIds.CANCEL)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.CANCEL)"
        :operationActionPermisstionId="operationActionPermisstionIds.CANCEL"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="取 消"
        @buttonClick="handleCancelConsultation"
      ></editorButton>
      <editorButton
        v-if="
          consultationIsShowBtnById(
            operationActionPermisstionIds.CANCEL_RECEPTION
          )
        "
        :disabled="
          isDisableBtnById(operationActionPermisstionIds.CANCEL_RECEPTION)
        "
        :operationActionPermisstionId="
          operationActionPermisstionIds.CANCEL_RECEPTION
        "
        :emrSetId="clinicalnoteData.content.emrSetId"
        :buttonName="'撤销接收'"
        @buttonClick="handleCancelReception"
      ></editorButton>
      <template>
        <!-- <editorButton buttonName="测试按钮" @buttonClick="test(clinicalnoteData.content.emrSetId)"></editorButton> -->
        <!-- 请勿删除 -->
        <template v-if="debug">
          <editorButton
            buttonName="获取会诊详情信息"
            @buttonClick="getParticulars(clinicalnoteData.content.emrSetId)"
          ></editorButton>
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="暂 存"
            @buttonClick="consultationHandleHandleSaveAction"
          ></editorButton>
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="获取结构化"
            @buttonClick="getXmlStructuring(clinicalnoteData.content.emrSetId)"
          ></editorButton>
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="导出xml"
            @buttonClick="getXml(clinicalnoteData.content.emrSetId)"
          ></editorButton>
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="导入xml"
            @buttonClick="setXml(clinicalnoteData.content.emrSetId)"
          ></editorButton>
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="上传pdf"
            @buttonClick="
              getClinicalnotePdf(clinicalnoteData.content.inpatEmrRecordId, 5)
            "
          ></editorButton>
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="编辑"
            @buttonClick="setbc"
          ></editorButton>
        </template>
      </template>
    </div>
    <dialog-coll v-if="dialogCollVisible" @close="dialogCollVisible = false"></dialog-coll>
    <assigned-to-the-window
      v-if="designateDialogVisible"
      :designateDialogVisible.sync="designateDialogVisible"
      :obtainApplicationForConsultation="obtainApplicationForConsultation"
      v-bind="$attrs"
      @deleteTask="deleteTask"
    />
    <delete-editor-dialog
      :documentUpdatePromptDialogVisible.sync="
        documentUpdatePromptDialogVisible
      "
      :currentDocId="currentDocId"
    ></delete-editor-dialog>
    <DocumentUpdatePrompt
      :emrSetId="currentActiveLoadedClinicalnote.options.content.emrSetId"
      :emrSetTitle="currentActiveLoadedClinicalnote.title"
      :visible.sync="documentUpdatePromptDialogVisible"
    ></DocumentUpdatePrompt>
    <clinicalnote-audit-dialog
      :obtainApplicationForConsultation="obtainApplicationForConsultation"
      ref="ClinicalnoteAuditDialog"
    ></clinicalnote-audit-dialog>
  </div>
</template>
<script>
// import $ from 'jquery'
let queryXmlIdKeys = {
  977572: 'CONSULT_REPLY_NORMAL_DATA_GROUP', //科间会诊
  977574: 'CONSULT_REPLY_OUTOFHOSPITAL_DATA_GROUP', //院外会诊
  399299500: 'CONSULT_REPLY_UNION_DATA_GROUP' //多科联合会诊
}
import dayjs from 'dayjs'
import {
  // apiQueryEmrSetInfo,
  apiSaveInpatientClinicalnoteContent
} from '@/api/navigate'
import { throttle, getConfigure } from '@/utils'
import { createNamespacedHelpers, mapState } from 'vuex'
const {
  mapMutations: componentsMapMutations,
  mapGetters: componentsMapGetters
} = createNamespacedHelpers('components/multiClinicalnoteBoardState')
import AssignedToTheWindow from '@/views/tasksCenter/components/AssignedToTheWindow'
// import { ClinicalnoteEditorEventKeys } from '@/components/InpatientClinicalnoteEditor'
import PgEditor from '../../libs/PgEditor'
import { EditorEvent, DataElementWinIds } from '@/libs/PgEditor/constants'
import BaseEditor from './BaseEditorPg'
import { ConsultationSignatureHelper } from '../../libs/PgEditor/helper/signature_helper'

import apiConsultation from '@/api/dailyManager/consultation.js'
export * from './BaseEditorPg'
import { decompress } from './BaseEditorPg/utils'
import DeleteEditorDialog from '@/components/InpatientClinicalnoteEditor/BaseEditorPg/components/DeleteEditorDialog'
import ClinicalnoteAuditDialog from '@/components/InpatientClinicalnoteEditor/BaseEditorPg/components/ClinicalnoteAuditDialog'
export default {
  name: 'ConsultationEditor',
  components: {
    AssignedToTheWindow,
    PgEditor,
    DeleteEditorDialog,
    ClinicalnoteAuditDialog
  },
  extends: BaseEditor,
  props: {
    //是否是主界面（主界面代答）
    isHome: {
      type: Boolean,
      default: false
    },
    entrancePermisstionIds: {
      type: Array,
      default() {
        return []
      }
    },
    dcLoading: {
      type: Boolean
    },
    clinicalnoteData: {
      type: Object,
      default: function() {
        return {
          content: {
            hasContent: true,
            emrSetId: '',
            emrSetTitle: '',
            xml: ''
          },

          replaceFilterList: []

          // prevVal: ''
        }
      }
    }
  },
  data() {
    return {
      obtainApplicationForConsultation: {
        applyInfo: { scheduleReviewAt: '' },
        consultReceiveInfos: []
      },
      designateDialogVisible: false,
      // sponsorOperate: null,
      pictureUrl: '',
      receiveLoad: false,
      consultationReplyDepOptions: {}
    }
  },
  computed: {
    ...componentsMapGetters(['loadedClinicalnoteIdList']),
    ...mapState(['userInfo', 'orgInfo']),
    isOutside() {
      //是否是院外会诊
      return (
        this.obtainApplicationForConsultation?.applyInfo?.consultTypeCode ==
        '977574'
      )
    },
    isSponsor() {
      let {
        applyInfo: { createdBy },
        authed
      } = this.obtainApplicationForConsultation
      console.log('创建人', createdBy, '当前人', this.userInfo.employeeId)
      return createdBy == this.userInfo.employeeId || !!authed
    },
    allSubmit() {
      //所有提交的答复区域id
      return this.obtainApplicationForConsultation.replyInfos
        .filter(el => el.statusCode == '390030407')
        .map(ele => ele.replyConceptId)
    },
    //会诊单发起人的id
    applyId() {
      let {
        applyInfo: { createdBy }
      } = this.obtainApplicationForConsultation
      return createdBy
    },
    //会诊单所有接收的人
    allRecipients() {
      let { consultReceiveInfos } = this.obtainApplicationForConsultation
      return consultReceiveInfos
    }
    // isUpdateAnswer() {
    //   return (
    //     this.obtainApplicationForConsultation?.applyInfo?.consultLastReplyId ==
    //       this.userInfo.employeeId ||
    //     !this.obtainApplicationForConsultation?.applyInfo?.consultLastReplyId
    //   )
    // }
  },
  mounted() {
    console.log(this.loadedClinicalnoteIdList, '2loadedClinicalnoteIdList')
    this.registerEventBus()
    document.addEventListener('keydown', this.keydown, false)
  },
  beforeDestroy() {
    this.removeEventBus()
    document.removeEventListener('keydown', this.keydown)
  },
  destroyed() {
    console.log('关闭了就清掉', this.clinicalnoteData.content.emrSetId)

    this.deleteInLoadedClinicalnoteListById(
      this.clinicalnoteData.content.emrSetId
    )
  },
  methods: {
    ...componentsMapMutations(['deleteInLoadedClinicalnoteListById']),
    consultationIsShowBtnById(id) {
      return this.isShowBtnById(id) && this.entrancePermisstionIds.includes(id)
    },
    keydown(e) {
      // ctrl+s 当前病历 会诊 有保存权限
      if (e.ctrlKey && e.keyCode == 83) {
        e.preventDefault()
        e.stopPropagation()
        if (
          this.preservationStatus &&
          this.currentActiveLoadedClinicalnote.options.content.emrSetId ==
            this.clinicalnoteData.content.emrSetId &&
          this.clinicalnoteData.content.emrTypeId == '121383422926546950' &&
          this.consultationIsShowBtnById(
            this.operationActionPermisstionIds.SNASER
          ) &&
          !this.isDisableBtnById(this.operationActionPermisstionIds.SNASER)
        ) {
          this.consultationHandleHandleSaveAction()
          console.log('这是会诊快捷键保存')
        }
      }
    },
    registerEventBus() {
      //设置答复信息
      const pgEditor = this.getEditor()
      pgEditor.eventEmitter.$on(
        EditorEvent.PG_EVENT_APPLICATION_INFORMATION,
        this.setApplicationInformation
      )
      pgEditor.eventEmitter.$on(
        EditorEvent.PG_EVENT_INPUT_CHANGE,
        this.pgEventInputChange
      )
    },
    removeEventBus() {
      //设置答复信息
      const pgEditor = this.getEditor()
      pgEditor.eventEmitter.$off(
        EditorEvent.PG_EVENT_APPLICATION_INFORMATION,
        this.setApplicationInformation
      )
    },
    handleCancelConsultation() {
      this.$confirm('此操作将取消该会诊申请单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.showClinicalnoteProcessing(true)
          apiConsultation
            .cancelConsultation({
              inpEmrSetId: this.clinicalnoteData.content.emrSetId
            })
            .then(res => {
              if (res?.success) {
                if (res?.data?.resultFlag) {
                  this.$emit(
                    'cancelConsultationSucceed',
                    this.clinicalnoteData.content.emrSetId
                  )

                  //关闭当前病历未处理
                  this.$message({
                    type: 'success',
                    message: '会诊取消成功!'
                  })
                } else {
                  this.$message({
                    type: 'info',
                    message: '会诊取消失败!'
                  })
                }
              }
            })
            .finally(() => {
              this.showClinicalnoteProcessing(false)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消该操作'
          })
        })
    },
    //会诊申请参数存储
    setApplicationInformation(data) {
      this.obtainApplicationForConsultation = data
      this.$root.eventHub.$emit('setApplicationInformation', data)
    },
    //接收
    handleReception() {
      if (!this.obtainApplicationForConsultation) return
      this.$confirm('此操作将接收该会诊请求, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.receiveLoad = true
          apiConsultation
            .acceptConsultation({
              inpConsultApplyId: this.obtainApplicationForConsultation.applyInfo
                .inpConsultApplyId //住院会诊申请标识
            })
            .then(res => {
              if (res && res.success) {
                //重新刷新步骤并定位
                //任务中心处理
                this.$emit('updateStep')
                //会诊管理
                this.$root.eventHub.$emit('Consultation/refresh')
                //主界面

                this.$message({
                  type: 'success',
                  message: '接收成功，请尽快参加会诊!'
                })
              }
            })
            .finally(() => {
              this.receiveLoad = false
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消接收会诊请求'
          })
        })
    },
    //指派
    handleDesignate() {
      this.designateDialogVisible = true
    },
    //删除当前任务
    deleteTask() {
      this.$emit('deleteTask')
    },
    handleAutoSaveAction() {
      // console.debug('调用自动保存失败，会诊不调用')
    },
    handleConfirmAudit(name) {
      let scheduleReviewAt = this.obtainApplicationForConsultation.applyInfo
        .scheduleReviewAt
      let consultApplyConfirmAt = this.obtainApplicationForConsultation
        .applyInfo.consultApplyConfirmAt
      const pgEditor = this.getEditor()
      this.$refs.ClinicalnoteAuditDialog.openInit(
        {
          name,
          scheduleReviewAt,
          consultApplyConfirmAt
        },
        async (scheduleReviewAt, feedbackContent) => {
          let param = pgEditor.getParamsFormat('', {
            conceptId: '399301375',
            displayValue: dayjs(scheduleReviewAt).format('YYYY-MM-DD')
          })
          let param2 = pgEditor.getParamsFormat(
            '',
            //会诊调度填充医务处意见
            {
              conceptId: '399317165',
              displayValue: feedbackContent
            }
          )
          pgEditor.pgEditorInstance.postmessage({
            type: 'SetValue',
            param: [param, param2]
          })
          // 医务科签名id：399582021
          await this.pgEditor.signatureHelper.signClinicalnote(
            '', //病程需要传当前子病程id
            DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_MEDICAL_DEPARTMENT_SIGNATURE
          )
          console.log('调度完成之后修改会诊时间', param)
          await this.saveClinicalnoteContentAsync() //暂存
          this.$emit('dispatchSucceed')
        },
        async feedbackContent => {
          let param = pgEditor.getParamsFormat(
            '',
            //会诊确认填充科主任意见
            {
              conceptId: '399317163',
              displayValue: feedbackContent
            }
          )
          pgEditor.pgEditorInstance.postmessage({
            type: 'SetValue',
            param: [param]
          })
          // 科主任签名id：399324019
          await this.pgEditor.signatureHelper.signClinicalnote(
            '', //病程需要传当前子病程id
            DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_HEAD_OF_DEPARTMENT_SIGNATURE
          )
          await this.saveClinicalnoteContentAsync() //暂存
          this.$emit('affirmSucceed')
        }
      )
    },
    //会诊暂存
    consultationHandleHandleSaveAction: throttle(async function() {
      await this.verifyDoc() //验证

      try {
        this.$emit('update:dcLoading', true)
        this.showClinicalnoteProcessing(true)
        if (this.isSponsor) {
          // if (this.isUpdateAnswer) {
          await this.setLatestSponsorData('save') //主界面更新答复处理
          // }
        } else {
          await this.setLatestData('save') //更新答复处理
        }
        await this.saveClinicalnoteContentAsync() //暂存
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()
        //提交成功触发该方法
        this.$emit('updateStep')
        this.$root.eventHub.$emit('Consultation/refresh')
      } finally {
        this.$emit('update:dcLoading', false)
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),
    //会诊提交
    consultationHandleSubmitAction: throttle(async function() {
      await this.prohibitedWords.setProhibitedWords()
      await this.verifyDoc() //验证

      if (this.isSponsor) {
        //不调用签名
      } else {
        //签名
        await this.consultationSignature()
      }

      try {
        this.showClinicalnoteProcessing(true)
        this.$emit('update:dcLoading', true)
        if (this.isSponsor) {
          // if (this.isUpdateAnswer) {
          await this.setLatestSponsorData('commit') //主界面更新答复处理
          // }

          // if (this.sponsorOperate == 'save') {
          //   await this.saveClinicalnoteContentAsync() //暂存
          // } else {
          await this.submitClinicalnoteAsync() //提交
          // }
        } else {
          await this.setLatestData('commit') //更新答复处理
          await this.saveClinicalnoteContentAsync() //暂存
        }
        await this.fillInTheReply()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()

        this.$emit('updateStep')
        this.$root.eventHub.$emit('Consultation/refresh')
      } finally {
        this.$emit('update:dcLoading', false)
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),
    //会诊撤销提交
    consultationHandleRecallSubmitAction: throttle(async function() {
      //设置成编辑模式
      if (this.isSponsor) {
        //不调用撤销签名
      } else {
        //撤销签名
        await this.cancelConsultationSignature()
      }
      this.$emit('update:dcLoading', true)
      try {
        this.showClinicalnoteProcessing(true)
        if (this.isSponsor) {
          // if (this.isUpdateAnswer) {
          await this.setLatestSponsorData('cansercommit') //主界面更新答复处理
          // }
          // if (this.sponsorOperate == 'save') {
          //   await this.saveClinicalnoteContentAsync() //暂存
          // } else {
          await this.recallSubmitClinicalnoteAsync() //撤销提交
          // }
        } else {
          await this.setLatestData('cansercommit') //更新答复处理
          await this.saveClinicalnoteContentAsync() //暂存
        }

        await this.controlClinicalnoteContentStateAsync() //权限
        await this.fillInTheReply()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()

        //提交成功触发该方法
        this.$emit('updateStep')
        this.$root.eventHub.$emit('Consultation/refresh')
      } finally {
        this.$emit('update:dcLoading', false)
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),
    async saveClinicalnoteContentAsync(messageStatus = true) {
      this.showClinicalnoteProcessing(true)

      const clinicalnoteData = this.clinicalnoteData

      let inpatEmrSetId = clinicalnoteData.content.emrSetId

      let content = null
      let inpatEmrRecordId = null
      content = await this.getClinicalnoteContent()

      console.log('保存时的病历内容 ---------- ', content)
      if (clinicalnoteData.serial) {
        inpatEmrRecordId = this.loadedSubDocList.find(
          el => el.id == inpatEmrSetId
        ).inpatEmrRecordId
      } else {
        inpatEmrRecordId = this.clinicalnoteData.content.inpatEmrRecordId
      }
      if (!content) {
        this.showClinicalnoteProcessing(false)
        return
      }
      const { base64Str, structuralData, inpEmrContentBodyData } = content

      if (!base64Str) {
        this.showClinicalnoteProcessing(false)
        return
      }

      const { bizRoleId, encounterId } = this.currentPatientInfo
      const params = {
        inpatEmrSetId,
        emrRecordAddInfo: {
          bizRoleId: bizRoleId,
          encounterId: encounterId,
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
      console.log(params)

      await apiSaveInpatientClinicalnoteContent(params)
        .then(
          async res => {
            //更新病历版本号
            await this.upDateVersion(res)
            if (messageStatus) {
              if (res?.success) {
                this.$message({
                  message: res?.errorDetail?.message || '保存成功',
                  type: 'success',
                  showClose: true
                })
              } else {
                this.$message({
                  message: res?.errorDetail?.message || '保存失败',
                  type: 'success',
                  showClose: true
                })
              }
            }
          },
          () => {
            this.$message({
              message: '保存失败',
              type: 'warning'
            })
          }
        )
        .finally(() => {
          this.showClinicalnoteProcessing(false)
        })
        .catch(e => {
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
    },
    //更新
    async setLatestData(operate) {
      //更新最新答复数据
      const clinicalnoteData = this.clinicalnoteData

      let inpatEmrSetId = clinicalnoteData.content.emrSetId
      let content = null
      content = await this.getClinicalnoteContent()
      let inpatEmrRecordId = this.clinicalnoteData.content.inpatEmrRecordId
      console.log('编辑结果 ---------- ', content)

      if (!content) {
        this.showClinicalnoteProcessing(false)
        return
      }
      const { base64Str, structuralData, inpEmrContentBodyData } = content
      if (!base64Str) {
        this.showClinicalnoteProcessing(false)
        return
      }

      const { bizRoleId, encounterId } = this.currentPatientInfo
      const params = {
        inpatEmrSetId,
        emrRecordAddInfo: {
          bizRoleId: bizRoleId,
          encounterId: encounterId,
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
      console.log(
        '提交参数1',
        DataElementWinIds.CONSULTATION_DEPARTMENT_INPUT,
        '提交参数2',
        params
      )
      // const pgEditor = this.getEditor()
      // let departmentVal = ''

      // if (this.isSponsor) {
      //   //当前是主界面代答，拿到代答人
      //   departmentVal = pgEditor.pgEditorInstance.postmessage({
      //     type: 'GetValue',
      //     param: {
      //       docId: this.applyId,
      //       conceptId: DataElementWinIds.CONSULTATION_DEPARTMENT_INPUT, //概念id
      //       valueType: 'text',
      //       buttonIconFlag: false,
      //       paragraphFlag: false,
      //       valueTarget: 'onlyDataElement'
      //     }
      //   })
      //   console.log(departmentVal, '给这些科室带答了')
      // }
      let { caInfo, inpConsultTreatmentAdvice } = this.getReplyContent()
      return apiConsultation
        .queryTheLatestReply({
          ...params,
          caInfo: caInfo[0]?.value,
          // insteadEmployeeIds: this.isSponsor ? caInfo[0]?.value : '',
          // invitedReplyDeptInfo: this.isSponsor
          //   ? departmentVal[0]?.value?.toString()
          //   : '',
          operate,
          inpConsultTreatmentAdvice
        })
        .then(async res => {
          console.log(res)
        })
        .catch(async e => {
          if (e?.errorDetail?.code.startsWith('WB')) {
            return Promise.resolve()
          }
          this.showClinicalnoteProcessing(false)
          this.$emit('update:dcLoading', false)
          return Promise.reject('接口请求错误')
        })
    },
    test() {
      const pgEditor = this.getEditor()
      let date2 = dayjs(new Date()).format('YYYY-MM-DD')
      let param = pgEditor.getParamsFormat('', {
        conceptId: '399301375',
        displayValue: date2
      })
      pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: [param]
      })
    },
    //会诊的签名
    async consultationSignature() {
      const pgEditor = this.getEditor()
      let domList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetDocList',
        param: ''
      })
      domList.shift()
      //优先找第一个接收人
      let createId = this.getCreateId(
        this.userInfo.employeeId,
        this.allRecipients
      )
      for (let el of domList) {
        // if (!this.isSponsor) {
        if (el.docId == createId) {
          await this.pgEditor.signatureHelper.signClinicalnote(
            el.docId, //病程需要传当前子病程id
            DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
          )
        }
        // } else {
        //   if (el.id == this.applyId) {
        //     //不处理
        //   }
        // }
      }
    },
    //会诊的签名
    async cancelConsultationSignature() {
      const pgEditor = this.getEditor()
      let domList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetDocList',
        param: ''
      })
      domList.shift()
      //优先找第一个接收人
      let createId = this.getCreateId(
        this.userInfo.employeeId,
        this.allRecipients
      )
      for (let el of domList) {
        // if (!this.isSponsor) {
        if (el.docId == createId) {
          await this.pgEditor.signatureHelper.unSignClinicalnote(
            el.docId //病程需要传当前子病程id
          )
        }
        // } else {
        //   if (el.id == this.applyId) {
        //     //不处理
        //   }
        // }
      }
    },
    async fillInTheConsultation() {
      const pgEditor = this.getEditor()
      await pgEditor.fillInTheConsultation(
        this.clinicalnoteData.content.emrSetId,
        this.clinicalnoteData.content.hasContent //之前是否保存过hasContent
      )
    },
    async fillInTheReply() {
      const pgEditor = this.getEditor()
      let isAddAnswer = false
      if (
        !this.entrancePermisstionIds.includes(
          this.operationActionPermisstionIds.SNASER
        )
      ) {
        //自己控制的权限中没有暂存就是观看模式
        isAddAnswer = false
      } else if (
        this.isShowBtnById(this.operationActionPermisstionIds.SNASER) &&
        !this.isDisableBtnById(this.operationActionPermisstionIds.SNASER)
      ) {
        isAddAnswer = true
      }

      //是否点亮答复
      console.log(
        '所有接收人：',
        this.allRecipients.map(el => el.acceptedEmployeeId),
        '当前人：',
        this.userInfo.employeeId,
        '是否添加答复',
        isAddAnswer,
        '是否为申请科室代答复',
        this.isSponsor
      )
      let domList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetDocList',
        param: ''
      })
      let consultReceiveInfos = this.allRecipients //所有接收人
      //isAddAnswer 如果没有自己的答复是否自动添加自己的答复段落
      //isSponsor 是否在同一输入域作答

      let employeeId = this.userInfo.employeeId
      console.log(
        'domList',
        domList,
        'isAddAnswer',
        isAddAnswer,
        ' this.userInfoGetter.employeeId',
        employeeId,
        'consultReceiveInfos',
        consultReceiveInfos
      )
      let createId = this.getCreateId(employeeId, consultReceiveInfos)

      //是否有自己的答复信息(true没有)
      let isUserFlag = true
      if (this.isSponsor) {
        if (this.isOutside) {
          //院外
          for (let el of domList) {
            if (el.docId == this.applyId && isAddAnswer) {
              pgEditor.pgEditorInstance.postmessage({
                type: 'SetEditableByDocId',
                param: [
                  {
                    docId: this.applyId,
                    isEditable: true
                  }
                ]
              })
              //定位光标
              this.positioningDepartment(this.applyId)
              isUserFlag = false
            } else {
              pgEditor.pgEditorInstance.postmessage({
                type: 'SetEditableByDocId',
                param: [
                  {
                    docId: el.docId,
                    isEditable: false
                  }
                ]
              })
            }
          }
        } else {
          //院内
          //有答复权限（申请人能够编辑所有已提交的，和自己的）
          console.log('所有提交的', this.allSubmit)
          for (let el of domList) {
            if (
              (el.docId == this.applyId || this.allSubmit.includes(el.docId)) &&
              isAddAnswer
            ) {
              pgEditor.pgEditorInstance.postmessage({
                type: 'SetEditableByDocId',
                param: [
                  {
                    docId: el.docId,
                    isEditable: true
                  }
                ]
              })
              //定位光标
              this.positioningDepartment(this.applyId)
            } else {
              pgEditor.pgEditorInstance.postmessage({
                type: 'SetEditableByDocId',
                param: [
                  {
                    docId: el.docId,
                    isEditable: false
                  }
                ]
              })
            }
          }
        }
      } else {
        for (let el of domList) {
          if (el.docId == createId && isAddAnswer) {
            //可编辑
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetEditableByDocId',
              param: [
                {
                  docId: el.docId,
                  isEditable: true
                }
              ]
            })
            setTimeout(() => {
              //定位光标
              this.positioningDepartment(el.docId)
            }, 2000)

            isUserFlag = false
          } else {
            //不可编辑
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetEditableByDocId',
              param: [
                {
                  docId: el.docId,
                  isEditable: false
                }
              ]
            })
          }
        }
      }

      //1没有当前人的答复单 2权限要填充新的 3是被邀人
      if (isUserFlag && isAddAnswer && !this.isSponsor) {
        //填充答复单，申請人不填充

        const xml = await this.getCreateXml()
        let docId = createId
        console.log('填充被邀人的答复区域', docId)
        pgEditor.pgEditorInstance.postmessage({
          type: 'FileAppend',
          param: [
            {
              srcstr: xml,
              newPage: false,
              // index: domList.length,
              docId,
              topMargin: 0,
              isEditable: true
            }
          ]
        })
        //填充當前新增的默認科室
        this.setDefaultOptions()
        return
      }
      //1没有当前人的答复单 2权限要填充新的 3是院外会诊 4是申请人
      if (isUserFlag && isAddAnswer && this.isOutside && this.isSponsor) {
        //院外会诊的答复区域
        console.log('填充院外会诊的答复区域')
        const xml = await this.getCreateXml()
        let docId = this.applyId
        pgEditor.pgEditorInstance.postmessage({
          type: 'FileAppend',
          param: [
            {
              srcstr: xml,
              newPage: false,
              // index: domList.length,
              docId,
              topMargin: 0,
              isEditable: true
            }
          ]
        })
      }
    },
    setDefaultOptions() {
      //院外会诊不处理
      if (this.isOutside) return
      const pgEditor = this.getEditor()
      let createId = ''
      if (this.isSponsor) {
        createId = this.applyId
      } else {
        createId = this.getCreateId(
          this.userInfo.employeeId,
          this.allRecipients
        )
      }
      //獲取到optinos
      console.log(this.getInviteeOptions(createId), 'uuiuu', createId)
      let currentItem = this.getInviteeOptions(createId)[0]
      let paramsArray = [
        {
          docId: createId,
          conceptId: currentItem.cptId,
          value: [
            {
              key: currentItem.deptId,
              value: currentItem.deptName
            }
          ],
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        }
      ]
      console.log('动态数据集设置值-會診默認的科室', paramsArray)
      paramsArray.length &&
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param: paramsArray
        })
    },
    getCreateId(employeeId, consultReceiveInfos) {
      console.log(consultReceiveInfos, '默认所有人')
      //（指派逻辑,答复区域添加和修改控制通过第一个接收人来判断，新增）
      let filterConsultReceiveInfos = consultReceiveInfos.filter(
        el => el.assignedFalg == 98176
      )
      console.log(filterConsultReceiveInfos, '过滤指派人')
      //如果当前人是被指派的最终人那么就去找到申请者id创建答复区域,否则就是自己
      return (
        filterConsultReceiveInfos.find(
          el => el.acceptedEmployeeId == employeeId
        )?.replyConceptId || employeeId
      )
    },
    async getCreateXml() {
      let xml = ''
      let queryXmlIdKey =
        queryXmlIdKeys[
          this.obtainApplicationForConsultation?.applyInfo?.consultTypeCode
        ]
      let {
        [queryXmlIdKey]: { data }
      } = await getConfigure([queryXmlIdKey]).catch(() => {})
      console.log(data, '查dataGroupId')
      let res = await apiConsultation.queryDataOrganizationPhraseContent({
        dataGroupId: data?.inpatEmrParamConfigContent
      })

      console.log(res, '查病历内容')
      if (res.data.inpatMrtDataGroupCnt) {
        xml = decompress(res.data.inpatMrtDataGroupCnt)
      } else {
        console.warn('您未配置会诊答复,请联系管理员进行配置')
      }
      return xml
    },
    async queryClinicalnotePermissionAsync(_emrSetId) {
      const { serial, content } = this.clinicalnoteData
      console.log(
        'clinicalnoteData ------------- ',
        this.clinicalnoteData,
        serial,
        content
      )
      let emrSetId = _emrSetId ?? content.emrSetId
      //apiGetConsultationButtonPermission 会诊权限apiGetButtonPermission普通
      const res = await apiConsultation.apiGetConsultationButtonPermission({
        encounterId: this.currentPatientInfo.encounterId,
        inpatEmrSetId: emrSetId,
        currentDeptId: this.orgInfo.orgId
      })
      const { data } = res
      // this.sponsorOperate = data.operate
      if (this.isHome) {
        console.log('主界面进来的')
        //主界面进入先查看配置（有没有配置答复按钮权限，如果没有则删除该权限）
        let answerConfiguration = this.AllConfigure?.data.find(el => {
          return el.inpatEmrParamConfigCode === 'COMMON008'
        })
        if (
          answerConfiguration?.inpatEmrParamConfigContent == 'true' ||
          this.obtainApplicationForConsultation?.replyInfos?.length
        ) {
          console.log('配置了主界面辅助答复')
          console.log(data.permissionVOList)

          return {
            editable: data.canEdit,
            permissionVOList: data.permissionVOList
          }
        } else {
          console.log('未配置了主界面辅助答复')

          return {
            editable: false,
            permissionVOList: data.permissionVOList.filter(el => {
              return (
                el.appPermissionId !==
                  this.operationActionPermisstionIds.SNASER &&
                el.appPermissionId !==
                  this.operationActionPermisstionIds.SUBMIT_AND_SIGN &&
                el.appPermissionId !==
                  this.operationActionPermisstionIds.RECALL_SUBMIT
              )
            })
          }
        }
      } else {
        if (this.isSponsor) {
          console.log(
            '不是主界面进入那么申请人就没权限答复（过滤编辑相关操作按钮）'
          )
          //如果不是主界面进入那么申请人就没权限，由前端控制
          let clearPermissionVOList = ['399297352', '399297355', '399297356'] //暂存、提交、撤销提交
          return {
            editable: false,
            permissionVOList: data.permissionVOList.filter(
              el => !clearPermissionVOList.includes(el.appPermissionId)
            )
          }
        } else {
          console.log('不是主界面进入并且不是申请人进来')
          return {
            editable: data.canEdit,
            permissionVOList: data.permissionVOList
          }
        }
      }
    },
    async aloneEvent() {
      try {
        this.showClinicalnoteProcessing(true)
        // const pgEditor = this.getEditor()
        // const { content } = this.clinicalnoteData
        await this.fillInTheConsultation() //填充申请单
        await this.hiddenAnswer() //控制答复是否可见
        await this.controlClinicalnoteContentStateAsync() //权限
        // if (!content.hasContent) {
        // pgEditor.setConsultationOutline() //插入概要段落（放最后防止覆盖内容）
        //如果没有暂存过
        // await this.saveClinicalnoteContentAsync(false)
        //操作病历之后刷新病历列表与病历状态
        // await this.actionsAfterOperatorClinicalnote()
        // }
        await this.fillInTheReply() //填充答复信息
        this.getAllDepOptions()

        // this.updateReplaceFilterList() //填充更新申请人代答下拉选项
        this.setRightAllographMenu() //设置代答右键菜单
      } finally {
        this.$emit('update:dcLoading', false)
        this.$store.commit('setHomeLoading', false)
        this.showClinicalnoteProcessing(false)
      }
    },
    //拿到所有科室下拉信息
    getAllDepOptions() {
      this.consultationReplyDepOptions = {
        applyId: this.applyId,
        ...this.getInviteeOptions()
      }
    },
    //获取默认人的科室下来选项(默认所有)
    getInviteeOptions(docId) {
      //接收人拥有当前的科室
      //填充默認科室,不管指派给谁，他接受了，接收人就变成他，那么这样判断没问题
      //申请人拥有所有接收人的科室
      //院外会诊不需要
      let optionsAll = { [this.applyId]: [] } //获取所有
      let optionsOdd = []
      this.allRecipients.forEach(item => {
        let deptId = item.inpConsultToDeptId
        let deptName = item.inpConsultToDeptName
        let cptId = DataElementWinIds.CONSULTATION_DEPARTMENT_INPUT

        let data = {
          deptName,
          deptId,
          cptId
        }
        if (docId) {
          if (docId == this.applyId) {
            optionsOdd.push(data)
          } else if (docId == item.replyConceptId) {
            optionsOdd.push(data)
          }
        } else {
          optionsAll[item.replyConceptId] = [data]
          optionsAll[this.applyId].push(data)
        }
      })
      return docId ? optionsOdd : optionsAll
    },
    async pgEventInputChange(e) {
      if (this.isSponsor && e._cptid == '399337125') {
        let selectiveAdministrativeList = e.value.split('、')
        //过滤掉指派的数据
        let replaceFilterList = this.allRecipients.filter(
          el => el.assignedFalg == 98176
        )
        let signature = replaceFilterList
          .map(el => {
            if (selectiveAdministrativeList.includes(el.inpConsultToDeptName)) {
              return el.inpConsultToEmployeeName
            }
          })
          .filter(el => el)
          .join('、')
        console.log('改文本签名', signature)

        const pgEditor = this.getEditor()
        let signatureHelper = new ConsultationSignatureHelper(pgEditor)
        if (signature) {
          console.log(signatureHelper, 'ConsultationSignatureHelper-------')
          await signatureHelper.signActionText(
            this.applyId, //病程需要传当前子病程id
            [{ cptId: DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE }],
            signature
          )
        } else {
          await signatureHelper.signActionText(
            this.applyId, //病程需要传当前子病程id
            [{ cptId: DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE }],
            ''
          )
        }
      }
    },
    async hiddenAnswer() {
      const pgEditor = this.getEditor()
      let domList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetDocList',
        param: ''
      })
      let consultReceiveInfoIds = this.allRecipients.map(
        el => el.replyConceptId
      )

      // '接收人能看到自己的和代答的，或者是指派给自己的'
      let createId = this.getCreateId(
        this.userInfo.employeeId,
        this.allRecipients
      )
      console.log('第一个接收人集合', consultReceiveInfoIds)
      console.log('xml所有答复区', domList)
      console.log('所有已提交的人的答复区域id', this.allSubmit)
      console.log('被邀人自己能看到的区域', createId)

      let isShowList = []
      if (this.isSponsor) {
        console.log('申请人看到自己的和所有已提交的')
        for (const item of domList) {
          if ([...this.allSubmit, this.applyId].includes(item.docId)) {
            // item.style.display = 'black'
            isShowList.push({
              docId: item.docId,
              show: true
            })
          } else {
            // item.style.display = 'none'
            isShowList.push({
              docId: item.docId,
              show: false
            })
          }
        }
      } else if (consultReceiveInfoIds.includes(createId)) {
        console.log('答复人能看到自己的和代答的')
        for (const item of domList) {
          if ([createId, this.applyId].includes(item.docId)) {
            // item.style.display = 'black'
            isShowList.push({
              docId: item.docId,
              show: true
            })
          } else {
            // item.style.display = 'none'
            isShowList.push({
              docId: item.docId,
              show: false
            })
          }
        }
      } else {
        console.log('其他人和没接收的，啥都看不到')
        for (const item of domList) {
          // item.style.display = 'none'
          isShowList.push({
            docId: item.docId,
            show: false
          })
        }
      }
      isShowList.shift()
      console.log('参数', isShowList)

      pgEditor.pgEditorInstance.postmessage({
        type: 'SetShowByDocId',
        param: isShowList
      })
    },
    handleFeedbackAction(str) {
      this.$emit('buttonAction', str)
    },
    async handleCancelReception() {
      this.$confirm('您确认要撤销接收的吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          apiConsultation
            .cancelAccept({
              inpConsultApplyId: this.obtainApplicationForConsultation.applyInfo
                .inpConsultApplyId //住院会诊申请标识
              // inpEmrSetId: this.clinicalnoteData.content.emrSetId
            })
            .then(res => {
              if (res?.success) {
                //取消接收
                this.$emit('cancelReception')
                //关闭当前病历未处理
                this.$message({
                  type: 'success',
                  message: '会诊撤销接收成功!'
                })
              } else {
                this.$message({
                  type: 'info',
                  message: '会诊撤销接收失败!'
                })
              }
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消该操作'
          })
        })
    },
    //设置编辑器右键菜单-主界面代答菜单
    setRightAllographMenu() {
      //院外会诊不处理
      if (this.isOutside) return
      const pgEditor = this.getEditor()

      //申请人并有暂存权限就有菜单
      let jurisdictionFlag =
        this.isSponsor &&
        this.consultationIsShowBtnById(
          this.operationActionPermisstionIds.SNASER
        ) &&
        !this.isDisableBtnById(this.operationActionPermisstionIds.SNASER)

      if (jurisdictionFlag) {
        let addSetGray = false
        let removeSetGray = false

        let domList = pgEditor.pgEditorInstance.postmessage({
          type: 'GetDocList',
          param: ''
        })

        let flag = false
        for (let el of domList) {
          if (el.docId == this.applyId) {
            flag = true
            removeSetGray = false
            addSetGray = true
          }
        }
        if (!flag) {
          removeSetGray = true
          addSetGray = false
        }
        pgEditor.pgEditorInstance.updateRightMenu([
          {
            menu: '会诊代答复',
            menuId: 'Allograph',

            icon: 'emr-icon-importReport',
            childMenus: [
              {
                menu: '新增',
                setGray: addSetGray,
                callback: async () => {
                  if (flag) {
                    //每次进来更新下拉选项
                    // this.updateReplaceFilterList()
                    this.setRightAllographMenu()
                  } else {
                    //所有接收人
                    if (this.allRecipients.length) {
                      this.showClinicalnoteProcessing(true)
                      await this.addPublicAnswerArea()
                      this.showClinicalnoteProcessing(false)
                    } else {
                      this.$message({
                        message: '该会诊未被接收，无法答复',
                        type: 'warning'
                      })
                    }
                    this.setRightAllographMenu()
                  }
                }
              },
              {
                menu: '撤销',
                setGray: removeSetGray,
                callback: async () => {
                  await this.removePublicAnswerArea()
                  this.setRightAllographMenu()
                }
              }
            ]
          }
        ])
      }
    },
    async addPublicAnswerArea() {
      const pgEditor = this.getEditor()
      let docId = this.applyId
      const xml = await this.getCreateXml()
      console.log(xml, 'kkjj')
      pgEditor.pgEditorInstance.postmessage({
        type: 'FileAppend',
        param: [
          {
            srcstr: xml,
            newPage: false,
            // index: domList.length,
            docId,
            topMargin: 0,
            isEditable: true
          }
        ]
      })
      //填充申请人代答下拉选项
      // this.updateReplaceFilterList()

      //定位光标
      this.positioningDepartment(docId)
    },
    //定位光标
    positioningDepartment(docId) {
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'LocateCursorWithInput',
        param: [
          {
            cptId: DataElementWinIds.CONSULTATION_OPINION_INPUT,
            position: 'innerafter',
            docId
          }
        ]
      })
    },
    removePublicAnswerArea() {
      const pgEditor = this.getEditor()
      let docId = this.applyId
      pgEditor.pgEditorInstance.postmessage({
        type: 'CloseDocByDocId',
        param: [docId]
      })
    },
    getReplyContent() {
      const pgEditor = this.getEditor()
      //拿到当前人的签名base64
      let caInfo = ''
      //当前答复人序号
      // let replyContentIndex = ''
      //当前答复输入域的内容
      let inpConsultTreatmentAdvice = ''
      let domList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetDocList',
        param: ''
      })
      // if (this.isSponsor) {
      //   if (
      //     this.obtainApplicationForConsultation?.applyInfo?.consultTypeCode !==
      //     '977574'
      //   ) {
      //     //当前获取人签名bas64
      //     caInfo = pgEditor.pgEditorInstance.postmessage({
      //       type: 'GetValue',
      //       param: {
      //         docId: this.applyId,
      //         conceptId: DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE, //概念id
      //         valueType: 'text',
      //         buttonIconFlag: false,
      //         paragraphFlag: false,
      //         valueTarget: 'onlyDataElement'
      //       }
      //     })
      //     Array.from(domList).forEach((el, i) => {
      //       if (el.docId == this.applyId) {
      //         console.log('我当前答复的是第', i - 1)
      //         replyContentIndex = i - 1
      //       }
      //     })

      //   }
      // } else {
      //当前答复区的id
      let createId = this.getCreateId(
        this.userInfo.employeeId,
        this.allRecipients
      )
      console.log(2)
      //当前获取人签名bas64
      caInfo = pgEditor.pgEditorInstance.postmessage({
        type: 'GetValue',
        param: {
          docId: createId,
          conceptId: DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE, //概念id
          valueType: 'text',
          buttonIconFlag: false,
          paragraphFlag: false,
          valueTarget: 'onlyDataElement'
        }
      })
      console.log(domList, 'domList', createId, this.userInfo.employeeId)
      // Array.from(domList).forEach((el, i) => {
      //   if (el.docId == createId) {
      //     console.log('我当前答复的是第', i - 1)
      //     replyContentIndex = i - 1
      //   }
      // })
      //获取当前答复输入域的内容
      inpConsultTreatmentAdvice = this.getElementDataValue(
        createId,
        DataElementWinIds.CONSULTATION_OPINION_INPUT
      )
      // }
      return {
        caInfo,
        // replyContentIndex,
        inpConsultTreatmentAdvice
      }
    },
    // updateReplaceFilterList() {
    //   const pgEditor = this.getEditor()
    //   //过滤掉指派人
    //   let replaceFilterList = this.allRecipients.filter(
    //     el => el.assignedFalg == 98176
    //   )
    //   let valueList = replaceFilterList.map(el => {
    //     return {
    //       Value: el.inpConsultToDeptName || el.inpConsultToDeptId,
    //       Key: el.inpConsultToDeptId,
    //       GroupNum: 'Group0'
    //     }
    //   })
    //   console.log(replaceFilterList, 111)
    //   console.log(valueList, 222)
    //   pgEditor.pgEditorInstance.postmessage({
    //     type: 'UpdateValueList',
    //     param: [
    //       {
    //         docId: this.applyId,
    //         cptId: DataElementWinIds.CONSULTATION_DEPARTMENT_INPUT,
    //         valueList: valueList
    //       }
    //     ]
    //   })
    // },
    async setLatestSponsorData(operate) {
      const pgEditor = this.getEditor()
      let queryList = []
      let inpConsultApplyId = this.obtainApplicationForConsultation.applyInfo
        .inpConsultApplyId
      let domList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetDocList',
        param: ''
      })
      domList.shift()
      for (let el of domList) {
        //院外会诊科室不要传
        let invitedReplyDeptInfo = this.isOutside
          ? ''
          : this.getElementDataValue(
              el.docId,
              DataElementWinIds.CONSULTATION_DEPARTMENT_INPUT
            )
        let inpConsultTreatmentAdvice = this.getElementDataValue(
          el.docId,
          DataElementWinIds.CONSULTATION_OPINION_INPUT
        )
        if (el.docId == this.applyId) {
          queryList.push({
            inpConsultApplyId, //住院会诊申请标识
            createdBy: '', //会诊答复医生
            operate,
            inpConsultTreatmentAdvice, //答复区域内容
            invitedReplyDeptInfo, //科室信息
            isApplyDetp: true,
            inpEmrSetId: this.clinicalnoteData.content.emrSetId
          })
        } else {
          queryList.push({
            inpConsultApplyId, //住院会诊申请标识
            createdBy: el.docId, //会诊答复医生
            operate,
            inpConsultTreatmentAdvice, //答复区域内容
            invitedReplyDeptInfo, //科室信息
            isApplyDetp: false,
            inpEmrSetId: this.clinicalnoteData.content.emrSetId
          })
        }
      }

      await apiConsultation.saveConsultApplyReplyReplace(queryList)
    },
    getElementDataValue(docId, conceptId) {
      const pgEditor = this.getEditor()
      //获取值
      let departmentVal = pgEditor.pgEditorInstance.postmessage({
        type: 'GetValue',
        param: {
          docId,
          conceptId, //概念id
          valueType: 'text',
          buttonIconFlag: false,
          paragraphFlag: false,
          valueTarget: 'onlyDataElement'
        }
      })
      if (departmentVal[0]?.DynamicDataValue) {
        let list = departmentVal[0].DynamicDataValue.filter(item => item.key)
        return list.map(item => item.key).toString() || ''
      }

      return departmentVal[0]?.value?.toString()
    },
    getParticulars() {
      console.log('是否有代答功能(前端入口判断)', this.isHome)
      console.log('是否是院外会诊', this.isOutside)
      console.log('是否是申请人', this.isSponsor)
      console.log('所有提交的答复区域id', this.allSubmit)
      console.log('会诊单发起人的id', this.applyId)
      console.log('会诊单所有接收的人', this.allRecipients)
      console.log(
        '申请人被计费的科室',
        this.getElementDataValue(
          this.applyId,
          DataElementWinIds.CONSULTATION_DEPARTMENT_INPUT
        )
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.inpatient-clinicalnote-editor-area {
  .inpatient-clinicalnote-editor-operation {
    &:empty {
      display: none;
    }
    /deep/.picker {
      position: absolute;
      left: 10px;
    }
  }
}
</style>
