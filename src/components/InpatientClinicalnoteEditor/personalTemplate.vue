<template>
  <div v-loading="clinicalnoteData.loading" class="inpatient-clinicalnote-editor-area 444">
    <div ref="editorContainer" class="inpatient-clinicalnote-editor-wrap">
      <PgEditor
        ref="pgEditorDom"
        :patientInfo="currentPatientInfo"
        :toolbarOptions="toolbarOptions"
        :personalTemplateRightMenuFlag="personalTemplateRightMenuFlag"
        :editorOptions="{
          ContentRenderMode:
            clinicalnoteData.content.temPlateType == 'maintenance'
              ? DcEditorRenderModes.SET_WORK_MODE_APP
              : DcEditorRenderModes.SET_PRINT_PREVIEW
        }"
        :parameterConfiguration="{
          inpatEmrSetId: clinicalnoteData.content.emrSetId
        }"
      />
    </div>

    <div v-if="clinicalnoteData.content.temPlateType == 'review'" class="personTemplate-footer">
      <div></div>
      <div>
        <el-button
          :disabled="clinicalnoteDataCopy.reviewedStatusCode == '399557277'"
          @click="handleReviewBack(399557277)"
        >审核退回</el-button>
        <el-button
          :disabled="clinicalnoteDataCopy.reviewedStatusCode != '399557275'"
          type="primary"
          @click="handleReviewOption(399557276)"
        >审核通过</el-button>
      </div>
      <el-dialog
        title="退回原因"
        :visible.sync="recallReasonVisible"
        append-to-body
        top="20%"
        width="50%"
        :before-close="handleClose"
      >
        <span>
          <el-input v-model="recallReason" type="textarea" :rows="5" placeholder="请输入内容"></el-input>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="recallReasonVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleReviewBackSure(399557277)">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- <div :class="classNames.EditorOperation"></div> -->
  </div>
</template>
<script>
// import PgEditor from '../../libs/PgEditor'
import PgEditor from '../../libs/PgEditor'
import { EditorEvent, DcEditorRenderModes } from '@/libs/PgEditor/constants'
import { mapState } from 'vuex'
import apiPersonalTemplate from '@/api/dailyManager/personalTemplate'
import { compress, decompress } from './BaseEditorPg/utils'
export * from './BaseEditorPg'

