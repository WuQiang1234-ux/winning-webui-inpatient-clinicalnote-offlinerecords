import api from '@/api/list.js'
let mixin = {
  data() {
    return {
      //是否已请求过诊断数据  防止无诊断数据时反复请求
      hasGetDiagnosisFlag: false,
      //当前病人所有的诊断
      allDiagnosisInfo: []
    }
  },
  computed: {
    diagnosisListInAllType() {
      let diagnosisObj = {}
      this.allDiagnosisInfo.forEach(v => {
        if (diagnosisObj[v.diagnosisTypeCode]) {
          diagnosisObj[v.diagnosisTypeCode].push(v)
        } else {
          diagnosisObj[v.diagnosisTypeCode] = [v]
        }
      })
      return diagnosisObj
    }
  },
  methods: {
    async getAllDiagnosisInfo() {
      const { success, data } = await api.getDiagnosisList({
        encounterId: this.currentPatientInfo.encounterId
      })
      if (success && data?.length) {
        this.hasGetDiagnosisFlag = true
        this.allDiagnosisInfo = data
      }
    }
  }
}

export default mixin
