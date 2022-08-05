<template>
  <div class="inpatient-emr-index-wrap">
    <navigate-panel></navigate-panel>
    <edit-area class="inpatient-emr-editor"></edit-area>
  </div>
</template>

<script>
import NavigatePanel from './InpatientEmrNavigatePanel/index.vue'
import EditArea from './InpatientEmrEditArea/index.vue'
export default {
  name: '',
  components: { NavigatePanel, EditArea },
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
