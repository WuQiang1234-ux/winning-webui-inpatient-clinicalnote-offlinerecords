/* eslint-disable no-undef */
import { Buffer } from 'buffer'
import Bzip2 from 'Bzip2'
export const formulaElementTypes = [
  'FourValues', //月经公式1
  'FourValues1', //月经公式2
  'FourValues2', //月经公式3
  'ThreeValues', //月经公式4
  // "Pupil",//瞳孔图
  // "LightPositioning",//光定位图
  // "FetalHeart",//胎心图
]
export const myCptId = {
  LAST_MENSTRUAL_PERIOD: '399296331', //末次月经
  MENSTRUATION_FIGURE: '399575364', //月经图id
  AGE_OF_MENARCHE: '0001', //初潮年龄
  MENSTRUAL_PERIOD: '0002', //经期
  PERIOD: '0003', //周期
  AGE_OF_MENOPAUSE: '0004', //绝经年龄
  AGE_OF_MENARCHE_DATE_TAPE: '0005', //初潮年龄是否使用日期
  AGE_OF_MENOPAUSE_DATE_TAPE: '0006', //绝经年龄是否使用日期
}
export function getFormulaElementListWithAttr(data) {
  let arr = []
  switch (data.type) {
    case 'FourValues': //月经公式1
      arr = [
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENARCHE,
          name: '初潮年龄',
          InnerValue: data.value1,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.MENSTRUAL_PERIOD,
          name: '经期',
          InnerValue: data.value2,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.PERIOD,
          name: '周期',
          InnerValue: data.value3,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE,
          name: '绝经年龄',
          InnerValue: data.value4,
          titleCptId: data.titleCptId,
        },
        {
          cptId:
            myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENARCHE_DATE_TAPE,
          name: '初潮年龄是否使用日期',
          InnerValue: data.value5,
          titleCptId: data.titleCptId,
        },
        {
          cptId:
            myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE_DATE_TAPE,
          name: '绝经年龄是否使用日期',
          InnerValue: data.value6,
          titleCptId: data.titleCptId,
        },
      ]
      break
    case 'FourValues1': //月经公式2
      arr = [
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENARCHE,
          name: '初潮年龄',
          InnerValue: data.value1,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.MENSTRUAL_PERIOD,
          name: '经期',
          InnerValue: data.value2,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE,
          name: '绝经年龄',
          InnerValue: data.value3,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.PERIOD,
          name: '周期',
          InnerValue: data.value4,
          titleCptId: data.titleCptId,
        },
      ]
      break
    case 'FourValues2': //月经公式3
      arr = [
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENARCHE,
          name: '初潮年龄',
          InnerValue: data.value1,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.MENSTRUAL_PERIOD,
          name: '经期',
          InnerValue: data.value2,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENOPAUSE,
          name: '绝经年龄',
          InnerValue: data.value3,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.PERIOD,
          name: '周期',
          InnerValue: data.value4,
          titleCptId: data.titleCptId,
        },
      ]
      break
    case 'ThreeValues': //月经公式4
      arr = [
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.AGE_OF_MENARCHE,
          name: '初潮年龄',
          InnerValue: data.value1,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.MENSTRUAL_PERIOD,
          name: '经期',
          InnerValue: data.value2,
          titleCptId: data.titleCptId,
        },
        {
          cptId: myCptId.MENSTRUATION_FIGURE + myCptId.PERIOD,
          name: '周期',
          InnerValue: data.value3,
          titleCptId: data.titleCptId,
        },
      ]
      break
    case 'Pupil': //瞳孔图
      // arr.push({
      //     type,
      //     name: current.GetAttribute("decodeName"),
      //     titleCptId:this.getXtextLabelElement(current)?.CptID,
      //     container:current.OwnerDocPanel.EleTypeName,
      //     value1:value.split(',')[0],//Value1
      //     value2:value.split(',')[1],//Value2
      //     value3:value.split(',')[2],//Value3
      //     value4:value.split(',')[3],//Value4
      //     value5:value.split(',')[4],//Value5
      //     value6:value.split(',')[5],//Value6
      //     value7:value.split(',')[6],//Value7
      // })
      break
    case 'LightPositioning': //光定位图
      // arr.push({
      //     type,
      //     name: current.GetAttribute("decodeName"),
      //     titleCptId:this.getXtextLabelElement(current)?.CptID,
      //     container:current.OwnerDocPanel.EleTypeName,
      //     value1:value.split(',')[0],//Value1
      //     value2:value.split(',')[1],//Value2
      //     value3:value.split(',')[2],//Value3
      //     value4:value.split(',')[3],//Value4
      //     value5:value.split(',')[4],//Value5
      //     value6:value.split(',')[5],//Value6
      //     value7:value.split(',')[6],//Value7
      //     value8:value.split(',')[7],//Value8
      //     value9:value.split(',')[8],//Value9
      // })
      break
    case 'FetalHeart': //胎心图
      // arr.push({
      //     type,
      //     name: current.GetAttribute("decodeName"),
      //     titleCptId:this.getXtextLabelElement(current)?.CptID,
      //     container:current.OwnerDocPanel.EleTypeName,
      //     value1:value.split(',')[0],//Value1
      //     value2:value.split(',')[1],//Value4
      //     value3:value.split(',')[2],//Value2
      //     value4:value.split(',')[3],//Value5
      //     value5:value.split(',')[4],//Value3
      //     value6:value.split(',')[5],//Value6
      // })
      break
  }
  return arr
}
//新建 草稿
export const isDraftStatus = function (code) {
  return code == '960074' || code == '390030405'
}

export function utf8ToBase64(str) {
  return window.btoa(unescape(encodeURIComponent(str)))
}

export function base64ToUtf8(str) {
  return decodeURIComponent(escape(window.atob(str)))
}

export function compress(xml) {
  if (!xml) return
  var data = new Buffer(xml, 'utf8')
  var compressed = Bzip2.compressFile(data)
  var compressedStr = new Buffer(compressed).toString('base64')
  return compressedStr
}

export function decompress(compressStr) {
  if (!compressStr) return
  var BufferBase64 = new Buffer(compressStr, 'base64')
  var decompressed = Bzip2.decompressFile(BufferBase64)
  var decompressedStr = new Buffer(decompressed).toString('utf8')
  return decompressedStr
}
