import { canvasWrapText, isBase64 } from '@/utils/convertFunction'
import { DataElementWinIds } from '../constants'
import defaultImageForUnsign from '../assets/data/defaultImageForUnsign'
import store from '@/store'
import dayjs from 'dayjs'

export const txtSignatureDataArray = [
  '399316686', //亲属签名   文本框
  '399556072', //患者签名  文本框
  '399336333', //法定代理人签名日期时间
  DataElementWinIds.SIGNATURE_DATETIME //医师签名日期时间
]

export const signatureDataArray = [
  '390000225', //医师签名
  '399324018', //护士签名
  '399323838', //手术医生签名
  '390000227', //主治医师签名
  '390000100', //主任（副主任）医师签名
  '399324019', //科主任签名
  '399542293' //上级医师签名
]
export default class SignatureHelper {
  constructor(pgEditor) {
    this.pgEditor = pgEditor
    this.userInfo = pgEditor.userInfoGetter
    this.init()
  }

  // 初始化方法
  init() {}

  /*
   *  签名
   *  docId 当份病历id
   *  signCptId 签名位置概念id
   */
  async signClinicalnote(docId, cptId) {
    //获取需要签名的位置的xid信息
    let elementList = this.getSignXID(docId, cptId, true)
    if (!elementList?.length) return
    if (!store.state.globalConfig.doctorSignature) {
      //获取签名图片信息
      await store.dispatch('globalConfig/getDoctorSignature')
    }
    await this.signAction(
      docId,
      elementList,
      store.state.globalConfig.doctorSignature,
      true
    )
  }

  /* 撤销签名 */
  async unSignClinicalnote(
    docId = '',
    cptId = DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE,
    isClearAll = false
  ) {
    let elementList = this.getSignXID(docId, cptId, false, isClearAll)
    console.log(elementList, '撤销签名----')
    if (!elementList?.length) return
    await this.signAction(
      docId,
      elementList,
      {
        baseUrl: defaultImageForUnsign,
        width: 60,
        height: 30
      },
      false
    )
  }

