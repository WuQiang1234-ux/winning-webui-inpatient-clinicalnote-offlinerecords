
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
