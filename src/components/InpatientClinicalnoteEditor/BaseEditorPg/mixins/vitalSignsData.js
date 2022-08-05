import api from '@/api/list.js'
import { DataElementWinIds } from '@/libs/PgEditor/constants'
import { createNamespacedHelpers } from 'vuex'
// import { isDraftStatus } from '../utils'
import { inpMrtMonitorIdEnum } from '@/utils/enumerate'
const {
  mapState: pubDatasStates,
  mapActions: pubDatasActions
} = createNamespacedHelpers('pubDatas')
let vitalSignsDataMixin = {
  computed: {
    ...pubDatasStates(['basicsDataElement'])
  },
  mounted() {
    this.eventHubHelper?.on(
      'AuxiliaryInfo/InsertSignInfo',
      this.setSignInputContent
    )
  },
  methods: {
    ...pubDatasActions(['updateSignsInformationData']),
    setSignInputContent(e) {
      const { serial } = this.clinicalnoteData
      if (
        this.currentActiveLoadedClinicalnote.options.content.emrSetId !==
        this.clinicalnoteData.content.emrSetId
      )
        return

      const pgEditor = this.getEditor()

      let {
        temperature,
        pulse,
        breathe,
        systolicPressure,
        diastolicPressure,
        height,
        weight,
        temperatureWinId,
        pulseWinId,
        breatheWinId,
        systolicPressureWinId,
        bloodOxygenSaturation,
        diastolicPressureWinId,
        bloodOxygenSaturationWinId,
        heightWinId,
        weightWinId
      } = e.selectList

      let param = [
        {
          conceptId:
            temperatureWinId ||
            DataElementWinIds.MEDICAL_EXAMINATION_TEMPERATURE,
          value: temperature,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId: pulseWinId || DataElementWinIds.MEDICAL_EXAMINATION_PULSE,
          value: pulse,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId:
            breatheWinId ||
            DataElementWinIds.MEDICAL_EXAMINATION_BREATHING_RATE,
          value: breathe,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId:
            systolicPressureWinId ||
            DataElementWinIds.MEDICAL_EXAMINATION_SYSTOLIC_PRESSURE,
          value: systolicPressure,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId:
            diastolicPressureWinId ||
            DataElementWinIds.MEDICAL_EXAMINATION_DIASTOLIC_PRESSURE,
          value: diastolicPressure,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId:
            heightWinId || DataElementWinIds.MEDICAL_EXAMINATION_HEIGHT,
          value: height,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId:
            weightWinId || DataElementWinIds.MEDICAL_EXAMINATION_WEIGHT,
          value: weight,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        },
        {
          conceptId:
            bloodOxygenSaturationWinId ||
            DataElementWinIds.MEDICAL_EXAMINATION_OXYHEMOGLOBIN_SATURATION,
          value: bloodOxygenSaturation,
          docId: serial ? this.clinicalnoteData.content.emrSetId : '',
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        }
      ]
      param.length &&
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param
        })
    },
    //获取护理信息（优先级较高）和入区登记里面的体征信息
    async getVitalDataList() {
      const pgEditor = this.getEditor()
      let _param = {
        encounterId: this.currentPatientInfo.encounterId
      }
      // 不同的监控类型取值顺序不一样  后台需要根据监控类型去判断
      if (
        this.clinicalnoteData?.content?.inpMrtMonitorId ==
        inpMrtMonitorIdEnum.RYJL
      ) {
        _param.inpMrtMonitorId = inpMrtMonitorIdEnum.RYJL
      }
      let res = await api.getVitalSignsDatas(_param).catch(() => {})
      if (!res) return []
      const { success, data = [] } = res
      let params = {
        type: 'GetValueByInputCptId',
        param: [
          {
            cptId: DataElementWinIds.HEART_RATE, //心率元素的概念id
            type: 'text' //获取的类型xml/text
          }
        ]
      }
      let heartRate = pgEditor.pgEditorInstance.postmessage(params)
      if (heartRate.length && heartRate[0].value) {
        console.log('不添加心率')
        data.forEach((el, i) => {
          if (el.dataElementWinId == DataElementWinIds.HEART_RATE) {
            data.splice(i, 1)
          }
        })
      }
      if (success && data) {
        return data.map(v => {
          v.displayValue = v.dataValue
          return v
        })
      }
    },
    // 填充身高体重BMI值
    setBMIInfo() {
      let { phyExamHgt, phyExamWt, bmiIndex } = this.currentPatientInfo

      let param = []
      if (phyExamHgt) {
        param.push({
          docId: this.cId,
          conceptId: DataElementWinIds.MEDICAL_EXAMINATION_HEIGHT,
          value: phyExamHgt,
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false
          // KeepTrace: true
        })
      }
      if (phyExamWt) {
        param.push({
          docId: this.currentDocId,
          conceptId: DataElementWinIds.MEDICAL_EXAMINATION_WEIGHT,
          value: phyExamWt,
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false
          // KeepTrace: true
        })
      }
      if (bmiIndex) {
        param.push({
          docId: this.currentDocId,
          conceptId: DataElementWinIds.MEDICAL_EXAMINATION_BMI,
          value: bmiIndex,
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false,
          // KeepTrace: true,
          valueTarget: 'onlyDataElement'
        })
      }
      return param
    },
    async injectUpdateVitalSignsDataAsync() {
      const pgEditor = this.getEditor()
      // let isUpdateBasicData = isDraftStatus(
      //   this.clinicalnoteData.content.inpatEmrSetStatusCode
      // ) //病历状态
      //体征信息只在新建的时候更新
      if (!this.clinicalnoteData.content.hasContent) {
        console.log('体征来')
        //先取入区登记的
        let param = this.setBMIInfo()
        if (param.length) {
          pgEditor.pgEditorInstance.postmessage({
            type: 'SetValue',
            param
          })
        }
        //再取接口
        let data = await this.getVitalDataList()
        pgEditor.setTheDefaultData(data)
      }
    },
    async injectUpdateVitalSignsDataListAsync(subDocId) {
      let data = await this.getVitalDataList()
      const pgEditor = this.getEditor()
      let list = this.loadedSubDocList
      for (let i = 0; i < list.length; i++) {
        if (subDocId && subDocId != list[i].id) {
          continue
        }
        if (!list[i].hasContent && list[i]?.permission?.editable) {
          pgEditor.setTheDefaultData(data, list[i].id)
        }
      }
    },
    async clearVitalSignsDataAsync() {
      const pgEditor = this.getEditor()
      let data = await this.getVitalDataList()
      pgEditor.clearTheDefaultData(data)
    }
  }
}

export default vitalSignsDataMixin
