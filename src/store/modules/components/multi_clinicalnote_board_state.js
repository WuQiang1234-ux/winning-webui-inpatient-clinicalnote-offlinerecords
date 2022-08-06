/* eslint-disable no-empty-pattern */
import _ from 'lodash'
import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'

const multiClinicalnoteBoardState = {
  namespaced: true,
  state: {
    clinicalnoteProcessing: false,
    loadedClinicalnoteList: [],
    currentActiveLoadedClinicalnote: {}, //设置成空对象，防止使用过程中多次判断这个对象是否存在
    editorType: process.env.VUE_APP_EDITOR_TYPE, //使用编辑器类型 默认0 0 dc 1 pg
    pgEditorCurrentInputInfo: {}, //自研编辑器当前输入域信息
    smartReminderIsDot: false //智能提醒提示
  },
  getters: {
    loadedClinicalnoteIdList(state) {
      const { loadedClinicalnoteList } = state
      if (!loadedClinicalnoteList && !loadedClinicalnoteList.length) {
        return []
      }
      return loadedClinicalnoteList.map(item => {
        return item.id
      })
    },
    currentActiveLoadedClinicalnoteId(state) {
      const { currentActiveLoadedClinicalnote } = state
      return currentActiveLoadedClinicalnote?.id ?? ''
    }
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
        closeCb
      } = payload
      console.log('来了，‘')
      let _index = store.loadedClinicalnoteList.findIndex(item => {
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
          closeCb
        })
      }
      console.log(store.loadedClinicalnoteList, 'store.loadedClinicalnoteList')
    },
    modifyClinicalnoteDataById(store, payload = {}) {
      const { id, data } = payload
      console.log('modifyClinicalnoteDataById ------------- ', payload)
      if (payload) {
        let el = store.loadedClinicalnoteList.find(item => {
          return item.id === id
        })
        if (el) {
          _.merge(el, data)
          console.log('modifyClinicalnoteDataById result --------- ', el)
        }
      }
    },
    deleteInLoadedClinicalnoteListById(store, payload) {
      let tempArr = []
      store.loadedClinicalnoteList.forEach(item => {
        if (item.id != payload) {
          tempArr.push(item)
        }
      })
      store.loadedClinicalnoteList = tempArr
    },
    clearLoadedClinicalnoteList(store) {
      store.loadedClinicalnoteList.length = 0
      store.currentActiveLoadedClinicalnote = {}
    },

    setCurrentActiveClinicalnoteById(store, payload) {
      if (payload) {
        store.currentActiveLoadedClinicalnote = store.loadedClinicalnoteList.find(
          item => {
            return item.id === payload
          }
        )
      }
    },

    showClinicalnoteLoading(store, payload) {
      if (payload) {
        const { id, loading } = payload
        let el = store.loadedClinicalnoteList.find(item => {
          return item.id === id
        })
        if (el) {
          el.loading = loading
        }
      }
    },

    showClinicalnoteProcessing(store, payload = false) {
      store.clinicalnoteProcessing = payload
    },

    //设置病程记录的当前在操作的病程id
    setCurrentEmrSetSerialId(store, payload) {
      //连续病历更新成当前查看病历的id
      store.currentActiveLoadedClinicalnote.options.content.emrSetId = payload
    },
    setPgEditorCurrentInputInfo(store, payload) {
      store.pgEditorCurrentInputInfo = payload
    },
    setEmrExternalInpatientInfo(store, payload) {
      store.emrExternalInpatientInfo = payload
    },
    setSmartReminderIsDot(store, payload) {
      store.smartReminderIsDot = payload
    }
  },
  // 异步操作
  actions: {}
}
export default multiClinicalnoteBoardState
