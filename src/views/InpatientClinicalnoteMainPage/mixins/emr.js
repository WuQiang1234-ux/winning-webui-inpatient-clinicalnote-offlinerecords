let mixin = {
  props: {},
  data() {
    return {
      emrCreateDialogData: {
        isShow: false,
        data: {
          defaultTemplateClassId: '', //打开弹窗左边列表默认选中项id
        },
      },
    }
  },
  computed: {},
  mounted() {},
  methods: {
    showEmrCreateDialog(payload) {
      Object.assign(this.emrCreateDialogData, {
        isShow: true,
        data: payload,
      })
    },
    hideEmrCreateDialog() {
      this.emrCreateDialogData = {
        isShow: false,
        data: { defaultTemplateClassId: '' },
      }
    },
  },
}
export default mixin
