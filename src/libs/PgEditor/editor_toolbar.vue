<template>
  <div v-show="store.toolbar.state.isShow" :class="classNames.editorToolbar">
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="撤销"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            pgEditorVm.pgEditorInstance.postmessage({ type: 'Undo', param: '' })
          }
        "
      >
        <i class="emr-icon-cancel"></i>
      </el-button>
    </el-tooltip>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="还原"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            pgEditorVm.pgEditorInstance.postmessage({ type: 'Redo', param: '' })
          }
        "
      >
        <i class="emr-icon-recover"></i>
      </el-button>
    </el-tooltip>
    <span class="split-line"></span>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="复制"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            pgEditorVm.pgEditorInstance.postmessage({ type: 'Copy', param: '' })
          }
        "
      >
        <i class="emr-icon-copy"></i>
      </el-button>
    </el-tooltip>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="剪切"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            pgEditorVm.pgEditorInstance.postmessage({ type: 'Cut', param: '' })
          }
        "
      >
        <i class="emr-icon-cut"></i>
      </el-button>
    </el-tooltip>
    <span class="split-line"></span>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="上标"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            fontBoolObj.SetSuperscript = !fontBoolObj.SetSuperscript
            pgEditorVm.pgEditorInstance.postmessage({
              type: 'SetSuperscript',
              param: [fontBoolObj.SetSuperscript]
            })
          }
        "
      >
        <i class="emr-icon-superscript"></i>
      </el-button>
    </el-tooltip>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="下标"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            fontBoolObj.SetSubscript = !fontBoolObj.SetSubscript
            pgEditorVm.pgEditorInstance.postmessage({
              type: 'SetSubscript',
              param: [fontBoolObj.SetSubscript]
            })
          }
        "
      >
        <i class="emr-icon-subscript"></i>
      </el-button>
    </el-tooltip>
    <span class="split-line"></span>
    <el-tooltip
      v-if="store.toolbar.state.isShowMedicalFormula"
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="医学公式"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            store.widgetMedicalFormulaDialog.state.isShow = true
          }
        "
      >
        <i class="emr-icon-designformulas"></i>
      </el-button>
    </el-tooltip>
    <el-tooltip
      v-if="store.toolbar.state.isShowSpecialSymbol"
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="特殊符号"
      placement="bottom"
    >
      <el-button
        @click="
          () => {
            store.widgetSpecialSymbolsDialog.state.isShow = true
          }
        "
      >
        <i class="emr-icon-spechars"></i>
      </el-button>
    </el-tooltip>
    <span class="split-line"></span>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="插入表格"
      placement="bottom"
    >
      <el-popover
        ref="widgetTableCreator"
        placement="bottom"
        title="插入表格"
        width="300"
        trigger="click"
      >
        <WidgetTableCreator @submit="handleInsertTable" @cancel="handleCloseTableCreator" />
        <el-button slot="reference">
          <i class="emr-icon-insertform"></i>
        </el-button>
      </el-popover>
    </el-tooltip>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="打印"
      placement="bottom"
    >
      <el-button
        v-if="store.toolbar.state.isShowPrint"
        :disabled="!store.toolbar.state.isEmrSubmited"
        @click="handleEditorPrintAction"
      >
        <i class="emr-icon-print"></i>
      </el-button>
    </el-tooltip>
    <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="批注模式"
      placement="bottom"
    >
      <el-button :disabled="!store.toolbar.state.annotationStatus" @click="handleAnnotation">
        <i class="emr-icon-duanyu"></i>
      </el-button>
    </el-tooltip>
    <!-- <el-tooltip
      popper-class="pg-editor-toolbar-tooltips"
      effect="light"
      content="刷新病历"
      placement="bottom"
    >
      <el-button icon="el-icon-refresh" style="font-size:16px" @click="handleRefreshClinicalnote"></el-button>
    </el-tooltip>-->
    <span class="split-line"></span>
    <template v-if="contentRenderMode !== dcEditorRenderModes.A_SETVIEWMODE_WEB">
      <el-tooltip
        popper-class="pg-editor-toolbar-tooltips"
        effect="light"
        content="编辑模式"
        placement="top"
      >
        <!-- 
          目前病历提交之后会处于浏览模式，以便右键下诊断
          需要将工具栏上的病历模式置于书写模式
          并在工具栏图标切换为书写模式时病历对应切换为书写模式或浏览模式
        -->
        <el-button
          :disabled="store.toolbar.state.isDisableWorkMode"
          :class="{
            active:
              contentRenderMode == dcEditorRenderModes.SET_WORK_MODE_APP ||
              contentRenderMode == dcEditorRenderModes.SET_WORK_MODE_BROWSE
          }"
          @click="contentRenderMode = store.toolbar.state.workModetype"
        >
          <i class="emr-icon-edit"></i>
        </el-button>
      </el-tooltip>
      <el-tooltip
        popper-class="pg-editor-toolbar-tooltips"
        effect="light"
        content="打印预览模式"
        placement="top"
      >
        <el-button
          :class="{
            active: contentRenderMode == dcEditorRenderModes.SET_PRINT_PREVIEW
          }"
          @click="contentRenderMode = dcEditorRenderModes.SET_PRINT_PREVIEW"
        >
          <i class="emr-icon-preview"></i>
        </el-button>
      </el-tooltip>
      <el-tooltip
        popper-class="pg-editor-toolbar-tooltips"
        effect="light"
        content="痕迹模式"
        placement="top"
      >
        <!-- :disabled="!store.toolbar.state.isEmrSubmited" -->
        <el-button
          :class="{
            active:
              contentRenderMode == dcEditorRenderModes.SET_WORK_MODE_KEEP_TRACE
          }"
          @click="
            contentRenderMode = dcEditorRenderModes.SET_WORK_MODE_KEEP_TRACE
          "
        >
          <i class="emr-icon-mark"></i>
        </el-button>
      </el-tooltip>
    </template>

    <section>
      <el-button
        :class="['btn-more', { color: isShowFontSetting }]"
        @click="isShowFontSetting = !isShowFontSetting"
      >
        更多
        <i class="el-icon-caret-bottom el-icon--right"></i>
      </el-button>
      <article v-if="isShowFontSetting" @mouseenter="isShowFontSetting = true">
        <div>
          <el-select
            v-model="currentFontFamily"
            size="mini"
            placeholder="字体"
            class="editor-toolbar-selection font-name-selection"
            @change="
              val => {
                pgEditorVm.pgEditorInstance.postmessage({
                  type: 'SetFontName',
                  param: [val, val]
                })
              }
            "
            @visible-change="isShowFontSetting = true"
          >
            <el-option
              v-for="i in fontFamilyOptionArr"
              :key="'fontFamily' + i"
              :label="i"
              :value="i"
            ></el-option>
          </el-select>
          <el-select
            v-model="currentFontSize"
            size="mini"
            placeholder="字号"
            class="editor-toolbar-selection font-size-selection"
            @change="
              val => {
                pgEditorVm.pgEditorInstance.postmessage({
                  type: 'SetFontSize',
                  param: [val, val]
                })
              }
            "
          >
            <el-option
              v-for="i in fontSizeOptionArr"
              :key="'fontSize' + i"
              :label="i + 'px'"
              :value="i + 'px'"
            ></el-option>
          </el-select>

          <el-tooltip
            popper-class="pg-editor-toolbar-tooltips"
            effect="light"
            content="加粗"
            placement="bottom"
          >
            <el-button
              @click="
                () => {
                  fontBoolObj.SetFontBold = !fontBoolObj.SetFontBold
                  pgEditorVm.pgEditorInstance.postmessage({
                    type: 'SetFontBold',
                    param: [fontBoolObj.SetFontBold]
                  })
                }
              "
            >
              <i class="emr-icon-bold"></i>
            </el-button>
          </el-tooltip>
          <el-tooltip
            popper-class="pg-editor-toolbar-tooltips"
            effect="light"
            content="下划线"
            placement="bottom"
          >
            <el-button
              @click="
                () => {
                  fontBoolObj.SetTextUnderline = !fontBoolObj.SetTextUnderline
                  pgEditorVm.pgEditorInstance.postmessage({
                    type: 'SetTextUnderline',
                    param: [fontBoolObj.SetTextUnderline]
                  })
                }
              "
            >
              <i class="emr-icon-underline"></i>
            </el-button>
          </el-tooltip>

          <el-tooltip
            popper-class="pg-editor-toolbar-tooltips"
            effect="light"
            content="居左"
            placement="bottom"
          >
            <el-button
              @click="
                () => {
                  pgEditorVm.pgEditorInstance.postmessage({
                    type: 'SetAlignLeft',
                    param: [true]
                  })
                }
              "
            >
              <i class="emr-icon-left"></i>
            </el-button>
          </el-tooltip>
          <el-tooltip
            popper-class="pg-editor-toolbar-tooltips"
            effect="light"
            content="居中"
            placement="bottom"
          >
            <el-button
              @click="
                () => {
                  pgEditorVm.pgEditorInstance.postmessage({
                    type: 'SetAlignCenter',
                    param: [true]
                  })
                }
              "
            >
              <i class="emr-icon-center"></i>
            </el-button>
          </el-tooltip>
          <el-tooltip
            popper-class="pg-editor-toolbar-tooltips"
            effect="light"
            content="居右"
            placement="bottom"
          >
            <el-button
              @click="
                () => {
                  pgEditorVm.pgEditorInstance.postmessage({
                    type: 'SetAlignRight',
                    param: [true]
                  })
                }
              "
            >
              <i class="emr-icon-right"></i>
            </el-button>
          </el-tooltip>
          <el-tooltip
            popper-class="pg-editor-toolbar-tooltips"
            effect="light"
            content="两端对齐"
            placement="bottom"
          >
            <el-button
              @click="
                () => {
                  pgEditorVm.pgEditorInstance.postmessage({
                    type: 'SetAlignBothEnds',
                    param: [true]
                  })
                }
              "
            >
              <i class="emr-icon-justify"></i>
            </el-button>
          </el-tooltip>
          <section class="scale-section">
            <el-button icon="el-icon-minus" :disabled="scaleValue <= 50" @click="handleZoomOut"></el-button>
            {{ scaleValue }}%
            <el-button icon="el-icon-plus" :disabled="scaleValue >= 300" @click="handleZoomIn"></el-button>
          </section>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import { ClassNamespace, DcEditorRenderModes, EditorEvent } from './constants'
