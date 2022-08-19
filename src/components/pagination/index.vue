<!--
 * @Descripttion: 
 * @version: 
 * @Author: gaolongzhi
 * @Date: 2020-07-01 16:14:06
 * @LastEditors: gaolongzhi
 * @LastEditTime: 2020-09-28 10:10:57
-->
<template>
  <div v-show="!listLoading" class="inpatient-pagination">
    <el-pagination
      background
      :current-page.sync="dataCurrentPage"
      :total="total"
      :page-sizes="pageSizes"
      :page-size="dataPageSize"
      :layout="layout"
      :pager-count="pagerCount"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  name: 'InparientPagination',
  props: {
    listLoading: {
      type: Boolean,
      default: true
    },
    total: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageSizes: {
      type: Array,
      default: function() {
        return [5, 10, 15, 20, 25, 30, 50]
      }
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    pagerCount: {
      type: Number,
      default: 9
    }
  },
  data() {
    return {
      dataPageSize: this.pageSize
    }
  },
  computed: {
    dataCurrentPage: {
      get: function() {
        return this.currentPage + 1
      },
      set: function() {}
    }
  },
  methods: {
    handleSizeChange(val) {
      this.dataPageSize = val
      this.$emit('setLimit', val)
      this.$emit('setPage', 0)
      this.$emit('getList')
    },
    handleCurrentChange(val) {
      this.dataCurrentPage = val
      this.$emit('setPage', val - 1) //本平台起始下标为0，故减1
      this.$emit('getList')
    }
  }
}
</script>
<style lang="scss" scoped>
.inpatient-pagination {
  height: 40px;
  padding-top: 8px;
  flex: 0 0 auto;
  text-align: right;
}
</style>
