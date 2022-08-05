<template>
  <div class="medical-record-container">
    <InpCliSignOffOrder :user-info="userInfo" :encounter-info="currentPatientInfo" />
  </div>
</template>

<script>
import { createNamespacedHelpers, mapState } from 'vuex'
const { mapMutations: componentsMapMutations } = createNamespacedHelpers(
  'components/multiClinicalnoteBoardState'
)

export default {
  name: 'MedicalRecordContainer',
  components: {},
  props: {
    clinicalnoteData: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(['currentPatientInfo', 'userInfo'])
  },
  mounted() {
    // document.getElementById(this.clinicalnoteData.id).onload = () => {
    //   this.showClinicalnoteLoading({
    //     id: this.clinicalnoteData.id,
    //     loading: false
    //   })
    // }
  },
  methods: {
    ...componentsMapMutations(['showClinicalnoteLoading'])
  }
}
</script>

<style lang="scss">
$classNamespace: 'inpatient-clinicalnote-editor';
.medical-record-container {
  height: 100%;
  width: 100%;
}
</style>
