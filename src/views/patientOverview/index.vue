<template>
  <div class="home">
    <div class="container">
      <header class="container-header">
        <header-patients-details></header-patients-details>
      </header>
      <section class="container-section">
        <div class="container-letft-patient-list">
          <patient-list></patient-list>
        </div>
        <div class="container-patient-content">
          <InpatientClinicalnoteMainPage
            v-for="item in cachePatientList"
            :key="item.encounterId"
            :particulars="item"
            v-show="currentActiveLoadedPatient.encounterId==item.encounterId"
          ></InpatientClinicalnoteMainPage>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: patientInfoMapState, mapMutations: patientInfoMapMutations } =
  createNamespacedHelpers('patientInfo')
import HeaderPatientsDetails from './components/HeaderPatientsDetails'
import PatientList from './components/PatientList'
import InpatientClinicalnoteMainPage from '../InpatientClinicalnoteMainPage/index.vue'
export default {
  name: 'patientOverview',
  components: {
    HeaderPatientsDetails,
    PatientList,
    InpatientClinicalnoteMainPage,
  },
  data() {
    return {}
  },
  computed: {
    ...patientInfoMapState(['cachePatientList', 'currentActiveLoadedPatient']),
  },
  methods: {
    ...patientInfoMapMutations([]),
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
        min-width: 200px;
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
