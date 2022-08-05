<template>
  <div class="medical-examination-wrap pub-auxiliary-wrap">
    <section class="pub-auxiliary-content-medical">
      <div class="search-box">
        <div class="radio-group-box">
          <span class="fontSize16">结果：</span>
          <el-checkbox-group
            v-model="labtestResultStatus"
            size="mini"
            @change="changeLabtestResultStatus"
          >
            <el-checkbox-button :label="1">全部</el-checkbox-button>
            <el-checkbox-button :label="377028">正常</el-checkbox-button>
            <el-checkbox-button :label="464932">异常</el-checkbox-button>
            <el-checkbox-button :label="377030">偏高</el-checkbox-button>
            <el-checkbox-button :label="377029">偏低</el-checkbox-button>
          </el-checkbox-group>
        </div>
      </div>

      <!--表格-->
      <el-table
        v-loading="isLoadingData"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="publishedDate" min-width="180px" label="发布日期" show-overflow-tooltip></el-table-column>
        <el-table-column prop="reportName" min-width="200px" label="报告名称" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.reportName || scope.row.extMedtechRptTypeName }}</template>
        </el-table-column>
        <el-table-column prop="sampleName" min-width="100px" label="样本" show-overflow-tooltip>
          <template slot-scope="scope">
            {{
            scope.row.sampleName
            ? scope.row.sampleName == 'null'
            ? ''
            : scope.row.sampleName
            : ''
            }}
          </template>
        </el-table-column>
        <el-table-column prop="checkDate" min-width="180px" label="送检日期" show-overflow-tooltip></el-table-column>
      </el-table>
      <el-table
        v-loading="tableDataDetailLoad"
        :data="tableDataDetail"
        border
        @select-all="selectAll"
        @select="selectHandel"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="labtestIndexName" min-width="150px" label="项目" show-overflow-tooltip></el-table-column>
        <el-table-column prop="labtestResult" label="结果" show-overflow-tooltip min-width="90px">
          <template slot-scope="scope">
            {{ scope.row.labtestResult }}
            <i
              v-if="scope.row.labtestResultStatusName == '偏高'"
              class="el-icon-top"
            ></i>
            <i v-else-if="scope.row.labtestResultStatusName == '偏低'" class="el-icon-bottom"></i>
          </template>
        </el-table-column>
        <el-table-column prop="labtestResultUnit" label="单位" show-overflow-tooltip min-width="90px"></el-table-column>
        <el-table-column
          prop="labtestResultStatusName"
          label="高低值"
          show-overflow-tooltip
          min-width="90px"
        ></el-table-column>
        <el-table-column prop="labtestRefValue" min-width="120px" label="参考值" show-overflow-tooltip></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import { mapState, mapGetters, createNamespacedHelpers } from 'vuex'
