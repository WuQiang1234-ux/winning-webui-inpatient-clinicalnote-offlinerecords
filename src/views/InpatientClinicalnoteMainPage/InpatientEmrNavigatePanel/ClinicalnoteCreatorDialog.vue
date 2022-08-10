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
      searchKeyword: '',
      templateActive: '',
      tableLoading: false,
      activeName: '',
      clinicalnoteTemplateTabs: [],
      loading: false,
      //当前选中的病历模板
      selectedTemplateList: [],
      clinicalnoteTemplateClassTable: [],
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
    handleClinicalnoteTemplateClassTableClick() {},
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

<style scoped lang="scss">
</style>
