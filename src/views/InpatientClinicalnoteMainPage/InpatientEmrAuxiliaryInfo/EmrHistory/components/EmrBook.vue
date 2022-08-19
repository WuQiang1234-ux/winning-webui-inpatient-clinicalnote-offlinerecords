<template>
  <div class="emr-book-wrap">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane
        v-for="item in classificationList"
        :key="emrItem.recordId + item.inpatientEmrTypeId"
        :label="item.inpatientEmrTypeName"
        :name="item.inpatientEmrTypeId"
      >
        <section v-if="activeName == item.inpatientEmrTypeId" class="pg-editor-wrapper">
          <PgEditor
            :ref="'pgEditor-' + emrItem.recordId + item.inpatientEmrTypeId"
            :key="'pgEditor-' + emrItem.recordId + item.inpatientEmrTypeId"
            :patientInfo="currentPatientInfo"
            :userInfo="userInfo"
            :isHistoryBook="true"
            :toolbarOptions="{ isShow: false }"
            class="pg-editor"
          />
          <section
            v-show="emrItem.emrList.length == 0"
            class="empty_tips"
          >{{ item.inpatientEmrTypeName }}下暂无既往病历</section>
          <footer>
            <!-- <el-select
              v-if="currentSectionList.length"
              v-model="selectedSection"
              multiple
              clearable
              collapse-tags
              size="small"
              placeholder="请选择需插入的段落"
              style="width:180px;margin-right:10px"
            >
              <el-option
                v-for="sItem in currentSectionList"
                :key="sItem.inpatEmrSectionId"
                :label="sItem.inpatEmrSectionName"
                :value="sItem.inpatEmrSectionId"
              ></el-option>
            </el-select>-->
            <div>
              <!-- <el-button
                v-if="!auxiliaryInfoEntrance"
                type="primary"
                plain
                size="small"
                @click="setEmrContent(true, item)"
              >替换</el-button>-->
              <el-button type="primary" size="small" @click="setEmrTextContent(item)">插入</el-button>
            </div>
          </footer>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
// import apiAssistant from '@/api/assistant.js'
import { createNamespacedHelpers, mapState } from 'vuex'
const { mapState: clinicalnoteMapStates } = createNamespacedHelpers('emr')
import { cb2promise } from '@/utils/convertFunction'
// import api from '@/api/list'
import PgEditor from '@/libs/PgEditor'
import { EditorEvent, DcEditorRenderModes } from '@/libs/PgEditor/constants'
import {
  queryEmrClassListData,
  getEmrHistroyContentListData,
} from '../testData'
import getEventHubHelper from '@/utils/event_hub_helper.js'