const { mapState: clinicalnoteMapStates } = createNamespacedHelpers('emr')
// import api from '@/api/list'
import { apiQueryMedicalExaminationList } from '@/api/tools.js'
export default {
  name: 'MedicalExamination',
  data() {
    return {
      allChecked: false,
      labtestResultStatus: [1], //详情类型
      selectList: [], //选中数据
      tableData: [],
      tableDataDetail: [], //详情源数据
      timeLineData: {},
      tableDataDetailLoad: false,
      isLoadingData: false,
      insertMedicalData: []
    }
  },
  computed: {
    ...mapState(['currentPatientInfo']),
    ...mapGetters(['currentEmployeeConfigs']),
    ...clinicalnoteMapStates(['PersonalSetting', 'AllConfigure'])
  },
  watch: {
    examinationObj: {
      handler: function() {
        this.getExaminationTableList()
      },
      immediate: true,
      deep: true
    }
  },

  mounted() {
    this.getExaminationTableList()
  },
  methods: {
    //获取检验报告信息
    getExaminationTableList() {
      this.isLoadingData = true

      this.tableDataDetail = []
      this.tableDataDetail = []
      let params = {
        encounterId: this.currentPatientInfo.encounterId,
        bizRoleId: this.currentPatientInfo.bizRoleId,
        labtestResultStatus: this.labtestResultStatus,
        day: '0',
        encounterTypeCodes: ['145235', '138138']
      }
      apiQueryMedicalExaminationList(params)
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
            console.log(this.timeLineData)
          }
        })
        .catch(() => {
          this.isLoadingData = false
        })
    },

    //表格模式表格选择事件
    async handleSelectionChange(rowList) {
      this.tableDataDetailLoad = true
      this.tableDataDetail = []
      for (let i = 0; i < rowList.length; i++) {
        let list = rowList[i].reportResult.map(v => {
          v.publishedDate = rowList[i].publishedDate
          v.reportName = rowList[i].reportName
          v.medtechRptId = rowList[i].medtechRptId
          return v
        })
        this.tableDataDetail.push(...list)
      }
      this.tableDataDetailLoad = false
    },

    //全选操作
    selectAll(selection) {
      this.selectList = selection
    },

    //单行操作
    selectHandel(selection) {
      this.selectList = selection
    },

    changeLabtestResultStatus(val) {
      if (val[val.length - 1] == 1) {
        this.labtestResultStatus = [1]
      } else {
        const index = val.indexOf(1)
        if (index > -1) {
          this.labtestResultStatus.splice(index, 1)
        }
      }
      this.getExaminationTableList()
    }
  }
}
</script>

<style lang="scss" scoped>
.pub-auxiliary-wrap {
  padding: 10px 16px;
}
.medical-examination-wrap {
  .el-checkbox__input {
    zoom: 130%;
  }
  .footer {
    border-top: 1px solid #d7dbea;
    padding: 8px 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-container {
    height: calc(100% - 81px);
    width: 100%;
    overflow-y: auto;
    padding: 0 10px;
  }
  .fontSize16 {
    font-size: 16px;
  }
  .noData {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
  }
  .el-checkbox-button {
    margin: 0 9px;
  }
  /deep/ .el-checkbox-button__inner {
    border-left: 1px solid #c9c9c9;
  }
  .nursingInfoItem {
    // box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    /deep/.el-row {
      position: relative;
      padding: 30px 2px 8px 16px;
      line-height: 2;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      .el-col-10,
      .el-col-24 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      & + .el-row {
        margin-top: 10px;
      }
      .font-bold {
        font-weight: bold;
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

      .bigCheckBox {
        position: absolute;
        left: -31px;
        top: -5px;
      }
    }
  }
  /deep/.el-timeline .el-timeline-item:last-child .el-timeline-item__tail {
    display: block;
  }
  /deep/ .el-checkbox__input {
    zoom: 130%;
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
  .pub-auxiliary-content-medical {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
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
  .search-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 5px 10px;
    .area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .ml20 {
      margin-left: 20px;
      &:first-child {
        margin-left: 0;
      }
    }
  }
  .radio-group-box {
    margin: 4px 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    /deep/ .el-radio-group {
      margin: 4px;
    }
    section {
      display: flex;
      align-items: center;
      margin: 4px;
      /deep/ .el-select {
        flex: 1 1 166px;
      }
    }
  }
  .el-button--small {
    padding: 9px 30px;
    font-size: 12px;
    border-radius: 3px;
  }

  /deep/ .el-table {
    flex: 1 1 auto;
    height: calc(50% - 50px);
    .el-table__body-wrapper {
      overflow: auto;
      height: calc(100% - 42px);
    }
    .el-icon-top {
      color: #ec0000;
    }

    .el-icon-bottom {
      color: #088afb;
    }
  }
}
@media screen and (max-width: 1920px) {
  .medical-examination-wrap {
    /deep/ .el-table {
      height: calc(50% - 70px);
    }
  }
}
</style>
