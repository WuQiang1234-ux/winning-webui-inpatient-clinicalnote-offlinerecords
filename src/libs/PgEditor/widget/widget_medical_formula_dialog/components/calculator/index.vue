<template>
  <div class="calculator-main">
    <!-- <el-radio-group v-model="calculatorTyoe" size="small" @change="resetFormula()" >
      <el-radio-button :label="1">标准</el-radio-button>
      <el-radio-button :label="2">科学</el-radio-button>
    </el-radio-group>-->
    <div class="content-panel">
      <div class="calc-cache">
        <div class="right-pull">
          <span v-show="leftScroll" @click="turnRight">
            <i class="el-icon-arrow-left"></i>
          </span>
        </div>
        <div ref="caclValueRef" class="calc-value">{{ expression.join('') }}</div>
        <div class="left-pull">
          <span v-show="rightScroll" @click="turnLeft">
            <i class="el-icon-arrow-right"></i>
          </span>
        </div>
      </div>
      <div class="import-value" :style="{ fontSize: setFSInLenght }">{{ calcValue }}</div>
    </div>
    <calcuPanel
      v-show="calculatorTyoe === 1"
      :panel-list="standardListCom"
      @handle-panel-data="handlePanelData"
    ></calcuPanel>
    <calcuPanel
      v-show="calculatorTyoe === 2"
      :panel-class="panelClass"
      :panel-list="scienceListCom"
      :switch-num="switchNum"
      :kxkh-num="kxkhNum"
      @handle-panel-data="handlePanelData"
    ></calcuPanel>
  </div>
