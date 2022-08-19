<template>
  <div
    ref="inpatientMainPage"
    class="inpatient-emr-index-wrap"
    element-loading-text="加载中"
    v-loading="patientLoding"
    :class="{ isShowContent }"
  >
    <div class="toggleHandler" :class="{ pullLeft: isHidden }" @click="isHidden = !isHidden">
      <i v-if="isHidden" class="el-icon-d-arrow-right"></i>
      <i v-else class="el-icon-d-arrow-left"></i>
    </div>
    <navigate-panel v-if="!isHidden"></navigate-panel>
    <edit-area class="inpatient-emr-editor"></edit-area>
    <div class="resizeHandlerBg"></div>
    <div class="inpatient-emr-auxiliary">
      <div class="resizeHandler"></div>
      <div
        class="rightToggleHandler"
        :class="{ pullRight: isHiddenRight }"
        @click="handleRightToggleHandler"
      >
        <i v-if="isHiddenRight" class="el-icon-d-arrow-left"></i>
        <i v-else class="el-icon-d-arrow-right"></i>
      </div>
      <AuxiliaryInfo
        class="auxiliary"
        :isShowContent="isShowContent"
        @setIsShowContent="isShowContent = $event"
      />
    </div>
  </div>
</template>

<script>
// /*global $:true*/
import $ from 'jquery'
import NavigatePanel from './InpatientEmrNavigatePanel/index.vue'
import EditArea from './InpatientEmrEditArea/index.vue'
import AuxiliaryInfo from './InpatientEmrAuxiliaryInfo/Index.vue'

import { createNamespacedHelpers } from 'vuex'
const { mapState: patientInfoMapState } = createNamespacedHelpers('patientInfo')
export default {
  name: 'patientRootComponent',
  components: { NavigatePanel, EditArea, AuxiliaryInfo },
  props: {
    particulars: {
      type: Object,
    },
  },

  provide() {},
  data() {
    return {
      patientLoding: false,
      isShowContent: false, //控制右边辅助区域是否显示内容
      isHidden: false, //是否隐藏左侧
      isHiddenRight: true, //是否隐藏右侧
    }
  },
  created() {
    this.$patientRootComponentStore.commit(
      'setCurrentPatientInfo',
      this.particulars
    )
  },
  mounted() {
    //1920及以下宽度右侧拖拽改变宽度
    this.dragControllerDiv()
    //浏览器宽度变化监听
    this.autoSetLayout()
    window.addEventListener('resize', this.autoSetLayout, false)
    this.registerEventBus()
  },
  beforeDestroy() {
    window.addEventListener('resize', null, false)
    this.removeEventBus()
  },
  computed: { ...patientInfoMapState(['currentActiveLoadedPatient']) },

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
    currentActiveLoadedPatient: {
      handler: function () {
        this.patientLoding = true
        setTimeout(() => {
          this.patientLoding = false
        }, 100)
      },
    },
  },
  methods: {
    registerEventBus() {
      //短语收藏、引用和病案质控需要定位辅助区域Tab
      this.$root.eventHub.$on(
        'AuxiliaryInfo/ShowContentArea',
        this.eventOpenAuxiliaryInfo
      )
    },
    removeEventBus() {
      this.$root.eventHub.$off(
        'AuxiliaryInfo/ShowContentArea',
        this.eventOpenAuxiliaryInfo
      )
    },
    eventOpenAuxiliaryInfo() {
      this.isShowContent = true
    },
    autoSetLayout() {
      let edge = window.winning ? 1694 : 1680
      if (document.documentElement.clientWidth > edge) {
        this.isShowContent = true
        $('.resizeHandler').show()
      } else {
        $('.resizeHandler').hide()
      }
    },
    dragControllerDiv() {
      let _box = this.$refs['inpatientMainPage']
      var auxiliaryBox = _box.getElementsByClassName(
        'inpatient-emr-auxiliary'
      )[0]
      var resizeHandler = _box.getElementsByClassName('resizeHandler')[0]
      var resizeHandlerBg = _box.getElementsByClassName('resizeHandlerBg')[0]
      resizeHandler.onmousedown = (e) => {
        var startX = e.clientX
        let oldWidth = $(auxiliaryBox).width()
        $(resizeHandlerBg).css('display', 'block')
        document.onmousemove = function (e) {
          var endX = e.clientX
          $(auxiliaryBox).width(oldWidth + (startX - endX))
        }
        document.onmouseup = function () {
          document.onmousemove = null
          document.onmouseup = null

          $(resizeHandlerBg).css('display', 'none')
          resizeHandler.releaseCapture && resizeHandler.releaseCapture()
        }
        resizeHandler.setCapture && resizeHandler.setCapture()
        return false
      }
    },
    handleRightToggleHandler() {
      this.isShowContent = !this.isShowContent
    },
  },
}
</script>

<style lang="scss" scoped>
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
  left: 300px;
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
</style>