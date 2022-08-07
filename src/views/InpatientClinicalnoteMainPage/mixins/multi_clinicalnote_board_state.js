import { ClinicalnoteTypes } from '@/components/MultiClinicalnoteBoard'
let mixin = {
  provide() {
    return {
      currentActiveLoadedClinicalnote: this.currentActiveLoadedClinicalnote,
      loadedClinicalnoteList: this.loadedClinicalnoteList,
      addToLoadedClinicalnoteList: this.addToLoadedClinicalnoteList,
      setCurrentActiveClinicalnoteById: this.setCurrentActiveClinicalnoteById
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
  },
}
export default mixin