<template>
  <el-dialog
    class="create-clinicalnote-dialog"
    :visible="isShow"
    width="1394px"
    append-to-body
    :close-on-click-modal="false"
    v-dialog-dragable
    @opened="handleDialogOpen"
    @close="handleDialogClose"
  >
    <template slot="title">
      <header>模板选择</header>
    </template>
    <div class="content">
      <div class="leftCopyChoice">
        <div class="el-dialog__body_search">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入搜索内容"
            suffix-icon="el-icon-search"
            clearable
            @change="handleSearchKeywordChange"
          ></el-input>
        </div>
        <div class="searchForDetails">
          <div class="create-clinicalnote-dialog-left">
            <el-tabs
              v-model="templateActive"
              tab-position="left"
              v-loading="tableLoading"
              class="clinicalnote-template-class-table"
              @tab-click="handleClinicalnoteTemplateClassTableClick"
            >
              <el-tab-pane
                v-for="tab in clinicalnoteTemplateClassTable"
                :key="tab.id"
                :label="tab.name"
                :name="tab.id"
              >
                <div class="create-clinicalnote-dialog-right">
                  <el-tabs
                    v-model="activeName"
                    class="clinicalnote-template-tree-tab"
                    @tab-click="handleTabClick"
                  >
                    <el-tab-pane
                      v-for="tab in clinicalnoteTemplateTabs"
                      :key="tab.name"
                      :disabled="!clinicalnoteTemplateClassTable.length"
                      :label="tab.label"
                      :name="tab.name"
                    >
                      <template-tree
                        :activeName="activeName"
                        :loading="loading"
                        :clinicalnoteTemplateTree="clinicalnoteTemplateTree"
                        :currentClinicalnoteTemplateClassDataId="
                            currentClinicalnoteTemplateClassDataId
                          "
                        @clickTemplate="clickTemplate"
                      ></template-tree>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div class="create-clinicalnote-dialog-layout-seperate" />
        </div>
      </div>
      <div class="rightPreview">
        <MrtPreviewEditor :mrtList="previewMrtList" />
      </div>
    </div>

    <footer slot="footer" class="dialog-footer">
      <!-- 病程记录 -->

      <div
        v-if="
          selectedTemplateList.some(
            el => el.data.inpEmrClassId == '121383422926546946'
          )
        "
        class="record-info"
      >
        <div class="timing">
          记录时间&nbsp;
          <el-date-picker
            ref="datePicker"
            v-model="recordDate"
            size="mini"
            type="datetime"
            placeholder="选择日期时间"
            default-time="12:00:00"
            :picker-options="pickerOptions"
            @change="writeTimeChange"
            v-iptDatePicker
            time-arrow-control
            class="inpatient-clinicalnote-date-picker-wraper"
            popper-class="inpatient-clinicalnote-date-picker-panel"
          ></el-date-picker>
        </div>
      </div>
      <div class="buttons">
        <el-button v-if="!isCreating" size="small" @click="handleDialogClose">取 消</el-button>
        <el-button
          size="small"
          :loading="isCreating"
          type="primary"
          @click="handleCreateClinicalnote"
        >确 定</el-button>
      </div>
    </footer>
  </el-dialog>
</template>

