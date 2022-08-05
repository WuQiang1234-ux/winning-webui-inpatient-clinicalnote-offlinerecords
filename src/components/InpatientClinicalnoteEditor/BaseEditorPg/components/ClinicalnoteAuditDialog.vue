<template>
  <div class="deleteDialog">
    <el-dialog
      :modal-append-to-body="false"
      :title="title"
      :visible="visible"
      width="50%"
      left
      :show-close="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="审核操作：" v-if="formItemFlag" prop="resource">
          <el-radio-group v-model="form.aa">
            <el-radio label="通过"></el-radio>
            <!-- <el-radio label="不通过"></el-radio> -->
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见：">
          <el-input type="textarea" v-model="form.feedbackContent"></el-input>
        </el-form-item>
        <el-form-item prop="scheduleReviewAt" v-if="formItemFlag" label="拟会诊时间：">
          <el-date-picker
            v-model="form.scheduleReviewAt"
            :picker-options="option"
            type="datetime"
            size="small"
            placeholder="选择拟会诊时间"
          ></el-date-picker>
        </el-form-item>
        <div
          v-if="consultApplyConfirmAt"
          style="text-indent:12px;"
        >会诊确认时间： {{consultApplyConfirmAt}}</div>

        <el-form-item>
          <div style="text-align:right">
            <el-button @click="visible=false">取消</el-button>
            <el-button type="primary" @click="onSubmit" :loading="affirmLoading">确认</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import apiConsultation from '@/api/dailyManager/consultation.js'
// CONSULT_CONFIRM(977584L, "会诊确认"),——科主任(才有)
// CONSULT_SCHEDULE(977585L, "会诊调度"),——医务处（才有）
export default {
  name: '',
  components: {},
  props: {
    obtainApplicationForConsultation: {
      type: Object
    }
  },
  data() {
    return {
      visible: false,
      affirmLoading: false,
      title: '审核调度',
      form: {
        feedbackContent: '通过',
        scheduleReviewAt: null,
        aa: '通过'
      },
      option: {
        disabledDate: time => {
          return time.getTime() < Date.now() - 1 * 24 * 3600 * 1000
        }
      },
      rules: {
        scheduleReviewAt: [
          { required: true, message: '请选择拟会诊时间', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    formItemFlag() {
      return this.title == '审核调度'
    }
  },
  watch: {},
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    openInit(data, dispatchCallBack, affirmCallBack) {
      let { name, scheduleReviewAt, consultApplyConfirmAt } = data
      this.form.scheduleReviewAt =
        scheduleReviewAt &&
        dayjs(scheduleReviewAt).format('YYYY-MM-DD HH:mm:ss')
      this.consultApplyConfirmAt = consultApplyConfirmAt
      this.title = name
      if (name == '审核确认') {
        this.form.feedbackContent = ''
      }
      this.dispatchCallBack = dispatchCallBack
      this.affirmCallBack = affirmCallBack
      this.visible = true
    },
    onSubmit() {
      this.$refs.form.validate(async valid => {
        let {
          applyInfo: { inpConsultApplyId }
        } = this.obtainApplicationForConsultation
        if (valid) {
          try {
            this.affirmLoading = true
            if (this.title == '审核调度') {
              let res = await apiConsultation.addReviewConsultation({
                scheduleReviewAt: dayjs(this.form.scheduleReviewAt).format(
                  'YYYY-MM-DD HH:mm:ss'
                ),
                inpConsultApplyId, //住院会诊申请标识
                scheduleReviewOpinion: this.form.feedbackContent
              })
              if (res && res.success) {
                this.dispatchCallBack &&
                  (await this.dispatchCallBack(
                    this.form.scheduleReviewAt,
                    this.form.feedbackContent
                  ))
                this.visible = false
              }
            } else {
              //确认会诊申请单  非医务处
              let res = await apiConsultation.confirmConsultation({
                inpConsultApplyId, //住院会诊申请标识
                scheduleReviewOpinion: this.form.feedbackContent
              })

              if (res && res.success) {
                this.affirmCallBack &&
                  (await this.affirmCallBack(this.form.feedbackContent))
                this.visible = false
              }
            }
          } finally {
            this.affirmLoading = false
          }
          // console.log(this.form)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.el-date-editor--datetime,
.el-select {
  width: 100%;
}
</style>
