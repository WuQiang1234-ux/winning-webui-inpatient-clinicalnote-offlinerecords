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
      @ImageLoadError="ImageLoadError"
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
import calendarClass from '@/libs/PgEditor/utils/calendar'
import { getMacAddress, getIpAddress } from '@winex-utils/his-dll'

import {
  ClassNamespace,
  EditorEvent,
  // DataElementWinIds,
  DcEditorRenderModes,
} from './constants'
import { cb2promise } from '@/utils/convertFunction'
import mixins from './mixins'
import Editor from './editor'
import DiagnosisHelper from './helper/diagnosis_helper'
import SignatureHelper, {
  ConsultationSignatureHelper,
} from './helper/signature_helper'
import { mapState, createNamespacedHelpers } from 'vuex'
// import { decompress } from '../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'
const { mapState: globalConfigMapStates, mapActions: globalConfigActions } =
  createNamespacedHelpers('globalConfig')

// 兼容乾坤聚合，子应用间通信
if (!window.eventBus) {
  window.eventBus = Vue.prototype.eventBus = new Vue()
}

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
        return null
      },
    },
    userInfo: {
      type: Object,
      default: function () {
        return null
      },
    },
    orgInfo: {
      type: Object,
      default: function () {
        return null
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
    ...mapState(['currentPatientInfo', 'qualityControlData']),
    ...globalConfigMapStates(['pageConfig']),
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
      const patientInfo = this.patientInfo
      if (!patientInfo) {
        return getCurrentPatientInfo()
      }
      return patientInfo
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
  watch: {},
  beforeDestroy() {},
  created() {
    this.pgEditorInstance = null // 保存编辑器实例
  },
  mounted() {},
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
