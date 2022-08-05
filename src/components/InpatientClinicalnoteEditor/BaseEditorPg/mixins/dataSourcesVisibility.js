let dataSourcesVisibilityMixin = {
  methods: {
    //控制数据组是否隐藏或显示
    controlsDataSourcesVisibility(docId) {
      const pgEditor = this.getEditor()
      let _param = []
      if (docId) {
        _param.push({ docId })
      }
      let hideElements = pgEditor.pgEditorInstance.postmessage({
        type: 'GetTitleWithImage',
        param: _param
      })
      console.log('hideElements--------2', hideElements)
      hideElements.forEach(v => {
        /*如果段落名与段落内容都设置了隐藏属性：段落名的haveValue属性与段落内容的haveValue属性保持一致，以实现段落名与段落内容同时显示隐藏
         * 如果段落名或段落内容单独设置隐藏属性：各自单独隐藏
         */
        if (v.eleType !== 'title') {
          let pElement = hideElements.find(el => {
            return el.cptId == v.cptId && el.docId == v.docId
          })
          if (pElement) {
            pElement.haveValue = v.haveValue
          }
        }
      })

      let param = hideElements.map(v => {
        return {
          conceptId: v.XID,
          cptId: v.cptId,
          status: !v.haveValue, //是否隐藏
          docId: v.docId,
          idType: 'XID'
        }
      })

      console.log('hideElements--------3', param)
      pgEditor.pgEditorInstance.postmessage({
        type: 'SetElementShowHIde',
        param
      })
    }
  }
}

export default dataSourcesVisibilityMixin
