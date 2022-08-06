import _ from 'lodash'

const store = {
  state: {
    disabled: false,

    isAiBeforeArrowKeydown: true, // 自研编辑器键盘上下键是否能用，false不能；true能
    isAiBeforeEnterKeydown: true, // 自研编辑器键盘enter键是否能用，false不能；true能
    ksdm: ''
  },
  mutations: {
    setState(state = {}) {
      _.merge(this.state, state)
    }
  }
}

export default store
