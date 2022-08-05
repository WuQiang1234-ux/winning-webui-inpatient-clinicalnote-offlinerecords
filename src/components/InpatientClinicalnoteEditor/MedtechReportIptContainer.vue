<template>
  <div class="medical-record-container" :class="{ 'm-qc-warp': ismMdicalArchive }">
    <template v-if="ismMdicalArchive">
      <el-radio-group v-model="medicalRadio" class="m-radio-warp">
        <el-radio label="MedicalInspection">检查</el-radio>
        <el-radio label="MedicalExamination">检验</el-radio>
      </el-radio-group>
      <component :is="QCMedtechReportIptContainer"></component>
    </template>
    <template v-else>
      <MedtechReportIpt :is-other="true" :other-encounter-info="currentPatientInfo"></MedtechReportIpt>
    </template>
  </div>
</template>

<script>
import { createNamespacedHelpers, mapState } from 'vuex'
const { mapMutations: componentsMapMutations } = createNamespacedHelpers(
  'components/multiClinicalnoteBoardState'
)

import MedicalInspection from './QCMedtechReportIptContainer/MedicalInspection'
import MedicalExamination from './QCMedtechReportIptContainer/MedicalExamination'

export default {
  name: 'MedicalRecordContainer',
  components: { MedicalInspection, MedicalExamination },
  props: {
    clinicalnoteData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      medicalRadio: 'MedicalInspection'
    }
  },
  computed: {
    ...mapState(['currentPatientInfo', 'qualityControlData']),
    ismMdicalArchive() {
      return this.qualityControlData?.ismMdicalArchive || false
    },
    QCMedtechReportIptContainer() {
      return this.medicalRadio
    }
  },
  mounted() {},
  methods: {
    ...componentsMapMutations([
      'showClinicalnoteLoading',
      'showClinicalnoteProcessing'
    ])
  }
}
</script>

<style lang="scss" scoped>
.medical-record-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}
.m-qc-warp {
  display: flex;
  flex-direction: column;
  .m-radio-warp {
    padding: 16px;
  }
}
</style>