  /*
   * 根据元素唯一XID签名
   * isSign  true-签名   false-撤销签名
   * isClearAll  撤销签名时是否清除该概念id的所有签名 true-全部清除  false-只清除当前用户的签名
   */
  getSignXID(docId, conceptId, isSign = true, isClearAll = false) {
    const elementList = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetValue',
      param: {
        conceptId,
        docId,
        valueTarget: 'onlyDataElement',
        getHideEle: true //获取隐藏的元素，修正多级签名域隐藏了获取不到的问题
      }
    })
    console.log(elementList, conceptId, 'elementList-----')
    if (elementList?.length) {
      let returnObj = [...elementList]
      if (isSign) {
        //需求：210337 签名每次需更新签名图片
        return returnObj
        //签名  没签名的地方签上名   签名了不作处理
        // returnObj = returnObj.filter(v => {
        //   return !v.haveValue
        // })
      } else {
        if (!isClearAll) {
          //撤销签名时只撤销自己签的名
          returnObj = returnObj.filter(v => {
            return v.employeeId == this.userInfo.employeeId
          })
        }
      }
      return returnObj
    }
    //上级医师签名
    if (
      conceptId !== DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SUPER_SIGNATURE
    ) {
      return this.getSignXID(
        docId,
        DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SUPER_SIGNATURE,
        isSign
      )
    }
    return []
  }

  //提交病历时有签名时间需更新签名时间
  setSignatureTime({
    docId = '',
    signTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }) {
    let signatureElement = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetElementByCptId',
      param: {
        cptId: DataElementWinIds.SIGNATURE_DATETIME, //医师签名日期时间,
        docId
      }
    })
    console.log(signatureElement, '签名时间测试-----')
    if (signatureElement?.length && signatureElement[0]?.eleArr?.length) {
      let _index = signatureElement[0].eleArr.findIndex(
        v => v.eleType == 'XInputField' && v.xId
      )
      if (_index >= 0) {
        this.pgEditor.pgEditorInstance.postmessage({
          type: 'SetValue',
          param: [
            {
              conceptId: signatureElement[0].eleArr[_index].xId,
              docId,
              value: signTime,
              unfocus: true,
              resetDateTime: true,
              idType: 'XID',
              type: 'normal',
              valueType: 'text',
              KeepTrace: true,
              valueTarget: 'onlyDataElement'
            }
          ]
        })
      }
    }
  }

  //病历中是否存在某个cpt的签名元素
  isNeedsSignature(docId, cptId) {
    let signatureElement = this.pgEditor.pgEditorInstance.postmessage({
      type: 'GetElementByCptId',
      param: {
        cptId,
        docId,
        getHide: true
      }
    })
    console.log(signatureElement, 'signatureElement----')
    if (signatureElement?.length && signatureElement[0]?.eleArr?.length) {
      return (
        signatureElement[0].eleArr.findIndex(
          v => (v.eleType == 'XImage' || v.eleType == 'XInputField') && v.xId
        ) >= 0
      )
    }
    return false
  }

  /*
   *docId 文档id
   *elementList 需（清空）签名元素
   *signatureInfo 签名图片信息
   */
  async signAction(docId, elementList, signatureInfo, isSign) {
    let param = elementList.map(v => {
      return {
        conceptId: v.xid || v.cptId,
        docId,
        value: signatureInfo.baseUrl,
        imgHaveValue: isSign,
        imgWidth: signatureInfo.width,
        imgHeight: signatureInfo.height,
        isBase64: isBase64(signatureInfo.baseUrl),
        //代签的签名图片   被代签的人能不能撤销??
        employeeId: isSign ? this.userInfo.employeeId : '', //撤销签名清空医生信息
        idType: v.xid ? 'XID' : 'CptId',
        type: 'normal',
        unfocus: true,
        KeepTrace: true,
        targetToHidden: true, //是否需给隐藏元素赋值（自研编辑器目前不给隐藏元素赋值，所以这里需要手动开启隐藏元素赋值）
        valueTarget: 'onlyDataElement'
      }
    })
    console.log(
      '签名动作----',
      docId,
      elementList,
      param,
      signatureInfo,
      isSign
    )
    this.pgEditor.pgEditorInstance.postmessage({
      type: 'SetValue',
      param
    })
  }

  async clearAllSignature(docId = '') {
    let elementList = []

    signatureDataArray.forEach(cptId => {
      let _list = this.getSignXID(docId, cptId, false, true)
      elementList.push(..._list)
    })

    if (!elementList?.length) return

    //清除所有签名图片
    await this.signAction(
      docId,
      elementList,
      {
        baseUrl: defaultImageForUnsign,
        width: 60,
        height: 30
      },
      false
    )

    const txtElementList = txtSignatureDataArray.map(conceptId => {
      return { conceptId }
    })

    //清除所有签名文字域
    this.pgEditor.clearTheDefaultData(txtElementList, docId)
  }
  //文字签名
  async signActionText(docId, elementList, signatureInfo, isSign) {
    console.log('文字签名动作----', docId, elementList, signatureInfo, isSign)
    let param = elementList.map(v => {
      return {
        conceptId: v.xid || v.cptId,
        docId,
        value: signatureInfo,
        idType: v.xid ? 'XID' : 'CptId',
        type: 'normal',
        unfocus: true,
        KeepTrace: true,
        SignValueType: 'text',
        valueTarget: 'onlyDataElement'
      }
    })
    this.pgEditor.pgEditorInstance.postmessage({
      type: 'SetValue',
      param
    })
  }
}

export class ConsultationSignatureHelper extends SignatureHelper {
  constructor(pgEditor) {
    super(pgEditor)
  }
  //会诊需指定图片或名字签名
  async signClinicalnote(docId, cptId, imgInfo, strName) {
    //获取需要签名的位置的xid信息
    let elementList = this.getSignXID(docId, cptId, true)
    if (!elementList?.length) return
    //获取签名图片信息
    const _signature = imgInfo ?? canvasWrapText(strName)
    await this.signAction(docId, elementList, _signature, true)
  }
}
