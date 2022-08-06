<template>
  <el-dialog
    title="医学公式"
    :class="classNames.widgetMedicalFormulaDialogWrap"
    :visible.sync="store.widgetMedicalFormulaDialog.state.isShow"
    :modal="false"
    :close-on-click-modal="false"
    :modal-append-to-body="true"
    append-to-body
    width="720px"
    @close="handleDialogClose"
    @open="open"
  >
    <el-tabs
      v-model="activeTab"
      :tab-position="tabPosition"
      style="height: 500px"
      @tab-click="handleClickTab"
    >
      <el-tab-pane
        v-for="(tab, index) in tabList"
        :key="index"
        class="dialog-pane-scroll"
        :label="tab.label"
        :name="tab.name"
      >
        <template v-if="!tab.is">
          <Formula
            :ref="tab.name"
            :form="tab.form"
            :rules="tab.rules"
            :form-list="tab.formList"
            :calculate="tab.calculate"
            :returned="tab.returned"
            :radio-list="tab.radioList"
            :radio-value="tab.radioValue"
            :allData="allData"
            @insertMedicalFormula="insertMedicalFormula"
          ></Formula>
        </template>
        <template v-else>
          <component :is="tab.is" :ref="tab.name" @insertMedicalFormula="insertMedicalFormula"></component>
        </template>
        <!-- <component :is="tab.is" :ref="tab.name" @insertMedicalFormula="insertMedicalFormula" ></component> -->
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script>
import { DataElementWinIds } from '../../constants/data_element_win_ids'
import { ClassNamespace } from '../../constants'
import api from '@/api/list'
import { getPgEditorVm } from '../../utils'
import mixins from '../../mixins'
import Formula from './components'
import tabList from './index.js'
import { mapState } from 'vuex'
import { myCptId } from '@/components/InpatientClinicalnoteEditor/BaseEditorPg/utils.js'
export default {
  name: 'WidgetMedicalFormulaDialog',
  components: { Formula },
  mixins: [mixins.getInjectMixin()],
  props: {},
  data() {
    return {
      tabPosition: 'left',
      activeTab: 'basForm',
      classNamespace: ClassNamespace,
      tabList: tabList,
      cachedPresetSystemConceptData: null,
      defaultValue: null,
      signsInformationData: null,
      allData: []
    }
  },
  computed: {
    ...mapState(['currentPatientInfo']),
    classNames() {
      return {
        widgetMedicalFormulaDialogWrap: `${this.classNamespace}-widget-medical-formula-dialog-wrap`
      }
    }
  },
  beforeDestroy() {},
  mounted() {
    this.pgEditorVm = getPgEditorVm(this)
  },
  methods: {
    async open() {
      await this.getCachedPresetSystemConceptData() //获取基础数据
      await this.getDefaultValue() //获取缺省值
      await this.getVitalSigns() //获取生命体征
      console.log(
        '患者基础数据',
        JSON.stringify(this.cachedPresetSystemConceptData),
        '生命体征',
        JSON.stringify(this.signsInformationData),
        '缺省值',
        JSON.stringify(this.defaultValue)
      )
      this.allData = [
        ...this.cachedPresetSystemConceptData,
        ...this.signsInformationData,
        ...this.defaultValue
      ].filter(el => el.value)
    },
    // 填充身高体重BMI值(护理)
    setBMIInfo() {
      let { phyExamHgt, phyExamWt, bmiIndex } = this.currentPatientInfo
      let param = []
      if (phyExamHgt) {
        param.push({
          docId: this.cId,
          conceptId: DataElementWinIds.MEDICAL_EXAMINATION_HEIGHT,
          value: phyExamHgt,
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false
          // KeepTrace: true
        })
      }
      if (phyExamWt) {
        param.push({
          docId: this.currentDocId,
          conceptId: DataElementWinIds.MEDICAL_EXAMINATION_WEIGHT,
          value: phyExamWt,
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false
          // KeepTrace: true
        })
      }
      if (bmiIndex) {
        param.push({
          docId: this.currentDocId,
          conceptId: DataElementWinIds.MEDICAL_EXAMINATION_BMI,
          value: bmiIndex,
          type: 'normal',
          valueType: 'text',
          resetDateTime: true,
          buttonIconFlag: false,
          paragraphFlag: false,
          returnFlag: false,
          // KeepTrace: true,
          valueTarget: 'onlyDataElement'
        })
      }
      return param
    },
    //获取护理信息（优先级较高）和入区登记里面的体征信息
    async getVitalDataList() {
      let res = await api.getVitalSignsDatas({
        encounterId: this.currentPatientInfo.encounterId
      })
      const { success, data } = res
      if (success && data) {
        return [...data]
      }
    },
    async getVitalSigns() {
      //护理取
      let param1 = this.setBMIInfo()
      //接口取
      let data = await this.getVitalDataList()
      let param2 = data.map(el => ({
        conceptId: el.dataElementWinId,
        value: el.dataValue,
        name: el.inpMrtDataElementName
      }))
      console.log(param2)
      let arr = [...param1, ...param2]
      this.signsInformationData = arr
      console.log(this.signsInformationData, '生命1')
    },
    async getCachedPresetSystemConceptData() {
      const res = await api
        .querySystemConceptData({
          encounterId: this.currentPatientInfo.encounterId
        })
        .catch(() => {})
      this.cachedPresetSystemConceptData = res.data?.map(el => ({
        conceptId: el.dataElementUid,
        name: el.dataElementDesc,
        value: el.dataValue
      }))
      console.log(this.defaultValue, '基础3')
    },
    async getDefaultValue() {
      let dataElementIds = [
        {
          bindType: `templateType_Title_**${myCptId.MENSTRUATION_FIGURE +
            myCptId.AGE_OF_MENOPAUSE}`,
          dataElementWinId:
            myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE,
          id: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE,
          inpEmrTypeId: ''
        },
        {
          bindType: `templateType_Title_**${myCptId.MENSTRUATION_FIGURE +
            myCptId.AGE_OF_MENOPAUSE_DATE_TAPE}`,
          dataElementWinId:
            myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE_DATE_TAPE,
          id: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE_DATE_TAPE,
          inpEmrTypeId: ''
        },
        {
          bindType: `templateType_Title_**${myCptId.LAST_MENSTRUAL_PERIOD}`,
          dataElementWinId: myCptId.LAST_MENSTRUAL_PERIOD,
          id: myCptId.LAST_MENSTRUAL_PERIOD,
          inpEmrTypeId: ''
        }
      ]
      console.log(dataElementIds, 'dataElementIds')
      let res = await api.querySelectionDataElement({
        dataElementIds,
        encounterId: this.currentPatientInfo.encounterId
      })

      this.defaultValue = res.data?.map(el => ({
        conceptId: el.inpEmrSectionWinId,
        name: '',
        value: el.inpEmrDataElementValue
      }))
      console.log(this.defaultValue, '缺省2')
    },
    insertMedicalFormula(value) {
      //剔除中文的 插入是否有值
      if (
        value.includes('isOk') === false &&
        value.replace(/\D/gi, '') === ''
      ) {
        this.$message({
          message: '请计算值',
          type: 'warning'
        })
        return
      }
      if (value.includes('isOk')) {
        //日历的值
        value = value.replace('isOk', '')
      }
      try {
        this.pgEditorVm.pgEditorInstance.postmessage({
          type: 'InsertString',
          param: [value]
        })
      } catch (error) {
        console.log(error)
      } finally {
        this.handleDialogClose()
      }
    },
    handleDialogClose() {
      //重置
      this.handleReset()
      //关闭计算弹框
      this.hideDialog()
    },
    hideDialog() {
      this.store.widgetMedicalFormulaDialog.state.isShow = false
    },
    handleClickTab() {
      //切换重置
      this.handleReset()
    },
    handleReset() {
      //form 重置
      //parent
      let parentRef = this.$refs[this.activeTab][0]
      parentRef && parentRef.$refs.form.resetFields()
      this.$nextTick(() => {
        parentRef && parentRef.setDefautData()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$classNamespace: 'dc-editor';

.#{$classNamespace}-widget-medical-formula-dialog-wrap {
}
.dialog-pane-scroll {
  overflow-y: scroll;
  height: 510px;
}
</style>
