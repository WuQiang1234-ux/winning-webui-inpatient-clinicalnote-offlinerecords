<template>
  <div class="inpatient-emr-index-wrap" element-loading-text="加载中" v-loading="patientLoding">
    <navigate-panel></navigate-panel>
    <edit-area class="inpatient-emr-editor"></edit-area>
  </div>
</template>

<script>
import NavigatePanel from './InpatientEmrNavigatePanel/index.vue'
import EditArea from './InpatientEmrEditArea/index.vue'
import multi_clinicalnote_board_state from './mixins/multi_clinicalnote_board_state'
export default {
  name: '',
  components: { NavigatePanel, EditArea },
  props: {},
  mixins: [multi_clinicalnote_board_state],
  data() {
    return {
      patientLoding: false,
    }
  },
  created() {
    this.patientLoding = true
  },
  mounted() {
    setTimeout(() => {
      this.patientLoding = false
    }, 200)
  },
  computed: {},
  watch: {},
  methods: {},
}
</script>

<style scoped lang="scss">
.inpatient-emr-index-wrap {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .inpatient-emr-editor {
    flex: 1;
  }
}
</style>
