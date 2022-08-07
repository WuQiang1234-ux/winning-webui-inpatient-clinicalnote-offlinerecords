export default {
  namespaced: true,
  state: {
    patientList: [{ //患者列表
      name: '患者1',
      encounterId: 1,
    }],
    currentActiveLoadedPatient: {}//当前激活的患者
  },
  mutations: {
    addPatientList(store) {
      store.patientList.push({
        name: '患者' + (store.patientList.length + 1),
        encounterId: store.patientList.length + 1
      })
    },
    setCurrentActiveLoadedPatient(store, payload) {
      store.patientList.forEach(item => {
        if (item.encounterId == payload) {
          store.currentActiveLoadedPatient = item
        }
      })
    }
  },
  actions: {
  },
}