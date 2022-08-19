<template>
  <div>
    <!-- 暂时用这个代替一下 -->
    <i class="emr-icon-cancel"></i>
    <!-- <SymbolIcon
      v-if="iconImages[data.printedcode] && type == 'tree'"
      :icon-class="iconImages[data.printedcode]"
      class-name="icon_emr_status"
      :class="{editing:data.id===id,others:!data.rawData.writeSelf,'icon-marginRight':true}"
    />
    <SymbolIcon
      v-if="iconImages[data.currentStatusCode]"
      :icon-class="iconImages[data.currentStatusCode]"
      class-name="icon_emr_status"
      :class="{
      editing: data.id === id,
      others: !data.rawData.writeSelf,
      forbid: data.currentStatusCode == '399572897'
    }"
    />-->
  </div>
</template>

<script>
//加个注释
console.log('加个注释2')
export default {
  name: 'IconImages',
  props: {
    data: {
      type: Object,
      default() {
        return {}
      },
    },
    id: {
      type: [String, Number],
      default: '',
    },
    // 只在病历主界面病历簿模式展示打印图标
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      iconImages: {
        960074: 'wicon-status-emr-daishuxie', //新建
        390030405: 'wicon-status-emr-baocun', //已保存 草稿
        399297355: 'wicon-status-emr-tijiao', //已提交
        399017130: 'wicon-status-emr-tijiao', //审核中（暂用提交图标）
        399297358: 'wicon-status-emr-caogao', //驳回（暂用草稿图标）
        390030407: 'wicon-status-emr-shenhetongguo', //审核通过
        399291265: 'wicon-status-emr-yizhaohui', //已召回
        399572897: 'wicon-forbid-fill', //已封存
        399572894: 'wicon-password-fill', //已打印锁定
        1001: 'wicon-status-emr-bianji', //编辑中
        print: 'wicon-status-emr-dayin', //设置默认图标为打印样式
      },
    }
  },
  watch: {
    data: {
      handler: function (v) {
        if (!v?.currentStatusCode && v?.printedCount && !v?.isRoot)
          v.currentStatusCode = 'print'
        if (v?.printedCount && v?.printedCount > 0) {
          v.printedcode = 'print'
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">
.icon_emr_status {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  color: #48adf3;
  background-color: #fff;
  border-radius: 50%;
  margin: 0 2px 0 -6px;
  &.icon-marginRight {
    margin-right: 5px;
  }
  &.others {
    color: #2db7a0;
  }

  &.editing {
    color: #2d5afa;
  }

  &.forbid {
    color: #ec0000 !important;
  }
}
</style>