export default {
  name: 'ReadonlyEditor',
  components: { PgEditor },
  props: {
    id: {
      type: String,
      default: function() {
        return +Date.now() + ''
      }
    },
    clinicalnoteData: {
      type: Object,
      default: function() {
        return {
          serial: false, //是否为病程
          content: {
            hasContent: true, //新建状态 还没提交或暂存过

            emrSetId: '', //当前正在处理的病历id

            //普通病历
            xml: '',

            //连续病程
            list: [], //  emrSetId, emrSetTitle, xml

            emrTypeId: '', //病历分类id
            emrSetTitle: '', //病历标题
            emrStatusCode: '', //病历状态 用来设置病历状态图标
            modifiedAt: 0, //病历最后修改时间

            inpMrtMonitorId: '' //病历模板监控类型
          }
        }
      }
    }
  },
  // extends: pgBaseEditor,
  data() {
    return {
      personalTemplateRightMenuFlag: true,
      dialogVisible: false,
      recallReasonVisible: false,
      recallReason: '',
      toolbarOptions: {},
      clinicalnoteDataCopy: {},
      DcEditorRenderModes
    }
  },
  computed: {
    ...mapState(['currentPatientInfo', 'userInfo', 'orgInfo'])
  },
  watch: {
    clinicalnoteData(newVal) {
      console.log(999)
      console.log(newVal)
      this.clinicalnoteDataCopy = newVal.content.data
    }
  },
  mounted() {
    console.log(this.clinicalnoteData)

    this.clinicalnoteDataCopy = this.clinicalnoteData.content.data
    if (this.clinicalnoteData.content.temPlateType == 'maintenance') {
      this.toolbarOptions = {
        isShowDiagnosisTool: false,
        isShowPrint: false,
        isShowSpecialSymbol: false, //是否显示特殊符号
        isShowMedicalFormula: false //是否显示医学公式
      }
    } else {
      this.toolbarOptions = { isShow: false }
    }

    const pgEditor = this.getEditor()

    pgEditor.eventEmitter.$on(EditorEvent.PG_EVENT_PAGE_ONLOAD, async () => {
      this.loadXml()
    })
  },
  methods: {
    getEditor() {
      return this.$refs.pgEditorDom
    },
    async loadXml() {
      let params = {
        emrTemplatePersonalId: this.id
      }
      const pgEditor = this.getEditor()
      apiPersonalTemplate.queryPersonalTemplateContent(params).then(res => {
        if (res.success) {
          const xml = decompress(res.data.emrMrtContentData)
          pgEditor.loadDocument(xml)
        }
      })
    },
    // controlSerialClinicalnoteContentStateAsync() {
    //   console.log(666)
    //   const pgEditor = this.getEditor()
    //   pgEditor.pgEditorInstance.postmessage({
    //     type: 'SetEditableByDocId',
    //     param: [
    //       {
    //         docId: this.id,
    //         isEditable: false
    //       }
    //     ]
    //   })
    // },

    handleSubmitReview() {
      const { content } = this.clinicalnoteData
      apiPersonalTemplate
        .personalTemplateSubmit({
          reviewedStatusCode: 399557275,
          emrTemplatePersonalIds: [content.data.emrTemplatePersonalId]
        })
        .then(res => {
          if (res && res.success) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.clinicalnoteDataCopy.reviewedStatusCode = '399557275'
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleSubmitReviewCancel() {
      const { content } = this.clinicalnoteData
      apiPersonalTemplate
        .personalTemplateSubmit({
          reviewedStatusCode: 399557274,
          emrTemplatePersonalIds: [content.data.emrTemplatePersonalId]
        })
        .then(res => {
          if (res && res.success) {
            this.$message({
              message: '操作成功',
              type: 'success'
            })

            this.clinicalnoteDataCopy.reviewedStatusCode = '399557274'
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    //保存病历模板
    saveTemplate() {
      this.saveLoading = true
      const pgEditor = this.getEditor()
      const xml = pgEditor.getDocumentContent()
      const emrMrtContentData = compress(xml)
      const { content } = this.clinicalnoteData
      console.log(content)
      let params = {
        emrTemplatePersonalId: content.data.emrTemplatePersonalId,
        emrTemplatePersonalTagId: content.data.emrTemplatePersonalTagId,
        inpEmrClassId: content.data.inpEmrClassId,
        emrMrtContentData
      }
      apiPersonalTemplate.savePersonalTemplateContent(params).then(res => {
        if (res.success) {
          this.saveLoading = false
          this.$message({
            message: '模板保存成功！',
            type: 'success'
          })
        }
      })
    },

    templateRecallReason() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.recallReasonVisible = false
    },
    handleReviewBack() {
      this.recallReasonVisible = true
    },
    handleReviewBackSure(val) {
      this.recallReasonVisible = false

      const { content } = this.clinicalnoteData
      let params = {
        emrTemplatePersonalIds: [content.data.emrTemplatePersonalId],
        reviewedStatusCode: val,
        recallReason: this.recallReason
      }
      apiPersonalTemplate.personalTemplateSubmit(params).then(res => {
        console.log(res)
        if (res.success) {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.clinicalnoteDataCopy.reviewedStatusCode = val
          this.getMyRecordTableList()
        }
      })
    },
    handleReviewOption(val) {
      const { content } = this.clinicalnoteData
      let params = {
        emrTemplatePersonalIds: [content.data.emrTemplatePersonalId],
        reviewedStatusCode: val
      }
      apiPersonalTemplate.personalTemplateSubmit(params).then(res => {
        console.log(res)
        if (res.success) {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.clinicalnoteDataCopy.reviewedStatusCode = val
          this.getMyRecordTableList()
        }
      })
    }
    // async handleLoadClinicalnoteContentAction() {
    //   await this.loadClinicalnoteXmlAsync() //加载
    //   this.pgControlClinicalnoteContentStateAsync()
    // },
    // pgControlClinicalnoteContentStateAsync() {
    //   const pgEditor = this.getEditor()
    //   pgEditor.switchContentRenderMode('SetWorkMode_KeepTrace')
    // }
  }
}
</script>

<style lang="scss" scoped>
$classNamespace: 'inpatient-clinicalnote-editor';
.#{$classNamespace}-area {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ececec;
  flex: 1 0 auto;

  .#{$classNamespace}-wrap {
    background-color: #ececec;
    flex: 1 0 auto;
    width: 100%;
    .no-clinicalnote-content {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 100%;
      width: 100%;

      > span {
        color: rgba(0, 0, 0, 0.2);
        display: inline;
        font-size: 36px;
        flex: 0 0 auto;
      }
    }
  }

  .#{$classNamespace}-operation {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    flex: 0 0 48px;
    box-sizing: border-box;
    background-color: white;
    border-top: 1px solid #c9c9c9;
    padding: 8px 8px;
    .isDisableBtnById {
      background-color: #e9e9e9;
      border-color: #c9c9c9;
      color: #999;
      cursor: no-drop;
    }
    .el-button {
      font-size: 14px;
      height: 32px;
      margin: 0 10px 0 0;
      padding: 0 25px;
    }
  }
}
.personTemplate-footer {
  display: flex;
  justify-content: space-between;
  height: 60px;
  align-items: center;
  padding: 0 20px;
  background: #fff;
}
</style>
