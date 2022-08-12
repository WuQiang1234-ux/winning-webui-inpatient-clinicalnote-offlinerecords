import _ from 'lodash'
import dayjs from 'dayjs'

export function modifyClinicalnoteOptions(_options, newOptions) {
  const options = _.merge({}, _options, newOptions)
  if (options.serial) {
    const { content } = options
    if (content) {
      const { emrSetId, list } = content
      if (list && list.length) {
        let index = list.findIndex(item => {
          item.emrSetId === emrSetId
        })
        delete content.list
        list.splice(index, 1, _.merge(list[index], content))
      }
    }
  }
  return options
}

export function checkTimeIntervalBool(
  value,
  progressNoteConfig,
  admittedToWardAt
) {
  value = value instanceof Date ? value : new Date(value)
  //创建时间  代表当日 零点Date progressNoteConfig.fullTime
  let cd = new Date(dayjs().format('YYYY-MM-DD') + ' 00:00:00') //this.progressNoteConfig.createDate
  let ryTime =
    new Date(
      dayjs(admittedToWardAt).format('YYYY-MM-DD') + ' 00:00:00'
    ).getTime() - 1000
  //let onTime = cd.getTime();
  //N ==> number
  let nn = progressNoteConfig.numN
  //容错
  nn = nn ? nn : 0
  //毫秒
  let minTime = cd.setDate(cd.getDate() - nn) - 24 * 60 * 60 * 1000
  //M ==> number
  let nm = progressNoteConfig.numM
  //容错
  nm = nm ? nm : 0
  //毫秒
  let xm = Number(nn) + Number(nm)
  let maxTime = cd.setDate(cd.getDate() + xm) + (24 * 60 * 60 * 1000 - 1000)
  //选择的时间 毫秒
  let nowTime = value.getTime()
  // min < now < max
  if (ryTime > nowTime) {
    return true
  } else {
    if (minTime < nowTime && nowTime < maxTime) {
      return false
    } else {
      return true
      // if(nn===0 || nm===0){
      //   return '请设置病程记录时间范围且要大于零'
      // }else if (minTime > nowTime) {
      //   return '往后不能超过当前时间' + nn + '天'
      // } else {
      //   return '往前不能超过当前时间' + nm + '天'
      // }
    }
  }
}

export const expertiseConceptId = {
  archiater: {
    code: '399470998',
    label: '主任医师'
  },
  associateChiefPhysician: {
    code: '399470999',
    label: '副主任医师'
  },
  visitingStaff: {
    code: '399471000',
    label: '主治医师'
  },
  physician: {
    code: '399471001',
    label: '医师'
  },
  feldsher: {
    code: '399471002',
    label: '医士'
  }
}

//是否要选择医嘱的监控类型
export const surgeryOrNot = function (inpMrtMonitorId) {
  let currentTypes = [
    '125044678493294650',
    '125044678493294640',
    '125044678493294648',
    '125044678493294608',
    '125044678493294646',
    '125044678493294682',
    '125044678493294686',
    '201111183149915903'
  ]
  return currentTypes.includes(inpMrtMonitorId)
}
