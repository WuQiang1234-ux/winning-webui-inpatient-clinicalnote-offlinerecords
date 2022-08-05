let debuggingMixin = {
  methods: {
    debugHandleSaveAction() {
      this.saveClinicalnoteContentAsync(true, this.currentDocId)
    },
    async getXmlStructuring() {
      const clinicalnoteData = this.clinicalnoteData
      let inpatEmrSetId = clinicalnoteData.content.emrSetId
      this.getClinicalnoteContent(inpatEmrSetId)
    },
    async setXml() {
      const pgEditor = this.getEditor()
      // const { clinicalnoteData } = this

      pgEditor.pgEditorInstance.postmessage({
        type: 'xmlFile',
        param: []
      })
    },
    getXml() {
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        param: [this.clinicalnoteData.content.emrSetTitle],
        type: 'FileSaveAs'
      })
    },
    setbc() {
      const pgEditor = this.getEditor()
      if (this.clinicalnoteData.serial) {
        let param = this.loadedSubDocList.map(el => ({
          docId: el.id,
          isEditable: true
        }))
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetEditableByDocId',
          param
        })
      } else {
        let param = [
          {
            docId: this.currentDocId,
            isEditable: true
          }
        ]
        pgEditor.pgEditorInstance.postmessage({
          type: 'SetEditableByDocId',
          param
        })
        pgEditor?.settingEditorRenderModeByStatus(true)
      }
    }
  }
}

export default debuggingMixin
