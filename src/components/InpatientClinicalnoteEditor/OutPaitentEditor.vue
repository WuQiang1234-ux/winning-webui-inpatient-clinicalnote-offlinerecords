<template>
  <PgEditor
    ref="pgEditorDom"
    :patientInfo="currentPatientInfo"
    :userInfo="userInfo"
    :toolbarOptions="{ isShow: false }"
  />
</template>
<script>
import api from '@/api/list'
import { mapState } from 'vuex'
import PgEditor from '@/libs/PgEditor'
import { EditorEvent, DcEditorRenderModes } from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
export default {
  name: 'OutpatientEditor',
  components: {
    PgEditor
  },
  props: {
    clinicalnoteData: {
      type: Object,
      default: function() {
        return {
          content: {
            emrSetId: '', //当前正在处理的病历id
            //普通病历
            xml: '',
            emrSetTitle: '', //病历标题
            emrStatusCode: '', //病历状态 用来设置病历状态图标
            inpatEmrSetStatusCode: '', //病历的真实状态  目前主要用于判断病历是否是草稿状态
            paragraphIds: []
          }
        }
      }
    }
  },
  computed: {
    ...mapState(['currentPatientInfo', 'userInfo'])
  },
  mounted() {
    this.getClinicalnoteContent()
  },
  methods: {
    async getClinicalnoteContent() {
      let emrSetId = this.clinicalnoteData.content.emrSetId
      api
        .queryOutPatientEmrContent({
          emrSetId
        })
        .then(async res => {
          const { data } = res
          let xml = data?.outpEmrContent?.outpEmrContentData
          if (!xml) return
          let pgEditor = this.$refs.pgEditorDom
          const load = (cb = () => {}) => {
            pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
              cb()
            })
            //不获取光标
            pgEditor.pgEditorInstance.changeUnfocus(true)
            pgEditor.pgEditorInstance.postmessage({
              type: 'FileOpen',
              param: [
                {
                  srcstr: decodeURIComponent(escape(window.atob(xml))),
                  docId: emrSetId
                }
              ]
            })
          }

          if (!pgEditor?.pgEditorLoaded) {
            await pgEditor.waitEditorLoaded()
          }

          await cb2promise(cb => {
            load(cb)
          })

          //设置浏览模式  让模板不可编辑
          pgEditor.switchContentRenderMode(
            DcEditorRenderModes.SET_WORK_MODE_BROWSE
          )
        })
        .catch(() => {
          let pgEditor = this.$refs.pgEditorDom
          pgEditor.$children[0].loading = false
        })
    }
  }
}
</script>
