<template>
  <el-tooltip
    v-if="disabled"
    :disabled="!promptText"
    :content="promptText"
    effect="dark"
    placement="top"
  >
    <el-button class="isDisableBtnById">{{ buttonName }}</el-button>
  </el-tooltip>
  <el-button v-else :type="type" @click="buttonClick">{{ buttonName }}</el-button>
</template>

<script>
// import { apiQueryPrompt } from '@/api/navigate'
export default {
  name: 'EditorButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    operationActionPermisstionId: {
      type: String,
      default: '',
    },
    emrSetId: {
      type: String,
      default: '',
    },
    buttonName: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      promptText: '',
    }
  },
  mounted() {
    this.disabled && this.enterButton()
  },
  methods: {
    enterButton() {
      // apiQueryPrompt({
      //   command: +this.operationActionPermisstionId,
      //   inpatientEmrSetId: this.emrSetId
      // })
      //   .then(res => {
      //     this.promptText = res.data.returnMsg
      //   })
      //   .catch(() => {
      //     this.promptText = ''
      //   })
    },
    buttonClick() {
      this.$emit('buttonClick', this)
    },
  },
}
</script>
