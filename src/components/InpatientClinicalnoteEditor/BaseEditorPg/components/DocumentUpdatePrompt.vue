<template>
  <el-dialog
    title="提示"
    :visible.sync="visible"
    width="620px"
    :modal="false"
    :append-to-body="true"
    :before-close="handleClose"
    top="35vh"
    @open="open"
  >
    <span>
      您正在编辑的
      {{ emrSetTitle }}
      内容已经发生了变更，更新最新的病历内容后才能继续编辑
    </span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="getNewDoc">获取更新</el-button>
      <el-button type="primary" @click="coverNewDoc">直接覆盖</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapState: componentsMapStates } = createNamespacedHelpers(
  'components/multiClinicalnoteBoardState'
)
export default {
  name: 'DocumentUpDatePrompt',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    emrSetTitle: {
      type: String,
      default: '病历'
    },
    emrSetId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {}
  },
  computed: {
    ...componentsMapStates([
      // 'currentActiveLoadedClinicalnote',
      'pgEditorCurrentInputInfo'
    ]),
    documentUpdatePromptDialogVisible: {
      get() {
        return this.documentUpdatePromptDialogVisible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
    // emrSetId() {
    //   return this.currentActiveLoadedClinicalnote.options.content.emrSetId
    // }
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.documentUpdatePromptDialogVisible = false
    },
    open() {
      console.log(this.currentActiveLoadedClinicalnote)
    },
    getNewDoc() {
      if (this.$parent.clinicalnoteData.serial) {
        let emrSetId = this.emrSetId
        //删除
        this.$parent.pgEditor.pgEditorInstance.postmessage({
          type: 'CloseDocByDocId',
          param: [emrSetId]
        })
        this.$parent.clinicalnoteData.content.list.forEach((el, i) => {
          if (el.id == emrSetId) {
            this.$parent.clinicalnoteData.content.list.splice(i, 1)
          }
        })
        this.$parent.handleLoadClinicalnoteListAction(emrSetId)
      } else {
        this.$parent.handleLoadClinicalnoteContentAction()
      }
      this.documentUpdatePromptDialogVisible = false
    },
    async coverNewDoc() {
      let {
        inpatEmrRecordId,
        emrSetId
      } = await this.$parent.getNormalClinicalnoteContent(this.emrSetId)
      this.$parent.upDateVersion({
        data: {
          inpatEmrRecordId,
          inpatEmrSetId: emrSetId
        }
      })
      console.log('直接覆蓋', inpatEmrRecordId)
      this.documentUpdatePromptDialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss"></style>
