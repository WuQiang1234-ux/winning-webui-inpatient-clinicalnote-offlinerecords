<template>
  <div class="inpatient-emr-edit-area-wrap">
    <MultiClinicalnoteBoard v-show="patientRootComponent.loadedClinicalnoteList.length" />
  </div>
</template>

<script>
import MultiClinicalnoteBoard from '@/components/MultiClinicalnoteBoard'
export default {
  name: '',
  inject: ['patientRootComponent'],
  components: { MultiClinicalnoteBoard },
  props: {},
  data() {
    return {}
  },
  computed: {},
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
