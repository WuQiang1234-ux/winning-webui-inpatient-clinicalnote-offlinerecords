<template>
  <div class="inpatient-emr-index-wrap">
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
      id: null,
    }
  },

  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.id = this.$router.currentRoute.params.id //只会执行一次
  },
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
