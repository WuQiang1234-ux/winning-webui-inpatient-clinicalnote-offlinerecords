import _ from 'lodash'
import { DcEditorRenderModes } from '../constants'
const store = {
  state: {
    isShow: true,
    isDisableWorkMode: false,
    workModetype: DcEditorRenderModes.SET_WORK_MODE_APP, //书写模式/浏览模式
    isShowDiagnosisTool: true, //是否显示诊断控件
    isEmrSubmited: true, //是否置灰打印控件
    isShowSpecialSymbol: true, //是否显示特殊符号
    isShowMedicalFormula: true, //是否显示医学公式
    isShowPrint: true, //是否显示打印
    parameterConfiguration: {
      inpatEmrSetId: ''
    } //属性
  },
  mutations: {
    setState(state = {}) {
      _.merge(this.state, state)
    },
    setShowDiagnosisTool(flag) {
      this.state.isShowDiagnosisTool = flag
    },
    setParameterConfiguration(obj) {
      _.merge(this.state.parameterConfiguration, obj)
    }
  }
}

export default store
