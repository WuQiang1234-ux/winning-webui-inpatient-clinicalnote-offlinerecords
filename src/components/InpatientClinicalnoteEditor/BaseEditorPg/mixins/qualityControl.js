import { EditorEvent } from '@/libs/PgEditor/constants'
import qualityControlApi from '@/api/qualityControl'
import api from '@/api/list.js'
//质控
let qualityControl = {
  data() {
    return {}
  },
  mounted() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_BROWSE_RClick,
      this.browseRClick
    )
    window.eventBus.$on('editorTextPosition', this.editorTextPosition)
    this.$root.eventHub.$on(
      'setLocateCursorWithInput',
      this.setLocateCursorWithInput
    )
  },
  beforeDestroy() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_BROWSE_RClick,
      this.browseRClick
    )
    window.eventBus.$off('editorTextPosition', this.editorTextPosition)
    this.$root.eventHub.$off(
      'setLocateCursorWithInput',
      this.setLocateCursorWithInput
    )
  },
  methods: {
    //获取单份病历的状态及权限
    async qualityControlqueryClinicalnotePermissionAsync(_emrSetId) {
      if (this.qualityControlData.operationType == 'read') {
        console.log('质控预览模式')
        const pgEditor = this.getEditor()

        this.$nextTick(() => {
          pgEditor.pgEditorInstance.postmessage({
            type: 'SetWorkMode_Browse',
            param: []
          })
          pgEditor.store.editor.state.editorOptions.ContentRenderMode =
            'SetWorkMode_Browse'
          this.toolbarOptions.isShow = false
        })
        console.log(this.clinicalnoteData.content.mrtEditorTypeCode, '下权限')
        return {
          editable: false,
          permissionVOList: []
        }
      } else {
        console.log('质控操作模式')
        let emrSetId = _emrSetId || this.currentDocId
        const res = await api.apiGetButtonPermission({
          encounterId: this.currentPatientInfo.encounterId,
          inpatEmrSetId: emrSetId,
          currentDeptId: this.orgInfo.orgId,
          rectificationOrderType:
            this.qualityControlData?.rectificationOrderType || ''
        })
        const { data } = res
        return {
          editable: data.canEdit,
          permissionVOList: data.permissionVOList
        }
      }
    },
    dynamicCollectionData() {
      let pgEditorId = this.$refs.pgEditorDom.pgEditorId
      // 滚动时，动态集合弹框消失
      if (document.getElementById('pango-editor-content-' + pgEditorId)) {
        document.getElementById(
          'pango-editor-content-' + pgEditorId
        ).onscroll = () => {
          window.eventBus.$emit('emitControlEditorPopover', {
            show: false
          })
        }
      }
    },
    qualityAloneEvent() { },
    browseRClick(e) {
      console.log('质控', e)
      // e.preventDefault()
      const pgEditor = this.getEditor()
      let data = pgEditor.pgEditorInstance.postmessage({
        type: 'GetSelectStructureTree',
        param: []
      })
      console.log('aaaa', data)
      if (!data.result) {
        this.$message({
          message: '请先选中文书部分内容',
          type: 'warning'
        })
        return
      }
      this.dynamicCollectionData()
      window.eventBus.$emit('emitControlEditorPopover', {
        show: true,
        defectParams: data,
        clinicalnoteData: this.clinicalnoteData
      })
    },
    editorTextPosition(data) {
      console.log(data)
      let {
        emrSetId, //文档id
        cptId, // cptId
        titleCptId //段落id
      } = data
      console.log(
        '要定位的',
        '文档',
        emrSetId,
        '段落',
        titleCptId,
        '数据源',
        cptId
      )
      const pgEditor = this.getEditor()
      pgEditor.pgEditorInstance.postmessage({
        type: 'LocateCursorWithInput',
        param: [
          {
            cptId,
            position: 'before', // after,before,innerbefore,innerafter
            // idType: 'XID',
            titleCptId,
            docId: emrSetId
          }
        ]
      })

      // let selectRange = data.selectRange
      //   pgEditor.pgEditorInstance.postmessage({
      //     type: 'SelectByEle',
      //     param: [selectRange]
      //   })
    },
    setLocateCursorWithInput(data) {
      const pgEditor = this.getEditor()
      data.docId = this.currentDocId
      pgEditor.pgEditorInstance.postmessage({
        type: 'LocateCursorWithInput',
        param: [data]
      })
    },
    async saveQualityClinicalnoteContentAsync(
      isShowProcess = true,
      inpatEmrSetId
    ) {
      inpatEmrSetId = inpatEmrSetId || this.currentDocId
      isShowProcess && this.showClinicalnoteProcessing(true)

      const params = await this.getBtnActionParams(inpatEmrSetId)
      if (!params) return
      Object.assign(params, { operationType: 'save' })
      await qualityControlApi.saveClinicalnoteContent(params)
        .then(async res => {
          //更新病历版本号
          await this.upDateVersion(res)
          if (isShowProcess) {
            if (res?.success) {
              this.$message({
                message: res?.errorDetail?.message || '保存成功',
                type: 'success',
                showClose: true
              })
            } else {
              this.$message({
                message: res?.errorDetail?.message || '保存失败',
                type: 'success',
                showClose: true
              })
            }
          }
        })
        .finally(() => {
          isShowProcess && this.showClinicalnoteProcessing(false)
        })
    }
  }
}

export default qualityControl
