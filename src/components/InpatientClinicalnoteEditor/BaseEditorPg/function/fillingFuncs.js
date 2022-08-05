// import { MessageBox } from 'element-ui'
import dayjs from 'dayjs'
import api from '@/api/list'
import medicalRecordInformation from '@/api/dailyManager/medicalRecordInformation.js'

import { inpMrtMonitorIdEnum } from '@/utils/enumerate'
import { DataElementWinIds } from '@/libs/PgEditor/constants'
import { isDraftStatus } from '../utils'

//普通病历内容填充
export class FillingFuncsForClinicalnote {
  constructor(instance) {
    let { pgEditor, currentPatientInfo, userInfo, clinicalnoteData } = instance
    this.pgEditor = pgEditor
    this.currentPatientInfo = currentPatientInfo
    this.userInfo = userInfo
    this.clinicalnoteData = clinicalnoteData
  }

  //init方法需手动调 方便其他地方使用部分填充方法
  async init() {
    //设置病历标题
    await this.setClinicalnoteDisplayTitle()
    //填充记录时间
    await this.setRecordDate()
    //填充过敏史
    await this.setAllergyInfo()
    //临床路径填充
    await this.setClinicalPath()
    //婴儿基本信息
    await this.setBabyBaseInfo()
    //手术信息
    await this.injectDefaultDataOperationInformation()
    //填充参与者
    await this.setParticipator()
  }

  //填充病历模板名称（显示标题）
  setClinicalnoteDisplayTitle() {
    let conceptId = DataElementWinIds.TEMPLATE_DISPLAY_TITLE_INPUT
    let { inpatEmrSetStatusCode, emrSetTitle } = this.clinicalnoteData.content
    if (isDraftStatus(inpatEmrSetStatusCode) && this.isCptIdInputExist(conceptId).length) {
      this.pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: [
          {
            docId: '',
            conceptId,
            value: emrSetTitle,
            type: 'normal',
            valueType: 'text',
            KeepTrace: false,
            valueTarget: 'onlyDataElement'
          }
        ]
      })
    }
  }

  //填充记录时间
  setRecordDate() {
    let conceptId = DataElementWinIds.RECORD_DATE
    if (!this.clinicalnoteData.content.hasContent && this.isCptIdInputExist(conceptId).length) {
      this.pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: [{
          conceptId,
          docId: '',
          value: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          type: 'normal',
          resetDateTime: true,
          valueTarget: 'onlyDataElement'
        }]
      })
    }
  }

  //过敏史互通
  async setAllergyInfo() {
    let { inpatEmrSetStatusCode } = this.clinicalnoteData.content
    if (isDraftStatus(inpatEmrSetStatusCode)) {
      await this.pgEditor.setAllergyInfo()
    }
  }

  //临床路径填充（临床路径知情同意书）
  async setClinicalPath() {
    let {
      content: { inpMrtMonitorId, inpatEmrSetStatusCode }
    } = this.clinicalnoteData
    if (
      inpMrtMonitorId == inpMrtMonitorIdEnum.LCLJ_ZQTYS &&
      isDraftStatus(inpatEmrSetStatusCode)
    ) {
      let { encounterId } = this.currentPatientInfo
      let res = await api.getClinicalPath({ encounterId }).catch(() => { })
      if (!res?.data?.cliPathName) return
      this.pgEditor.setTheDefaultData(
        [
          {
            conceptId: '399336599',
            dataValue: res.data.cliPathName,
            displayValue: res.data.cliPathName
          }
        ],
        this.currentDocId,
        false
      )
    }
  }

  //婴儿基本信息填充
  async setBabyBaseInfo() {
    let { content: { inpMrtMonitorId, inpatEmrSetStatusCode } } = this.clinicalnoteData
    if (inpMrtMonitorId == inpMrtMonitorIdEnum.BABY_RECORD) {
      let res = await api
        .queryBabyBaseInfo(
          {
            encounterId: this.currentPatientInfo.encounterId,
            hospitalSOID: this.userInfo.hospitalSOID,
            host: `${process.env.VUE_APP_PUBLIC_PATH}/inpat-perinatal/`
            //测试数据
            // encounterId: 192624249408348160,
            // hospitalSOID: 992140,
            // host:'http://172.19.20.36/inpat-perinatal/',
          },
          { errWarn: false }
        )
        .catch(() => { })
      let data = res?.data || []
      let isCanEdit = isDraftStatus(inpatEmrSetStatusCode)
      let isCreateStatus = inpatEmrSetStatusCode == '960074'
      this.pgEditor.setBabyInfo(data, isCanEdit, isCreateStatus)
    }
  }

  //填充手术记录内容
  async injectDefaultDataOperationInformation() {
    if (this.clinicalnoteData.content.emrStatusCode == '960074') {
      let res = await api.queryDataElementTheOperationInformation({
        inpEmrSetId: this.clinicalnoteData.content.emrSetId
      }).catch(() => { })
      if (res?.data?.length) {
        let dataList = res.data.map(v => {
          return this.formatDynamicCollectionData(v)
        })
        this.pgEditor.setTheDefaultData(dataList, '')
      }
    }
  }

  //参与者信息（新建的病历才会填充）
  async setParticipator() {
    if (this.clinicalnoteData.content.inpatEmrSetStatusCode != '960074') return
    let inpEmrSetIds = [this.clinicalnoteData.content.emrSetId]
    const { encounterId } = this.currentPatientInfo
    let res = await api.queryParticipantData({
      encounterId
    }).catch(() => { })
    if (!res?.data) return

    let data = res.data?.map(v => {
      return this.formatDynamicCollectionData(v)
    }) ?? []

    this.pgEditor.setTheDefaultData(data, inpEmrSetIds, false)
  }

  //针对动态数据集填充取将值设置成key-value形式，自研编辑器会处理成顿号分割形式
  formatDynamicCollectionData(v) {
    if (v.dataValue && v.displayValue && v.dataValue != v.displayValue) {
      v.displayValue = [
        {
          key: v.dataValue,
          value: v.displayValue
        }
      ]
    }
    return v
  }

  //判断某个概念id的输入域是否存在
  isCptIdInputExist(cptId, docId = '') {
    let inputElement = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetElementByCptId',
      param: {
        cptId,
        docId,
        getHide: true
      }
    })
    console.log(inputElement, '判断某个概念id的输入域是否存在')
    if (inputElement?.length) {
      return inputElement.filter(v => {
        v.eleArr = v.eleArr.filter(
          v => (v.eleType == 'XImage' || v.eleType == 'XInputField') && v.xId
        )
        return v.eleArr.length
      })
    }
    return []
  }

}


