<template>
  <div v-loading="clinicalnoteData.loading" :class="classNames.EditorArea">
    <div ref="editorContainer" :class="classNames.EditorWrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :userInfo="userInfo"
        :orgInfo="orgInfo"
        :parameterConfiguration="{
          inpatEmrSetId: currentActiveLoadedClinicalnote.options.content.emrSetId
        }"
        :toolbarOptions="toolbarOptions"
      />
    </div>
    <!-- 已归档的病历簿不显示操作按钮 -->
    <!-- permisstionKey每次权限切换更新重新渲染，修改签名框不消失问题及签名框定位问题 -->
    <div
      v-if="!isInForbiddenState && emrLoaded"
      :key="permisstionKey"
      :class="classNames.EditorOperation"
    >
      <!-- 从病历阅改进入则不显示暂存、提交、撤销提交按钮 除上级审签驳回的 -->
      <template v-if="isReviewReject() || !isReview">
        <editorButton
          v-if="isShowBtnById(operationActionPermisstionIds.SNASER)"
          :disabled="isDisableBtnById(operationActionPermisstionIds.SNASER)"
          :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
          :emrSetId="clinicalnoteData.content.emrSetId"
          :buttonName="snaserSaveName"
          @buttonClick="handleSaveAction(clinicalnoteData.content.emrSetId)"
        ></editorButton>
        <editorButton
          v-if="isShowBtnById(operationActionPermisstionIds.QUALITY_SNASER)"
          :disabled="isDisableBtnById(operationActionPermisstionIds.QUALITY_SNASER)"
          :operationActionPermisstionId="operationActionPermisstionIds.QUALITY_SNASER"
          :emrSetId="clinicalnoteData.content.emrSetId"
          buttonName="整 改"
          @buttonClick="handleSaveAction(clinicalnoteData.content.emrSetId)"
        ></editorButton>
        <SignatureButton
          v-if="isShowBtnById(operationActionPermisstionIds.SUBMIT_AND_SIGN)"
          :disabled="isDisableBtnById(operationActionPermisstionIds.SUBMIT_AND_SIGN)"
          :operationActionPermisstionId="operationActionPermisstionIds.SUBMIT_AND_SIGN"
          :emrSetId="clinicalnoteData.content.emrSetId"
          :hasSignature="hasSignature"
          buttonName="提 交"
          type="primary"
          @confirm="handleSubmitAction"
        ></SignatureButton>
        <editorButton
          v-if="isShowBtnById(operationActionPermisstionIds.RECALL_SUBMIT)"
          :disabled="isDisableBtnById(operationActionPermisstionIds.RECALL_SUBMIT)"
          :operationActionPermisstionId="operationActionPermisstionIds.RECALL_SUBMIT"
          :emrSetId="clinicalnoteData.content.emrSetId"
          buttonName="撤销提交"
          type="warning"
          @buttonClick="handleRecallSubmitAction"
        ></editorButton>
      </template>
      <SignatureButton
        v-if="isShowBtnById(operationActionPermisstionIds.REVIEW_PASS)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.REVIEW_PASS)"
        :operationActionPermisstionId="operationActionPermisstionIds.REVIEW_PASS"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="审签通过"
        type="success"
        @confirm="handleReviewPassAction"
      ></SignatureButton>
      <editorButton
        v-if="isShowBtnById(operationActionPermisstionIds.REVIEW_DISMISS)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.REVIEW_DISMISS)"
        :operationActionPermisstionId="operationActionPermisstionIds.REVIEW_DISMISS"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="审签退回"
        type="success"
        @buttonClick="handleReviewDismissAction"
      ></editorButton>
      <editorButton
        v-if="isShowBtnById(operationActionPermisstionIds.RECALL_REVIEW)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.RECALL_REVIEW)"
        :operationActionPermisstionId="operationActionPermisstionIds.RECALL_REVIEW"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="撤销审签"
        type="warning"
        @buttonClick="handleRecallReviewAction"
      ></editorButton>
      <template>
        <!-- 请勿删除 -->
        <template v-if="debug">
          <editorButton
            :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
            :emrSetId="clinicalnoteData.content.emrSetId"
            buttonName="暂存调试"
            @buttonClick="debugHandleSaveAction(clinicalnoteData.content.emrSetId)"
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
            @buttonClick="getClinicalnotePdf(5)"
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
    <delete-editor-dialog
      :documentUpdatePromptDialogVisible.sync="documentUpdatePromptDialogVisible"
      :currentDocId="currentDocId"
      :clinicalnoteData="clinicalnoteData"
      :loadedSubDocList="loadedSubDocList"
    ></delete-editor-dialog>
    <dialog-coll v-if="dialogCollVisible" ref="DialogColl" @close="dialogCollVisible = false"></dialog-coll>
    <DocumentUpdatePrompt
      :emrSetId="currentActiveLoadedClinicalnote.options.content.emrSetId"
      :emrSetTitle="currentActiveLoadedClinicalnote.title"
      :visible.sync="documentUpdatePromptDialogVisible"
    ></DocumentUpdatePrompt>

    <CloneSignatureEditor
      v-if="cloneClinicalnoteData"
      :clinicalnoteData="cloneClinicalnoteData"
      @close="cloneClinicalnoteData = null"
    />
  </div>
</template>

<script>
/*eslint no-undef: "error"*/
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import api from '@/api/list.js'
import baseGetApi from '@/api/getHttp'
import { compress, decompress } from './utils'
import { createNamespacedHelpers, mapState, mapMutations } from 'vuex'
const { mapState: clinicalnoteMapStates } = createNamespacedHelpers('emr')
const { mapState: globalConfigMapStates } = createNamespacedHelpers(
  'globalConfig'
)
const {
  mapState: componentsMapStates,
  mapMutations: componentsMapMutations
} = createNamespacedHelpers('components/multiClinicalnoteBoardState')
const {
  mapState: pubDatasStates,
  mapActions: pubDatasActions
} = createNamespacedHelpers('pubDatas')
import CloneSignatureEditor from './components/CloneSignatureEditor.vue'
import PgEditor from '@/libs/PgEditor'
import {
  EditorEvent,
  DataElementWinIds,
  DiagnosisTypes,
  DcEditorRenderModes,
  TagImage
} from '@/libs/PgEditor/constants'
import { getDiagnosisTypeByWinId } from '@/libs/PgEditor/utils'
import { isDraftStatus } from './utils'
import { throttle, getCurrentPatientInfo } from '@/utils'
import { inpMrtMonitorIdEnum } from '@/utils/enumerate'
import editorButton from '../../EditorButton/index'
import SignatureButton from './SignatureButton'
import dialogColl from '@/views/InpatientClinicalnoteMainPage/InpatientEmrAuxiliaryInfo/PhraseRefen/dialogColl.vue'
const ClassNameSpace = 'inpatient-clinicalnote-editor'
import getEventHubHelper, {
  createEventKeyWithNamespace
} from '@/utils/event_hub_helper.js'
import { cb2promise, isBase64 } from '@/utils/convertFunction'
import DeleteEditorDialog from '@/components/InpatientClinicalnoteEditor/BaseEditorPg/components/DeleteEditorDialog'
import {
  apiGetInpatientClinicalnoteContent,
  apiSaveInpatientClinicalnoteContent,
  apiQueryClinicalnoteContentDiagnoes,
  apiGetInpatientClinicalnoteContentSerial
} from '@/api/navigate'
import apiMedicalManager from '@/api/dailyManager/medicalManager.js'

export const OperationActionPermisstionIds = {
  SAVE: '399297354',
  SUBMIT_AND_SIGN: '399297355', //提交
  RECALL_SUBMIT: '399297356', //撤销提交

  REVIEW_PASS: '399297357',
  REVIEW_DISMISS: '399297358',
  RECALL_REVIEW: '399297359',

  CANCEL: '399442431', //取 消
  RECEPTION: '399442430', //接收
  DESIGNATE: '399442429', //指派
  SNASER: '399297352', //暂 存

  FEEDBACK: '399461483', //去反馈
  EVALUATE: '399461484', //去评价
  CONSULT_CONFIRM: '977584', //审核确认
  CONSULT_SCHEDULE: '977585', //审核调度
  CANCEL_RECEPTION: '399566791', //撤销接收

  QUALITY_SNASER: '399573160' //质控暂存
}

import {
  txtSignatureDataArray,
  signatureDataArray
} from '../../../libs/PgEditor/helper/signature_helper'

const createEventKey = createEventKeyWithNamespace(
  'INPATIENT_CLINICALNOTE_EDITOR_EVENT'
)
export const ClinicalnoteEditorEventKeys = {
  INIT: createEventKey('INIT'),
  LOADED: createEventKey('LOADED'),
  DOC_LOADED: createEventKey('DOC_LOADED'),
  AUTO_CREATE: createEventKey('AUTO_CREATE'),
  SET_SMART_INPUT_CONTENT: createEventKey('SET_SMART_INPUT_CONTENT'),
  HANDLE_INSERT_CONTENT: createEventKey('HANDLE_INSERT_CONTENT'),

  HANDLE_DELETE_CLINICALNOTE: createEventKey('HANDLE_DELETE_CLINICALNOTE'),
  HANDLE_CLOSE_CLINICALNOTE: createEventKey('HANDLE_CLOSE_CLINICALNOTE'),
  HANDLE_DELETE_IN_SERIAL_CLINICALNOTE: createEventKey(
    'HANDLE_DELETE_IN_SERIAL_CLINICALNOTE'
  ),
  MEDICAL_RECORDS_BEFORE_DELETION: createEventKey(
    'MEDICAL_RECORDS_BEFORE_DELETION'
  )
}
import diseaseHistoryMixin from './mixins/diseaseHistory'
import printMixin from './mixins/print'
import debuggingMixin from './mixins/debugging'
import vitalSignsDataMixin from './mixins/vitalSignsData'
import defaultValueMixin from './mixins/defaultValue'
import dataSourcesVisibilityMixin from './mixins/dataSourcesVisibility'
import diagnosisMixin from './mixins/diagnosis.js'
import audioRecord from './mixins/audioRecord.js'
import qualityControl from './mixins/qualityControl.js'
import validateTimeMixin from './mixins/validateTime'
import refreshClinicalnoteMixin from './mixins/refreshClinicalnote'
import DocumentUpdatePrompt from './components/DocumentUpdatePrompt.vue'

