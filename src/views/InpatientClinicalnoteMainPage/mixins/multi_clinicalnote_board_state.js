import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'
let mixin = {
  provide() {
    return {
      currentActiveLoadedClinicalnote: this.currentActiveLoadedClinicalnote,
      loadedClinicalnoteList: this.loadedClinicalnoteList,
      addToLoadedClinicalnoteList: this.addToLoadedClinicalnoteList,
      setCurrentActiveClinicalnoteById: this.setCurrentActiveClinicalnoteById,
      loadedClinicalnoteIdList: this.loadedClinicalnoteIdList,
      deleteInLoadedClinicalnoteListById: this.deleteInLoadedClinicalnoteListById,
      clearLoadedClinicalnoteList: this.clearLoadedClinicalnoteList
    }
  }
  ,
  data() {
    return {
      currentActiveLoadedClinicalnote: {},
      loadedClinicalnoteList: [],
      areaEncounterId: null //当前区域的患者id
    }
  },
  created() {
    console.log('实例花了？')
  },
  computed: {
    loadedClinicalnoteIdList() {
      let loadedClinicalnoteList = this.loadedClinicalnoteList
      if (!loadedClinicalnoteList && !loadedClinicalnoteList.length) {
        return []
      }
      return loadedClinicalnoteList.map(item => {
        return item.id
      })
    },

  },
  mounted() {
    this.areaEncounterId = this.$router.currentRoute.params.id //只会执行一次

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
        closeCb
      } = payload
      console.log('来了，‘')
      let _index = this.loadedClinicalnoteList.findIndex(item => {
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
          closeCb
        })
      }
    },
    setCurrentActiveClinicalnoteById(payload) {
      if (payload) {
        let currentActiveLoadedClinicalnote = this.loadedClinicalnoteList.find(
          item => {
            return item.id === payload
          }
        )
        for (let key in currentActiveLoadedClinicalnote) {
          this.$set(this.currentActiveLoadedClinicalnote, key, currentActiveLoadedClinicalnote[key])
        }
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
  },
}
export default mixin