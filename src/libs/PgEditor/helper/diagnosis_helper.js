import $ from 'jquery'
import { DataElementWinIds, DiagnosisTypes, EditorEvent } from '../constants'
import store from '@/store'
import { getDiagnosisWinIdByType, getDiagnosisTypeByWinId } from '../utils'
import { isBase64, getSignatureUrl } from '@/utils/convertFunction'
import dayjs from 'dayjs'
const PirncipalDiagnosisCode = ['432176', '98451'] // 西医主诊断
const AuxiliaryDiagnosisCode = ['432177', '98452'] // 西医从诊断
const ComplicationDiagnosisCode = ['399467781'] // 并发症
const TcmDiseaseCode = ['399467782'] // 中医疾病
const TcmSymptomCode = ['399467783'] // 中医症候

const allDiagnosisIds = [
  DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
  DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT,
  DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT,
  DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT,
  DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT,
  DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT,
  DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT,
  DataElementWinIds.DEATH_DIAGNOSIS_INPUT,
  DataElementWinIds.CURRENT_DIAGNOSIS_INPUT,
  DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT,
  DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT
]

/**
 * 主要处理入院记录和病程记录的初步诊断，入院诊断，修正诊断，补充诊断信息插入情况。
 * 使用表格进行这几种诊断信息的布局处理。
 *
 * 对于术前诊断，术中诊断，术后诊断，死亡诊断，出院诊断，目前诊断等其他的诊断，则单独提供插入的逻辑。
 */

