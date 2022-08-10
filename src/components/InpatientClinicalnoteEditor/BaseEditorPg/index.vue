<template>
  <div :class="classNames.EditorArea">
    <div ref="editorContainer" :class="classNames.EditorWrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :userInfo="userInfo"
        :orgInfo="orgInfo"
        :toolbarOptions="toolbarOptions"
      />
    </div>
    <div :key="permisstionKey" :class="classNames.EditorOperation">
      <editorButton
        v-if="isShowBtnById(operationActionPermisstionIds.SNASER)"
        :disabled="isDisableBtnById(operationActionPermisstionIds.SNASER)"
        :operationActionPermisstionId="operationActionPermisstionIds.SNASER"
        :emrSetId="clinicalnoteData.content.emrSetId"
        buttonName="暂 存"
        @buttonClick="handleSaveAction(clinicalnoteData.content.emrSetId)"
      ></editorButton>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { throttle } from '@/utils/index'
import {
  compress,
  decompress,
  formulaElementTypes,
  getFormulaElementListWithAttr,
} from './utils'
const ClassNameSpace = 'inpatient-clinicalnote-editor'
import editorButton from '../../EditorButton/index'
import {
  txtSignatureDataArray,
  signatureDataArray,
} from '../../../libs/PgEditor/helper/signature_helper'
const { mapMutations: componentsMapMutations, mapState: componentsMapStates } =
  createNamespacedHelpers('components/multiClinicalnoteBoardState')
