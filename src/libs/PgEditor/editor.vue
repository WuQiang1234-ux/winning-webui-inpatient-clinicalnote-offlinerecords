<template>
  <div v-loading="loading" :class="classNames.editorWrap" class="widgets-container">
    <EditorToolbar />
    <div :id="pgEditorId" ref="pgEditor" :class="classNames.editorTarget" />
    <slot></slot>
    <!-- <allograph-dialog v-if="allographVisible" :dialogVisible.sync="allographVisible"></allograph-dialog> -->
  </div>
</template>

<script>
/* eslint-disable no-undef */
// import api from '@/api/list'
import $ from 'jquery'
import EditorToolbar from './editor_toolbar'
// import AllographDialog from './components/AllographDialog.vue'
import { ClassNamespace, EditorEvent, DataElementWinIds } from './constants'
import mixins from './mixins'
import { createNamespacedHelpers, mapState } from 'vuex'
import getEventHubHelper from '@/utils/event_hub_helper.js'
const { mapState: clinicalnoteMapStates } = createNamespacedHelpers('emr')
const { mapState: globalConfigMapStates, mapActions: globalConfigActions } =
  createNamespacedHelpers('globalConfig')
export default {
  name: 'Editor',
  components: { EditorToolbar },
  mixins: [mixins.getInjectMixin()],
  props: {
    patientInfo: {
      type: Object,
      default: function () {
        return null
      },
    },
    pgEditorId: {
      type: String,
      default() {
        return ''
      },
    },
    parameterConfiguration: {
      type: Object,
      default() {
        return {
          editorType: '',
          isLocateCursor: true, //病历打开时光标是否需定位到文档上（模板预览时不用）
          isSetDefaultData: true, //是否设置模板上绑定的一些默认数据
          PageOnloadCancelLoading: false, //是否在PageOnload事件中关闭loading
        }
      },
    },
    customizeRightMenuFlag: {
      type: Boolean,
      default: true,
    },
    personalTemplateRightMenuFlag: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      classNamespace: ClassNamespace,
      customizeRightMenu: null,
      loading: true,
      allographVisible: false,
    }
  },
  computed: {
    ...mapState(['userInfo', 'orgInfo', 'qualityControlData']),
    ...clinicalnoteMapStates(['AllConfigure', 'RightMenuSetting']),
    ...globalConfigMapStates(['emrColorConfig', 'doctorExpertise']),
    /*
     * 是否支持从外部编辑器复制粘贴
     * '0' 可以随意复制粘贴
     * '1' 不允许程序外的文本粘贴到病历文档内
     */
    isAllowExternal() {
      //不传患者信息不限制
      // if (!this.patientInfo?.patientInfoOutput?.patientId) return '0'
      // let externalConfig = this.AllConfigure?.data?.find((el) => {
      //   return el.inpatEmrParamConfigCode === 'EDITOR_EXTERNAL_COPY'
      // })

      // if (externalConfig) {
      //   return externalConfig.inpatEmrParamConfigContent == 'true' ? '0' : '1'
      // }

      return '0'
    },
    /**
     * 患者的复制权限
     * 0  默认  可随意复制粘贴
     * 1  同患者才可复制粘贴
     * 2  不同患者才可复制粘贴
     * */
    editorCopyModel() {
      //不传患者信息不限制
      if (!this.patientInfo?.patientInfoOutput?.patientId) return '0'

      //是否支持不同病人之间的病历相互复制粘贴
      let differentPatientConfig = this.AllConfigure?.data?.find((el) => {
        return el.inpatEmrParamConfigCode === 'EDITOR_DIFFERENT_PATIENT_COPY'
      })

      if (differentPatientConfig) {
        return differentPatientConfig.inpatEmrParamConfigContent == 'true'
          ? '0'
          : '1'
      }

      return '0'
    },
    classNames() {
      return {
        editorWrap: `${this.classNamespace}-wrap`,
        editorTarget: `${this.classNamespace}-target`,
      }
    },
    isDisableBeforeArrowKeydown() {
      return this.store.widgetDynamicCollectionDialog.state
        .isDisableBeforeArrowKeydown
    },
    isDisableBeforeEnterKeydown() {
      return this.store.widgetDynamicCollectionDialog.state
        .isDisableBeforeEnterKeydown
    },
    isAiBeforeArrowKeydown() {
      return this.store.widgetAiRecommendTip.state.isAiBeforeArrowKeydown
    },
    isAiBeforeEnterKeydown() {
      return this.store.widgetAiRecommendTip.state.isAiBeforeEnterKeydown
    },
    patientAge() {
      let age = ''
      if (this.patientInfo?.patientInfoOutput?.age) {
        age = this.patientInfo.patientInfoOutput.age
      } else if (this.patientInfo?.age) {
        if (this.patientInfo.age.includes('岁')) {
          age = parseInt(this.patientInfo.age)
        } else {
          age = 0
        }
      }
      return age
    },
    isMoveCaretWithImportDoc() {
      return this?.parameterConfiguration?.isLocateCursor ?? true
    },
    isDefaultCurrentTime() {
      return this?.parameterConfiguration?.isSetDefaultData ?? true
    },
    qualityNewDefectsMenuFlag() {
      let qcd = this.qualityControlData
      return qcd && qcd?.operationType
    },
  },
  created() {
    this.eventHubHelper = getEventHubHelper(
      this.patientRootComponentStore.state.eventHub
    )
    this.pgEditor = null
  },
  async mounted() {
    this.init()
  },
  methods: {
    ...globalConfigActions(['getEmrStyleConfig', 'getDoctorExpertise']),
    async init() {
      const pgEditorDom = this.$refs.pgEditor

      console.log(
        '新建病历之前的参数：',
        this.isAllowExternal,
        this.patientInfo?.patientInfoOutput?.patientId,
        this.editorCopyModel
      )
      this.pgEditor = new PangoEditor(pgEditorDom, {
        Adaptive: false, //是否自适应，默认是false
        HeaderEditable: false, //页眉不可编辑
        pasteXtextLabelTotext: true,
        //文档加载的时候是否需要定位光标
        MoveCaretWithImportDoc: this.isMoveCaretWithImportDoc,
        //打开文档之后是否需要默认填充模板设置的一些时间数据
        DefaultCurrentTimeFlag: this.isDefaultCurrentTime,
        JumpAll: true,
        config: {
          toolbarConfig: [],
          patient: {
            id: this.patientInfo?.patientInfoOutput?.patientId,
            name: this.patientInfo?.fullName,
            age: this.patientAge,
            gender: this.patientInfo?.genderCode,
            copyModel: this.editorCopyModel,
          },
        },
        width: 900,
        height: 500,
        updateCustomEvtGrp: {
          CopyModel: this.isAllowExternal,
          // 浏览态是否允许自定义右键的开关
          BrowerAllowedRightMenu: true,
          // 浏览态是否允许复制的开关 质控需要false
          BrowerAllowedCopy: true,
        },
        UpdateTextDocInfo: {
          HideMessageBoxComp: false,
          // BorderBrackets: 'middle', //元素开始边框样式,默认大括号{},middle=中括号[]
          HideCircle: true, //是否显示小圆点，默认false=显示，设为true=不显示
          // "BackColor": '#aaFF9800',//元素录入的背景色，默认浅灰色、需要自带透明度、
          // "FocusBgColor": '#332d5afa',//元素焦点时的背景色,需要自带透明度、例如rgba(255,255,255,0.2)=#33000000
          // "HoverBgColor": 'rgba(255,255,0,0.3)',//鼠标悬浮时的元素的背景色，默认无色
        },
        DelayedChangeInfo: {
          DelayedChangeFlag: true,
          DelayedChangeColor: '',
          DelayedChangeTime: 5000,
        },
        showWorkMode: false, //是否显示状态栏中的设计模式
        showZoom: false, //是否显示状态栏中的缩放功能
        userId: this.userInfo?.employeeId,
        userName: this.userInfo?.employeeName,
        userLevel: 1,
        customizeRightMenu: this.customizeRightMenu,
        PageOnload: () => {
          console.log(
            'PageOnload -------- ',
            this.parameterConfiguration.PageOnloadCancelLoading
          )
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_PAGE_ONLOAD)
          if (this.parameterConfiguration.PageOnloadCancelLoading) {
            if (this.loading) {
              this.loading = false
            }
          }
        },
        XmlOnLoad: () => {
          console.log('XmlOnLoad -------- ')
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_XML_ONLOAD)
          if (this.loading) {
            this.loading = false
          }
        },
        afterPaint: () => {
          //console.log('xml绘制完成 ------ ')
        },
        OpenError: () => {
          console.log('xml加载出错 ------ ')
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_XML_OPEN_ERROR)
          if (this.loading) {
            this.loading = false
          }
        },
        InputActiveHandler: (param) => {
          console.log('InputActiveHandler -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_INPUT_ACTIVE)
        },
        ButtonClick: (param) => {
          console.log('ButtonClick -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_BUTTON_CLICK, param)
        },
        OnCursorChanged: (param) => {
          console.log('鼠标位置改变事件 -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_ON_CURSOR_CHANGED, param)
        },
        DocChanged: (param) => {
          console.log('文档在改变 -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_DOC_CHANGED, param)
        },
        InputActiveWithCptId: (param) => {
          console.log('当前激活的输入域改变事件 -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_INPUT_CLICK, param)
        },
        RightProperty: (param) => {
          console.log('RightProperty -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_RIGHT_PROPERTY, param)
        },
        SaveAsText: (param) => {
          console.log('SaveAsText -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_SAVE_AS_TEXT, param)
        },
        InputChange: (param) => {
          console.log('InputChange -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_INPUT_CHANGE, param)
        },
        UpdateTeeth: (param) => {
          console.log('UpdateTeeth -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_UPDATE_TEETH, param)
        },
        UpdateSyncImage: (param) => {
          console.log('UpdateSyncImage -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_UPDATE_SYNC_IMAGE, param)
        },
        beforeArrowKeydown: () => {
          if (
            !this.isDisableBeforeArrowKeydown ||
            !this.isAiBeforeArrowKeydown
          ) {
            console.log('--编辑器不允许上下键走动')
            return false
          }

          console.log('--编辑器允许上下键走动')
          return true
        },
        beforeEnterKeydown: () => {
          if (
            !this.isDisableBeforeEnterKeydown ||
            !this.isAiBeforeEnterKeydown
          ) {
            console.log('--编辑器不允许回车')
            return false
          }
          console.log('--编辑器允许回车')
          return true
        },
        InputOnBlur: (param) => {
          console.log('InputOnBlur -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_INPUT_ON_BLUR, param)
        },
        XLabelHoverBackParagraph: (params) => {
          console.log(params, '鼠标悬浮在段落标题上快捷收藏为短语----------')
          //目前这个功能只在首程的诊疗计划上使用了
          if (params?.cid == DataElementWinIds.DIAGNOSIS_TREATMENT_PLAN_INPUT) {
            let $editorContainer = $(this.$refs.pgEditor).find(
              '#pagescontainer'
            )
            let $el = $editorContainer.find('.hoverBtnForCollect')
            let _left = params.postion[0]
            let _top = params.postion[1]
            if ($el.length) {
              $el
                .css({
                  left: _left + 'px',
                  top: _top + 'px',
                })
                .show()
            } else {
              $editorContainer.append(
                `<span class="hoverBtnForCollect" style="left:${_left}px;top:${_top}px;">收藏为短语</span>`
              )
              $el = $editorContainer.find('.hoverBtnForCollect')
              $editorContainer.on(
                'click',
                '.hoverBtnForCollect',
                params,
                () => {
                  this.eventEmitter.$emit(
                    EditorEvent.PG_EVENT_HOVER_PARAGRAPH,
                    params
                  )
                  $el.hide()
                }
              )
            }
          }
        },
        XLabelMoveOut: (params) => {
          console.log(params, 'XLabelMoveOut----------')
          //目前这个功能只在首程的诊疗计划上使用了
          this.eventEmitter.$once(
            EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
            () => {
              setTimeout(() => {
                if (
                  params?.cid ==
                  DataElementWinIds.DIAGNOSIS_TREATMENT_PLAN_INPUT
                ) {
                  let $editorContainer = $(this.$refs.pgEditor).find(
                    '#pagescontainer'
                  )
                  let $el = $editorContainer.find('.hoverBtnForCollect')
                  $el.remove()
                  $editorContainer.off('click', '.hoverBtnForCollect')
                }
              }, 500)
            }
          )
        },
        BeforeRightMenu: (param) => {
          console.log('BeforeRightMenu -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_BEFORE_RIGHT_MENU, param)
        },
        InputMouseClick: (param) => {
          console.log('InputMouseClick -------- ', param)
          this.eventEmitter.$emit(EditorEvent.PG_EVENT_INPUT_MOUSE_CLICK, param)
        },
        AfterSetPrintPreview: (param) => {
          console.log('AfterSetPrintPreview -------- ', param)
          this.eventEmitter.$emit(
            EditorEvent.PG_EVENT_AFTER_SET_PRINT_PREVIEW,
            param
          )
        },
        PrintpreviewClick: (param) => {
          console.log('PrintpreviewClick -------- ', param)
          this.eventEmitter.$emit(
            EditorEvent.PG_EVENT_PRINT_PREVIEW_CLICK,
            param
          )
        },
        //抛出图片加载失败的信息
        ImageLoadError: (param) => {
          console.log('文档中有图片加载失败 ------', param)
          this.$emit('ImageLoadError', param)
        },
      })
      console.log(
        `Tester当前的编辑器版本是： ${this.pgEditor.pangoEditorVersion}`
      )
    },
  },
}
</script>

<style lang="scss" scoped>
$classNamespace: 'pg-editor';
.#{$classNamespace}-wrap {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  background-color: #ececec;
  position: relative;

  .#{$classNamespace}-target {
    flex: 1 1 auto;
    height: calc(100% - 40px);
    width: 100%;
  }

  /deep/ .hoverBtnForCollect {
    padding: 5px 10px;
    background: #fff;
    position: absolute;
    z-index: 9999;
    cursor: pointer;
    border-radius: 4px;
    color: #666;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
}
.widgets-container {
  position: relative !important;
  min-width: 820px;
  //margin: 8px auto;
  overflow-x: auto;

  .widget-item {
    position: absolute !important;
    z-index: 1;
  }
}
</style>