export default class DiagnosisHelper {
  constructor(pgEditor) {
    this.DiagnosisTypes = DiagnosisTypes
    this.pgEditor = pgEditor

    this.diagnosisFormatConfig = false

    this.diagnosisTableXid = ''
    this.enabledDiagnosisTypes = []

    // fixme 临时添加，用于删除诊断
    this.listForDeleteDiagnosis = []
    this.configList = []
    this.httpDiagnosisData = null
    this.allDiagnosisData = []
    this.focusCptId = ''
  }
  async hasTargetDiagnosisTable() {
    const conceptIdElementPromary = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetElementByCptId',
      param: {
        cptId: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT
      }
    })
    const conceptIdElementadmission = this.pgEditor.pgEditorInstance.postmessage(
      {
        type: 'GetElementByCptId',
        param: {
          cptId: DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT
        }
      }
    )
    if (
      (conceptIdElementPromary.length > 0 &&
        conceptIdElementPromary[0].eleArr.length > 0) ||
      (conceptIdElementadmission.length > 0 &&
        conceptIdElementadmission[0].eleArr.length > 0)
    ) {
      console.log('当前有诊断')
      return true
    } else {
      return false
    }
  }

  monitorDiagnosisListByContextMenu(employeeInfo) {
    // 监听获取employee同一个人的某一个诊断的最后一个用于删除
    const { employeeId } = employeeInfo
    this.pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_BEFORE_RIGHT_MENU,
      async () => {
        const eles = await this.getDiagnosisEles()
        console.log('获取当前所有病历', eles)
        const list = eles
          .map(ele => {
            if (ele.CustomAttribute) {
              const CustomAttributeJSON = JSON.parse(ele.CustomAttribute)
              if (
                CustomAttributeJSON &&
                CustomAttributeJSON.employeeId === employeeId
              ) {
                return {
                  cptId:
                    ele.CId.indexOf('-') < 0 ? ele.CId : ele.CId.split('-')[0],
                  ...CustomAttributeJSON,
                  colIx: ele.colIx,
                  rowIx: ele.rowIx
                }
              }
            }
            return null
          })
          .filter(ele => {
            return ele
          })
          .map(ele => {
            const diagnosisType = getDiagnosisTypeByWinId(ele.cptId)
            ele.diagnosisType = diagnosisType
            return ele
          })
        const reversedList = list.reverse()
        const flagArr = []
        const filteredList = reversedList.filter(ele => {
          const { diagnosisType } = ele
          if (
            flagArr.indexOf(diagnosisType) >= 0 ||
            diagnosisType === DiagnosisTypes.PRIMARY_DIAGNOSIS
          ) {
            return false
          } else {
            flagArr.push(diagnosisType)
            return ele
          }
        })
        console.log('filteredList', filteredList)
        this.listForDeleteDiagnosis = filteredList
      }
    )
  }
  async getDiagnosisTableXid() {
    return await new Promise(resolve => {
      this.pgEditor.pgEditorInstance.updateDiagTable(
        {
          id: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT
        },
        e => {
          const xid = e?.xTableInfo?.xid
          console.log('获取诊断表格信息,', e, xid)
          resolve(xid)
        }
      )
    })
  }
  revokeDiagnosis(diagnosisType) {
    console.log('删除诊断了', this.listForDeleteDiagnosis)
    this.listForDeleteDiagnosis.filter(async item => {
      console.log(
        '清空诊断 ----------- ',
        item,
        item.diagnosisType,
        diagnosisType
      )
      if (item.diagnosisType === diagnosisType) {
        this.pgEditor.pgEditorInstance.updateDiagTable(
          {
            id: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
            rowIx: item.rowIx,
            colIx: item.colIx,
            diffRow: false,
            clearCell: true
          },
          e => {
            console.log('清空单元格,', e)

            this.diagnosisTableXid = e?.xTableInfo?.xid
            this.clearTableCell(item)
          }
        )
      }
    })
  }

  async getDiagnosisEles() {
    return await new Promise(resolve => {
      this.pgEditor.pgEditorInstance.updateDiagTable(
        {
          id: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
          // rowIx: 0,
          // colIx: 0,
          // diffRow: false,
          // clearCell: false,
          returnAllDiagEle: true
        },
        e => {
          if (e.xTableInfo && e.xTableInfo.AllDiagEleArr) {
            resolve(e.xTableInfo.AllDiagEleArr)
          }
        }
      )
    })
  }
  //给所有诊断增加点击事件监听
  monitorDiagnosisEleDbClick(cb = function () { }, employeeInfo, editable) {
    const { employeeId } = employeeInfo

    this.pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_INPUT_MOUSE_CLICK,
      async e => {
        console.log('active', e, employeeInfo)
        const { cptId, inputType, customAttribute } = e
        const ids = allDiagnosisIds
        if (inputType === 'diagnosis' || ids.indexOf(cptId) >= 0) {
          this.canEditable = editable
          if (customAttribute) {
            const CustomAttributeJSON = JSON.parse(customAttribute)
            // 当前点击的有患者信息说明是自定义的  只能是这个患者才能编辑诊断
            if (
              CustomAttributeJSON &&
              CustomAttributeJSON.employeeId === employeeId
            ) {
              this.focusCptId = cptId
              cb(cptId, 'sameEmploy')
            } else {
              cb(cptId, 'notSameEmploy')
            }
          } else {
            this.focusCptId = cptId
            cb(cptId, 'other')
          }
        }
      }
    )
  }

  //连续病程诊断增加点击事件监听
  monitorSerialDiagnosisEleDbClick(cb = function () { }, employeeInfo) {
    const { employeeId } = employeeInfo

    console.log(employeeId)
    this.pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_INPUT_MOUSE_CLICK,
      async e => {
        console.log('active', e)
        const { cptId, inputType, docId } = e
        const ids = allDiagnosisIds
        if (inputType === 'diagnosis' || ids.indexOf(cptId) >= 0) {
          this.focusCptId = cptId
          cb(cptId, docId)
        }
      }
    )
  }

  getPrimaryDiagnosisFiled(root) {
    const $root = root ? $(root) : $(this.pgEditor.getContentDocument())
    const $primaryDiagnosisField = $root.find(
      `[id="${DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT}"]`
    )
    return $primaryDiagnosisField
  }

  getOneDiagnosisFiled(root, diagnosisType) {
    const $root = root ? $(root) : $(this.pgEditor.getContentDocument())
    const { inputId: diagnosisInputWinId } = getDiagnosisWinIdByType(
      diagnosisType
    )
    const $diagnosisField = $root.find(`[id="${diagnosisInputWinId}"]`)
    return $diagnosisField
  }

  async getDiagnosisFormatConfigList() {
    console.log(
      'getDiagnosisFormatConfig ---------- ',
      store,
      store.state.emr.DiagnosisFormatConfig
    )
    return store.state.emr.DiagnosisFormatConfig
  }

  async getCertainDiagnosisFormatConfig(diagnosisType, configList = null) {
    if (!configList || configList.length == 0) {
      configList = await this.getDiagnosisFormatConfigList()
    }
    console.log(configList)
    const config = configList.filter(item => {
      return item.diagnosticTypeCode === diagnosisType
    })

    return config[0]
  }

  filterDiagnosisByType(allSelectDiagnosis, diagnosisType) {
    //初步诊断的配置信息
    let diagnosisFormatContent = store.state.emr.DiagnosisFormatContent
    console.log(allSelectDiagnosis, diagnosisType, diagnosisFormatContent)
    let list = []
    //初步诊断配置了内容 且诊断类型是初步诊断
    // if (
    //   diagnosisFormatContent &&
    //   diagnosisType == DiagnosisTypes.PRIMARY_DIAGNOSIS
    // ) {
    //   allSelectDiagnosis.map(diagnosis => {
    //     //配置的诊断包含这个诊断内容
    //     if (diagnosisFormatContent.indexOf(diagnosis.diagnosisTypeCode) > -1) {
    //       list.push(diagnosis);
    //     }
    //   });
    // } else if (
    //   diagnosisType == DiagnosisTypes.DISCHARGE_DIAGNOSIS &&
    //   !store.state.emr.DischargeDiagnosisiFlag
    // ) {
    //   //出院诊断点击了加载初步诊断的内容
    //   if (isClick) {
    //     allSelectDiagnosis.map(diagnosis => {
    //       if (
    //         diagnosis.diagnosisTypeCode === DiagnosisTypes.PRIMARY_DIAGNOSIS
    //       ) {
    //         list.push(diagnosis);
    //       }
    //     });
    //   } else {
    //     //初始化出院诊断，没有出院诊断类型，引用修正诊断→引用确定诊断→引用初步诊断
    //     let correctionArrs = []; //修正诊断
    //     let confirmArrs = []; // 确定诊断
    //     let primaryArrs = []; //初步诊断
    //     allSelectDiagnosis.map(diagnosis => {
    //       if (
    //         diagnosis.diagnosisTypeCode === DiagnosisTypes.CORRECTION_DIAGNOSIS
    //       ) {
    //         correctionArrs.push(diagnosis);
    //       }
    //       if (
    //         diagnosis.diagnosisTypeCode === DiagnosisTypes.CONFIRM_DIAGNOSIS
    //       ) {
    //         confirmArrs.push(diagnosis);
    //       }
    //       if (
    //         diagnosis.diagnosisTypeCode === DiagnosisTypes.PRIMARY_DIAGNOSIS
    //       ) {
    //         primaryArrs.push(diagnosis);
    //       }
    //     });
    //     if (correctionArrs.length > 0) {
    //       list = correctionArrs;
    //     } else if (confirmArrs.length > 0) {
    //       list = confirmArrs;
    //     } else {
    //       list = primaryArrs;
    //     }
    //   }
    // } else {
    //   allSelectDiagnosis.map(diagnosis => {
    //     if (diagnosis.diagnosisTypeCode === diagnosisType) {
    //       list.push(diagnosis);
    //     }
    //   });
    // }
    console.log(diagnosisFormatContent[diagnosisType])
    if (diagnosisFormatContent[diagnosisType]) {
      allSelectDiagnosis.map(diagnosis => {
        console.log(
          diagnosisFormatContent[diagnosisType] +
          '  ---- ' +
          diagnosis.diagnosisTypeCode
        )
        if (
          diagnosisFormatContent[diagnosisType].indexOf(
            diagnosis.diagnosisTypeCode
          ) > -1
        ) {
          list.push(diagnosis)
        }
      })
    } else {
      allSelectDiagnosis.map(diagnosis => {
        if (diagnosis.diagnosisTypeCode === diagnosisType) {
          list.push(diagnosis)
        }
      })
    }
    console.log(list)
    return list
  }

  groupDiagnosisByType(arr) {
    let keys = []
    let group = {}
    arr.forEach(item => {
      if (keys.indexOf(item.diagnosisTypeCode) < 0) {
        keys.push(item.diagnosisTypeCode)
        group[item.diagnosisTypeCode] = []
      }
      group[item.diagnosisTypeCode].push(item)
    })
    return group
  }

  insertTextLabel(text) {
    const elementId = Date.now()
    let params = {
      type: 'InsertTextLabel',
      param: [
        {
          inpMrtDeSectionDispName: text + '：' || '一级标题', //显示文本
          inpMrtDeSectionLevel: 1,
          conceptID: elementId,
          titleDescription: '标题描述',
          isDel: false,
          elementCode: true,
          readFlag: true, //只读
          editbleFlag: true,
          deleteFlag: false,
          saveFlag: true,
          positionFlag: true,
          showFlag: true,
          requireFlag: true,
          printFlag: true
        }
      ]
    }
    this.pgEditor.pgEditorInstance.postmessage(params)
  }

  insertDiagnosisElement(
    diagnoseType,
    value = [],
    arrangement = 'vertical',
    employeeInfo,
    eles
  ) {
    const conceptId = getDiagnosisWinIdByType(diagnoseType).inputId

    let elementId = conceptId
    console.log('conceptId ------------ ', conceptId, diagnoseType)
    // const idSuffix = Date.now()
    let dataEmementName = ''
    if (diagnoseType == DiagnosisTypes.ADMISSION_DIAGNOSIS) {
      dataEmementName = '入院诊断'
      elementId = `${elementId}-0`
    }
    if (diagnoseType == DiagnosisTypes.CORRECTION_DIAGNOSIS) {
      dataEmementName = '修正诊断'
      let correction = eles.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT
        )
      })
      elementId = `${elementId}-${correction.length}`
    }
    if (diagnoseType == DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS) {
      dataEmementName = '补充诊断'
      let supplementary = eles.filter(item => {
        return (
          item.CId.split('-')[0] ==
          DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT
        )
      })
      elementId = `${elementId}-${supplementary.length}`
    }
    if (diagnoseType == DiagnosisTypes.DISCHARGE_DIAGNOSIS) {
      dataEmementName = '出院诊断'
    }
    if (diagnoseType == DiagnosisTypes.CONFIRM_DIAGNOSIS) {
      dataEmementName = '确定诊断'
    }
    this.focusCptId = elementId
    let params = {
      type: 'InsertDiagnosisEle',
      param: [
        {
          elementCode: true,
          conceptDomainCode: elementId,
          elementName: dataEmementName,
          dataEmementName,
          placeNum: 0,
          underlineFlag: false,
          startBorderFlag: true,
          endBorderFlag: true,

          diagnoseCode: diagnoseType, //诊断类型编码
          diagnoseType: dataEmementName, //诊断类型
          // defaultText: isUpdate?"确定诊断1":"补充诊断1",//默认值
          emptyFlag: true, //可为空
          readFlag: false, //只读
          deleteFlag: false, //可删除
          printFlag: true, //是否打印当前元素
          skipFlag: true, //是否自动跳入下一元素
          borderFlag: true, //显示边框
          arrangement: arrangement, //排列方式
          splitChar: value.length > 1 ? ';' : '', //分隔符
          showWay: '全部诊断', //显示方式-中医/西医
          CustomAttribute: JSON.stringify(employeeInfo)
        }
      ]
    }
    const res = this.pgEditor.pgEditorInstance.postmessage(params)
    console.log('SET VALUE ---------- ', value, res)

    this.pgEditor.pgEditorInstance.postmessage({
      type: 'SetValue',
      param: [
        {
          conceptId: elementId,
          value: value,
          KeepTrace: true,
          unfocus: true,
          valueTarget: 'onlyDataElement'
        }
      ]
    })

    const xxx = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetElementByCptId',
      param: {
        cptId: elementId
      }
    })
    console.log('刚刚插入的诊断元素 ---------- ', elementId, xxx)
  }

  insertSignature(urlData) {
    const { baseUrl, width, height } = urlData
    const params = {
      type: 'InsertSyncImg',
      param: {
        // synchro: true,
        dataEmementName: '医师签名',
        // dataEmementName: 'cccc',
        // extendAttr1: 'bbb',
        /**
         * 需求210337
         * 此处的conceptDomainCode原先为390000225  与提交签名的概念id重复  现采用一个独立的概念id
         */
        conceptDomainCode: '2103372207',
        height,
        width,
        imgHaveValue: true,
        imgObj: baseUrl,
        IsImgBase64: isBase64(baseUrl)
      }
    }
    this.pgEditor.pgEditorInstance.postmessage(params)
  }

  async insertDateElement(
    dateFormat = 'YYYY-MM-DD HH:mm:ss',
    diagnosisType,
    employeeInfo,
    eles
  ) {
    let elementId = ''
    dateFormat = dateFormat ?? 'YYYY-MM-DD HH:mm:ss'
    if (diagnosisType === DiagnosisTypes.ADMISSION_DIAGNOSIS) {
      elementId = DataElementWinIds.ADMISSION_DATES
    }
    if (diagnosisType === DiagnosisTypes.CORRECTION_DIAGNOSIS) {
      let correction = eles.filter(item => {
        return (
          item.CId.split('-')[0] == DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT
        )
      })
      elementId = `${DataElementWinIds.CORRECTION_DATES}-${correction.length}`
    }
    if (diagnosisType === DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS) {
      let supplementary = eles.filter(item => {
        return (
          item.CId.split('-')[0] ==
          DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT
        )
      })
      elementId = `${DataElementWinIds.SUPPLEMENTARY_DATES}-${supplementary.length}`
    }
    if (diagnosisType === DiagnosisTypes.DISCHARGE_DIAGNOSIS) {
      elementId = DataElementWinIds.DISCHARGE_DATES
    }
    if (diagnosisType === DiagnosisTypes.CONFIRM_DIAGNOSIS) {
      elementId = DataElementWinIds.CONFIRM_DATES
    }
    let fmt = 'yyyy-MM-dd HH:mm:ss'
    if (dateFormat === 'YYYY-MM-DD HH:mm:ss') {
      fmt = 'yyyy-MM-dd HH:mm:ss'
    } else if (dateFormat === 'YYYY-MM-DD HH:mm') {
      fmt = 'yyyy-MM-dd HH:mm'
    } else if (dateFormat === 'YYYY年MM月DD日HH时mm分ss秒') {
      fmt = 'yyyy年MM月dd日HH时mm分ss秒'
    } else if (dateFormat === 'YYYY年MM月DD日HH时mm分') {
      fmt = 'yyyy年MM月dd日HH时mm分'
    } else if (dateFormat === 'YYYY年MM月DD日HH时') {
      fmt = 'yyyy年MM月dd日HH时'
    } else if (dateFormat === 'YYYY年MM月DD日') {
      fmt = 'yyyy年MM月dd日'
    } else if (dateFormat === 'YYYY年MM月') {
      fmt = 'yyyy年MM月'
    } else if (dateFormat === 'YYYY年') {
      fmt = 'yyyy年'
    }
    /*
        dateFormat: "yyyy年",
        dateFormat: "yyyy年MM月",
        dateFormat: "yyyy年MM月dd日",
        dateFormat: "yyyy-MM-dd",
        dateFormat: "yyyy年MM月dd日HH时",
        dateFormat: "yyyy年MM月dd日HH时mm分",
        dateFormat: "yyyy-MM-dd HH:mm",
        dateFormat: "yyyy年MM月dd日HH:mm",
        dateFormat: "yyyy年MM月dd日HH时mm分ss秒",
        dateFormat: "HH时mm分",
        dateFormat: "HH:mm",
        dateFormat: "HH:mm:ss",*/

    let params = {
      type: 'InsertDateEle',
      param: [
        {
          conceptDomainCode: elementId, //概念域ID
          elementName: '签名日期',
          dataEmementName: '签名日期',
          backgroundText: '签名日期',
          defaultText: '默认文本',
          // tooltipText: "提示文本",
          labelText: '', //前缀:
          suffixText: '', //:后缀
          preview: 'aaaaa',
          activateWay: 'MouseClick,MouseDblClick,Enter',

          hideQuoteFlag: 'false',
          underlineFlag: 'false',
          encryptFlag: 'false',
          dragFlag: 'false',
          emptyFlag: 'true',
          quoteFlag: 'false',
          sourceFlag: 'false',
          labelTextFlag: 'false',
          chooseFlag: 'false',
          multiFlag: 'true',
          valueRangeSql: 'false',
          lengthwaysFlag: 'false',
          editFlag: 'true',
          readFlag: false,
          sensitiveFlag: 'false',
          hideFlag: false,
          deleteFlag: false,
          printFlag: true,
          skipFlag: false,
          borderFlag: true,
          intoTime: true,
          CustomAttribute: JSON.stringify(employeeInfo),
          dateFormat: fmt
        }
      ]
    }
    this.pgEditor.pgEditorInstance.postmessage(params)
    console.log('日期 ------- ', dayjs().format(dateFormat))
    this.pgEditor.pgEditorInstance.postmessage({
      type: 'SetValue',
      param: [
        {
          conceptId: elementId,
          resetDateTime: true,
          unfocus: true,
          value: dayjs().format(dateFormat),
          KeepTrace: true,
          valueTarget: 'onlyDataElement'
        }
      ]
    })
  }

  //设置当前诊断日期是否可用
  async setDiagnosisDate(employeeInfo, editable) {
    const { employeeId } = employeeInfo
    let param = []
    let dateObj = {}
    dateObj[DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT] =
      DataElementWinIds.ADMISSION_DATES
    dateObj[DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT] =
      DataElementWinIds.CORRECTION_DATES
    dateObj[DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT] =
      DataElementWinIds.SUPPLEMENTARY_DATES
    dateObj[DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT] =
      DataElementWinIds.DISCHARGE_DATES
    //获取当前表格有的诊断
    let eles = await this.getDiagnosisEles()
    console.log('所有诊断元素啊啊啊啊', editable)
    console.log(eles)
    eles.map(ele => {
      if (ele.CustomAttribute) {
        const CustomAttributeJSON = JSON.parse(ele.CustomAttribute)
        if (
          CustomAttributeJSON &&
          CustomAttributeJSON.employeeId === employeeId
        ) {
          param.push({
            cId: `${dateObj[ele.CId.split('-')[0]]}-${ele.CId.split('-')[1]}`,
            attrs: {
              readFlag: false
            }
          })
        } else {
          param.push({
            cId: `${dateObj[ele.CId.split('-')[0]]}-${ele.CId.split('-')[1]}`,
            attrs: {
              readFlag: true
            }
          })
        }
      }
    })
    // 更新初步诊断的签名日期
    if (!editable) {
      param.push({
        cId: DataElementWinIds.SIGNATURE_DATETIME,
        attrs: {
          readFlag: true
        }
      })
    } else {
      param.push({
        cId: DataElementWinIds.SIGNATURE_DATETIME,
        attrs: {
          readFlag: false
        }
      })
    }
    console.log('更新已有元素')
    console.log(param)
    if (param.length > 0) {
      /* 更新已有元素*/
      this.pgEditor.pgEditorInstance.postmessage({
        type: 'UpdateBase', //更新已有的属性 比如给表格设置为不可删除
        param //可同时更新多个元素、例如数组[0]元素1、数组[1]元素2
      })
    }
  }
  insertReturn(_boolean) {
    let params = {
      type: 'InsertReturn',
      param: [
        {
          isElement: !_boolean
        }
      ]
    }
    this.pgEditor.pgEditorInstance.postmessage(params)
  }

  async getTargetTableCell(diagnosisType) {
    const config = await this.getCertainDiagnosisFormatConfig(diagnosisType)
    const inpatDiagnosticShowPosition = config.inpatDiagnosticShowPosition
    let colIx = 0
    let diffRow = false
    switch (inpatDiagnosticShowPosition) {
      case 'same_line-left':
        colIx = 0
        diffRow = false
        break
      case 'same_line-right':
        colIx = 1
        diffRow = false
        break
      case 'new_line-left':
        colIx = 0
        diffRow = true
        break
      case 'new_line-right':
        colIx = 1
        diffRow = true
        break
      default:
        break
    }

    const position = await new Promise(resolve => {
      this.pgEditor.pgEditorInstance.updateDiagTable(
        {
          id: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
          colIx: colIx,
          diffRow: diffRow,
          clearCell: false
        },
        e => {
          console.log('获取的新单元格的位置,', e, colIx, diffRow)
          resolve(e)
        }
      )
    })
    return position
  }

  async insertOneDiagnosis(
    _list = [],
    diagnosisType,
    tableCellData,
    employeeInfo
  ) {
    console.log('employeeInfo ------- ', employeeInfo)
    const config = await this.getCertainDiagnosisFormatConfig(diagnosisType)

    const imgUrlInfo = await getSignatureUrl(employeeInfo.employeeNo)

    let diagnosisData = _list?.length
      ? _list
      : await this.httpGetDiagnosisData()
    const eles = await this.getDiagnosisEles()

    diagnosisData = this.filterDiagnosisByType(diagnosisData, diagnosisType)

    const value = this.createDiagnosisList({
      data: diagnosisData,
      format: config
    })
    console.log('插入诊断哦哦 ---------- glz', value, this.pgEditor)
    const signatureDateEnabledFlag = config.enabledFlag
    const inpatDiagContentStyleConfig = config?.inpatDiagContentStyleConfig
    const ori = inpatDiagContentStyleConfig?.inpatDianContentPosition
    this.pgEditor.pgEditorInstance.updateDiagTable(
      {
        id: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
        colIx: tableCellData.colIx,
        rowIx: tableCellData.rowIx,
        diffRow: false,
        clearCell: false
      },
      () => {
        console.log('插入前已有诊断', eles)
        this.insertTextLabel(config.inpatDianosticAliasName) // 插入标题-诊断
        this.insertDiagnosisElement(
          diagnosisType,
          value,
          ori,
          employeeInfo,
          eles
        ) // 插入诊断元素

        this.insertReturn(true) // 插入回车

        this.insertTextLabel(config.inpatPhysicianSignature) // 插入标题-签名
        this.insertSignature(imgUrlInfo) // 插入签名元素
        if (
          diagnosisType === DiagnosisTypes.PRIMARY_DIAGNOSIS ||
          signatureDateEnabledFlag === '98361'
        ) {
          // 98360启用  98361停用
          return
        }
        this.insertReturn(true) // 插入回车

        this.insertTextLabel(config.inpatSignatureDateName) // 插入标题-日期
        this.insertDateElement(
          config.inpatSignatureDateStyle,
          diagnosisType,
          employeeInfo,
          eles
        ) // 插入日期元素
      }
    )
  }

  clearTableCell(position) {
    const { colIx, rowIx } = position

    const values = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetValue',
      param: {
        conceptId: this.diagnosisTableXid,
        valueTarget: 'all',
        rowIx
      }
    })
    console.log(this.diagnosisTableXid)
    console.log('GetValue', values)
    if (values.length) {
      const value = values[0]
      const tableData = value.value
      const rowData = tableData[rowIx]
      if (rowData) {
        const hanAnyColData = rowData.cells.reduce(
          (total, currentValue, currentIndex) => {
            if (currentIndex === colIx) {
              return total
            }
            return total || currentValue.inner
          },
          false
        )

        if (!hanAnyColData) {
          this.pgEditor.pgEditorInstance.postmessage({
            type: 'TextTableDeleteRow',
            param: [
              {
                conceptId: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
                rowIx
              }
            ]
          })
        } else {
          this.pgEditor.pgEditorInstance.updateDiagTable({
            id: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT,
            colIx,
            rowIx,
            diffRow: false,
            clearCell: true
          })
        }
      }
    }
  }

  createDiagnosisList(options) {
    const { data, format } = options

    console.log('data1', data)
    console.log('format2', format)

    function appendDiseaseStyle(text, inpatTradDiseaseStyle) {
      let _text = text
      switch (inpatTradDiseaseStyle) {
        case 'space':
          _text += ' '
          break
        case 'spot':
          _text += '.'
          break
        case 'dunhao':
          _text += '、'
          break
        default:
          break
      }
      return _text
    }

    let majorDiagnosticIndex = 1
    let chDiagnosticIndex = 1
    let TcmSymptomIndex = 1
    // let xInputField = ''
    let xString = ''
    let xList = []
    let ori = ''

    // let tcmXInputField = ''
    let tcmXString = ''
    let tcmXList = []
    let tcmOri = ''

    if (data.length === 1) {
      const item = data[0]
      const inpatDiagContentStyleConfig = format?.inpatDiagContentStyleConfig
      const _ori = inpatDiagContentStyleConfig?.inpatDianContentPosition
      let diagnosisDesc =
        (item.diagnosisPrefixName || '') +
        item.diagnosisDesc +
        (item.diagnosisSuffixName || '')
      if (PirncipalDiagnosisCode.indexOf(item.diagnosisPriSecCode) > -1) {
        // 主诊断
        ori = _ori

        xString = `${diagnosisDesc} `
        xList.push(xString)
      } else if (
        AuxiliaryDiagnosisCode.indexOf(item.diagnosisPriSecCode) > -1
      ) {
        // 从诊断
        console.log('从诊断样式配置 ----------- ')
        ori = _ori
        xString = `${diagnosisDesc} `
        xList.push(xString)
      } else if (
        ComplicationDiagnosisCode.indexOf(item.diagnosisPriSecCode) > -1
      ) {
        // 从诊断
        console.log('并发症样式配置 ----------- ')
        ori = _ori
        xString = `${diagnosisDesc} `
        xList.push(xString)
      } else if (TcmDiseaseCode.indexOf(item.diagnosisPriSecCode) > -1) {
        console.log('中医疾病 ----------- ')
        tcmOri = _ori
        tcmXString = `${diagnosisDesc} `

        tcmXList.push(tcmXString)
      } else if (TcmSymptomCode.indexOf(item.diagnosisPriSecCode) > -1) {
        console.log('中医症候 ----------- ')
        tcmOri = _ori
        tcmXString = `${diagnosisDesc} `
        tcmXList.push(tcmXString)
      }

      const _valueArr = []
      if (!tcmXList.length) {
        _valueArr.push({ title: '', arrangement: ori, content: xList })
      } else {
        _valueArr.push({
          title: '中医诊断',
          arrangement: tcmOri,
          content: tcmXList
        })
      }
      console.log('3', _valueArr)

      return _valueArr
    } else {
      data.forEach(item => {
        const inpatDiagContentStyleConfig = format?.inpatDiagContentStyleConfig
        const _ori = inpatDiagContentStyleConfig?.inpatDianContentPosition
        let diagnosisDesc =
          (item.diagnosisPrefixName || '') +
          item.diagnosisDesc +
          (item.diagnosisSuffixName || '')
        if (PirncipalDiagnosisCode.indexOf(item.diagnosisPriSecCode) > -1) {
          // 主诊断
          ori = _ori
          console.log(
            '主诊断样式配置 ----------- ',
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle
          )

          if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle ===
            'index-spot'
          ) {
            xString = `${majorDiagnosticIndex}.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle ===
            'index-space'
          ) {
            xString = `${majorDiagnosticIndex} ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle ===
            'index-dunhao'
          ) {
            xString = `${majorDiagnosticIndex}、${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle ===
            'space-space'
          ) {
            xString = `  ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle ===
            'space-space-space-space'
          ) {
            xString = `    ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle === 'space'
          ) {
            xString = ` ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle === 'spot'
          ) {
            xString = `.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle === 'dunhao'
          ) {
            xString = `、${diagnosisDesc} `
          } else {
            xString = `${diagnosisDesc} `
          }
          // xInputField += xString
          xList.push(xString)
          majorDiagnosticIndex++
        } else if (
          AuxiliaryDiagnosisCode.indexOf(item.diagnosisPriSecCode) > -1
        ) {
          // 从诊断
          console.log(
            '从诊断样式配置 ----------- ',
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle
          )
          ori = _ori

          if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle ===
            'index-spot'
          ) {
            xString = `${majorDiagnosticIndex}.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle ===
            'index-space'
          ) {
            xString = `${majorDiagnosticIndex} ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle ===
            'index-dunhao'
          ) {
            xString = `${majorDiagnosticIndex}、${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle ===
            'space-space'
          ) {
            xString = `  ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle ===
            'space-space-space-space'
          ) {
            xString = `    ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle === 'space'
          ) {
            xString = ` ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle === 'spot'
          ) {
            xString = `.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatViceDiagnosticStyle === 'dunhao'
          ) {
            xString = `、${diagnosisDesc} `
          } else {
            xString = `${diagnosisDesc} `
          }

          // xInputField += xString
          xList.push(xString)
          majorDiagnosticIndex++
        } else if (
          ComplicationDiagnosisCode.indexOf(item.diagnosisPriSecCode) > -1
        ) {
          // 从诊断
          console.log(
            '并发症样式配置 ----------- ',
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle
          )
          ori = _ori

          if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'index-spot'
          ) {
            xString = `${majorDiagnosticIndex}.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'index-space'
          ) {
            xString = `${majorDiagnosticIndex} ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'index-dunhao'
          ) {
            xString = `${majorDiagnosticIndex}、${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'space-space'
          ) {
            xString = `  ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'space-space-space-space'
          ) {
            xString = `    ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'space'
          ) {
            xString = ` ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle === 'spot'
          ) {
            xString = `.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatConcomitantDiseaseStyle ===
            'dunhao'
          ) {
            xString = `、${diagnosisDesc} `
          } else {
            xString = `${diagnosisDesc} `
          }

          // xInputField += xString
          xList.push(xString)
          // majorDiagnosticIndex++
        } else if (TcmDiseaseCode.indexOf(item.diagnosisPriSecCode) > -1) {
          console.log(
            '中医疾病 ----------- ',
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle
          )
          //
          tcmOri = _ori
          TcmSymptomIndex = 1

          if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle === 'index-spot'
          ) {
            tcmXString = `${chDiagnosticIndex}.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle === 'index-space'
          ) {
            tcmXString = `${chDiagnosticIndex} ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle ===
            'index-dunhao'
          ) {
            tcmXString = `${chDiagnosticIndex}、${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle === 'space-space'
          ) {
            tcmXString = `  ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle ===
            'space-space-space-space'
          ) {
            tcmXString = `    ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle === 'space'
          ) {
            tcmXString = ` ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle === 'spot'
          ) {
            tcmXString = `.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomStyle === 'dunhao'
          ) {
            tcmXString = `、${diagnosisDesc} `
          } else {
            tcmXString = `${diagnosisDesc} `
          }
          appendDiseaseStyle(
            tcmXString,
            inpatDiagContentStyleConfig?.inpatTradDiseaseStyle
          )
          // xInputField += xString
          tcmXList.push(tcmXString)
          chDiagnosticIndex++
        } else if (TcmSymptomCode.indexOf(item.diagnosisPriSecCode) > -1) {
          console.log(
            '中医症候 ----------- ',
            inpatDiagContentStyleConfig?.inpatMajorDiagnosticStyle
          )
          //
          tcmOri = _ori

          if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle ===
            'index-spot'
          ) {
            tcmXString = `${TcmSymptomIndex}.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle ===
            'index-space'
          ) {
            tcmXString = `${TcmSymptomIndex} ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle ===
            'index-dunhao'
          ) {
            tcmXString = `${TcmSymptomIndex}、${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle ===
            'space-space'
          ) {
            tcmXString = `  ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle ===
            'space-space-space-space'
          ) {
            tcmXString = `    ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle === 'space'
          ) {
            tcmXString = ` ${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle === 'spot'
          ) {
            tcmXString = `.${diagnosisDesc} `
          } else if (
            inpatDiagContentStyleConfig?.inpatTradSymptomNameStyle === 'dunhao'
          ) {
            tcmXString = `、${diagnosisDesc} `
          } else {
            tcmXString = `${diagnosisDesc} `
          }

          // xInputField += xString
          tcmXList.push(tcmXString)
          TcmSymptomIndex++
        }
      })

      const _valueArr = []
      if (!tcmXList.length) {
        _valueArr.push({ title: '', arrangement: ori, content: xList })
      } else {
        _valueArr.push(
          {
            title: '中医诊断',
            arrangement: tcmOri,
            content: tcmXList
          },
          {
            title: '西医诊断',
            arrangement: ori,
            content: xList
          }
        )
      }
      console.log('所有诊断格式化后', _valueArr)

      return _valueArr
    }
  }
  setMainDiagnosisData(docId, diagnosisData) {
    let mzArrs = diagnosisData.filter(diagnosis => {
      return diagnosis.diagnosisTypeCode == DiagnosisTypes.OUTPATIENT_DIAGNOSIS
    })
    let mqArrs = diagnosisData.filter(diagnosis => {
      return diagnosis.diagnosisTypeCode == DiagnosisTypes.CURRENT_DIAGNOSIS
    })
    console.log(333)
    console.log(mzArrs, mqArrs)
    let params = {
      type: 'GetElementListWithAttr',
      param: [
        { docId, conceptId: DataElementWinIds.OUTPATIENT_DIAGNOSIS_MAIN },
        { docId, conceptId: DataElementWinIds.CURRENT_DIAGNOSIS_MAIN }
      ]
    }
    const list = this.pgEditor.pgEditorInstance.postmessage(params)
    let allParmas = []
    list.map(item => {
      item.valueList.map(val => {
        if (val.cptId == DataElementWinIds.OUTPATIENT_DIAGNOSIS_MAIN) {
          allParmas.push({
            docId,
            conceptId: val.cptId,
            value: mzArrs.length > 0 ? mzArrs[0].diagnosisDesc : '',
            unfocus: true,
            KeepTrace: false,
            valueTarget: 'onlyDataElement'
          })
        }
        if (val.cptId == DataElementWinIds.CURRENT_DIAGNOSIS_MAIN) {
          allParmas.push({
            docId,
            conceptId: val.cptId,
            value: mqArrs.length > 0 ? mqArrs[0].diagnosisDesc : '',
            unfocus: true,
            KeepTrace: false,
            valueTarget: 'onlyDataElement'
          })
        }
      })
    })
    console.log(list, params, allParmas)
    if (allParmas.length > 0) {
      this.pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: allParmas
      })
    }
  }
  // 根据docId获取当前病历里面的诊断种类
  getElementListByConceptId(docId) {
    let allDiagnosisInput = {}
    allDiagnosisInput[DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT] =
      DiagnosisTypes.PRIMARY_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT] =
      DiagnosisTypes.ADMISSION_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT] =
      DiagnosisTypes.DISCHARGE_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT] =
      DiagnosisTypes.CORRECTION_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT] =
      DiagnosisTypes.PREOPERATIVE_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT] =
      DiagnosisTypes.INTRAOPERATIVE_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT] =
      DiagnosisTypes.POSTOPERATIVE_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.CURRENT_DIAGNOSIS_INPUT] =
      DiagnosisTypes.CURRENT_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT] =
      DiagnosisTypes.CONFIRM_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.DEATH_DIAGNOSIS_INPUT] =
      DiagnosisTypes.DEATH_DIAGNOSIS
    allDiagnosisInput[DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT] =
      DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS

    let params = {
      type: 'GetElementListWithAttr',
      param: [
        { docId, conceptId: DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT },
        { docId, conceptId: DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT },
        { docId, conceptId: DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT },
        { docId, conceptId: DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT },
        {
          docId,
          conceptId: DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT
        },
        {
          docId,
          conceptId: DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT
        },
        {
          docId,
          conceptId: DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT
        },
        { docId, conceptId: DataElementWinIds.CURRENT_DIAGNOSIS_INPUT },
        { docId, conceptId: DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT },
        { docId, conceptId: DataElementWinIds.DEATH_DIAGNOSIS_INPUT },
        {
          docId,
          conceptId: DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT
        }
      ]
    }
    const list = this.pgEditor.pgEditorInstance.postmessage(params)
    let haveDiagnosisLists = []
    list.map(item => {
      item.valueList.map(val => {
        haveDiagnosisLists.push(allDiagnosisInput[val.cptId])
      })
    })
    console.log(list, params, haveDiagnosisLists)
    return haveDiagnosisLists
  }
  async refreshAllDiagnosis(data) {
    let {
      _diagnosisData,
      root,
      _diagnosisType,
      isUpdate,
      isLast,
      isClick, //出院诊断点击和首次加载取值不一样需特殊处理
      KeepTrace,
      diagnosisDataIn
    } = data

    console.log(
      '刷新所有诊断 -------- ',
      root,
      this.httpDiagnosisData,
      _diagnosisData,
      _diagnosisType,
      diagnosisDataIn,
      isLast
    )
    // 目前诊断拿接口数据
    if (_diagnosisType == DiagnosisTypes.CURRENT_DIAGNOSIS) {
      _diagnosisData = null
    }
    if (!this.pgEditor.pgEditorLoaded) {
      return
    }
    let configList = []
    let httpDiagnosisData = []
    if (diagnosisDataIn) {
      this.httpDiagnosisData = diagnosisDataIn
    }
    if (this.configList.length && !isUpdate) {
      configList = this.configList
    } else {
      this.configList = await this.getDiagnosisFormatConfigList()
      configList = this.configList
    }
    let diagnosisData = null
    if (_diagnosisData) {
      diagnosisData = _diagnosisData
    } else {
      if (this.httpDiagnosisData && !isUpdate) {
        httpDiagnosisData = this.httpDiagnosisData
        diagnosisData = httpDiagnosisData
      } else {
        this.httpDiagnosisData = await this.httpGetDiagnosisData()
        httpDiagnosisData = this.httpDiagnosisData
        diagnosisData = httpDiagnosisData
      }
    }
    // let diagnosisData = _diagnosisData ? _diagnosisData : httpDiagnosisData
    this.setMainDiagnosisData(root, diagnosisData)
    if (_diagnosisType) {
      let diagnosisData_ = this.filterDiagnosisByType(
        diagnosisData,
        _diagnosisType,
        isClick
      )
      console.log(
        '自研编辑器诊断信息 ---------xxxxxxx ',
        diagnosisData_,
        diagnosisData,
        _diagnosisType
      )
      const config = await this.getCertainDiagnosisFormatConfig(
        _diagnosisType,
        configList
      )
      let conceptId = this.focusCptId
      if (diagnosisData_.length) {
        const value = this.createDiagnosisList({
          data: diagnosisData_,
          format: config
        })
        const inpatDiagContentStyleConfig = config?.inpatDiagContentStyleConfig
        const ori = inpatDiagContentStyleConfig?.inpatDianContentPosition
        console.log(
          '执行设置的操作 ---------- ',
          conceptId,
          ori,
          value,
          root,
          this.canEditable
        )
        this.pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param: [
            {
              docId: root,
              conceptId,
              value: value,
              unfocus: true,
              KeepTrace,
              valueTarget: 'onlyDataElement'
            }
          ]
        })

        //当前点击的是表格内容的入院诊断 如果当前没有编辑权限 那么表格外面的诊断不更新否则更新
        if (
          conceptId.split('-')[0] ==
          DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT &&
          this.canEditable
        ) {
          conceptId =
            conceptId.indexOf('-') > -1
              ? conceptId.split('-')[0]
              : `${conceptId}-0`
          this.pgEditor.pgEditorInstance.postmessage({
            type: 'SetValue',
            param: [
              {
                docId: root,
                conceptId,
                value: value,
                unfocus: true,
                KeepTrace,
                valueTarget: 'onlyDataElement'
              }
            ]
          })
        }
      } else {
        this.pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param: [
            {
              docId: root,
              conceptId,
              value: [],
              unfocus: true,
              KeepTrace,
              valueTarget: 'onlyDataElement'
            }
          ]
        })

        //当前点击的是表格内容的入院诊断 如果当前没有编辑权限 那么表格外面的诊断不更新否则更新
        if (
          conceptId.split('-')[0] ==
          DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT &&
          this.canEditable
        ) {
          conceptId =
            conceptId.indexOf('-') > -1
              ? conceptId.split('-')[0]
              : `${conceptId}-0`
          this.pgEditor.pgEditorInstance.postmessage({
            type: 'SetValue',
            param: [
              {
                docId: root,
                conceptId,
                value: [],
                unfocus: true,
                KeepTrace,
                valueTarget: 'onlyDataElement'
              }
            ]
          })
        }
      }
      return
    }

    //获取当前页面有的诊断 只更新有的诊断  没有的诊断不做更新操作
    const haveDiagnosisLists = this.getElementListByConceptId(root)
    console.log(haveDiagnosisLists)
    for (let i = 0; i < haveDiagnosisLists.length; i++) {
      const diagnosisType = haveDiagnosisLists[i]
      let { inputId: diagnosisInputWinId } = getDiagnosisWinIdByType(
        diagnosisType
      )
      let diagnosisData_ = this.filterDiagnosisByType(
        diagnosisData,
        diagnosisType,
        isClick
      )
      console.log(
        '自研编辑器诊断信息1 ---------xxxxxxx ',
        diagnosisData_,
        diagnosisData,
        isLast,
        diagnosisType
      )
      const config = await this.getCertainDiagnosisFormatConfig(
        diagnosisType,
        configList
      )
      if (diagnosisData_.length) {
        const value = this.createDiagnosisList({
          data: diagnosisData_,
          format: config
        })
        console.log('value的值是：', value)
        if (isLast == 'no') {
          this.allDiagnosisData.push({
            docId: root,
            conceptId: diagnosisInputWinId,
            value: value,
            unfocus: true,
            KeepTrace,
            valueTarget: 'onlyDataElement'
          })

          //连续病程循环结束再调用自研方法一次性设置诊断
        } else {
          this.pgEditor.pgEditorInstance.postmessage({
            type: 'SetValue',
            param: [
              {
                docId: root,
                conceptId: diagnosisInputWinId,
                value: value,
                unfocus: true,
                KeepTrace,
                valueTarget: 'onlyDataElement'
              }
            ]
          })
        }
      } else {
        this.pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param: [
            {
              docId: root,
              conceptId: diagnosisInputWinId,
              value: [],
              unfocus: true,
              KeepTrace,
              valueTarget: 'onlyDataElement'
            }
          ]
        })
      }
    }
    console.log(isLast, this.allDiagnosisData)
    if (isLast == 'yes' && this.allDiagnosisData.length > 0) {
      console.log('连续病程开始更新了', this.allDiagnosisData)
      this.pgEditor.pgEditorInstance.postmessage({
        type: 'SetValue',
        param: this.allDiagnosisData
      })
    }
  }
}
