<template>
  <div class="deleteDialog">
    <el-dialog
      :modal-append-to-body="false"
      title="提示"
      :visible="deleteEditorVisible"
      width="50%"
      center
      :show-close="false"
      close="$emit('update:deleteEditorVisible',false)"
    >
      <span>{{ deleteEditorName }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deleteEditorAffirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers, mapState } from 'vuex'
import getEventHubHelper, {
  createEventKeyWithNamespace,
} from '@/utils/event_hub_helper.js'
const createEventKey = createEventKeyWithNamespace(
  'INPATIENT_CLINICALNOTE_EDITOR_EVENT'
)
export const ClinicalnoteEditorEventKeys = {
  HANDLE_CLOSE_CLINICALNOTE: createEventKey('HANDLE_CLOSE_CLINICALNOTE'),
}
const { mapState: componentsMapStates, mapMutations: componentsMapMutations } =
  createNamespacedHelpers('components/multiClinicalnoteBoardState')

export default {
  name: '',
  components: {},
  props: {
    documentUpdatePromptDialogVisible: Boolean,
    currentDocId: {
      type: String,
      default: '',
    },
    clinicalnoteData: {
      type: Object,
      default: () => ({}),
    },
    loadedSubDocList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      deleteEditorName: '', //当前删除的病历名称
      deleteEditorVisible: false,
      deleteData: {
        type: '',
        subDocId: '',
        id: '',
      },
    }
  },
  computed: {
    ...componentsMapStates([
      'currentActiveLoadedClinicalnote',
      'pgEditorCurrentInputInfo',
    ]),
    ...mapState([
      'qualityControlData',
      'currentPatientInfo',
      'userInfo',
      'orgInfo',
    ]),
  },
  watch: {},
  created() {
    this.eventHubHelper = getEventHubHelper(
      this.$patientRootComponentStore.state.eventHub
    )
  },
  mounted() {
    window.eventBus.$on('TASK_INFORM', this.tastInform)
  },
  beforeDestroy() {
    this.eventHubHelper.destroy()
    window.eventBus.$off('TASK_INFORM', this.tastInform)
  },
  methods: {
    ...componentsMapMutations(['showClinicalnoteProcessing']),
    async tastInform(res) {
      let data = JSON.parse(res.taskVariable)
      // window.eventBus.$emit('TASK_INFORM',{
      //   bizCode: 'CLI',
      //   msgDefNo: 'aaa',
      //   msgDefTypeCode: 0,
      //   sourceType: 'ZY_YSZ_CLI_ALL',
      //   taskVariable:'{"encounterId":"196667392143142912","inpatEmrSetId":"206559356732090368","inpatEmrTypeId":"121383422926546946","memo":"没开门吗"}'
      // })
      // window.eventBus.$emit('TASK_INFORM',{
      //   bizCode: 'CLI',
      //   msgDefNo: 'InpEmrSetReviewMessage',
      //   msgDefTypeCode: 0,
      //   sourceType: 'ZY_YSZ_CLI_ALL',
      //   taskVariable:'{"encounterId":"184791116019169280","inpatEmrSetId":"195988716403132417"}'
      // })
      await new Promise((res) => {
        setTimeout(() => {
          res()
        }, 1500)
      })
      if (res.msgDefNo == 'InpEmrSetReviewMessage') {
        if (data.command == 'del') {
          console.log('删除了', data)
          this.deleteContent(data)
        } else {
          this.updateContent(data)
          console.log('内容更新', data)
        }
      }
    },
    deleteEditorAffirm() {
      try {
        if (this.deleteData.type == 'serial') {
          //连续
          this.$parent.handleDeleteInSerialClinicalnote({
            id: this.deleteData.id,
            subDocId: this.deleteData.subDocId,
          })
        } else {
          this.eventHubHelper.emit(
            ClinicalnoteEditorEventKeys.HANDLE_CLOSE_CLINICALNOTE,
            this.deleteData.id,
            'delete'
          )
        }
      } finally {
        this.deleteEditorVisible = false
        this.deleteEditorName = ''
        this.updateCatalogue()
      }
    },
    updateCatalogue() {
      //刷新目录
      //重新获取树结构和时间轴结构列表
      if (this.activateMenu === 'emr_list') {
        this.$root.eventHub.$emit('clinicalnote/refreshTimeLineData')
      } else {
        this.$root.eventHub.$emit('clinicalnote/refreshTreeData')
      }
    },
    closeCaseHistory() {
      if (this.currentActiveLoadedClinicalnote.emrClass == 'emrSetSerial') {
        //连续的
        let subDocId =
          this.currentPatientInfo.encounterId +
          this.currentActiveLoadedClinicalnote.options.content.emrTypeId
        this.deleteData = {
          type: 'serial',
          subDocId: this.currentActiveLoadedClinicalnote.id,
          id: subDocId,
        }
      } else {
        //普通
        this.deleteData = {
          type: '',
          subDocId: this.currentActiveLoadedClinicalnote.id,
          id: this.currentActiveLoadedClinicalnote.id,
        }
      }
      this.deleteEditorAffirm()
      this.showClinicalnoteProcessing && this.showClinicalnoteProcessing(false)
      console.log(
        JSON.stringify(this.currentActiveLoadedClinicalnote),
        'lllllllllllllkkkkk'
      )
    },
    async updateContent(data) {
      // if (this.clinicalnoteData.serial) {
      //   let subdoc = this.loadedSubDocList.find(
      //     el => el.id == data.inpatEmrSetId
      //   )
      // if (subdoc && subdoc.inpatEmrRecordId !== data.inpatEmrRecordId && this.currentDocId !== data.inpatEmrSetId) {
      //   if (data.memo) {
      //     subdoc.permission = {
      //       editable: false
      //     }
      //     this.$message({
      //       message: data.memo,
      //       type: 'warning'
      //     })
      //   }
      // }
      // }
      //   let subdoc = this.loadedSubDocList.find(
      //     el => el.id == data.inpatEmrSetId
      //   )
      //   if (
      //     subdoc &&
      //     subdoc.permission.editable &&
      //     subdoc.inpatEmrRecordId !== data.inpatEmrRecordId
      //   ) {
      //     subdoc.permission = {
      //       editable: false,
      //       permissionVOList: []
      //     }
      //     if (this.currentDocId == data.inpatEmrSetId) {
      //       this.operationPermisstionData = {
      //         editable: false,
      //         permissionVOList: []
      //       }
      //     }
      //     if (data.memo) {
      //       this.$message({
      //         message: data.memo,
      //         type: 'warning'
      //       })
      //     }
      //   } else {
      //     return
      //   }
      // } else {

      if (this.currentDocId !== data.inpatEmrSetId) return

      if (
        this.clinicalnoteData.content.inpatEmrRecordId == data.inpatEmrRecordId
      )
        return
      // if (!this.operationPermisstionData.editable) return
      this.$emit('update:documentUpdatePromptDialogVisible', true)
      //   this.operationPermisstionData = {
      //     editable: false,
      //     permissionVOList: []
      //   }
      //   if (data.memo) {
      //     this.$message({
      //       message: data.memo,
      //       type: 'warning'
      //     })
      //   }
      // }
      // this.toolbarOptions.isRefresh = true
      // this.updateSetIdList.push(data.inpatEmrSetId)
      // console.log(this.clinicalnoteData)
    },
    deleteContent(data) {
      console.log('--->', data.operateBy, this.userInfo.employeeId)
      if (
        data.encounterId == this.currentPatientInfo.encounterId &&
        data.operateBy !== this.userInfo.employeeId
      ) {
        console.log('这个病历被删除了', data.inpatEmrSetId)
        if (
          this.clinicalnoteData.serial &&
          data.inpatEmrTypeId == '121383422926546946'
        ) {
          let _index = this.loadedSubDocList.findIndex((el) => {
            return el.id == data.inpatEmrSetId
          })
          if (_index >= 0) {
            this.deleteEditorName = data.memo
            this.deleteEditorVisible = true
            this.deleteData = {
              type: 'serial',
              subDocId: data.inpatEmrSetId,
              id: data.encounterId + data.inpatEmrTypeId,
            }
          }
        } else {
          //普通
          if (this.clinicalnoteData.content.emrSetId == data.inpatEmrSetId) {
            this.deleteEditorName = data.memo
            this.deleteEditorVisible = true
            this.deleteData = {
              type: '',
              subDocId: data.inpatEmrSetId,
              id: data.inpatEmrSetId,
            }
          }
        }
      }
    },
  },
}
</script>

<style scoped lang="scss"></style>
