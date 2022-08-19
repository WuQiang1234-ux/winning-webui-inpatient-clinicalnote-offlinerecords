<template>
  <section>
    <div class="title">
      <div class="wire"></div>模板预览区
    </div>
    <el-tabs v-if="mrtPreviewList.length" v-model="activeName" class="mrt-preview-tabs">
      <el-tab-pane
        v-for="item in mrtPreviewList"
        :key="item.id"
        :label="item.label"
        :name="item.id"
      >
        <PgEditor
          :ref="'pgEditorDom' + item.id"
          :patientInfo="currentPatientInfo"
          :parameterConfiguration="{
            inpatEmrSetId: item.id,
            isLocateCursor: false,
            isSetDefaultData: false
          }"
          :toolbarOptions="{ isShow: false }"
        />
      </el-tab-pane>
    </el-tabs>

    <place-holder v-else pic="no_information" text="请在左侧选择你要预览模板"></place-holder>
  </section>
</template>
<script>
import PgEditor from '@/libs/PgEditor'
import {
  EditorEvent,
  DcEditorRenderModes,
  DataElementWinIds,
} from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
import PlaceHolder from '@/components/PlaceHolder/Index.vue'
import { decompress } from '../../../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'
import { createTemp } from '../aa'
export default {
  name: 'MrtPreviewEditor',
  components: { PgEditor, PlaceHolder },
  props: {
    mrtList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      activeName: '',
      mrtPreviewList: [],
    }
  },
  watch: {
    mrtList: {
      handler: async function (v) {
        if (!v.length) {
          this.mrtPreviewList = []
          return
        }
        this.activeName = this.mrtList[this.mrtList.length - 1].id

        for (let i = 0; i < this.mrtList.length; i++) {
          let el = this.mrtList[i]
          let _index = this.mrtPreviewList.findIndex((v) => v.id == el.id)
          if (_index == -1) {
            this.mrtPreviewList.push({
              id: el.id,
              label: el.label,
              displayName: el.displayName,
              isPersonalMrt: el.isPersonalMrt,
              xml: '',
            })
            let res = createTemp

            const xml = res?.data?.inpatientMrtContentData
            if (!xml) return
            let item = this.mrtPreviewList.find((v) => v.id == el.id)
            item.xml = decompress(xml)
            await Promise.resolve()
            // debugger
            let pgEditor = this.$refs['pgEditorDom' + item.id][0]
            console.log(pgEditor, '加载模板内容')
            const load = (cb = () => {}) => {
              pgEditor.eventEmitter.$once(
                EditorEvent.PG_EVENT_XML_ONLOAD,
                () => {
                  cb()
                }
              )
              //不获取光标
              pgEditor.pgEditorInstance.changeUnfocus(true)
              pgEditor.pgEditorInstance.postmessage({
                type: 'FileOpen',
                param: [
                  {
                    srcstr: item.xml,
                    docId: item.id,
                  },
                ],
              })
            }

            if (!pgEditor?.pgEditorLoaded) {
              await pgEditor.waitEditorLoaded()
            }

            await cb2promise((cb) => {
              load(cb)
            })

            //设置浏览模式  让模板不可编辑
            pgEditor.switchContentRenderMode(
              DcEditorRenderModes.SET_WORK_MODE_BROWSE
            )

            //隐藏数据源括号
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetInputBorderHide',
              param: [],
            })

            //填充机构名和模板显示名称
            // await pgEditor.getPresetSystemConceptData()
            // let orgNameInfo = pgEditor.cachedPresetSystemConceptData.find(
            //   (v) => v.conceptId == '399310029'
            // )
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetValue',
              param: [
                {
                  docId: '',
                  conceptId: DataElementWinIds.TEMPLATE_DISPLAY_TITLE_INPUT,
                  value: item.displayName,
                  type: 'normal',
                  valueType: 'text',
                  KeepTrace: false,
                  valueTarget: 'onlyDataElement',
                },
                {
                  docId: '',
                  conceptId: '399310029',
                  value: '啊啊啊',
                  type: 'normal',
                  valueType: 'text',
                  KeepTrace: false,
                  valueTarget: 'onlyDataElement',
                },
              ],
            })
          }
        }
        //去掉之前加载的项

        this.mrtPreviewList = this.mrtPreviewList.filter((el) => {
          return this.mrtList.findIndex((item) => item.id == el.id) !== -1
        })
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    currentPatientInfo() {
      return this.$patientRootComponentStore.currentPatientInfo
    },
  },
}
</script>

<style lang="scss" scoped>
section {
  position: relative;
  // width: 900px;
  height: 100%;
  .title {
    position: absolute;
    top: -48px;
    line-height: 24px;
    font-size: 1.28rem;
    color: #303133;
    text-indent: 10px;
    .wire {
      position: absolute;
      left: -1px;
      height: 200px;
      border-right: 1px solid rgb(220, 229, 242);
      top: -10px;
    }
  }
}
.mrt-preview-tabs {
  /deep/ .pango-editor {
    width: 812px;
  }
}
</style>
<style lang="scss">
.mrt-preview-tabs.el-tabs {
  width: 100%;
  max-width: 812px;
  height: 100%;
  flex: 1 1 auto;

  & > .el-tabs__header {
    padding: 0px 10px;
    //   background-color: var(--COLOR-ACTIVE-BG);
    //   color: #3a3a3a;
    //   font-size: 16px;
    //   height: 36px;
    //   margin: 0 0;
    //   border-bottom: none;

    //   .el-tabs__nav {
    //     border: none;
    //     z-index: 0;
    //   }

    //   .el-tabs__nav-wrap.is-scrollable.is-top {
    //     .el-tabs__nav-prev,
    //     .el-tabs__nav-next {
    //       line-height: 40px;
    //       padding: 0px 5px;
    //     }
    //   }

    //   .el-tabs__item {
    //     height: 36px;
    //     line-height: 36px;

    //     &.is-active {
    //       background-color: #ffffff;
    //       color: var(--COLOR-NORMAL);
    //     }
    //   }
  }
  & > .el-tabs__content {
    background-color: #ffffff;
    height: calc(100% - 36px);
    width: 100%;

    .el-tab-pane {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
  }
}
</style>