//连续病程内容填充
export class FillingFuncsForSerialClinicalnote extends FillingFuncsForClinicalnote {
  constructor(instance) {
    super(instance)
    //newSubDocId 是否为新建子病程   病程填充包括已创建病程的批量填充和新插入病程的单独填充
    this.newSubDocId = ''
  }

  getNewClinicalnoteIds() {
    return this.clinicalnoteData.content.list.filter(el => el.inpatEmrSetStatusCode == '960074').map(el => el.id)
  }

  async init(newSubDocId = '') {
    this.newSubDocId = newSubDocId
    //填充病程标题、时间等
    this.injectDescribeAsync()
    //填充记录时间
    this.setRecordDate()
    //填充转出记录和转入记录上的转出科室和转入科室
    await this.queryTransferDepartment()
    //填充过敏史
    await this.setAllergyInfo()
    //填充病程内容危急值
    await this.setInpEmrCvAdviceContent()
    //填充参与者
    await this.setParticipator()
  }

  /*
  * 转出记录和转入记录均为连续病程
  * 转出记录和转入记录需要自动填充转出科室和转入科室
  */
  async queryTransferDepartment() {
    //缓存接口数据 避免多次请求
    let transferData = null
    let { content: { list } } = this.clinicalnoteData
    for (let i = 0; i < list.length; i++) {
      if (this.newSubDocId && this.newSubDocId != list[i].id) {
        continue
      }
      // 新建状态下才填充
      if (!list[i].hasContent && (list[i].inpMrtMonitorId == inpMrtMonitorIdEnum.ZCJL || list[i].inpMrtMonitorId == inpMrtMonitorIdEnum.ZRJL)) {
        if (!transferData) {
          let res = await api.queryTransferDepartment({
            encounterId: this.currentPatientInfo.encounterId
          })
          transferData = res?.data?.map(v => {
            return this.formatDynamicCollectionData(v)
          }) ?? []
        }

        if (transferData.length) {
          this.pgEditor.setTheDefaultData(
            transferData,
            list[i].id,
            false
          )
        }
      }
    }
  }

  //填充记录时间
  setRecordDate() {
    let conceptId = DataElementWinIds.RECORD_DATE
    let param = []
    let { content: { list } } = this.clinicalnoteData
    for (let i = 0; i < list.length; i++) {
      if (this.newSubDocId && this.newSubDocId != list[i].id) {
        continue
      }
      if (!list[i].hasContent && this.isCptIdInputExist(conceptId, list[i].id).length) {
        param.push({
          conceptId,
          docId: list[i].id,
          value: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          type: 'normal',
          resetDateTime: true,
          valueTarget: 'onlyDataElement'
        })
      }
    }

    param.length && this.pgEditor.pgEditorInstance.postmessage({
      type: 'SetValue',
      param
    })
  }

