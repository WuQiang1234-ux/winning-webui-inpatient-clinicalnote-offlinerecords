//应用日历类
import calendarClass from '../../utils/calendar'

//体表面积
const BSA = {
  label: '体表面积',
  name: 'basForm',
  form: {
    height: '',
    weight: '',
    bsa: '',
    radioValue: 1
  },
  rules: {
    height: [
      {
        required: true,
        message: '身高不能为空',
        trigger: 'blur'
      }
    ],
    weight: [
      {
        required: true,
        message: '体重不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: ' ',
      prop: 'radioValue',
      control: 'radio',
      options: [
        {
          label: 1,
          text: '男'
        },
        {
          label: 2,
          text: '女'
        },
        {
          label: 0,
          text: '小孩'
        },
        {
          label: 9,
          text: '通用'
        }
      ]
    },
    {
      label: '身高：',
      prop: 'height',
      control: 'input',
      placeholder: '请输入身高',
      unit: 'cm'
    },
    {
      label: '体重：',
      prop: 'weight',
      control: 'input',
      placeholder: '请输入体重',
      unit: 'Kg'
    },
    {
      label: '体表：',
      prop: 'bsa',
      control: 'input',
      disabled: true,
      unit: 'm²'
    }
  ],
  calculate(form) {
    let bsa
    switch (form.radioValue) {
      case 1:
        bsa =
          0.0057 * parseFloat(form.height) +
          0.0121 * parseFloat(form.weight) +
          0.0882
        break
      case 2:
        bsa =
          0.0073 * parseFloat(form.height) +
          0.0127 * parseFloat(form.weight) -
          0.2106
        break
      case 0:
        bsa =
          0.0061 * parseFloat(form.height) +
          0.0123 * parseFloat(form.weight) -
          0.1529
        break
      case 9:
        bsa =
          0.0061 * parseFloat(form.height) +
          0.0124 * parseFloat(form.weight) -
          0.0099
        break
    }
    form.bsa = bsa.toFixed(4)
  },
  returned(form) {
    return '体表面积：' + form.bsa + 'm²'
  }
}

//血浆渗透压
const POP = {
  label: '血浆渗透压',
  name: 'popForm',
  form: {
    bloodNa: '',
    bloodKa: '',
    bloodSugar: '',
    urea: '',
    pop: '',
    effectivePop: ''
  },
  rules: {
    bloodNa: [
      {
        required: true,
        message: '血钠不能为空',
        trigger: 'blur'
      }
    ],
    bloodKa: [
      {
        required: true,
        message: '血钾不能为空',
        trigger: 'blur'
      }
    ],
    bloodSugar: [
      {
        required: true,
        message: '血糖不能为空',
        trigger: 'blur'
      }
    ],
    urea: [
      {
        required: true,
        message: '尿素不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '血钠：',
      prop: 'bloodNa',
      control: 'input',
      placeholder: '请输入血钠',
      unit: 'mmol/L'
    },
    {
      label: '血钾：',
      prop: 'bloodKa',
      control: 'input',
      placeholder: '请输入血钾',
      unit: 'mmol/L'
    },
    {
      label: '血糖：',
      prop: 'bloodSugar',
      control: 'input',
      placeholder: '请输入血糖',
      unit: 'mmol/L'
    },
    {
      label: '尿素：',
      prop: 'urea',
      control: 'input',
      placeholder: '请输入尿素',
      unit: 'mmol/L'
    },
    {
      label: '血浆渗透压：',
      prop: 'pop',
      control: 'input',
      disabled: true,
      unit: 'mmol/L'
    },
    {
      label: '有效血浆渗透压：',
      prop: 'effectivePop',
      control: 'input',
      disabled: true,
      unit: 'mmol/L'
    }
  ],
  calculate(form) {
    let value =
      2 * (parseFloat(form.bloodNa) + parseFloat(form.bloodKa)) +
      parseFloat(form.bloodSugar) +
      parseFloat(form.urea)
    form.pop = value
    form.effectivePop = value - parseFloat(form.urea)
  },
  returned(form) {
    return (
      '血浆渗透压：' +
      form.pop +
      'mmol/L 有效血浆渗透压：' +
      form.effectivePop +
      'mmol/L'
    )
  }
}

//腰臀比
const WHR = {
  label: '腰臀比',
  name: 'whrForm',
  form: {
    Waistline: '',
    hip: '',
    whr: ''
  },
  rules: {
    Waistline: [
      {
        required: true,
        message: '腰围不能为空',
        trigger: 'blur'
      }
    ],
    hip: [
      {
        required: true,
        message: '臀围不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '腰围：',
      prop: 'Waistline',
      control: 'input',
      placeholder: '请输入腰围',
      unit: 'cm'
    },
    {
      label: '臀围：',
      prop: 'hip',
      control: 'input',
      placeholder: '请输入臀围',
      unit: 'cm'
    },
    {
      label: '腰臀比：',
      prop: 'whr',
      control: 'input',
      disabled: true
    }
  ],
  calculate(form) {
    let value = parseFloat(form.Waistline) / parseFloat(form.hip)
    form.whr = value
  },
  returned(form) {
    return '腰臀比：' + form.whr
  }
}

//血小板CCI
const CCI = {
  label: '血小板CCI',
  name: 'cciForm',
  form: {
    height: '',
    weight: '',
    gender: 1,
    beforePlateletTransfusion: '',
    afterPlateletTransfusion: '',
    plateletCount: '',
    surface: '',
    difference: '',
    CCIValue: ''
  },
  rules: {
    height: [
      {
        required: true,
        message: '身高不能为空',
        trigger: 'blur'
      }
    ],
    weight: [
      {
        required: true,
        message: '体重不能为空',
        trigger: 'blur'
      }
    ],
    beforePlateletTransfusion: [
      {
        required: true,
        message: '血小板输入前不能为空',
        trigger: 'blur'
      }
    ],
    afterPlateletTransfusion: [
      {
        required: true,
        message: '血小板输入后不能为空',
        trigger: 'blur'
      }
    ],
    plateletCount: [
      {
        required: true,
        message: '采血小板数不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '身高：',
      prop: 'height',
      control: 'input',
      placeholder: '请输入身高',
      unit: 'cm'
    },
    {
      label: '体重：',
      prop: 'weight',
      control: 'input',
      placeholder: '请输入体重',
      unit: 'Kg'
    },
    {
      label: '性别：',
      prop: 'gender',
      control: 'radio',
      options: [
        {
          text: '男',
          label: 1
        },
        {
          text: '女',
          label: 2
        }
      ]
    },
    {
      label: '血小板输入前：',
      prop: 'beforePlateletTransfusion',
      control: 'input',
      placeholder: '请输入血小板前',
      unit: '10^9/L'
    },
    {
      label: '血小板输入后：',
      prop: 'afterPlateletTransfusion',
      control: 'input',
      placeholder: '请输入血小板后',
      unit: '10^9/L'
    },
    {
      label: '采血小板数：',
      prop: 'plateletCount',
      control: 'input',
      placeholder: '采血小板数',
      unit: '单位'
    },
    {
      label: '体表：',
      prop: 'surface',
      control: 'input',
      disabled: true,
      unit: '㎡'
    },
    {
      label: '差值：',
      prop: 'difference',
      control: 'input',
      disabled: true,
      unit: '10^9/L'
    },
    {
      label: 'CCI值：',
      prop: 'CCIValue',
      control: 'input',
      disabled: true
    }
  ],
  calculate(form) {
    //体表
    let surface = (function (gender, weight, height) {
      let value
      switch (gender) {
        case 1:
          value = height * 0.0057 + weight * 0.0121 + 0.0882
          break
        case 2:
          value = height * 0.0073 + weight * 0.0127 - 0.2106
          break
      }
      return value
    })(form.gender, parseFloat(form.weight), parseFloat(form.height))
    let difference =
      parseFloat(form.afterPlateletTransfusion) -
      parseFloat(form.beforePlateletTransfusion)
    let CCIValue =
      (difference * surface) / (parseFloat(form.plateletCount) * 2.5)
    form.surface = surface.toFixed(4)
    form.difference = difference.toFixed(4)
    form.CCIValue = CCIValue.toFixed(4)
  },
  returned(form) {
    return (
      '体表：' +
      form.surface +
      '㎡ 差值：' +
      form.difference +
      '10^9/L CCI值：' +
      form.CCIValue
    )
  }
}

//卡铂值
const CORBOPLATION = {
  label: '卡铂值',
  name: 'carboplatinForm',
  form: {
    gender: 1,
    age: '',
    weight: '',
    cre: '',
    auc: '',
    ccr: '',
    carboplatin: ''
  },
  rules: {
    age: [
      {
        required: true,
        message: '年龄不能为空',
        trigger: 'blur'
      }
    ],
    weight: [
      {
        required: true,
        message: '体重不能为空',
        trigger: 'blur'
      }
    ],
    cre: [
      {
        required: true,
        message: '肌酐不能为空',
        trigger: 'blur'
      }
    ],
    auc: [
      {
        required: true,
        message: 'AUC不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '年龄：',
      prop: 'age',
      control: 'input',
      placeholder: '请输入年龄',
      unit: '岁',
      children: {
        model: 'gender',
        options: [
          {
            text: '男',
            label: 1
          },
          {
            text: '女',
            label: 2
          }
        ]
      }
    },
    {
      label: '体重：',
      prop: 'weight',
      control: 'input',
      placeholder: '请输入体重',
      unit: 'Kg'
    },
    {
      label: '肌酐：',
      prop: 'cre',
      control: 'input',
      placeholder: '请输入肌酐',
      unit: 'μ Mol/L'
    },
    {
      label: 'Ccr：',
      prop: 'ccr',
      control: 'input',
      disabled: true,
      unit: 'Ml/Min'
    },
    {
      label: 'AUC：',
      prop: 'auc',
      control: 'input',
      placeholder: '请输入AUC',
      unit: 'Mg/Ml.Min'
    },
    {
      label: '卡铂值：',
      prop: 'carboplatin',
      control: 'input',
      disabled: true,
      unit: 'Mol/L'
    }
  ],
  calculate(form) {
    let result =
      ((140 - Number(form.age)) * parseFloat(form.weight)) /
      (0.818 * parseFloat(form.cre))
    if (form.gender === 2) {
      result = result * 0.85
    }
    form.ccr = result.toFixed(4)
    form.carboplatin = (parseFloat(form.auc) * (result + 25)).toFixed(4)
  },
  returned(form) {
    return (
      'Ccr：' + form.ccr + 'Ml/Min 卡铂值：' + this.form.carboplatin + 'Mol/L'
    )
  }
}

//孕周计算
const GAC = {
  label: '孕周计算',
  name: 'gestationalWeekForm',
  form: {
    lastMenstruation: new Date(),
    pregnancyDays: '',
    pregnancyCycles: '',
    dueDate: '',
    dueDateLeft: ''
  },
  rules: {
    lastMenstruation: [
      {
        required: true,
        message: '末次月经不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '末次月经：',
      prop: 'lastMenstruation',
      control: 'picker',
      placeholder: '选择日期'
    },
    {
      label: '怀孕天数：',
      prop: 'pregnancyDays',
      control: 'input',
      disabled: true,
      unit: '天'
    },
    {
      label: '怀孕周期：',
      prop: 'pregnancyCycles',
      control: 'input',
      disabled: true
    },
    {
      label: '预产期：',
      prop: 'dueDate',
      control: 'input',
      disabled: true
    },
    {
      label: '距离预产期还剩：',
      prop: 'dueDateLeft',
      control: 'input',
      disabled: true
    }
  ],
  calculate(form) {
    let tb = parseInt(
      (new Date().getTime() - form.lastMenstruation) / (1000 * 60 * 60 * 24)
    )
    form.pregnancyDays = tb
    function calcZts(tb) {
      let result
      if (tb < 7) {
        result = tb + '天'
      } else if (tb % 7 === 0) {
        result = tb / 7 + '周'
      } else {
        result = parseInt(tb / 7) + '周' + (tb % 7) + '天'
      }
      return result
    }
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    function formatWeek(week) {
      return parseInt(week.toString()) || 7
    }
    function formatTime(date, joinSymbol = '/') {
      const year = date.getFullYear()
      const month = formatNumber(date.getMonth() + 1)
      const day = formatNumber(date.getDate())
      const week = formatWeek(date.getDay())
      const hour = formatNumber(date.getHours())
      const minute = formatNumber(date.getMinutes())
      const second = formatNumber(date.getSeconds())
      return {
        result:
          [year, month, day].map(formatNumber).join(joinSymbol) +
          ' ' +
          [hour, minute, second].map(formatNumber).join(':'),
        date: [year, month, day].map(formatNumber).join(joinSymbol),
        chinaDate: `${year}年${month}月${day}日`,
        clock: [hour, minute, second].map(formatNumber).join(':'),
        year,
        month,
        week,
        day,
        hour,
        minute,
        second
      }
    }
    form.pregnancyCycles = calcZts(tb)
    let d = new Date(form.lastMenstruation)
    d.setDate(d.getDate() + 280)
    form.dueDate = formatTime(d, '-').date
    form.dueDateLeft = calcZts(
      parseInt((d - new Date().getTime()) / (1000 * 60 * 60 * 24) + 1)
    )
  },
  returned(form) {
    return (
      '怀孕天数：' +
      form.pregnancyDays +
      ' 怀孕周期：' +
      form.pregnancyCycles +
      ' 预产期：' +
      form.dueDate +
      ' 距离预产期还剩：' +
      form.dueDateLeft
    )
  }
}

//体脂率
const BFR = {
  label: '体脂率',
  name: 'bfrForm',
  form: {
    bmi: '',
    age: '',
    gender: 1,
    fatRate: ''
  },
  rules: {
    bmi: [
      {
        required: true,
        message: 'BMI不能为空',
        trigger: 'blur'
      }
    ],
    age: [
      {
        required: true,
        message: '年龄不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: 'BMI：',
      prop: 'bmi',
      control: 'input',
      placeholder: '请输入BMI',
      unit: 'Kg/㎡'
    },
    {
      label: '年 龄：',
      prop: 'age',
      control: 'input',
      placeholder: '请输入年龄',
      unit: '岁'
    },
    {
      label: '性 别：',
      prop: 'gender',
      control: 'radio',
      options: [
        {
          text: '男',
          label: 1
        },
        {
          text: '女',
          label: 2
        }
      ]
    },
    {
      label: '体脂率：',
      prop: 'fatRate',
      control: 'input',
      disabled: true
    }
  ],
  calculate(form) {
    let value =
      1.2 * parseFloat(form.bmi) +
      0.23 * Number(form.age) -
      5.4 -
      10.8 * (form.gender === 1 ? 1 : 0)
    form.fatRate = value.toFixed(2)
  },
  returned(form) {
    return '体脂率：' + form.fatRate
  }
}

//农历节气
const LUNAR = {
  label: '农历节气',
  name: 'lunarSolarTermForm',
  form: {
    selectDate: new Date(),
    chineseZodiac: '',
    lunarCalendar: '',
    terms: '',
    beforeTerms: '',
    afterTerms: ''
  },
  rules: {
    selectDate: [
      {
        required: true,
        message: '日期不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '日 期：',
      prop: 'selectDate',
      control: 'picker',
      placeholder: '请输入日期'
    },
    {
      label: '生 肖：',
      prop: 'chineseZodiac',
      control: 'input',
      disabled: true
    },
    {
      label: '农 历：',
      prop: 'lunarCalendar',
      control: 'input',
      disabled: true
    },
    {
      label: '节 气：',
      prop: 'terms',
      control: 'input',
      disabled: true
    },
    {
      label: '前一个节气：',
      prop: 'beforeTerms',
      control: 'input',
      disabled: true
    },
    {
      label: '后一个节气：',
      prop: 'afterTerms',
      control: 'input',
      disabled: true
    }
  ],
  calculate(form) {
    let D = form.selectDate
    //获取设置
    let yy = D.getFullYear() //年
    let mm = D.getMonth() + 1 //月
    let dd = D.getDate() // 日
    //实例化类
    let calendar = new calendarClass()
    let cd_data = calendar.solar2lunar(yy, mm, dd)
    //生肖
    form.chineseZodiac = cd_data.Animal
    //辛丑年 牛 癸巳月 戊辰日
    // let lunar_str = calendar.gzYear + "年" + calendar.gzMonth + "月" + calendar.gzDay + '日'
    // lunar_str +="("+calendar.IMonthCn + calendar.IDayCn +")"
    let lunar_y = String(cd_data.lYear).split('') // 阴历年
    let lunar_m = String(cd_data.lMonth).split('') // 阴历月
    let lunar_d = String(cd_data.lDay).split('') // 阴历日
    // 农历二零二一年五月二十一
    form.lunarCalendar = calendar.setLunar(lunar_y, lunar_m, lunar_d)
    //let value = 1.2 * parseFloat(form.bmi) + 0.23 * Number(form.age) - 5.4 - 10.8 * (form.gender === 1 ? 1 : 0)
    //form.fatRate = value.toFixed(2)
    //节气
    let terms = calendar.setTerm(D, 1, cd_data, 0)
    form.terms = terms.Term + calendar.setLunarDay(terms.addIndex)
    //当前减一天
    terms.Term = null
    let beforeTerm = calendar.setTerm(
      new Date(terms.cYear + '-' + terms.cMonth + '-' + terms.cDay),
      1,
      terms,
      0
    )
    //cYear cMonth cDay 立夏[2021-5-12]
    form.beforeTerms =
      beforeTerm.Term +
      '[' +
      beforeTerm.cYear +
      '-' +
      beforeTerm.cMonth +
      '-' +
      beforeTerm.cDay +
      ']'
    //cYear cMonth cDay 小满[2021-5-12]
    let afterTerm = calendar.setTerm(D, 2, cd_data, 0)
    form.afterTerms =
      afterTerm.Term +
      '[' +
      afterTerm.cYear +
      '-' +
      afterTerm.cMonth +
      '-' +
      afterTerm.cDay +
      ']'
  },
  returned(form) {
    return '农历节气：' + (form.terms ? 'isOk' : '') + form.terms
  }
  //is:FormulaLunarSolarTerm,
}

//体重指数
const BMI = {
  label: '体重指数',
  name: 'bmiForm',
  form: {
    height: '',
    weight: '',
    bmi: ''
  },
  rules: {
    height: [
      {
        required: true,
        message: '身高不能为空',
        trigger: 'blur'
      }
    ],
    weight: [
      {
        required: true,
        message: '体重不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '身高：',
      prop: 'height',
      control: 'input',
      placeholder: '请输入身高',
      unit: 'cm'
    },
    {
      label: '体重：',
      prop: 'weight',
      control: 'input',
      placeholder: '请输入体重',
      unit: 'Kg'
    },
    {
      label: 'BMI：',
      prop: 'bmi',
      control: 'input',
      disabled: true,
      unit: 'Kg/㎡'
    }
  ],
  calculate(form) {
    let bmi =
      (parseFloat(form.weight) * 10000) /
      (parseFloat(form.height) * parseFloat(form.height))
    form.bmi = bmi.toFixed(4)
  },
  returned(form) {
    return '体重指数：' + form.bmi + 'Kg/㎡'
  }
}

//计算器
const CALCULATOR = {
  label: '计算器',
  name: 'counterForm',
  form: {
    calculator: ''
  },
  rules: {},
  formList: [
    {
      label: ' ',
      prop: 'calculator',
      control: 'calculator'
    }
  ],
  calculate(form, t) {
    t.$refs.calculatorRef[0].handlePanelData({ value: '计算', type: 4 })
  },
  returned(form) {
    return '计算值：' + form.calculator
  }
}

//眼压换算表
const IOP = {
  label: '眼压换算表',
  name: 'iopForm',
  form: {
    iopItem: ''
  },
  rules: {},
  formList: [
    {
      label: '',
      prop: 'iopItem',
      control: 'iop'
    }
  ],
  calculate(form) {
    console.log(form)
  },
  returned(form) {
    return '眼压值：' + form.iopItem + 'kpa'
  }
}

//简化MDRD
const MDRD = {
  label: '简化MDRD',
  name: 'mdrdForm',
  form: {
    gender: 1,
    age: '',
    scr: '',
    gfr: ''
  },
  rules: {
    age: [
      {
        required: true,
        message: '年龄不能为空',
        trigger: 'blur'
      }
    ],
    scr: [
      {
        required: true,
        message: '肌酐不能为空',
        trigger: 'blur'
      }
    ]
  },
  formList: [
    {
      label: '性 别：',
      prop: 'gender',
      control: 'radio',
      options: [
        {
          text: '男',
          label: 1
        },
        {
          text: '女',
          label: 2
        }
      ]
    },
    {
      label: '年 龄：',
      prop: 'age',
      control: 'input',
      placeholder: '请输入年龄',
      unit: '岁'
    },
    {
      label: '血清肌酐Scr：',
      prop: 'scr',
      control: 'input',
      placeholder: '请输入血清肌酐Scr',
      unit: 'μ Mol/L'
    },
    {
      label: '肾小球滤过率GFR：',
      prop: 'gfr',
      control: 'input',
      disabled: true,
      unit: 'Ml/min1.73㎡'
    }
  ],
  calculate(form) {
    let value =
      186 *
      Math.pow(parseFloat(form.scr) / 88.4, -1.154) *
      Math.pow(Number(form.age), 0.203) *
      (form.gender === 1 ? 1 : 0.74)
    form.gfr = value.toFixed(4)
  },
  returned(form) {
    return 'GFR: ' + form.gfr
  }
}

//微糖公式
const SUGAR = {
  label: '微糖公式',
  name: 'msugerForm',
  radioList: ['日胰岛素用量（U）', '胰岛素抵抗指数', '高血糖的钠校正'],
  radioValue: '日胰岛素用量（U）',
  form: {
    '0': {
      fbg: '',
      weight: '',
      dailyDosage: ''
    },
    '1': {
      fbg: '',
      fins: '',
      homair: ''
    },
    '2': {
      na: '',
      glu: '',
      correctionOfSodium: ''
    }
  },
  rules: {
    '0': {
      fbg: [
        {
          required: true,
          message: '空腹血糖不能为空',
          trigger: 'blur'
        }
      ],
      weight: [
        {
          required: true,
          message: '体重不能为空',
          trigger: 'blur'
        }
      ]
    },
    '1': {
      fbg: [
        {
          required: true,
          message: '空腹血糖不能为空',
          trigger: 'blur'
        }
      ],
      fins: [
        {
          required: true,
          message: '空腹胰岛素不能为空',
          trigger: 'blur'
        }
      ]
    },
    '2': {
      na: [
        {
          required: true,
          message: '血清钠不能为空',
          trigger: 'blur'
        }
      ],
      glu: [
        {
          required: true,
          message: '血清葡萄糖不能为空',
          trigger: 'blur'
        }
      ]
    }
  },
  formList: [
    [
      {
        label: '空腹血糖：',
        prop: 'fbg',
        control: 'input',
        placeholder: '请输入空腹血糖',
        unit: 'mmol/L'
      },
      {
        label: '体 重：',
        prop: 'weight',
        control: 'input',
        placeholder: '请输入体重',
        unit: 'Kg'
      },
      {
        label: '日用量：',
        prop: 'dailyDosage',
        control: 'input',
        disabled: true,
        unit: 'U'
      }
    ],
    [
      {
        label: '空腹血糖：',
        prop: 'fbg',
        control: 'input',
        placeholder: '请输入空腹血糖',
        unit: 'mmol/L'
      },
      {
        label: '空腹胰岛素：',
        prop: 'fins',
        control: 'input',
        placeholder: '请输入空腹胰岛素'
      },
      {
        label: '抵抗指数：',
        prop: 'homair',
        control: 'input',
        disabled: true
      }
    ],
    [
      {
        label: '血清钠：',
        prop: 'na',
        control: 'input',
        placeholder: '请输入血清钠'
      },
      {
        label: '血清葡萄糖：',
        prop: 'glu',
        control: 'input',
        placeholder: '请输入血清葡萄糖'
      },
      {
        label: '校正钠：',
        prop: 'correctionOfSodium',
        control: 'input',
        disabled: true
      }
    ]
  ],
  calculate(form, t) {
    switch (t.radioModel) {
      case '日胰岛素用量（U）':
        form.dailyDosage = (
          ((parseFloat(form.fbg) - 5.6) * parseFloat(form.weight) * 0.6) /
          11.1
        ).toFixed(4)
        break
      case '胰岛素抵抗指数':
        form.homair = (
          (parseFloat(form.fbg) * parseFloat(form.fins)) /
          22.5
        ).toFixed(4)
        break
      case '高血糖的钠校正':
        form.correctionOfSodium = (
          parseFloat(form.na) +
          0.016 * (parseFloat(form.glu) - 100)
        ).toFixed(4)
        break
    }
  },
  returned(form, t) {
    let value
    switch (t.radioModel) {
      case '日胰岛素用量（U）':
        value = '日胰岛素用量（U）：' + form.dailyDosage + ' U'
        break
      case '胰岛素抵抗指数':
        value = '胰岛素抵抗指数：' + form.homair
        break
      case '高血糖的钠校正':
        value = '高血糖的钠校正：' + form.correctionOfSodium
        break
    }
    return value
  }
}

//医学公式集合
export default [
  BSA,
  POP,
  WHR,
  CCI,
  CORBOPLATION,
  GAC,
  BFR,
  LUNAR,
  BMI,
  CALCULATOR,
  IOP,
  MDRD,
  SUGAR
]
