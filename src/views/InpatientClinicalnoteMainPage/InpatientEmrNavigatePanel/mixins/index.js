import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'
import getEventHubHelper from '@/utils/event_hub_helper.js'
import iconFlagComponent from '@/components/IconFlag'
let mixin = {
  components: { iconFlagComponent },
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
      return this.$patientRootComponentStore.state
        .multi_clinicalnote_board_state.currentActiveLoadedClinicalnote?.options
        ?.content?.emrSetId
    },
    currentPatientInfo() {
      return this.$patientRootComponentStore.state.currentPatientInfo
    },
  },
  watch: {
    '$patientRootComponentStore.multi_clinicalnote_board_state.currentActiveLoadedClinicalnote.id'(
      v
    ) {
      if (v) {
        console.log(
          '改了',
          this.$patientRootComponentStore.state.multi_clinicalnote_board_state
        )
        // if (this.activateMenu == 'emr_tree') {
        this.treeDefaultExpandedKeys = []
        this.treeDefaultExpandedKeys?.push(
          this.$patientRootComponentStore.state.multi_clinicalnote_board_state
            .currentActiveLoadedClinicalnote.options.content.emrTypeId
        )
        // }
      }
    },
  },
  created() {
    this.eventHubHelper = getEventHubHelper(
      this.$patientRootComponentStore.state.eventHub
    )
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
        let obj = {
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
        }
        console.log(obj, '======0==========', this.$patientRootComponentStore)
        this.$patientRootComponentStore.commit(
          'multi_clinicalnote_board_state/addToLoadedClinicalnoteList',
          obj
        )
      }

      this.$patientRootComponentStore.commit(
        'multi_clinicalnote_board_state/setCurrentActiveClinicalnoteById',
        id
      )
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
        let obj = {
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
        }
        this.$patientRootComponentStore.commit(
          'multi_clinicalnote_board_state/addToLoadedClinicalnoteList',
          obj
        )
      }
      this.$patientRootComponentStore.commit(
        'multi_clinicalnote_board_state/setCurrentActiveClinicalnoteById',
        _uniqueId
      )
      //连续病历更新成当前查看病历的id todo 需要处理
      this.$patientRootComponentStore.commit(
        'multi_clinicalnote_board_state/setCurrentEmrSetSerialId',
        id
      )
      // 更换成编辑图标
      // this.NewAndChangedIcon()
    },
    async deleteClinicalnote() {},
    hasInLoadedClinicalnoteList(id) {
      return this.$patientRootComponentStore.state.multi_clinicalnote_board_state.loadedClinicalnoteList.find(
        (v) => {
          return v.id == id
        }
      )
    },
    //编辑时图标更新设置
    handleIconChange(el) {
      if (el.id == this.currentEmrSetId) {
        if (
          el.currentStatusCode == '960074' ||
          el.currentStatusCode == '390030405'
        ) {
          el.currentStatusCode = '1001'
        }
      } else {
        //还原未激活图标
        el.currentStatusCode = el.defaultStatusCode
      }
    },
    NewAndChangedIcon() {
      this.clinicalnoteTreeData.forEach((el) => {
        if (el.children.length) {
          el.children.forEach((ele) => {
            this.handleIconChange(ele)
          })
        }
      })
    },
    async handleDeleteClinicalnote(data1) {
      data1.loading = true
      try {
        if (this.deleteThePrompt) return
        this.$confirm('此操作将永久删除该病历, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          console.log('删除', data1)
        })
      } finally {
        data1.loading = false
      }
    },
  },
}

export default mixin
