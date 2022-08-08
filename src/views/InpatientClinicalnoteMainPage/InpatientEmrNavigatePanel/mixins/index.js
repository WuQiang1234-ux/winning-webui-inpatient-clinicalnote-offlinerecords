import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'
import getEventHubHelper from '@/utils/event_hub_helper.js'
let mixin = {
  components: {},
  inject: ['patientRootComponent'],
  props: {
    publicParameters: {
      type: Object,
    },
  },
  data() {
    return {}
  },
  computed: {
    currentEmrSetId() {
      return this.patientRootComponent.currentActiveLoadedClinicalnote?.options
        ?.content?.emrSetId
    },
    currentPatientInfo() {
      return this.patientRootComponent.currentPatientInfo
    },
  },
  watch: {
    'patientRootComponent.currentActiveLoadedClinicalnote.id'(v) {
      if (v) {
        console.log('改了', this.patientRootComponent)
        // if (this.activateMenu == 'emr_tree') {
        this.treeDefaultExpandedKeys = []
        this.treeDefaultExpandedKeys?.push(
          this.patientRootComponent.currentActiveLoadedClinicalnote.options
            .content.emrTypeId
        )
        // }
      }
    },
  },
  created() {
    this.eventHubHelper = getEventHubHelper(this.$root.eventHub)
  },
  beforeDestroy() {
    this.eventHubHelper.destroy()
  },
  methods: {
    //普通病历
    async openEmrSet(data) {
      console.log(data, 'openEmrSet')
      let type = ''
      if (data.emrTypeId == '121383422926546950') {
        type = ClinicalnoteTypes.CONSULTATION_SINGLE
      } else {
        type = ClinicalnoteTypes.INPATIENT_CLINICALNOTE
      }

      const { id, label, emrClass } = data
      const hasFlag = this.hasInLoadedClinicalnoteList(id)
      if (!hasFlag) {
        this.patientRootComponent.addToLoadedClinicalnoteList({
          id,
          type,
          title: label,
          emrClass,
          loading: true,
          options: {
            content: {
              hasContent: true,
              modifiedAt: 0, //病历上次修改时间
              emrSourceCode: data.rawData.emrSourceCode, //渠道  用于pdf
              inpatientMrtId: data.rawData.inpatientMrtId,
              inpMrtMonitorId:
                data.rawData.inpMrtMonitorId ?? data.rawData.inpatientMrtTypeId,
              emrTypeId: data.emrTypeId,
              emrSetId: id,
              emrSetTitle: label,

              xml: '',
              inpatEmrRecordId: '',
              mrtEditorTypeCode: '',
              emrStatusCode: '', //病历当前状态 用于控制病历状态图标
              inpatEmrSetStatusCode: '',
              paragraphIds: [], //短语引用需要根据段落筛选分类
            },
          },
        })
      }

      this.patientRootComponent.setCurrentActiveClinicalnoteById(id)
    },
    //连续病历处理
    async openEmrSetSerial(data) {
      console.log(data, 'openEmrSetSerial')
      const { id, label, emrTypeId, emrTypeName } = data
      if (!emrTypeId) {
        return
      }
      //防止联调环境多个患者的病程Id相同
      let _uniqueId = this.currentPatientInfo.encounterId + emrTypeId
      const hasFlag = this.hasInLoadedClinicalnoteList(_uniqueId)
      if (!hasFlag) {
        this.patientRootComponent.addToLoadedClinicalnoteList({
          id: _uniqueId,
          title: emrTypeName,
          loading: true,
          options: {
            serial: true,
            content: {
              hasContent: false, //是否为空 即初始化模板内容，该份病历还没有被保存过
              modifiedAt: 0, //病历上次修改时间

              emrSourceCode: data.rawData.emrSourceCode, //渠道  用于pdf
              emrTypeId,
              emrSetId: id,
              emrSetTitle: label,
              emrStatusCode: data.rawData.inpEmrDisplayStatusCode, //病历当前状态 用于控制病历状态图标
              inpatEmrSetStatusCode: data.rawData.inpatEmrSetStatusCode,
              inpatientMrtId: data.rawData.inpatientMrtId,
              inpMrtMonitorId:
                data.rawData.inpMrtMonitorId ?? data.rawData.inpatientMrtTypeId,

              blankXml: '',
              list: [],

              paragraphIds: [], //短语引用需要根据段落筛选分类
            },
          },
        })
      }
      this.patientRootComponent.setCurrentActiveClinicalnoteById(_uniqueId)
      //连续病历更新成当前查看病历的id todo 需要处理
      this.patientRootComponent.setCurrentEmrSetSerialId(id)
      // 更换成编辑图标
      // this.NewAndChangedIcon()
    },

    async handleDeleteClinicalnote(data1) {
      data1.loading = true
    },

    async deleteClinicalnote() {},
    hasInLoadedClinicalnoteList(id) {
      return this.patientRootComponent.loadedClinicalnoteList.find((v) => {
        return v.id == id
      })
    },
  },
}

export default mixin
