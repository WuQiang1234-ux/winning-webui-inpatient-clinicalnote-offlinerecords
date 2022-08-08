const multiClinicalnoteBoardState = {
  namespaced: true,
  state: {
    clinicalnoteProcessing: false,
    pgEditorCurrentInputInfo: {}, //自研编辑器当前输入域信息
  },
  getters: {},
  mutations: {
    showClinicalnoteProcessing(store, payload = false) {
      store.clinicalnoteProcessing = payload
    },
    setPgEditorCurrentInputInfo(store, payload) {
      store.pgEditorCurrentInputInfo = payload
    },
  },
  // 异步操作
  actions: {},
}
export default multiClinicalnoteBoardState
