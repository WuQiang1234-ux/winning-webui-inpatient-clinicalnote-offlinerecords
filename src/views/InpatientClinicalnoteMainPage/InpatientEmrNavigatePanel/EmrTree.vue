<template>
  <div v-loading="treeLoading" class="emr-tree-wrap">
    <el-tree
      ref="clinicalnoteTreeRef"
      class="emr-tree"
      :data="clinicalnoteTreeData"
      node-key="id"
      :default-expanded-keys="treeDefaultExpandedKeys"
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
          <el-tooltip
            v-if="!data.isRoot"
            effect="dark"
            :content="statusText[data.currentStatusCode]"
            placement="right"
          >
            <iconFlagComponent :id="currentEmrSetId" :data="data" type="tree"></iconFlagComponent>
          </el-tooltip>
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
          <template v-if="data.isRoot">
            <span v-if="isShowAddButton" class="node-actions">
              <el-button
                class="node-action add-action"
                type="text"
                icon="el-icon-plus"
                @click.stop.prevent="
                  () => {
                    handleAddClinicalnote(data)
                  }
                "
              ></el-button>
            </span>
          </template>
          <template v-else>
            <!-- 会诊和已封存、已打印的病历不展示删除按钮 -->
            <span
              v-if="
                data.emrTypeId !== '121383422926546950' &&
                  data.rawData.inpEmrDisplayStatusCode !== '399572897' &&
                  data.rawData.inpEmrDisplayStatusCode !== '399572894'
              "
              class="node-actions"
              @mouseleave="DeleteLeave"
            >
              <el-tooltip
                v-if="deleteThePrompt"
                effect="dark"
                :content="deleteThePrompt"
                placement="right"
                :enterable="false"
              >
                <el-button
                  class="node-action delete-action"
                  type="text"
                  icon="el-icon-delete"
                  :loading="data.loading"
                  @click.stop.prevent="
                    () => {
                      handleDeleteClinicalnote(data)
                    }
                  "
                ></el-button>
              </el-tooltip>
              <el-button
                v-else
                class="node-action delete-action"
                type="text"
                icon="el-icon-delete"
                :loading="data.loading"
                @click.stop.prevent="
                  () => {
                    handleDeleteClinicalnote(data)
                  }
                "
              ></el-button>
            </span>
          </template>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script>
import $ from 'jquery'

import dayjs from 'dayjs'
import { statusText } from '@/utils/enumerate.js'
import { debounce } from '@/utils/index'
import getEventHubHelper from '@/utils/event_hub_helper.js'
import { MultiClinicalnoteBoardEventKeys } from '@/components/MultiClinicalnoteBoard'
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
      treeDefaultExpandedKeys: [], //树展开的目录id
      deleteThePrompt: false,
      statusText,
      isShowAddButton: true,
    }
  },
  computed: {},
  watch: {
    currentEmrSetId(v) {
      this.$refs.clinicalnoteTreeRef.setCurrentKey(v)
      // 更换成编辑图标
      this.NewAndChangedIcon()
      this.setScrollBarPosition()
    },
  },
  created() {},
  mounted() {
    this.getClinicalnoteTree()
    this.eventHubHelper = getEventHubHelper(
      this.$patientRootComponentStore.state.eventHub
    )

    const eventHubHelper = this.eventHubHelper
    eventHubHelper.on(
      MultiClinicalnoteBoardEventKeys.TAB_CLICK,
      this.handleMutiClinicalnoteBoardTabClick
    )
    eventHubHelper.on('clinicalnote/refreshTreeData', this.getClinicalnoteTree)
  },
  beforeDestroy() {
    this.eventHubHelper.destroy()
  },
  methods: {
    setScrollBarPosition() {
      if (this.activateMenu !== 'emr_tree') return
      this.$nextTick(() => {
        setTimeout(() => {
          let rectElement = $(this.$el).find('.is-current')
          let boxRectElement = $(this.$parent.$el).find(
            '.inpatient-emr-navigate-panel-body'
          )
          if (rectElement.length == 0 || boxRectElement.length == 0) return
          let rect = rectElement[0].getBoundingClientRect()
          let boxRect = boxRectElement[0].getBoundingClientRect()
          console.log('setScrollBarPosition-tree', rect, boxRect)
          if (rect.bottom > boxRect.bottom) {
            let oldScrollTop = boxRectElement.scrollTop()
            boxRectElement.scrollTop(
              oldScrollTop + rect.bottom + rect.height - boxRect.bottom
            )
          } else if (rect.top < boxRect.top) {
            let oldScrollTop = boxRectElement.scrollTop()
            boxRectElement.scrollTop(oldScrollTop - boxRect.top + rect.top)
          }
        }, 1000)
      })
    },
    handleAddClinicalnote(data) {
      this.$patientRootComponentStore.commit('emr/showEmrCreateDialog', {
        defaultTemplateClassId: data.rawData.inpatientEmrTypeId,
      })
    },
    getClinicalnoteTree(obj) {
      this.clinicalnoteTreeData = this.filterClinicalnoteTreeData(treeData.data)
      if (obj) {
        this.treeDefaultExpandedKeys = [obj.inpatEmrTypeId]
        setTimeout(() => {
          console.log(this.$refs)
          this.$refs[obj.inpatEmrSetId].click()
        })
      }
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
    handleMutiClinicalnoteBoardTabClick(data) {
      if (typeof data == 'object') {
        this.treeDefaultExpandedKeys.push(data.typeId)
        console.log(this.treeDefaultExpandedKeys, 'data.typeId')
        setTimeout(() => {
          console.log(this.$refs[data.id], 'this.$refs[data.id]')
          this.$refs[data.id].click()
        })
      } else {
        setTimeout(() => {
          this.$refs[data].click()
        })
      }
    },
    //加防抖（修复连续点击树形控件会请求多次导致连续病历出现重复）
    handleNodeClick: debounce(function (data) {
      console.log(data, '=-----')
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
    DeleteLeave() {},
  },
}
</script>

<style scoped lang="scss">
</style>
