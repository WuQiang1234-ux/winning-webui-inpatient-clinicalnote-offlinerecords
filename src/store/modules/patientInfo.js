export default {
  namespaced: true,
  state: {
    //总患者列表
    patientList: [
      {
        name: '患者1',
        encounterId: 1,
      },
      {
        name: '患者2',
        encounterId: 2,
      },
    ],
    cachePatientList: [], //缓存的患者列表
    currentActiveLoadedPatient: {}, //当前激活的患者
    maxCache: 10, //最大缓存的患者数
  },
  mutations: {
    //新增患者
    addPatientList(store) {
      store.patientList.push({
        name: '患者' + (store.patientList.length + 1),
        encounterId: store.patientList.length + 1,
      })
    },
    //新增缓存患者
    addCachePatientList(store, payload) {
      let activateItem = store.patientList.find(
        (item) => item.encounterId == payload
      )
      let flag = store.cachePatientList.some(
        (item) => item.encounterId == payload
      )
      if (!flag) {
        store.cachePatientList.push(activateItem)
        if (store.cachePatientList.length > store.maxCache) {
          store.cachePatientList.shift()
        }
      }
      store.currentActiveLoadedPatient = activateItem
    },
  },
  actions: {},
}
