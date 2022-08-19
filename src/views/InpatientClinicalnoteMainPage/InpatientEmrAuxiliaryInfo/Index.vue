<template>
  <div :key="auxiliaryInfoKey" class="inpatient-emr-auxiliary-info">
    <!-- <i class="el-icon-close" @click="handleIconClose"></i> -->
    <el-tabs
      v-model="activeName"
      class="auxiliary-info-tab"
      tab-position="left"
      @tab-click="handleTabClick"
    >
      <template v-for="el in tabPaneList">
        <el-tab-pane :key="el.code" :label="el.label" :name="el.name">
          <!-- 生命体征 -->
          <!-- <nursing-info v-if="activeName === el.name && el.code == '399574003'"></nursing-info> -->
          <!-- 短语引用 -->
          <phrase-refen
            v-if="el.code == '399574005'"
            v-show="activeName === el.name"
            :auxiliaryTab="activeName"
          ></phrase-refen>
          <!-- 既往病历 -->
          <!-- 从主界面进入不显示当前的病历，从会诊管理和任务中心的会诊进入则需要显示当前病历 -->
          <emr-history v-if="activeName === el.name && el.code == '399573998'"></emr-history>
        </el-tab-pane>
      </template>
    </el-tabs>
  </div>
</template>

<script>
// /*global $:true*/
// import $ from 'jquery'
import PhraseRefen from './PhraseRefen/Index'
import EmrHistory from './EmrHistory/Index.vue'
export default {
  name: 'InpatientEmrAuxiliaryInfo',
  components: {
    PhraseRefen,
    EmrHistory,
  },
  props: {
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
      activeName: 'nursingInfo',
      auxiliaryInfoKey: +new Date(),
      tabPaneList: [
        {
          label: '短语引用',
          code: '399574005',
          name: 'phraseRefen',
        },
        {
          label: '既往病历',
          code: '399573998',
          name: 'emrHistory',
        },
      ], //全量的,
    }
  },
  computed: {},
  watch: {
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
  mounted() {},
  beforeDestroy() {},
  methods: {
    removeEventBus() {},
    handleEventActiveTab(val) {
      if (this.activeName !== val) {
        this.activeName = val
      }
    },
    // handleIconClose() {
    //   //关闭重置所有状态
    //   this.auxiliaryInfoKey = +new Date()
    // },
    handleTabClick() {},
  },
}
</script>

<style lang="scss" scoped>
.inpatient-emr-auxiliary-info {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #fff;
  overflow: hidden;
  border-left: 1px solid #c9c9c9;

  .el-icon-close {
    position: absolute;
    right: 15px;
    top: 14px;
    font-size: 18px;
    color: #7a85a1;
    z-index: 999;
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
