import Vue from 'vue'
Vue.directive('iptDatePicker', {
  inserted: function (el, binding, vnode) {
    //日期格式  这里只处理常见的yyyy-MM-dd HH:mm和yyyy-MM-dd HH:mm:ss
    let _format = vnode.componentInstance.format ?? 'yyyy-MM-dd HH:mm:ss'
    //获取界面上显示的input元素
    let p_input = el.children[0]
    p_input.setAttribute('type', 'datetime-local')
    //默认时间格式为HH:mm   需加上秒
    if (_format == 'yyyy-MM-dd HH:mm:ss') {
      p_input.setAttribute('step', 1)
    }
    p_input.addEventListener('focus', () => {
      let _inputList = document.getElementsByClassName('inpatient-clinicalnote-date-picker-panel')[0].getElementsByTagName('input')
      _inputList[0].setAttribute('type', 'date')
      _inputList[1].setAttribute('type', 'time')
      //默认时间格式为HH:mm   需加上秒
      if (_format == 'yyyy-MM-dd HH:mm:ss') {
        _inputList[1].setAttribute('step', 1)
      }
    })

  }
})