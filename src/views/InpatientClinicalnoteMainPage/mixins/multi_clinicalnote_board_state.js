import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'
import Vue from 'vue'
let mixin = {
  provide() {
    return {
      patientRootComponent: this,
    }
  },
  props: {
    particulars: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      currentActiveLoadedClinicalnote: {}, //当前激活的病历信息
      loadedClinicalnoteList: [], //加载的所有病历
      currentPatientInfo: null, //当前区域的患者信息
      eventHub: new Vue(),
    }
  },
  computed: {
    loadedClinicalnoteIdList() {
      let loadedClinicalnoteList = this.loadedClinicalnoteList
      if (!loadedClinicalnoteList && !loadedClinicalnoteList.length) {
        return []
      }
      return loadedClinicalnoteList.map((item) => {
        return item.id
      })
    },
    currentActiveLoadedClinicalnoteId() {
      return this.currentActiveLoadedClinicalnote?.id ?? ''
    },
  },
  mounted() {
    this.currentPatientInfo = {
      ...this.particulars,
    }
  },
  methods: {
    addToLoadedClinicalnoteList(payload) {
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
      let _index = this.loadedClinicalnoteList.findIndex((item) => {
        return item.id === id
      })

      if (_index == -1) {
        this.loadedClinicalnoteList.push({
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
    setCurrentActiveClinicalnoteById(payload) {
      if (payload) {
        this.currentActiveLoadedClinicalnote = this.loadedClinicalnoteList.find(
          (item) => {
            return item.id === payload
          }
        )
      }
    },
    deleteInLoadedClinicalnoteListById(payload) {
      this.loadedClinicalnoteList.forEach((item, i) => {
        if (item.id == payload) {
          this.loadedClinicalnoteList.splice(i, 1)
        }
      })
    },
    clearLoadedClinicalnoteList() {
      this.loadedClinicalnoteList.length = 0
      this.currentActiveLoadedClinicalnote = {}
    },
    setCurrentEmrSetSerialId(payload) {
      //连续病历更新成当前查看病历的id
      this.currentActiveLoadedClinicalnote.options.content.emrSetId = payload
    },
  },
}
export default mixin