import ProhibitedWords from './function/prohibitedWords'
import {
  FillingFuncsForClinicalnote,
  FillingFuncsForSerialClinicalnote
} from './function/fillingFuncs'
import { formulaElementTypes, getFormulaElementListWithAttr } from './utils'
import medicalRecordInformation from '@/api/dailyManager/medicalRecordInformation.js'
export default {
  name: 'InpatientClinicalnoteEditor',
  components: {
    PgEditor,
    dialogColl,
    editorButton,
    SignatureButton,
    DocumentUpdatePrompt,
    CloneSignatureEditor,
    DeleteEditorDialog
  },
  mixins: [
    diseaseHistoryMixin, //病史联动
    vitalSignsDataMixin, //生命体征
    defaultValueMixin, //缺省值
    dataSourcesVisibilityMixin, //签名数据源显示隐藏
    diagnosisMixin, //诊断数据
    audioRecord, //语音相关
    qualityControl, //质控相关
    validateTimeMixin, //时间日期格式校验
    refreshClinicalnoteMixin, //病历刷新
    printMixin, //打印
    debuggingMixin //功能调试
  ],
  props: {
    id: {
      type: String,
      default: function() {
        return +Date.now() + ''
      }
    },
    isArchiveReview: {
      type: Boolean,
      default: false
    },
    clinicalnoteData: {
      type: Object,
      default: function() {
        return {
          serial: false, //是否为病程
          content: {
            hasContent: true, //新建状态 还没提交或暂存过

            emrSetId: '', //当前正在处理的病历id

            //普通病历
            xml: '',

            //连续病程
            list: [], // emrSetId, emrSetTitle, xml

            emrTypeId: '', //病历分类id
            emrSetTitle: '', //病历标题
            emrStatusCode: '', //病历状态 用来设置病历状态图标
            inpatEmrSetStatusCode: '', //病历的真实状态  目前主要用于判断病历是否是草稿状态
            modifiedAt: 0, //病历最后修改时间

            inpMrtMonitorId: '', //模板监控类型
            sealedStatus: '', //已封存状态
            casePrintStatus: '', //已归档 病案状态
            caseSpecialPermissionStatus: '', //特批
            paragraphIds: []
          }
        }
      }
    }
  },
  data() {
    return {
      emrLoaded: false,
      operationPermisstionData: {
        editable: false,
        permissionVOList: []
      },
      currentDocIdWatch: null,
      fillingFuncs: undefined,
      clickTime: 0,
      timeFlag: true,
      autosaveTiming: null,
      autoSaveLoading: false,
      dialogCollVisible: false, //短语收藏
      widgetContextMenuOptions: {
        content: []
      },
      preservationStatus: true, //是否允许自动保存
      permisstionKey: +new Date(),
      cachedDiagnosisDatas: null, //病历提交状态下存储诊断事件传过来的内容，撤销提交之后直接填充
      toolbarOptions: {
        isEmrSubmited: true,
        isShowRenderModeRadios: false,
        annotationStatus: true,
        isShow: true,
        isDisableWorkMode: false
      },
      isRelocate: true, //判断是否需要重定位（点击病历内容切换子文档时不需要重定位）
      hasSignature: true, //提交是否需要签名（根据文档里是否有签名图片域去判断）
      updateSetIdList: [], //当前哪些病历被其他人更新了
      debug: false,
      vteMessageFlag: false,
      documentUpdatePromptDialogVisible: false,
      cloneClinicalnoteData: null,
      deleteEditorVisible: false
    }
  },
  computed: {
    ...pubDatasStates(['basicsDataElement']),
    ...mapState([
      'qualityControlData',
      'currentPatientInfo',
      'userInfo',
      'orgInfo'
    ]),
    ...componentsMapStates([
      'currentActiveLoadedClinicalnote',
      'pgEditorCurrentInputInfo'
    ]),
    ...clinicalnoteMapStates([
      'clinicalnoteRecordArchived',
      'currentReviewData',
      'AllConfigure',
      'activateMenu',
      'RightMenuSetting',
      'DiagnosisFormatConfig',
      'DiagnosisFormatContent',
      'isShowConsultationCreator'
    ]),
    ...globalConfigMapStates(['authorizationPermission', 'wsMessageList']),
    isSyncEmrDefaultData() {
      let syncEmrDefaultDataConfig = this.RightMenuSetting.find(
        v => v.shortcutMenuNo == '1001101110123'
      )
      return syncEmrDefaultDataConfig?.enabledFlag == '98360'
    },
    draftSerialClinicalnoteIds() {
      return this.loadedSubDocList
        .map(el => (isDraftStatus(el.inpatEmrSetStatusCode) ? el.id : ''))
        .filter(el => el)
    },
    newSerialClinicalnoteIds() {
      //新建的
      return this.loadedSubDocList
        .filter(el => el.inpatEmrSetStatusCode == '960074')
        .map(el => el.id)
    },
    classNames() {
      return {
        EditorArea: `${ClassNameSpace}-area`,
        EditorWrap: `${ClassNameSpace}-wrap`,
        EditorOperation: `${ClassNameSpace}-operation`
      }
    },
    editorId() {
      return this.id
    },
    currentDocId() {
      return this.clinicalnoteData.content.emrSetId.replace('readonly', '')
    },
    snaserSaveName() {
      return this.currentActiveLoadedClinicalnote.type == 'NURSE_VIEW'
        ? '保 存'
        : '暂 存'
    },
    operationActionPermisstionIds() {
      return OperationActionPermisstionIds
    },
    wrapOperationPermisstionData() {
      //病历是否处于不可操作状态：已归档(归档查看、借阅等)、已封存、已打印
      let { emrStatusCode } = this.clinicalnoteData.content
      if (
        this.operationPermisstionData &&
        emrStatusCode !== '399572897' &&
        emrStatusCode !== '399572894'
      ) {
        const { editable, permissionVOList } = this.operationPermisstionData
        return {
          editable,
          permissionVOList
        }
      }
      return {
        editable: false,
        permissionVOList: []
      }
    },
    // currentReviewData.encounterId判断病历主界面是否是从病历审核进的
    isReview() {
      return this.currentReviewData?.encounterId
    },
    mode() {
      const pgEditor = this.getEditor()
      return pgEditor?.store?.editor?.state?.editorOptions?.ContentRenderMode
    },
    //已加载的病程
    loadedSubDocList() {
      return this.clinicalnoteData.content.list ?? []
    },
    isNewPageAfterSafeKeeping() {
      let isNewPageConfig = this.AllConfigure?.data?.find(el => {
        return el.inpatEmrParamConfigCode === 'COMMON037'
      })
      return isNewPageConfig?.inpatEmrParamConfigContent == 'true'
    },
    //病历是否处于禁止操作状态 已归档、病案-已封存、病案-已打印
    isInForbiddenState() {
      let { emrStatusCode } = this.clinicalnoteData.content
      return (
        this.clinicalnoteRecordArchived ||
        this.isArchiveReview ||
        emrStatusCode == '399572897' ||
        emrStatusCode == '399572894'
      )
    },
    //手术记录单审核流程配置
    surgicalRecordsReviewConfig() {
      let _configItem = this.AllConfigure?.data?.find(el => {
        return el.inpatEmrParamConfigCode === 'OPERATION_NOTE_REVIEW_PARAM'
      })

      if (_configItem) {
        return _configItem.inpatEmrParamConfigContent
      }
      return ''
    }
  },
  watch: {
    'currentActiveLoadedClinicalnote.options.content.emrSetId': {
      handler(newVal) {
        if (newVal) {
          const { clinicalnoteData } = this
          //清空存储的当前聚焦的输入域
          this.setPgEditorCurrentInputInfo({})
          clearInterval(this.autosaveTiming)
          if (clinicalnoteData.content.emrSetId == newVal) {
            this.setAutosaveTiming()
            this.queryClinicalnoteDeleteMessage(newVal)
          }
        }
      },
      deep: true,
      immediate: true
    },
    'AllConfigure.changeList': {
      async handler(newVal) {
        if (!this.clinicalnoteData.serial || !newVal) return
        //监听到数据改变
        let { id, createTime, clinicalnoteName, doctorId } = newVal
        let subDoc = this.loadedSubDocList.find(v => v.id == id)
        subDoc.inpatEmrSetFileTime = createTime
        let obj = {}
        if (createTime) {
          obj.inpatEmrSetFileTime = createTime
        } else if (clinicalnoteName) {
          obj.inpatEmrSetTitle = clinicalnoteName
          obj.inpatEmrSetListTitle = clinicalnoteName
          obj.inpEmrDoctorId = doctorId
        }
        await this.sendingDataSourceInformation(true, id, obj)
        //重新获取树结构和时间轴结构列表
        if (this.activateMenu === 'emr_list') {
          this.$root.eventHub.$emit('clinicalnote/refreshTimeLineData')
        } else {
          this.$root.eventHub.$emit('clinicalnote/refreshTreeData')
        }

        const pgEditor = this.getEditor()
        await pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param: [
            {
              docId: id,
              conceptId: clinicalnoteName
                ? DataElementWinIds.CONTINUOUS_TITLE_INPUT
                : DataElementWinIds.CONTINUOUS_CREATEDAT_INPUT,
              resetDateTime: true,
              value: clinicalnoteName || createTime,
              type: 'normal',
              KeepTrace: true,
              valueTarget: 'onlyDataElement'
            }
          ]
        })
        if (createTime) {
          await this.updateSort(id, createTime) //重新排序
          //页码
          this.insertPageNum()
        }
      },
      deep: true
    },
    // 根据权限设置状态
    wrapOperationPermisstionData: {
      //是否可编辑
      handler() {
        this.setEditorStatusByPermission()
      },
      deep: true
    },
    // 权限变更过早  导致第一次加载病历状态没有设置上
    emrLoaded: {
      //是否可编辑
      handler() {
        this.setEditorStatusByPermission()
      },
      deep: true
    },
    //状态变化则打印状态随之变化
    'clinicalnoteData.content.emrStatusCode': {
      handler(v) {
        this.handleControlPrintBtn(v)
      },
      immediate: true
    }
  },
  created() {
    console.log('来了created')
    this.currentDocIdWatch = this.$watch(
      'currentDocId',
      this.currentDocIdHandler,
      {
        deep: true,
        immediate: true
      }
    )
    if (!this.basicsDataElement) {
      //获取所有基础信息数据源
      this.updateDataElement()
    }

    this.eventHubHelper = getEventHubHelper(this.$root.eventHub)
  },
  beforeDestroy() {
    console.log('清掉', this.currentDocIdWatch)
    this.currentDocIdWatch()
    console.log('清掉2', this.currentDocIdWatch)
    this.eventHubHelper.destroy()

    window.eventBus.$off(
      'UPDATE_CURRENT_PATIENT_INFO',
      this.setCurrentPatientInfo
    )

    window.eventBus.$off('ZY_TEST', this.setDebug)
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_INPUT_ON_BLUR,
      this.handleInputBlur
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDocumentClick
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_INPUT_CHANGE,
      this.pgInputChange
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_HOVER_PARAGRAPH,
      this.handleHoverParagraphEvent
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_RIGHT_COLLECT,
      this.pgHandleCollect
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_RIGHT_PHRASE_REFERENCE,
      this.pgHandlePhraseReference
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_SAVE_PERSONAL_TEMPLATE,
      this.pgHandleSavePersonalTemplate
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_RIGHT_AUTOMATIC_GENERATION,
      this.pgHandlePhraseReference
    )
    // pgEditor.eventEmitter.$off(EditorEvent.PG_EVENT_DOC_CHANGED, this.docChange)
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_PRINT_PREVIEW_CLICK,
      this.PrintpreviewClick
    )

    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_SET_SUBSTITUTE_SIGNATURE,
      this.setSubstituteSignature
    )

    pgEditor.eventEmitter.$off(EditorEvent.PG_EVENT_SET_TAG, this.setTag)
    pgEditor.eventEmitter.$off(EditorEvent.PG_EVENT_REMOVE_TAG, this.removeTag)
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_ANNOTATION,
      this.addAnnotation
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_ANNOTATION_VIEWPORT,
      this.openAnnotationView
    )
    clearInterval(this.autosaveTiming)
    document.removeEventListener('keydown', this.keydown)
  },
  mounted() {
    // this.widgetContextMenuOptions.content = widgetContextMenuOptionsContent
    this.eventHubHelper.on(
      ClinicalnoteEditorEventKeys.HANDLE_DELETE_IN_SERIAL_CLINICALNOTE,
      this.handleDeleteInSerialClinicalnote
    )
    this.eventHubHelper.on(
      ClinicalnoteEditorEventKeys.HANDLE_DELETE_CLINICALNOTE,
      this.handleDeleteClinicalnote
    )

    this.eventHubHelper.on(
      'HANDLE_DELETE_CLINICALNOTE_PDF',
      this.handleDeleteClinicalnotePdf
    )
    this.eventHubHelper.on(
      ClinicalnoteEditorEventKeys.MEDICAL_RECORDS_BEFORE_DELETION,
      this.handleTabRemove
    )

    //病历被删除时 针对当前正在浏览的病历立刻做出响应
    this.eventHubHelper.on(
      'clinicalnote/wsDeleteMessage',
      this.queryClinicalnoteDeleteMessage
    )

    //辅助区域向病历编辑器插入内容
    this.eventHubHelper.on(
      'AuxiliaryInfo/Insert',
      this.handleAuxiliaryInfoInsert
    )
    //更新病历起草者后刷新权限
    this.eventHubHelper.on(
      EditorEvent.PG_EVENT_UPDATE_DRAFTER,
      this.handleRefreshPermission
    )

    this.eventHubHelper.on('dcEditHandle', this.PgEditHandle)
    this.eventHubHelper.on(
      'clinicalnote/refreshXml',
      this.handleRefreshSubmitedClinicalnote
    )
    this.eventHubHelper.on(
      'clinicalnote/saveAdmissionNoteByAudio',
      this.handleSaveAdmissionNoteByAudio
    )
    this.eventHubHelper.on(
      'clinicalnote/submitAdmissionNoteByAudio',
      this.handleSubmitAdmissionNoteByAudio
    )
    this.eventHubHelper.on(
      'clinicalnote/cancelSubmitAdmissionNoteByAudio',
      this.handleCancelSubmitAdmissionNoteByAudio
    )
    window.eventBus.$on(
      'UPDATE_CURRENT_PATIENT_INFO',
      this.setCurrentPatientInfo
    )

    window.eventBus.$on('ZY_TEST', this.setDebug)
    this.currentClincalnote = this.currentActiveLoadedClinicalnote?.options?.content?.emrSetTitle
    const pgEditor = this.getEditor()
    //文档加载完再显示权限
    pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
      this.emrLoaded = true
    })
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_INPUT_ON_BLUR,
      this.handleInputBlur
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDocumentClick
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_INPUT_CHANGE,
      this.pgInputChange
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_HOVER_PARAGRAPH,
      this.handleHoverParagraphEvent
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_RIGHT_COLLECT,
      this.pgHandleCollect
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_RIGHT_PHRASE_REFERENCE,
      this.pgHandlePhraseReference
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_SAVE_PERSONAL_TEMPLATE,
      this.pgHandleSavePersonalTemplate
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_RIGHT_AUTOMATIC_GENERATION,
      this.pgHandleAutomaticGeneration
    )
    // pgEditor.eventEmitter.$on(EditorEvent.PG_EVENT_DOC_CHANGED, this.docChange)
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_PRINT_PREVIEW_CLICK,
      this.PrintpreviewClick
    )
    //代签插入图片
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_SET_SUBSTITUTE_SIGNATURE,
      this.setSubstituteSignature
    )
    pgEditor.eventEmitter.$on(EditorEvent.PG_EVENT_SET_TAG, this.setTag)
    pgEditor.eventEmitter.$on(EditorEvent.PG_EVENT_REMOVE_TAG, this.removeTag)
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_ANNOTATION,
      this.addAnnotation
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_ANNOTATION_VIEWPORT,
      this.openAnnotationView
    )
    pgEditor.eventEmitter.$on(EditorEvent.PG_EVENT_PRINT_DOCUMENT, async () => {
      this.showClinicalnoteProcessing(true)
      const { bizRoleId, encounterId } = this.currentPatientInfo
      const { hospitalSOID } = this.userInfo
      let emrDocInfo = []
      let {
        content: {
          inpMrtMonitorId,
          emrTypeId,
          mrtEditorTypeCode,
          emrSetId,
          emrSetTitle,
          inpatEmrSetStatusCode
        }
      } = this.clinicalnoteData

      try {
        if (emrTypeId == '121383422926546946') {
          await this.serialPrint(
            this.loadedSubDocList,
            emrTypeId,
            pgEditor,
            inpMrtMonitorId,
            emrDocInfo
          )
        } else if (
          emrTypeId == '121383422926546950' &&
          mrtEditorTypeCode == '399461578'
        ) {
          await this.consultationPrint(
            emrSetId.replace('readonly', ''),
            pgEditor,
            emrTypeId,
            emrSetTitle,
            inpatEmrSetStatusCode,
            emrDocInfo
          )
        } else {
          await this.ordinaryPrint(
            emrSetId.replace('readonly', ''),
            pgEditor,
            inpatEmrSetStatusCode,
            emrTypeId,
            emrSetTitle,
            emrDocInfo
          )
        }

        const params = {
          eventId: '399468946', // 打印
          normalPrint: true, //true普通打印，false集中打印
          printerName: null, //普通打印为空
          hospitalSOID: hospitalSOID,
          encounterId: encounterId,
          printCount: 0,
          bizRoleId: bizRoleId,
          emrDocInfo,
          token: Cookies.get('BEARER_TOKEN'),
          printSourceCode: this.embedEntrance == 'nurse' ? 399464668 : 399464667 //打印入口 打印渠道 护士站：399464668,医生站：399464667
        }
        console.log('现在需要打印', params)
        // 规则校验
        if (emrDocInfo.length) {
          let _res = await api.clinicalnoteTouchAction({
            touchActionCode: '399542636',
            encounterId: this.currentPatientInfo.encounterId,
            inpEmrClassId: this.clinicalnoteData.content.emrTypeId,
            inpMrtMonitorId
          })
          if (!_res.success) {
            return
          }
        }
        this.showClinicalnoteProcessing(false)
        try {
          window.winning.inpreport.inpEmrPrint(JSON.stringify(params), res => {
            console.log('都昌病历打印回调 --------- ', res)
          })
        } catch (e) {
          console.log(e, '----------------')
          this.$message({
            message: '该功能需在混合框架中使用！',
            type: 'warning'
          })
        }
      } catch (e) {
        this.showClinicalnoteProcessing(false)
      }
    })
    this.pgEditor = this.$refs.pgEditorDom
    //病历提交和病历审签通过时需校验违禁词
    this.prohibitedWords = new ProhibitedWords(
      this.pgEditor,
      this.currentPatientInfo
    )
    console.log(this.pgEditor, this.prohibitedWords, 'this.pgEditor!!!!!!')

    document.addEventListener('keydown', this.keydown, false)
  },
  methods: {
    ...componentsMapMutations([
      'showClinicalnoteProcessing',
      'setCurrentEmrSetSerialId',
      'setCurrentActiveClinicalnoteById',
      'setPgEditorCurrentInputInfo'
    ]),
    ...mapMutations(['setInpatientInfo']),
    ...pubDatasActions(['updateDataElement']),
    setDebug() {
      this.debug = !this.debug
    },
    keydown(e) {
      // ctrl+s 当前病历 非会诊 有保存权限
      if (e.ctrlKey && e.keyCode == 83) {
        e.preventDefault()
        e.stopPropagation()
        if (
          this.preservationStatus &&
          this.currentActiveLoadedClinicalnote.options.content.emrSetId ==
            this.clinicalnoteData.content.emrSetId &&
          this.clinicalnoteData.content.emrTypeId != '121383422926546950' &&
          this.isShowBtnById(this.operationActionPermisstionIds.SNASER) &&
          !this.isDisableBtnById(this.operationActionPermisstionIds.SNASER)
        ) {
          this.handleSaveAction(this.clinicalnoteData.content.emrSetId)
          console.log('这是快捷键保存')
        }
      }
    },
    async currentDocIdHandler(v) {
      console.log('---laole', v)
      if (!v) return
      const { clinicalnoteData } = this
      //每次切换病历  将弹窗状态重置
      if (clinicalnoteData.serial) {
        let _index = this.loadedSubDocList.findIndex(el => {
          return el.id == v
        })
        if (_index >= 0) {
          //切换子文档时需要刷新权限
          this.setCurrentSubDocActive()
        } else {
          this.handleLoadClinicalnoteListAction(v)
        }
      } else {
        await this.handleLoadClinicalnoteContentAction()
      }
    },
    updateJurisdiction() {
      //测试刷新权限
      let defaultEmrSetId = this.clinicalnoteData.content.emrSetId
      this.clinicalnoteData.content.emrSetId = ''
      this.clinicalnoteData.content.emrSetId = defaultEmrSetId
    },
    getEditor() {
      return this.$refs.pgEditorDom
    },
    isDisableBtnById(id) {
      return !this.wrapOperationPermisstionData.permissionVOList.find(item => {
        return item.appPermissionId == id && item.enabled
      })
    },
    isShowBtnById(id) {
      return !!this.wrapOperationPermisstionData.permissionVOList.find(item => {
        return item.appPermissionId == id
      })
    },
    //上级审签驳回
    isReviewReject() {
      return this.clinicalnoteData.content.emrStatusCode == '399297358'
    },
    // docChange() {
    //   if (this.autosaveTiming) {
    //     let autoTimeData = this.AllConfigure?.data?.find(el => {
    //       return el.inpatEmrParamConfigCode === 'COMMON003'
    //     })
    //     console.log(
    //       '触发重置自动保存时间',
    //       autoTimeData?.inpatEmrParamConfigContent
    //     )
    //     clearInterval(this.autosaveTiming)
    //     setTimeout(() => {
    //       this.setAutosaveTiming()
    //     }, 500)
    //   }
    //   // clearInterval(this.autosaveTiming)
    //   // this.setAutosaveTiming()
    // },
    pgInputChange(e) {
      this.setCheckBoxNum(e)
      this.handleSurgicalRecordSignature(e)
      this.calculateApache(e)
    },
    async setPatientInformation(e) {
      //患者信息更改处理
      let cachedPresetSystemConceptData = this.getEditor()
        .cachedPresetSystemConceptData
      if (!cachedPresetSystemConceptData) {
        await this.getEditor().getPresetSystemConceptData()
        cachedPresetSystemConceptData = this.getEditor()
          .cachedPresetSystemConceptData
      }
      console.log('cachedPresetSystemConceptData')
      console.log(this.mode, this.clinicalnoteData.content.emrTypeId, e)

      //当前是编辑模式
      let isPatientInformation =
        this.mode == DcEditorRenderModes.SET_WORK_MODE_APP
      // this.clinicalnoteData.content.emrTypeId == '121383422926546945' &&
      // e?.inputInfo?.isInTable //是否在表格中
      //根据入院记录分类和姓名输入域判断是否为基本信息区域
      if (isPatientInformation) {
        sessionStorage.removeItem('PERSON_DRAWER_FOCUS_ITEM')
        if (!cachedPresetSystemConceptData?.length) return

        let activateData = cachedPresetSystemConceptData.find(
          el => el.conceptId == e.inputInfo.cptId
        )
        console.log(activateData, 'activateData')
        if (activateData) {
          const res = await api.getPatientInformationConfiguration({
            encounterGeneralConfigCode: '399544431'
          })
          let configureTheSwitch =
            JSON.parse(res.data.encounterGeneralConfigValue || '[]').find(
              el => el.ruleCode == '001'
            ).ruleValue == '98175'
          console.log(configureTheSwitch, 'configureTheSwitch')
          if (configureTheSwitch) {
            if (!activateData.inpEmrPatientComponentNo) {
              console.log('没有配置患者弹窗的id')
              return
            }
            if (activateData.enabledFlag !== '98175') {
              console.log('设置了不许弹窗')
              return
            }
            sessionStorage.setItem(
              'PERSON_DRAWER_FOCUS_ITEM',
              activateData.inpEmrPatientComponentNo
            )
            window.eventBus.$emit('EDIT_CURRENT_PATIENT_INFO', {
              initialMode: 'edit'
            })
          } else {
            this.$message({
              message: '患者基本信息不支持在此修改',
              type: 'warning'
            })
          }
        }
      }
    },
    pgHandleCollect(p) {
      let selctionTxt = p.innerText
      console.log(selctionTxt, p, 'pgHandleCollect-----------')
      if (
        !selctionTxt ||
        typeof selctionTxt == 'undefined' ||
        selctionTxt == 0
      ) {
        this.$message({
          message: '请选择需要收藏的短语内容！',
          type: 'warning'
        })
        return
      } else {
        let disabledArr = [
          DataElementWinIds.PRIMARY_DIAGNOSIS_LABEL,
          DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
          DataElementWinIds.ADMISSION_DIAGNOSIS_LABEL,
          DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT,
          DataElementWinIds.DISCHARGE_DIAGNOSIS_LABEL,
          DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT,
          DataElementWinIds.CORRECTION_DIAGNOSIS_LABEL,
          DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT,
          DataElementWinIds.PREOPERATIVE_DIAGNOSIS_LABEL,
          DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT,
          DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_LABEL,
          DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT,
          DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_LABEL,
          DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT,
          DataElementWinIds.CURRENT_DIAGNOSIS_LABEL,
          DataElementWinIds.CURRENT_DIAGNOSIS_INPUT,
          DataElementWinIds.DEATH_DIAGNOSIS_LABEL,
          DataElementWinIds.DEATH_DIAGNOSIS_INPUT,
          DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_LABEL,
          DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT,
          DataElementWinIds.MEDICAL_EXAMINATION_TEMPERATURE,
          DataElementWinIds.MEDICAL_EXAMINATION_PULSE,
          DataElementWinIds.MEDICAL_EXAMINATION_BREATHING_RATE,
          DataElementWinIds.MEDICAL_EXAMINATION_SYSTOLIC_PRESSURE,
          DataElementWinIds.MEDICAL_EXAMINATION_DIASTOLIC_PRESSURE,
          DataElementWinIds.MEDICAL_EXAMINATION_HEIGHT,
          DataElementWinIds.MEDICAL_EXAMINATION_WEIGHT
        ]
        // /let selctionXML = p.XML
        //患者基础数据不能收藏
        let disabledBasicsArr = this.basicsDataElement.data.map(
          el => el.conceptId
        )
        let CptIDArr = [...new Set(p.CptIDArr)]
        console.log(CptIDArr, '999')
        if (CptIDArr.length) {
          for (let i = 0; i < CptIDArr.length; i++) {
            let _index = disabledArr.indexOf(CptIDArr[i])
            let _index2 = disabledBasicsArr.indexOf(CptIDArr[i])
            console.log(disabledBasicsArr, _index2, 'kkk')
            if (_index >= 0) {
              this.$message({
                message:
                  _index < 20 ? '诊断信息不可收藏' : '生命体征信息不可收藏',
                type: 'warning'
              })
              return
            }
            if (_index2 >= 0) {
              this.$message({
                message: '患者基本信息不能收藏为短语',
                type: 'warning'
              })
              return
            }
          }
        }
        this.dialogCollVisible = true
        p.inpatEmrSetId = this.currentDocId
        this.$nextTick(() => {
          this.$refs.DialogColl.checkSelectionRef(p)
        })
      }
    },
    pgHandlePhraseReference(p) {
      const focusCase = p.Labels
      let paragraphId = '',
        inputName = '',
        labelText = ''
      if (focusCase.length === 1) {
        paragraphId = focusCase[0].CptID
        inputName = p.innerText
        labelText = p.innerText
      }
      //打开右侧辅助区域
      this.$root.eventHub.$emit('AuxiliaryInfo/ShowContentArea')
      //定位右侧辅助区域Tab
      this.$root.eventHub.$emit('AuxiliaryInfo/SetActiveTab', 'phraseRefen')
      //右侧辅助区域定位到短语
      this.$root.eventHub.$emit('AuxiliaryInfo/setPhraseReferInfo', {
        params: {
          paragraphId,
          inputName,
          labelText
        }
      })
    },
    handleDocumentClick(e) {
      console.log(e, '点击啊点击')
      //切换子文档
      if (this.clinicalnoteData.serial) {
        const subDocId = e.docInfo.docId
        if (subDocId !== this.currentDocId) {
          this.isRelocate = false
          this.setCurrentEmrSetSerialId(subDocId)
        }
      }
      if (this.mode !== DcEditorRenderModes.SET_WORK_MODE_APP) {
        return
      }
      //将当前聚焦的输入域信息存起来方便辅助区域插值使用
      this.setPgEditorCurrentInputInfo({
        CurIsImage: e.CurIsImage,
        ...e.docInfo,
        ...e.inputInfo
      })
      this.setPatientInformation(e)
    },
    handleInputBlur(param) {
      if (param?.cptId == '390000201' || param?.cptId == '390000202') {
        let _inputInfo = this.pgEditor.pgEditorInstance.postmessage({
          type: 'GetValue',
          param: {
            conceptId: param.cptId,
            docId: this.currentDocId,
            valueTarget: 'onlyDataElement'
          }
        })
        if (_inputInfo?.length) {
          let structuralData = {
            dataElementData: []
          }
          _inputInfo.forEach(v => {
            structuralData.dataElementData.push({
              inpEmrDataElementWinId: v.conceptId,
              inpEmrDataElementName:
                v.conceptId == '390000201' ? '主诉' : '现病史',
              inpEmrDataElementValue: v.value
            })
          })

          this.sendMessageToCDSS('399574306', this.currentDocId, structuralData)
        }
      }
    },
    handleDeleteClinicalnote() {
      //连续病历的删除在连续病历逻辑里做处理
      if (this.clinicalnoteData.serial) return
      // 每一次删除病历时，向CDSS发送事件
      this.sendMessageToCDSS('399574305', this.currentDocId)
    },
    handleDeleteInSerialClinicalnote({ id, subDocId }) {
      if (this.editorId != id) {
        return
      }
      // 每一次删除病历时，向CDSS发送事件
      this.sendMessageToCDSS('399574305', subDocId)
      const pgEditor = this.getEditor()
      let allList = this.loadedSubDocList
      let _delIndex = allList.findIndex(r => {
        return r.id === subDocId
      })
      if (allList.length > 1) {
        pgEditor.pgEditorInstance.postmessage({
          type: 'CloseDocByDocId',
          param: [subDocId]
        })

        if (subDocId == this.currentDocId) {
          this.isRelocate = true
          if (_delIndex >= 1) {
            this.setCurrentEmrSetSerialId(allList[_delIndex - 1].id)
          } else {
            this.setCurrentEmrSetSerialId(allList[_delIndex + 1].id)
          }
        }

        this.setDocNewPage(allList[_delIndex - 1], allList[_delIndex + 1])
        setTimeout(() => {
          allList.splice(_delIndex, 1)
          this.insertPageNum()
        }, 2000)
      } else {
        //!allList.length 病历打开报错的情况（病历已经被删）
        if (_delIndex !== -1 || !allList.length) {
          //删除到最后一个则关闭该tab
          this.eventHubHelper.emit(
            ClinicalnoteEditorEventKeys.HANDLE_CLOSE_CLINICALNOTE,
            this.editorId,
            'delete'
          )
        }
      }
    },

    // async handleClinicalnotePipelineTaskAsync(promises) {
    //   if (promises && promises.length > 0) {
    //     for (let i = 0; i < promises.length; i++) {
    //       const promise = promises[0]
    //       if (promise instanceof Promise) {
    //         await promise()
    //       }
    //     }
    //   }
    // },

    async loadClinicalnoteXmlAsync() {
      const pgEditor = this.getEditor()
      const { content } = this.clinicalnoteData
      console.log('content.xml', content)

      const load = (cb = () => {}) => {
        pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
          cb()
        })
        if (content.emrTypeId == '121383422926546950') {
          console.log('加载会诊单', content.xml, content)
          if (content.mrtEditorTypeCode == '399461576') {
            console.log('dc', content.mrtEditorTypeCode)
            pgEditor.pgEditorInstance.postmessage({
              type: 'FileOpen',
              param: [{ srcstr: content.xml, docId: this.currentDocId }]
            })
          } else {
            pgEditor.pgEditorInstance.postmessage({
              type: 'importMoreXml',
              param: {
                srcstr: content.xml,
                docId: this.currentDocId,
                topMargin: 0
              }
            })
          }
        } else {
          pgEditor.pgEditorInstance.postmessage({
            type: 'FileOpen',
            param: [
              {
                srcstr: content.xml,
                docId: this.currentDocId
              }
            ]
          })
        }
      }

      if (!pgEditor?.pgEditorLoaded) {
        await pgEditor.waitEditorLoaded()
      }

      await cb2promise(cb => {
        load(cb)
      })
      console.log('jiazai wancheng ---------- ')
    },

    async injectPresetSystemDataForClinicalnoteAsync(isUpdate = false) {
      let { inpatEmrSetStatusCode } = this.clinicalnoteData.content
      if (isDraftStatus(inpatEmrSetStatusCode)) {
        console.log('没有提交每次更新')
        await this.updateBasicData(isUpdate)
      }
    },

    async showDiagnosisDialog(diagnosisType, isRightMenu = false) {
      console.log(diagnosisType, 'diagnosisType---------')
      const pgEditor = this.getEditor()
      const { employeeNo, employeeName, employeeId } = this.userInfo
      pgEditor.store.widgetDiagnosisDialog.mutations.show(true)
      let newDiagnosisType = diagnosisType
      if (
        this.DiagnosisFormatContent[diagnosisType] &&
        diagnosisType != DiagnosisTypes.PRIMARY_DIAGNOSIS
      ) {
        newDiagnosisType = this.DiagnosisFormatContent[diagnosisType][0]
      }
      console.log('传给诊断控件的是诊断是：', newDiagnosisType)
      pgEditor.store.widgetDiagnosisDialog.mutations.setDiagnosisType(
        newDiagnosisType
      )
      this.rightMenuAddDiagnosis = false
      //非右键或右键为初步诊断
      if (
        !isRightMenu ||
        (isRightMenu && diagnosisType === DiagnosisTypes.PRIMARY_DIAGNOSIS)
      ) {
        return
      }
      this.rightMenuAddDiagnosis = true

      let handle1 = null
      pgEditor.eventEmitter.$once(
        EditorEvent.PG_EVENT_REFRESH_DIAGNOSIS,
        (handle1 = async diagnosis => {
          pgEditor.eventEmitter.$off(
            EditorEvent.PG_EVENT_DIAGNOSIS_DIALOG_CLOSE,
            handle2
          )
          //这里只处理右键添加诊断并下诊断
          const currentTimeStamp = dayjs()
          console.log('下诊断了 xxx -------------', diagnosis)
          const _diagnosis = diagnosis.filter(item => {
            return dayjs(item.createdAt).isAfter(currentTimeStamp)
          })

          let position = await pgEditor.diagnosisHelper.getTargetTableCell(
            diagnosisType
          )
          let isInBrowseState =
            this.pgEditor.store.editor.state.editorOptions.ContentRenderMode ==
            DcEditorRenderModes.SET_WORK_MODE_BROWSE
          //浏览模式下诊断切换成应用态
          await this.setClinicalnoteModel(
            isInBrowseState,
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
          await pgEditor.diagnosisHelper.insertOneDiagnosis(
            _diagnosis,
            diagnosisType,
            position,
            { employeeNo, employeeName, employeeId }
          )
          let params = {
            _diagnosisData: diagnosis,
            root: null,
            _diagnosisType: diagnosisType,
            isClick: true, //出院诊断点击和首次加载取值不一样
            isUpdate: true,
            isLast: null,
            KeepTrace: true
          }

          await pgEditor.diagnosisHelper.refreshAllDiagnosis(params)
          //下完诊断切换回来
          await this.setClinicalnoteModel(
            isInBrowseState,
            DcEditorRenderModes.SET_WORK_MODE_BROWSE
          )
          await this.setDiagnosisStatus()
          await this.saveClinicalnoteContentDiagnoes(false)
        })
      )
      let handle2 = null
      pgEditor.eventEmitter.$once(
        EditorEvent.PG_EVENT_DIAGNOSIS_DIALOG_CLOSE,
        (handle2 = async () => {
          pgEditor.eventEmitter.$off(
            EditorEvent.PG_EVENT_REFRESH_DIAGNOSIS,
            handle1
          )
        })
      )
    },
    async setupDiagnosisMouseRightMenu() {
      const pgEditor = this.getEditor()
      let rightMenus = [{ type: 'line', menuId: 'line123' }]
      let allDiagnosisInfo = await this.pgEditor.diagnosisHelper.getDiagnosisEles()
      const ADMISSION_DIAGNOSIS_INPUT = allDiagnosisInfo.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT
        )
      })
      const DISCHARGE_DIAGNOSIS_INPUT = allDiagnosisInfo.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT
        )
      })
      const CONFIRM_DIAGNOSIS_INPUT = allDiagnosisInfo.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT
        )
      })
      console.log('当前页面的所有诊断信息是', allDiagnosisInfo)
      await baseGetApi.queryDiagnosisPermissionConfig().then(async res => {
        console.log('诊断右键配置 ------ ', res)
        //当前医师是否有权限  没有权限将日期设置成只读
        if (res.success) {
          let diagnosticTypeCodes = res.data?.diagnosticTypeCodes || []

          diagnosticTypeCodes.map(diagnosisType => {
            let menuName = '',
              iconName = '',
              menuId = '',
              setGray = false
            switch (diagnosisType) {
              case DiagnosisTypes.ADMISSION_DIAGNOSIS:
                menuName = '入院诊断'
                iconName = 'emr-icon-inHospital'
                menuId = DiagnosisTypes.ADMISSION_DIAGNOSIS
                setGray = ADMISSION_DIAGNOSIS_INPUT.length > 0
                console.log(this.DiagnosisFormatConfig, 9090)
                this.DiagnosisFormatConfig.map(item => {
                  if (
                    item.diagnosticTypeCode ==
                      DiagnosisTypes.ADMISSION_DIAGNOSIS &&
                    item.defaultShow == '98175' &&
                    ADMISSION_DIAGNOSIS_INPUT.length == 0
                  ) {
                    this.autoInserDiagnosis(DiagnosisTypes.ADMISSION_DIAGNOSIS)
                  }
                })
                break
              case DiagnosisTypes.DISCHARGE_DIAGNOSIS:
                menuName = '出院诊断'
                iconName = 'emr-icon-outHospital'
                menuId = DiagnosisTypes.DISCHARGE_DIAGNOSIS
                setGray = DISCHARGE_DIAGNOSIS_INPUT.length > 0
                break
              case DiagnosisTypes.CONFIRM_DIAGNOSIS:
                menuName = '确定诊断'
                iconName = 'emr-icon-diagnoseConfirm'
                menuId = DiagnosisTypes.CONFIRM_DIAGNOSIS
                setGray = CONFIRM_DIAGNOSIS_INPUT.length > 0

                this.DiagnosisFormatConfig.map(item => {
                  if (
                    item.diagnosticTypeCode ==
                      DiagnosisTypes.CONFIRM_DIAGNOSIS &&
                    item.defaultShow == '98175' &&
                    CONFIRM_DIAGNOSIS_INPUT.length == 0
                  ) {
                    this.autoInserDiagnosis(DiagnosisTypes.CONFIRM_DIAGNOSIS)
                  }
                })
                break
              case DiagnosisTypes.CORRECTION_DIAGNOSIS:
                menuName = '修正诊断'
                iconName = 'emr-icon-edit'
                menuId = DiagnosisTypes.CORRECTION_DIAGNOSIS
                break
              case DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS:
                menuName = '补充诊断'
                iconName = 'emr-icon-xinjian'
                menuId = DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS
                break
              default:
                break
            }

            let item = {
              menu: menuName,
              icon: iconName,
              workMode: 'bothEditBrowse',
              menuId,
              childMenus: [
                {
                  menu: '添加',
                  setGray,
                  callback: async () => {
                    await this.showDiagnosisDialog(diagnosisType, true)
                  }
                },
                {
                  menu: '删除',
                  callback: async () => {
                    let isInBrowseState =
                      this.pgEditor.store.editor.state.editorOptions
                        .ContentRenderMode ==
                      DcEditorRenderModes.SET_WORK_MODE_BROWSE
                    //浏览模式下诊断切换成应用态
                    await this.setClinicalnoteModel(
                      isInBrowseState,
                      DcEditorRenderModes.SET_WORK_MODE_APP
                    )
                    await this.pgEditor.diagnosisHelper.revokeDiagnosis(
                      diagnosisType
                    )

                    //下完诊断切换回来
                    await this.setClinicalnoteModel(
                      isInBrowseState,
                      DcEditorRenderModes.SET_WORK_MODE_BROWSE
                    )
                    this.setDiagnosisStatus('delete')
                  }
                }
              ]
            }

            rightMenus.push(item) //添加书写模式菜单
          })
          console.log(rightMenus)
          await pgEditor.pgEditorInstance.updateRightMenu(rightMenus)
        }
      })
    },
    async autoInserDiagnosis(diagnosisType) {
      const pgEditor = this.getEditor()
      const { employeeNo, employeeName, employeeId } = this.userInfo
      let position = await pgEditor.diagnosisHelper.getTargetTableCell(
        diagnosisType
      )
      let isInBrowseState =
        this.pgEditor.store.editor.state.editorOptions.ContentRenderMode ==
        DcEditorRenderModes.SET_WORK_MODE_BROWSE
      //浏览模式下诊断切换成应用态
      await this.setClinicalnoteModel(
        isInBrowseState,
        DcEditorRenderModes.SET_WORK_MODE_APP
      )
      await pgEditor.diagnosisHelper.insertOneDiagnosis(
        [],
        diagnosisType,
        position,
        { employeeNo, employeeName, employeeId }
      )

      //下完诊断切换回来
      await this.setClinicalnoteModel(
        isInBrowseState,
        DcEditorRenderModes.SET_WORK_MODE_BROWSE
      )
    },
    //更新入院诊断和出院诊断的样式
    async setDiagnosisStatus(type) {
      const pgEditor = this.getEditor()
      let rightMenus = []
      //入院诊断
      let allDiagnosisInfo = await this.pgEditor.diagnosisHelper.getDiagnosisEles()
      const ADMISSION_DIAGNOSIS_INPUT = allDiagnosisInfo.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT
        )
      })
      const DISCHARGE_DIAGNOSIS_INPUT = allDiagnosisInfo.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT
        )
      })
      const CONFIRM_DIAGNOSIS_INPUT = allDiagnosisInfo.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT
        )
      })
      console.log(
        '当前页面的所有诊断信息是',
        allDiagnosisInfo,
        ADMISSION_DIAGNOSIS_INPUT
      )

      let admission_item = {
        menuId: DiagnosisTypes.ADMISSION_DIAGNOSIS,
        workMode: 'bothEditBrowse',
        childMenus: [
          {
            menu: '添加',
            setGray: ADMISSION_DIAGNOSIS_INPUT.length > 0,
            callback: async () => {
              await this.showDiagnosisDialog(
                DiagnosisTypes.ADMISSION_DIAGNOSIS,
                true
              )
              // this.setDiagnosisStatus()
            }
          },
          {
            menu: '删除',
            callback: async () => {
              let isInBrowseState =
                this.pgEditor.store.editor.state.editorOptions
                  .ContentRenderMode == DcEditorRenderModes.SET_WORK_MODE_BROWSE
              //浏览模式下诊断切换成应用态
              await this.setClinicalnoteModel(
                isInBrowseState,
                DcEditorRenderModes.SET_WORK_MODE_APP
              )
              await this.pgEditor.diagnosisHelper.revokeDiagnosis(
                DiagnosisTypes.ADMISSION_DIAGNOSIS
              )

              //下完诊断切换回来
              await this.setClinicalnoteModel(
                isInBrowseState,
                DcEditorRenderModes.SET_WORK_MODE_BROWSE
              )
              this.setDiagnosisStatus('delete')
            }
          }
        ]
      }
      //入院诊断
      rightMenus.push(admission_item) //添加书写模式菜单

      //出院诊断
      let dischargeItem = {
        menuId: DiagnosisTypes.DISCHARGE_DIAGNOSIS,
        workMode: 'bothEditBrowse',
        childMenus: [
          {
            menu: '添加',
            setGray: DISCHARGE_DIAGNOSIS_INPUT.length > 0,
            callback: async () => {
              await this.showDiagnosisDialog(
                DiagnosisTypes.DISCHARGE_DIAGNOSIS,
                true
              )
              // this.setDiagnosisStatus()
            }
          },
          {
            menu: '删除',
            callback: async () => {
              let isInBrowseState =
                this.pgEditor.store.editor.state.editorOptions
                  .ContentRenderMode == DcEditorRenderModes.SET_WORK_MODE_BROWSE
              //浏览模式下诊断切换成应用态
              await this.setClinicalnoteModel(
                isInBrowseState,
                DcEditorRenderModes.SET_WORK_MODE_APP
              )
              await this.pgEditor.diagnosisHelper.revokeDiagnosis(
                DiagnosisTypes.DISCHARGE_DIAGNOSIS
              )

              //下完诊断切换回来
              await this.setClinicalnoteModel(
                isInBrowseState,
                DcEditorRenderModes.SET_WORK_MODE_BROWSE
              )
              this.setDiagnosisStatus('delete')
            }
          }
        ]
      }
      rightMenus.push(dischargeItem) //添加书写模式菜单

      //确定诊断
      let confirmItem = {
        menuId: DiagnosisTypes.CONFIRM_DIAGNOSIS,
        workMode: 'bothEditBrowse',
        childMenus: [
          {
            menu: '添加',
            setGray: CONFIRM_DIAGNOSIS_INPUT.length > 0,
            callback: async () => {
              await this.showDiagnosisDialog(
                DiagnosisTypes.CONFIRM_DIAGNOSIS,
                true
              )
              // this.setDiagnosisStatus()
            }
          },
          {
            menu: '删除',
            callback: async () => {
              let isInBrowseState =
                this.pgEditor.store.editor.state.editorOptions
                  .ContentRenderMode == DcEditorRenderModes.SET_WORK_MODE_BROWSE
              //浏览模式下诊断切换成应用态
              await this.setClinicalnoteModel(
                isInBrowseState,
                DcEditorRenderModes.SET_WORK_MODE_APP
              )
              await this.pgEditor.diagnosisHelper.revokeDiagnosis(
                DiagnosisTypes.CONFIRM_DIAGNOSIS
              )

              //下完诊断切换回来
              await this.setClinicalnoteModel(
                isInBrowseState,
                DcEditorRenderModes.SET_WORK_MODE_BROWSE
              )
              this.setDiagnosisStatus('delete')
            }
          }
        ]
      }
      rightMenus.push(confirmItem) //添加书写模式菜单

      console.log(rightMenus)
      pgEditor.pgEditorInstance.updateRightMenu(rightMenus)
      if (type == 'delete') {
        this.saveClinicalnoteContentDiagnoes(false)
      }
    },
    calculateApache(e) {
      let {
        content: { inpMrtMonitorId }
      } = this.clinicalnoteData
      if (inpMrtMonitorId !== inpMrtMonitorIdEnum.WZBR_APACHE) {
        return
      }
      if (
        e._cptid != DataElementWinIds.APACHE_PARMAS_INPUT_ONE &&
        e._cptid != DataElementWinIds.APACHE_PARMAS_INPUT_TWO &&
        e._cptid != DataElementWinIds.APACHE_PARMAS_INPUT_THREE
      ) {
        return
      }
      const APACHE_PARMAS_INPUT_ONE = this.pgEditor.pgEditorInstance.postmessage(
        {
          type: 'GetValue',
          param: {
            conceptId: DataElementWinIds.APACHE_PARMAS_INPUT_ONE,
            valueTarget: 'onlyDataElement'
          }
        }
      )
      const APACHE_PARMAS_INPUT_TWO = this.pgEditor.pgEditorInstance.postmessage(
        {
          type: 'GetValue',
          param: {
            conceptId: DataElementWinIds.APACHE_PARMAS_INPUT_TWO,
            valueTarget: 'onlyDataElement'
          }
        }
      )
      const APACHE_PARMAS_INPUT_THREE = this.pgEditor.pgEditorInstance.postmessage(
        {
          type: 'GetValue',
          param: {
            conceptId: DataElementWinIds.APACHE_PARMAS_INPUT_THREE,
            valueTarget: 'onlyDataElement'
          }
        }
      )
      let value1 = APACHE_PARMAS_INPUT_ONE[0].value
      let value2 = APACHE_PARMAS_INPUT_TWO[0].value
      let value3 = APACHE_PARMAS_INPUT_THREE[0].value
      console.log(value1, value2, value3)
      if (value1.trim() == '' || value2.trim() == '' || value3.trim() == '') {
        return
      }
      value1 = +value1
      value2 = +value2
      value3 = +value3
      console.log('计算开始')
      let score = 0
      if (5 === value1) {
        score = -3.517 + 0.146 * value3 + 0.603 + value2
      } else {
        score = -3.517 + 0.146 * value3 + value2
      }
      let result = (
        (Math.pow(Math.E, score) / (1 + Math.pow(Math.E, score))) *
        100
      ).toFixed(1)
      console.log(result)
      this.pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: [
          {
            conceptId: DataElementWinIds.APACHE_PARMAS_INPUT_R,
            value: result,
            KeepTrace: true,
            valueTarget: 'onlyDataElement'
          }
        ]
      })
    },
    async injectDiagnosisAsync(inpMrtMonitorId) {
      const pgEditor = this.getEditor()
      const { employeeNo, employeeName, employeeId } = this.userInfo

      //诊断的点击事件
      this.pgEditor.diagnosisHelper.monitorDiagnosisEleDbClick(
        (cptId, flag) => {
          console.log(353335)
          console.log(cptId, flag, this.wrapOperationPermisstionData?.editable)
          //flag表示这个是入院记录里面右键插入的诊断   右键插入诊断的编辑权限只和是不是当前人插入的有关  是当前人添加的就可以编辑 预览模式不能点击
          if (
            (!this.wrapOperationPermisstionData?.editable &&
              flag === 'other') ||
            flag == 'notSameEmploy' ||
            this.pgEditor.store.editor.state.editorOptions.ContentRenderMode ==
              DcEditorRenderModes.SET_PRINT_PREVIEW
          ) {
            //没有编辑权限不能操作诊断
            return
          }
          //入院诊断 修正诊断 补充诊断会存在多个情况概念id是399336691—0这样的格式需要特殊处理
          cptId = cptId.split('-')[0]
          //通过概念id获取对应的诊断类型
          const dianosisType = getDiagnosisTypeByWinId(cptId)
          console.log('当前点击的诊断-普通病历', cptId, dianosisType)
          // 保存诊断类型  用于下诊断
          this.clickDianosisType = dianosisType
          this.showDiagnosisDialog(dianosisType)
        },
        { employeeNo, employeeName, employeeId },
        this.wrapOperationPermisstionData?.editable
      )
      // 当前是否有诊断
      let hasTargetDiagnosisTable = await this.pgEditor.diagnosisHelper.hasTargetDiagnosisTable()
      console.log('inpMrtMonitorId', inpMrtMonitorId, hasTargetDiagnosisTable)
      if (
        inpMrtMonitorId === inpMrtMonitorIdEnum.RYJL &&
        hasTargetDiagnosisTable
      ) {
        // 入院记录有诊断表格的情况

        let isInBrowseState =
          this.pgEditor.store.editor.state.editorOptions.ContentRenderMode ==
          DcEditorRenderModes.SET_WORK_MODE_BROWSE
        let tableXid = await this.pgEditor.diagnosisHelper.getDiagnosisTableXid()
        if (isInBrowseState && tableXid) {
          console.log('调用自研设置表格区域点击事件回调')
          this.pgEditor.pgEditorInstance.setEditablaDiagTable({
            xid: tableXid
          })
        }
        console.log(555, tableXid, isInBrowseState)
        this.pgEditor.diagnosisHelper.monitorDiagnosisListByContextMenu({
          employeeNo,
          employeeName,
          employeeId
        })

        this.setupDiagnosisMouseRightMenu()
        pgEditor.diagnosisHelper.setDiagnosisDate(
          this.userInfo,
          this.wrapOperationPermisstionData?.editable
        )

        pgEditor.eventEmitter.$on(
          EditorEvent.PG_EVENT_REFRESH_DIAGNOSIS,
          async diagnosis => {
            //诊断类型为点击的诊断
            let diagnosisType = this.clickDianosisType
            console.log(
              '下诊断了1 -------------',
              diagnosis,
              diagnosisType,
              this.rightMenuAddDiagnosis
            )
            // 这里只处理非右键下诊断
            if (this.rightMenuAddDiagnosis) {
              return
            }
            let params = {
              _diagnosisData: diagnosis,
              root: null,
              _diagnosisType: diagnosisType,
              isUpdate: true,
              isLast: null,
              isClick: true, //出院诊断点击和首次加载取值不一样
              KeepTrace: true
            }
            //浏览模式下诊断切换成应用态
            await this.setClinicalnoteModel(
              isInBrowseState,
              DcEditorRenderModes.SET_WORK_MODE_APP
            )

            await pgEditor.diagnosisHelper.refreshAllDiagnosis(params)
            //下完诊断切换回来
            await this.setClinicalnoteModel(
              isInBrowseState,
              DcEditorRenderModes.SET_WORK_MODE_BROWSE
            )

            await this.saveClinicalnoteContentDiagnoes(false)
          }
        )
        if (!this.clinicalnoteData.content.hasContent) {
          let params = {
            _diagnosisData: null,
            root: null,
            _diagnosisType: null,
            isUpdate: true,
            isLast: null,
            KeepTrace: false
          }
          await pgEditor.diagnosisHelper.refreshAllDiagnosis(params)
        }
      } else {
        pgEditor.eventEmitter.$on(
          EditorEvent.PG_EVENT_REFRESH_DIAGNOSIS,
          async diagnosis => {
            let diagnosisType = this.clickDianosisType
            let params = {
              _diagnosisData: diagnosis,
              root: null,
              _diagnosisType: diagnosisType,
              isUpdate: true,
              isClick: true, //出院诊断点击和首次加载取值不一样
              isLast: null,
              KeepTrace: true
            }
            await pgEditor.diagnosisHelper.refreshAllDiagnosis(params)

            this.saveClinicalnoteContentDiagnoes(false)
          }
        )
        //新建状态更新所有
        if (!this.clinicalnoteData.content.hasContent) {
          let params = {
            _diagnosisData: null,
            root: null,
            _diagnosisType: null,
            isUpdate: true,
            isLast: null,
            KeepTrace: false
          }
          await pgEditor.diagnosisHelper.refreshAllDiagnosis(params)
        }
      }
    },
    setClinicalnoteModel(isInBrowseState, mode) {
      if (isInBrowseState) {
        console.log('开始切换了，切换的模式是', mode)
        this.pgEditor.store.editor.mutations.setEditorContentRenderMode(mode)
      }
    },
    async saveClinicalnoteContentDiagnoes(isShowProcess = true, inpatEmrSetId) {
      try {
        if (
          isDraftStatus(this.clinicalnoteData.content.inpatEmrSetStatusCode)
        ) {
          return
        }
        await this.autoSaveStatusVerify(false) //验证是否在自动保存中
        this.preservationStatus = false //禁止自动保存
        inpatEmrSetId = inpatEmrSetId || this.currentDocId
        isShowProcess && this.showClinicalnoteProcessing(true)

        const params = await this.getBtnActionParams(inpatEmrSetId)
        if (!params) return
        Object.assign(params, { operationType: 'save' })

        await apiQueryClinicalnoteContentDiagnoes(params)
          .then(async res => {
            let isPdf = !isDraftStatus(
              this.clinicalnoteData.content.inpatEmrSetStatusCode
            )
            //更新病历版本号
            await this.upDateVersion(res, isPdf, 5)
          })
          .catch(e => {
            if (e?.errorDetail?.code == 'WB21620011') {
              this.documentUpdatePromptDialogVisible = true
            }
          })
      } finally {
        this.preservationStatus = true //允许自动保存
      }
    },
    async updateDiagnosis(newData) {
      let { diagnosis, docId, KeepTrace } = newData
      const pgEditor = this.getEditor()
      console.log('连续病程更新诊断', docId, this.clinicalnoteData)
      if (docId) {
        let params = {
          _diagnosisData: diagnosis,
          root: docId,
          _diagnosisType: null,
          isUpdate: true,
          isLast: null,
          KeepTrace
        }
        await pgEditor.diagnosisHelper.refreshAllDiagnosis(params)
      } else {
        const docList = pgEditor.pgEditorInstance.postmessage({
          type: 'GetDocList',
          param: []
        })
        console.log('GetDocList --------- ', docList)
        const { content } = this.clinicalnoteData
        const { list } = content
        //初次加载只更新新建状态病历的诊断
        const activeList = list.filter(item => {
          return item.inpatEmrSetStatusCode == '960074'
        })
        const diagnosisDataIn = await pgEditor.diagnosisHelper.httpGetDiagnosisData()
        console.log(activeList)
        activeList.forEach(async (item, index) => {
          console.log(index, activeList.length - 1)
          const isLast = index == activeList.length - 1 ? 'yes' : 'no'
          let params = {
            _diagnosisData: diagnosis,
            root: item.id,
            _diagnosisType: '',
            isUpdate: false,
            isLast,
            KeepTrace,
            diagnosisDataIn
          }
          pgEditor.diagnosisHelper.refreshAllDiagnosis(params)
        })
      }
    },

    async injectDiagnosisInSieralClinicalnoteAsync() {
      const { employeeNo, employeeName, employeeId } = this.userInfo
      const pgEditor = this.getEditor()
      //初次加载所有新建状态病历的诊断
      await this.updateDiagnosis({
        diagnosis: null,
        docId: null,
        KeepTrace: false
      })

      pgEditor.diagnosisHelper.monitorSerialDiagnosisEleDbClick(
        (cptId, docId) => {
          let editable = this.loadedSubDocList
            .filter(item => {
              return item.id == docId
            })
            .map(doc => {
              return doc.permission.editable
            })
          console.log(editable)
          // 如果当前病历不能编辑 诊断就不能点
          if (
            !editable[0] ||
            this.pgEditor.store.editor.state.editorOptions.ContentRenderMode ==
              DcEditorRenderModes.SET_PRINT_PREVIEW
          ) {
            return
          }
          const dianosisType = getDiagnosisTypeByWinId(cptId)
          console.log('当前点击的诊断-连续病程', cptId, dianosisType)
          // 保存诊断类型  用于下诊断
          this.clickDianosisType = dianosisType
          this.clickCptId = cptId
          this.showDiagnosisDialog(dianosisType)
        },
        { employeeNo, employeeName, employeeId }
      )

      pgEditor.eventEmitter.$on(
        EditorEvent.PG_EVENT_REFRESH_DIAGNOSIS,
        diagnosis => {
          console.log('下诊断了2 -------------', diagnosis, this.currentDocId)
          // 获取有编辑权限的病程
          let editableArrs = this.loadedSubDocList.filter(item => {
            return item.permission.editable
          })
          editableArrs.map(item => {
            let params = {
              type: 'GetElementListWithAttr',
              param: [{ docId: item.id, conceptId: this.clickCptId }]
            }
            const list = this.pgEditor.pgEditorInstance.postmessage(params)
            console.log('当前病程里有这个诊断就更新', list)
            // 当前病程里有这个诊断就更新
            if (list.length > 0 && list[0].valueList.length > 0) {
              pgEditor.diagnosisHelper.refreshAllDiagnosis({
                _diagnosisData: diagnosis,
                root: item.id,
                _diagnosisType: this.clickDianosisType,
                isClick: true, //出院诊断点击和首次加载取值不一样
                isUpdate: true,
                isLast: null,
                KeepTrace: true
              })
            }
          })
        }
      )
      //诊断信息更新提示
      await this.tipsForUpdateDiagnosisInfo()
    },

    //历史都昌病历的去掉权限
    clearPermissionForDCEmr() {
      console.log(this.clinicalnoteData.content.mrtEditorTypeCode, '是否下权限')
      if (this.clinicalnoteData.content.mrtEditorTypeCode == '399461576') {
        this.operationPermisstionData = {
          editable: false,
          permissionVOList: []
        }
      }
    },

    //获取单份病历的状态及权限
    async queryClinicalnotePermissionAsync(_emrSetId) {
      let emrSetId = _emrSetId || this.currentDocId
      if (this.clinicalnoteData?.content?.mrtEditorTypeCode == '399461576') {
        console.log(this.clinicalnoteData.content.mrtEditorTypeCode, '下权限')
        return {
          editable: false,
          permissionVOList: []
        }
      }

      const res = await api.apiGetButtonPermission({
        encounterId: this.currentPatientInfo.encounterId,
        inpatEmrSetId: emrSetId,
        currentDeptId: this.orgInfo.orgId
      })
      const {
        data: { canEdit, permissionVOList }
      } = res
      return {
        editable: canEdit,
        permissionVOList: permissionVOList
      }
    },

    async controlClinicalnoteContentStateAsync() {
      if (this.qualityControlData) {
        this.operationPermisstionData = await this.qualityControlqueryClinicalnotePermissionAsync()
      } else {
        this.operationPermisstionData = await this.queryClinicalnotePermissionAsync()
      }
      this.permisstionKey = +new Date()
      this.handleControlAnnotationBtn()
    },

    //定位到某个子病程
    relocateSubDocById(subDocId) {
      console.log('relocateSubDocById--------', subDocId)
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'LocateCursorWithDocId',
        param: [{ docId: subDocId }]
      })
    },

    //病程切换
    setCurrentSubDocActive(isRefreshPermission = true) {
      let subDocId = this.currentDocId
      if (!subDocId) return

      //定位子病程位置
      if (this.isRelocate) {
        this.relocateSubDocById(subDocId)
      }
      this.isRelocate = true

      //获取当前病程所有段落，筛选短语引用
      this.getDocParagraphIds(this.currentDocId)
      let subDoc = this.loadedSubDocList.find(v => v.id == subDocId)
      Object.assign(this.clinicalnoteData.content, subDoc)

      isRefreshPermission &&
        this.controlClinicalnoteContentStateAsync().then(() => {
          subDoc.permission = this.wrapOperationPermisstionData
          if (this.updateSetIdList.includes(subDocId)) {
            console.log('当前这份病历已经被人更新了，权限清空----')
            this.operationPermisstionData = {
              editable: false,
              permissionVOList: []
            }
            return
          }
        })
      //右键病历克隆菜单
      this.setRightMenuCloneClinicalnote()
      //右键同步病历数据菜单
      this.setRightMenuSyncClinicalnoteData()
      this.setHasSignature()
    },
    //获取病历内容
    async getClinicalnoteContent(inpatEmrSetId) {
      const pgEditor = this.getEditor()
      let param = inpatEmrSetId ? { docId: inpatEmrSetId } : {}
      let xml = ''
      if (this.clinicalnoteData.content.emrTypeId == '121383422926546950') {
        xml = pgEditor.pgEditorInstance.postmessage({
          type: 'SaveDocsAsXml',
          param: []
        })
      } else {
        xml = pgEditor.pgEditorInstance.postmessage({
          type: 'FileSave',
          param: [param]
        })[0]?.xml
      }

      const inpEmrContentBodyData = pgEditor.pgEditorInstance.postmessage({
        type: 'FileSaveAsText',
        param: [Object.assign({ onlyChecked: true }, param)]
      })[0]?.text
      const structuralData = {
        sectionData: [],
        dataElementData: []
      }
      //标题
      const sectionData = pgEditor.pgEditorInstance.postmessage({
        type: 'GetXMLListWithTitle',
        /*
          getInputLabel   获取单位和前后缀，如体征数据
          getHide         获取隐藏元素
        */
        param: [
          Object.assign(
            { getInputLabel: true, getHide: false, onlyChecked: true },
            param
          )
        ]
      })
      structuralData.sectionData = sectionData.map(r => ({
        inpatEmrSectionLevel: r.levelTerm,
        inpEmrSectionNo: r.cptId,
        inpatEmrSectionName: r.elementName,
        inpatEmrSectionDisplayName: r.showName,
        inpEmrSectionWinId: r.cptId,
        // inpEmrSectionConceptId: r.cptId,
        inpatEmrSectionPlainTxt: r.paragraphtext,
        inpEmrSectionContent: compress(r.xml)
      }))
      //元素
      const dataElementData = pgEditor.pgEditorInstance.postmessage({
        type: 'GetElementListWithAttr',
        param: [param]
      })
      console.log(dataElementData, 'dataElementData------')
      let dataElementDataFilter = []

      dataElementData.forEach(el => {
        el.valueList.reverse().forEach(ele => {
          if (ele.container === 'XTextBody') {
            //相同cpt的元素嵌套，返回最外层那一个父元素
            let _index = el.valueList.findIndex(v => {
              return (
                ele.cptId == v.cptId &&
                ele.parentXid &&
                v.xid && //防止ele.parentXid和v.xid正好都为undefined
                ele.parentXid == v.xid &&
                v.container === 'XTextBody'
              )
            })
            if (_index == -1) {
              dataElementDataFilter.push(ele)
            }
            // else {
            //   console.log('踢掉同cpt重复嵌套的', ele, el.valueList[_index])
            // }
          }
          // else {
          //   console.log('踢掉非病历body中的', ele)
          // }
        })
      })
      //处理表达式图片
      dataElementDataFilter.forEach(el => {
        if (formulaElementTypes.includes(el.type)) {
          dataElementDataFilter = [
            ...getFormulaElementListWithAttr(el),
            ...dataElementDataFilter
          ]
        }
      })
      console.log(dataElementDataFilter, '2dataElementData------')

      structuralData.dataElementData = dataElementDataFilter
        .reverse() // 将上一次反转的数据修正
        .map(r => {
          let inpEmrDataElementValue = []
          //动态数据集结构化  由于可输入，数据可能匹配不上，需做处理
          if (r?.DynamicDataValue?.length) {
            let textArr = r.InnerValue?.trim()?.split('、')
            //先处理能对应上的  code#text
            for (let k = 0; k < textArr.length; k++) {
              for (let i = 0; i < r.DynamicDataValue.length; i++) {
                if (r.DynamicDataValue[i].value == textArr[k]) {
                  inpEmrDataElementValue.push(
                    r.DynamicDataValue[i].key +
                      '#' +
                      r.DynamicDataValue[i].value
                  )
                  textArr.splice(k, 1)
                  k--
                  break
                }
              }
            }

            if (textArr.length) {
              //再处理能对应不上的  #text
              for (let k = 0; k < textArr.length; k++) {
                inpEmrDataElementValue.push('#' + textArr[k])
              }
            }
          } else {
            if (r.InnerValue) {
              inpEmrDataElementValue.push(r.InnerValue.trim())
              //添加此判断主要是为了获取签名图片地址
            } else if (
              r.value &&
              typeof r.value == 'string' &&
              !r.value?.startsWith('data:image/png;base64,')
            ) {
              inpEmrDataElementValue.push(r.value.trim())
            } else {
              inpEmrDataElementValue.push(r.value?.toString())
            }
          }

          return {
            /*sectionDataElementTypeCode 元素类型
             *1 文本框
             *2 单选下拉
             *3 多选下拉
             *4 日期
             *5 数值框
             *6 复选框
             *7 单选框
             *8 诊断
             *9 用户签名
             *14 图片base64
             *15 图片url
             */
            sectionDataElementTypeCode: r.eleType,
            inpEmrDataElementWinId: r.cptId,
            inpEmrDataElementName: r.name,
            inpEmrDataElementValue: inpEmrDataElementValue.join(','),
            inpEmrSectionNo: r.titleCptId
          }
        })
      if (!this.clinicalnoteData.content.emrTypeId == '121383422926546950') {
        //不是会诊就过滤空数据
        structuralData.dataElementData = structuralData.dataElementData?.filter(
          v => {
            return v.inpEmrDataElementValue && v.inpEmrDataElementWinId
          }
        )
      }

      const base64Str = compress(xml)

      console.log('编辑结果 ---------- ', {
        base64Str,
        structuralData,
        inpEmrContentBodyData,
        xml
      })
      return {
        base64Str,
        structuralData,
        inpEmrContentBodyData,
        xml
      }
    },
    //按钮操作参数统一
    async getBtnActionParams(inpatEmrSetId) {
      let clinicalnoteContent = await this.getClinicalnoteContent(inpatEmrSetId)
      if (!clinicalnoteContent) {
        this.showClinicalnoteProcessing(false)
        console.error('住院病历前端-获取病历内容失败')
        return
      }
      const {
        base64Str,
        structuralData,
        inpEmrContentBodyData
      } = clinicalnoteContent

      if (!base64Str || !structuralData) {
        this.showClinicalnoteProcessing(false)
        console.error('住院病历前端-获取病历内容失败')
        return
      }

      // 每一次保存病历内容时，向CDSS发送事件
      this.sendMessageToCDSS('399554100', inpatEmrSetId, structuralData)

      let { serial, content } = this.clinicalnoteData
      let inpatEmrRecordId = content.inpatEmrRecordId
      if (serial) {
        inpatEmrRecordId = content.list.find(el => el.id == inpatEmrSetId)
          .inpatEmrRecordId
      }
      const { bizRoleId, encounterId } = this.currentPatientInfo
      console.log(structuralData.dataElementData)
      //修正诊断和补充诊断存在多个概念id加了-后缀 需要去除，如399336691-0
      structuralData.dataElementData.forEach(item => {
        item.inpEmrDataElementWinId = item.inpEmrDataElementWinId?.split('-')[0]
      })

      let {
        content: { inpMrtMonitorId }
      } = this.clinicalnoteData

      let operationBy = ''
      if (inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD) {
        let surgicalDoctorInfo = structuralData.dataElementData?.find(v => {
          return v.inpEmrDataElementWinId == '399336909'
        })?.inpEmrDataElementValue
        if (surgicalDoctorInfo) {
          operationBy = surgicalDoctorInfo.split('#')[0]
        }
      }

      return {
        inpatEmrSetId,
        emrRecordAddInfo: {
          bizRoleId,
          encounterId,
          inpatEmrSetId,
          inpatEmrRecordId,
          operationBy
        },
        emrContentAddInfo: {
          inpEmrContentBodyData,
          inpatEmrContentData: base64Str
        },
        emrSectionAddInfos: structuralData.sectionData,
        emrSectionDataElementAddInfos: structuralData.dataElementData
      }
    },
    getinpEmrDataElementValue($field) {
      if ($field.attr('dc_name') === '医师签名') {
        return (
          Array.from($field[0].children).find(el => {
            return el.nodeName == 'IMG'
          })?.src || ''
        )
      } else {
        return Array.from($field[0].children).some(
          el => el.nodeName === 'LABEL'
        )
          ? ''
          : $field.attr('dc_innervalue') || $field[0].innerText.slice(1, -1)
      }
    },
    async pgHandleSavePersonalTemplate() {
      const clinicalnoteData = this.clinicalnoteData
      let inpatEmrSetId = clinicalnoteData.content.emrSetId
      let content = await this.getClinicalnoteContent(inpatEmrSetId)
      if (!content || !content.base64Str) {
        return
      }
      this.$root.eventHub.$emit(
        'SaveTemplate/ShowDialogAll',
        true,
        clinicalnoteData,
        content
      )
    },
    async saveClinicalnoteContentAsync(isShowProcess = true, inpatEmrSetId) {
      inpatEmrSetId = inpatEmrSetId || this.currentDocId
      isShowProcess && this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(inpatEmrSetId)
      if (!params) return
      Object.assign(params, { operationType: 'save' })
      await apiSaveInpatientClinicalnoteContent(params)
        .then(async res => {
          //更新病历版本号
          await this.upDateVersion(res)
          if (isShowProcess) {
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
        })
        .finally(() => {
          isShowProcess && this.showClinicalnoteProcessing(false)
        })
        .catch(e => {
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
    },
    async saveAutoClinicalnoteContentAsync(inpatEmrSetId) {
      this.preservationStatus = false //禁止自动保存
      this.autoSaveLoading = true //是否自动保存中
      inpatEmrSetId = inpatEmrSetId || this.currentDocId
      const params = await this.getBtnActionParams(inpatEmrSetId)
      if (!params) {
        this.preservationStatus = true
        this.autoSaveLoading = false
        return
      }

      await api
        .autoSaveEmr(params)
        .then(
          async res => {
            console.log('保存结果 ----------', res)
            //更新病历版本号
            await this.upDateVersion(res)
            //重置状态
            this.handleResetXDocsChanged(inpatEmrSetId, 'update')
            this.preservationStatus = true
          },
          e => {
            if (e?.errorDetail?.code == 'WB21620011') {
              this.documentUpdatePromptDialogVisible = true
            }
            console.error('自动保存失败,接口请求错误')
            this.preservationStatus = true
            return Promise.reject()
          }
        )
        .finally(() => {
          this.autoSaveLoading = false
        })
    },
    async autoSaveStatusVerify(hint = true) {
      if (this.autoSaveLoading) {
        if (hint) {
          this.$message({
            message: '当前病历正在自动保存，请稍后操作！',
            type: 'warning'
          })
        } else {
          console.warn('当前病历正在自动保存，请稍后操作！')
        }
        return Promise.reject()
      }
    },
    /* 非手术记录：
     *  提交时直接在默认的输入框里签名
     *  审签通过时需从患者信息中取签名的cptId
     *
     *  手术记录：（只在手术医生签名域中签名）
     *  提交时  不是手术医生提交不签名，后续需走审签流程让手术医生签名
     *  审签通过 手术医生签名
     */
    async signClinicalnote(signCptId) {
      this.setHasSignature(signCptId) //重新设置hasSignature的值   防止病历书写过程中删除签名域
      //提交按钮且无医师签名输入域  直接返回
      if (!this.hasSignature) return

      let {
        content: { inpMrtMonitorId }
      } = this.clinicalnoteData

      if (
        inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD &&
        this.surgicalRecordsReviewConfig == '2'
      ) {
        signCptId = '399323838'
      }

      await this.pgEditor.signatureHelper.signClinicalnote(
        this.currentDocId,
        signCptId
      )
    },

    async unSignClinicalnote(signCptId) {
      this.setHasSignature(signCptId) //重新设置hasSignature的值   防止病历书写过程中删除签名域
      //提交按钮且无医师签名输入域  直接返回
      if (!this.hasSignature) return
      let {
        content: { inpMrtMonitorId }
      } = this.clinicalnoteData
      if (
        inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD &&
        this.surgicalRecordsReviewConfig == '2'
      ) {
        signCptId = '399323838'
      }
      await this.pgEditor.signatureHelper.unSignClinicalnote(
        this.currentDocId,
        signCptId
      )
    },
    /*
      校验文档必填项
      isInit=true表示文档打开时
    */
    async verifyDoc(isInit = false) {
      //只对未提交病历做校验
      if (!isDraftStatus(this.clinicalnoteData.content.emrStatusCode)) return
      const pgEditor = this.getEditor()
      let verifyStatusList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetValidateList',
        param: this.clinicalnoteData.serial
          ? [{ docId: this.currentDocId }]
          : ''
      })
      console.log(verifyStatusList, 'verifyStatusList')
      //文档打开时值改变必填域的颜色  不做多余提示及定位
      if (isInit) return

      if (verifyStatusList?.length) {
        verifyStatusList.forEach((el, i) => {
          setTimeout(() => {
            if (i == 0) {
              pgEditor.pgEditorInstance.postmessage({
                type: 'LocateCursorWithInput',
                param: [
                  {
                    cptId: el.xid,
                    idType: 'XID',
                    position: 'innerbefore', // after,before,innerbefore,innerafter
                    docId: el.docId
                  }
                ]
              })
            }

            this.$message({
              message: (el.bgcText ?? el.title) + el.msg,
              type: 'warning'
            })
          })
        })
        return Promise.reject()
      }
    },

    async submitClinicalnoteAsync() {
      // this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(this.currentDocId)
      if (!params) return
      Object.assign(params, { operationType: 'commit' })
      await api
        .commitEmrContent(params)
        .then(async res => {
          console.log('保存结果 ----------', res)
          //更新病历版本号
          await this.upDateVersion(res, false)
          let emrSetTitle = this.clinicalnoteData.content.emrSetTitle
          if (res?.success) {
            this.$message({
              message: `${emrSetTitle ?? ''}提交成功`,
              type: 'success'
            })
          } else {
            //提交失败 撤销签名
            this.unSignClinicalnote(
              DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
            )
            this.$message({
              message: res?.errorDetail?.message
                ? res?.errorDetail?.message
                : `${emrSetTitle ?? ''}提交失败`,
              type: 'warning'
            })
          }
        })
        .catch(e => {
          //提交失败 撤销签名
          this.unSignClinicalnote(
            DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
          )
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
        .finally(() => {
          // this.showClinicalnoteProcessing(false)
        })
    },

    async recallSubmitClinicalnoteAsync() {
      // this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(this.currentDocId)
      if (!params) return
      let res = await api
        .cancelSubmitEmr(params)
        .finally(() => {
          // this.showClinicalnoteProcessing(false)
        })
        .catch(e => {
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
      //更新病历版本号
      await this.upDateVersion(res)
      if (res?.success) {
        this.$message({
          message: res?.errorDetail?.message || '撤销提交成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: res?.errorDetail?.message || '撤销提交失败',
          type: 'warning'
        })
      }
    },

    async clinicalnoteReviewPassAsync() {
      this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(this.currentDocId)
      if (!params) return
      let res = await apiMedicalManager
        .approveReviewEmr({
          inpatEmrSetId: this.currentDocId,
          emrSaveInfo: params
        })
        .catch(e => {
          //审签失败 撤销签名
          this.unSignClinicalnote(
            this.currentPatientInfo.employeeExpertiseWinId
          )
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
        .finally(() => {
          this.showClinicalnoteProcessing(false)
        })
      //更新病历版本号
      await this.upDateVersion(res)
      if (res?.success) {
        this.$message({
          message: res?.errorDetail?.message || '审签通过成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: res?.errorDetail?.message || '审签通过失败',
          type: 'warning'
        })
      }
    },

    async clinicalnoteReviewDismissAsync() {
      this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(this.currentDocId)
      if (!params) return
      let res = await apiMedicalManager
        .rejectReviewEmr({
          inpatEmrSetId: this.currentDocId,
          emrSaveInfo: params
        })
        .finally(() => {
          this.showClinicalnoteProcessing(false)
        })
        .catch(e => {
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
      //更新病历版本号
      await this.upDateVersion(res)
      if (res?.success) {
        this.$message({
          message: res?.errorDetail?.message || '审签退回成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: res?.errorDetail?.message || '审签退回失败',
          type: 'warning'
        })
      }
    },

    async clinicalnoteRecallReviewAsync() {
      this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(this.currentDocId)
      if (!params) return
      let res = await apiMedicalManager
        .withdrawReviewEmr({
          inpatEmrSetId: this.currentDocId,
          emrSaveInfo: params
        })
        .finally(() => {
          this.showClinicalnoteProcessing(false)
        })
        .catch(e => {
          if (e?.errorDetail?.code == 'WB21620011') {
            this.documentUpdatePromptDialogVisible = true
          }
        })
      //更新病历版本号
      await this.upDateVersion(res)
      if (res?.success) {
        this.$message({
          message: res?.errorDetail?.message || '撤销审签成功',
          type: 'success'
        })
      } else {
        this.$message({
          message: res?.errorDetail?.message || '撤销审签失败',
          type: 'warning'
        })
      }
    },

    async handleLoadClinicalnoteContentAction() {
      try {
        const { content } = this.clinicalnoteData
        let clinicalnoteData = await this.getNormalClinicalnoteContent()
        Object.assign(content, clinicalnoteData)
        if (!clinicalnoteData.xml) return
        //获取到数据后判断都昌的病历下权限
        this.clearPermissionForDCEmr()
        console.time('测试普通病历加载速度-----')
        await this.loadClinicalnoteXmlAsync()
        console.timeEnd('测试普通病历加载速度-----')
        this.verifyDoc(true)
        this.insertPageNum()
        this.closeTheNotation(false) //每次进来关闭批注
        //控制模板上的某些内容是否可见
        this.controlsDataSourcesVisibility()
        //设置病历的状态
        this.tagImageByClinicalnoteStatus()
        //填充二维码内容
        this.setQrCodeContent()
        const pgEditor = this.getEditor()
        //水印
        pgEditor.setWaterMark().catch(() => {})
        //若病历已归档，设置不可编辑状态
        if (this.isInForbiddenState) {
          this.setClinicalnoteToPreviewMode()
          return
        }
        this.injectPresetSystemDataForClinicalnoteAsync().catch(() => {}) //填充基本信息
        this.injectUpdateVitalSignsDataAsync() //生命体征
        this.injectDefaultDataForClinicalnoteAsync() //缺省值

        this.setHasSignature() //设置hasSignature的值
        //智能联动 需要依赖权限 所以放最后
        this.insertClinicalnoteQuickInputData()
        this.fillingFuncs = new FillingFuncsForClinicalnote(this)
        this.fillingFuncs.init()
        // 诊断插入
        this.injectDiagnosisAsync(content.inpMrtMonitorId)

        console.log('设置光标位置到文档的最开始 ---------- ')
        setTimeout(() => {
          pgEditor.pgEditorInstance.postmessage({
            type: 'LocateCursorWithDocId',
            param: [{}]
          })
          //获取以pango-editor-content-pgEditor开头的id dom
          // $('[id^="pango-editor-content-pgEditor"]')[0].scrollTo(0, 0) //解决新建手术记录页面没滚动到顶部问题
        }, 0)
        //重置状态
        this.handleResetXDocsChanged('', 'initialize')
        //病历阅改进来是否展示痕迹
        if (this.currentReviewData?.mode == 'trail') {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_KEEP_TRACE
          )
          this.currentReviewData.mode == ''
        }
        //右键病历克隆菜单
        this.setRightMenuCloneClinicalnote()
        //右键同步病历数据菜单
        this.setRightMenuSyncClinicalnoteData()
        this.getDocParagraphIds(this.currentDocId)
        //继承的组件通过该方法执行自己的逻辑
        this.aloneEvent && this.aloneEvent()
      } catch {
        this.$store.commit('setHomeLoading', false)
      }
    },

    //已封存、已打印病历展示预览模式
    setClinicalnoteToPreviewMode() {
      const pgEditor = this.getEditor()
      pgEditor.switchContentRenderMode(DcEditorRenderModes.SET_PRINT_PREVIEW)
      this.toolbarOptions.isDisableWorkMode = true
    },
    //设置二维码内容
    setQrCodeContent() {
      const pgEditor = this.getEditor()
      let inpMrtMonitorId = ''
      let docId = ''
      if (this.clinicalnoteData.serial) {
        // 产品要求写取首程的相关信息，这里取第一个，防止测试环境没有写首程
        inpMrtMonitorId = this.loadedSubDocList[0].inpMrtMonitorId
        docId = this.loadedSubDocList[0].id
      } else {
        if (this.clinicalnoteData.content.inpatEmrSetStatusCode != '960074') {
          return
        }

        inpMrtMonitorId = this.clinicalnoteData.content.inpMrtMonitorId
        docId = this.currentDocId
      }
      pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: [
          {
            docId: this.currentDocId,
            conceptId: '399566219',
            ListSernoStyle: 'Arabic',
            //患者就诊标识|住院|电子病历|病历监控类型（首程监控类型）|（首程）病历id|页码
            //一个编辑器打开二维码内容只有页码不一样，其他都一样
            value: `${this.currentPatientInfo.encounterId}|2|EMR|${inpMrtMonitorId}|${docId}|[%PageIndex%]`
          }
        ]
      })
    },
    getDocParagraphIds(docId) {
      const pgEditor = this.getEditor()
      let titleList = pgEditor.pgEditorInstance.postmessage({
        type: 'getTitleList',
        param: [{ docId }]
      })
      console.log(titleList, 'getTitleList------')
      this.clinicalnoteData.content.paragraphIds =
        titleList.filter(v => {
          return v.cptId
        }) ?? []
    },

    setEditorStatusByPermission() {
      const pgEditor = this.getEditor()
      let { editable } = this.wrapOperationPermisstionData

      if (this.clinicalnoteData.serial) {
        if (this.mode == DcEditorRenderModes.SET_WORK_MODE_APP) {
          pgEditor?.pgEditorInstance?.postmessage({
            type: 'SetEditableByDocId',
            param: [
              {
                docId: this.currentDocId,
                isEditable: editable
              }
            ]
          })
        }
      } else {
        //授权查看的情况
        let { authCode } = this.authorizationPermission
        if (!editable && (authCode == '399467674' || authCode == '399467675')) {
          this.setClinicalnoteToPreviewMode()
        } else {
          pgEditor?.settingEditorRenderModeByStatus(editable)
        }
      }
    },

    handleRefreshPermission(id) {
      if (id == this.currentDocId) {
        this.controlClinicalnoteContentStateAsync()
      }
    },
    //自动暂存某一份病程时不一定是当前的病程
    handleSaveAction: throttle(async function(emrSetId, isShowProcess = true) {
      await this.autoSaveStatusVerify() //验证是否在自动保存中
      isShowProcess && this.showClinicalnoteProcessing(true)
      emrSetId = emrSetId || this.currentDocId
      const pgEditor = this.getEditor()

      try {
        this.preservationStatus = false //禁止自动保存
        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }

        await this.sendingDataSourceInformation(
          this.clinicalnoteData.serial,
          emrSetId
        ) //其他数据源信息

        await this.updateBasicData() //更新患者基础数据
        if (this.qualityControlData?.rectificationOrderType) {
          //质控暂存
          await this.saveQualityClinicalnoteContentAsync(
            isShowProcess,
            emrSetId
          )
        } else {
          await this.saveClinicalnoteContentAsync(isShowProcess, emrSetId)
        }

        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote(emrSetId)
        //重置内容改动状态
        this.handleResetXDocsChanged(emrSetId, 'update')
      } finally {
        isShowProcess && this.showClinicalnoteProcessing(false)
        this.preservationStatus = true //允许自动保存
      }
    }, 1000),
    async updateSort(emrSetId, date) {
      const pgEditor = this.getEditor()
      let allList = this.loadedSubDocList
      let activatedSetData = null
      allList.forEach((el, i) => {
        if (el.id == emrSetId) {
          activatedSetData = allList.splice(i, 1)[0]
        }
      })
      //先获取内容
      let content = await this.getClinicalnoteContent(emrSetId)
      if (!content || !content.base64Str) return
      //删除
      pgEditor.pgEditorInstance.postmessage({
        type: 'CloseDocByDocId',
        param: [emrSetId]
      })
      activatedSetData.xml = decompress(content.base64Str)
      activatedSetData.inpatEmrSetFileTime = date
      await this.insertSubDocsAction(activatedSetData)
      this.setCurrentSubDocActive()

      //设置病历的状态
      this.tagImageByClinicalnoteStatus(activatedSetData.id)
    },
    async handleAutoSaveAction(saveDocIdList) {
      const clinicalnoteData = this.clinicalnoteData
      if (clinicalnoteData.serial) {
        for (let i = 0; i < saveDocIdList.length; i++) {
          await this.saveAutoClinicalnoteContentAsync(saveDocIdList[i].docId)
          await this.sendingDataSourceInformation(true, saveDocIdList[i].docId) //其他数据源信息
        }
      } else {
        await this.saveAutoClinicalnoteContentAsync()
        await this.sendingDataSourceInformation(
          false,
          this.currentActiveLoadedClinicalnote.options.content.emrSetId
        ) //其他数据源信息
      }
      // //重新获取病历的状态并设置状态图片
      this.handleRefreshClinicalnoteForStatus()
    },
    //如果是死亡记录的话，需要通过混合框架通知门诊
    sendMessageToOutpatients() {
      let { inpMrtMonitorId } = this.clinicalnoteData.content
      if (
        inpMrtMonitorId === inpMrtMonitorIdEnum.SWJL ||
        inpMrtMonitorId === inpMrtMonitorIdEnum.RYSWJL_IN24HOURS
      ) {
        // 死亡记录 \ 24小时出入院死亡记录
        const EventId = '399291293'
        const { encounterId } = this.currentPatientInfo
        const { employeeNo, employeeName, employeeId } = this.userInfo
        const params = {
          header: {
            Authorization: Cookies.get('BEARER_TOKEN') || '',
            'W-SEQ': Cookies.get('W-SEQ') || 'default',
            'W-FLOW': Cookies.get('W-FLOW') || 'default'
          },
          body: {
            currentEncounter: {
              employeeNo,
              employeeName
            },
            Token: Cookies.get('BEARER_TOKEN')
          },
          'body-stand': [
            {
              resource: {
                resourceType: 'IPEncounter',
                id: encounterId
              }
            },

            {
              resource: {
                resourceType: 'Employee',
                id: employeeId
              }
            }
          ]
        }
        console.log('向混合框架触发死亡医嘱 ------ ', params)
        try {
          window.winning &&
            window.winning.dispatchEvent(EventId, JSON.stringify(params))
        } catch (error) {
          console.error('触发死亡医嘱调取混合框架出错', error)
        }
      }
    },
    getClinicalnotePdf(operationFlag) {
      const inpEmrSetRecordId = this.clinicalnoteData.content.inpatEmrRecordId

      let docArr = []
      let param = []
      if (this.clinicalnoteData.serial) {
        console.log('连续病程数组信息0909877', inpEmrSetRecordId)
        //连续病程获取docId与打印逻辑相同  从第一个开始是提交状态的  遇到非提交状态跳出循环
        this.loadedSubDocList.every(item => {
          if (!isDraftStatus(item.emrStatusCode)) {
            docArr.push(item.id)
            return true
          } else {
            return false
          }
        })
        console.log('连续病程已提交状态数组')
        console.log(docArr)
        //连续病程如果没有pdf内容不调用自研生成pdf方法
        if (docArr.length == 0) {
          this.handleSavePdf('', inpEmrSetRecordId, operationFlag)
          return
        } else {
          operationFlag = 5
        }
        param = [
          {
            exportMode: 'printPreview',
            outPutType: 'arraybuffer',
            showStatusImg: false,
            showWaterMark: false,
            docArr,
            callback: res => {
              // params:返回的pdf
              //pageNum:pdf的总页码数
              console.log('返回的pdf信息')
              console.log(res)
              this.handleSavePdf(
                res.params,
                inpEmrSetRecordId,
                operationFlag,
                res.pageNum,
                docArr
              )
            }
          }
        ]
      } else {
        if (operationFlag != 5) {
          this.handleSavePdf('', inpEmrSetRecordId, operationFlag)
          return
        }
        param = [
          {
            exportMode: 'printPreview',
            outPutType: 'arraybuffer',
            showStatusImg: false,
            showWaterMark: false,
            callback: res => {
              // params:返回的pdf
              //pageNum:pdf的总页码数
              console.log('返回的pdf信息')
              console.log(res)
              this.handleSavePdf(
                res.params,
                inpEmrSetRecordId,
                operationFlag,
                res.pageNum
              )
            }
          }
        ]
      }
      console.log(docArr)
      let params = {
        type: 'ExportPDF',
        param
      }
      console.log(7777)
      console.log(params)
      setTimeout(() => {
        const pgEditor = this.getEditor()
        pgEditor.pgEditorInstance.postmessage(params)
      })
    },
    async handleSavePdf(str, inpEmrSetRecordId, operationFlag, page, docArr) {
      console.log(str, inpEmrSetRecordId, operationFlag, page)
      if (!str && operationFlag == 5) {
        return
      }
      console.log(this.clinicalnoteData)
      let inpEmrSetId = this.clinicalnoteData.content.emrSetId
      let inpEmrSetName = this.clinicalnoteData.content.emrSetTitle
      let emrMrtMonitorId = this.clinicalnoteData.content.inpMrtMonitorId
      if (this.clinicalnoteData.serial) {
        let pdfObj = this.loadedSubDocList[0]
        //取第一个非封存状态的病程信息作为接口入参
        this.loadedSubDocList.some(item => {
          if (item.sealedStatus != '399572897') {
            pdfObj = item
            return true
          }
        })
        console.log(pdfObj)
        inpEmrSetId = pdfObj.id
        inpEmrSetName = pdfObj.emrSetTitle
        inpEmrSetRecordId = pdfObj.inpatEmrRecordId
        emrMrtMonitorId = pdfObj.inpMrtMonitorId
      }

      const { encounterId } = this.currentPatientInfo
      //operationFlag操作标识，发送消息给病案那边的 3撤销提交(不需要上传pdf)，4删除(不需要上传pdf)，5生成pdf(需要上传pdf)")
      let params = {
        encounterId,
        emrSourceCode: this.clinicalnoteData.content.emrSourceCode,
        pdfs: [
          {
            emrMrtMonitorId,
            inpEmrSetId,
            inpEmrSetName,
            operationFlag: operationFlag,
            inpEmrSetRecordId,
            docArr,
            pdfInfo: this.transformArrayBufferToBase64(str),
            page
          }
        ]
      }
      api.saveClinicalnotePdf(params).then(res => {
        console.log(res)
      })
    },
    //将ArrayBuffer转成base64
    transformArrayBufferToBase64(buffer) {
      var binary = ''
      var bytes = new Uint8Array(buffer)
      for (var len = bytes.byteLength, i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return window.btoa(binary)
    },
    handleSubmitAction: throttle(async function(signatureInfo) {
      console.time('病历提交测速===')
      const pgEditor = this.getEditor()
      try {
        this.preservationStatus = false //禁止自动保存
        await this.autoSaveStatusVerify() //验证是否在自动保存中
        this.showClinicalnoteProcessing(true)

        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }
        await this.prohibitedWords.setProhibitedWords(this.currentDocId)
        //电子签名通过混合框架保存id
        this.emitHybridEvent('399556282', true)
        console.log(4446)

        // await this.insertPageNum()
        await this.verifyDoc() //校验
        this.sendMessageToOutpatients()
        await this.sendingDataSourceInformation(
          this.clinicalnoteData.serial,
          this.currentActiveLoadedClinicalnote.options.content.emrSetId
        ) //其他数据源信息
        //若有签名时间则更新签名时间
        if (signatureInfo?.signTime) {
          pgEditor.signatureHelper.setSignatureTime({
            docId: this.currentDocId,
            signTime: signatureInfo?.signTime
          })
        }

        //签名
        await this.signClinicalnote(
          DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
        )
        await this.updateBasicData() //更新患者基础数据
        await this.submitClinicalnoteAsync()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()

        //轮询 缺陷列表数据
        this.$root.eventHub.$emit('clinicalnote/openQualityRemindPoll')
        //智能提醒  质控缺陷列表刷新
        this.$root.eventHub.$emit('clinicalnote/qualityControlDefectList')
        this.$nextTick(() => {
          this.getClinicalnotePdf(5)
        })
      } finally {
        console.timeEnd('病历提交测速===')
        this.showClinicalnoteProcessing(false)
        this.preservationStatus = true //允许自动保存
      }
    }, 2000),

    handleRecallSubmitAction: throttle(async function() {
      const pgEditor = this.getEditor()
      try {
        this.showClinicalnoteProcessing(true)
        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }
        await this.unSignClinicalnote(
          DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
        )
        await this.updateBasicData() //更新患者基础数据
        await this.recallSubmitClinicalnoteAsync()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()

        //撤销提交后实现病历联动
        if (this.clinicalnoteData.serial) {
          this.insertSerialClinicalnoteQuickInputData(this.currentDocId)
        } else {
          this.insertClinicalnoteQuickInputData()
        }
        // //撤销提交后如果存储的诊断内容不为空  则直接填充诊断
        if (this.cachedDiagnosisDatas) {
          const pgEditor = this.getEditor()
          pgEditor.eventEmitter.$emit(
            EditorEvent.DC_EVENT_REFRESH_DIAGNOSIS,
            this.cachedDiagnosisDatas
          )
          //填充后置空
          this.cachedDiagnosisDatas = null
        }
        this.getClinicalnotePdf(3)
      } finally {
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),
    async updateBasicData(isUpdate = true, docId, isHeader = false) {
      const pgEditor = this.getEditor()
      let inpEmrSetIds = []
      if (this.clinicalnoteData.serial) {
        //初始化系统数据（机构名等页眉页脚及基础数据）
        await pgEditor.injectPresetSystemConceptData(
          isUpdate,
          this.draftSerialClinicalnoteIds
        )
        inpEmrSetIds = this.draftSerialClinicalnoteIds
      } else {
        await pgEditor.injectPresetSystemConceptData(isUpdate, docId, isHeader) //填充基本信息
        inpEmrSetIds = [this.currentDocId]
      }
      //转科的病历需要填充这份病历创建时科室的部分基础数据（只针对单份）要等上面的填充完成才进行填充，不然会有问题
      await pgEditor.setTransferBasicData(inpEmrSetIds)
    },

    async emitHybridEvent(code, isCallback = false) {
      //电子签名通过混合框架保存id
      if (!window.winning) return
      const { encounterId } = this.currentPatientInfo
      const params = {
        header: {
          Authorization: Cookies.get('BEARER_TOKEN') || '',
          'W-SEQ': Cookies.get('W-SEQ') || 'default',
          'W-FLOW': Cookies.get('W-FLOW') || 'default'
        },
        body: [
          {
            resource: {
              resourceType: 'Encounter',
              id: encounterId
            }
          },
          {
            resource: {
              resourceType: 'EncounterType',
              id: '145235'
            }
          },
          {
            resource: {
              resourceType: 'IPEmrSet',
              id: this.clinicalnoteData.content.emrSetId
            }
          }
        ]
      }
      const paramsStr = JSON.stringify(params)
      console.log('发送混合框架事件：', paramsStr)
      console.log(code, isCallback)
      return new Promise((resolve, reject) => {
        try {
          let processCbList = []
          window.winning &&
            window.winning.dispatchEvent(
              code,
              paramsStr,
              isCallback
                ? res => {
                    console.log('ca回调结果: ', res)
                    const data = JSON.parse(res)
                    if (data.state === 'pending') {
                      processCbList.push(data)
                      if (data.actionType === 'message') {
                        if (
                          data.messageInfo.type === 'warn' ||
                          data.messageInfo.type === 'tips'
                        ) {
                          this.$message.warning(data.messageInfo.message)
                        } else if (
                          data.messageInfo.type === 'error' ||
                          data.messageInfo.type === 'stop'
                        ) {
                          this.$message.error(data.messageInfo.message)
                        }
                      }
                    } else if (data.state === 'finish') {
                      const isError = !!processCbList.find(
                        item => item.actionType !== 'success'
                      )
                      if (isError) {
                        reject(false)
                      } else {
                        const process = processCbList.find(
                          p => p.actionType === 'success' && p.data
                        )
                        if (
                          process &&
                          process.data.CA &&
                          process.data.CA.SignatureRecordID
                        ) {
                          this.saveClinicalnoteSign(
                            process.data.CA.SignatureRecordID
                          )
                          resolve(process.data.CA.SignatureRecordID)
                        } else {
                          resolve(null)
                        }
                      }
                    }
                  }
                : () => {}
            )
          if (!isCallback) {
            resolve(true)
          }
        } catch (error) {
          reject(error)
          console.log('调用混合框架发送事件失败: ', error)
          this.$message.error('调用混合框架发送事件失败')
        }
      })
    },
    async sendMessageToCDSS(code, emrSetId, structuralData) {
      let hasCDSSConfig = this.AllConfigure?.data?.find(el => {
        return (
          el.inpatEmrParamConfigCode === 'COMMON035' &&
          el.inpatEmrParamConfigContent == 'true'
        )
      })

      //电子签名通过混合框架保存id
      if (!window.winning || !hasCDSSConfig) return
      const { encounterId } = this.currentPatientInfo
      const { employeeId } = this.userInfo
      let {
        serial,
        content: { inpMrtMonitorId, emrSetTitle }
      } = this.clinicalnoteData
      let wblbdm = ''
      let wbmc = ''
      let wddsj = []
      if (serial) {
        let subDoc = this.loadedSubDocList.find(item => item.id == emrSetId)
        wblbdm = subDoc?.inpMrtMonitorId
        wbmc = subDoc?.emrSetTitle
      } else {
        wblbdm = inpMrtMonitorId
        wbmc = emrSetTitle
      }
      //删除动作无需另外传参
      if (code !== 399574305 && structuralData) {
        //传主诉和现病史内容
        structuralData?.sectionData?.forEach(v => {
          if (
            v.inpEmrSectionWinId == '390000201' ||
            v.inpEmrSectionWinId == '390000202'
          ) {
            wddsj.push({
              wdddm: v.inpEmrSectionWinId,
              wddmc: v.inpatEmrSectionName,
              wddnr: v.inpatEmrSectionPlainTxt
            })
          }
        })

        structuralData?.dataElementData?.forEach(v => {
          if (
            v.inpEmrDataElementWinId == '390000201' ||
            v.inpEmrDataElementWinId == '390000202'
          ) {
            wddsj.push({
              wdddm: v.inpEmrDataElementWinId,
              wddmc: v.inpEmrDataElementName,
              wddnr: v.inpEmrDataElementValue
            })
          }
        })
      }

      const params = {
        header: {
          Authorization: Cookies.get('BEARER_TOKEN') || '',
          'W-SEQ': Cookies.get('W-SEQ') || 'default',
          'W-FLOW': Cookies.get('W-FLOW') || 'default'
        },
        body: [
          {
            resource: {
              resourceType: 'Encounter',
              id: encounterId
            }
          },
          {
            resource: {
              resourceType: 'EncounterType',
              id: '145235'
            }
          },
          {
            resource: {
              resourceType: 'Employee',
              id: employeeId
            }
          },
          {
            resource: {
              resourceType: 'EmrSet',
              id: emrSetId
            }
          },
          {
            resource: {
              wblbdm,
              wbmc,
              wbid: emrSetId,
              wddsj: wddsj.filter(v => v.wddnr)
            }
          }
        ]
      }
      const paramsStr = JSON.stringify(params)
      console.log('发送混合框架事件-cdss：', paramsStr)
      return new Promise((resolve, reject) => {
        try {
          window.winning &&
            window.winning.dispatchEvent(code, paramsStr, () => {})
          resolve(true)
        } catch (error) {
          reject(error)
          console.log('调用混合框架发送事件失败: ', error)
          this.$message.error('调用混合框架发送事件失败')
        }
      })
    },
    async saveClinicalnoteSign(caSignatureId) {
      const { encounterId } = this.currentPatientInfo
      console.log(this.clinicalnoteData)
      const res = await api.saveClinicalnoteSign({
        caSignatureId,
        encounterId,
        inpEmrSetId: this.currentDocId
      })
      console.log(res)
      if (res.success) {
        console.log('保存CA签名成功')
      }
    },

    //审签通过
    handleReviewPassAction: throttle(async function() {
      try {
        this.showClinicalnoteProcessing(true)
        const pgEditor = this.getEditor()
        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }
        await this.prohibitedWords.setProhibitedWords(this.currentDocId)
        await this.signClinicalnote(
          this.currentPatientInfo.employeeExpertiseWinId
        )
        await this.clinicalnoteReviewPassAsync()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()
        this.getClinicalnotePdf(5)
      } finally {
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),

    //审签退回(审签驳回)
    handleReviewDismissAction: throttle(async function() {
      try {
        const pgEditor = this.getEditor()
        this.showClinicalnoteProcessing(true)
        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }
        await this.updateBasicData() //更新患者基础数据
        await this.clinicalnoteReviewDismissAsync()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()
        this.getClinicalnotePdf(5)
      } finally {
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),

    //撤销审签
    handleRecallReviewAction: throttle(async function() {
      const pgEditor = this.getEditor()
      try {
        this.showClinicalnoteProcessing(true)
        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }
        await this.unSignClinicalnote(
          this.currentPatientInfo.employeeExpertiseWinId
        )
        await this.clinicalnoteRecallReviewAsync()
        //操作病历之后刷新病历列表与病历状态
        await this.actionsAfterOperatorClinicalnote()
        this.getClinicalnotePdf(3)
      } finally {
        this.showClinicalnoteProcessing(false)
      }
    }, 2000),

    //辅助区域向病历插入内容
    async handleAuxiliaryInfoInsert($event) {
      const pgEditor = this.getEditor()
      // isReplace,true代表替换，false代表插入
      let {
        type,
        isReplace,
        content,
        cptId,
        columnArr,
        alignParams, //表格对齐方式
        needColspan, //表格是否要合并单元格
        colSpanParams // 表格合并单元格的入参
      } = $event

      console.log($event, '###')
      if (this.isShowConsultationCreator) {
        return
      }
      //非当前激活的病历不更新
      if (
        this.currentDocId !==
        this.currentActiveLoadedClinicalnote.options.content.emrSetId
      ) {
        console.log('非当前激活的病历不更新')
        return
      }
      if (this.wrapOperationPermisstionData?.editable) {
        if (!this.verifyElementWinIdInsertInto()) {
          return
        }

        //cptId目前主要在既往病历插入选段落时才有
        if (cptId) {
          console.log('SetValue-cptId', cptId)
          pgEditor.pgEditorInstance.postmessage({
            type: 'SyncDataByTitle',
            param: [
              {
                docId: this.currentDocId,
                conceptId: cptId,
                srcStr: content,
                changeFlag: true,
                KeepTrace: true
              }
            ]
          })
        } else {
          if (isReplace && this.pgEditorCurrentInputInfo.xId) {
            //清空
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetValue',
              param: [
                {
                  conceptId: this.pgEditorCurrentInputInfo.xId,
                  value: '',
                  type: 'normal',
                  idType: 'XID',
                  valueType: 'text',
                  changeFlag: true,
                  paragraphFlag: true,
                  KeepTrace: false,
                  valueTarget: 'onlyDataElement'
                }
              ]
            })
          }
          if (type == 'text') {
            pgEditor.pgEditorInstance.postmessage({
              type: 'InsertString',
              param: [content, true]
            })
          } else if (type == 'xml') {
            pgEditor.pgEditorInstance.postmessage({
              type: 'InsertDoc',
              // param: [content, true, true]
              param: [
                {
                  srcStr: content, //插入的xml
                  removParagraphFlag: true, //是否移除最后换行符
                  isKeepTrace: true, //是否保留痕迹
                  // bussId: '', //业务id，标识插入的xml中的元素
                  // undoRelateId: '', //撤销id，用来撤销某次插入的标识
                  resetFontStyle: false, //是否重置样式
                  changeFlag: true, //是否变色
                  resetTitleToStr: true //把标题重置成文本的
                  // resetTitleDeletFlag: false//重置删除属性的
                }
              ]
            })
          } else if (type == 'table') {
            await pgEditor.pgEditorInstance.postmessage({
              type: 'InsertTableWithContent',
              param: [content]
            })

            //设置列宽
            const rn = pgEditor.pgEditorInstance.postmessage({
              type: 'TextTableResizeColumns',
              param: [
                {
                  //选填：文档Id,默认空即为全部文档均插入
                  docId: this.currentDocId,
                  //必填：概念Id/XID
                  innerEleID: content.CptID, //'startDate',//表格内任意一个元素的概念id或xid
                  /*"columnArr":[//选填
                        {
                            "colEleID":"",//选填：该列内任意一个元素的概念id或xid,若无则定位至对应索引值上
                            //若既不设置fixWidth也不设置surplusWidth,则该列会在所有未设置的列中均等剩余宽度
                            //fixWidth优先级高于surplusWidth
                        },
                        //-设置为"40px"或"40"或40,后该列将固定为40px
                        {"fixWidth":40,},
                        //-设置为"10font",后该列将固定为列中占位最大的[10个字符]的宽度
                        {"fixWidth":"10font",},
                        //-设置为"10%",后该列将固定为表格总宽的10%
                        {"fixWidth":"10%",},
                        //-仅可设置百分数,将在剩余的宽度里占据百分比
                        {"surplusWidth":"40%"},
                        //-特别的:所有列至少会维持列内占位最大的1个字符的宽度,设置过小的列宽将不被实现且维持真实最小宽度
                    ]*/
                  columnArr
                }
              ]
            })
            console.log('TextTableResizeColumns:', rn)
            if (alignParams) {
              alignParams?.map(item => {
                item.docId = this.currentDocId
              })
              //设置居中
              const rn2 = pgEditor.pgEditorInstance.postmessage({
                type: 'SetTableAlign',
                param: alignParams
              })

              console.log('SetTableAlign', rn2)
            }
            if (needColspan) {
              colSpanParams?.map(item => {
                item.docId = this.currentDocId
              })
              pgEditor.pgEditorInstance.postmessage({
                type: 'UpdateBase',
                param: colSpanParams
              })
            }
          }
        }
      } else {
        this.$message({
          message: '当前病历不可编辑！',
          type: 'warning'
        })
      }
    },

    /* 设置hasSignature的值 判断提交是否需要签名
     * 目前只有病历提交时允许不签名 病历审签流程必须签名
     */
    setHasSignature(
      cptId = DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
    ) {
      let {
        content: { inpMrtMonitorId, inpatEmrSetStatusCode }
      } = this.clinicalnoteData
      //未提交病历
      if (isDraftStatus(inpatEmrSetStatusCode)) {
        //如果当前是手术记录且签名域不为手术医生签名 防止handleSurgicalRecordSignature方法进入死循环
        if (
          inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD &&
          this.surgicalRecordsReviewConfig == '2' &&
          cptId !== '399323838'
        ) {
          this.handleSurgicalRecordSignature()
          return
        }
      } else {
        //修正手术记录的撤销签名是手术医生签名
        if (
          inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD &&
          this.surgicalRecordsReviewConfig == '2'
        ) {
          cptId = '399323838'
        } else {
          return
        }
      }

      this.hasSignature = this.pgEditor.signatureHelper.isNeedsSignature(
        this.currentDocId,
        cptId
      )
    },
    //针对手术记录是否为手术医生提交确定是否需要签名
    handleSurgicalRecordSignature(e) {
      //手术医生概念id域
      if (e && e.CptID !== '399336909') return
      let {
        content: { inpMrtMonitorId }
      } = this.clinicalnoteData
      //手术记录标志
      if (inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD) {
        const pgEditor = this.getEditor()
        let surgicalDoctorEle = pgEditor.pgEditorInstance.postmessage({
          type: 'GetElementListWithAttr',
          param: [
            {
              docId: this.currentDocId,
              conceptId: '399336909' //手术医生概念域
            }
          ]
        })
        console.log('手术记录-手术医生：', surgicalDoctorEle)
        if (
          surgicalDoctorEle?.length &&
          surgicalDoctorEle[0]?.valueList?.length
        ) {
          surgicalDoctorEle = surgicalDoctorEle[0].valueList[0]
          if (surgicalDoctorEle?.value?.length) {
            //当前登录医生是手术医生则签名  不是则不签名且走指定医师签名流程
            if (surgicalDoctorEle.value[0] == this.userInfo.employeeId) {
              this.setHasSignature('399323838') //手术医生签名域
              return
            }
          }
        }
        this.hasSignature = false
      }
    },
    verifyElementWinIdInsertInto() {
      // UserEditable:false
      // cptId:"391004206"
      // docId:"1627634105489"
      // docName:null
      // inputType:"text"
      // isInTable:true
      // xId:"xid-1631784386612-3899"
      let {
        UserEditable,
        cptId,
        inputType,
        isInTable,
        CurIsImage
      } = this.pgEditorCurrentInputInfo

      if (cptId) {
        let signatureCptList = [...txtSignatureDataArray, ...signatureDataArray]
        if (!UserEditable) {
          this.$message({
            message: '该内容区域不可编辑！',
            type: 'warning'
          })
          return false
        } else if (inputType !== 'text') {
          this.$message({
            message: '非文本区域不可插入！',
            type: 'warning'
          })
          return false
        } else if (cptId == DataElementWinIds.CONTINUOUS_TITLE_INPUT) {
          this.$message({
            message: '病程标题不可插入！',
            type: 'warning'
          })
          return false
        } else if (signatureCptList.includes(cptId)) {
          this.$message({
            message: '签名区域不可插入！',
            type: 'warning'
          })
          return false
        } else {
          const basicWinIdList =
            this.basicsDataElement?.data?.map(r => r.conceptId) || []
          if (basicWinIdList.includes(cptId) && isInTable) {
            this.$message({
              message: '患者基本信息区域不可插入！',
              type: 'warning'
            })
            return false
          }
        }
        return true
      } else if (CurIsImage) {
        this.$message({
          message: '签名区域不可插入！',
          type: 'warning'
        })
        return false
      }
      return true
    },
    /*向后端单独提交病程的标题、时间等信息
     * mergeObj:通过左侧弹窗修改病程标题时间后的参数
     */
    async sendingDataSourceInformation(isSerial, emrSetId, mergeObj) {
      let obj = {
        inpatEmrSetId: emrSetId,
        encounterId: this.currentPatientInfo.encounterId
      }

      if (mergeObj) {
        Object.assign(obj, mergeObj)
      } else {
        if (isSerial) {
          const pgEditor = this.getEditor()
          let docElements = pgEditor?.pgEditorInstance.postmessage({
            type: 'GetElementListWithAttr',
            param: [{ docId: emrSetId }]
          })

          let list = docElements[0].valueList
          for (let i = 0; i < list.length; i++) {
            if (DataElementWinIds.CONTINUOUS_CREATEDAT_INPUT == list[i].cptId) {
              //修改病程时间
              if (list[i].value === '病程日期时间') {
                list[i].value = ''
              }
              obj.inpatEmrSetFileTime = list[i].DateTimeValue ?? ''
            } else if (
              DataElementWinIds.CONTINUOUS_TITLE_INPUT == list[i].cptId
            ) {
              obj.inpatEmrSetTitle = list[i].value.replace(/\s/g, ' ')
              obj.inpatEmrSetListTitle = list[i].value.replace(/\s/g, ' ')
              obj.inpEmrDoctorId = this.AllConfigure?.changeList?.doctorId
            }
          }
        }
      }

      const { success, data } = await api.updateCourseTimeAndTitle(obj)
      if (success && data) {
        console.log('向后台发送其他数据源信息成功', data)
      } else {
        return Promise.reject('保存错误')
      }
    },
    //诊断信息更新提示
    async tipsForUpdateDiagnosisInfo() {
      //有编辑权限和内容已提交过才提示
      if (
        this.wrapOperationPermisstionData?.editable &&
        this.clinicalnoteData.content.hasContent
      ) {
        const { success, data } = await api.getDiagnosisList({
          encounterId: this.currentPatientInfo.encounterId
        })
        if (success && data?.length) {
          let modifiedAt = this.clinicalnoteData.content.modifiedAt
          let typeSet = new Set()

          data.forEach(v => {
            if (v.modifiedAt) {
              let _modifiedAt = new Date(v.modifiedAt).getTime()
              //将最近更新的诊断类型存起来
              if (_modifiedAt > modifiedAt) {
                typeSet.add(v.diagnosisTypeName)
              }
            }
          })
          if (typeSet.size > 0) {
            let str = ''
            for (let i of typeSet) {
              str += `、${i}`
            }
            this.$message({
              message: `患者的${str.substr(1)}信息已发生变更，请查阅.`,
              type: 'warning',
              duration: 5000
            })
          }
        }
      }
    },
    //自动保存判断
    async whetherAutoSave() {
      const pgEditor = this.getEditor()
      if (this.mode !== DcEditorRenderModes.SET_WORK_MODE_APP) {
        return {
          status: false,
          message: '非编辑模式不处理'
        }
      }

      //病历阅改进入不判断
      if (this.isReview) {
        return { status: false, message: '当前在病历阅改' }
      }
      let data = pgEditor?.pgEditorInstance.postmessage({
        type: 'DocHasChanged',
        param: []
      })
      console.log(data)
      if (this.clinicalnoteData.serial) {
        //去掉没有权限的
        for (let i = 0; i < data?.length; i++) {
          let jurisdiction = this.loadedSubDocList
            .find(item => item.id == data[i].docId)
            ?.permission.permissionVOList?.some(
              item =>
                item.appPermissionId ==
                  this.operationActionPermisstionIds.SNASER && item.enabled
            )
          if (!jurisdiction) {
            data.splice(i, 1)
            i--
          }
        }
        if (data.length) {
          return {
            status: true,
            saveDocIdList: data,
            message: '当前操作的病历内容发生改变(连续病程)'
          }
        } else {
          return {
            status: false,
            message: '当前操作的病历内容未发生改变(连续病程)'
          }
        }
      } else {
        let operatingAuthorization = !this.isDisableBtnById(
          this.operationActionPermisstionIds.SNASER
        )
        if (data?.length && operatingAuthorization) {
          return {
            status: true,
            message: '当前操作的病历内容发生改变(普通病历)'
          }
        } else {
          return {
            status: false,
            message: '当前操作的病历内容未发生改变或者没有暂存权限(普通病历)'
          }
        }
      }
    },
    //关闭当前病历判断是否保存
    handleTabRemove(id, fn) {
      const { serial } = this.clinicalnoteData
      if (
        this.currentDocId == id ||
        (id == this.currentPatientInfo.encounterId + '121383422926546946' &&
          serial)
      ) {
        //因隐藏时关闭无法获取内容比较或者获取的内容有问题所以只对当前激活的窗口进行提示
        console.log('当前显示的窗口', this.clinicalnoteData.content)
        let operatingAuthorization = !this.isDisableBtnById(
          this.operationActionPermisstionIds.SNASER
        )
        if (!operatingAuthorization) {
          fn()
          return
        }
        this.whetherAutoSave().then(res => {
          if (res.status) {
            clearInterval(this.autosaveTiming)
            this.$confirm('当前输入的内容未保存,请先暂存后再关闭', '提示框', {
              distinguishCancelAndClose: true,
              confirmButtonText: '保存',
              cancelButtonText: '暂不保存',
              type: 'warning'
            })
              .then(async () => {
                await this.handleAutoSaveAction(res.saveDocIdList)
                fn()
              })
              .catch(action => {
                if (action === 'cancel') {
                  fn()
                } else {
                  this.setAutosaveTiming()
                }
              })
          } else {
            console.log(res.message)
            fn()
          }
        })
      }
    },
    async setCurrentPatientInfo(data) {
      console.log('当前修改的是:', data, this.currentDocId)
      if (
        data.encounterId !== this.currentPatientInfo.encounterId ||
        data.triggerOrigin !== 'patientEdit'
      )
        return
      if (
        this.currentActiveLoadedClinicalnote.options.content.emrSetId !==
        this.currentDocId
      )
        return
      console.log(
        '当前修改的是:',
        this.currentDocId,
        '2',
        this.clinicalnoteData.content.emrStatusCode
      )
      const res = await api.QUERY_CASE_STATUS({
        inpatientEmrSetId: this.clinicalnoteData.content.emrSetId
      })
      let inpatEmrSetStatusCode = res.data.inpatEmrSetStatusCode
      if (isDraftStatus(inpatEmrSetStatusCode)) {
        console.log('调用更新了')
        //未保存直接更新当前界面的患者信息
        this.updateBasicData()
        //更新本地基础数据
        let _res = await api.getPatientInformation({
          encounterId: this.currentPatientInfo.encounterId
        })

        if (_res && _res.success) {
          this.setInpatientInfo(_res.data || {})
        }
      } else {
        let _location = window.location.href
        if (_location.indexOf('inpatient/admissionNote') >= 0) {
          this.$alert('当前病历已提交，如需更新患者信息请先撤销提交.', '提示', {
            confirmButtonText: '确定'
          })
        }
      }
    },

    async handleControlPrintBtn(code) {
      console.log(
        code,
        '显示状态',
        this.clinicalnoteData.content.inpatEmrSetStatusCode,
        '主表状态'
      )

      if (isDraftStatus(this.clinicalnoteData.content.inpatEmrSetStatusCode)) {
        // 新建和草稿，不能打印
        this.toolbarOptions.isEmrSubmited = false
      } else {
        this.toolbarOptions.isEmrSubmited = true
      }
      //病历打印
      // let print = await api.getPrintVisible({
      //   inpEmrSetIds: [this.clinicalnoteData.content.emrSetId]
      // })
      // if (this.toolbarOptions.isEmrSubmited) {
      //   console.log('是否可以打印', print.data[0]?.printFlag)
      //   this.toolbarOptions.isEmrSubmited = print.data[0]?.printFlag
      // }
    },
    handleControlAnnotationBtn() {
      if (this.clinicalnoteData.serial) {
        this.toolbarOptions.annotationStatus = true
      } else {
        this.toolbarOptions.annotationStatus = this.operationPermisstionData?.editable
      }
    },
    //提交等操作之后需要重新获取病历的状态并更新状态
    async handleRefreshClinicalnoteForStatus(inpatientEmrSetId) {
      inpatientEmrSetId = inpatientEmrSetId || this.currentDocId
      let clinicalnoteData = await this.getNormalClinicalnoteContent(
        inpatientEmrSetId
      )

      console.log(
        '提交等操作之后需要重新获取病历的状态并更新状态',
        clinicalnoteData,
        inpatientEmrSetId
      )
      if (this.clinicalnoteData.serial) {
        //更新单份病程数据
        let subDoc = this.loadedSubDocList.find(v => v.id == inpatientEmrSetId)
        Object.assign(subDoc, clinicalnoteData)
      }
      //更新病历数据
      Object.assign(this.clinicalnoteData.content, clinicalnoteData)
      this.tagImageByClinicalnoteStatus(inpatientEmrSetId)
    },
    //操作病历之后刷新病历列表与病历状态
    async actionsAfterOperatorClinicalnote(emrSetId) {
      emrSetId = emrSetId || this.currentDocId
      //控制数据组是否隐藏或显示
      this.controlsDataSourcesVisibility(
        this.clinicalnoteData.serial ? this.currentDocId : ''
      )
      await this.controlClinicalnoteContentStateAsync(emrSetId)
      //重新获取病历的状态并设置状态图片
      await this.handleRefreshClinicalnoteForStatus(emrSetId)

      //右键同步病历数据菜单
      this.setRightMenuSyncClinicalnoteData()

      //更新clinicalnoteData中的xml防止病历克隆内容有问题
      this.updatexmlContent(emrSetId)

      //重新获取树结构和时间轴结构列表
      if (this.activateMenu === 'emr_list') {
        this.$root.eventHub.$emit('clinicalnote/refreshTimeLineData')
      } else {
        this.$root.eventHub.$emit('clinicalnote/refreshTreeData')
      }
    },
    setAutosaveTiming() {
      let autoTimeData = this.AllConfigure?.data?.find(el => {
        return el.inpatEmrParamConfigCode === 'COMMON003'
      })
      if (!autoTimeData) return
      console.log('自动保存时间是：', autoTimeData.inpatEmrParamConfigContent)
      this.autosaveTiming = setInterval(() => {
        if (this.preservationStatus) {
          this.whetherAutoSave().then(res => {
            if (res.status) {
              this.handleAutoSaveAction(res.saveDocIdList)
            } else {
              console.debug(res.message)
            }
          })
        }
      }, autoTimeData?.inpatEmrParamConfigContent * 1000)
    },
    async insertPageNum() {
      const pgEditor = this.getEditor()
      let AssociatParam = []
      if (this.clinicalnoteData.serial) {
        this.loadedSubDocList.forEach(v => {
          let isNewPage =
            v?.printConfig?.printMode == '399542540' ||
            v?.printConfig?.printMode == '399542541'
          let isNewPageNum = v?.printConfig?.firstPageNumberFlag == '98175'
          if (isNewPage && isNewPageNum) {
            AssociatParam.push(v.id)
          }
        })
      }

      await pgEditor?.insertPageNum(AssociatParam)
    },

    //将已经变动的文档重置成没有改动的状态
    handleResetXDocsChanged(emrSetId, type) {
      const pgEditor = this.getEditor()
      let param = []
      if (type == 'update') {
        param.push({ docId: emrSetId })
      } else {
        if (this.clinicalnoteData.serial) {
          this.loadedSubDocList.forEach(v => {
            param.push({ docId: v.id })
          })
        } else {
          param.push({ docId: this.currentDocId })
        }
      }
      const { serial } = this.clinicalnoteData
      //将已经变动的文档重置成没有改动的状态
      pgEditor.pgEditorInstance.postmessage({
        type: 'ResetXDocsChanged',
        param: serial ? param : ''
      })
    },
    async pgHandleAutomaticGeneration() {
      const pgEditor = this.getEditor()
      let ks = this.orgInfo?.orgName
      let zs = this.getInputFieldText()
      let disease = []
      //页面还没请求过诊断数据
      if (!this.hasGetDiagnosisFlag) {
        await this.getAllDiagnosisInfo()
      }
      //优先初步诊断 991323 ，其次入院诊断 256916，都没有的话再传门诊诊断 98202
      if (this.allDiagnosisInfo.length) {
        if (this.diagnosisListInAllType[991323]?.length) {
          this.diagnosisListInAllType[991323].forEach(v => {
            disease.push(v.diagnosisDesc)
          })
        } else if (this.diagnosisListInAllType[256916]?.length) {
          this.diagnosisListInAllType[256916].forEach(v => {
            disease.push(v.diagnosisDesc)
          })
        } else if (this.diagnosisListInAllType[98202]?.length) {
          this.diagnosisListInAllType[98202].forEach(v => {
            disease.push(v.diagnosisDesc)
          })
        }
      }

      api
        .xbsAutoGenerate({
          disease,
          ks,
          zs
        })
        .then(res => {
          function findTargetValueSet(key, value) {
            console.log('key -------- ', key, value)
            const valueSets = res.data.result[key]
            let targetValueSet = null
            if (key === 'symptom') {
              targetValueSet = valueSets
            } else {
              valueSets.forEach(setItem => {
                Object.keys(setItem).forEach(setKey => {
                  const values = setItem[setKey]
                  if (values) {
                    const valueIndex = values.indexOf(value)
                    if (valueIndex >= 0) {
                      targetValueSet = values
                    }
                  }
                })
              })
            }

            return targetValueSet
          }
          if (res?.success) {
            if (res?.data?.result) {
              let {
                generation
                // attribute, check, drug, operation, symptom, zs_sym
              } = res.data.result

              const valueSetNames = [
                'attribute',
                'check',
                'drug',
                'operation',
                'symptom',
                'zs_sym'
              ]

              // '从昨天开始呕吐，吃不下饭，高烧并精神状态不佳,精神萎靡。{胸部CT检查}提示:{肺内阴影待查}。现患者为行进一步治疗，来我院就诊。患者本次发病以来，。'

              // let resultArr = generation.split(/{|}/)
              let resultArr = generation.split(/({[^}]*})/)
              console.log('resultArr', resultArr)
              let selectedValue = ''
              for (let i = 0; i < resultArr.length; i++) {
                const text = resultArr[i]
                if (/{.*}/.test(text)) {
                  // 花括号

                  const colonIndex = text.indexOf(':')
                  let listItems = []
                  if (colonIndex < 0) {
                    // 如果下一个花括号的内容是symptom，那么这个花括号的内容就是有无
                    const nextText = resultArr.find((_text, _i) => {
                      return /{.*}/.test(_text) && _i > i
                    })
                    if (nextText.indexOf(':symptom') >= 0) {
                      selectedValue = '有'
                      listItems = ['有', '无'].map(item => {
                        return {
                          Text: item,
                          Value: item,
                          Level: '0',
                          Key: item
                        }
                      })
                      console.log('match 3 --------- ', listItems)
                    } else {
                      const matchResult = text.match(/^{(.*)}$/)
                      console.log('match 1 --------- ', matchResult)
                      selectedValue = matchResult[1]
                      if (matchResult) {
                        listItems.push({
                          Text: matchResult[1],
                          Value: matchResult[1],
                          Level: '0',
                          Key: matchResult[1]
                        })
                      }
                      console.log('match 1 --------- ', listItems)
                    }
                  } else {
                    //
                    const matchResult = text.match(/^{(.*):(.*)}$/)
                    let valueSet = null
                    if (matchResult) {
                      const text = matchResult[1]
                      const type = matchResult[2]
                      selectedValue = text

                      if (valueSetNames.indexOf(type) < 0) {
                        // 普通数据
                        valueSet = findTargetValueSet('attribute', text)
                        if (!valueSet) {
                          valueSet = findTargetValueSet('zs_sym', text)
                        }
                      } else {
                        // 需要到特定集合里面去查询数据
                        valueSet = findTargetValueSet(type, text)
                      }

                      console.log('match 2 --------- ', text, type)
                      if (valueSet) {
                        console.log('value set --------- ', valueSet)
                        // check, disease, symptom, operation
                        // 进一步
                        listItems = valueSet
                          .map(item => {
                            return {
                              Text: item,
                              Value: item,
                              Level: '0',
                              Key: item
                            }
                          })
                          .filter(item => {
                            return item.Text != text
                          })

                        listItems.push({
                          Text: text,
                          Value: text,
                          Level: '0',
                          Key: text
                        })
                      }
                    }
                    console.log('match 2 --------- ', listItems)
                  }

                  pgEditor.pgEditorInstance.postmessage({
                    type: 'InsertSingleChoiceDropEle',
                    param: [
                      {
                        elementCode: '', //元素编码
                        elementName: '下拉', //元素名称
                        dataEmementCode: '', //数据元编码
                        dataEmementName: '残疾情况代码', //数据元名称
                        conceptDomainCode: '', //概念域ID
                        backgroundText: selectedValue, //背景文本
                        // tooltipText: '提示文本',//提示文本
                        defaultText: selectedValue, //默认值

                        activateWay: 'MouseClick', //激活方式

                        // labelText: '前缀',//元素前缀
                        // suffixText: '后缀',
                        expressionInput: selectedValue, //表达式
                        expressionInput_name: '',
                        emptyFlag: true, //可为空
                        readFlag: false, //只读
                        deleteFlag: true, //可删除
                        printFlag: true, //是否打印
                        skipFlag: true, //是否自动跳入下一元素
                        borderFlag: true, //显示边框
                        // sexJudge: '50602',//性别
                        // minAge: 9,//最小年龄
                        // maxAge: 40,//最大年龄
                        // placeNum: 6,//占位个数
                        underlineFlag: false, //启用下划线
                        addFlag: false, //追加
                        keyFlag: false, //允许键盘输入
                        valueList: listItems
                      }
                    ]
                  })
                } else {
                  if (text) {
                    // 普通字符
                    pgEditor.pgEditorInstance.postmessage({
                      type: 'InsertString',
                      param: [text]
                    })
                  }
                }
              }
            }
          }
        })
    },
    //获取主诉内容
    getInputFieldText() {
      const pgEditor = this.getEditor()
      const mainSuitInput = pgEditor.pgEditorInstance.postmessage({
        type: 'GetValue',
        param: {
          conceptId: DataElementWinIds.MAIN_SUIT_INPUT, //概念id
          valueType: 'text',
          buttonIconFlag: true,
          paragraphFlag: true,
          valueTarget: 'onlyDataElement'
        }
      })
      return mainSuitInput[0].value
    },
    PgEditHandle(message) {
      const pgEditor = this.getEditor()
      this.PgEditAudio(message, pgEditor, this.currentDocId)
    },
    handleSaveAdmissionNoteByAudio(name) {
      if (
        this.currentClincalnote.indexOf(name) > -1 &&
        this.currentActiveLoadedClinicalnote.options.content.emrSetTitle.indexOf(
          name
        ) > -1
      ) {
        this.handleSaveAction(this.currentDocId)
      }
    },
    handleSubmitAdmissionNoteByAudio(name) {
      if (
        this.currentClincalnote.indexOf(name) > -1 &&
        this.currentActiveLoadedClinicalnote.options.content.emrSetTitle.indexOf(
          name
        ) > -1
      ) {
        this.handleSubmitAction()
      }
    },
    handleCancelSubmitAdmissionNoteByAudio(name) {
      if (
        this.currentClincalnote.indexOf(name) > -1 &&
        this.currentActiveLoadedClinicalnote.options.content.emrSetTitle.indexOf(
          name
        ) > -1
      ) {
        this.handleRecallSubmitAction()
      }
    },
    setSubstituteSignature(imgUrl) {
      const pgEditor = this.getEditor()
      let IsImgBase64 = isBase64(imgUrl)
      if (!IsImgBase64) {
        imgUrl = encodeURI(imgUrl)
      }
      pgEditor.pgEditorInstance.postmessage({
        type: 'InsertImageStream',
        param: {
          base64: imgUrl,
          IsImgBase64,
          width: 60,
          height: 30
        }
      })
    },
    setTag(data) {
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'SetForeColor',
        param: [data.SignColor] //必须是六位，不能简写
      })
    },
    removeTag() {
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'SetForeColor',
        param: ['#000000'] //必须是六位，不能简写
      })
    },
    openAnnotationView() {
      const pgEditor = this.getEditor()
      let status = pgEditor.pgEditorInstance.postmessage({
        type: 'GetCommentStatus',
        param: []
      })
      if (
        this.currentDocId ==
        this.currentActiveLoadedClinicalnote.options.content.emrSetId
      ) {
        if (this.mode !== DcEditorRenderModes.SET_WORK_MODE_APP) {
          this.$message({
            message: '请在编辑模式下开启批注功能',
            type: 'warning'
          })
          return
        }
        // if (
        //   this.operationPermisstionData.editable ||
        //   this.clinicalnoteData.serial
        // ) {
        //   pgEditor.switchContentRenderMode(
        //     DcEditorRenderModes.SET_WORK_MODE_APP
        //   )
        // } else {
        //   this.$message({
        //     message: '您没有当前病历的批注权限',
        //     type: 'warning'
        //   })
        //   return
        // }
      }
      setTimeout(() => {
        console.log('关闭批注', status)
        this.closeTheNotation(!status)
      })
    },
    addAnnotation() {
      const pgEditor = this.getEditor()
      let status = pgEditor.pgEditorInstance.postmessage({
        type: 'GetCommentStatus',
        param: []
      })

      if (!status) {
        this.$message({
          message: '请先开启批注功能',
          type: 'warning'
        })
        return
      }
      if (
        this.currentDocId ==
        this.currentActiveLoadedClinicalnote.options.content.emrSetId
      ) {
        if (this.operationPermisstionData.editable) {
          const pgEditor = this.getEditor()
          pgEditor.pgEditorInstance.postmessage({
            type: 'AddComment',
            param: ''
          })
        } else {
          this.$message({
            message: '您没有当前病历的批注权限',
            type: 'warning'
          })
        }
      }
    },
    async closeTheNotation(status) {
      const pgEditor = this.getEditor()
      //默认进来就关闭批注模式
      pgEditor.pgEditorInstance.postmessage({
        type: 'ToggleCommentStatus',
        param: [{ status }]
      })
    },

    async upDateVersion(data, isPdf, option) {
      let [{ inpatEmrRecordId }] = await this.getVersions([
        data.data.inpatEmrSetId
      ])
      console.log('新版本号', inpatEmrRecordId, isPdf, option)
      if (isPdf) {
        this.getClinicalnotePdf(option)
      }
      if (this.clinicalnoteData.serial) {
        let Activation = this.loadedSubDocList.find(
          el => el.id == data.data.inpatEmrSetId
        )
        Activation.inpatEmrRecordId = inpatEmrRecordId
        console.log(Activation, '改了后kk')
      } else {
        this.clinicalnoteData.content.inpatEmrRecordId = inpatEmrRecordId
        console.log(this.clinicalnoteData, '改了后kk')
      }
    },
    PrintpreviewClick() {
      console.log('kkk', +new Date() - this.clickTime)
      let time = +new Date()
      if (time - this.clickTime < 150 && this.timeFlag) {
        console.log('双击')
        if (this.clinicalnoteData.serial) {
          // if (this.$refs.dcEditor.ctl.IsPrintPreview()) {
          this.$message({
            message: '该病历正处于预览模式中，若要编辑请先切换到编辑模式',
            type: 'warning'
          })
          // }
        } else {
          if (this.operationPermisstionData.editable) {
            this.$message({
              message: '该病历正处于预览模式中，若要编辑请先切换到编辑模式',
              type: 'warning'
            })
          }
        }
      }
      this.clickTime = time
      this.timeFlag = !this.timeFlag
    },
    setHeaderTitle() {
      let docIdList = this.loadedSubDocList
        .filter(el => el.mrtEditorTypeCode == '399461576')
        .map(ele => ele.id)
      if (!docIdList.length) return
      let xml = this.clinicalnoteData.content.blankXml
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'InsertXTextHeader',
        param: [
          {
            xml,
            docIdList
          }
        ]
      })
      // 给头填充默认数据
      this.updateBasicData(true, '', true)
    },
    async setCheckBoxNum(e) {
      // 181121796631140302  VTE评估量表
      if (
        this.clinicalnoteData.content.inpMrtMonitorId !==
        inpMrtMonitorIdEnum.VTE_PGLB
      )
        return

      const pgEditor = this.getEditor()
      let sum = +e.value
      console.log(sum, '--------------------')
      let param = [
        {
          conceptId: '399443148',
          value: '',
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false,
          KeepTrace: false
        }
      ]
      if (e._cptid !== '399317398') return
      if (!sum) {
        console.log('清空')
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param
        })
        return
      }
      const res = await api.getRiskGrade({
        deptId: this.orgInfo.orgId,
        totalScore: sum
      })
      console.log(res)

      if (res.data.resultFlag) {
        console.log('设置成高风险', param)
        param[0].value = '399283497'

        pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param
        })
        if (!this.vteMessageFlag) {
          this.$message({
            message: '请填写出血风险评估单',
            type: 'warning'
          })
        }
        this.vteMessageFlag = true
      } else {
        console.log('清空')
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param
        })
        this.vteMessageFlag = false
      }
    },
    async tagImageByClinicalnoteStatus(id) {
      let param = []
      if (this.clinicalnoteData.serial) {
        if (id) {
          let emrStatusCode = this.loadedSubDocList.find(v => v.id == id)
            ?.emrStatusCode
          param.push({
            docId: id,
            statusImage: TagImage[emrStatusCode]
          })
        } else {
          param = this.loadedSubDocList.map(v => {
            return {
              docId: v.id,
              statusImage: TagImage[v?.emrStatusCode]
            }
          })
        }
      } else {
        let emrStatusCode = this.clinicalnoteData?.content?.emrStatusCode
        param = [
          { docId: this.currentDocId, statusImage: TagImage[emrStatusCode] }
        ]
      }
      console.log(param, 'param%%%%')
      await this.preLoadTagImage(param)
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'SetDocStatusImage',
        param
      })
    },
    //状态图标预加载--防止状态图标重影
    async preLoadTagImage(list) {
      let imgList = Array.from(new Set(list.map(v => v.statusImage)))
      return new Promise(resolve => {
        let loadNum = 0
        for (let i = 0; i < imgList.length; i++) {
          const img = new Image()
          img.setAttribute('crossOrigin', 'Anonymous')
          img.src = imgList[i]
          img.onload = async () => {
            loadNum++
            if (loadNum == imgList.length) {
              resolve(true)
            }
          }
          img.onerror = () => {
            resolve(false)
          }
        }
      })
    },
    handleHoverParagraphEvent(params) {
      this.dialogCollVisible = true
      this.$nextTick(() => {
        this.$refs.DialogColl.checkSelectionRef({
          innerText: params.ParagraphTxt,
          XML: params.xml,
          Labels: [
            {
              CptID: params.cid
            }
          ]
        })
      })
    },

    async handleLoadClinicalnoteListAction(id) {
      let {
        contentList,
        topContent
      } = await this.getClinicalnoteContentListByIds(id)
      console.log(contentList, topContent)

      if (!this.clinicalnoteData.content.blankXml && topContent) {
        this.clinicalnoteData.content.blankXml = topContent
      }
      //有些病历模板有问题  导致整个病程不能加载
      if (!contentList.length) return

      //获取病程的最近修改时间
      let lastModifiedAt = this.clinicalnoteData.content.modifiedAt
      contentList.forEach(v => {
        if (v.modifiedAt) {
          let _modifiedAt = new Date(v.modifiedAt).getTime()
          if (_modifiedAt > lastModifiedAt) {
            lastModifiedAt = _modifiedAt
            this.clinicalnoteData.content.modifiedAt = lastModifiedAt
          }
        }
      })

      let list = this.loadedSubDocList
      let docId = undefined //只有在已打开的病程列表里插入一份新病历  才需要docId
      if (list.length) {
        docId = contentList[0].id
        //插入一份病程（新增或更新位置）
        console.time('测试插入病程加载速度-----')
        let index = await this.insertSubDocsAction(contentList[0])
        console.timeEnd('测试插入病程加载速度-----')
        /*每次插入病程之后  矫正分页参数  开始*/
        this.setDocNewPage(contentList[0], list[index])
      } else {
        console.time('测试连续病程加载速度-----')
        await this.loadSerialClinicalnoteXmlAsync(contentList)
        console.timeEnd('测试连续病程加载速度-----')
        list.push(...contentList)
        //给历史都昌病历加上头
        this.setHeaderTitle()
        //每次进来关闭批注
        this.closeTheNotation()
      }
      //控制模板上的某些内容是否可见
      this.controlsDataSourcesVisibility(docId)
      //设置病历的状态
      this.tagImageByClinicalnoteStatus(docId)
      //校验文档必填字段
      this.verifyDoc(true)
      //水印
      this.getEditor().setWaterMark()
      //关闭loading
      this.showClinicalnoteProcessing(false)
      //页码
      this.insertPageNum()
      //激活子文档为当前正在编辑的文档
      this.setCurrentSubDocActive(false)
      //若病历已归档，设置不可编辑状态
      if (this.isInForbiddenState) {
        //定位子病程位置
        this.relocateSubDocById(this.currentDocId)
        return
      }

      if (docId) {
        //初始化系统数据（机构名等页眉页脚及基础数据）
        this.updateBasicData(false, docId)

        this.updateDiagnosis({
          diagnosis: null,
          docId: docId,
          KeepTrace: false
        })
      } else {
        //初始化系统数据（机构名等页眉页脚及基础数据）
        this.updateBasicData()

        //诊断插入
        this.injectDiagnosisInSieralClinicalnoteAsync()
      }

      this.setQrCodeContent()

      //生命体征
      this.injectUpdateVitalSignsDataListAsync(docId)
      //缺省值及记录时间填充
      this.injectDefaultDataForSerialClinicalnoteAsync(docId)
      //智能联动
      this.insertSerialClinicalnoteQuickInputData(docId)

      this.fillingFuncs = new FillingFuncsForSerialClinicalnote(this)
      this.fillingFuncs.init(docId)
      //测试2
      // pgEditor.pgEditorInstance.ContinueMRefreshDocsView()
      console.log('测试2结束')
      //继承的组件通过该方法执行自己的逻辑
      this.aloneEvent && this.aloneEvent()
    },

    //加载所有连续病程
    async loadSerialClinicalnoteXmlAsync(list) {
      const pgEditor = this.getEditor()
      const appendSubDocs = () => {
        let options = []
        for (let index = 0; index < list.length; index++) {
          let item = list[index]
          if (item.xml) {
            const option = {
              docId: item.id,
              srcstr: item.xml,
              newPage: item.newPage,
              isEditable: item.permission?.editable
            }
            options.push(option)
          }
        }
        console.log('连续病历子文档插入---------', options, options.length)
        pgEditor.pgEditorInstance.postmessage({
          type: 'OpenAndAppendDoc',
          param: options
        })
      }

      const load = (cb = () => {}) => {
        pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
          cb()
        })
        appendSubDocs()
      }

      if (!pgEditor?.pgEditorLoaded) {
        await pgEditor.waitEditorLoaded()
      }
      await cb2promise(cb => {
        load(cb)
      })
    },
    /*插入一份病程*/
    async insertSubDocsAction(subDoc) {
      if (!subDoc?.xml) return
      const pgEditor = this.getEditor()
      this.loadedSubDocList.push(subDoc)
      this.sortLoadedSubDocList()
      let index = this.loadedSubDocList.findIndex(el => el.id == subDoc.id)
      console.log(index, 'index+++++')
      const appendSubDocs = async () => {
        let param = {
          docId: subDoc.id,
          srcstr: subDoc.xml,
          isEditable: subDoc.permission?.editable,
          newPage:
            this.loadedSubDocList[index - 1]?.nextNewPage || subDoc.newPage,
          index,
          fixed: true
        }

        await pgEditor.pgEditorInstance.postmessage({
          type: 'FileAppend',
          param: [param]
        })
      }

      await appendSubDocs()
      console.log(subDoc.inpatEmrSetFileTime, subDoc.emrSetTitle, '加载完了')
      return index
    },
    setDocNewPage(prevDoc, doc) {
      const pgEditor = this.getEditor()
      let param = []
      //后一份
      if (doc && !doc.newPage && prevDoc?.nextNewPage) {
        param.push({
          docId: doc.id,
          newPage: true
        })
      }

      if (param.length) {
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetDocNewPage',
          param
        })
      }
    },
    /*
     * 获取连续病程内容
     * inpatientEmrSetId   当前点击的连续病程id
     * inpEmrSetIds        inpEmrSetIds为空则获取所有病程内容   不为空则获取指定病程内容
     */
    async getClinicalnoteContentListByIds(
      inpatientEmrSetId,
      inpEmrSetIds = []
    ) {
      if (this.loadedSubDocList.length && !inpEmrSetIds.length) {
        inpEmrSetIds = [inpatientEmrSetId]
      }
      //当前病历id确定  立即请求权限
      await this.controlClinicalnoteContentStateAsync(inpatientEmrSetId)
      let res = await apiGetInpatientClinicalnoteContentSerial({
        encounterId: this.currentPatientInfo.encounterId,
        inpEmrSetIds,
        inpatientEmrSetId,
        inpatEmrTypeId: '121383422926546946', //病程记录
        ...this.PublicParameters
      }).catch(() => {
        this.closeCaseHistory(inpatientEmrSetId)
      })
      const {
        data: { inpatientEMRVOList, topContent }
      } = res

      let contentList = []
      const PrintModes = {
        CONTINUOUS_PRINT: '399542537', // 续打
        ALONE_PRINT: '399542538', // 单页打
        CONTINUOUS_NEW_PAGE_PRINT: '399542540', // 续打（新页打）
        CONTINUOUS_SINGLE_PAGE_PRINT: '399542541' // 续打（单独打）
      }
      if (inpatientEMRVOList?.length) {
        for (let index = 0; index < inpatientEMRVOList.length; index++) {
          let item = inpatientEMRVOList[index]
          // let printConfig = item.printOutputVO
          // let printMode = printConfig ? printConfig.printMode : ''
          // let isNewPage = false
          // let nextNewPage = false

          // switch (printMode) {
          //   case PrintModes.CONTINUOUS_PRINT: //续打
          //     isNewPage = false
          //     nextNewPage = false
          //     break
          //   case PrintModes.ALONE_PRINT: //单页打  --一般病程不设置单页打
          //     isNewPage = false
          //     nextNewPage = false
          //     break
          //   case PrintModes.CONTINUOUS_NEW_PAGE_PRINT: //续打（新页打）
          //     isNewPage = true
          //     nextNewPage = false
          //     break
          //   case PrintModes.CONTINUOUS_SINGLE_PAGE_PRINT: //续打（单独打）
          //     isNewPage = true
          //     nextNewPage = true
          //     break
          //   default:
          //     isNewPage = false
          //     nextNewPage = false
          // }

          let xml = ''

          if (item?.inpatientEMRContentVO?.inpatEmrContentData) {
            xml = decompress(item.inpatientEMRContentVO.inpatEmrContentData)
          }
          let contentObj = {
            id: item.inpatEmrSetId,
            emrSetId: item.inpatEmrSetId,
            emrSetTitle: item.inpatEmrSetTitle,
            inpatientMrtId: item.inpatientMrtId,
            inpMrtMonitorId: item.inpMrtMonitorId,
            xml,
            createdAt: item.createdAt,
            inpatEmrSetFileTime: item.inpatEmrSetFileTime,
            hasContent: item.inpatEmrSetStatusCode !== '960074',
            modifiedAt: item.modifiedAt ?? 0, //病历上次修改时间
            inpatEmrRecordId: item.inpatEmrRecordId,
            isFirstCourse: item.isFirstCourse,
            emrStatusCode:
              item.inpEmrDisplayStatusCode || item.inpatEmrSetStatusCode, //病历当前状态 用于控制病历状态图标
            inpatEmrSetStatusCode: item.inpatEmrSetStatusCode,
            // printConfig,
            permission: {
              editable:
                item.sealedStatus != '399572897' && //病案-已封存
                item.casePrintStatus != '399572894', //病案-已打印,
              permissionVOList: []
            },
            // newPage:
            //   contentList[index - 1]?.nextNewPage ||
            //   isNewPage ||
            //   //封存
            //   (contentList[index - 1]?.emrStatusCode == '399572897' &&
            //   item.inpEmrDisplayStatusCode !== '399572897' && //连续的两个封存病历不另外新起一页
            //     this.isNewPageAfterSafeKeeping),
            // nextNewPage,
            mrtEditorTypeCode: item?.inpatientEMRContentVO?.mrtEditorTypeCode,
            sealedStatus: item.sealedStatus, //399572897 表示病历封存
            casePrintStatus: item.casePrintStatus, //399572894 表示病历已打印
            caseSpecialPermissionStatus: item.caseSpecialPermissionStatus //399576453 已打印特批状态
          }

          //xml为空会导致病程打不开  需过滤掉
          if (contentObj.xml) {
            contentList.push(contentObj)
          }
        }
      }

      console.log(123444)
      const printArrs = await this.getPrintConfigInfo(contentList)
      contentList.forEach((item, index) => {
        printArrs.map(print => {
          if (item.inpMrtMonitorId == print.inpMrtMonitorId) {
            item.printConfig = print
            let printMode = item.printConfig ? item.printConfig.printMode : ''
            let isNewPage = false
            let nextNewPage = false

            switch (printMode) {
              case PrintModes.CONTINUOUS_PRINT: //续打
                isNewPage = false
                nextNewPage = false
                break
              case PrintModes.ALONE_PRINT: //单页打  --一般病程不设置单页打
                isNewPage = false
                nextNewPage = false
                break
              case PrintModes.CONTINUOUS_NEW_PAGE_PRINT: //续打（新页打）
                isNewPage = true
                nextNewPage = false
                break
              case PrintModes.CONTINUOUS_SINGLE_PAGE_PRINT: //续打（单独打）
                isNewPage = true
                nextNewPage = true
                break
              default:
                isNewPage = false
                nextNewPage = false
            }
            item.newPage =
              contentList[index - 1]?.nextNewPage ||
              isNewPage ||
              //封存
              (contentList[index - 1]?.emrStatusCode == '399572897' &&
              item.inpEmrDisplayStatusCode !== '399572897' && //连续的两个封存病历不另外新起一页
                this.isNewPageAfterSafeKeeping)
            item.nextNewPage = nextNewPage
          }
        })
      })
      let topXml = ''
      if (topContent) {
        topXml = decompress(topContent)
      }

      return {
        contentList,
        topContent: topXml
      }
    },

    //获取打印配置
    async getPrintConfigInfo(contentList) {
      const inpMrtMonitorIdList = contentList.map(item => {
        return item.inpMrtMonitorId
      })
      const res = await api.queryPrintConfigInfo({
        inpMrtMonitorIdList
      })
      return res.data
    },
    sortLoadedSubDocList() {
      let list = this.loadedSubDocList
      //病程按时间排序
      list.sort((a, b) => {
        return a.inpatEmrSetFileTime > b.inpatEmrSetFileTime ? 1 : -1
      })
      // 首程排最前面
      let firstIndex = list.findIndex(v => {
        return v.isFirstCourse
      })
      if (firstIndex > 0) {
        list.unshift(list.splice(firstIndex, 1)[0])
      }
    },
    /*
     *getNormalClinicalnoteContent只获取病历内容 请勿添加其他逻辑
     */
    async getNormalClinicalnoteContent(inpatientEmrSetId) {
      console.log('获取病历内容~~~~')
      inpatientEmrSetId = inpatientEmrSetId ?? this.currentDocId
      //当前病历id确定  立即请求权限
      await this.controlClinicalnoteContentStateAsync(inpatientEmrSetId)
      let res = await apiGetInpatientClinicalnoteContent({
        inpatientEmrSetId
      }).catch(() => {
        this.closeCaseHistory(inpatientEmrSetId)
      })
      if (!res.data) return
      const {
        data: { inpatientEMRSetOutputDTO, inpatientEMRContentDTO }
      } = res
      let xml = ''
      if (inpatientEMRContentDTO?.inpatEmrContentData) {
        xml = decompress(inpatientEMRContentDTO.inpatEmrContentData)
      }
      return {
        emrSetId: inpatientEMRSetOutputDTO.inpatEmrSetId,
        emrSetTitle: inpatientEMRSetOutputDTO.inpatEmrSetTitle,
        emrTypeId: inpatientEMRSetOutputDTO.inpatEmrTypeId,
        inpatientMrtId: inpatientEMRSetOutputDTO.inpatientMrtId,
        inpMrtMonitorId:
          inpatientEMRSetOutputDTO?.inpMrtMonitorId ??
          inpatientEMRSetOutputDTO?.inpatientMrtTypeId,
        hasContent: inpatientEMRSetOutputDTO.inpatEmrSetStatusCode !== '960074',
        modifiedAt: inpatientEMRSetOutputDTO.modifiedAt,
        xml,
        inpatEmrRecordId: inpatientEMRSetOutputDTO?.inpatEmrRecordId,
        emrStatusCode:
          inpatientEMRSetOutputDTO?.inpEmrDisplayStatusCode ||
          inpatientEMRSetOutputDTO?.inpatEmrSetStatusCode,
        inpatEmrSetStatusCode: inpatientEMRSetOutputDTO?.inpatEmrSetStatusCode,
        mrtEditorTypeCode: inpatientEMRContentDTO?.mrtEditorTypeCode,
        inpEmrDoctorId: inpatientEMRSetOutputDTO?.inpEmrDoctorId,
        sealedStatus: inpatientEMRSetOutputDTO.sealedStatus, //399572897 表示病历封存
        casePrintStatus: inpatientEMRSetOutputDTO.casePrintStatus, //399572894 表示病历已打印
        caseSpecialPermissionStatus:
          inpatientEMRSetOutputDTO.caseSpecialPermissionStatus //399576453 已打印特批状态
      }
    },

    //设置编辑器右键菜单-病历克隆  只有从病历主界面打开  且对应文书的监控类型有克隆权限才设置
    setRightMenuCloneClinicalnote() {
      const pgEditor = this.getEditor()
      const qiankunConfig = this?.$root?.$options?.qiankunConfig
      if (qiankunConfig?.componentName == 'AdmissionNote') {
        let cloneMonitorTypeConfig = this.AllConfigure?.data?.find(el => {
          return el.inpatEmrParamConfigCode === 'COMMON033'
        })

        if (cloneMonitorTypeConfig) {
          let cloneMonitorTypeList = cloneMonitorTypeConfig.inpatEmrParamConfigContent.split(
            ','
          )
          let inpMrtMonitorId = this?.clinicalnoteData?.content?.inpMrtMonitorId
          if (inpMrtMonitorId) {
            let _index = cloneMonitorTypeList.findIndex(
              v => v == inpMrtMonitorId
            )
            if (_index >= 0) {
              pgEditor.pgEditorInstance.updateRightMenu([
                {
                  menu: '病历克隆',
                  menuId: 'emrCloneMenu',
                  icon: 'emr-icon-additionalCopy',
                  workMode: 'bothEditBrowse',
                  callback: () => this.handleClinicalnoteClone()
                }
              ])
              return
            }
          }
        }
      }
      //删除病历克隆菜单
      pgEditor.pgEditorInstance.updateRightMenu([
        {
          removeMenu: ['emrCloneMenu']
        }
      ])
    },

    //病历克隆
    handleClinicalnoteClone() {
      if (this.clinicalnoteData.serial) {
        let currentSubDoc = this.loadedSubDocList.find(
          v => v.id == this.currentDocId
        )
        let {
          emrSetTitle,
          inpatientMrtId,
          inpMrtMonitorId,
          inpEmrDoctorId,
          xml
        } = currentSubDoc
        this.cloneClinicalnoteData = {
          emrSetId: this.currentDocId,
          content: {
            inpatEmrSetListTitle: emrSetTitle,
            inpatEmrSetTitle: emrSetTitle,
            inpatEmrTypeId: this.clinicalnoteData.content.emrTypeId,
            inpatientMrtId,
            inpMrtMonitorId,
            inpEmrDoctorId,
            xml
          }
        }
      } else {
        let {
          emrSetTitle,
          emrTypeId,
          inpatientMrtId,
          inpMrtMonitorId,
          inpEmrDoctorId,
          xml
        } = this.clinicalnoteData.content
        this.cloneClinicalnoteData = {
          emrSetId: this.currentDocId,
          content: {
            inpatEmrSetListTitle: emrSetTitle,
            inpatEmrSetTitle: emrSetTitle,
            inpatEmrTypeId: emrTypeId,
            inpatientMrtId,
            inpMrtMonitorId,
            inpEmrDoctorId,
            xml
          }
        }
      }
    },

    updatexmlContent(emrSetId) {
      const pgEditor = this.getEditor()
      const xml = pgEditor.pgEditorInstance.postmessage({
        type: 'FileSave',
        param: [{ docId: emrSetId }]
      })[0]?.xml
      if (this.clinicalnoteData.serial) {
        let currentSubDoc = this.loadedSubDocList.find(v => v.id == emrSetId)
        currentSubDoc.xml = xml
      } else {
        this.clinicalnoteData.content.xml = xml
      }
    },

    //设置编辑器右键菜单-同步病历数据  未提交的病历才能同步病历数据
    setRightMenuSyncClinicalnoteData() {
      //未配置右键菜单则返回
      if (!this.isSyncEmrDefaultData) return
      const pgEditor = this.getEditor()
      let {
        content: { inpatEmrSetStatusCode },
        serial
      } = this.clinicalnoteData
      if (isDraftStatus(inpatEmrSetStatusCode)) {
        pgEditor.pgEditorInstance.updateRightMenu([
          {
            menu: '同步病历数据',
            menuId: 'SyncEmrDataMenu',
            icon: 'emr-icon-importReport',
            callback: () => {
              if (serial) {
                this.injectDefaultDataForSerialClinicalnoteAsync(
                  this.currentDocId,
                  true
                )
              } else {
                this.injectDefaultDataForClinicalnoteAsync(true)
              }
            }
          }
        ])
      } else {
        //删除编辑器右键菜单-同步病历数据
        pgEditor.pgEditorInstance.updateRightMenu([
          {
            removeMenu: ['SyncEmrDataMenu']
          }
        ])
      }
    },

    async getVersions(inpatEmrSetIds) {
      let { data } = await medicalRecordInformation.getVersions({
        inpatEmrSetIds
      })
      return data
    },
    //关闭
    closeCaseHistory(emrSetId) {
      this.$refs.pgEditorDom.$children[0] &&
        (this.$refs.pgEditorDom.$children[0].loading = false)
      this.showClinicalnoteProcessing && this.showClinicalnoteProcessing(false)
      //病历操作报错，关闭病历（防止出现空白病历）
      this.actionsForDeletedClinicalnote(emrSetId)
    },
    //查询病历是否已被删除
    queryClinicalnoteDeleteMessage(emrSetId) {
      if (this.wsMessageList) {
        let el = this.wsMessageList.find(v => {
          return v.inpatEmrSetId == emrSetId
        })

        if (el) {
          this.preservationStatus = false //禁止自动保存
          /**
           * 住院病历主界面有缓存，可能存在隐藏患者
           * 正在浏览的患者弹窗让医生确认
           * 隐藏患者静默处理
           *
           */
          if (
            getCurrentPatientInfo()?.encounterId ==
            this.currentPatientInfo?.encounterId
          ) {
            this.$alert(el.memo, '提示', {
              confirmButtonText: '确定',
              callback: () => {
                this.actionsForDeletedClinicalnote(emrSetId)
              }
            })
          } else {
            this.actionsForDeletedClinicalnote(emrSetId)
          }
        }
      }
    },
    //针对已删除的病历应做的处理
    actionsForDeletedClinicalnote(emrSetId) {
      //1.刷新导航
      if (this.activateMenu === 'emr_list') {
        this.$root.eventHub.$emit('clinicalnote/refreshTimeLineData')
      } else {
        this.$root.eventHub.$emit('clinicalnote/refreshTreeData')
      }
      // 1.关闭病历
      if (this.clinicalnoteData.serial) {
        //连续病程
        this.handleDeleteInSerialClinicalnote({
          id: this.editorId,
          subDocId: emrSetId
        })
      } else {
        //普通病历
        this.eventHubHelper.emit(
          ClinicalnoteEditorEventKeys.HANDLE_CLOSE_CLINICALNOTE,
          this.editorId,
          'delete'
        )
      }
    }
  }
}
</script>

<style lang="scss">
.pango-editor-statusBar {
  display: none !important;
}
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
    display: flex;
    justify-content: flex-end;
    width: 100%;
    flex: 0 0 48px;
    box-sizing: border-box;
    background-color: white;
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
}
.deleteDialog {
  .el-dialog__wrapper {
    position: absolute;
  }
  .v-modal {
    position: absolute;
  }
}
</style>
