<template>
  <div class="patient">
    <ul class="patient-list">
      <li
        ref="patientListItem"
        :class="['patient-list-item',{activeStyle:item.encounterId==currentActiveLoadedPatient.encounterId}]"
        v-for="item in patientList"
        @click="patientChange(item)"
        :key="item.encounterId"
      >{{item.name}}</li>
    </ul>
    <div class="patient-list-add">
      <el-button type="primary" @click="addPatient">新增患者</el-button>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: patientInfoMapState, mapMutations: patientInfoMapMutations } =
  createNamespacedHelpers('patientInfo')
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {
    ...patientInfoMapState(['patientList', 'currentActiveLoadedPatient']),
  },
  watch: {},
  created() {},
  mounted() {
    let patientListItem = this.$refs.patientListItem
    console.log(patientListItem)
    if (patientListItem.length) {
      console.log('有患者')
      let dom = patientListItem[0]

      this.setCurrentActiveLoadedPatient(this.patientList[0].encounterId)
      dom.click()
    }
  },
  methods: {
    ...patientInfoMapMutations([
      'addPatientList',
      'setCurrentActiveLoadedPatient',
    ]),
    addPatient() {
      this.addPatientList()
    },
    patientChange(item) {
      this.setCurrentActiveLoadedPatient(item.encounterId)
      this.$emit('patientChange', item)
    },
  },
}
</script>

<style scoped lang="scss">
.patient {
  height: 100%;
  position: relative;
  border-right: 1px solid #ccc;
  .patient-list {
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 10px 10px 50px 10px;
    box-sizing: border-box;

    .patient-list-item {
      width: 100%;
      display: flex;
      cursor: pointer;
      margin-top: 10px;
      background: #1d39c4;
      height: 40px;
      border-radius: 8px;
      justify-content: center;
      align-items: center;
      text-align: center;
      color: #fff;
      &:hover {
        background: #eaeefe;
        color: #1d39c4;
      }
    }
    .activeStyle {
      background: #eaeefe;
      color: #1d39c4;
    }
  }
  .patient-list-add {
    position: absolute;
    padding-bottom: 6px;
    bottom: 0;
    width: 100%;
    background: #fff;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 5px;
  }
}
</style>
