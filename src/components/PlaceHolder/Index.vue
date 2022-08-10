<template>
  <div :class="$style.box">
    <win-pic :pic="pic" width="200px" :text="text" />
  </div>
</template>

<script>
export default {
  name: 'PlaceHolder',
  props: {
    pic: {
      type: String,
      default: 'no_information'
    },
    text: {
      type: String,
      default: '数据为空...'
    }
  }
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
