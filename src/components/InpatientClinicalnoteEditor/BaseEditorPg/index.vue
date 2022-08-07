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
  </div>
</template>

<script>
const ClassNameSpace = 'inpatient-clinicalnote-editor'
import { EditorEvent } from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
import { decompress } from './utils'
import PgEditor from '@/libs/PgEditor'
import { data1 } from './textData'
export default {
  name: '',
  components: { PgEditor },
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
  data() {
    return {
      currentPatientInfo: {},
      userInfo: {},
      orgInfo: {},
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
      isRelocate: true, //判断是否需要重定位（点击病历内容切换子文档时不需要重定位）
    }
  },
  computed: {
    currentDocId() {
      return this.clinicalnoteData.content.emrSetId.replace('readonly', '')
    },
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
        editable: false,
        permissionVOList: [],
      }
    },
  },
  watch: {},
  created() {
    console.log('来了created')
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
    console.log('清掉', this.currentDocIdWatch)
    this.currentDocIdWatch()
  },
  mounted() {},
  methods: {
    getEditor() {
      return this.$refs.pgEditorDom
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
        editable: false,
        permissionVOList: [],
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
    //获取单份病历的状态及权限
    async queryClinicalnotePermissionAsync() {
      return {
        editable: true,
        permissionVOList: [],
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
