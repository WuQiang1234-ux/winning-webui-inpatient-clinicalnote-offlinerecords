const store = {
  state: {
    isShow: false,
    content: []
  },
  mutations: {
    setState(state = {}) {
      if (state.isShow !== undefined) {
        this.state.isShow = state.isShow
      }

      if (state.content !== undefined) {
        this.state.content = state.content
      }
    }
  }
}

export default store
