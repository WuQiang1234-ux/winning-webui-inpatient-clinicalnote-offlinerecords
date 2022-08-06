import _ from 'lodash'

const store = {
  state: {
    isShow: false,
    content: [],
    editor: {}
  },
  mutations: {
    setState(state = {}) {
      _.merge(this.state, state)
    }
  }
}

export default store