<script>
import MrtPreviewEditor from './components/MrtPreviewEditor.vue'
import {
  clinicalnoteTemplateClassTable,
  clinicalnoteTemplateTreeTestData,
} from './aa'
export default {
  name: '',
  components: { MrtPreviewEditor },
  props: {
    emrCreateDialogData: { type: Object },
  },
  data() {
    return {
      isShow: true,
      clinicalnoteTemplateTree: [],
      clinicalnoteTemplateTreeTestData: clinicalnoteTemplateTreeTestData,
      searchKeyword: '',
      templateActive: '',
      tableLoading: false,
      activeName: '',
      clinicalnoteTemplateTabs: [],
      loading: false,
      //当前选中的病历模板
      selectedTemplateList: [],
      clinicalnoteTemplateClassTable,
      isCreating: false,
    }
  },
  computed: {
    currentClinicalnoteTemplateClassDataId() {
      return this.selectedTemplateList.map((el) => el.keyId)
    },
    //当前预览的病历模板
    previewMrtList() {
      return this.selectedTemplateList.map((v) => {
        return {
          id: v.id,
          label: v.label,
          displayName: v.data.inpMrtDisplayname ?? v.label,
          isPersonalMrt: false,
        }
      })
    },
  },
  watch: {},
  created() {},
  mounted() {
    this.handleDialogOpen()
  },
  methods: {
    handleSearchKeywordChange() {},
    handleDialogOpen() {
      this.clinicalnoteTemplateTree = []
    },
    handleDialogClose() {
      this.emrCreateDialogData.isShow = false
    },
    handleTabClick(tab, event) {
      console.log('点击 tab ---------', tab, event)
      this.selectedTemplateList = []
      this.refreshByTab(tab.name)
    },
    refreshByTab() {
      // switch (tabName) {
      // case 'first':
      //   await this.getCollectClinicalnoteTemplateTree()
      //   break
      // case 'second':
      this.getClinicalnoteTemplateTree('', 'second') //全院
      // break
      // case 'third':
      //   await this.getMyClinicalnoteTemplateTree()
      //   break
      // case 'four':
      //   await this.getOnlyMyClinicalnoteTemplateTree()
      //   break
      // default:
      //   break
      // }
    },
    async getClinicalnoteTemplateTree() {
      // this.activeRequestKey = activeRequestKey
      this.loading = true
      // let inpatEmrTypeId = ''
      // let inpatMrtTypeId = []

      // if (this.type !== 'toBeWritten') {
      //   inpatEmrTypeId = this.currentClinicalnoteTemplateClassData?.id
      // } else {
      //   inpatMrtTypeId = this.emrWaitingWritingCreateDialogData.data
      //     .inpatMrtTypeId
      //   inpatEmrTypeId = this.emrWaitingWritingCreateDialogData.data
      //     .inpatEmrTypeId
      // }
      // const res = await api.queryClinicalnoteTemplateTree({
      //   inpatEmrTypeId: this.overallSearchFlag ? '' : inpatEmrTypeId,
      //   inpatMrtTypeId,
      //   inpatMrtName: this.searchKeyword,
      //   deptId: deptId,
      //   genderCode: this.currentPatientInfo.genderCode,
      //   ageAegmentCode: this.currentPatientInfo?.patientInfoOutput
      //     ?.ageSegmentCode,
      //   maritalStatusCode: this.currentPatientInfo?.patientInfoOutput
      //     ?.maritalStatusCode,
      //   diseaseCategoryCode: '390204863',
      //   encounterId: this.currentPatientInfo.encounterId
      // })
      // console.log('返回查询病历模版结果------------', res)
      // const { data } = res
      // if (data) {
      //   if (this.activeRequestKey !== activeRequestKey)
      //     return Promise.reject('不处理历史请求')
      //   this.loading = false

      let data = this.clinicalnoteTemplateTreeTestData.data
      this.clinicalnoteTemplateTree = this.processClinicalnoteTemplateTree(data)
      // }
    },
    processClinicalnoteTemplateTree(data = []) {
      //去掉一级目录
      if (data.length == 1 && data[0].inpatMrtClassLevel == 1) {
        data = [...data[0].inpatMrtTemplate, ...data[0].nodes]
      }
      let list = []
      data.forEach((item) => {
        console.log(item.inpatMrtClassLevel, '++++++')
        let orderedData = {}
        if (item.inpatientMrtId) {
          orderedData = {
            id: item.inpatientMrtId,
            keyId: Math.random() + item.inpatientMrtId,
            label: item.inpatientMrtName,
            children: [],
            data: item,
            isFavorite: item.isCollect,
            isRecommend: item.isRecommend,
            isLeaf: true,
          }
        } else {
          orderedData = {
            id: item.inpatMrtClassId,
            keyId: Math.random(),
            label: item.inpatMrtClassName,
            children: [],
            isLeaf: false,
          }
        }

        if (item.inpatMrtTemplate?.length) {
          orderedData.children = item.inpatMrtTemplate.map((cItem) => {
            return {
              id: cItem.inpatientMrtId,
              keyId: Math.random() + cItem.inpatientMrtId,
              label: cItem.inpatientMrtName,
              children: [],
              data: cItem,
              isFavorite: cItem.isCollect,
              isRecommend: cItem.isRecommend,
              isLeaf: true,
            }
          })
        }
        if (item.nodes?.length) {
          orderedData.children = orderedData.children.concat(
            this.processClinicalnoteTemplateTree(item.nodes)
          )
        }
        if (orderedData.isLeaf || orderedData.children.length) {
          list.push(orderedData)
        }
      })

      return list
    },
    handleClinicalnoteTemplateClassTableClick(rowData, event) {
      console.log(rowData, event)
      if (rowData) {
        this.overallSearchFlag = false //目录下搜索
        this.selectedTemplateList = []
        this.currentClinicalnoteTemplateClassData = {
          id: rowData.name,
          name: rowData.label,
        }
        console.log(this.currentClinicalnoteTemplateClassData)
        this.setActivateTableRowStyle()
        this.refreshByTab(this.activeName)
      }
    },
    async clickTemplate(oldData) {
      //个人模板查房记录选择医师显示模板名称和上方展示的是个人模板名称
      let data = JSON.parse(JSON.stringify(oldData))
      // this.noteTaker = ''
      console.log(data, 'jjj')
      console.log('分类', data.data.inpEmrClassId)

      //处理选择的模板
      this.addCreateTemplate(data)
    },
    addCreateTemplate(data) {
      //增加选中数据
      let dataIndex = this.selectedTemplateList.findIndex(
        (el) => el.keyId == data.keyId
      )
      if (dataIndex == -1) {
        console.log('新增')
        let hasIndex = this.isCheckJurisdiction(data)
        if (hasIndex !== -1) {
          console.log('之前选择过病程，或者入院类目下的模板')
          this.selectedTemplateList.splice(hasIndex, 1)
        }
        this.selectedTemplateList.push({
          id: data.data.inpatientMrtId,
          keyId: data.keyId,
          label: data.label,
          isDefineTitle: data.data.isDefineTitle,
          data: data.data,
        })
      } else {
        console.log('删除')
        this.selectedTemplateList.splice(dataIndex, 1)
      }
      this.setActivateTableRowStyle()
    },
    setActivateTableRowStyle() {
      let activateTableRow =
        this.$refs.clinicalnoteTemplateClassTable?.$el?.querySelectorAll(
          '.el-table__row'
        ) || []
      console.log(activateTableRow, 999)
      let activateLabelList = []
      if (this.overallSearchFlag) {
        this.clinicalnoteTemplateClassTable.forEach((el) => {
          if (
            this.selectedTemplateList.find(
              (ele) => ele.data.inpEmrClassId == el.id
            )
          ) {
            activateLabelList.push(el.name)
          }
        })
        for (let val of activateTableRow) {
          if (activateLabelList.includes(val.textContent)) {
            val.classList.add('activateLabelListStyle')
          } else {
            val.classList.remove('activateLabelListStyle')
          }
        }
      } else {
        this.clinicalnoteTemplateClassTable.forEach((el) => {
          if (this.currentClinicalnoteTemplateClassData?.id == el.id) {
            activateLabelList.push(el.name)
          }
        })
        for (let val of activateTableRow) {
          if (activateLabelList.includes(val.textContent)) {
            val.classList.add('activateLabelListStyle')
          } else {
            val.classList.remove('activateLabelListStyle')
          }
        }
      }
    },
    handleCreateClinicalnote() {},
  },
}
</script>

