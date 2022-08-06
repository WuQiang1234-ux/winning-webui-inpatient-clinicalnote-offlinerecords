/*global  $ :true*/
import { DiagnosisTypes, DataElementWinIds } from '../constants'

export function getDcEditorVm(vm) {
  if (!vm) {
    return null
  } else {
    if (vm.hook_root) {
      return vm
    } else {
      return getDcEditorVm(vm.$parent)
    }
  }
}

export function getPgEditorVm(vm) {
  if (!vm) {
    return null
  } else {
    if (vm.hook_root) {
      return vm
    } else {
      return getPgEditorVm(vm.$parent)
    }
  }
}

export function getWidgetPositionAtSelectionCursor(widget, window_ = window) {
  const dcEditorVm = getPgEditorVm(widget)
  const ctl = dcEditorVm.ctl
  const targetWindow = window_
  const targetDocument = targetWindow.document

  const editorOffset = $(ctl).offset()
  const editorWidth = $(ctl).width()
  const editorHeight = $(ctl).height()
  const selection = targetDocument.getSelection()
  const range = selection.getRangeAt(0)
  let { top, left, height, width } = range.getBoundingClientRect()
  if (!height && !width) {
    return null
  }

  const tipWidth = $(widget.$el).width()
  const tipHeight = $(widget.$el).height()

  console.log('editorOffset', editorOffset, editorHeight, top, left, height)
  let zoomRate = targetDocument.body.style.zoom
  zoomRate = zoomRate ? zoomRate : 1

  left = left * zoomRate
  top = (top + height) * zoomRate

  if (left + tipWidth > editorWidth) {
    left = left - tipWidth
  }

  if (top + tipHeight > editorHeight) {
    top = top - tipHeight - height * zoomRate
  }

  return {
    left,
    top
  }
}
export function getWidgetPositionByMouseEvent(widget, event) {
  const dcEditorVm = getDcEditorVm(widget)
  const ctl = dcEditorVm.ctl

  const editorWidth = $(ctl).width()
  const editorHeight = $(ctl).height()

  let left = event.clientX
  let top = event.clientY

  const elWidth = $(widget.$el).width()
  const elHeight = $(widget.$el).height()

  if (left + elWidth > editorWidth) {
    left = left - elWidth
  }

  if (top + elHeight > editorHeight) {
    top = top - elHeight
  }

  return {
    left,
    top
  }
}

export function getDropdownListData(DropdownListField) {
  var listitemcount = parseInt(DropdownListField.getAttribute('itemcount')) //下拉数量
  if (isNaN(listitemcount) == false && listitemcount > 0) {
    var items = new Array()
    for (var iCount = 0; iCount < listitemcount; iCount++) {
      var item = new Object()
      item.Text = DropdownListField.getAttribute('lt' + iCount)
      item.Value = DropdownListField.getAttribute('lv' + iCount)
      items.push(item)
    }
    return items
  }
  return []
}

export function getDropdownListValNameByVal(DropdownListField, value) {
  const list = getDropdownListData(DropdownListField)
  let name = ''
  list.forEach(function (item) {
    if (item.Value === value) {
      name = item.Text
    }
  })
  return name
}

export function getCurrentPatientInfo() {
  let _JINDAL_CURRENTPATIENTINFO = sessionStorage.getItem(
    '_JINDAL_CURRENTPATIENTINFO'
  )
  if (_JINDAL_CURRENTPATIENTINFO) {
    _JINDAL_CURRENTPATIENTINFO = JSON.parse(_JINDAL_CURRENTPATIENTINFO)
    return _JINDAL_CURRENTPATIENTINFO
  }

  console.warn('未能从sessionStorage中获取当前就诊患者信息')
  return {
    bizRoleId: '156460311350573057',
    encounterId: '183348026321096705',
    currentDeptId: '57397236357130241'
  }
}

