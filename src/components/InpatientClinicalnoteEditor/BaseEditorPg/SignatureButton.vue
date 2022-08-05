<template>
  <el-popover
    v-if="hasSignature && !isDisabled"
    placement="top"
    title="签名"
    trigger="click"
    popper-class="signaturePopover"
  >
    <article>
      <header>确认您的姓名和工号</header>
      <div v-loading="signatureLoading" class="signatureInfo">
        <img :src="userSignaturePicture" />
        {{ userNo }}
      </div>
      <!-- 只有提交动作才显示签名日期 -->
      <div v-if="hasSignTimeCpt" class="signTime">
        <label>签名日期</label>
        <el-date-picker
          v-model="signTime"
          type="datetime"
          size="mini"
          placeholder="请选择签名日期"
          format="yyyy-MM-dd HH:mm"
        ></el-date-picker>
      </div>
      <div class="btns">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button type="primary" size="small" @click="handleConfirm">签名</el-button>
      </div>
    </article>
    <span slot="reference">
      <editorButton v-bind="$attrs" @buttonClick="handleShow"></editorButton>
    </span>
  </el-popover>
  <editorButton v-else v-bind="$attrs" @buttonClick="$emit('confirm')"></editorButton>
</template>
<script>
import dayjs from 'dayjs'
import { mapState, createNamespacedHelpers } from 'vuex'
import editorButton from '../../EditorButton/index'
import { isDraftStatus } from './utils'
const {
  mapState: globalConfigMapStates,
  mapActions: globalConfigActions
} = createNamespacedHelpers('globalConfig')

import { DataElementWinIds } from '@/libs/PgEditor/constants'
export default {
  name: 'SignatureButton',
  components: { editorButton },
  inheritAttrs: false,
  props: {
    hasSignature: {
      type: Boolean,
      default: true
    }
    // emrSetId: {
    //   type: String,
    //   default: ''
    // }
  },
  data() {
    return {
      userSignaturePicture: '',
      signatureLoading: false,
      isDisabled: false,
      signTime: new Date(),
      hasSignTimeCpt: false
    }
  },
  computed: {
    ...mapState(['userInfo']),
    ...globalConfigMapStates(['doctorSignature']),
    userNo() {
      return this.userInfo.employeeNo
    },
    userName() {
      return this.userInfo.employeeName
    }
  },
  mounted() {
    this.isDisabled = this.$attrs.disabled ?? false
  },
  methods: {
    ...globalConfigActions(['getDoctorSignature']),
    async handleShow() {
      this.loadingUserSignaturePicture()
      this.setSignTimeVisibility()
    },
    async loadingUserSignaturePicture() {
      if (this.userSignaturePicture) return
      this.signatureLoading = true
      if (!this.doctorSignature) {
        await this.getDoctorSignature()
      }
      this.userSignaturePicture = this.doctorSignature.baseUrl
      this.signatureLoading = false
    },
    setSignTimeVisibility() {
      let p_this = this.$parent
      let {
        content: { inpatEmrSetStatusCode }
      } = p_this.clinicalnoteData
      //只有提交动作才显示签名日期
      if (isDraftStatus(inpatEmrSetStatusCode)) {
        const pgEditor = p_this.getEditor()

        this.hasSignTimeCpt = pgEditor.signatureHelper.isNeedsSignature(
          this.$attrs.emrSetId,
          DataElementWinIds.SIGNATURE_DATETIME //医师签名时间
        )

        //取病历内容里面填充的签名时间为默认值
        if (this.hasSignTimeCpt) {
          let _value = pgEditor.pgEditorInstance.postmessage({
            type: 'GetValue',
            param: {
              docId: this.$attrs.emrSetId,
              conceptId: DataElementWinIds.SIGNATURE_DATETIME,
              valueTarget: 'onlyDataElement'
            }
          })

          //重置默认时间
          if (_value?.length && _value[0].DateTimeValue) {
            this.signTime = _value[0].DateTimeValue
          } else {
            this.signTime = new Date()
          }
        }
      }
    },
    handleCancel() {
      this.$children[0].doClose()
    },
    handleConfirm() {
      this.$children[0].doClose()
      this.$emit('confirm', {
        signTime: this.hasSignTimeCpt
          ? dayjs(this.signTime).format('YYYY-MM-DD HH:mm:ss')
          : ''
      })
    }
  }
}
</script>
<style lang="scss">
.el-popover.signaturePopover {
  min-width: 240px;
}
</style>
<style lang="scss" scoped>
article {
  display: flex;
  flex-direction: column;

  & > div {
    display: flex;
    margin-top: 8px;
  }
  .signatureInfo {
    align-items: center;
    img {
      margin-right: 20px;
      height: 30px;
      max-height: 30px;
      width: auto;
    }
  }

  .signTime {
    label {
      margin-right: 8px;
    }
  }

  .btns {
    justify-content: flex-end;
  }
}
</style>
