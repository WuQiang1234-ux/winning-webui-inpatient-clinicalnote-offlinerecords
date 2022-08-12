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
    @change="handleSearchKeywordChange"
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
import TemplateTree from './components/TemplateTree.vue'
import { mapState } from 'vuex'
import {
  surgeryOrNot,
  //  expertiseConceptId
} from './utils'
import dayjs from 'dayjs'
import {
  clinicalnoteTemplateClassTable,
  clinicalnoteTemplateTreeTestData,
} from './aa'
export default {
  name: '',
  components: { MrtPreviewEditor, TemplateTree },
  props: {
    emrCreateDialogData: { type: Object },
  },
  inject: ['patientRootComponent'],
  data() {
    return {
      isShow: true,
      clinicalnoteTemplateTree: [],
      clinicalnoteTemplateTreeTestData: clinicalnoteTemplateTreeTestData,
      searchKeyword: '',
      templateActive: '121383422926546945',
      tableLoading: false,
      activeName: 'second',
      clinicalnoteTemplateTabs: [
        {
          label: '收藏',
          name: 'first',
        },
        {
          label: '全院',
          name: 'second',
        },
        {
          label: '科室',
          name: 'third',
        },
        {
          label: '我的',
          name: 'four',
        },
      ],
      loading: false,
      //当前选中的病历模板
      selectedTemplateList: [],
      clinicalnoteTemplateClassTable,
      isCreating: false,
    }
  },
  computed: {
    ...mapState(['orgInfo']),
    currentPatientInfo() {
      return this.patientRootComponent.currentPatientInfo
    },
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
    surgeryOrNot,
    handleSearchKeywordChange() {
      this.$nextTick(async () => {
        await this.refreshByTab(this.activeName, { type: 'filter' })
      })
    },
    handleDialogOpen() {
      this.clinicalnoteTemplateTree = []
      this.refreshByTab(this.activeName)
    },
    handleDialogClose() {
      this.emrCreateDialogData.isShow = false
    },
    handleTabClick(tab, event) {
      console.log('点击 tab ---------', tab, event)
      this.selectedTemplateList = []
      this.refreshByTab(tab.name)
    },
    refreshByTab(tabName, options) {
      switch (tabName) {
        case 'first':
          this.clinicalnoteTemplateTree = []
          // await this.getCollectClinicalnoteTemplateTree()
          break
        case 'second':
          this.getClinicalnoteTemplateTree('second', options) //全院
          break
        case 'third':
          this.clinicalnoteTemplateTree = []
          // await this.getMyClinicalnoteTemplateTree()
          break
        case 'four':
          this.clinicalnoteTemplateTree = []
          // await this.getOnlyMyClinicalnoteTemplateTree()
          break
        default:
          break
      }
    },
    async getClinicalnoteTemplateTree(tabName, options) {
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
      let data = JSON.parse(
        JSON.stringify(this.clinicalnoteTemplateTreeTestData.data)
      )

      if (options?.type == 'filter') {
        this.clinicalnoteTemplateTree = this.processClinicalnoteTemplateTree(
          this.filterTemplate(data)
        )
      } else {
        this.clinicalnoteTemplateTree =
          this.processClinicalnoteTemplateTree(data)
        console.log(this.filterTemplate(data), 2)
      }

      this.loading = false
      // }
    },
    filterTemplate(data) {
      if (!Array.isArray(data)) return []
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.inpatMrtTemplate?.length) {
          for (let j = 0; j < data[i]?.inpatMrtTemplate.length; j++) {
            const item2 = data[j]?.inpatMrtTemplate[j]
            if (!item2) continue
            if (!item2.inpMrtDisplayname.includes(this.searchKeyword)) {
              data[j].inpatMrtTemplate.splice(j, 1)
              j--
            }
          }
        }
        if (data[i].nodes) {
          data[i].nodes.forEach((item) => this.filterTemplate([item]))
        }
      }
      return data
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
        this.selectedTemplateList = []
        this.currentClinicalnoteTemplateClassData = {
          id: rowData.name,
          name: rowData.label,
        }
        console.log(this.currentClinicalnoteTemplateClassData)
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
    },
    filterClinicalnoteArr(clinicalnoteArr) {
      let createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
      clinicalnoteArr.forEach((el) => {
        el._displayname = el.data.inpMrtDisplayname || el.label
        el.createdAt = createdAt
        //399303379.个人 399303380.科室 399303381.全院"
        el.mrtTypeCode = this.setMrtTypeCode(el)
      })
    },
    setMrtTypeCode(nodeData) {
      let mrtTypeCode = ''
      if (this.activeName == 'second') {
        mrtTypeCode = 399303381
      }
      if (this.activeName == 'third') {
        mrtTypeCode = 399303380
      }
      if (nodeData.data.emrTemplatePersonalId) {
        mrtTypeCode = 399303379
        nodeData.data.inpatientMrtTypeId = nodeData.data.emrMrtMonitorId
      }
      return mrtTypeCode
    },
    async filterDisplayname(nodeData, displayname) {
      if (nodeData.isDefineTitle) {
        if (this.noteTaker === '') {
          this.$message({
            message: '请选择标题！',
            type: 'warning',
          })
          this.isCreating = false
          return Promise.reject()
        }
        const doctorName =
          this.options.find((el) => el.employeeId == this.noteTaker)
            ?.employeeName ?? ''
        if (this.checked) {
          if (this.doctorExpertise?.expertiseConceptId == '0') {
            this.$message({
              message: '未获取到职称',
              type: 'warning',
            })
            return Promise.reject()
          } else {
            let _displayname = `${doctorName}${this.doctorExpertise?.expertiseName}代${displayname}`
            return _displayname
          }
        } else {
          let _displayname = `${doctorName}${displayname}`
          return _displayname
        }
      } else {
        return displayname
      }
    },
    async parametVerify(clinicalnoteArr) {
      if (!clinicalnoteArr.length) {
        this.$message({
          message: '请选择模板！',
          type: 'warning',
        })
        return Promise.reject()
      }
      console.log('this.doctorSAdviceFlag', this.doctorSAdviceFlag)

      if (this.doctorSAdviceFlag) {
        let flag = clinicalnoteArr.some(
          (el) =>
            this.surgeryOrNot(el.data.inpatientMrtTypeId) &&
            el.data.inpEmrClassId == '121383422926546949'
        )
        if (flag && !this.operationValue.length) {
          this.$message({
            message: '请先下手术医嘱后再书写手术相关文书！',
            type: 'warning',
          })
          return Promise.reject()
        }
      }
    },
    async handleCreateClinicalnote() {
      try {
        this.isCreating = true
        let clinicalnoteArr = []
        // if (this.templateTitleType == 'templateNormal') {
        clinicalnoteArr = JSON.parse(JSON.stringify(this.selectedTemplateList))
        //规则校验
        await this.parametVerify(clinicalnoteArr)
        //处理数据
        await this.filterClinicalnoteArr(clinicalnoteArr)
        console.log(this.currentClinicalnoteTemplateClassData)
        //病程记录 处理连续病历
        for (let i = 0; i < clinicalnoteArr.length; i++) {
          if (clinicalnoteArr[i].data.inpEmrClassId == '121383422926546946') {
            //处理标题 个人模板名称特殊处理
            clinicalnoteArr[i]._displayname = await this.filterDisplayname(
              clinicalnoteArr[i],
              clinicalnoteArr[i].data.isPersonalTemplate
                ? clinicalnoteArr[i].data.emrMrtName
                : clinicalnoteArr[i]._displayname
            )
            //时间校验
            clinicalnoteArr[i].createdAt = await this.createdAtVerify()
          }
        }
        // } else {
        //   clinicalnoteArr = JSON.parse(
        //     JSON.stringify(this.selectedTemplateSetList)
        //   )
        //   //规则校验
        //   await this.parametVerify(clinicalnoteArr)
        //   //处理数据
        //   clinicalnoteArr.forEach((el) => {
        //     el._displayname = el.data.inpMrtDisplayname || el.label
        //     el.mrtTypeCode = el.data.mrtTypeCode
        //     el.createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
        //   })
        // }

        // if (this.isAudioHelp) {
        //   this.isAudioHelp = false
        // }

        if (clinicalnoteArr.length > 1) {
          //批量新增
          await this.togetherToCreate(clinicalnoteArr)
        } else {
          await this.singleCreate(clinicalnoteArr)
        }
      } finally {
        this.isCreating = false
      }
    },
    processingParameter(clinicalnoteArr) {
      return clinicalnoteArr.map((data) => ({
        bizRoleId: this.currentPatientInfo.bizRoleId,
        encounterId: this.currentPatientInfo.encounterId,
        inpatEmrSetFileTime: data.createdAt,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), //创建时间必须是当前时间
        //只有病程的导航名称为显示名称 其他病历为模板名称
        inpatEmrSetListTitle:
          data.data.inpEmrClassId == '121383422926546946'
            ? data._displayname
            : data.label,
        inpatEmrSetStatusCode: '960074',
        inpatEmrSetTitle: data._displayname,
        inpatEmrTypeId: data.data.inpEmrClassId,
        inpatientMrtId: data.data.emrTemplatePersonalId
          ? data.data.emrTemplatePersonalId
          : data?.id,
        mrtTypeCode: data.mrtTypeCode,

        inpMrtMonitorId: data.data.inpatientMrtTypeId,
        patientId: this.currentPatientInfo?.patientInfoOutput?.patientId ?? '',
        inpatEmrSetId: '',
        inpEmrDoctorId: this.noteTaker,
        reviewedBy: '',
        seqNo: '',
        withdrawnBy: '',
        encDeptId: this.orgInfo.orgId,
        DeptName: this.orgInfo.orgName,
      }))
    },
    async togetherToCreate(clinicalnoteArr) {
      // let autoDialogClose = true
      console.log('批量')
      if (!clinicalnoteArr.length) {
        return Promise.reject()
      }
      //如果是会诊的话就直接弹窗
      clinicalnoteArr.forEach((item, i) => {
        if (item.data.inpEmrClassId == '121383422926546950') {
          clinicalnoteArr.splice(i, 1)
          this.setConsultationCreatorVisibility({ flag: true })
        }
      })
      //创建所有的病历
      const inpEmrSetCreateList = this.processingParameter(clinicalnoteArr)
      console.log(inpEmrSetCreateList, '一键创建请求参数')
      // const {
      //   data: {
      //     returnMsgList = [],
      //     inpEmrSetIdList = [],
      //     deleteInpEmrSetList,
      //     replaceConfirmFlag,
      //     returnCode,
      //     replaceAddInputList,
      //     returnConfirmMsg
      //   }
      // } = await api
      //   .batchSaveClinicalnote({
      //     encounterId: this.currentPatientInfo.encounterId,
      //     bizRoleId: this.currentPatientInfo.bizRoleId,
      //     inpEmrSetCreateList
      //   })
      //   .catch(err => {
      //     this.$store.commit('setHomeLoading', false)
      //     console.log('createClinicalnoteListPromisesError', err)
      //   })
      // if (replaceConfirmFlag == '98175' && !returnCode) {
      //   //要弹窗
      //   let returnMsg = `${returnConfirmMsg}！`
      //   console.log(this.selectedTemplateList, '过滤前1')
      //   this.selectedTemplateList = this.selectedTemplateList.filter(item => {
      //     return replaceAddInputList.some(
      //       item2 => item2.inpatientMrtId == item.id
      //     )
      //   })
      //   console.log(this.selectedTemplateList, '过滤后1')
      //   this.deleteConfirm(deleteInpEmrSetList, returnMsg, 'batch')
      //   autoDialogClose = false
      //   // return Promise.reject()
      // }
      // if (returnMsgList.length) {
      //   returnMsgList.forEach(el => {
      //     setTimeout(() => {
      //       this.$message.warning(el)
      //     })
      //   })
      //   console.log(clinicalnoteArr, '----------', returnMsgList)
      //   if (clinicalnoteArr.length == returnMsgList.length)
      //     return Promise.reject()
      // }
      // console.log('创建后的', inpEmrSetIdList)
      // await this.updateDocStatusAfterCreated(inpEmrSetIdList)
      //手术逻辑
      // await this.surgery(inpEmrSetIdList)
      //刷新待书写列表
      // this.$root.eventHub.$emit('clinicalnote/refreshIncompleteDocList')
      // if (this.activateMenu == 'emr_tree') {
      // if (inpEmrSetIdList.length == 1) {
      //   console.log(clinicalnoteArr[0])
      //   //重新获取树结构
      //   this.$root.eventHub.$emit('clinicalnote/refreshTreeData', {
      //     inpatEmrTypeId: clinicalnoteArr[0].data.inpEmrClassId,
      //     inpatEmrSetId: emrSetId
      //   })
      // } else {
      //重新获取树结构
      // this.$root.eventHub.$emit('clinicalnote/refreshTreeData', {
      //   inpatEmrTypeId: clinicalnoteArr[0].data.inpEmrClassId
      // })
      // }
      // } else {
      // //重新获取时间轴数据
      // if (inpEmrSetIdList.length == 1) {
      //   this.$root.eventHub.$emit(
      //     'clinicalnote/refreshTimeLineData',
      //     emrSetId
      //   )
      // } else {
      // this.$root.eventHub.$emit('clinicalnote/refreshTimeLineData')
      // }
      // }

      // autoDialogClose && this.handleDialogClose()
    },
    async singleCreate(clinicalnoteArr) {
      console.log('单个')
      //创建病历前需要规则校验
      // let res = await api.clinicalnoteTouchAction({
      //   touchActionCode: '399542625',
      //   encounterId: this.currentPatientInfo.encounterId,
      //   inpEmrClassId: clinicalnoteArr[0].data.inpEmrClassId,
      //   inpMrtMonitorId: clinicalnoteArr[0].data.inpatientMrtTypeId
      // })
      // if (!res.success) {
      //   this.isCreating = false
      //   return Promise.reject()
      // }
      // if (res.data.replaceConfirmFlag == '98175' && !res.data.resultFlag) {
      //   this.deleteConfirm(
      //     [res.data.deleteInpEmrSet],
      //     res.data.returnMsg,
      //     'odd'
      //   )
      //   this.isCreating = false
      //   return Promise.reject()
      // }

      // if (res.data.replaceConfirmFlag == '98176' && !res.data.resultFlag) {
      //   this.$message.warning(res.data.returnMsg)
      //   this.isCreating = false
      //   return Promise.reject()
      // }
      // //如果是会诊的话就直接弹窗
      // if (clinicalnoteArr[0].data.inpEmrClassId == '121383422926546950') {
      //   this.handleDialogClose()
      //   this.setConsultationCreatorVisibility({ flag: true })
      // } else {
      //创建单个病历
      const inpEmrSetCreateList = this.processingParameter(clinicalnoteArr)
      console.log(inpEmrSetCreateList[0], '请求参数')
      //   let res2 = await api.createClinicalnote(inpEmrSetCreateList[0])

      //   this.setNearestCreatedEmrId(res2?.data?.inpatEmrSetId)

      //   clinicalnoteArr[0].inpatEmrSetId = res2?.data?.inpatEmrSetId
      //   clinicalnoteArr[0].inpMrtMonitorId = res2?.data?.inpMrtMonitorId
      //   await this.updateDocStatusAfterCreated(clinicalnoteArr)

      //   this.isCreating = false
      //   //手术逻辑
      //   const { data } = res2
      //   await this.surgery([data])
      //   if (data?.emrSetId) {
      //     //刷新待书写列表
      //     this.$root.eventHub.$emit('clinicalnote/refreshIncompleteDocList')
      //     //创建完病历刷新病历菜单
      //     if (this.activateMenu === 'emr_list') {
      //       this.$root.eventHub.$emit(
      //         'clinicalnote/refreshTimeLineData',
      //         data.emrSetId
      //       )
      //     } else {
      //       this.$root.eventHub.$emit('clinicalnote/refreshTreeData', {
      //         inpatEmrTypeId: clinicalnoteArr[0].data.inpEmrClassId,
      //         inpatEmrSetId: data.emrSetId
      //       })
      //     }
      //     this.handleDialogClose()
      //   } else {
      //     this.$message({
      //       message: data.commonOutputInfo.returnMsg,
      //       type: 'warning'
      //     })
      //   }
      // }
    },
    async createdAtVerify() {
      //时间校验 this.recordDate
      let ryDateTime = new Date(
        this.currentPatientInfo?.admittedToWardAt
      ).getTime()
      let nowvalue = (
        this.recordDate instanceof Date
          ? this.recordDate
          : new Date(this.recordDate)
      ).getTime()
      if (ryDateTime > nowvalue) {
        this.$message({
          message: '病程记录时间不能早于入院时间',
          type: 'warning',
        })
        this.isCreating = false
        return Promise.reject()
      }
      return dayjs(this.recordDate).format('YYYY-MM-DD HH:mm:ss')
    },
    isCheckJurisdiction(data) {
      let list = ['121383422926546946', '121383422926546945'] //病程、入院记录
      if (list.includes(data.data.inpEmrClassId)) {
        return this.selectedTemplateList.findIndex(
          (el) => el.data.inpEmrClassId == data.data.inpEmrClassId
        )
      }
      return -1
    },
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
