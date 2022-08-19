<template>
  <div class="test">
    测试
    <div class="bottom-btn-box">
      <el-button type="primary" size="small" @click="insertMedical">插入病历</el-button>
    </div>
  </div>
</template>

<script>
import getEventHubHelper from '@/utils/event_hub_helper.js'
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {
    this.eventHubHelper = getEventHubHelper(
      this.$patientRootComponentStore.state.eventHub
    )
  },
  mounted() {},
  methods: {
    //插入病历
    insertMedical() {
      let str = '测试'
      this.eventHubHelper.emit('AuxiliaryInfo/Insert', {
        isReplace: false,
        type: 'text',
        content: str,
        encounterId:
          this.$patientRootComponentStore.currentPatientInfo?.encounterId,
      })
    },
  },
}
</script>

<style scoped lang="scss">
</style>
