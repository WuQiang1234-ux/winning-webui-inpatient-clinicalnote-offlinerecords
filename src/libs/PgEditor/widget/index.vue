<template>
  <div
    v-show="contextMenuData.isShow"
    :class="classNames.editorContextMenuWrap"
    :style="{
      left: contextMenuData.position.left + 'px',
      top: contextMenuData.position.top + 'px'
    }"
  >
    <ul>
      <li
        v-for="(item, index) in contextMenuOptions.content"
        :key="item.name"
        @mousedown.prevent.stop="
          () => {
            contextMenuData.isShow = false
            item.action()
          }
        "
      >{{ index + 1 }}.{{ item.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'DcEditor',
  components: {},
  props: {
    contextMenuOptions: {
      type: Object,
      default: function() {
        return {
          isShow: true
        }
      }
    }
  },
  data() {
    return {
      contextMenuData: {
        isShow: false,
        position: {
          left: 0,
          top: 0
        }
      }
    }
  },
  computed: {
    classNames() {
      return {
        editorContextMenuWrap: `${this.classNamespace}-context-menu-wrap`
      }
    }
  },
  created() {
    // todo
  },
  mounted() {
    //
  },
  methods: {
    refreshContextMenu(e) {
      console.log('更新菜单 -------', e)
      if (e.button === 2) {
        //鼠标右键
        this.showContextMenu(true)
        this.calcContextMenuPosition({
          left: e.clientX + 5,
          top: e.clientY + 5
        })
      } else {
        this.showContextMenu(false)
      }
    },
    showContextMenu(flag) {
      this.contextMenuData.isShow = flag
    },
    calcContextMenuPosition(position) {
      this.contextMenuData.position = position
    }
  }
}
</script>

<style lang="scss" scoped>
$classNamespace: 'dc-editor';

.#{$classNamespace}-context-menu-wrap {
  background-color: #ffffff;
  border: 1px solid grey;
  font-size: 14px;
  left: 0;
  top: 0;
  position: absolute;
  z-index: 1;

  > ul {
    height: auto;
    list-style: none;
    margin: 0 0;
    padding: 0 0;
    width: 100%;

    > li {
      border-bottom: 1px solid grey;
      cursor: pointer;
      height: 32px;
      line-height: 32px;
      padding: 0 20px;
      width: 100%;

      &:last-child {
        border-bottom: none;
      }
      &:hover {
        color: #2d5afa;
        background-color: #f8f8f8;
      }
    }
  }
}
</style>