export function getUserInfo() {
  let userInfo = sessionStorage.getItem('userInfo')
  if (userInfo) {
    //console.log('登录用户信息 -------------- ', userInfo)
    return JSON.parse(userInfo)
  }
  return {
    employeeId: '57393746696202243',
    userId: '57393746696202243',
    employeeNo: 'L10044',
    employeeName: '曲忠森',
    hospitalSOID: '256181',
    userHospitalSOID: '256181',
    appSystemRelativeUri: null,
    orgName: '上海市第六人民医院东院',
    orgPicUrl: null,
    isGroup: true,
    userRoleWebOutputDTOList: [
      {
        valueId: '256507',
        appRoleName: '门诊医生',
        pinyin: 'mzys',
        wubi: 'uyat'
      },
      {
        valueId: '256508',
        appRoleName: '住院医生',
        pinyin: 'zyys',
        wubi: 'wbat'
      },
      {
        valueId: '956504',
        appRoleName: '病区护士长',
        pinyin: 'bqhsc',
        wubi: 'uarft'
      },
      {
        valueId: '256501',
        appRoleName: '超级管理员',
        pinyin: 'cjgly',
        wubi: 'fxtgk'
      },
      {
        valueId: '256501',
        appRoleName: '超级管理员',
        pinyin: 'cjgly',
        wubi: 'fxtgk'
      },
      {
        valueId: '256510',
        appRoleName: '病区护士',
        pinyin: 'bqhs',
        wubi: 'uarf'
      },
      {
        valueId: '959651',
        appRoleName: '病案系统管理员',
        pinyin: 'baxtgly',
        wubi: 'uptxtgk'
      },
      {
        valueId: '399296993',
        appRoleName: '业务科室主任',
        pinyin: 'ywkszr',
        wubi: 'ottpyw'
      },
      {
        valueId: '399296994',
        appRoleName: '医务科主任',
        pinyin: 'ywkzr',
        wubi: 'attyw'
      },
      {
        valueId: '399303605',
        appRoleName: '系统管理员',
        pinyin: 'xtgly',
        wubi: 'txtgk'
      },
      {
        valueId: '256502',
        appRoleName: '挂号操作员',
        pinyin: 'ghczy',
        wubi: 'rkrwk'
      },
      {
        valueId: '256503',
        appRoleName: '收费操作员',
        pinyin: 'sfczy',
        wubi: 'nxrwk'
      },
      {
        valueId: '256504',
        appRoleName: '药库操作员',
        pinyin: 'ykczy',
        wubi: 'ayrwk'
      },
      {
        valueId: '256505',
        appRoleName: '药房操作员',
        pinyin: 'yfczy',
        wubi: 'ayrwk'
      },
      {
        valueId: '256506',
        appRoleName: '医技操作员',
        pinyin: 'yjczy',
        wubi: 'arrwk'
      },
      {
        valueId: '256509',
        appRoleName: '门诊护士',
        pinyin: 'mzhs',
        wubi: 'uyrf'
      },
      {
        valueId: '862134',
        appRoleName: '主数据管理员',
        pinyin: 'zsjgly',
        wubi: 'yortgk'
      },
      {
        valueId: '862135',
        appRoleName: '数据质量管理员',
        pinyin: 'sjzlgly',
        wubi: 'orrjtgk'
      },
      {
        valueId: '862136',
        appRoleName: '数据安全管理员',
        pinyin: 'sjaqgly',
        wubi: 'orpwtgk'
      },
      {
        valueId: '956505',
        appRoleName: '护理部主任',
        pinyin: 'hlbzr',
        wubi: 'rguyw'
      },
      {
        valueId: '959649',
        appRoleName: '病案首页质控员',
        pinyin: 'basyzky',
        wubi: 'upudrrk'
      },
      {
        valueId: '959650',
        appRoleName: '病案质控分析员',
        pinyin: 'bazkfxy',
        wubi: 'uprrwsk'
      },
      {
        valueId: '977563',
        appRoleName: '病案首页编码员',
        pinyin: 'basybmy',
        wubi: 'upudxdk'
      },
      {
        valueId: '977564',
        appRoleName: '病案首页录入员',
        pinyin: 'basylry',
        wubi: 'upudvtk'
      },
      {
        valueId: '977565',
        appRoleName: '病案统计员',
        pinyin: 'batjy',
        wubi: 'upxyk'
      },
      {
        valueId: '977566',
        appRoleName: '病案上报员',
        pinyin: 'basby',
        wubi: 'uphrk'
      },
      {
        valueId: '399207074',
        appRoleName: '门办管理员',
        pinyin: 'mbgly',
        wubi: 'ultgk'
      },
      {
        valueId: '399297001',
        appRoleName: '门诊发药操作员',
        pinyin: 'mzfyczy',
        wubi: 'uynarwk'
      },
      {
        valueId: '399297002',
        appRoleName: '门诊配药操作员',
        pinyin: 'mzpyczy',
        wubi: 'uysarwk'
      },
      {
        valueId: '399297003',
        appRoleName: '门诊审方操作员',
        pinyin: 'mzsfczy',
        wubi: 'uypyrwk'
      },
      {
        valueId: '399299414',
        appRoleName: '科室护士长',
        pinyin: 'kshsc',
        wubi: 'tprft'
      },
      {
        valueId: '399303606',
        appRoleName: '审计员',
        pinyin: 'sjy',
        wubi: 'pyk'
      },
      {
        valueId: '399299413',
        appRoleName: '实习护士',
        pinyin: 'sxhs',
        wubi: 'pnrf'
      }
    ],
    pinyin: 'qzs',
    wubi: 'mks',
    shortcut: null,
    genderCode: '50602',
    genderDesc: null,
    birthDate: '2020-06-18 00:00:00',
    employeeIntro: '该医生擅长各类疑难杂症。',
    portraitUrl:
      '/oss/mdm/employee/portrait/images/256181-57393746696202243-bnasmwjm.',
    signaturePicUrl:
      '/oss/mdm/employee/signature/images/256181-57393746696202243-hxh0szvw.',
    expertiseCode: '399470998',
    employmentStatus: '152437',
    employmentStatusDesc: null,
    employmentTypeCode: '253530',
    employmentTypeDesc: null
  }
}

