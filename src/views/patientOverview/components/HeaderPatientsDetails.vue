<template>
  <div class="header_Patients_details">
    <div class="winex">
      <div class="winex-logo">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#wicon-WiNEX" />
        </svg>
        <div class="application-name">住院医生站</div>
      </div>
      <div class="userName" title="曲忠森">曲忠森</div>
    </div>
    <div class="content">
      <div class="item">
        <!-- this.patientInfo.genderCode == '50602' ? '男性' : '女性' -->
        <svg
          class="icon"
          aria-hidden="true"
          v-if="currentActiveLoadedPatient.genderCode== '50602'"
        >
          <use xlink:href="#wicon-avatar-qingnianqi-nan" />
        </svg>
        <svg class="icon" aria-hidden="true" v-else>
          <use xlink:href="#wicon-avatar-qingnianqi-nv" />
        </svg>
      </div>
      <div class="item">
        <div class="header_title">姓名：</div>
        测试{{currentActiveLoadedPatient.name}}
      </div>
      <div class="item">
        <div class="header_title">床号：</div>1
      </div>
      <div class="item">
        <div class="header_title">科室：</div>骨科
      </div>
      <div class="item">
        <div class="header_title">encounterId：</div>
        {{currentActiveLoadedPatient.encounterId}}
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapState: patientInfoMapState } = createNamespacedHelpers('patientInfo')
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: { ...patientInfoMapState(['currentActiveLoadedPatient']) },
  watch: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.header_Patients_details {
  width: 100%;

  margin: auto;
  .winex {
    height: 40px;
    background: var(--COLOR-NORMAL, #2d5afa);
    padding: 0px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .winex-logo {
      display: flex;
      justify-items: center;
      align-items: center;
      .icon {
        width: 80px;
        height: 32px;
        color: #fff;
      }
    }
    .userName {
      font-family: SourceHanSansCN-Bold;
      font-size: 16px;
      font-weight: 600;
      width: 80px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      color: #fff;
      vertical-align: middle;
    }
    .application-name {
      display: inline-block;
      font-family: PingFangSC-Semibold;
      padding-left: 16px;
      font-size: 20px;
      color: #fff;
    }
  }
  .content {
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: var(--COLOR-ACTIVE-BG, #eef2fd);
    & .item:nth-of-type(1) {
      border-radius: 50%;
      overflow: hidden;
    }
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
      .icon {
        height: 50px;
        width: 50px;
      }
    }
  }
}
</style>