import { inpMrtMonitorIdEnum } from '@/utils/enumerate'
import {
  EditorEvent,
  DcEditorRenderModes,
  DataElementWinIds,
} from '@/libs/PgEditor/constants'
import getEventHubHelper from '@/utils/event_hub_helper.js'
import { cb2promise } from '@/utils/convertFunction'
import PgEditor from '@/libs/PgEditor'
import { data1, data2 } from './textData'
import { createEventKeyWithNamespace } from '@/utils/event_hub_helper.js'
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
  ),
}
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

  QUALITY_SNASER: '399573160', //质控暂存
}
export default {
  name: '',
  components: { PgEditor, editorButton },
  props: {
    clinicalnoteData: {
      type: Object,
      default: function () {
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
            paragraphIds: [],
          },
        }
      },
    },
  },
  inject: ['patientRootComponent'],
  data() {
    return {
      userInfo: {},
      orgInfo: {},
      preservationStatus: true,
      toolbarOptions: {
        isEmrSubmited: true,
        isShowRenderModeRadios: false,
        annotationStatus: true,
        isShow: true,
        isDisableWorkMode: false,
      },
      operationPermisstionData: {
        editable: false,
        permissionVOList: [],
      },
      autoSaveLoading: false,
      permisstionKey: '',
      isRelocate: true, //判断是否需要重定位（点击病历内容切换子文档时不需要重定位）
    }
  },
  computed: {
    currentPatientInfo() {
      return this.patientRootComponent.currentPatientInfo
    },
    currentDocId() {
      return this.clinicalnoteData.content.emrSetId.replace('readonly', '')
    },
    ...componentsMapStates(['pgEditorCurrentInputInfo']),
    //已加载的病程
    loadedSubDocList() {
      return this.clinicalnoteData.content.list ?? []
    },
    classNames() {
      return {
        EditorArea: `${ClassNameSpace}-area`,
        EditorWrap: `${ClassNameSpace}-wrap`,
        EditorOperation: `${ClassNameSpace}-operation`,
      }
    },
    wrapOperationPermisstionData() {
      return {
        editable: true,
        permissionVOList: [{ appPermissionId: ['399297352'], enabled: true }],
      }
    },
    operationActionPermisstionIds() {
      return OperationActionPermisstionIds
    },
  },
  watch: {
    'currentActiveLoadedClinicalnote.options.content.emrSetId': {
      handler(newVal) {
        if (newVal) {
          //清空存储的当前聚焦的输入域
          this.setPgEditorCurrentInputInfo({})
        }
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    console.log('来了created')
    this.eventHubHelper = getEventHubHelper(this.patientRootComponent.eventHub)
    this.currentDocIdWatch = this.$watch(
      'currentDocId',
      this.currentDocIdHandler,
      {
        deep: true,
        immediate: true,
      }
    )
  },
  beforeDestroy() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDocumentClick
    )
    this.eventHubHelper.destroy()
    console.log('清掉', this.currentDocIdWatch)
    this.currentDocIdWatch()
  },
  mounted() {
    //辅助区域向病历编辑器插入内容
    console.log(this.$root.eventHub)
    this.eventHubHelper.on(
      'AuxiliaryInfo/Insert',
      this.handleAuxiliaryInfoInsert
    )
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDocumentClick
    )
    this.eventHubHelper.on(
      ClinicalnoteEditorEventKeys.MEDICAL_RECORDS_BEFORE_DELETION,
      this.handleTabRemove
    )
  },
  methods: {
    ...componentsMapMutations([
      'showClinicalnoteProcessing',
      'setPgEditorCurrentInputInfo',
    ]),
    isShowBtnById(id) {
      return !!this.wrapOperationPermisstionData.permissionVOList.find(
        (item) => {
          return item.appPermissionId == id
        }
      )
    },
    getEditor() {
      return this.$refs.pgEditorDom
    },
    handleDocumentClick(e) {
      console.log(e, '点击啊点击')
      //切换子文档
      // if (this.clinicalnoteData.serial) {
      //   const subDocId = e.docInfo.docId
      //   if (subDocId !== this.currentDocId) {
      //     this.isRelocate = false
      //     this.setCurrentEmrSetSerialId(subDocId)
      //   }
      // }
      // if (this.mode !== DcEditorRenderModes.SET_WORK_MODE_APP) {
      //   return
      // }
      //将当前聚焦的输入域信息存起来方便辅助区域插值使用
      this.setPgEditorCurrentInputInfo({
        CurIsImage: e.CurIsImage,
        ...e.docInfo,
        ...e.inputInfo,
      })
      // this.setPatientInformation(e)
    },
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
        colSpanParams, // 表格合并单元格的入参
      } = $event
      console.log($event, '###')
      // if (this.isShowConsultationCreator) {
      //   return
      // }
      //非当前激活的病历不更新
      // console.log(
      //   this.currentDocId,
      //   this.patientRootComponent.currentActiveLoadedClinicalnote.options
      //     .content.emrSetId,
      //   'kkkkkkkkkkkkkkkkkk'
      // )

      if (
        this.currentDocId !==
        this.patientRootComponent.currentActiveLoadedClinicalnote.options
          .content.emrSetId
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
                KeepTrace: true,
              },
            ],
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
                  valueTarget: 'onlyDataElement',
                },
              ],
            })
          }
          if (type == 'text') {
            pgEditor.pgEditorInstance.postmessage({
              type: 'InsertString',
              param: [content, true],
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
                  resetTitleToStr: true, //把标题重置成文本的
                  // resetTitleDeletFlag: false//重置删除属性的
                },
              ],
            })
          } else if (type == 'table') {
            await pgEditor.pgEditorInstance.postmessage({
              type: 'InsertTableWithContent',
              param: [content],
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
                  columnArr,
                },
              ],
            })
            console.log('TextTableResizeColumns:', rn)
            if (alignParams) {
              alignParams?.map((item) => {
                item.docId = this.currentDocId
              })
              //设置居中
              const rn2 = pgEditor.pgEditorInstance.postmessage({
                type: 'SetTableAlign',
                param: alignParams,
              })

              console.log('SetTableAlign', rn2)
            }
            if (needColspan) {
              colSpanParams?.map((item) => {
                item.docId = this.currentDocId
              })
              pgEditor.pgEditorInstance.postmessage({
                type: 'UpdateBase',
                param: colSpanParams,
              })
            }
          }
        }
      } else {
        this.$message({
          message: '当前病历不可编辑！',
          type: 'warning',
        })
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
      let { UserEditable, cptId, inputType, CurIsImage } =
        this.pgEditorCurrentInputInfo

      if (cptId) {
        let signatureCptList = [...txtSignatureDataArray, ...signatureDataArray]
        if (!UserEditable) {
          this.$message({
            message: '该内容区域不可编辑！',
            type: 'warning',
          })
          return false
        } else if (inputType !== 'text') {
          this.$message({
            message: '非文本区域不可插入！',
            type: 'warning',
          })
          return false
        } else if (cptId == DataElementWinIds.CONTINUOUS_TITLE_INPUT) {
          this.$message({
            message: '病程标题不可插入！',
            type: 'warning',
          })
          return false
        } else if (signatureCptList.includes(cptId)) {
          this.$message({
            message: '签名区域不可插入！',
            type: 'warning',
          })
          return false
        }
        // else {
        //   const basicWinIdList =
        //     this.basicsDataElement?.data?.map((r) => r.conceptId) || []
        //   if (basicWinIdList.includes(cptId) && isInTable) {
        //     this.$message({
        //       message: '患者基本信息区域不可插入！',
        //       type: 'warning',
        //     })
        //     return false
        //   }
        // }
        return true
      } else if (CurIsImage) {
        this.$message({
          message: '签名区域不可插入！',
          type: 'warning',
        })
        return false
      }
      return true
    },
    async saveClinicalnoteContentAsync(isShowProcess = true, inpatEmrSetId) {
      inpatEmrSetId = inpatEmrSetId || this.currentDocId
      isShowProcess && this.showClinicalnoteProcessing(true)
      const params = await this.getBtnActionParams(inpatEmrSetId)
      if (!params) return
      console.log(params)
    },
    async currentDocIdHandler(v) {
      console.log('---laole', v)
      if (!v) return
      const { clinicalnoteData } = this
      //每次切换病历  将弹窗状态重置
      if (clinicalnoteData.serial) {
        let _index = this.loadedSubDocList.findIndex((el) => {
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
    //定位到某个子病程
    relocateSubDocById(subDocId) {
      console.log('relocateSubDocById--------', subDocId)
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'LocateCursorWithDocId',
        param: [{ docId: subDocId }],
      })
    },
    //病程切换
    setCurrentSubDocActive() {
      let subDocId = this.currentDocId
      if (!subDocId) return
      //定位子病程位置
      if (this.isRelocate) {
        this.relocateSubDocById(subDocId)
      }
      this.isRelocate = true

      let subDoc = this.loadedSubDocList.find((v) => v.id == subDocId)
      Object.assign(this.clinicalnoteData.content, subDoc)

      subDoc.permission = this.wrapOperationPermisstionData
      this.operationPermisstionData = {
        editable: true,
        permissionVOList: [{ appPermissionId: ['399297352'] }],
      }
    },
    setDocNewPage(prevDoc, doc) {
      const pgEditor = this.getEditor()
      let param = []
      //后一份
      if (doc && !doc.newPage && prevDoc?.nextNewPage) {
        param.push({
          docId: doc.id,
          newPage: true,
        })
      }

      if (param.length) {
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetDocNewPage',
          param,
        })
      }
    },
    async handleLoadClinicalnoteListAction(id) {
      let { contentList, topContent } =
        await this.getClinicalnoteContentListByIds(id)
      console.log(contentList, topContent)

      if (!this.clinicalnoteData.content.blankXml && topContent) {
        this.clinicalnoteData.content.blankXml = topContent
      }
      //有些病历模板有问题  导致整个病程不能加载
      if (!contentList.length) return

      //获取病程的最近修改时间
      let lastModifiedAt = this.clinicalnoteData.content.modifiedAt
      contentList.forEach((v) => {
        if (v.modifiedAt) {
          let _modifiedAt = new Date(v.modifiedAt).getTime()
          if (_modifiedAt > lastModifiedAt) {
            lastModifiedAt = _modifiedAt
            this.clinicalnoteData.content.modifiedAt = lastModifiedAt
          }
        }
      })

      let list = this.loadedSubDocList
      if (list.length) {
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
      }
      //关闭loading
      this.showClinicalnoteProcessing(false)

      console.log('测试2结束')
    },
    sortLoadedSubDocList() {
      let list = this.loadedSubDocList
      //病程按时间排序
      list.sort((a, b) => {
        return a.inpatEmrSetFileTime > b.inpatEmrSetFileTime ? 1 : -1
      })
      // 首程排最前面
      let firstIndex = list.findIndex((v) => {
        return v.isFirstCourse
      })
      if (firstIndex > 0) {
        list.unshift(list.splice(firstIndex, 1)[0])
      }
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
              isEditable: item.permission?.editable,
            }
            options.push(option)
          }
        }
        console.log('连续病历子文档插入---------', options, options.length)
        pgEditor.pgEditorInstance.postmessage({
          type: 'OpenAndAppendDoc',
          param: options,
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
      await cb2promise((cb) => {
        load(cb)
      })
    },
    /*插入一份病程*/
    async insertSubDocsAction(subDoc) {
      if (!subDoc?.xml) return
      const pgEditor = this.getEditor()
      this.loadedSubDocList.push(subDoc)
      this.sortLoadedSubDocList()
      let index = this.loadedSubDocList.findIndex((el) => el.id == subDoc.id)
      console.log(index, 'index+++++')
      const appendSubDocs = async () => {
        let param = {
          docId: subDoc.id,
          srcstr: subDoc.xml,
          isEditable: subDoc.permission?.editable,
          newPage:
            this.loadedSubDocList[index - 1]?.nextNewPage || subDoc.newPage,
          index,
          fixed: true,
        }

        await pgEditor.pgEditorInstance.postmessage({
          type: 'FileAppend',
          param: [param],
        })
      }

      await appendSubDocs()
      console.log(subDoc.inpatEmrSetFileTime, subDoc.emrSetTitle, '加载完了')
      return index
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
      let res = data2
      const {
        data: { inpatientEMRVOList, topContent },
      } = res

      let contentList = []
      // const PrintModes = {
      //   CONTINUOUS_PRINT: '399542537', // 续打
      //   ALONE_PRINT: '399542538', // 单页打
      //   CONTINUOUS_NEW_PAGE_PRINT: '399542540', // 续打（新页打）
      //   CONTINUOUS_SINGLE_PAGE_PRINT: '399542541', // 续打（单独打）
      // }
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
              permissionVOList: [],
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
            caseSpecialPermissionStatus: item.caseSpecialPermissionStatus, //399576453 已打印特批状态
          }

          //xml为空会导致病程打不开  需过滤掉
          if (contentObj.xml) {
            contentList.push(contentObj)
          }
        }
      }

      console.log(123444)
      // const printArrs = await this.getPrintConfigInfo(contentList)
      // contentList.forEach((item, index) => {
      //   printArrs.map((print) => {
      //     if (item.inpMrtMonitorId == print.inpMrtMonitorId) {
      //       item.printConfig = print
      //       let printMode = item.printConfig ? item.printConfig.printMode : ''
      //       let isNewPage = false
      //       let nextNewPage = false

      //       switch (printMode) {
      //         case PrintModes.CONTINUOUS_PRINT: //续打
      //           isNewPage = false
      //           nextNewPage = false
      //           break
      //         case PrintModes.ALONE_PRINT: //单页打  --一般病程不设置单页打
      //           isNewPage = false
      //           nextNewPage = false
      //           break
      //         case PrintModes.CONTINUOUS_NEW_PAGE_PRINT: //续打（新页打）
      //           isNewPage = true
      //           nextNewPage = false
      //           break
      //         case PrintModes.CONTINUOUS_SINGLE_PAGE_PRINT: //续打（单独打）
      //           isNewPage = true
      //           nextNewPage = true
      //           break
      //         default:
      //           isNewPage = false
      //           nextNewPage = false
      //       }
      //       item.newPage =
      //         contentList[index - 1]?.nextNewPage ||
      //         isNewPage ||
      //         //封存
      //         (contentList[index - 1]?.emrStatusCode == '399572897' &&
      //           item.inpEmrDisplayStatusCode !== '399572897' && //连续的两个封存病历不另外新起一页
      //           this.isNewPageAfterSafeKeeping)
      //       item.nextNewPage = nextNewPage
      //     }
      //   })
      // })
      let topXml = ''
      if (topContent) {
        topXml = decompress(topContent)
      }

      return {
        contentList,
        topContent: topXml,
      }
    },
    //获取单份病历的状态及权限
    async queryClinicalnotePermissionAsync() {
      return {
        editable: true,
        permissionVOList: [{ appPermissionId: ['399297352'], enabled: true }],
      }
    },
    handleControlAnnotationBtn() {
      if (this.clinicalnoteData.serial) {
        this.toolbarOptions.annotationStatus = true
      } else {
        this.toolbarOptions.annotationStatus =
          this.operationPermisstionData?.editable
      }
    },
    async controlClinicalnoteContentStateAsync() {
      this.operationPermisstionData =
        await this.queryClinicalnotePermissionAsync()
      this.permisstionKey = +new Date()
      this.handleControlAnnotationBtn()
    },
    /*
     *getNormalClinicalnoteContent只获取病历内容 请勿添加其他逻辑
     */
    async getNormalClinicalnoteContent(inpatientEmrSetId) {
      console.log('获取病历内容~~~~')
      inpatientEmrSetId = inpatientEmrSetId ?? this.currentDocId
      //当前病历id确定  立即请求权限
      await this.controlClinicalnoteContentStateAsync(inpatientEmrSetId)
      let res = data1
      if (!res.data) return
      const {
        data: { inpatientEMRSetOutputDTO, inpatientEMRContentDTO },
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
          inpatientEMRSetOutputDTO.caseSpecialPermissionStatus, //399576453 已打印特批状态
      }
    },

    async handleLoadClinicalnoteContentAction() {
      const { content } = this.clinicalnoteData
      let clinicalnoteData = await this.getNormalClinicalnoteContent()
      Object.assign(content, clinicalnoteData)
      if (!clinicalnoteData.xml) return
      console.time('测试普通病历加载速度-----')
      await this.loadClinicalnoteXmlAsync()
      console.timeEnd('测试普通病历加载速度-----')
      //填充二维码内容
      this.setQrCodeContent()
      const pgEditor = this.getEditor()
      //水印
      // pgEditor.setWaterMark().catch(() => {})

      console.log('设置光标位置到文档的最始 ---------- ')
      setTimeout(() => {
        pgEditor.pgEditorInstance.postmessage({
          type: 'LocateCursorWithDocId',
          param: [{}],
        })
        //获取以pango-editor-content-pgEditor开头的id dom
        // $('[id^="pango-editor-content-pgEditor"]')[0].scrollTo(0, 0) //解决新建手术记录页面没滚动到顶部问题
      }, 0)
    },
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
              param: [{ srcstr: content.xml, docId: this.currentDocId }],
            })
          } else {
            pgEditor.pgEditorInstance.postmessage({
              type: 'importMoreXml',
              param: {
                srcstr: content.xml,
                docId: this.currentDocId,
                topMargin: 0,
              },
            })
          }
        } else {
          pgEditor.pgEditorInstance.postmessage({
            type: 'FileOpen',
            param: [
              {
                srcstr: content.xml,
                docId: this.currentDocId,
              },
            ],
          })
        }
      }

      if (!pgEditor?.pgEditorLoaded) {
        await pgEditor.waitEditorLoaded()
      }

      await cb2promise((cb) => {
        load(cb)
      })
      console.log('jiazai wancheng ---------- ')
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
            value: `${this.currentPatientInfo.encounterId}|2|EMR|${inpMrtMonitorId}|${docId}|[%PageIndex%]`,
          },
        ],
      })
    },
    //自动暂存某一份病程时不一定是当前的病程
    handleSaveAction: throttle(async function (emrSetId, isShowProcess = true) {
      isShowProcess && this.showClinicalnoteProcessing(true)
      emrSetId = emrSetId || this.currentDocId
      const pgEditor = this.getEditor()
      try {
        //病程下的所有操作都要先切换成编辑模式
        if (this.clinicalnoteData.serial) {
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_APP
          )
        }

        await this.saveClinicalnoteContentAsync(isShowProcess, emrSetId)
      } finally {
        isShowProcess && this.showClinicalnoteProcessing(false)
        this.preservationStatus = true //允许自动保存
      }
    }, 1000),
    //按钮操作参数统一
    async getBtnActionParams(inpatEmrSetId) {
      let clinicalnoteContent = await this.getClinicalnoteContent(inpatEmrSetId)
      if (!clinicalnoteContent) {
        this.showClinicalnoteProcessing(false)
        console.error('住院病历前端-获取病历内容失败')
        return
      }
      const { base64Str, structuralData, inpEmrContentBodyData } =
        clinicalnoteContent

      if (!base64Str || !structuralData) {
        this.showClinicalnoteProcessing(false)
        console.error('住院病历前端-获取病历内容失败')
        return
      }
      let { serial, content } = this.clinicalnoteData
      let inpatEmrRecordId = content.inpatEmrRecordId
      if (serial) {
        inpatEmrRecordId = content.list.find(
          (el) => el.id == inpatEmrSetId
        )?.inpatEmrRecordId
      }
      const { bizRoleId, encounterId } = this.currentPatientInfo
      console.log(structuralData.dataElementData)
      //修正诊断和补充诊断存在多个概念id加了-后缀 需要去除，如399336691-0
      structuralData.dataElementData.forEach((item) => {
        item.inpEmrDataElementWinId = item.inpEmrDataElementWinId?.split('-')[0]
      })

      let {
        content: { inpMrtMonitorId },
      } = this.clinicalnoteData

      let operationBy = ''
      if (inpMrtMonitorId == inpMrtMonitorIdEnum.SSJLD) {
        let surgicalDoctorInfo = structuralData.dataElementData?.find((v) => {
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
          operationBy,
        },
        emrContentAddInfo: {
          inpEmrContentBodyData,
          inpatEmrContentData: base64Str,
        },
        emrSectionAddInfos: structuralData.sectionData,
        emrSectionDataElementAddInfos: structuralData.dataElementData,
      }
    },
    //获取病历内容
    async getClinicalnoteContent(inpatEmrSetId) {
      const pgEditor = this.getEditor()
      let param = inpatEmrSetId ? { docId: inpatEmrSetId } : {}
      let xml = ''
      if (this.clinicalnoteData.content.emrTypeId == '121383422926546950') {
        xml = pgEditor.pgEditorInstance.postmessage({
          type: 'SaveDocsAsXml',
          param: [],
        })
      } else {
        xml = pgEditor.pgEditorInstance.postmessage({
          type: 'FileSave',
          param: [param],
        })[0]?.xml
      }

      const inpEmrContentBodyData = pgEditor.pgEditorInstance.postmessage({
        type: 'FileSaveAsText',
        param: [Object.assign({ onlyChecked: true }, param)],
      })[0]?.text
      const structuralData = {
        sectionData: [],
        dataElementData: [],
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
          ),
        ],
      })
      structuralData.sectionData = sectionData.map((r) => ({
        inpatEmrSectionLevel: r.levelTerm,
        inpEmrSectionNo: r.cptId,
        inpatEmrSectionName: r.elementName,
        inpatEmrSectionDisplayName: r.showName,
        inpEmrSectionWinId: r.cptId,
        // inpEmrSectionConceptId: r.cptId,
        inpatEmrSectionPlainTxt: r.paragraphtext,
        inpEmrSectionContent: compress(r.xml),
      }))
      //元素
      const dataElementData = pgEditor.pgEditorInstance.postmessage({
        type: 'GetElementListWithAttr',
        param: [param],
      })
      console.log(dataElementData, 'dataElementData------')
      let dataElementDataFilter = []

      dataElementData.forEach((el) => {
        el.valueList.reverse().forEach((ele) => {
          if (ele.container === 'XTextBody') {
            //相同cpt的元素嵌套，返回最外层那一个父元素
            let _index = el.valueList.findIndex((v) => {
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
      dataElementDataFilter.forEach((el) => {
        if (formulaElementTypes.includes(el.type)) {
          dataElementDataFilter = [
            ...getFormulaElementListWithAttr(el),
            ...dataElementDataFilter,
          ]
        }
      })
      console.log(dataElementDataFilter, '2dataElementData------')

      structuralData.dataElementData = dataElementDataFilter
        .reverse() // 将上一次反转的数据修正
        .map((r) => {
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
            inpEmrSectionNo: r.titleCptId,
          }
        })
      if (!this.clinicalnoteData.content.emrTypeId == '121383422926546950') {
        //不是会诊就过滤空数据
        structuralData.dataElementData = structuralData.dataElementData?.filter(
          (v) => {
            return v.inpEmrDataElementValue && v.inpEmrDataElementWinId
          }
        )
      }

      const base64Str = compress(xml)

      console.log('编辑结果 ---------- ', {
        base64Str,
        structuralData,
        inpEmrContentBodyData,
        xml,
      })
      return {
        base64Str,
        structuralData,
        inpEmrContentBodyData,
        xml,
      }
    },
    isDisableBtnById(id) {
      return !this.wrapOperationPermisstionData.permissionVOList.find(
        (item) => {
          return item.appPermissionId == id && item.enabled
        }
      )
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

      console.log('保存', params)
      this.autoSaveLoading = false
    },
    async handleAutoSaveAction(saveDocIdList) {
      const clinicalnoteData = this.clinicalnoteData

      if (clinicalnoteData.serial) {
        for (let i = 0; i < saveDocIdList.length; i++) {
          await this.saveAutoClinicalnoteContentAsync(saveDocIdList[i].docId)
          // await this.sendingDataSourceInformation(true, saveDocIdList[i].docId) //其他数据源信息
        }
      } else {
        await this.saveAutoClinicalnoteContentAsync()
        // await this.sendingDataSourceInformation(
        //   false,
        //   this.currentActiveLoadedClinicalnote.options.content.emrSetId
        // ) //其他数据源信息
      }
      // //重新获取病历的状态并设置状态图片
      // this.handleRefreshClinicalnoteForStatus()
    },
    //自动保存判断
    async whetherAutoSave() {
      let {
        content: { modifiedAt, emrSetTitle },
      } = this.clinicalnoteData
      let title = emrSetTitle + modifiedAt
      const pgEditor = this.getEditor()
      if (!this.preservationStatus) {
        return {
          status: false,
          message: '当前正在保存禁止自动保存' + title,
        }
      }

      // if (this.mode !== DcEditorRenderModes.SET_WORK_MODE_APP) {
      //   return {
      //     status: false,
      //     message: '非编辑模式不处理' + title,
      //   }
      // }

      let docHasChangedData = pgEditor?.pgEditorInstance.postmessage({
        type: 'DocHasChanged',
        param: [],
      })
      let docHasChangedDataClone = JSON.parse(JSON.stringify(docHasChangedData))
      console.log(docHasChangedDataClone, 'docHasChangedDataClone')

      if (this.clinicalnoteData.serial) {
        //去掉没有权限的(离线病历都有权限注销)
        // for (let i = 0; i < docHasChangedDataClone?.length; i++) {
        //   let jurisdiction = this.loadedSubDocList
        //     .find((item) => item.id == docHasChangedDataClone[i].docId)
        //     ?.permission.permissionVOList?.some(
        //       (item) =>
        //         item.appPermissionId ==
        //           this.operationActionPermisstionIds.SNASER && item.enabled
        //     )
        //   if (!jurisdiction) {
        //     docHasChangedDataClone.splice(i, 1)
        //     i--
        //   }
        // }
        if (docHasChangedDataClone.length) {
          return {
            status: true,
            saveDocIdList: docHasChangedDataClone,
            message: '当前操作的病历内容发生改变(连续病程)',
          }
        } else {
          return {
            status: false,
            message: '当前操作的病历内容未发生改变(连续病程)',
          }
        }
      } else {
        let operatingAuthorization =
          this.isShowBtnById(this.operationActionPermisstionIds.SNASER) &&
          !this.isDisableBtnById(this.operationActionPermisstionIds.SNASER)
        if (docHasChangedDataClone?.length && operatingAuthorization) {
          return {
            status: true,
            message: '当前操作的病历内容发生改变(普通病历)' + title,
          }
        } else {
          return {
            status: false,
            message:
              '当前操作的病历内容未发生改变或者没有暂存权限(普通病历)' + title,
          }
        }
      }
    },
    //关闭当前病历判断是否保存
    handleTabRemove(id, fn, encounterId) {
      if (encounterId !== this.currentPatientInfo.encounterId) return
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

        this.whetherAutoSave().then((res) => {
          if (res.status) {
            this.$confirm('当前输入的内容未保存,请先暂存后再关闭', '提示框', {
              distinguishCancelAndClose: true,
              confirmButtonText: '保存',
              cancelButtonText: '暂不保存',
              type: 'warning',
            })
              .then(async () => {
                await this.handleAutoSaveAction(res.saveDocIdList)

                fn()
              })
              .catch((action) => {
                if (action === 'cancel') {
                  fn()
                } else {
                  // this.setAutosaveTiming()
                }
              })
          } else {
            console.log(res.message)
            fn()
          }
        })
      } else {
        fn()
      }
    },
  },
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
