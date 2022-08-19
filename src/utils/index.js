// 截流
export function throttle(func, wait) {
  let time = 0

  return function (...args) {
    let newDate = +new Date()
    if (newDate - time > wait) {
      time = newDate
      func.apply(this, args)
    }
  }
}

//防抖
export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
export function getOrgInfo() {
  let orgInfo = sessionStorage.getItem('_JINDAL_ORGINFO')
  if (orgInfo) {
    return JSON.parse(orgInfo)
  }
  console.warn('未能从sessionStorage中获取当前科室、机构信息')
  orgInfo = {
    orgId: '57397322256476163',
    orgName: '骨科',
    pinyin: 'gk',
    wubi: 'mt',
    orgNo: '6114',
    subWardList: [
      {
        orgId: '84860900108451843',
        orgName: '骨科病区',
        orgNo: null,
        pinyin: null,
        wubi: null,
      },
      {
        orgId: '84860940910641153',
        orgName: '呼吸病区',
        orgNo: null,
        pinyin: null,
        wubi: null,
      },
      {
        orgId: '141735982307962880',
        orgName: '六楼东病区（骨科）',
        orgNo: null,
        pinyin: null,
        wubi: null,
      },
    ],
    type: 'jindal',
    curWardId: '84860900108451843',
  }
  sessionStorage.setItem('_JINDAL_ORGINFO', JSON.stringify(orgInfo))
  return orgInfo
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
        wubi: 'uyat',
      },
      {
        valueId: '256508',
        appRoleName: '住院医生',
        pinyin: 'zyys',
        wubi: 'wbat',
      },
      {
        valueId: '956504',
        appRoleName: '病区护士长',
        pinyin: 'bqhsc',
        wubi: 'uarft',
      },
      {
        valueId: '256501',
        appRoleName: '超级管理员',
        pinyin: 'cjgly',
        wubi: 'fxtgk',
      },
      {
        valueId: '256501',
        appRoleName: '超级管理员',
        pinyin: 'cjgly',
        wubi: 'fxtgk',
      },
      {
        valueId: '256510',
        appRoleName: '病区护士',
        pinyin: 'bqhs',
        wubi: 'uarf',
      },
      {
        valueId: '959651',
        appRoleName: '病案系统管理员',
        pinyin: 'baxtgly',
        wubi: 'uptxtgk',
      },
      {
        valueId: '399296993',
        appRoleName: '业务科室主任',
        pinyin: 'ywkszr',
        wubi: 'ottpyw',
      },
      {
        valueId: '399296994',
        appRoleName: '医务科主任',
        pinyin: 'ywkzr',
        wubi: 'attyw',
      },
      {
        valueId: '399303605',
        appRoleName: '系统管理员',
        pinyin: 'xtgly',
        wubi: 'txtgk',
      },
      {
        valueId: '256502',
        appRoleName: '挂号操作员',
        pinyin: 'ghczy',
        wubi: 'rkrwk',
      },
      {
        valueId: '256503',
        appRoleName: '收费操作员',
        pinyin: 'sfczy',
        wubi: 'nxrwk',
      },
      {
        valueId: '256504',
        appRoleName: '药库操作员',
        pinyin: 'ykczy',
        wubi: 'ayrwk',
      },
      {
        valueId: '256505',
        appRoleName: '药房操作员',
        pinyin: 'yfczy',
        wubi: 'ayrwk',
      },
      {
        valueId: '256506',
        appRoleName: '医技操作员',
        pinyin: 'yjczy',
        wubi: 'arrwk',
      },
      {
        valueId: '256509',
        appRoleName: '门诊护士',
        pinyin: 'mzhs',
        wubi: 'uyrf',
      },
      {
        valueId: '862134',
        appRoleName: '主数据管理员',
        pinyin: 'zsjgly',
        wubi: 'yortgk',
      },
      {
        valueId: '862135',
        appRoleName: '数据质量管理员',
        pinyin: 'sjzlgly',
        wubi: 'orrjtgk',
      },
      {
        valueId: '862136',
        appRoleName: '数据安全管理员',
        pinyin: 'sjaqgly',
        wubi: 'orpwtgk',
      },
      {
        valueId: '956505',
        appRoleName: '护理部主任',
        pinyin: 'hlbzr',
        wubi: 'rguyw',
      },
      {
        valueId: '959649',
        appRoleName: '病案首页质控员',
        pinyin: 'basyzky',
        wubi: 'upudrrk',
      },
      {
        valueId: '959650',
        appRoleName: '病案质控分析员',
        pinyin: 'bazkfxy',
        wubi: 'uprrwsk',
      },
      {
        valueId: '977563',
        appRoleName: '病案首页编码员',
        pinyin: 'basybmy',
        wubi: 'upudxdk',
      },
      {
        valueId: '977564',
        appRoleName: '病案首页录入员',
        pinyin: 'basylry',
        wubi: 'upudvtk',
      },
      {
        valueId: '977565',
        appRoleName: '病案统计员',
        pinyin: 'batjy',
        wubi: 'upxyk',
      },
      {
        valueId: '977566',
        appRoleName: '病案上报员',
        pinyin: 'basby',
        wubi: 'uphrk',
      },
      {
        valueId: '399207074',
        appRoleName: '门办管理员',
        pinyin: 'mbgly',
        wubi: 'ultgk',
      },
      {
        valueId: '399297001',
        appRoleName: '门诊发药操作员',
        pinyin: 'mzfyczy',
        wubi: 'uynarwk',
      },
      {
        valueId: '399297002',
        appRoleName: '门诊配药操作员',
        pinyin: 'mzpyczy',
        wubi: 'uysarwk',
      },
      {
        valueId: '399297003',
        appRoleName: '门诊审方操作员',
        pinyin: 'mzsfczy',
        wubi: 'uypyrwk',
      },
      {
        valueId: '399299414',
        appRoleName: '科室护士长',
        pinyin: 'kshsc',
        wubi: 'tprft',
      },
      {
        valueId: '399303606',
        appRoleName: '审计员',
        pinyin: 'sjy',
        wubi: 'pyk',
      },
      {
        valueId: '399299413',
        appRoleName: '实习护士',
        pinyin: 'sxhs',
        wubi: 'pnrf',
      },
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
    employmentTypeDesc: null,
  }
}
