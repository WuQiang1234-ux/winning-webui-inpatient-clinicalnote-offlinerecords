<template>
  <div class="home-container">
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
.home-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .container-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #c8d0e8;
    // height: 120px;
    box-sizing: border-box;
  }
  .container-section {
    flex: 1 1 auto;
    width: 100%;
    height: calc(100% - 111px);
    display: flex;
    .container-letft-patient-list {
      width: 200px;
      height: 100%;
    }
  }
  .container-patient-content {
    background: #c8d0e8;
    padding: 8px;
    flex: 1 0 auto;
    width: calc(100% - 200px);
  }
}
</style>
