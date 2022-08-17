import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'

export default function () {
  return {
    namespaced: true,
    state: {
      currentActiveLoadedClinicalnote: {}, //当前激活的病历信息
      loadedClinicalnoteList: [], //加载的所有病历
      currentPatientInfo: null, //当前区域的患者信息
    },
    mutations: {
      addToLoadedClinicalnoteList(store, payload) {
        const {
          id,
          title = '',
          emrClass,
          loading = false,
          options = {},
          type = ClinicalnoteTypes.INPATIENT_CLINICALNOTE,
          closeCb,
        } = payload
        console.log('来了，‘')
        let _index = store.loadedClinicalnoteList.findIndex((item) => {
          return item.id === id
        })

        if (_index == -1) {
          store.loadedClinicalnoteList.push({
            id,
            title,
            emrClass,
            loading,
            options, // 具体传什么，都各自处理
            type,
            closeCb,
          })
        }
      },
      setCurrentActiveClinicalnoteById(store, payload) {
        if (payload) {
          store.currentActiveLoadedClinicalnote =
            store.loadedClinicalnoteList.find((item) => {
              return item.id === payload
            })
        }
      },
      deleteInLoadedClinicalnoteListById(store, payload) {
        store.loadedClinicalnoteList.forEach((item, i) => {
          if (item.id == payload) {
            store.loadedClinicalnoteList.splice(i, 1)
          }
        })
      },
      clearLoadedClinicalnoteList(store) {
        store.loadedClinicalnoteList.length = 0
        store.currentActiveLoadedClinicalnote = {}
      },
      setCurrentEmrSetSerialId(store, payload) {
        //连续病历更新成当前查看病历的id
        store.currentActiveLoadedClinicalnote.options.content.emrSetId = payload
      },
    },
    getters: {
      loadedClinicalnoteIdList(state) {
        const { loadedClinicalnoteList } = state
        if (!loadedClinicalnoteList && !loadedClinicalnoteList.length) {
          return []
        }
        return loadedClinicalnoteList.map((item) => {
          return item.id
        })
      },
      currentActiveLoadedClinicalnoteId(state) {
        const { currentActiveLoadedClinicalnote } = state
        return currentActiveLoadedClinicalnote?.id ?? ''
      },
    },
  }
}
