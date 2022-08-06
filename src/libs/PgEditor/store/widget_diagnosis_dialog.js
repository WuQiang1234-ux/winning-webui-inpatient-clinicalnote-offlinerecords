import _ from 'lodash'
import { DiagnosisTypes } from '../constants'
const store = {
  state: {
    isShow: false,
    diagnosisType: DiagnosisTypes.ADMISSION_DIAGNOSIS,
    host: process.env.VUE_APP_PUBLIC_PATH,
    editor: {}
  },
  mutations: {
    setState(state = {}) {
      _.merge(this.state, state)
    },
    show(flag = false) {
      this.state.isShow = flag
    },
    setDiagnosisType(type) {
      this.state.diagnosisType = type
    }
  }
}

export default store
