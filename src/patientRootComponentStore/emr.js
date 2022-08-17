export default function () {
  return {
    namespaced: true,
    state: {
      emrCreateDialogData: {
        isShow: false,
        data: {
          defaultTemplateClassId: '', //打开弹窗左边列表默认选中项id
        },
      },
    },
    mutations: {
      showEmrCreateDialog(store, payload) {
        Object.assign(store.emrCreateDialogData, {
          isShow: true,
          data: payload,
        })
      },
      hideEmrCreateDialog(store) {
        store.emrCreateDialogData = {
          isShow: false,
          data: { defaultTemplateClassId: '' },
        }
      },
    },
  }
}