import WidgetTableCreator from './widget/widget-table-creator.vue'
import { throttle } from '@/utils/index'
import mixins from './mixins'
import {
  // getCurrentPatientInfo,
  getPgEditorVm,
} from './utils'
export default {
  name: 'EditorToolbar',
  components: { WidgetTableCreator },
  mixins: [mixins.getInjectMixin()],
  data() {
    return {
      scaleValue: 100,
      isShowFontSetting: false,
      classNamespace: ClassNamespace,
      dcEditorRenderModes: DcEditorRenderModes,
      currentFontFamily: '',
      currentFontSize: '',
      fontFamilyOptionArr: [
        '宋体',
        '黑体',
        '微软雅黑',
        '微软正黑体',
        '楷体',
        '新宋体',
        '仿宋',
      ],
      fontSizeOptionArr: [
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, 29, 30,
      ],
      fontBoolObj: {
        SetSuperscript: false,
        SetSubscript: false,
        SetFontBold: false,
        SetTextUnderline: false,
      },
    }
  },
  computed: {
    classNames() {
      return {
        editorToolbar: `${this.classNamespace}-toolbar`,
      }
    },
    contentRenderMode: {
      get: function () {
        return this.store.editor.state.editorOptions.ContentRenderMode
      },
      set: function (v) {
        this.store.editor.mutations.setEditorContentRenderMode(v)
      },
    },
  },
  beforeDestroy() {
    this.removeEventBus()
  },
  mounted() {
    this.pgEditorVm = getPgEditorVm(this)
    setTimeout(() => {
      console.log('wori ------- ', this.pgEditorVm.pgEditorInstance)
    }, 1000)
    this.registerEventBus()
  },
  methods: {
    registerEventBus() {
      this.eventEmitter.$on('setDefaultFontInfo', this.setDefaultFontInfo)
      this.eventEmitter.$on(
        EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
        this.setFontStyle
      )
    },
    removeEventBus() {
      this.eventEmitter.$off('setDefaultFontInfo', this.setDefaultFontInfo)
      this.eventEmitter.$off(
        EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
        this.setFontStyle
      )
    },
    setFontStyle(params) {
      this.currentFontFamily = params.fontStyle.fontName
      this.currentFontSize = params.fontStyle.fontSize + 'px'
    },
    //点击文档过去默认字体
    setDefaultFontInfo(currentFont) {
      let { fontFamily, fontSize } = currentFont
      let fontFamilyIndex = this.fontFamilyOptionArr.findIndex((v) => {
        return v == fontFamily
      })

      let fontSizeIndex = this.fontSizeOptionArr.findIndex((v) => {
        return v == fontSize
      })
      //传过来的值不在可选范围内 则默认字体为微软雅黑  默认大小为14
      this.currentFontFamily =
        fontFamilyIndex == -1 ? this.fontFamilyOptionArr[1] : fontFamily
      this.currentFontSize =
        fontSizeIndex == -1 ? this.fontSizeOptionArr[4] : fontSize
    },
    handleInsertTable({ rowNum = 1, colNum = 2 }) {
      this.pgEditorVm.pgEditorInstance.postmessage({
        type: 'CreateTextTable',
        param: [
          {
            columnNumberString: colNum, //列数
            lineNumberString: rowNum, //行数
          },
        ],
      })
      this.handleCloseTableCreator()
    },
    handleCloseTableCreator() {
      this.$refs.widgetTableCreator.doClose()
    },
    handleRefreshClinicalnote() {
      this.eventEmitter.$emit(EditorEvent.PG_EVENT_REFRESH_CLINICALNOTE)
    },
    handleEditorPrintAction: throttle(function () {
      const content = this.pgEditorVm.pgEditorInstance.postmessage({
        type: 'FileSave',
        param: [],
      })[0].xml
      console.log('执行打印任务了 ------ ', content)
      this.eventEmitter.$emit(EditorEvent.PG_EVENT_PRINT_DOCUMENT, content)
    }, 1000),
    handleAnnotation() {
      this.eventEmitter.$emit(EditorEvent.PG_EVENT_ANNOTATION_VIEWPORT)
    },
    handleZoomOut() {
      this.pgEditorVm.pgEditorInstance.postmessage({
        type: 'ZoomOut',
        param: '',
      })
      this.scaleValue -= 10
      this.eventEmitter.$emit(EditorEvent.PG_EVENT_SCALE, this.scaleValue)
    },
    handleZoomIn() {
      this.pgEditorVm.pgEditorInstance.postmessage({
        type: 'ZoomIn',
        param: '',
      })
      this.scaleValue += 10
      this.eventEmitter.$emit(EditorEvent.PG_EVENT_SCALE, this.scaleValue)
    },
  },
}
</script>

