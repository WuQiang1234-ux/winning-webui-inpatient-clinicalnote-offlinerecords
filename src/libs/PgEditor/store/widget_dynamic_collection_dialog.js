const store = {
  state: {
    currentSelectedIndex: 0, // 鼠标滑动，当前显示的数据
    dynamicCollectionData: [], // 弹出框显示的数据
    innerMultiSelect: false, // 单选or多选
    collectionPosition: {
      top: 0,
      left: 0
    },
    isDisableBeforeArrowKeydown: true, // 自研编辑器键盘上下键是否能用，false不能；true能
    isDisableBeforeEnterKeydown: true // 自研编辑器键盘enter键是否能用，false不能；true能
  }
}

export default store
