import api from '@/api/list'

import { decompress } from '../utils'
import { createNamespacedHelpers } from 'vuex'
const {
  mapState: clinicalnoteMapStates,
  mapMutations: clinicalnoteMapMutations
} = createNamespacedHelpers('emr')
let defaultValueMixin = {
  computed: {
    ...clinicalnoteMapStates(['nearestCreatedEmrId'])
  },
  methods: {
    ...clinicalnoteMapMutations(['setNearestCreatedEmrId']),
    /*isManualOperation:是否手动更新 自动填充只针对新建病历  手动更新针对新建、草稿状态下的病历*/
    async injectDefaultDataForClinicalnoteAsync(isManualOperation = false) {
      //如果病历无内容(未保存过)，则填充缺省值、默认值
      if (this.nearestCreatedEmrId == this.currentDocId || isManualOperation) {
        this.setNearestCreatedEmrId('')
        await this.doInjectDefaultDataForClinicalnoteAsync()
      }
    },

    /*isManualOperation:是否手动更新 只针对单份病程  自动填充只针对新建病历  手动更新针对新建、草稿状态下的病历*/
    async injectDefaultDataForSerialClinicalnoteAsync(
      subDocId,
      isManualOperation = false
    ) {
      let param = []
      if (subDocId) {
        if (subDocId == this.nearestCreatedEmrId || isManualOperation) {
          this.setNearestCreatedEmrId('')
          param.push({ docId: subDocId })
          await this.doInjectDefaultDataForClinicalnoteAsync(param)
        }
      } else {
        this.loadedSubDocList.forEach(v => {
          if (v.id == this.nearestCreatedEmrId) {
            this.setNearestCreatedEmrId('')
            param.push({ docId: v.id })
          }
        })
        if (param.length) {
          await this.doInjectDefaultDataForClinicalnoteAsync(param)
        }
      }
    },

    async doInjectDefaultDataForClinicalnoteAsync(param = []) {
      const pgEditor = this.getEditor()
      const dataElementData = pgEditor.pgEditorInstance.postmessage({
        type: 'GetElementListWithAttr',
        param
      })
      console.log('GetElementListWithAttr-------glz22', dataElementData)
      for (let i = 0; i < dataElementData.length; i++) {
        let doc = dataElementData[i]
        let dataElementIds = [] //需要填充缺省值的元素
        doc.valueList.forEach(v => {
          if (v.LackEllipsisvalue) {
            let _lastIndex = v.LackEllipsisvalue.lastIndexOf('_')
            let WinDefaultValue = v.LackEllipsisvalue.substr(_lastIndex + 1)
            let _arr = WinDefaultValue.split('**')
            if (_arr.length) {
              dataElementIds.push({
                id: v.cptId, //当前输入域id
                xid: v.xid,
                dataElementWinId: _arr[1], //当前输入域关联的id
                inpEmrTypeId: _arr[0],
                bindType: v.LackEllipsisvalue
              })
            }
          }
        })
        console.log('docDefaultValueList-------glz22', dataElementIds)
        if (dataElementIds.length) {
          let res = await api.querySelectionDataElement({
            dataElementIds,
            encounterId: this.currentPatientInfo.encounterId
          })
          let { success, data } = res
          if (success && data) {
            //非xml内容一次性插入
            let setValueParam = []
            dataElementIds.forEach(obj => {
              data?.forEach(v => {
                if (obj.dataElementWinId != v.inpEmrSectionWinId) return
                let _value = v.inpEmrDataElementValue.replace(/([/.]([^/.{}]*)({[^{}]*}))/gm, '').trim()
                let xml = ''
                if (v.inpEmrSectionContent) {
                  xml = decompress(v.inpEmrSectionContent)
                }

                if (xml) {
                  //先清空元素内容
                  console.log('*********', obj.id, obj.xid)
                  pgEditor.pgEditorInstance.postmessage({
                    type: 'SetValue',
                    param: [{
                      docId: param.length ? doc.docId : null,
                      conceptId: obj.xid || obj.id,
                      idType: obj.xid ? 'XID' : 'CptId',
                      value: '',
                      // KeepTrace: true,
                      valueTarget: 'majorDataElement'
                    }]
                  })
                  //插入xml需要先让光标定位在指定位置
                  let _success = pgEditor.pgEditorInstance.postmessage({
                    type: 'LocateCursorWithInput',
                    param: [{
                      cptId: obj.xid || obj.id,//用来查找元素的id
                      idType: obj.xid ? 'XID' : 'CptId',
                      docId: param.length ? doc.docId : null,
                      position: 'innerafter',//位置after元素后边，innerafter元素内最后，before元素前，innerbefore元素内最前
                      cursorChange: false,//是否触发光标定位事件
                    }]
                  })
                  //光标定位成功则执行插入
                  _success && pgEditor.pgEditorInstance.postmessage({
                    type: 'InsertDoc',
                    param: [{
                      srcStr: xml, //插入的xml
                      removParagraphFlag: true, //是否移除最后换行符
                      isKeepTrace: false, //是否保留痕迹
                      resetTitleToStr: true //把标题重置成文本的
                    }]
                  })
                } else if (_value) {
                  //下拉值需要特殊处理才能匹配上
                  if (v.sectionDataElementTypeCode == 2 || v.sectionDataElementTypeCode == 3) {
                    _value = _value.split('#')?.[0]
                  }
                  setValueParam.push({
                    docId: param.length ? doc.docId : null,
                    conceptId: obj.xid || obj.id,
                    value: _value,
                    idType: obj.xid ? 'XID' : 'CptId',
                    // KeepTrace: true,
                    valueTarget: 'majorDataElement'
                  })
                }
              })
            })
            console.log('setValueParam------glz', setValueParam)
            setValueParam.length &&
              pgEditor.pgEditorInstance.postmessage({
                type: 'SetValue',
                param: setValueParam
              })
          }
        }
      }
    }
  }
}

export default defaultValueMixin