<style lang="scss" scoped>
$classNamespace: 'pg-editor';

.#{$classNamespace}-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 4px;
  z-index: 1;
  min-width: 800px;
  background-color: #ffffff;

  /deep/ .el-button {
    width: 32px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #565656;
    font-size: 14px;
    border: none;
    border-radius: 2px;
    margin: 0;
    &:hover {
      color: var(--COLOR-HOVER);
    }
    &.active,
    &:active {
      color: var(--COLOR-NORMAL);
      background: transparent;
    }

    &:disabled {
      color: #ccc;
      background: transparent;
    }
  }

  .split-line {
    display: block;
    width: 1px;
    height: 20px;
    margin: 0 8px;
    background: #c8d0d8;
  }
  .color {
    color: var(--COLOR-NORMAL) !important;
  }
  .btn-more {
    width: 52px;
    height: 24px;
    font-size: 12px;
    color: #565656;

    /deep/.el-icon--right {
      margin-left: -4px;
    }
  }

  & > section {
    position: relative;

    article {
      position: absolute;
      right: 0;
      top: 28px;
      background: #fff;
      border-radius: 5px;
      padding: 4px 16px;
      box-shadow: 0 0 8px rgba($color: #000000, $alpha: 0.15);
      div {
        display: flex;
        justify-content: center;
        align-items: center;

        /deep/ .el-select {
          width: 100px;
          margin: 0 4px;
        }

        /deep/ .el-button {
          margin: 0 2px;
        }

        .scale-section {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          color: #000;
          /deep/ .el-button {
            color: #565656;
            font-size: 16px;
            &:hover {
              background: transparent;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.pg-editor-toolbar-tooltips {
  &.el-tooltip__popper.is-light {
    border: none;
  }

  &.el-tooltip__popper.is-light[x-placement^='bottom'] .popper__arrow {
    border-bottom-color: transparent;
  }
}
</style>
