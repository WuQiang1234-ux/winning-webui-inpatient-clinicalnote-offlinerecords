<template>
  <div class="patient">
    <ul class="patient-list">
      <li
        class="patient-list-item"
        v-for="item in patientList"
        @click="patientChange(item)"
        :key="item.id"
      >{{item.name}}</li>
    </ul>
    <div class="patient-list-add" @click="addPatient">新增 +</div>
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
  computed: { ...patientInfoMapState(['patientList']) },
  watch: {},
  created() {},
  mounted() {
    console.log(this.patientList)
  },
  methods: {
    ...patientInfoMapMutations(['addPatientList']),
    addPatient() {
      this.addPatientList()
    },
    patientChange(item) {
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
  }
  .patient-list-add {
    position: absolute;
    bottom: 0;
    width: 200px;
    background: #ccc;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>
