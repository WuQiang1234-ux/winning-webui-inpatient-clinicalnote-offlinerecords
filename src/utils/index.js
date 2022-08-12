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
