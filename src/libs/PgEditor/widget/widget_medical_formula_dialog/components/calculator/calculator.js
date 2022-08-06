//1 操作型 2输入型 3 符号型 4 计算型
//输入的  计算的
// 输入区 缓冲区
//运算
//x 缓存的 y 输入的 z运算
const standardList = {
  tr0: [
    {
      type: 3,
      value: '--$',
      text: '%'
    },
    {
      type: 3,
      value: 'sqrt_',
      text: '√'
    },
    {
      type: 3,
      value: 'pow_2',
      text: 'x2'
    },
    {
      type: 3,
      value: '--1/x',
      text: '1/x'
    }
  ],
  tr1: [
    {
      type: 1,
      value: '清除',
      text: 'CE'
    },
    {
      type: 1,
      value: '清空',
      text: 'C'
    },
    {
      type: 1,
      value: '回退',
      text: 'x'
    },
    {
      type: 3,
      value: '/',
      text: '÷'
    }
  ],
  tr2: [
    {
      type: 2,
      value: 7,
      text: '7'
    },
    {
      type: 2,
      value: 8,
      text: '8'
    },
    {
      type: 2,
      value: 9,
      text: '9'
    },
    {
      type: 3,
      value: '*',
      text: 'X'
    }
  ],
  tr3: [
    {
      type: 2,
      value: 4,
      text: '4'
    },
    {
      type: 2,
      value: 5,
      text: '5'
    },
    {
      type: 2,
      value: 6,
      text: '6'
    },
    {
      type: 3,
      value: '-',
      text: '-'
    }
  ],
  tr4: [
    {
      type: 2,
      value: 1,
      text: '1'
    },
    {
      type: 2,
      value: 2,
      text: '2'
    },
    {
      type: 2,
      value: 3,
      text: '3'
    },
    {
      type: 3,
      value: '+',
      text: '+'
    }
  ],
  tr5: [
    {
      type: 2,
      value: '正负值',
      text: '±'
    },
    {
      type: 2,
      value: 0,
      text: '0'
    },
    {
      type: 2,
      value: '.',
      text: '.'
    },
    {
      type: 4,
      value: '计算',
      text: '='
    }
  ]
}

const scienceList = {
  tr0: [
    {
      type: 3,
      value: 'pow_2',
      text: 'x2'
    },
    {
      type: 3,
      value: 'pow_y',
      text: 'xy'
    },
    {
      type: 3,
      value: 'sin_',
      text: 'sin'
    },
    {
      type: 3,
      value: 'cos_',
      text: 'cos'
    },
    {
      type: 3,
      value: 'tan_',
      text: 'tan'
    }
  ],
  tr1: [
    {
      type: 3,
      value: 'sqrt_',
      text: '√'
    },
    {
      type: 3,
      value: 'pow_10',
      text: '10x'
    },
    {
      type: 3,
      value: 'log_',
      text: 'log'
    },
    {
      type: 3,
      value: 'exp_',
      text: 'Exp'
    },
    {
      type: 3,
      value: '%',
      text: 'Mod'
    }
  ],
  tr2: [
    {
      type: 3,
      value: 'pow_3',
      text: 'x3'
    },
    {
      type: 3,
      value: 'log_z',
      text: '10x'
    },
    {
      type: 3,
      value: 'asin_',
      text: 'sin-1'
    },
    {
      type: 3,
      value: 'acos_',
      text: 'cos-1'
    },
    {
      type: 3,
      value: 'atan_',
      text: 'tan-1'
    }
  ],
  tr3: [
    {
      type: 3,
      value: '--1/x',
      text: '1/x'
    },
    {
      type: 3,
      value: 'pow_E',
      text: 'ex'
    },
    {
      type: 3,
      value: 'E_In', //就是指log以e为底的对数，b=ln(a)表示e的b次方等于a。
      text: 'in'
    },
    {
      type: 3,
      value: 'dms',
      text: 'dms'
    },
    {
      type: 3,
      value: 'deg',
      text: 'deg'
    }
  ],
  tr4: [
    {
      type: 6,
      value: '↑',
      text: '↑',
      isDown: true
    },
    {
      type: 1,
      value: '清除',
      text: 'CE'
    },
    {
      type: 1,
      value: '清空',
      text: 'C'
    },
    {
      type: 1,
      value: '回退',
      text: 'x'
    },
    {
      type: 3,
      value: '/',
      text: '÷'
    }
  ],
  tr5: [
    {
      type: 2,
      value: 'π',
      text: 'π'
    },
    {
      type: 2,
      value: 7,
      text: '7'
    },
    {
      type: 2,
      value: 8,
      text: '8'
    },
    {
      type: 2,
      value: 9,
      text: '9'
    },
    {
      type: 3,
      value: '*',
      text: 'X'
    }
  ],
  tr6: [
    {
      type: 3,
      value: '--n!',
      text: 'n!'
    },
    {
      type: 2,
      value: 4,
      text: '4'
    },
    {
      type: 2,
      value: 5,
      text: '5'
    },
    {
      type: 2,
      value: 6,
      text: '6'
    },
    {
      type: 3,
      value: '-',
      text: '-'
    }
  ],
  tr7: [
    {
      type: 2,
      value: '正负值',
      text: '±'
    },
    {
      type: 2,
      value: 1,
      text: '1'
    },
    {
      type: 2,
      value: 2,
      text: '2'
    },
    {
      type: 2,
      value: 3,
      text: '3'
    },
    {
      type: 3,
      value: '+',
      text: '+'
    }
  ],
  tr8: [
    {
      type: 5,
      value: '(',
      text: '(',
      isKh: true
    },
    {
      type: 5,
      value: ')',
      text: ')'
    },
    {
      type: 2,
      value: 0,
      text: '0'
    },
    {
      type: 2,
      value: '.',
      text: '.'
    },
    {
      type: 4,
      value: '计算',
      text: '='
    }
  ]
}
export { standardList, scienceList }
