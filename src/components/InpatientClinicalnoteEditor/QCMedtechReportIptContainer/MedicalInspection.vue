<template>
  <div class="medical-inspection-wrap pub-auxiliary-wrap">
    <section class="pub-auxiliary-content">
      <!--表格-->
      <el-table
        v-loading="isLoadingData"
        :data="tableData"
        highlight-current-row
        border
        stripe
        @row-click="handleClickCurrentRow"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="publishedDate" min-width="180px" label="发布日期" show-overflow-tooltip></el-table-column>
        <el-table-column min-width="120px" label="报告名称" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.reportName }}</template>
        </el-table-column>
        <el-table-column
          prop="reportStatusDesc"
          min-width="120px"
          label="检查报告状态"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column min-width="200px" label="检查报告单号" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.medtechRptId }}</template>
        </el-table-column>
      </el-table>
      <div v-show="showDetail" class="table-box">
        <el-form label-width="90px">
          <el-form-item label="检查部位">
            <el-input v-model="currentRow.examPosition" size="small"></el-input>
          </el-form-item>
          <el-form-item label="检查所见">
            <el-input v-model="currentRow.examFindings" type="textarea" :rows="5"></el-input>
          </el-form-item>
          <el-form-item label="检查结果">
            <el-input v-model="currentRow.examResult" type="textarea" :rows="5"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiQueryMedicalInspectionList } from '@/api/tools.js'
export default {
  name: 'QCMedicalInspection',
  data() {
    return {
      tableData: [],
      currentRow: {},
      timeLineData: {},
      showDetail: false,
      isLoadingData: false,
      tableSelections: []
    }
  },
  computed: {
    ...mapState(['currentPatientInfo'])
  },
  mounted() {
    this.getMedicalInspectionList()
  },
  methods: {
    //获取检查列表信息
    getMedicalInspectionList() {
      this.isLoadingData = true

      this.showDetail = false

      let params = {
        encounterId: this.currentPatientInfo.encounterId,
        bizRoleId: this.currentPatientInfo.bizRoleId,
        day: 0,
        encounterTypeCodes: ['145235', '138138']
      }
      apiQueryMedicalInspectionList(params)
        .then(res => {
          this.isLoadingData = false
          if (res.success) {
            this.tableData =
              res.data.map(v => {
                v.isChecked = false
                v.hasLoadDetail = false
                v.showNewDetail = false
                if (v.publishedDate) {
                  let dateStr = v.publishedDate.split(' ')
                  v.date = dateStr[0]
                  v.time = dateStr[1]
                }
                return v
              }) || []
            this.timeLineData = {}
            this.tableData.forEach(v => {
              if (this.timeLineData?.[v.date]) {
                this.timeLineData[v.date].push(v)
              } else {
                this.timeLineData[v.date] = [v]
              }
            })
          }
        })
        .catch(() => {
          this.isLoadingData = false
        })
    },

    //点击当前行
    handleClickCurrentRow(row) {
      this.currentRow = row.reportResult || {}
      this.showDetail = true
    },

    async handleSelectionChange(rowList) {
      this.tableSelections = rowList
    }
  }
}
</script>

<style lang="scss" scoped>
.medical-inspection-wrap {
  padding: 0px 16px;
  .card-container {
    height: 100%;
    width: 100%;
  }
  .footer {
    border-top: 1px solid #d7dbea;
    padding: 8px 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .noData {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
  }
  .nursingInfoItem {
    // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    /deep/.el-row {
      position: relative;
      padding: 30px 16px 8px 16px;
      line-height: 2;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      .el-col-20 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      & + .el-row {
        margin-top: 10px;
      }
      .card-detail {
        border-top: 1px solid #ddd;
      }
      .font-bold {
        float: left;
        font-weight: bold;
        max-width: calc(100% - 50px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .reportStatusDesc {
        font-size: 12px;
        margin-left: 5px;
      }
      .time-tag {
        position: absolute;
        left: 0;
        top: 0;
        border-radius: 0;
        font-size: 12px;
        padding: 0 8px;
        border-top-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }

      .el-checkbox {
        position: absolute;
        left: -31px;
        top: -5px;
      }
    }
  }
  .pub-auxiliary-header {
    display: flex;
    justify-content: space-between;
    .right {
      margin-right: 40px;
    }
    .pre-icon {
      font-size: 18px;
      color: gray;
      cursor: pointer;
    }
    .icon-active {
      color: var(--COLOR-NORMAL);
    }
  }
  .pub-auxiliary-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    /deep/.el-table {
      flex: 1 1 auto;
      height: calc(100% - 422px);
      min-height: 300px;
      .el-table__body-wrapper {
        overflow: auto;
        height: calc(100% - 41px);
      }
    }
    /deep/.el-timeline .el-timeline-item:last-child .el-timeline-item__tail {
      display: block;
    }

    /deep/ .el-timeline-item__tail {
      border-left: 1px dashed #c9c9c9;
      left: 7px;
    }
    /deep/ .el-col-8 {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /deep/.el-timeline-item__node--normal {
      left: 3px;
      width: 8px;
      height: 8px;
    }
  }

  /deep/ .el-checkbox__input {
    zoom: 130%;
  }
  .allChecked {
    position: absolute;
    left: 10px;
    color: #2d5afa;
    margin-top: 5px;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .search-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 5px 0;
    .ml20 {
      margin-left: 20px;
      &:first-child {
        margin-left: 0;
      }
    }
  }
  .table-box {
    flex: 0 1 auto;
    // height: 370px;
    padding: 8px;
    box-sizing: border-box;
    overflow: auto;

    /deep/ .el-form {
      margin-bottom: -20px;
    }
  }
  .el-button--small {
    padding: 9px 30px;
    font-size: 12px;
    border-radius: 3px;
  }
}
</style>
