//异步转同步
export function cb2promise(fn) {
  function getArgs(argsObj) {
    return Array.prototype.slice.call(argsObj)
  }
  let args = getArgs(arguments)
  let restArgs = args.slice(1)

  function createCallback(resolve, reject) {
    return function (firstArg) {
      if (firstArg && firstArg instanceof Error) return reject(firstArg)

      let args = getArgs(arguments)
      return resolve.apply(null, args)
    }
  }

  const promise = new Promise((resolve, reject) => {
    const cb = createCallback(resolve, reject)
    restArgs.push(cb)
    fn.apply(null, restArgs)
  })

  return promise
}

//判断条件待优化
export function isBase64(str) {
  return !(
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('/')
  )
}

// 根据文字生成canvas图片
export function canvasWrapText(text) {
  text = (text ?? '').replace(/,/g, ',')
  // 创建画布，
  let canvas = document.createElement('canvas')
  // 绘制文字环境
  let context = canvas.getContext('2d')
  let dom = document.createElement('span')

  dom.style.fontSize = '18px'
  dom.style.fontWeight = 'bold'
  dom.style.display = 'line-block'
  dom.style.padding = '3px'

  dom.innerText = text
  document.body.appendChild(dom)
  // if (dom.offsetWidth > 400) {
  //   console.log('大于400');

  //   dom.remove()
  // } else {
  canvas.setAttribute('width', dom.offsetWidth)
  canvas.setAttribute('height', dom.offsetHeight)
  context.font = 'bold 18px Arial'
  context.fillText(text, 2, 22)
  // 生成图片信息
  let baseUrl = canvas.toDataURL('image/png')
  let width = canvas.getAttribute('width')
  let height = canvas.getAttribute('height')
  console.log(baseUrl, width, height, '文字生成图片')
  dom.remove()
  return { baseUrl, width, height }
  // }
}
