<template>
  <div class="home">
    <div class="container">
      <header class="container-header">
        <header-patients-details></header-patients-details>
      </header>
      <section class="container-section">
        <div class="container-letft-patient-list">
          <patient-list @patientChange="patientChange"></patient-list>
        </div>
        <div class="container-patient-content">
          <keep-alive>
            <router-view :key="$route.fullPath" />
          </keep-alive>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import HeaderPatientsDetails from './components/HeaderPatientsDetails'
import PatientList from './components/PatientList'
export default {
  name: 'patientOverview',
  components: { HeaderPatientsDetails, PatientList },
  data() {
    return {}
  },
  methods: {
    patientChange(newPatient) {
      let oldPathFlag = false //是否已经有了该路由
      let skip = true //是否允许跳转

      let encounterId = newPatient.encounterId
      let newPath = '/patientOverview/' + encounterId
      this.$router.getRoutes().forEach((item) => {
        if (item.meta?.encounterId == encounterId) {
          oldPathFlag = true
        }
        if (this.$route.meta?.encounterId == encounterId) {
          skip = false
        }
      })
      if (!skip) {
        return
      }
      if (oldPathFlag) {
        this.$router.push(newPath)
        return
      }

      const routeObj = {
        path: newPath,
        name: '',
        meta: { encounterId },
        component: () => import('../InpatientClinicalnoteMainPage/index.vue'),
      }
      this.$router.addRoute('patientOverview', routeObj)
      this.$router.push(newPath)
    },
  },
}
</script>
<style scoped  lang="scss">
.home {
  height: 100%;
  width: 100%;
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    .container-header {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ccc;
      height: 60px;
      box-sizing: border-box;
    }
    .container-section {
      width: 100%;
      height: calc(100% - 60px);
      display: flex;
      .container-letft-patient-list {
        width: 200px;
        height: 100%;
      }
    }
    .container-patient-content {
      background: #ccc;
      padding: 10px;
      flex: 1;
    }
  }
}
</style>
