<template>
  <div class="test">
    测试
    <div class="bottom-btn-box">
      <el-button type="primary" size="small" @click="insertMedical">插入病历</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {}
  },
  inject: ['patientRootComponent'],
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    //插入病历
    insertMedical() {
      let str = '测试'
      this.$root.eventHub.$emit('AuxiliaryInfo/Insert', {
        isReplace: false,
        type: 'text',
        content: str,
        encounterId: this.patientRootComponent.currentPatientInfo.encounterId,
      })
    },
  },
}
</script>

<style scoped lang="scss">
</style>