  //过敏史互通
  async setAllergyInfo() {
    if (this.newSubDocId) {
      await this.pgEditor.setAllergyInfo(this.newSubDocId)
    } else {
      let { content: { list } } = this.clinicalnoteData
      for (let i = 0; i < list.length; i++) {
        if (isDraftStatus(list[i].inpatEmrSetStatusCode)) {
          await this.pgEditor.setAllergyInfo(list[i].id)
        }
      }
    }
  }

  /**
   * 填充日常病程记录输入域
   * 1.临床医嘱
   * 2.危急值
   * 临床那边在以上两种情况的值产生时会调住院病历创建接口自动生成日常病程  病历根据生成的病历id查数据并填充  二者一般不会同时存在  无先后顺序
   * 
   */
  async setInpEmrCvAdviceContent() {
    let dailyCourseInputArr = this.isCptIdInputExist(
      DataElementWinIds.INP_EMR_CV_ADVICE_CONTENT_INPUT,
      this.newSubDocId || ''
    )
    //新建状态下的病历id
    let newIds = this.getNewClinicalnoteIds()
    dailyCourseInputArr = dailyCourseInputArr
      .filter(v => {
        return newIds.indexOf(v.docId) >= 0
      })
      .map(v => v.docId)

    if (!dailyCourseInputArr.length) return
    let params = []
    // 查临床医嘱  
    let res_1 = await api
      .queryDailyCourseContent({
        inpEmrSetIds: dailyCourseInputArr
      })

    if (res_1?.data?.length) {
      let data = res_1.data
        .filter(el => el.orderItemContent)
        .map(el => {
          return {
            docId: el.inpEmrSetId,
            conceptId: DataElementWinIds.INP_EMR_CV_ADVICE_CONTENT_INPUT,
            value: el.orderItemContent,
            displayValue: el.orderItemContent,
          }
        })
      if (data.length) {
        params.push(...data)
      }
    }

    // 查危急值  
    let res_2 = await medicalRecordInformation.getAdviceContent({
      inpatientEmrSetIds: dailyCourseInputArr
    })

    if (res_2?.data?.length) {
      let data = res_2.data
        .filter(el => el.inpEmrCvAdviceContent)
        .map(el => {
          return {
            docId: el.inpEmrSetId,
            conceptId: DataElementWinIds.INP_EMR_CV_ADVICE_CONTENT_INPUT,
            value: el.inpEmrCvAdviceContent,
            displayValue: el.inpEmrCvAdviceContent,
          }
        })

      if (data.length) {
        params.push(...data)
      }
    }

    this.pgEditor.setTheDefaultData(params)
  }

  //参与者信息（新建的病历才会填充）
  async setParticipator() {
    let inpEmrSetIds = this.getNewClinicalnoteIds()
    if (!inpEmrSetIds.length) return
    const { encounterId } = this.currentPatientInfo
    let res = await api.queryParticipantData({
      encounterId
    }).catch(() => { })
    if (!res?.data) return

    let data = res.data?.map(v => {
      return this.formatDynamicCollectionData(v)
    }) ?? []

    this.pgEditor.setTheDefaultData(data, inpEmrSetIds, false)
  }

  // 填充病程标题、时间等
  injectDescribeAsync(list) {
    /**
     * list未传参的情况下：
     * 加载全部病程取状态为新建、草稿病程
     * 新建一份病程插入取插入的那份病程
     * 
     */
    if (!list?.length) {
      if (this.newSubDocId) {
        list = this.clinicalnoteData.content.list.filter(el => el.id == this.newSubDocId)
      } else {
        list = this.clinicalnoteData.content.list.filter(el => {
          return isDraftStatus(el.emrStatusCode)
        })
      }
    }
    let systemConceptData = []

    list.map(el => {
      systemConceptData.push(
        ...[
          //病历模板标题
          {
            docId: el.id,
            conceptId: DataElementWinIds.TEMPLATE_DISPLAY_TITLE_INPUT,
            displayValue: el.emrSetTitle
          },
          //病程标题
          {
            docId: el.id,
            conceptId: DataElementWinIds.CONTINUOUS_TITLE_INPUT,
            displayValue: el.emrSetTitle
          },
          //病历时间
          {
            docId: el.id,
            conceptId: DataElementWinIds.CONTINUOUS_CREATEDAT_INPUT,
            displayValue: el.inpatEmrSetFileTime
          }
        ]
      )
    })
    this.pgEditor.setTheDefaultData(systemConceptData)
    console.log('时间、标题填充完成', systemConceptData)
  }
}