import dataSourcesVisibilityMixin from '@/components/InpatientClinicalnoteEditor/BaseEditorPg/mixins/dataSourcesVisibility'
import { decompress } from '../../../../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'
export default {
  name: 'EmrBook',
  components: {
    PgEditor,
  },
  mixins: [dataSourcesVisibilityMixin],
  props: {
    emrItem: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  inject: {
    auxiliaryInfoEntrance: {
      default: '',
    },
  },
  data() {
    return {
      activeName: '',
      classificationList: [],
      sectionListObject: {},
      currentDocumentId: '',
      selectedSection: [],
      currentSectionList: [],

      queryEmrClassListData: Object.freeze(queryEmrClassListData),
      getEmrHistroyContentListData: Object.freeze(getEmrHistroyContentListData),
    }
  },
  computed: {
    ...mapState(['currentPatientInfo', 'userInfo']),
    ...clinicalnoteMapStates(['isShowConsultationCreator']),
  },
  watch: {
    async activeName(v) {
      if (v && v != 0) {
        await this.handleTabClick(v)
      }
    },
    currentDocumentId(v) {
      this.selectedSection = []
      this.currentSectionList = this.sectionListObject[v]
    },
  },
  created() {},
  beforeDestroy() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDocumentClick
    )
  },
  mounted() {
    this.getClassificationList()
    this.eventHubHelper = getEventHubHelper(
      this.patientRootComponentStore.state.eventHub
    )
  },
  methods: {
    getEditor() {
      let _emrUniqueId = 'pgEditor-' + this.emrItem.recordId + this.activeName
      return this.$refs[_emrUniqueId][0]
    },
    handleDocumentClick(e) {
      console.log(e, '既往病历~~~~e')
      this.currentDocumentId = e.docInfo.docId
    },
    getClassificationList() {
      this.classificationList = []
      // api
      //   .queryEmrClassList({
      //     encounterId: this.currentPatientInfo.encounterId,
      //   })
      //   .then((res) => {
      let res = this.queryEmrClassListData
      res.data?.map((v) => {
        //去掉病案首页
        if (v.inpatientEmrTypeId != '121383422926546960') {
          this.classificationList.push(v)
        }
      })

      if (this.classificationList.length) {
        this.activeName = this.classificationList[0].inpatientEmrTypeId
      }
      //   })
    },
    async handleTabClick(inpatientEmrTypeId) {
      // let res = await apiAssistant.getEmrHistroyContentList({
      //   encounterId: this.emrItem.encounterId,
      //   inpatientEmrTypeId
      // })

      let res = this.getEmrHistroyContentListData
      await Promise.resolve()
      let { data } = res
      let _emrUniqueId =
        'pgEditor-' + this.emrItem.recordId + inpatientEmrTypeId
      let pgEditor = this.$refs[_emrUniqueId][0]
      if (data.length) {
        this.emrItem.emrList = data

        const appendSubDocs = () => {
          const options = []
          data.forEach((item, index) => {
            let {
              inpatientEMRContentDTO: {
                mrtEditorTypeCode,
                inpatEmrContentData,
              },
              inpatientEMRSetOutputDTO: { inpatEmrSetId, inpatEmrTypeId },
            } = item
            this.sectionListObject[inpatEmrSetId] = item.inpEmrSectionList ?? []
            if (index == 0) this.currentDocumentId = inpatEmrSetId

            let xml = decompress(inpatEmrContentData)

            // 自研的会诊为两个子文档 需拆分
            if (
              mrtEditorTypeCode == '399461578' &&
              inpatEmrTypeId == '121383422926546950'
            ) {
              let xmlArr = xml.split('<?xml version="1.0" encoding="utf-8"?>')
              console.log(xmlArr)
              for (let index = 1; index < xmlArr.length; index++) {
                let cItem = xmlArr[index]
                options.push({
                  docId: inpatEmrSetId,
                  srcstr: cItem,
                  newPage: index == 1,
                })
              }
            } else {
              options.push({
                docId: inpatEmrSetId,
                srcstr: xml,
                newPage: true,
              })
            }
          })
          console.log('连续病历子文档插入---------', options)
          pgEditor.pgEditorInstance.postmessage({
            type: 'OpenAndAppendDoc',
            param: options,
          })
        }

        const load = (cb = () => {}) => {
          pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
            cb()
          })
          appendSubDocs()
        }

        if (!pgEditor?.pgEditorLoaded) {
          await pgEditor.waitEditorLoaded()
        }
        await cb2promise((cb) => {
          load(cb)
        })

        //水印
        // pgEditor.setWaterMark()
        pgEditor.eventEmitter.$on(
          EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
          this.handleDocumentClick
        )

        pgEditor.switchContentRenderMode(DcEditorRenderModes.SET_PRINT_PREVIEW)
      } else {
        this.emrItem.emrList = []
        //关闭loading效果
        pgEditor.$children[0].loading = false
      }
    },
    setEmrTextContent(item) {
      let _emrUniqueId =
        'pgEditor-' + this.emrItem.recordId + item.inpatientEmrTypeId
      let pgEditor = this.$refs[_emrUniqueId][0]
      let content = pgEditor.pgEditorInstance.postmessage({
        type: 'FavoritesPhrases',
        param: [
          {
            type: 'text',
          },
        ],
      })
      this.eventHubHelper.emit('AuxiliaryInfo/Insert', {
        isReplace: false,
        type: 'text',
        content,
      })
    },
    setEmrContent(isReplace, item) {
      let _emrUniqueId =
        'pgEditor-' + this.emrItem.recordId + item.inpatientEmrTypeId
      let pgEditor = this.$refs[_emrUniqueId][0]
      if (
        this.auxiliaryInfoEntrance == 'ppt' ||
        this.isShowConsultationCreator
      ) {
        let content = pgEditor.pgEditorInstance.postmessage({
          type: 'FavoritesPhrases',
          param: [
            {
              type: 'text',
            },
          ],
        })
        this.$root.eventHub.$emit('AuxiliaryInfo/Insert', {
          isReplace: false,
          type: 'text',
          content,
        })
      } else {
        if (this.selectedSection.length) {
          this.selectedSection.forEach((v) => {
            let _item = this.currentSectionList.find((v2) => {
              return v2.inpatEmrSectionId == v
            })
            this.$root.eventHub.$emit('AuxiliaryInfo/Insert', {
              content: decompress(_item.inpEmrSectionContent),
              type: 'xml',
              isReplace,
              cptId: _item.inpEmrSectionWinId, // || _item.inpEmrSectionConceptId
            })
          })
        } else {
          let content = pgEditor.pgEditorInstance.postmessage({
            type: 'FavoritesPhrases',
            param: '',
          })
          console.log('FavoritesPhrases------------------', content)
          //向病历编辑器插入内容
          this.$root.eventHub.$emit('AuxiliaryInfo/Insert', {
            content,
            type: 'xml',
            isReplace,
          })
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.emr-book-wrap {
  position: relative;
  height: 100%;
  /deep/.el-tabs {
    position: relative;
    height: 100%;

    .el-tabs__header {
      margin: 0 0 4px;

      .el-tabs__item {
        height: 32px;
        line-height: 32px;
      }
      .el-tabs__nav-next,
      .el-tabs__nav-prev {
        line-height: 32px;
      }
    }

    .el-tabs__content {
      height: calc(100% - 40px);

      .el-tab-pane {
        position: relative;
        height: 100%;
      }

      .pg-editor-wrapper {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
        footer {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          & > div {
            &:only-child {
              width: 100%;
              text-align: right;
            }
          }
        }
      }
    }
  }
}

.pg-editor {
  /deep/ .pg-editor-wrap .pg-editor-target {
    height: 100%;
  }
}
.empty_tips {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  background: #fff;
}
</style>
