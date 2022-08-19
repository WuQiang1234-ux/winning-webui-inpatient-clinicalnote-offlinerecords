<template>
  <div class="inpatient-emr-edit-area-wrap">
    <MultiClinicalnoteBoard v-show="loadedClinicalnoteList.length" />
  </div>
</template>

<script>
import MultiClinicalnoteBoard from '@/components/MultiClinicalnoteBoard'
export default {
  name: '',
  components: { MultiClinicalnoteBoard },
  props: {},
  data() {
    return {}
  },
  computed: {
    loadedClinicalnoteList() {
      return this.$patientRootComponentStore.state
        .multi_clinicalnote_board_state.loadedClinicalnoteList
    },
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.inpatient-emr-edit-area-wrap {
  background: white;
}
</style>
