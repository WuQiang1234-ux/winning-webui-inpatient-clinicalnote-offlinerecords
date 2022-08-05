<template>
  <div class="doctor-reading-list">
    <div :id="doctorReadId" class="diagnosis-container"></div>
  </div>
</template>
<script>
import { loadMicroApp } from 'qiankun'

import { mapState } from 'vuex'
// import mixins from '../mixins'

export default {
  name: 'WidgetDiagnosisDialog',
  components: {},
  props: {},
  data() {
    return {
      isShow: true
    }
  },
  computed: {
    doctorReadId() {
      return `doctor-reading-list-${this.currentPatientInfo.encounterId}`
    },

    ...mapState(['currentPatientInfo', 'userInfo'])
  },
  // mixins: [ mixins.getInjectMixin() ],
  created() {},
  beforeDestroy() {
    this.microApp && this.microApp.unmount()
  },
  mounted() {
    this.handleDialogOpen()
  },
  methods: {
    handleDialogOpen() {
      console.log(this.currentPatientInfo)
      if (!this.microApp) {
        let url =
          window.location.href.indexOf('localhost') > -1
            ? 'http://172.16.7.59'
            : window.location.origin
        this.microApp = loadMicroApp({
          name: 'doctor-reading-list',
          entry: `${url}/webui-inpatient-charting/doctor-reading-list`,
          container: `#${this.doctorReadId}`,
          props: {
            componentName: 'doctorReadingList',
            data: {
              currentPatient: this.currentPatientInfo,
              single: true,
              isJindal: true
            }
          }
        })
        console.log(87976)
        console.log(this.microApp)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.doctor-reading-list,
.diagnosis-container {
  height: 100%;
  width: 100%;
}
</style>
