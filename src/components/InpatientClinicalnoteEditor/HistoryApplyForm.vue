<template>
  <div class="medical-record-container">
    <HitoryApplyForm :user-info="userInfo" :encounter-info="currentPatientInfo"></HitoryApplyForm>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'HistoryApplyForm',
  computed: {
    ...mapState(['currentPatientInfo', 'userInfo'])
  }
}
</script>

<style lang="scss" scoped>
.medical-record-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}
</style>
