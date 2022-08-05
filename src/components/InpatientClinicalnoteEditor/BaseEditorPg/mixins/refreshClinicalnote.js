import { EditorEvent, DcEditorRenderModes } from '@/libs/PgEditor/constants'
import { debounce } from '@/utils/index'
import { createNamespacedHelpers } from 'vuex'
const { mapMutations: componentsMapMutations } = createNamespacedHelpers(
  'components/multiClinicalnoteBoardState'
)
const { mapState: clinicalnoteMapStates } = createNamespacedHelpers('emr')
// 刷新病历
let refreshClinicalnoteMixin = {
  computed: {
    ...clinicalnoteMapStates(['PublicParameters'])
  },
  beforeDestroy() {
    const pgEditor = this.getEditor()
    //工具栏刷新病历操作
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_REFRESH_CLINICALNOTE,
      this.handleRefreshClinicalnoteContent
    )
  },
  mounted() {
    const pgEditor = this.getEditor()
    //工具栏刷新病历操作
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_REFRESH_CLINICALNOTE,
      this.handleRefreshClinicalnoteContent
    )
  },
  methods: {
    async handleRefreshSubmitedClinicalnote(obj) {
      if (this.editorId !== obj.editorId) {
        return
      }

      if (this.clinicalnoteData.serial) {
        const pgEditor = this.getEditor()
        let { contentList } = await this.getClinicalnoteContentListByIds(
          obj.subDocIds[0],
          obj.subDocIds
        )
        for (let i = 0; i < contentList.length; i++) {
          let _index = this.loadedSubDocList.findIndex(
            v => v.id == contentList[i].id
          )
          this.loadedSubDocList.splice(_index, 1)
          pgEditor.pgEditorInstance.postmessage({
            type: 'CloseDocByDocId',
            param: [contentList[i].id]
          })
          await this.insertSubDocsAction(contentList[i])
          //设置病历的状态
          this.tagImageByClinicalnoteStatus(contentList[i].id)
        }
        this.setCurrentSubDocActive()
      } else {
        this.handleLoadClinicalnoteContentAction()
      }
    },
    handleRefreshClinicalnoteContent: debounce(function () {
      const pgEditor = this.getEditor()
      let unsavedList = pgEditor?.pgEditorInstance.postmessage({
        type: 'DocHasChanged',
        param: []
      })
      if (this.clinicalnoteData.serial) {
        for (let i = 0; i < unsavedList.length; i++) {
          let jurisdiction = this.loadedSubDocList
            .find(item => item.id == unsavedList[i].docId)
            ?.permission.permissionVOList?.some(
              item =>
                item.appPermissionId ==
                this.operationActionPermisstionIds.SNASER && item.enabled
            )
          if (!jurisdiction) {
            unsavedList.splice(i, 1)
            i--
          }
        }
      }
      if (unsavedList.length) {
        this.$confirm(
          '直接刷新会导致未保存的病历内容丢失，请先保存后再刷新！',
          '提示',
          {
            confirmButtonText: '保存并刷新',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
          .then(async () => {
            try {
              for (let i = 0; i < unsavedList.length; i++) {
                await this.sendingDataSourceInformation(
                  this.clinicalnoteData.serial,
                  unsavedList[i].docId
                ) //其他数据源信息
                await this.updateBasicData() //更新患者基础数据
                await this.saveClinicalnoteContentAsync(
                  false,
                  unsavedList[i].docId
                )
              }
              this.updateSetIdList = []
              this.refreshClinicalnoteContentAction()
            } catch (e) {
              //区别取消病历刷新和刷新失败
              this.$message({
                type: 'error',
                message: e
              })
            }
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消病历刷新'
            })
          })
      } else {
        this.refreshClinicalnoteContentAction()
      }
    }, 1000),
    refreshClinicalnoteContentAction() {
      //先切编辑模式
      const pgEditor = this.getEditor()
      pgEditor.switchContentRenderMode(DcEditorRenderModes.SET_WORK_MODE_APP)
      if (this.clinicalnoteData.serial) {
        //清空病程
        pgEditor.pgEditorInstance.postmessage({
          type: 'CloseDocs',
          param: ''
        })
        this.clinicalnoteData.content.list = []
        this.handleLoadClinicalnoteListAction(this.currentDocId)
      } else {
        this.handleLoadClinicalnoteContentAction()
      }
    },
    ...componentsMapMutations([
      'modifyClinicalnoteDataById',
      'showClinicalnoteLoading'
    ])
  }
}

export default refreshClinicalnoteMixin
