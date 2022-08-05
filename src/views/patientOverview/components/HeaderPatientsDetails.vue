<template>
  <div class="header_Patients_details">
    <div class="content">
      <div class="item">
        <div class="header_title">床号：</div>1
      </div>
      <div class="item">
        <div class="header_title">科室：</div>骨科
      </div>
      <div class="item">
        <div class="header_title">encounterId：</div>111111
      </div>
      <div class="item">
        <div class="header_title">姓名：</div>测试
      </div>
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
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.header_Patients_details {
  width: 100%;
  padding: 0px 20px;
  margin: auto;
  .content {
    display: flex;
    align-items: center;
    justify-content: space-around;
    .item {
      display: flex;
      justify-items: center;
      align-items: center;
      /deep/.el-input__inner {
        width: 20px;
        height: 24px;
      }
      .header_title {
        font-size: 26px;
      }
    }
  }
}
</style>
