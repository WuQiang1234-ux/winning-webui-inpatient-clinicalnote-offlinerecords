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
import dayjs from 'dayjs'
import { debounce } from '@/utils/index'
import { treeData } from './aa'
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
      this.clinicalnoteTreeData = this.filterClinicalnoteTreeData(treeData.data)
    },
    filterClinicalnoteTreeData(data) {
      // let hasAnyEmrCreated = false
      return data
        .map((item) => {
          // 病历树，节点属性
          let emrClass = 'emrSet'
          //seriesFlag是否连续 98175连续（病程）   98176不连续
          if (item.seriesFlag == '98175') {
            // 连续病程
            emrClass = 'emrSetSerial'
          }
          if (item.inpatientEmrTypeId == '121383422926546960') {
            //病案首页
            // return undefined
            emrClass = 'medicalRecord'
          } else if (item.inpatientEmrTypeId == '121383422926546950') {
            //会诊记录
            emrClass = 'consultationNote'
          }
          item.myDeptCreated = true
          let clinicalnoteList = []

          if (item?.emrSetList?.length) {
            this.showQualityControl &&
              (item.defectCount = item.emrSetList.reduce((total, data) => {
                return total + data?.emrQcEmrSetOutputVO?.defectCount || 0
              }, 0))
            // hasAnyEmrCreated = true
            clinicalnoteList = item.emrSetList.map((cItem) => {
              if (
                this.showQualityControl &&
                cItem?.emrQcEmrSetOutputVO?.defectCount
              ) {
                cItem.defectCount = cItem.emrQcEmrSetOutputVO.defectCount
                item.defectCount = cItem.emrQcEmrSetOutputVO.defectCount
              }
              //根据参数设置时间格式
              let createTime = cItem.inpatEmrSetFileTime
              createTime = dayjs(createTime).format('YYYY-MM-DD HH:mm:ss')
              return {
                id: cItem.inpatEmrSetId,
                label: cItem.inpatEmrSetListTitle,
                createTime,
                fullTime: cItem.inpatEmrSetFileTime,
                emrTypeId: item.inpatientEmrTypeId,
                emrTypeName: item.inpatientEmrTypeName,
                defaultStatusCode: cItem.inpEmrDisplayStatusCode,
                currentStatusCode: cItem.inpEmrDisplayStatusCode,
                emrClass,
                loading: false,
                isFullLength: false,
                defectCount: cItem.defectCount,
                rawData: cItem,
              }
            })
          }
          // this.anyEmrCreated(hasAnyEmrCreated)

          this.treeLoading = false
          return {
            id: item.inpatientEmrTypeId,
            label: item.inpatientEmrTypeName,
            emrClass,
            isRoot: true,
            children: clinicalnoteList,
            rawData: item,
            defectCount: item.defectCount,
            // aaaa: 'ss'
          }
        })
        ?.filter((el) => el)
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
