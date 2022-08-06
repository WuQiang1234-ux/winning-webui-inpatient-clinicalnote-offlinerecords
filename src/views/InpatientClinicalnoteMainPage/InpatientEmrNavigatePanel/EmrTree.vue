<template>
  <div v-loading="treeLoading" class="emr-tree-wrap">
    <el-tree
      ref="clinicalnoteTreeRef"
      class="emr-tree"
      :data="clinicalnoteTreeData"
      node-key="id"
      :expand-on-click-node="true"
      :render-after-expand="false"
      :current-node-key="currentEmrSetId"
      @node-contextmenu="handleContextMenu"
      @node-click="handleNodeClick"
    >
      <template slot-scope="{ data }">
        <span
          :ref="data.id"
          class="custom-tree-node"
          :class="{ 'custom-tree-node-img': data.isRoot }"
        >
          <div class="node-name">
            <template v-if="data.isRoot">{{ data.label }}</template>
            <el-tooltip v-else effect="dark" placement="right">
              <div slot="content">{{ data.rawData.inpatEmrSetListTitle }}</div>
              <!-- 主界面的 -->
              <span
                :ref="'nav-item' + data.id"
                class="label"
                @mouseenter="handleMouseEnter(data)"
              >{{ data.rawData.inpatEmrSetListTitle }}</span>
            </el-tooltip>
          </div>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script>
import { debounce } from '@/utils/index'
import mixin from './mixins'
export default {
  name: '',
  mixins: [mixin],
  components: {},
  props: {},
  data() {
    return {
      treeLoading: false,
      clinicalnoteTreeData: [],
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.setClinicalnoteTreeData()
  },
  methods: {
    setClinicalnoteTreeData() {
      this.clinicalnoteTreeData = [
        {
          id: '121383422926546945',
          label: '入院记录',
          emrClass: 'emrSet',
          isRoot: true,
          children: [
            {
              id: '241617551325681665',
              label: '儿科入院记录',
              createTime: '07-26',
              fullTime: '2022-07-26 17:18:56',
              emrTypeId: '121383422926546945',
              emrTypeName: '入院记录',
              defaultStatusCode: '399297355',
              currentStatusCode: '399297355',
              emrClass: 'emrSet',
              loading: false,
              isFullLength: false,
              isShowLigature: false,
              rawData: {
                inpatEmrSetId: '241617551325681665',
                inpatientMrtId: '218188994333458436',
                inpatEmrTypeId: '121383422926546945',
                inpatEmrSetTitle: '儿科入院记录',
                inpatEmrSetListTitle: '儿科入院记录',
                inpatEmrSetFileTime: '2022-07-26 17:18:56',
                inpatEmrSetStatusCode: '390030407',
                printedCount: null,
                printed: false,
                printMaxCount: null,
                inpEmrReviewLevelCode: null,
                createdBy: '57393570602543106',
                createdByName: '刘金兰',
                writeSelf: false,
                seriesFlag: null,
                showYear: null,
                showTimePattern: null,
                operationLimitCode: null,
                expertiseCode: null,
                inpEmrDoctorId: null,
                inpatientMrtTypeId: '125044678493294618',
                inpMrtMonitorId: '125044678493294618',
                inpEmrDisplayStatusCode: '399297355',
                inpEmrDisplayStatusName: '提交',
                emrSourceCode: null,
                myDeptCreated: true,
                emrQcEmrSetOutputVO: null,
                printLockFlag: null,
                sealedStatus: null,
                casePrintStatus: null,
                caseSpecialPermissionStatus: null,
                encDeptId: '57397322256476163',
                encDeptName: '骨科',
              },
            },
          ],
          rawData: {
            inpatientEmrTypeId: '121383422926546945',
            inpatientEmrTypeName: '入院记录',
            seriesFlag: '98176',
            seqNo: 1,
            emrSetList: [
              {
                inpatEmrSetId: '241617551325681665',
                inpatientMrtId: '218188994333458436',
                inpatEmrTypeId: '121383422926546945',
                inpatEmrSetTitle: '儿科入院记录',
                inpatEmrSetListTitle: '儿科入院记录',
                inpatEmrSetFileTime: '2022-07-26 17:18:56',
                inpatEmrSetStatusCode: '390030407',
                printedCount: null,
                printed: false,
                printMaxCount: null,
                inpEmrReviewLevelCode: null,
                createdBy: '57393570602543106',
                createdByName: '刘金兰',
                writeSelf: false,
                seriesFlag: null,
                showYear: null,
                showTimePattern: null,
                operationLimitCode: null,
                expertiseCode: null,
                inpEmrDoctorId: null,
                inpatientMrtTypeId: '125044678493294618',
                inpMrtMonitorId: '125044678493294618',
                inpEmrDisplayStatusCode: '399297355',
                inpEmrDisplayStatusName: '提交',
                emrSourceCode: null,
                myDeptCreated: true,
                emrQcEmrSetOutputVO: null,
                printLockFlag: null,
                sealedStatus: null,
                casePrintStatus: null,
                caseSpecialPermissionStatus: null,
                encDeptId: '57397322256476163',
                encDeptName: '骨科',
              },
            ],
            incompleteDocList: null,
            lockActionVOList: null,
            myDeptCreated: true,
          },
        },
      ]
    },
    handleMouseEnter() {},
    handleContextMenu() {},
    //加防抖（修复连续点击树形控件会请求多次导致连续病历出现重复）
    handleNodeClick: debounce(function (data) {
      if (data.isRoot) return
      //公共参数处理
      if (!data.children) {
        var params = {
          inpEmrClassId: data.rawData.inpatEmrTypeId,
          inpMrtId: data.rawData.inpatientMrtId,
          inpatEmrSetId: data.id,
        }
      }
      const { emrClass } = data

      //console.log('什么鬼哦，怎么跟我没关系', emrClass)
      if (emrClass == 'emrSet' || emrClass == 'consultationNote') {
        //普通病历处理
        this.openEmrSet(data, params)
      } else if (emrClass == 'emrSetSerial') {
        //处理连续病历
        this.openEmrSetSerial(data, params)
      } else if (emrClass == 'medicalRecord') {
        //病案首页
        this.openMedicalRecord(data, params)
      } else if (emrClass == 'MedtechReportIpt') {
        //医技报告
        this.openMedtechReportIpt(data, params)
      } else if (emrClass == 'InpCliSignOffOrder') {
        //医嘱单
        this.openInpCliSignOffOrder(data, params)
      } else if (emrClass == 'HistoryApplyForm') {
        //申请单
        this.openHistoryApplyForm(data, params)
      } else if (emrClass == 'DoctorReadingList') {
        //护理文书
        this.openDoctorReadingList(data, params)
      }
    }, 500),
  },
}
</script>

<style scoped lang="scss">
</style>
