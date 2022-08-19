<template>
  <div :class="classNames.editorContainer">
    <Editor
      ref="editorTarget"
      :pgEditorId="pgEditorId"
      :patientInfo="patientInfo"
      :parameterConfiguration="parameterConfiguration"
      :customizeRightMenuFlag="customizeRightMenuFlag"
      :personalTemplateRightMenuFlag="personalTemplateRightMenuFlag"
      :isAddMinWidth="isAddMinWidth"
      :editoroptionInitialConfiguration="editoroptionInitialConfiguration"
    ></Editor>
  </div>
</template>

<script>
export * as Constants from './constants'

// let queryXmlIdKeys = {
//   977572: 'CONSULT_REPLY_NORMAL_DATA_GROUP', //科间会诊
//   977574: 'CONSULT_REPLY_OUTOFHOSPITAL_DATA_GROUP', //院外会诊
//   399299500: 'CONSULT_REPLY_UNION_DATA_GROUP' //多科联合会诊
// }
// /*global $:true*/
/* eslint-disable no-undef */
// import _ from 'lodash';
// import calendarClass from '@/libs/PgEditor/utils/calendar'
// import { getMacAddress, getIpAddress } from '@winex-utils/his-dll'

import {
  ClassNamespace,
  EditorEvent,
  // DataElementWinIds,
  DcEditorRenderModes,
} from './constants'
import { cb2promise } from '@/utils/convertFunction'
import mixins from './mixins'
import Editor from './editor'
// import DiagnosisHelper from './helper/diagnosis_helper'
// import SignatureHelper, {
//   ConsultationSignatureHelper,
// } from './helper/signature_helper'
// import { decompress } from '../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'

// 兼容乾坤聚合，子应用间通信
// if (!window.eventBus) {
//   window.eventBus = Vue.prototype.eventBus = new Vue()
// }

console.log('PgEditor开始加载了')

export default {
  name: 'PgEditor',
  components: {
    Editor,
  },
  mixins: [mixins.getProvideMixin()],

  props: {
    consultationReplyDepOptions: {
      type: Object,
      default: function () {
        return null
      },
    },
    editoroptionInitialConfiguration: {
      type: Object,
      default: function () {
        return {}
      },
    },
    isAddMinWidth: {
      type: Boolean,
      default: true,
    },
    // 后端参数
    patientInfo: {
      type: Object,
      default: function () {
        return {}
      },
    },
    userInfo: {
      type: Object,
      default: function () {
        return {}
      },
    },
    orgInfo: {
      type: Object,
      default: function () {
        return {}
      },
    },

    editorOptions: {
      type: Object,
      default: function () {
        return {
          ContentRenderMode: DcEditorRenderModes.SET_WORK_MODE_APP,
        }
      },
    },

    toolbarOptions: {
      type: Object,
      default: function () {
        return {
          isShow: true,
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
    parameterConfiguration: {
      type: Object,
      default() {
        return {
          editorType: '',
          inpatEmrSetId: '',
          isLocateCursor: true, //病历打开时光标是否需定位到文档上
        }
      },
    },
  },
  data() {
    return {
      hook_root: true,
      classNamespace: ClassNamespace,
      pgEditorLoaded: false,
      cachedPresetSystemConceptData: null,
      obtainApplicationForConsultation: {},
      widgetAiRecommendTipOptions: {},
    }
  },
  computed: {
    classNames() {
      return {
        editorContainer: `${this.classNamespace}-container`,
      }
    },
    pgEditorId() {
      let editorId = 'pgEditor' + +new Date()
      return editorId
    },
    patientInfoGetter() {
      return this.$patientRootComponentStore?.state?.currentPatientInfo
    },
    userInfoGetter() {
      const userInfo = this.userInfo
      if (!userInfo) {
        return getUserInfo()
      }
      return userInfo
    },
    orgInfoGetter() {
      const orgInfo = this.orgInfo
      if (!orgInfo) {
        return getOrgInfo()
      }
      return orgInfo
    },
  },
  provide() {
    return {
      currentPatientInfo: this.patientInfoGetter,
      userInfo: this.userInfoGetter,
    }
  },
  watch: {
    toolbarOptions: {
      handler(newVal) {
        // debugger
        this.store.toolbar.mutations.setState(newVal)
      },
      deep: true,
      immediate: true,
    },
    'store.editor.state.editorOptions.ContentRenderMode': {
      handler(newVal, oldVal) {
        // 监听编辑器工作模式传参数
        this.switchContentRenderMode(newVal, oldVal)
      },
      immediate: true,
    },
  },
  beforeDestroy() {},
  created() {
    this.pgEditorInstance = null // 保存编辑器实例
  },
  mounted() {
    const editorTarget = this.$refs.editorTarget
    if (this.pgEditorLoaded) {
      this.pgEditorInstance = editorTarget.pgEditor
    } else {
      this.eventEmitter.$once(EditorEvent.PG_EVENT_PAGE_ONLOAD, () => {
        this.pgEditorInstance = editorTarget.pgEditor
        this.pgEditorLoaded = true
      })
    }
  },
  methods: {
    waitEditorLoaded() {
      return new Promise((resolve) => {
        if (this.pgEditorLoaded) {
          resolve()
        } else {
          this.eventEmitter.$once(EditorEvent.PG_EVENT_PAGE_ONLOAD, resolve)
        }
      })
    },
    async switchContentRenderMode(mode, oldMode) {
      console.log('模式切换------', mode, oldMode)
      //初始化需要设置成别的模式时，编辑器实例还没生成，设置不成功（短语管理）
      const switchMode = (cb = () => {}) => {
        this.eventEmitter.$once(EditorEvent.PG_EVENT_PAGE_ONLOAD, () => {
          cb()
        })
        this.pgEditorInstance.postmessage({
          type: mode,
          param: [],
        })

        this.store.editor.mutations.setEditorContentRenderMode(mode)
        // this.eventEmitter.$emit(
        //   EditorEvent.EDITOR_CONTENT_RENDER_MODE_CHANGE,
        //   mode
        // )
      }

      if (!this.pgEditorInstance) {
        await this.waitEditorLoaded()
      }

      await cb2promise((cb) => {
        switchMode(cb)
      })
    },
    configDocument() {},
    configFieldById() {},
    configSubDocumentById() {},
    deleteField() {},
    deleteFieldById() {},
    findFieldById() {},
    getDocumentContent() {
      const xml = this.pgEditorInstance.postmessage({
        type: 'FileSave',
        param: [],
      })[0].xml
      return xml
    },
    getSubDocumentContentById() {
      // const xml = this.pgEditorInstance.postmessage({
      //   type: 'LookUpXmlCode',
      //   param: [true]
      // })
      // return xml
    },
    getSubDocuments() {},
    insertField() {},
    appendSubDocument() {},
    loadDocument(xml) {
      console.log('loadDocument --------- ', xml)
      this.pgEditorInstance.postmessage({
        type: 'ImportDoc',
        param: xml,
      })
    },
    loadSubDocuments() {},
    moveSubDocumentTo() {},
    print() {},
    setFieldContentById() {},
  },
}
</script>

<style lang="scss" scoped>
$classNamespace: 'pg-editor';

.#{$classNamespace}-container * {
  box-sizing: border-box;
}

.#{$classNamespace}-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #ececec;
  overflow-x: auto;
}
/deep/ .pango-editor-content .pango-editor-pages {
  & > canvas {
    box-shadow: none !important;
  }
}
</style>
