<template>
  <div :key="auxiliaryInfoKey" class="inpatient-emr-auxiliary-info-wrap">
    <div class="inpatient-emr-auxiliary-info">
      <i
        v-if="isShowContent && tabPosition == 'right'"
        class="el-icon-close"
        @click="handleIconClose"
      ></i>
      <el-tabs
        v-model="activeName"
        class="auxiliary-info-tab"
        :tab-position="tabPosition"
        @tab-click="handleTabClick"
      >
        <template v-for="el in tabPaneList">
          <el-tab-pane :key="el.code" :label="el.label" :name="el.name">
            <!-- 生命体征 -->
            <nursing-info v-if="activeName === el.name && el.code == '399574003'"></nursing-info>
          </el-tab-pane>
        </template>
      </el-tabs>
    </div>
  </div>
</template>

<script>
// /*global $:true*/
// import $ from 'jquery'
import NursingInfo from './NursingInfo/Index.vue'
export default {
  name: 'InpatientEmrAuxiliaryInfo',
  components: {
    NursingInfo,
  },
  props: {
    tabPosition: {
      type: String,
      default: 'left',
    },
    isShowContent: {
      type: Boolean,
      default: true,
    },
  },
  inject: {
    auxiliaryInfoEntrance: {
      default: 'clinicalnoteMain',
    },
  },
  data() {
    return {
      activeName: 'inputAssistant',
      auxiliaryInfoKey: +new Date(),
      tabPaneList: [
        {
          label: '生命体征',
          code: '399574003',
          name: 'nursingInfo',
        }, //'生命体征'
      ], //全量的,
    }
  },
  computed: {},
  watch: {
    tabPosition: {
      handler: function (v) {
        v == 'left' && this.setIsShowContent(true)
      },
      deep: true,
      immediate: true,
    },
    // isShowContent: {
    //   handler: function (v) {
    //     if (v) {
    //       $('.auxiliary-info-tab .el-tabs__content').show()
    //       $('.rightFixedAuxiliarySection .auxiliary').css({ width: '600px' })
    //     } else {
    //       $('.auxiliary-info-tab .el-tabs__content').hide()
    //       $('.rightFixedAuxiliarySection .auxiliary').css({ width: 'auto' })
    //     }
    //   },
    //   deep: true,
    //   immediate: true,
    // },
    currentPatientInfo: {
      handler: function () {
        this.auxiliaryInfoKey = +new Date()
      },
      deep: true,
    },
  },
  async created() {},
  mounted() {
    // this.registerEventBus()
  },
  beforeDestroy() {
    // this.removeEventBus()
  },
  methods: {
    // ...clinicalnoteMapActions(['getPersonalSetting']),
    // setIsShowContent(e) {
    //   this.$emit('setIsShowContent', e)
    // },
    // registerEventBus() {
    //   //短语收藏、引用和病案质控需要定位辅助区域Tab
    //   this.$root.eventHub.$on(
    //     'AuxiliaryInfo/SetActiveTab',
    //     this.handleEventActiveTab
    //   )
    //   this.$root.eventHub.$on(
    //     'clinicalnote/openInspectReportByAudio',
    //     this.openInspectReportByAudio
    //   )

    //   this.$root.eventHub.$on(
    //     'clinicalnote/openQualityRemindPoll',
    //     this.pollFetch
    //   )
    // },
    removeEventBus() {
      // this.$root.eventHub.$off(
      //   'clinicalnote/openInspectReportByAudio',
      //   this.openInspectReportByAudio
      // )
      // this.$root.eventHub.$off(
      //   'AuxiliaryInfo/SetActiveTab',
      //   this.handleEventActiveTab
      // )
      // this.$root.eventHub.$off(
      //   'clinicalnote/openQualityRemindPoll',
      //   this.pollFetch
      // )
    },
    handleEventActiveTab(val) {
      if (this.activeName !== val) {
        this.activeName = val
      }
    },
    handleIconClose() {
      //关闭重置所有状态
      this.auxiliaryInfoKey = +new Date()
      this.setIsShowContent(false)
    },
    handleTabClick() {},
  },
}
</script>

<style lang="scss" scoped>
.inpatient-emr-auxiliary-info-wrap {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #fff;
  overflow: hidden;
  border-left: 1px solid #c9c9c9;
  .inpatient-emr-auxiliary-info {
    position: relative;
    width: 100%;
    height: 100%;
    .el-icon-close {
      position: absolute;
      right: 72px;
      top: 14px;
      font-size: 18px;
      color: #7a85a1;
      z-index: 999;
    }
  }
}

.auxiliary-info-tab {
  /deep/ &.el-tabs--left,
  /deep/ &.el-tabs--right {
    width: 100%;
    height: 100%;
    & > .el-tabs__header.is-left,
    & > .el-tabs__header.is-right {
      margin-right: 0;
      margin-left: 0;

      & > .el-tabs__nav-wrap.is-left.is-scrollable,
      & > .el-tabs__nav-wrap.is-right.is-scrollable {
        padding-bottom: 34px;

        & > .el-tabs__nav-prev,
        & > .el-tabs__nav-next {
          background: #fff;
          z-index: 999;
          width: 58px;
          left: 1px;
        }
      }

      & > .el-tabs__nav-wrap.is-left,
      & > .el-tabs__nav-wrap.is-right {
        &::after {
          width: 1px;
        }
        & > .el-tabs__nav-scroll {
          & > .el-tabs__nav {
            & > .el-tabs__active-bar {
              display: none;
            }

            & > .el-tabs__item.is-left,
            & > .el-tabs__item.is-right {
              display: block;
              width: 48px;
              height: 48px;
              font-size: 16px;
              color: #000;
              text-align: center;
              padding: 3px 0;
              box-sizing: border-box;
              list-style: none;
              line-height: 20px;
              white-space: pre-wrap;
              word-wrap: break-word;
              margin: 16px 6px;
              background: #ffffff;
              border: 1px solid #c9c9c9;
              border-radius: 4px;
              &.is-active {
                color: #fff;
                background: var(--COLOR-NORMAL);
                border-color: var(--COLOR-NORMAL);
              }
            }
          }
        }
      }

      & > .is-scrollable .el-tabs__nav-scroll {
        margin: -14px 0 -34px 0;
        overflow: visible;
      }
    }

    & > .el-tabs__content {
      height: 100%;
      & > .el-tab-pane {
        height: 100%;
      }
    }
  }
  /deep/ .el-badge__content.is-fixed.is-dot {
    right: 7px;
    height: 16px;
    width: 16px;
  }
}
</style>
