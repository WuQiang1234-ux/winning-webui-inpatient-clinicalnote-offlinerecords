import _ from 'lodash'
const defaultEditorOptions = {
  id: '',
  EmrName: '',
  ContentRenderMode: ''
}
const store = {
  state: {
    editorOptions: defaultEditorOptions,
    editorLoaded: false,
    editable: true
  },
  mutations: {
    setState(state = {}) {
      _.merge(this.state, state)
    },
    setEditorContentRenderMode(mode) {
      this.state.editorOptions.ContentRenderMode = mode
    }
  }
}

export default store
