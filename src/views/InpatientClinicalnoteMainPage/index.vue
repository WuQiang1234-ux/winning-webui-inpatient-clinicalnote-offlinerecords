<template>
  <div class="inpatient-emr-index-wrap" element-loading-text="加载中" v-loading="patientLoding">
    <navigate-panel></navigate-panel>
    <edit-area class="inpatient-emr-editor"></edit-area>
    <AuxiliaryInfo
      class="auxiliary"
      :tabPosition="tabPosition"
      :isShowContent="isShowContent"
      @setIsShowContent="isShowContent = $event"
    />
  </div>
</template>

<script>
// /*global $:true*/
import $ from 'jquery'
import NavigatePanel from './InpatientEmrNavigatePanel/index.vue'
import EditArea from './InpatientEmrEditArea/index.vue'
import AuxiliaryInfo from './InpatientEmrAuxiliaryInfo/Index.vue'
import multi_clinicalnote_board_state from './mixins/multi_clinicalnote_board_state'
export default {
  name: '',
  components: { NavigatePanel, EditArea, AuxiliaryInfo },
  props: {},
  mixins: [multi_clinicalnote_board_state],
  data() {
    return {
      patientLoding: false,
      tabPosition: 'right', //控制右边辅助区域切换栏位置
      isShowContent: false, //控制右边辅助区域是否显示内容
    }
  },
  created() {
    this.patientLoding = true
  },
  mounted() {
    setTimeout(() => {
      this.patientLoding = false
    }, 200)
  },
  computed: {},
  watch: {
    isShowContent: {
      handler: function (v) {
        if (v) {
          this.isHiddenRight = false
          $('.resizeHandler').show()
        } else {
          this.isHiddenRight = true
          $('.resizeHandler').hide()
          //去掉拖拽后元素上的宽度
          this.$refs['inpatientMainPage']
            ?.getElementsByClassName('inpatient-emr-auxiliary')[0]
            .removeAttribute('style')
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {},
}
</script>

<style lang='scss' scoped >
.inpatient-emr-index-wrap {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
}
.resizeHandlerBg {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: transparent;
  cursor: w-resize;
  z-index: 9;
}
.resizeHandler {
  display: block;
  position: absolute;
  left: -2px;
  top: 0;
  height: 100%;
  width: 10px;
  background: transparent;
  cursor: w-resize;
}
.toggleHandler {
  display: block;
  position: absolute;
  left: 278px;
  top: 50%;
  margin-top: -44px;
  width: 20px;
  height: 88px;
  background: url(../../assets/svg/bg_open_handler.svg) center center no-repeat;
  background-size: contain;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  padding: 30px 2px 30px 0;
  cursor: pointer;
  z-index: 9;

  i {
    font-size: 12px;
    color: #7e89a4;
  }

  &.pullLeft {
    left: -2px;
  }
}
.rightToggleHandler {
  display: none;
  position: absolute;
  left: -19px;
  top: 50%;
  margin-top: -44px;
  width: 20px;
  height: 88px;
  background: url(../../assets/svg/bg_open_handler_right.svg) center center
    no-repeat;
  background-size: contain;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  padding: 30px 0;
  cursor: pointer;

  i {
    font-size: 12px;
    color: #7e89a4;
  }

  &.pullLeft {
    left: -2px;
  }
}
.inpatient-emr-navigation {
  position: relative;
  flex: 0 0 auto;
  width: 280px;
  border-radius: 4px;
  transition: all 500ms;
  -webkit-transition: all 500ms;
}

.inpatient-emr-editor {
  flex: 1 0 820px;
  min-width: 820px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  overflow: hidden;
  margin-left: 8px;
}

.inpatient-emr-auxiliary {
  position: relative;
  flex: 1 1 auto;
  width: 920px;
  min-width: 360px;
  z-index: 10;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
@media screen and (min-width: 1921px) {
  .inpatient-emr-navigation {
    width: 540px;
  }
  .toggleHandler {
    display: none;
  }
}

@media screen and (max-width: 1680px) {
  //窄屏展示右侧内容区域时样式变更
  .inpatient-emr-index-wrap.isShowContent {
    .inpatient-emr-auxiliary {
      width: 540px;
      min-width: 540px;
    }
  }

  .rightToggleHandler {
    display: block;
  }

  .inpatient-emr-index-wrap {
    padding-right: 60px;
  }
  .inpatient-emr-auxiliary {
    position: absolute;
    right: 0;
    top: 0;
    width: 60px;
    min-width: 60px;
    height: 100%;
    max-width: 50vw;
    flex: none;
  }
}
</style>