<style lang="scss">
.templateSetHeader {
  .el-link.el-link--warning {
    position: relative;
    top: -2px;
    font-size: 14px;
  }
}
.el-dialog__wrapper.create-clinicalnote-dialog {
  .el-tabs--left .el-tabs__item.is-left {
    text-align: left;
  }
  .el-dialog__header {
    padding: 8px 10px 10px;
    header {
      padding: 4px;
      font-size: 1.28rem;
    }
    .el-dialog__headerbtn {
      top: 10px;
    }
  }
  .el-dialog__body {
    display: flex;
    max-height: 640px;
    height: 640px;
    padding: 8px 8px 8px 4px;
    .content {
      display: flex;
      width: 100%;
      height: 100%;
      .leftCopyChoice {
        display: flex;
        flex-direction: column;
        width: 570px;
        height: 100%;

        &.toBeWritten {
          width: 400px;
        }
        .el-dialog__body_search {
          text-align: center;
          margin-bottom: 10px;
          .el-input {
            width: 90% !important;
          }
        }
        .searchForDetails {
          display: flex;
          height: 100%;
          min-height: 0;
        }
      }
      .rightPreview {
        flex: 1;
        width: calc(100% - 570px);
        &.toBeWritten {
          width: calc(100% - 400px);
        }
      }
    }
    .create-clinicalnote-dialog-left {
      flex: 0 0 auto;
      width: calc(100% - 1px);
      height: 100%;
      padding: 0 4px;
    }
    .create-clinicalnote-dialog-layout-seperate {
      background: #dce5f2;
      height: 100%;
      width: 1px;
    }
    .create-clinicalnote-dialog-right {
      flex: 1 1 auto;
      width: 100%;
      padding-right: 8px;
      width: 100%;
      height: 100%;
      .clinicalnote-template-four {
        margin-top: 10px;
        text-align: right;
      }
    }
  }
  @media screen and (max-height: 760px) {
    .el-dialog__body {
      max-height: 500px;
      height: 500px;
    }
  }
  @media screen and (min-height: 760px) {
    .el-dialog__body {
      max-height: 640px;
      height: 640px;
    }
  }
  .clinicalnote-template-class-table {
    &.ignoreActiveStyle {
      & > .el-tabs__header {
        .el-tabs__item.is-active {
          background: transparent;
          color: #303133;
          font-weight: 400;
        }
        .el-tabs__active-bar {
          background-color: transparent;
        }
      }
    }

    .el-tabs__item.is-active {
      background: var(--COLOR-ACTIVE-BG, #eaeefe);
      color: var(--COLOR-NORMAL);
    }
    .el-tabs__content,
    .el-tab-pane {
      height: 100%;
    }
  }

  .template-list-section {
    display: flex;
    flex-direction: column;
    height: calc(100% - 48px);
    padding-left: 8px;
    &.incompleteDocTreeStyle {
      width: 100%;
    }
  }
  .el-tabs--left .el-tabs__header.is-left {
    width: 150px;
  }
  .clinicalnote-template-class-table {
    // display: flex;
    // justify-content: space-between;
    height: 100%;
    &::before {
      height: 0;
    }
    .el-table__row {
      cursor: pointer;
      &.current-row {
        font-size: 16px;
        color: var(--COLOR-NORMAL);
      }

      td {
        border-bottom: none;
      }
    }
  }

  .clinicalnote-template-tree {
    flex: 1 1 auto;
    margin-top: 8px;
    height: calc(100% - 60px);
    width: 100%;
    padding-right: 8px;
    overflow-y: auto;
  }
  .new-template-tree {
    height: calc(100% - 80px);
  }
  .el-tabs.clinicalnote-template-tree-tab {
    height: 100%;
    .el-tabs__header {
      margin-bottom: 8px;
    }
    .el-tabs__content,
    .el-tab-pane {
      height: 100%;
    }
    .el-tabs__item {
      font-size: 16px;
    }
    &.el-tabs--top {
      .el-tabs__item.is-top:nth-child(2) {
        padding-left: 16px;
      }
      .el-tabs__item.is-top:last-child {
        padding-right: 16px;
      }
    }
  }

  .el-tree.clinicalnote-template-tree {
    color: #7e89a4;
    font-size: 16px;
    .el-tree-node {
      .el-tree-node__content {
        margin-top: 8px;
        height: auto;
        &:hover,
        &:focus {
          background-color: #ffffff;
        }
      }

      &.is-current,
      &:focus,
      &:hover {
        .el-tree-node__content {
          background-color: white;
        }
      }

      // &.is-current {
      & > .el-tree-node__content {
        // .template-item-box {
        //   letter-spacing: 0;
        // }
        .custom-tree-node_activate {
          border: 1px solid var(--COLOR-NORMAL);
          color: var(--COLOR-NORMAL);
          background-color: var(--COLOR-ACTIVE-BG);
          letter-spacing: 0;
        }
      }

      // }
    }

    .el-tree-node__children {
      padding: 0 0 0 8px;
      &:empty {
        display: none;
      }

      > .el-tree-node {
        margin: 8px 0 0;
        width: 100%;

        /deep/ .el-tree-node__content {
          display: flex;
          padding-left: 0px !important;
        }

        .el-tree-node__expand-icon.is-leaf {
          display: none;
        }
      }
    }
  }

  .custom-tree-node {
    display: flex;
    flex: 1 1 auto;
    width: calc(100% - 24px);
    max-width: 350px;
    justify-content: space-between;

    background-color: #f6f8fb;
    border: 1px solid #f6f8fb;
    border-radius: 4px;
    color: #333333;
    font-size: 16px;
    padding: 5px 10px;
    box-sizing: border-box;

    .node-name {
      display: flex;
      flex: 1 1 auto;
      width: calc(100% - 50px);
      align-content: center;
      align-items: baseline;

      .label {
        display: block;
        flex: 1 1 auto;
        width: calc(100% - 50px);
        margin-left: 4px;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
        overflow: hidden;
        box-sizing: border-box;
      }
    }

    .el-button.node-action-toggle-favorite {
      margin: 0 0;
      padding: 0 0;
    }
    &.is-share {
      .svg-icon {
        color: #f5a623;
      }
    }

    .svg-icon {
      color: rgba(0, 0, 0, 0.2);
    }
    &.is-favorite {
      .el-icon-star-on {
        color: #f5a623;
        font-size: 18px;
      }
    }

    &.disabled {
      color: #999;
      background: #eee;
    }

    .el-icon-star-on {
      color: rgba(0, 0, 0, 0.2);
      font-size: 18px;
    }
  }

  .el-dialog__footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0 0 0;

    .dialog-footer {
      display: flex;
      align-items: center;
      border-top: 1px solid #ebeef5;
      width: 100%;
      justify-content: space-between;
      padding: 8px;
      .record-info {
        display: flex;
        flex: 1 0 auto;
        align-items: center;
        justify-content: flex-start;
        .timing {
          width: 264px;
          display: flex;
          align-items: center;
          .el-date-editor {
            width: 200px;
          }
        }

        .defineTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          .el-checkbox {
            margin: -3px 4px 0;
            .el-checkbox__label {
              font-size: 14px !important;
            }
          }

          .noteTaker {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .star-fill {
              color: red;
            }
            .el-input-group__prepend {
              background: #fff;
            }
            .el-select {
              width: 90px;
            }

            & > .el-input {
              width: 260px;
              margin-left: 8px;

              .el-input__inner {
                padding: 0 6px;
              }
            }
          }
        }
      }

      .buttons {
        flex: 1 0 auto;
        width: 156px;
        text-align: right;
      }
    }
  }
  .operation {
    width: 300px;
    .el-tag {
      max-width: 222px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