export function getOrgInfo() {
  let orgInfo = sessionStorage.getItem('_JINDAL_ORGINFO')
  if (orgInfo) {
    return JSON.parse(orgInfo)
  }
  return {
    orgId: '57397236357130241',
    orgName: '儿科',
    subWardList: [
      { orgId: '59636995254300672', orgName: '六楼西病区(儿科)' },
      { orgId: '140818742622089217', orgName: '六楼泌尿病区' },
      { orgId: '59637027466555393', orgName: '八楼西病区(眼耳鼻喉泌尿)' }
    ],
    type: 'jindal',
    curWardId: '59636995254300672'
  }
}

export function getDiagnosisWinIdByType(type) {
  let diagnosisiLabelId = ''
  let diagnosisiInputId = ''
  switch (type) {
    case DiagnosisTypes.PRIMARY_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.PRIMARY_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.ADMISSION_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.ADMISSION_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.DISCHARGE_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.DISCHARGE_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.CORRECTION_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.CORRECTION_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.PREOPERATIVE_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.PREOPERATIVE_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.POSTOPERATIVE_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.CURRENT_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.CURRENT_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.CURRENT_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.DEATH_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.DEATH_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.DEATH_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.INTRAOPERATIVE_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT
      break
    case DiagnosisTypes.CONFIRM_DIAGNOSIS:
      diagnosisiLabelId = DataElementWinIds.CONFIRM_DIAGNOSIS_LABEL
      diagnosisiInputId = DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT
      break
    default:
      break
  }

  return {
    labelId: diagnosisiLabelId,
    inputId: diagnosisiInputId
  }
}

export function getDiagnosisTypeByWinId(windId) {
  let diagnosisType = ''
  switch (windId) {
    case DataElementWinIds.PRIMARY_DIAGNOSIS_LABEL:
    case DataElementWinIds.PRIMARY_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.PRIMARY_DIAGNOSIS
      break

    case DataElementWinIds.ADMISSION_DIAGNOSIS_LABEL:
    case DataElementWinIds.ADMISSION_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.ADMISSION_DIAGNOSIS
      break

    case DataElementWinIds.DISCHARGE_DIAGNOSIS_LABEL:
    case DataElementWinIds.DISCHARGE_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.DISCHARGE_DIAGNOSIS
      break

    case DataElementWinIds.CORRECTION_DIAGNOSIS_LABEL:
    case DataElementWinIds.CORRECTION_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.CORRECTION_DIAGNOSIS
      break

    case DataElementWinIds.PREOPERATIVE_DIAGNOSIS_LABEL:
    case DataElementWinIds.PREOPERATIVE_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.PREOPERATIVE_DIAGNOSIS
      break
    case DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_LABEL:
    case DataElementWinIds.INTRAOPERATIVE_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.INTRAOPERATIVE_DIAGNOSIS
      break
    case DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_LABEL:
    case DataElementWinIds.POSTOPERATIVE_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.POSTOPERATIVE_DIAGNOSIS
      break

    case DataElementWinIds.CURRENT_DIAGNOSIS_LABEL:
    case DataElementWinIds.CURRENT_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.CURRENT_DIAGNOSIS
      break

    case DataElementWinIds.DEATH_DIAGNOSIS_LABEL:
    case DataElementWinIds.DEATH_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.DEATH_DIAGNOSIS
      break

    case DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_LABEL:
    case DataElementWinIds.SUPPLEMENTARY_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.SUPPLEMENTARY_DIAGNOSIS
      break

    case DataElementWinIds.CONFIRM_DIAGNOSIS_LABEL:
    case DataElementWinIds.CONFIRM_DIAGNOSIS_INPUT:
      diagnosisType = DiagnosisTypes.CONFIRM_DIAGNOSIS
      break
    default:
      break
  }

  return diagnosisType
}
