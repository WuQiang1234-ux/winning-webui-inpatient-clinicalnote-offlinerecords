<template>
  <div>
    {{$route.fullPath}}
    <el-button @click="aaa">调用打印程序</el-button>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {
    console.log('实例化了')
  },
  activated() {
    console.log('activated')
  },
  mounted() {},
  methods: {
    aaa() {
      window.winning?.inpreport?.inpEmrPrint()
    },
  },
}
</script>

<style scoped lang="scss">
</style>
