export default {
  namespaced: true,
  state: {
    patientList: [
      {
        //患者列表
        name: '患者1',
        encounterId: 1,
      },
    ],
    cachePatientList: [], //缓存的患者列表
    currentActiveLoadedPatient: {}, //当前激活的患者
  },
  mutations: {
    addPatientList(store) {
      store.patientList.push({
        name: '患者' + (store.patientList.length + 1),
        encounterId: store.patientList.length + 1,
      })
    },
    addCachePatientList(store, payload) {
      let activateItem = store.patientList.find(
        (item) => item.encounterId == payload
      )
      let flag = store.cachePatientList.some(
        (item) => item.encounterId == payload
      )
      if (flag) {
        store.currentActiveLoadedPatient = activateItem
      } else {
        store.cachePatientList.push(activateItem)
        store.currentActiveLoadedPatient = activateItem
        if (store.cachePatientList.length > 10) {
          store.cachePatientList.shift()
        }
      }
    },
  },
  actions: {},
}
