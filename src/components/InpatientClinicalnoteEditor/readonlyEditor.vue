<template>
  <div :class="classNames.EditorArea">
    <div ref="editorContainer" :class="classNames.EditorWrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :userInfo="userInfo"
        :orgInfo="orgInfo"
        :parameterConfiguration="{ inpatEmrSetId }"
        :toolbarOptions="{ isShow: false }"
      />
    </div>
    <!-- <div :class="classNames.EditorOperation"></div> -->
  </div>
</template>
<script>
import pgBaseEditor from './BaseEditorPg'
import PgEditor from '../../libs/PgEditor'
import { EditorEvent, DcEditorRenderModes } from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
import api from '@/api/list'
import apiMedicalManager from '@/api/dailyManager/medicalManager.js'
import { decompress } from './BaseEditorPg/utils'
export default {
  name: 'ReadonlyEditor',
  components: { PgEditor },
  extends: pgBaseEditor,
  props: {
    //主要针对日志的短语类型
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    inpEmrRecordIds() {
      return [this.clinicalnoteData.content.inpEmrRecordId]
    },
    inpatEmrSetId() {
      return this.clinicalnoteData.content.emrSetId
    }
  },
  watch: {
    inpEmrRecordIds: {
      async handler() {
        await this.handleLoadClinicalnoteContentAction()
      },
      deep: true
    }
  },
  methods: {
    async handleLoadClinicalnoteContentAction() {
      let res = null
      if (this.type == 'phrase') {
        res = await apiMedicalManager.apiQueryPhraseContent({
          inpEmrPhraseId: this.inpatEmrSetId
        })
        let xml = res.data.inpatientEmrPhraseContentVO?.inpEmrPhraseContentData
        if (xml) {
          //短语老数据编码也有问题  需要再次解码
          xml = decompress(xml)
          if (!xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')) {
            xml = decodeURI(xml)
          }
          this.clinicalnoteData.content.xml = xml
        }
      } else {
        res = await api.getSnapshoot({
          inpEmrRecordIds: this.inpEmrRecordIds
        })
        if (res.data?.length) {
          this.clinicalnoteData.content.xml = decompress(
            res.data[0].inpatEmrContentData
          )
        }
      }

      await this.loadClinicalnoteXmlAsync() //加载
    },
    pgControlClinicalnoteContentStateAsync() {
      const pgEditor = this.getEditor()
      pgEditor.switchContentRenderMode(
        DcEditorRenderModes.SET_WORK_MODE_KEEP_TRACE
      )
    },
    async loadClinicalnoteXmlAsync() {
      const pgEditor = this.getEditor()
      const { content } = this.clinicalnoteData
      if (content.xml) {
        const load = (cb = () => {}) => {
          pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
            cb()
          })
          if (content.emrTypeId !== '121383422926546950') {
            console.log('普通的', content)

            pgEditor.pgEditorInstance.postmessage({
              type: 'FileOpen',
              param: [{ srcstr: content.xml, docId: this.currentDocId }]
            })
          } else {
            if (content.mrtEditorTypeCode == '399461576') {
              console.log('dc的会诊', content.mrtEditorTypeCode)

              pgEditor.pgEditorInstance.postmessage({
                type: 'FileOpen',
                param: [{ srcstr: content.xml, docId: this.currentDocId }]
              })
            } else {
              console.log('自研会诊')
              pgEditor.pgEditorInstance.postmessage({
                type: 'importMoreXml',
                param: {
                  srcstr: content.xml,
                  docId: this.currentDocId,
                  topMargin: 0
                }
              })
            }
          }
        }

        if (!pgEditor?.pgEditorLoaded) {
          await pgEditor.waitEditorLoaded()
        }

        await cb2promise(cb => {
          load(cb)
        })
        this.pgControlClinicalnoteContentStateAsync()
      } else {
        //关闭loading效果 查不到相关内容时
        pgEditor.$children[0].loading = false
        this.$emit('error')
      }
      //水印
      pgEditor.setWaterMark()
      console.log('jiazai wancheng ---------- ')
    }
  }
}
</script>

<style lang="scss" scoped></style>
