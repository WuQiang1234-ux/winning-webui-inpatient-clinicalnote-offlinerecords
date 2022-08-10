// write your directive here...
export default {
  tooltip: {
    bind: function (el, { value }) {
      if (!value) return
      const { content, classes } = value
      let tooltip, tooltip_inner, clearTimeoutId
      el.onmouseenter = evt => {
        const markEnable = el.getAttribute('wn-mark')
        if (markEnable !== 'true') return
        const { pageX, pageY } = evt
        // 清除缓存计时
        if (clearTimeoutId) {
          clearTimeout(clearTimeoutId)
        }
        // 框架
        if (!tooltip) {
          tooltip = document.createElement('div')
          tooltip.setAttribute('x-placement', 'top')
          tooltip.style.position = 'absolute'
          tooltip.style.left = '0px'
          tooltip.style.top = '0px'
          tooltip.style.willChange = 'transform'
          // 箭头
          const tooltip_arrow = document.createElement('div')
          tooltip_arrow.classList.add('tooltip-arrow')
          // 内容
          tooltip_inner = document.createElement('div')
          tooltip_inner.classList.add('tooltip-inner')
          // 组合
          tooltip.append(tooltip_arrow)
          tooltip.append(tooltip_inner)
          // 追加
          document.body.append(tooltip)
        }
        tooltip.classList.add(...classes)
        tooltip.setAttribute('aria-hidden', false)
        tooltip.style.transform = `translate3d(${pageX - 90}px, ${pageY -
          55}px, 0px)`
        tooltip_inner.innerHTML = content
      }
      el.onmouseleave = () => {
        const markEnable = el.getAttribute('wn-mark')
        if (markEnable !== 'true') return
        tooltip.style.display = 'none'
        tooltip.setAttribute('aria-hidden', true)
        clearTimeoutId = setTimeout(() => {
          if (tooltip) {
            tooltip.remove()
            tooltip = undefined
            clearTimeoutId = undefined
          }
        }, 5000)
      }
    }
  }
}
