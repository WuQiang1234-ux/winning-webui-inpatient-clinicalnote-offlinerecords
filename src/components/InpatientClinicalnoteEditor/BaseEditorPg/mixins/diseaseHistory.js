import api from '@/api/list.js'
import { decompress, isDraftStatus } from '../utils'
import { inpMrtMonitorIdEnum } from '@/utils/enumerate'
import { DcEditorRenderModes, EditorEvent, DataElementWinIds } from '@/libs/PgEditor/constants'
let diseaseHistoryMixin = {
  data() {
    return {
      DcEditorRenderModes,
      quickInputFocusList: {}, //记录快速输入可以联动的输入域id
      WINDataArray: {
        //处理主诉、现病史、和鉴别诊断的自动弹出（只有第一次自动弹出）
        [DataElementWinIds.DIFFERENTIAL_DIAGNOSIS]: 0, // 鉴别诊断
        [DataElementWinIds.MAIN_SUIT_INPUT]: 0, // 主诉
        [DataElementWinIds.ILLNEASS_HISTORY_INPUT]: 0, // 现病史
        secondaryDoctorWardRounds: 0 //二级医师查房记录
      }
    }
  },
  computed: {
    quickInputIds() {
      return Object.keys(this.quickInputFocusList)
    },
    //当前病历是否为第一次创建的二级医师查房记录
    isFirstRecordOfSecondaryDoctorWardRounds() {
      let _aim = this.clinicalnoteData.content?.list?.find(v => {
        return v.inpMrtMonitorId == inpMrtMonitorIdEnum.EJYSCFJL
      })
      if (_aim) {
        return _aim.id == this.currentDocId
      }
      return false
    }
  },
  mounted() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDiseaseHistoryConnection
    )
  },
  beforeDestroy() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_ON_CURSOR_CHANGED,
      this.handleDiseaseHistoryConnection
    )
  },
  methods: {
    // 关联智能标签
    handleDiseaseHistoryConnection(e) {
      //非编辑模式或没编辑权限则取消智能联动
      if (this.mode !== DcEditorRenderModes.SET_WORK_MODE_APP || !this.wrapOperationPermisstionData.editable) {
        return
      }
      console.log('智能联动~~~~~~', e)
      let winId = e.inputInfo.cptId
      let uniId = e.inputInfo.xId
      if (!winId) {
        return
      }
      //获取聚焦的输入框文案插入快速输入搜索框处
      let inpEmrLabelConceptId = this.quickInputFocusList[winId]
        ?.inpEmrLabelConceptId
      if (this.quickInputIds.indexOf(winId) !== -1) {
        // 处理“智能标签”辅助栏，“鉴别诊断”数据元获取光标后，自动弹出
        if (this.WINDataArray[winId] == 0) {
          //打开右侧辅助区域
          this.$root.eventHub.$emit('AuxiliaryInfo/ShowContentArea')
          this.WINDataArray[winId]++
        }

        //定位右侧辅助区域Tab
        this.$root.eventHub.$emit(
          'AuxiliaryInfo/SetActiveTab',
          'inputAssistant'
        )
      } else if (this.isFirstRecordOfSecondaryDoctorWardRounds) {
        winId = DataElementWinIds.MAIN_SUIT_INPUT
        if (this.WINDataArray.secondaryDoctorWardRounds == 0) {
          //打开右侧辅助区域
          this.eventHubHelper.emit('AuxiliaryInfo/ShowContentArea')
          this.WINDataArray.secondaryDoctorWardRounds++
        }
        //定位右侧辅助区域Tab
        this.eventHubHelper.emit('AuxiliaryInfo/SetActiveTab', 'inputAssistant')
      }
      if (
        inpEmrLabelConceptId ||
        winId == DataElementWinIds.DIFFERENTIAL_DIAGNOSIS
      ) {
        this.$root.eventHub.$emit('smartConnection/setInputInfo', {
          winId,
          uniId,
          inpEmrLabelConceptId
        })
      }
    },
    //获取联动的初始化数据
    async getQuickInputInitDataAsync() {
      //鉴别诊断联动
      this.quickInputFocusList[DataElementWinIds.DIFFERENTIAL_DIAGNOSIS] = {
        inpEmrLabelConceptId: '',
        content: ''
      }
      //目前病史存的数据只有：主诉、现病史、既往史、个人史、婚育史、家族史、专科情况
      let res = await api.quickTypeSectionLabelQuery({
        patientRoleId: this.currentPatientInfo.bizRoleId
      })
      if (res && res.success) {
        res.data.forEach(v => {
          if (v.diseaseHistory != null) {
            let _data = v.diseaseHistory
            let xml = ''
            if (_data.inpEmrContextData) {
              xml = decompress(_data.inpEmrContextData)
            }
            //将有病史数据的id放入联动列表中
            this.quickInputFocusList[_data.inpEmrLabelNo] = {
              inpEmrLabelConceptId: v.inpEmrLabelConceptId,
              content: _data.inpDiseaseHistoryContent
                .replace(/([/.]([^/.{}]*)({[^{}]*}))/gm, '')
                .trim(),
              xml
            }
          }
        })
      }
    },
    //普通病历智能联动
    async insertClinicalnoteQuickInputData() {
      let {
        content: { inpatEmrSetStatusCode, emrSetId }
      } = this.clinicalnoteData
      //新建和草稿状态都可以联动
      if (
        this.wrapOperationPermisstionData.editable &&
        isDraftStatus(inpatEmrSetStatusCode)
      ) {
        await this.getQuickInputInitDataAsync()
        //只有新建状态才填充
        if (inpatEmrSetStatusCode == '960074') {
          this.setXmlOrTextToEditor(emrSetId)
        }
      }
    },
    //连续病历智能联动
    async insertSerialClinicalnoteQuickInputData(subDocId) {
      //插入子病程无需重新请求数据
      if (!subDocId) {
        await this.getQuickInputInitDataAsync()
      }

      let list = this.loadedSubDocList
      for (let i = 0; i < list.length; i++) {
        if (subDocId && subDocId != list[i].id) {
          continue
        }
        if (!list[i].hasContent && list[i]?.permission?.editable) {
          this.setXmlOrTextToEditor(list[i].id)
        }
      }
    },
    //向病历中插入xml或纯文本   有xml则插入xml  没有xml则插入纯文本
    setXmlOrTextToEditor(docId) {
      const pgEditor = this.getEditor()
      for (let k in this.quickInputFocusList) {
        //由于缺省值优先级较高，缺省值已填充过了的输入域不做重复填充
        let _value = pgEditor.pgEditorInstance.postmessage({
          type: 'GetValue',
          param: {
            conceptId: k,
            docId,
            valueTarget: 'onlyDataElement'
          }
        })
        if (_value?.length && !_value[0].value) {
          if (this.quickInputFocusList[k].xml) {
            //插入xml需要先让光标定位在指定位置
            let _success = pgEditor.pgEditorInstance.postmessage({
              type: 'LocateCursorWithInput',
              param: [{
                cptId: k,//用来查找元素的id
                docId,
                position: 'innerafter',//位置after元素后边，innerafter元素内最后，before元素前，innerbefore元素内最前
                idType: 'CptId',//id的类型XID/CptId
                cursorChange:false,//是否触发光标定位事件
              }]
            })
            //光标定位成功则执行插入
            _success&&pgEditor.pgEditorInstance.postmessage({
              type: 'InsertDoc',
              param: [{
                srcStr: this.quickInputFocusList[k].xml, //插入的xml
                removParagraphFlag: true, //是否移除最后换行符
                isKeepTrace: false, //是否保留痕迹
                resetTitleToStr: true //把标题重置成文本的
              }]
            })
          } else {
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetValue',
              param: [{
                conceptId: k,
                docId,
                value: this.quickInputFocusList[k].content,
                valueType: 'text',
                type: 'normal',
                // KeepTrace: true,
                valueTarget: 'onlyDataElement'
              }]
            })
          }
        }
      }
    }
  }
}
export default diseaseHistoryMixin
