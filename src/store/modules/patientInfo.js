export default {
  namespaced: true,
  state: {
    patientList: [{
      name: '患者1',
      id: 1,
    }]
  },
  mutations: {
    addPatientList(store) {
      store.patientList.push({
        name: '患者' + (store.patientList.length + 1),
        id: store.patientList.length + 1
      })
    }
  },
  actions: {
  },
}