</template>
<script>
import { standardList, scienceList } from './calculator'
import calcuPanel from './calcuPanel'
import { add, subtract, multiply, divide, bignumber, number } from 'mathjs'
const calcuMath = { multiply, divide, add, subtract }
export default {
  name: 'FormulAll',
  components: { calcuPanel },
  data() {
    return {
      calculatorTyoe: 1,
      // standardList,
      // scienceList,
      expression: [], //上面的表达式
      designFormulas: [], //计算公式
      calcValue: '0', //数字
      cacheValue: null, //计算得到的值
      isDisable: false, //是否isNaN
      isImport: true, //
      logicOperation: 0, //逻辑操作类型  0 默认 1输入  2 相等 3 math计算 4 普通计算 5 左括号 6右括号 7 特殊 xy
      switchNum: false, //科学计算器  ↑
      nextOperation: null, //上一个输入的值
      panelClass: 'operation-panel-science',
      //fsNum:1,
      kxkhNum: 0, //剩余括号数
      equalCaclValue: 0,
      isScroll: false,
      leftScroll: false,
      rightScroll: false,
      savaKHData: { '0': [], '1': [] }, //放括号集合
      cacheObj: {}
    }
  },
  computed: {
    //设置font-size 字体
    setFSInLenght() {
      let comma = this.calcValue.match(/,/g)
      comma = comma ? comma : ''
      let dot = this.calcValue.match(/\./g)
      dot = dot ? dot : ''
      let lenCD = comma.length + dot.length
      let len = this.calcValue.replace(/,/g, '').length
      let fs = '40px'
      let jclen
      if (lenCD === 1) {
        jclen = 11
      } else {
        jclen = 10
      }
      if (len < jclen) {
        fs = '40px'
      } else {
        fs = 40 - 2.5 * (len - jclen) + 'px'
        this.fsNum += 1
      }

      return fs
    },
    //标准 界面数据
    standardListCom() {
      return this.handleObjDisable(this.isDisable, standardList)
    },
    //科学 界面数据
    scienceListCom() {
      return this.handleObjDisable(
        this.isDisable,
        this.handleDeleteScience(this.switchNum, scienceList)
      )
    }
  },
  watch: {
    isImport(n, old) {
      if (n) {
        //可以计算
      } else {
        //表达式
        old
      }
    }
  },
  methods: {
    //操作面板逻辑操作
    handlePanelData(data) {
      //输入触发滚动
      if (this.isScroll === false) {
        this.$refs.caclValueRef.scrollLeft =
          this.$refs.caclValueRef.scrollLeft + 20
        if (this.$refs.caclValueRef.scrollLeft > 0) {
          this.isScroll = true
          this.leftScroll = true
        }
      }
      //1 操作 2 数字 3 符号 4 计算 5 括号 6 ↑
      //输入的  计算的
      // 输入区 缓冲区
      //运算
      //x 缓存的 y 输入的 z运算
      //console.log(data)
      //console.log(this.designFormulas)
      let { value, type } = data //子穿父的值
      let pcv = this.calcValue.replace(/,/g, '') //面板的值去掉“,”
      let cLen = pcv.replace(/\./g, '').length //面板输入长度
      let abs = parseFloat(pcv) //字符转换浮点
      let logicOperation = this.logicOperation //操作类型
      let ddz //面板值
      let lastNum = this.designFormulas[this.designFormulas.length - 1] //designFormulas 最后一个数字类型
      let lastep = this.expression[this.expression.length - 1]
      let evalStr // 计算的字符串
      let cacheValue = this.cacheValue //计算得到的值
      cacheValue = cacheValue ? cacheValue : 0
      let equalTobutton = false //上一个是否按的是 =
      let leftLen = this.savaKHData['0'].length
      let rightLen = this.savaKHData['1'].length
      //边界
      const MAX_NUM = Number.MAX_VALUE
      const MIN_NUM = Number.MIN_VALUE
      switch (
        type //1 2 3 4 5 6
      ) {
        case 1: //操作
          switch (value) {
            case '清除':
              if (this.isDisable) {
                this.resetFormula()
              } else {
                //this.fsNum = 1
                this.calcValue = '0'
              }
              break
            case '清空':
              this.resetFormula()
              break
            case '回退':
              if (this.isDisable) {
                this.resetFormula()
              } else {
                if (logicOperation === 1) {
                  //输入的才可以回退
                  // if(this.fsNum>1){
                  //   this.fsNum -=1
                  // }
                  ddz = pcv === '0' ? '0' : pcv.substr(0, pcv.length - 1)
                  ddz = ddz === '' ? '0' : ddz
                }
              }
              break
          }
          break
        case 2: //输入
          if (typeof value === 'number') {
            if (this.isDisable === true) {
              this.isDisable = false
              this.expression = []
              this.designFormulas = []
            }
            if (logicOperation === 0 || logicOperation === 1) {
              if (cLen < 16) {
                ddz = pcv === '0' ? value : pcv + '' + value
              }
            } else {
              ddz = value
            }
          } else {
            switch (value) {
              case '正负值':
                if (abs < 0) {
                  ddz = String(Math.abs(abs))
                } else {
                  ddz = String(-abs)
                }
                if (logicOperation > 1) {
                  this.expression = []
                }
                break
              case '.':
                if (logicOperation > 1) {
                  ddz = 0 + '.'
                } else {
                  if (!isNaN(abs + '.')) {
                    ddz = abs + '.'
                  }
                }
                break
              case 'π':
                ddz = Math.PI
                break
            }
          }
          this.logicOperation = 1
          break
        case 3: //计算
          //"-%-" 标准的%运算
          if (value.includes('--')) {
            //运算
            let ptStr = value.split('--')
            let pt = ptStr[1]
            switch (pt) {
              case '$':
                switch (this.nextOperation) {
                  case '+':
                  case '-':
                    ddz = parseFloat((cacheValue * (abs / 100)).toFixed(2))
                    break
                  case '*':
                  case '/':
                    ddz = parseFloat((cacheValue / 100).toFixed(2))
                    break
                  default:
                    ddz = 0
                    break
                }
                this.designFormulas.push(ddz)
                this.expression.push(ddz)
                break
              case '1/x':
                if (abs === 0) {
                  this.designFormulas.push('1/(0)')
                  this.expression.push('1/(0)')
                  this.isDisable = true
                  this.calcValue = '除数不能为零'
                } else {
                  let sy
                  let s1
                  ddz = 1 / abs
                  s1 = String(ddz).split('.')[0]
                  s1 ? '' : s1
                  sy = 16 - s1.split('.')[0].length
                  ddz = parseFloat(ddz.toFixed(sy))
                  this.designFormulas.push(ddz)
                  this.expression.push(ddz)
                }
                break
              case 'n!':
                ddz = this.fact(abs)
                this.designFormulas.push(ddz)
                this.expression.push('fact(' + abs + ')')
                break
            }
            this.logicOperation = 3
          } else if (value.includes('_')) {
            //math 运算
            let mathStr = value.split('_')
            let ms1 = mathStr[0]
            let ms2 = mathStr[1]
            if (ms2) {
              //math 计算
              switch (ms2) {
                // x2
                case '2':
                  ddz = Math[ms1](abs, 2)
                  this.designFormulas.push(ddz)
                  if (logicOperation === 3) {
                    this.expression.push('sqr(' + lastep + ')')
                  } else {
                    this.expression.push('sqr(' + abs + ')')
                  }
                  this.logicOperation = 3
                  break
                // x3
                case '3':
                  ddz = Math[ms1](abs, 3)
                  this.designFormulas.push(ddz)
                  if (logicOperation === 3) {
                    this.expression.push('cube(' + lastep + ')')
                  } else {
                    this.expression.push('cube(' + abs + ')')
                  }
                  this.logicOperation = 3
                  break
                // ex
                case 'E':
                  ddz = Math[ms1](Math.E, abs)
                  this.designFormulas.push(ddz)
                  if (logicOperation === 3) {
                    this.expression.push('e^(' + lastep + ')')
                  } else {
                    this.expression.push('e^(' + abs + ')')
                  }
                  this.logicOperation = 3
                  break
                //In
                case 'In':
                  ddz = Math.log(abs) / Math.log(Math.E)
                  this.designFormulas.push(ddz)
                  if (logicOperation === 3) {
                    this.expression.push('In(' + lastep + ')')
                  } else {
                    this.expression.push('In(' + abs + ')')
                  }
                  this.logicOperation = 3
                  break
                //xy
                case 'y':
                  //Math[ms1](abs,abs)
                  this.designFormulas.push('Math.pow(' + abs + ',y)')
                  this.cacheObj.abs = abs
                  this.expression.push(abs + '^')
                  this.logicOperation = 7
                  break
                case 'z':
                  this.designFormulas.push('Math.log(' + abs + ')/Math.log(z)')
                  this.cacheObj.abs = abs
                  this.expression.push(abs + 'yroot')
                  this.logicOperation = 7
                  break
                //10x
                case '10':
                  ddz = Math[ms1](10, abs)
                  this.designFormulas.push(ddz)
                  if (logicOperation === 3) {
                    this.expression.push('10^(' + lastep + ')')
                  } else {
                    this.expression.push('10^(' + abs + ')')
                  }
                  this.logicOperation = 3
                  break
              }
            } else {
              if (Math[ms1] && typeof Math[ms1] === 'function') {
                ddz = Math[ms1](abs)
                this.designFormulas.push(ddz)
                if (logicOperation === 3) {
                  this.expression.push(ms1 + '(' + lastep + ')')
                } else {
                  this.expression.push(ms1 + '(' + abs + ')')
                }
                this.logicOperation = 3
              }
            }
          } else {
            //普通运算
            this.nextOperation = value
            let df = this.designFormulas
            if (logicOperation === 4) {
              df[df.length - 1] = value
              this.expression[df.length - 1] = value
            } else {
              if (logicOperation !== 6 && logicOperation !== 3) {
                df.push(abs)
                this.expression.push(abs)
              } else if (logicOperation === 7) {
                this.designFormulas = this.designFormulas.map(r => {
                  if (String(r).includes('pow')) {
                    r = abs
                  } else if (String(r).includes('log')) {
                    r = abs
                  }
                  return r
                })
                this.expression = this.expression.map(r => {
                  if (String(r).includes('pow')) {
                    r = abs
                  } else if (String(r).includes('log')) {
                    r = abs
                  }
                  return r
                })
                df = this.designFormulas
              }
              //let dfstr = df.join('')
              try {
                if (df.length > 1) {
                  let s = this.batchOutOperation(df) //eval(dfstr)
                  this.cacheValue = s
                  ddz = s
                } else {
                  this.cacheValue = df[df.length - 1]
                }
              } catch (e) {
                this.cacheValue = df[df.length - 2]
                console.log('不能计算')
              } finally {
                this.logicOperation = 4
                df.push(value)
                this.expression.push(value)
              }
            }
          }
          break
        case 4: //等号
          this.equalCaclValue = abs
          if (
            typeof lastNum !== 'number' &&
            logicOperation !== 7 &&
            logicOperation !== 6
          ) {
            this.designFormulas.push(abs)
          }
          this.designFormulas = this.designFormulas.map(r => {
            if (String(r).includes('pow')) {
              r = r.replace('y', abs)
            } else if (String(r).includes('log')) {
              r = r.replace('z', abs)
            }
            return r
          })
          evalStr = this.batchOutOperation(this.designFormulas) //this.designFormulas.join('')
          try {
            ddz = eval(evalStr)
            this.designFormulas = []
            this.expression = []
            equalTobutton = true
            this.logicOperation = 2
          } catch (e) {
            console.log(evalStr + ':这个公式不能计算')
          }
          break
        case 5: //括号
          switch (value) {
            case '(':
              if (lastNum === ')') {
                this.designFormulas = []
                this.expression = []
                this.savaKHData['0'] = []
                this.savaKHData['1'] = []
              }
              this.savaKHData['0'].push(1)
              this.kxkhNum =
                this.savaKHData['0'].length - this.savaKHData['1'].length
              this.designFormulas.push('(')
              this.expression.push('(')
              this.logicOperation = 5
              break
            case ')':
              if (rightLen < leftLen) {
                if (lastNum !== ')') {
                  this.designFormulas.push(abs)
                  this.expression.push(abs)
                }
                this.savaKHData['1'].push(1)
                this.kxkhNum =
                  this.savaKHData['0'].length - this.savaKHData['1'].length
                this.designFormulas.push(')')
                this.expression.push(')')
                this.logicOperation = 6
              }
              break
          }
          break
        case 6: //科学 ↑
          this.switchNum = !this.switchNum
          break
      }
      //展示的
      if (ddz !== undefined) {
        if (ddz === Infinity) {
          this.calcValue = '除数不能为零‬'
          this.isDisable = true
          return
        }
        ddz = String(ddz)
        let isD = ddz.includes('.')
        ddz = ddz.split('.')
        let a = Number(ddz[0])
        let b = ddz[1] ? '.' + ddz[1] : isD ? '.' : ''
        let seeValue = this.numberFormat(a) + b
        let bj = parseFloat(seeValue)
        //是否超出边界
        if (bj > MAX_NUM && MIN_NUM) {
          //bj<MIN_NUM)
          this.calcValue = '计算超出边界‬'
          this.isDisable = true
          return
        }
        if (equalTobutton) {
          this.$emit('input', seeValue)
        }
        this.calcValue = seeValue
      }
    },
    //处理操作面板button Disable
    handleObjDisable(bool, aryy) {
      let targetArry = Object.assign({}, aryy)
      for (let ta in targetArry) {
        let list = []
        list = targetArry[ta].map(s => {
          if (bool) {
            if (s.type === 1 || s.type === 2) {
              if (s.type === 2 && !isNaN(s.value)) {
                s.disabled = false
              } else {
                if (s.type === 1) {
                  s.disabled = false
                } else {
                  s.disabled = true
                }
              }
            } else {
              s.disabled = true
            }
          } else {
            s.disabled = false
          }
          return s
        })
        targetArry[ta] = list
      }
      return targetArry
    },
    batchOutOperation(arr) {
      let value = 0
      let nindex = arr.length
      if (nindex > 0) {
        arr.forEach((r, i) => {
          if (r === '*' || r === '/' || r === '+' || r === '-') {
            let calcuIndex = ['*', '/', '+', '-'].indexOf(r)
            let meth = ['multiply', 'divide', 'add', 'subtract'][calcuIndex]
            if (i + 1 <= nindex - 1) {
              if (value === 0) {
                value = number(
                  calcuMath[meth](bignumber(arr[i - 1]), bignumber(arr[i + 1]))
                )
              } else {
                value = number(
                  calcuMath[meth](bignumber(value), bignumber(arr[i + 1]))
                )
              }
            }
          }
        })
      }
      return value
    },
    //出来科学操作面板的↑
    handleDeleteScience(bool, aryy) {
      let targetArry = Object.assign({}, aryy)
      if (bool === false) {
        delete targetArry.tr2
        delete targetArry.tr3
      } else {
        delete targetArry.tr0
        delete targetArry.tr1
      }
      return targetArry
    },
    //数字格式 123,123,123.99
    numberFormat(v) {
      let n = v,
        c = isNaN((c = Math.abs(c))) ? 0 : c,
        d = d == undefined ? '.' : d,
        t = t == undefined ? ',' : t,
        s = n < 0 ? '-' : '',
        i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
        j = (j = i.length) > 3 ? j % 3 : 0
      return (
        s +
        (j ? i.substr(0, j) + t : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
        (c
          ? d +
            Math.abs(n - i)
              .toFixed(c)
              .slice(2)
          : '')
      )
    },
    //重置计算器
    resetFormula() {
      this.calcValue = '0'
      this.isDisable = false
      this.cacheValue = null
      this.expression = []
      this.designFormulas = []
      this.nextOperation = null
      this.logicOperation = 0
      this.equalCaclValue = 0
      this.isScroll = false
      this.leftScroll = false
      this.rightScroll = false
      this.savaKHData = { '0': [], '1': [] }
    },
    //!n 计算 尾调递归 5*4*3*2*1
    fact(n) {
      return this.fact_iter(n, 1)
    },
    fact_iter(num, product) {
      if (num == 1) {
        return product
      } else {
        return this.fact_iter(num - 1, num * product)
      }
    },
    //往右
    turnRight() {
      let cDom = this.$refs.caclValueRef
      cDom.scrollLeft = cDom.scrollLeft + 20
      if (
        Number(String(cDom.scrollLeft).split('.')[0]) + cDom.clientWidth ===
        cDom.scrollWidth
      ) {
        this.leftScroll = false
        this.rightScroll = true
      }
      //console.log(this.$refs.caclValueRef.scrollLeft,this.$refs.caclValueRef.clientWidth,this.$refs.caclValueRef.scrollWidth)
    },
    //往左
    turnLeft() {
      let cDom = this.$refs.caclValueRef
      cDom.scrollLeft = cDom.scrollLeft - 20
      //console.log(this.$refs.caclValueRef.scrollLeft,this.$refs.caclValueRef.clientWidth,this.$refs.caclValueRef.scrollWidth)
      if (cDom.scrollLeft === 0) {
        this.leftScroll = true
        this.rightScroll = false
      }
    }
  }
}
</script>
<style lang="scss">
.calculator-main {
  width: 321px;
  padding: 2px;
  .content-panel {
    background-color: #e6e6e6;
    width: 100%;
    .calc-cache {
      height: 20px;
      width: 100%;
      display: flex;
      .right-pull,
      .left-pull {
        width: 20px;
        text-align: center;
        color: #4298db;
        cursor: pointer;
      }
      .calc-value {
        text-align: right;
        width: 281px;
        white-space: nowrap;
        overflow-x: scroll;
        color: #5c5c5c;
        font-size: 14px;
        line-height: 22px;
        overflow-y: hidden;
      }
      .calc-value::-webkit-scrollbar {
        height: 0px !important;
      }
    }
    .import-value {
      color: #000000;
      font-weight: 600;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 70px;
      padding: 0px 20px;
    }
  }
}
</style>
