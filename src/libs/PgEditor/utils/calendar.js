export default class calendar {
  constructor() {
    this.n2s = {
      '0': '零',
      '1': '一',
      '2': '二',
      '3': '三',
      '4': '四',
      '5': '五',
      '6': '六',
      '7': '七',
      '8': '八',
      '9': '九',
      s: '十'
    }
    this.lunarInfo = [
      0x04bd8,
      0x04ae0,
      0x0a570,
      0x054d5,
      0x0d260,
      0x0d950,
      0x16554,
      0x056a0,
      0x09ad0,
      0x055d2, //1900-1909
      0x04ae0,
      0x0a5b6,
      0x0a4d0,
      0x0d250,
      0x1d255,
      0x0b540,
      0x0d6a0,
      0x0ada2,
      0x095b0,
      0x14977, //1910-1919
      0x04970,
      0x0a4b0,
      0x0b4b5,
      0x06a50,
      0x06d40,
      0x1ab54,
      0x02b60,
      0x09570,
      0x052f2,
      0x04970, //1920-1929
      0x06566,
      0x0d4a0,
      0x0ea50,
      0x06e95,
      0x05ad0,
      0x02b60,
      0x186e3,
      0x092e0,
      0x1c8d7,
      0x0c950, //1930-1939
      0x0d4a0,
      0x1d8a6,
      0x0b550,
      0x056a0,
      0x1a5b4,
      0x025d0,
      0x092d0,
      0x0d2b2,
      0x0a950,
      0x0b557, //1940-1949
      0x06ca0,
      0x0b550,
      0x15355,
      0x04da0,
      0x0a5b0,
      0x14573,
      0x052b0,
      0x0a9a8,
      0x0e950,
      0x06aa0, //1950-1959
      0x0aea6,
      0x0ab50,
      0x04b60,
      0x0aae4,
      0x0a570,
      0x05260,
      0x0f263,
      0x0d950,
      0x05b57,
      0x056a0, //1960-1969
      0x096d0,
      0x04dd5,
      0x04ad0,
      0x0a4d0,
      0x0d4d4,
      0x0d250,
      0x0d558,
      0x0b540,
      0x0b6a0,
      0x195a6, //1970-1979
      0x095b0,
      0x049b0,
      0x0a974,
      0x0a4b0,
      0x0b27a,
      0x06a50,
      0x06d40,
      0x0af46,
      0x0ab60,
      0x09570, //1980-1989
      0x04af5,
      0x04970,
      0x064b0,
      0x074a3,
      0x0ea50,
      0x06b58,
      0x055c0,
      0x0ab60,
      0x096d5,
      0x092e0, //1990-1999
      0x0c960,
      0x0d954,
      0x0d4a0,
      0x0da50,
      0x07552,
      0x056a0,
      0x0abb7,
      0x025d0,
      0x092d0,
      0x0cab5, //2000-2009
      0x0a950,
      0x0b4a0,
      0x0baa4,
      0x0ad50,
      0x055d9,
      0x04ba0,
      0x0a5b0,
      0x15176,
      0x052b0,
      0x0a930, //2010-2019
      0x07954,
      0x06aa0,
      0x0ad50,
      0x05b52,
      0x04b60,
      0x0a6e6,
      0x0a4e0,
      0x0d260,
      0x0ea65,
      0x0d530, //2020-2029
      0x05aa0,
      0x076a3,
      0x096d0,
      0x04afb,
      0x04ad0,
      0x0a4d0,
      0x1d0b6,
      0x0d250,
      0x0d520,
      0x0dd45, //2030-2039
      0x0b5a0,
      0x056d0,
      0x055b2,
      0x049b0,
      0x0a577,
      0x0a4b0,
      0x0aa50,
      0x1b255,
      0x06d20,
      0x0ada0, //2040-2049
      /**Add By JJonline@JJonline.Cn**/
      0x14b63,
      0x09370,
      0x049f8,
      0x04970,
      0x064b0,
      0x168a6,
      0x0ea50,
      0x06b20,
      0x1a6c4,
      0x0aae0, //2050-2059
      0x0a2e0,
      0x0d2e3,
      0x0c960,
      0x0d557,
      0x0d4a0,
      0x0da50,
      0x05d55,
      0x056a0,
      0x0a6d0,
      0x055d4, //2060-2069
      0x052d0,
      0x0a9b8,
      0x0a950,
      0x0b4a0,
      0x0b6a6,
      0x0ad50,
      0x055a0,
      0x0aba4,
      0x0a5b0,
      0x052b0, //2070-2079
      0x0b273,
      0x06930,
      0x07337,
      0x06aa0,
      0x0ad50,
      0x14b55,
      0x04b60,
      0x0a570,
      0x054e4,
      0x0d160, //2080-2089
      0x0e968,
      0x0d520,
      0x0daa0,
      0x16aa6,
      0x056d0,
      0x04ae0,
      0x0a9d4,
      0x0a2d0,
      0x0d150,
      0x0f252, //2090-2099
      0x0d520
    ]

    this.solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    this.Gan = [
      '\u7532',
      '\u4e59',
      '\u4e19',
      '\u4e01',
      '\u620a',
      '\u5df1',
      '\u5e9a',
      '\u8f9b',
      '\u58ec',
      '\u7678'
    ]

    this.Zhi = [
      '\u5b50',
      '\u4e11',
      '\u5bc5',
      '\u536f',
      '\u8fb0',
      '\u5df3',
      '\u5348',
      '\u672a',
      '\u7533',
      '\u9149',
      '\u620c',
      '\u4ea5'
    ]

    this.Animals = [
      '\u9f20',
      '\u725b',
      '\u864e',
      '\u5154',
      '\u9f99',
      '\u86c7',
      '\u9a6c',
      '\u7f8a',
      '\u7334',
      '\u9e21',
      '\u72d7',
      '\u732a'
    ]

    this.solarTerm = [
      '\u5c0f\u5bd2',
      '\u5927\u5bd2',
      '\u7acb\u6625',
      '\u96e8\u6c34',
      '\u60ca\u86f0',
      '\u6625\u5206',
      '\u6e05\u660e',
      '\u8c37\u96e8',
      '\u7acb\u590f',
      '\u5c0f\u6ee1',
      '\u8292\u79cd',
      '\u590f\u81f3',
      '\u5c0f\u6691',
      '\u5927\u6691',
      '\u7acb\u79cb',
      '\u5904\u6691',
      '\u767d\u9732',
      '\u79cb\u5206',
      '\u5bd2\u9732',
      '\u971c\u964d',
      '\u7acb\u51ac',
      '\u5c0f\u96ea',
      '\u5927\u96ea',
      '\u51ac\u81f3'
    ]

    this.sTermInfo = [
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c3598082c95f8c965cc920f',
      '97bd0b06bdb0722c965ce1cfcc920f',
      'b027097bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c359801ec95f8c965cc920f',
      '97bd0b06bdb0722c965ce1cfcc920f',
      'b027097bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c359801ec95f8c965cc920f',
      '97bd0b06bdb0722c965ce1cfcc920f',
      'b027097bd097c36b0b6fc9274c91aa',
      '9778397bd19801ec9210c965cc920e',
      '97b6b97bd19801ec95f8c965cc920f',
      '97bd09801d98082c95f8e1cfcc920f',
      '97bd097bd097c36b0b6fc9210c8dc2',
      '9778397bd197c36c9210c9274c91aa',
      '97b6b97bd19801ec95f8c965cc920e',
      '97bd09801d98082c95f8e1cfcc920f',
      '97bd097bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36c9210c9274c91aa',
      '97b6b97bd19801ec95f8c965cc920e',
      '97bcf97c3598082c95f8e1cfcc920f',
      '97bd097bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36c9210c9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c3598082c95f8c965cc920f',
      '97bd097bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c3598082c95f8c965cc920f',
      '97bd097bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c359801ec95f8c965cc920f',
      '97bd097bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c359801ec95f8c965cc920f',
      '97bd097bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf97c359801ec95f8c965cc920f',
      '97bd097bd07f595b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9210c8dc2',
      '9778397bd19801ec9210c9274c920e',
      '97b6b97bd19801ec95f8c965cc920f',
      '97bd07f5307f595b0b0bc920fb0722',
      '7f0e397bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36c9210c9274c920e',
      '97b6b97bd19801ec95f8c965cc920f',
      '97bd07f5307f595b0b0bc920fb0722',
      '7f0e397bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36c9210c9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bd07f1487f595b0b0bc920fb0722',
      '7f0e397bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf7f1487f595b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf7f1487f595b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf7f1487f531b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c965cc920e',
      '97bcf7f1487f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b97bd19801ec9210c9274c920e',
      '97bcf7f0e47f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '9778397bd097c36b0b6fc9210c91aa',
      '97b6b97bd197c36c9210c9274c920e',
      '97bcf7f0e47f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '9778397bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36c9210c9274c920e',
      '97b6b7f0e47f531b0723b0b6fb0722',
      '7f0e37f5307f595b0b0bc920fb0722',
      '7f0e397bd097c36b0b6fc9210c8dc2',
      '9778397bd097c36b0b70c9274c91aa',
      '97b6b7f0e47f531b0723b0b6fb0721',
      '7f0e37f1487f595b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc9210c8dc2',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f595b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '9778397bd097c36b0b6fc9274c91aa',
      '97b6b7f0e47f531b0723b0787b0721',
      '7f0e27f0e47f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '9778397bd097c36b0b6fc9210c91aa',
      '97b6b7f0e47f149b0723b0787b0721',
      '7f0e27f0e47f531b0723b0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '9778397bd097c36b0b6fc9210c8dc2',
      '977837f0e37f149b0723b0787b0721',
      '7f07e7f0e47f531b0723b0b6fb0722',
      '7f0e37f5307f595b0b0bc920fb0722',
      '7f0e397bd097c35b0b6fc9210c8dc2',
      '977837f0e37f14998082b0787b0721',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e37f1487f595b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc9210c8dc2',
      '977837f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '977837f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd097c35b0b6fc920fb0722',
      '977837f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '977837f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '977837f0e37f14998082b0787b06bd',
      '7f07e7f0e47f149b0723b0787b0721',
      '7f0e27f0e47f531b0b0bb0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '977837f0e37f14998082b0723b06bd',
      '7f07e7f0e37f149b0723b0787b0721',
      '7f0e27f0e47f531b0723b0b6fb0722',
      '7f0e397bd07f595b0b0bc920fb0722',
      '977837f0e37f14898082b0723b02d5',
      '7ec967f0e37f14998082b0787b0721',
      '7f07e7f0e47f531b0723b0b6fb0722',
      '7f0e37f1487f595b0b0bb0b6fb0722',
      '7f0e37f0e37f14898082b0723b02d5',
      '7ec967f0e37f14998082b0787b0721',
      '7f07e7f0e47f531b0723b0b6fb0722',
      '7f0e37f1487f531b0b0bb0b6fb0722',
      '7f0e37f0e37f14898082b0723b02d5',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e37f1487f531b0b0bb0b6fb0722',
      '7f0e37f0e37f14898082b072297c35',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e37f0e37f14898082b072297c35',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e37f0e366aa89801eb072297c35',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f149b0723b0787b0721',
      '7f0e27f1487f531b0b0bb0b6fb0722',
      '7f0e37f0e366aa89801eb072297c35',
      '7ec967f0e37f14998082b0723b06bd',
      '7f07e7f0e47f149b0723b0787b0721',
      '7f0e27f0e47f531b0723b0b6fb0722',
      '7f0e37f0e366aa89801eb072297c35',
      '7ec967f0e37f14998082b0723b06bd',
      '7f07e7f0e37f14998083b0787b0721',
      '7f0e27f0e47f531b0723b0b6fb0722',
      '7f0e37f0e366aa89801eb072297c35',
      '7ec967f0e37f14898082b0723b02d5',
      '7f07e7f0e37f14998082b0787b0721',
      '7f07e7f0e47f531b0723b0b6fb0722',
      '7f0e36665b66aa89801e9808297c35',
      '665f67f0e37f14898082b0723b02d5',
      '7ec967f0e37f14998082b0787b0721',
      '7f07e7f0e47f531b0723b0b6fb0722',
      '7f0e36665b66a449801e9808297c35',
      '665f67f0e37f14898082b0723b02d5',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e36665b66a449801e9808297c35',
      '665f67f0e37f14898082b072297c35',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e26665b66a449801e9808297c35',
      '665f67f0e37f1489801eb072297c35',
      '7ec967f0e37f14998082b0787b06bd',
      '7f07e7f0e47f531b0723b0b6fb0721',
      '7f0e27f1487f531b0b0bb0b6fb0722'
    ]

    this.nStr1 = [
      '\u65e5',
      '\u4e00',
      '\u4e8c',
      '\u4e09',
      '\u56db',
      '\u4e94',
      '\u516d',
      '\u4e03',
      '\u516b',
      '\u4e5d',
      '\u5341'
    ]

    this.nStr2 = ['\u521d', '\u5341', '\u5eff', '\u5345']

    this.nStr3 = [
      '\u6b63',
      '\u4e8c',
      '\u4e09',
      '\u56db',
      '\u4e94',
      '\u516d',
      '\u4e03',
      '\u516b',
      '\u4e5d',
      '\u5341',
      '\u51ac',
      '\u814a'
    ]
  }

  lYearDays(y) {
    let i,
      sum = 348
    for (i = 0x8000; i > 0x8; i >>= 1) {
      sum += this.lunarInfo[y - 1900] & i ? 1 : 0
    }
    return sum + this.leapDays(y)
  }

  leapMonth(y) {
    //闰字编码 \u95f0
    return this.lunarInfo[y - 1900] & 0xf
  }

  leapDays(y) {
    if (this.leapMonth(y)) {
      return this.lunarInfo[y - 1900] & 0x10000 ? 30 : 29
    }
    return 0
  }

  monthDays(y, m) {
    if (m > 12 || m < 1) {
      return -1
    } //月份参数从1至12，参数错误返回-1
    return this.lunarInfo[y - 1900] & (0x10000 >> m) ? 30 : 29
  }

  solarDays(y, m) {
    if (m > 12 || m < 1) {
      return -1
    } //若参数错误 返回-1
    let ms = m - 1
    if (ms == 1) {
      //2月份的闰平规律测算后确认返回28或29
      return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0 ? 29 : 28
    } else {
      return this.solarMonth[ms]
    }
  }

  toGanZhiYear(lYear) {
    let ganKey = (lYear - 3) % 10
    let zhiKey = (lYear - 3) % 12
    if (ganKey == 0) ganKey = 10 //如果余数为0则为最后一个天干
    if (zhiKey == 0) zhiKey = 12 //如果余数为0则为最后一个地支
    return this.Gan[ganKey - 1] + this.Zhi[zhiKey - 1]
  }

  toAstro(cMonth, cDay) {
    let s =
      '\u9b54\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u9b54\u7faf'
    let arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22]
    return s.substr(cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0), 2) + '\u5ea7' //座
  }

  toGanZhi(offset) {
    return this.Gan[offset % 10] + this.Zhi[offset % 12]
  }

  getTerm(y, n) {
    if (y < 1900 || y > 2100) {
      return -1
    }
    if (n < 1 || n > 24) {
      return -1
    }
    let _table = this.sTermInfo[y - 1900]
    let _info = [
      parseInt('0x' + _table.substr(0, 5)).toString(),
      parseInt('0x' + _table.substr(5, 5)).toString(),
      parseInt('0x' + _table.substr(10, 5)).toString(),
      parseInt('0x' + _table.substr(15, 5)).toString(),
      parseInt('0x' + _table.substr(20, 5)).toString(),
      parseInt('0x' + _table.substr(25, 5)).toString()
    ]
    let _calday = [
      _info[0].substr(0, 1),
      _info[0].substr(1, 2),
      _info[0].substr(3, 1),
      _info[0].substr(4, 2),
      _info[1].substr(0, 1),
      _info[1].substr(1, 2),
      _info[1].substr(3, 1),
      _info[1].substr(4, 2),
      _info[2].substr(0, 1),
      _info[2].substr(1, 2),
      _info[2].substr(3, 1),
      _info[2].substr(4, 2),
      _info[3].substr(0, 1),
      _info[3].substr(1, 2),
      _info[3].substr(3, 1),
      _info[3].substr(4, 2),
      _info[4].substr(0, 1),
      _info[4].substr(1, 2),
      _info[4].substr(3, 1),
      _info[4].substr(4, 2),
      _info[5].substr(0, 1),
      _info[5].substr(1, 2),
      _info[5].substr(3, 1),
      _info[5].substr(4, 2)
    ]
    return parseInt(_calday[n - 1])
  }

  toChinaMonth(m) {
    // 月 => \u6708
    if (m > 12 || m < 1) {
      return -1
    } //若参数错误 返回-1
    let s = this.nStr3[m - 1]
    s += '\u6708' //加上月字
    return s
  }

  toChinaDay(d) {
    //日 => \u65e5
    let s
    switch (d) {
      case 10:
        s = '\u521d\u5341'
        break
      case 20:
        s = '\u4e8c\u5341'
        break
      case 30:
        s = '\u4e09\u5341'
        break
      default:
        s = this.nStr2[Math.floor(d / 10)]
        s += this.nStr1[d % 10]
    }
    return s
  }

  getAnimal(y) {
    return this.Animals[(y - 4) % 12]
  }

  solar2lunar(y, m, d) {
    //参数区间1900.1.31~2100.12.31
    if (y < 1900 || y > 2100) {
      return -1
    } //年份限定、上限
    if (y == 1900 && m == 1 && d < 31) {
      return -1
    } //下限
    let objDate
    if (!y) {
      //未传参 获得当天
      objDate = new Date()
    } else {
      objDate = new Date(y, parseInt(m) - 1, d)
    }
    let i,
      leap = 0,
      temp = 0
    //修正ymd参数
    y = objDate.getFullYear()
    m = objDate.getMonth() + 1
    d = objDate.getDate()
    let offset =
      (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) -
        Date.UTC(1900, 0, 31)) /
      86400000
    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = this.lYearDays(i)
      offset -= temp
    }
    if (offset < 0) {
      offset += temp
      i--
    }
    //是否今天
    let isTodayObj = new Date(),
      isToday = false
    if (
      isTodayObj.getFullYear() == y &&
      isTodayObj.getMonth() + 1 == m &&
      isTodayObj.getDate() == d
    ) {
      isToday = true
    }
    //星期几
    let nWeek = objDate.getDay(),
      cWeek = this.nStr1[nWeek]
    if (nWeek == 0) {
      nWeek = 7
    } //数字表示周几顺应天朝周一开始的惯例
    //农历年
    let year = i
    leap = this.leapMonth(i) //闰哪个月
    let isLeap = false
    //效验闰月
    for (i = 1; i < 13 && offset > 0; i++) {
      //闰月
      if (leap > 0 && i == leap + 1 && isLeap == false) {
        --i
        isLeap = true
        temp = this.leapDays(year) //计算农历闰月天数
      } else {
        temp = this.monthDays(year, i) //计算农历普通月天数
      }
      //解除闰月
      if (isLeap == true && i == leap + 1) {
        isLeap = false
      }
      offset -= temp
    }
    if (offset == 0 && leap > 0 && i == leap + 1)
      if (isLeap) {
        isLeap = false
      } else {
        isLeap = true
        --i
      }
    if (offset < 0) {
      offset += temp
      --i
    }
    //农历月
    let month = i
    //农历日
    let day = offset + 1
    //天干地支处理
    let sm = m - 1
    let gzY = this.toGanZhiYear(year)
    //月柱 1900年1月小寒以前为 丙子月(60进制12)
    let firstNode = this.getTerm(year, m * 2 - 1) //返回当月「节」为几日开始
    let secondNode = this.getTerm(year, m * 2) //返回当月「节」为几日开始
    //依据12节气修正干支月
    let gzM = this.toGanZhi((y - 1900) * 12 + m + 11)
    if (d >= firstNode) {
      gzM = this.toGanZhi((y - 1900) * 12 + m + 12)
    }
    //传入的日期的节气与否
    let isTerm = false
    let Term = null
    if (firstNode == d) {
      isTerm = true
      Term = this.solarTerm[m * 2 - 2]
    }
    if (secondNode == d) {
      isTerm = true
      Term = this.solarTerm[m * 2 - 1]
    }
    //日柱 当月一日与 1900/1/1 相差天数
    let dayCyclical = Date.UTC(y, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10
    let gzD = this.toGanZhi(dayCyclical + d - 1)
    //该日期所属的星座
    let astro = this.toAstro(m, d)
    return {
      lYear: year,
      lMonth: month,
      lDay: day,
      Animal: this.getAnimal(year),
      IMonthCn: (isLeap ? '\u95f0' : '') + this.toChinaMonth(month),
      IDayCn: this.toChinaDay(day),
      cYear: y,
      cMonth: m,
      cDay: d,
      gzYear: gzY,
      gzMonth: gzM,
      gzDay: gzD,
      isToday: isToday,
      isLeap: isLeap,
      nWeek: nWeek,
      ncWeek: '\u661f\u671f' + cWeek,
      isTerm: isTerm,
      Term: Term,
      astro: astro
    }
  }

  lunar2solar(y, m, d, isLeapMonth) {
    //参数区间1900.1.31~2100.12.1
    isLeapMonth = !!isLeapMonth
    // leapOffset = 0;
    let leapMonth = this.leapMonth(y)
    //let leapDay   = this.leapDays(y);
    if (isLeapMonth && leapMonth != m) {
      return -1
    } //传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同
    if ((y == 2100 && m == 12 && d > 1) || (y == 1900 && m == 1 && d < 31)) {
      return -1
    } //超出了最大极限值
    let day = this.monthDays(y, m)
    let _day = day
    //bugFix 2016-9-25
    //if month is leap, _day use leapDays method
    if (isLeapMonth) {
      _day = this.leapDays(y, m)
    }
    if (y < 1900 || y > 2100 || d > _day) {
      return -1
    } //参数合法性效验
    //计算农历的时间差
    let offset = 0
    for (let i = 1900; i < y; i++) {
      offset += this.lYearDays(i)
    }
    let leap = 0,
      isAdd = false
    for (let i = 1; i < m; i++) {
      leap = this.leapMonth(y)
      if (!isAdd) {
        //处理闰月
        if (leap <= i && leap > 0) {
          offset += this.leapDays(y)
          isAdd = true
        }
      }
      offset += this.monthDays(y, i)
    }
    //转换闰月农历 需补充该年闰月的前一个月的时差
    if (isLeapMonth) {
      offset += day
    }
    //1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)
    let stmap = Date.UTC(1900, 1, 30, 0, 0, 0)
    let calObj = new Date((offset + d - 31) * 86400000 + stmap)
    let cY = calObj.getUTCFullYear()
    let cM = calObj.getUTCMonth() + 1
    let cD = calObj.getUTCDate()
    return this.solar2lunar(cY, cM, cD)
  }

  setLunar(y, m, d) {
    d = d.length === 2 && d[1] !== '0' ? [d[0], '0', d[1]] : d
    return (
      '农历 ' +
      y.map(r => this.n2s[r]).join('') +
      ' 年 ' +
      m.map(r => this.n2s[r]).join('') +
      ' 月 ' +
      d.map(r => (r === '0' ? this.n2s['s'] : this.n2s[r])).join('')
    )
  }

  setLunarDay(d) {
    if (d === 0) {
      return ''
    } else {
      d = String(d).split('')
      d = d.length === 2 && d[1] !== '0' ? [d[0], '0', d[1]] : d
      return (
        '后' +
        d.map(r => (r === '0' ? this.n2s['s'] : this.n2s[r])).join('') +
        '天'
      )
    }
  }

  setTerm(dd, num, lunar, addIndex) {
    let date, year, month, day, cd
    if (lunar.Term) {
      lunar.addIndex = addIndex
      return lunar
    } else {
      if (num === 1) {
        date = new Date(dd.setDate(dd.getDate() - 1))
      } else {
        date = new Date(dd.setDate(dd.getDate() + 1))
      }
      year = date.getFullYear()
      month = date.getMonth() + 1
      day = date.getDate()
      cd = this.solar2lunar(year, month, day)
      addIndex++
      return this.setTerm(date, num, cd, addIndex)
    }
  }
}
