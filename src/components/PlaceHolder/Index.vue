<template>
  <div :class="$style.box">
    <!-- <el-empty :description="text"></el-empty> -->
    <el-empty description="描述文字"></el-empty>
  </div>
</template>

<script>
export default {
  name: 'PlaceHolder',
  props: {
    // pic: {
    //   type: String,
    //   default: 'no_information'
    // },
    text: {
      type: String,
      default: '数据为空...',
    },
  },
}
</script>

<style module lang="scss">
.box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 20px;
  overflow: hidden;
  background: #fff;
}
.text {
  margin-top: 15px;
}
</style>
