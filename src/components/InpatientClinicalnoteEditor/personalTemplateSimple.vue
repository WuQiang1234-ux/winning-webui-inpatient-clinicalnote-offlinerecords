<template>
  <div class="inpatient-clinicalnote-editor-area">
    <div ref="editorContainer" class="inpatient-clinicalnote-editor-wrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :userInfo="userInfo"
        :orgInfo="orgInfo"
        :parameterConfiguration="{
          inpatEmrSetId:
            templateData &&
            templateData.content &&
            templateData.content.emrSetId
        }"
      />
    </div>
  </div>
</template>
<script>
import PgEditor from '../../libs/PgEditor'
import { EditorEvent, DataElementWinIds } from '@/libs/PgEditor/constants'
import { mapState } from 'vuex'
import vitalSignsDataMixin from './BaseEditorPg/mixins/vitalSignsData'
import { cb2promise } from '@/utils/convertFunction'
import { compress, decompress } from './BaseEditorPg/utils'

export default {
  name: 'ReadonlyEditor',
  components: { PgEditor },
  mixins: [
    vitalSignsDataMixin //生命体征
  ],
  props: {
    xml: {
      type: String,
      default: function() {
        return ''
      }
    },

    templateData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      dialogVisible: false,
      recallReasonVisible: false,
      recallReason: '',
      toolbarOptions: {},
      clinicalnoteData: null
    }
  },
  computed: {
    ...mapState(['currentPatientInfo', 'userInfo', 'orgInfo'])
  },
  async mounted() {
    this.$root.eventHub.$on('SaveTemplate/ShowDialog', this.showDialogMethod)
  },
  beforeDestroy() {
    this.$root.eventHub.$off('SaveTemplate/ShowDialog', this.showDialogMethod)
  },
  methods: {
    async showDialogMethod(clinicalnoteData, content) {
      console.log(clinicalnoteData, content)
      this.clinicalnoteData = clinicalnoteData
      const pgEditor = this.getEditor()
      const xml = decompress(content.base64Str)
      console.log('编辑器接收到的内容是', xml)
      const load = async (cb = () => {}) => {
        pgEditor.eventEmitter.$once(
          EditorEvent.PG_EVENT_XML_ONLOAD,
          async () => {
            cb()
            let clearDataArrs = [
              DataElementWinIds.CONTINUOUS_TITLE_INPUT,
              DataElementWinIds.CONTINUOUS_CREATEDAT_INPUT,
              DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
              DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT,
              DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT,
              DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT,
              DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT,
              DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT,
              DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT,
              DataElementWinIds.CURRENT_DIAGNOSIS_INPUT,
              DataElementWinIds.DEATH_DIAGNOSIS_INPUT,
              DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT,
              DataElementWinIds.ADMISSION_DATES,
              DataElementWinIds.CORRECTION_DATES,
              DataElementWinIds.SUPPLEMENTARY_DATES,
              DataElementWinIds.DISCHARGE_DATES,
              DataElementWinIds.RECORD_DATE,
              DataElementWinIds.PAIN_COMMENT_RECORD_INPUT
            ]
            const list = pgEditor.pgEditorInstance.postmessage({
              type: 'GetElementListWithAttr',
              param: []
            })
            let valueList = list[0].valueList
            console.log(list, valueList)
            let contentList = valueList
              .filter(item => {
                return item.cptId && item.cptId.indexOf('-') > -1
              })
              .map(item => {
                return item.cptId
              })
            if (contentList.length > 0) {
              clearDataArrs = clearDataArrs.concat(contentList)
            }
            await pgEditor.clearTheDefaultData(
              clearDataArrs.map(conceptId => {
                return {
                  conceptId
                }
              })
            )
            await pgEditor.signatureHelper.clearAllSignature()
            await pgEditor.setSystemConceptData()
            await this.clearVitalSignsDataAsync()
            const newXml = pgEditor.getDocumentContent()
            const base64Str = compress(newXml)
            console.log('保存的个人模板xml')
            // console.log(newXml)
            this.$root.eventHub.$emit('PersonalTemplateContent', base64Str)
          }
        )

        console.log('加载的个人模板xml')
        pgEditor.loadDocument(xml)
      }

      if (!pgEditor?.pgEditorLoaded) {
        await pgEditor.waitEditorLoaded()
      }

      await cb2promise(cb => {
        load(cb)
      })
    },
    getEditor() {
      return this.$refs.pgEditorDom
    }
  }
}
</script>

<style lang="scss" scoped>
.personTemplate-footer {
  display: flex;
  justify-content: space-between;
  height: 50px;
  align-items: center;
  padding: 0 20px;
}
</style>
