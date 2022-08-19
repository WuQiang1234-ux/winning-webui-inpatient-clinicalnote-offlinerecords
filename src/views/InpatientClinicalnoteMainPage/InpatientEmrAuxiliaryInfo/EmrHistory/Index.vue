<template>
  <div class="emr-history-wrap" style="background: #fff">
    <header v-if="!auxiliaryInfoEntrance" class="pub-auxiliary-header">既往病历</header>
    <article id="historyEmrBox" v-loading="loading">
      <section class="filter-box">
        <div class="radio-section">
          <el-radio-group
            v-model="clinicalnoteType"
            size="small"
            @change="
              keyWords = ''
              handleFilter()
            "
          >
            <el-radio-button :label="1">本次病历</el-radio-button>
            <el-radio-button :label="2">历史病历</el-radio-button>
            <el-radio-button v-if="isShow5XClinicanote" :label="3">5.x历史病历</el-radio-button>
          </el-radio-group>
        </div>
        <el-input
          v-model="keyWords"
          size="small"
          class="search_input"
          placeholder="请输入关键字"
          @change="handleFilter"
        >
          <i slot="prefix" class="icon-search"></i>
        </el-input>
      </section>
      <el-collapse
        v-if="list.length"
        v-model="activeName"
        accordion
        class="collapse-section"
        @change="handleCollapseChange"
      >
        <el-collapse-item
          v-for="(item, index) in list"
          :key="'collapse' + index"
          :name="item.recordId"
        >
          <template slot="title">
            <span>{{ item.recordTime }}</span>
            <span>{{ item.recordTypeName }}</span>
            <span>{{ item.deptName }}</span>
            <span class="bold">{{ item.diagnosisName }}</span>
            <div class="right">
              <span class="collapse-text">{{ activeName == item.recordId ? '收起' : '展开' }}</span>
            </div>
          </template>
          <div class="content-section">
            <!-- 住院病历和门诊自研编辑器的病历使用编辑器的样式展示 -->
            <div
              v-if="item.recordTypeCode == 145235 && activeName == item.recordId"
              :style="{ height: contentHeight + 'px' }"
            >
              <emr-book :emr-item="item" />
            </div>
            <div
              v-else-if="item.mrtEditorTypeCode == '399461578' && activeName == item.recordId"
              :style="{ height: contentHeight + 'px' }"
            >
              <PgEditor
                ref="pgEditorOutpaitent"
                :patientInfo="currentPatientInfo"
                :userInfo="userInfo"
                :toolbarOptions="{ isShow: false }"
                class="pg-editor"
              />
            </div>
            <!-- 门诊知识编辑器的病历使用段落形式展示 -->
            <div v-else class="history-mrt-content">
              <header>
                <span>{{ item.mrtName }}</span>
                {{ item.recordTime }}
              </header>
              <div class="mrt-content-section">
                <div v-for="mrt in item.mrtContent" :key="mrt.csConceptId" class="item">
                  <el-checkbox v-model="mrt.isChecked"></el-checkbox>
                  <b>{{ mrt.sectionName }}:</b>
                  {{ mrt.sectionContent }}
                </div>
              </div>
              <footer>
                <el-button type="primary" size="small" @click="setMrtContent(false, item)">插入</el-button>
              </footer>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
      <inpatient-pagination
        v-if="total > pageSize"
        :list-loading="loading"
        :current-page="pageNo"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @getList="getEmrHistroyList"
        @setLimit="pageSize = $event"
        @setPage="pageNo = $event"
      />
    </article>
  </div>
</template>

<script>
import $ from 'jquery'
import dayjs from 'dayjs'
// import Cookies from 'js-cookie'
// import apiAssistant from '@/api/assistant.js'
import { mapState } from 'vuex'
import { getEmrHistroyListData, getEmrHistroyContentData } from './testData'
import EmrBook from './components/EmrBook.vue'
import PgEditor from '@/libs/PgEditor'
import { EditorEvent, DcEditorRenderModes } from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
import inpatientPagination from '@/components/pagination/index'
import { decompress } from '../../../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'

export default {
  name: 'EmrHistory',
  components: {
    EmrBook,
    PgEditor,
    inpatientPagination,
  },
  data() {
    return {
      clinicalnoteType: 1,
      keyWords: '',
      activeName: undefined,
      list: [],
      pageNo: 0,
      pageSize: 10,
      total: 0,
      loading: true,
      contentHeight: 500, //动态设置编辑器区域的高度
      getEmrHistroyListData: Object.freeze(getEmrHistroyListData),
      getEmrHistroyContentData: Object.freeze(getEmrHistroyContentData),
    }
  },
  computed: {
    ...mapState(['userInfo']),
    currentPatientInfo() {
      return this.patientRootComponentStore.state.currentPatientInfo
    },

    isShow5XClinicanote() {
      //5.x历史病历只在混合框架下显示
      if (!window.winning) {
        return false
      }
      const _config = this.AllConfigure?.data?.find((el) => {
        return el.inpatEmrParamConfigCode === 'COMMON023'
      })

      if (_config) {
        return _config.inpatEmrParamConfigContent == 'true'
      }
      return false
    },
  },
  inject: {
    auxiliaryInfoEntrance: {
      default: '',
    },
  },
  provide() {
    return {
      getClinicalnoteType: () => {
        return this.clinicalnoteType
      },
    }
  },
  mounted() {
    this.calculateHeight()
    this.getEmrHistroyList()
  },
  methods: {
    calculateHeight() {
      let contentHeight = $('#historyEmrBox').height() - 84 //84为条件切换区域高度44与分页区域高度40
      this.contentHeight = $('#historyEmrBox').height() - 110
      if (contentHeight < 48 * 5) {
        this.pageSize = 5
      } else {
        this.pageSize = parseInt(contentHeight / 48)
      }
    },
    handleFilter() {
      this.activeName = undefined
      this.pageNo = 0
      if (this.clinicalnoteType == 3) {
        this.getOtherClinicalnoteHistory('399543538', true)
        return
      }
      this.getEmrHistroyList()
    },
    // getOtherClinicalnoteHistory(code, isCallback = false) {
    //   if (!window.winning) return
    //   const { encounterId } = this.currentPatientInfo
    //   const { employeeId } = this.userInfo
    //   const params = {
    //     header: {
    //       Authorization: Cookies.get('BEARER_TOKEN') || '',
    //       'W-SEQ': Cookies.get('W-SEQ') || 'default',
    //       'W-FLOW': Cookies.get('W-FLOW') || 'default',
    //     },
    //     body: [
    //       {
    //         resource: {
    //           resourceType: 'Encounter', //资源标签：就诊
    //           id: encounterId, //就诊id
    //         },
    //       },

    //       {
    //         resource: {
    //           id: '145235',
    //           resourceType: 'EncounterType', //就诊类型标识，术语:就诊类型概念域65288(门诊138138急诊138139体检138140其他138141住院145235家床145236)
    //         },
    //       },

    //       {
    //         resource: {
    //           resourceType: 'Employee', //资源标签：员工
    //           id: employeeId, //员工id
    //         },
    //       },
    //     ],
    //   }
    //   const paramsStr = JSON.stringify(params)
    //   console.log('发送混合框架事件：', paramsStr)
    //   console.log(code, isCallback)
    //   return new Promise((resolve, reject) => {
    //     try {
    //       let processCbList = []
    //       window.winning &&
    //         window.winning.dispatchEvent(
    //           code,
    //           paramsStr,
    //           isCallback
    //             ? (res) => {
    //                 console.log('回调结果: ', res)
    //                 const data = JSON.parse(res)
    //                 if (data.state === 'pending') {
    //                   processCbList.push(data)
    //                   if (data.actionType === 'message') {
    //                     if (
    //                       data.messageInfo.type === 'warn' ||
    //                       data.messageInfo.type === 'tips'
    //                     ) {
    //                       this.$message.warning(data.messageInfo.message)
    //                     } else if (
    //                       data.messageInfo.type === 'error' ||
    //                       data.messageInfo.type === 'stop'
    //                     ) {
    //                       this.$message.error(data.messageInfo.message)
    //                     }
    //                   }
    //                 } else if (data.state === 'finish') {
    //                   const isError = !!processCbList.find(
    //                     (item) => item.actionType !== 'success'
    //                   )
    //                   if (isError) {
    //                     reject(false)
    //                   } else {
    //                     const process = processCbList.find(
    //                       (p) => p.actionType === 'success' && p.data
    //                     )
    //                     if (process) {
    //                       resolve(true)
    //                     } else {
    //                       resolve(null)
    //                     }
    //                   }
    //                 }
    //               }
    //             : () => {}
    //         )
    //       if (!isCallback) {
    //         resolve(true)
    //       }
    //     } catch (error) {
    //       reject(error)
    //       console.log('调用混合框架发送事件失败: ', error)
    //       this.$message.error('调用混合框架发送事件失败')
    //     }
    //   })
    // },
    getEmrHistroyList() {
      let params = {
        currentInpEncounterId: this.currentPatientInfo.encounterId,
        bizRoleId: this.currentPatientInfo.bizRoleId,
        patientId: this.currentPatientInfo?.patientInfoOutput?.patientId,
        includeCurrentFlag: this.clinicalnoteType == 1 ? 98175 : 98176,
        dateType: '0',
        keyword: this.keyWords,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        pageType: 'P',
      }
      console.log(params)

      // apiAssistant.getEmrHistroyList(params).then((res) => {
      let res = this.getEmrHistroyListData
      const { data, count } = res
      if (count != -1) {
        this.total = Number(count)
      }
      this.list =
        data.map((v) => {
          v.recordTime = dayjs(v.recordTime).format('YYYY-MM-DD')
          if (v.recordTypeCode == 145235) {
            v.emrList = [] //记录已经打开的病历
          } else {
            v.mrtContent = [] //记录门诊病历内容
          }
          return v
        }) || []
      this.loading = false
      // })
    },
    handleCollapseChange(val) {
      if (val == '') return
      //当前打开的既往病史项
      let _temp = this.list.find((item) => {
        return item.recordId == val
      })

      if (_temp.recordTypeCode == 138138) {
        //查询门诊病历内容
        if (_temp.mrtContent.length) {
          return
        } else if (_temp.xml) {
          setTimeout(() => {
            this.loadClinicalnoteXmlAsync(_temp.xml, _temp.recordId)
          })
        }

        //查询门诊病历内容
        // apiAssistant
        //   .getEmrHistroyContent({
        //     aggregateEmrSetId: _temp.recordId,
        //     emrSetTypeCode: _temp.recordTypeCode,
        //   })
        //   .then((res) => {
        let res = this.getEmrHistroyContentData
        console.log(res)
        if (res?.data) {
          let { emrSetSectionContents, inpEmrContentData, mrtEditorTypeCode } =
            res.data
          Object.assign(_temp, {
            mrtEditorTypeCode,
            xml: '',
            mrtContent: [],
          })

          //自研编辑器
          if (mrtEditorTypeCode == '399461578') {
            _temp.xml = decompress(inpEmrContentData)
            setTimeout(() => {
              this.loadClinicalnoteXmlAsync(_temp.xml, _temp.recordId)
            })
          } else {
            //知识编辑器mrtEditorTypeCode == '399461577'
            if (emrSetSectionContents?.length) {
              _temp.mrtContent = res.data.emrSetSectionContents.map((v) => {
                v.isChecked = false
                return v
              })
            }
          }
        }
        //   })
      }
    },
    async loadClinicalnoteXmlAsync(srcstr, docId) {
      const pgEditor = this.$refs.pgEditorOutpaitent[0]
      console.log(pgEditor, 'pgEditor----')

      const load = (cb = () => {}) => {
        pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
          cb()
        })
        pgEditor.pgEditorInstance.postmessage({
          type: 'FileOpen',
          param: [
            {
              srcstr,
              docId,
            },
          ],
        })
      }

      if (!pgEditor?.pgEditorLoaded) {
        await pgEditor.waitEditorLoaded()
      }

      await cb2promise((cb) => {
        load(cb)
      })
      console.log('jiazai wancheng ---------- ')
      //水印
      // pgEditor.setWaterMark()
      setTimeout(() => {
        pgEditor.switchContentRenderMode(
          DcEditorRenderModes.SET_WORK_MODE_BROWSE
        )
      }, 500)
    },
    setMrtContent(isReplace, item) {
      let content = ''
      item.mrtContent.forEach((v) => {
        if (v.isChecked) {
          content += v.sectionContent
        }
      })
      //向病历编辑器插入内容
      this.$root.eventHub.$emit('AuxiliaryInfo/Insert', {
        content,
        type: 'text',
        isReplace,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.pg-editor {
  /deep/ .pg-editor-wrap .pg-editor-target {
    height: 100%;
  }
}
.emr-history-wrap {
  height: 100%;
  width: 100%;

  header {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #dce5f2;
    padding-left: 8px;
  }

  article {
    position: relative;
    height: calc(100% - 50px);
    overflow-y: auto;
    .filter-box {
      display: flex;
      flex-wrap: nowrap;
      padding: 4px 8px 0 0;
      .radio-section {
        flex: 0 1 auto;
        margin: 4px 4px 4px 8px;
      }

      .search_input {
        flex: 1 0 auto;
        width: calc(100% - 318px);
        margin: 4px 0 4px 4px;
        i {
          display: block;
          width: 20px;
          height: 20px;
          margin-top: 6px;
          background-position: center center;
          background-repeat: no-repeat;
          background-size: contain;

          &.icon-search {
            background-image: url('../../../../assets/svg/icon_search.svg');
          }

          &.icon-microphone {
            background-image: url('../../../../assets/svg/icon_search_microphone.svg');
          }
        }
      }
    }

    .collapse-section {
      margin: 0 8px;
      border-color: #c2c9df;
      /deep/ .el-collapse-item__header {
        position: relative;
        border-color: #c2c9df;

        & > span {
          margin-right: 8px;
          max-width: 22%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          word-break: break-all;

          &.bold {
            font-weight: 800;
          }
        }
        .right {
          position: absolute;
          right: 26px;
          top: 0;
        }
      }

      /deep/ .el-collapse-item__content {
        padding-bottom: 0;
      }

      .content-section {
        position: relative;
        background: #ffffff;
        margin-top: 4px;

        .history-mrt-content {
          border: 1px solid #dce5f2;
          header {
            text-align: center;
            font-size: 12px;
            color: #999;
            height: 48px;
            line-height: 48px;
            border-bottom: 1px solid #dce5f2;
            span {
              color: #000;
              font-size: 14px;
              font-weight: 800;
              margin-right: 8px;
            }
          }

          .mrt-content-section {
            padding: 8px 0;
            min-height: 400px;
            .item {
              line-height: 20px;
              margin: 12px 8px;
              b {
                margin-left: 8px;
              }
            }
          }

          footer {
            border-top: 1px solid #dce5f2;
            padding: 8px;
            text-align: right;
          }
        }
      }

      /deep/ .el-collapse-item__wrap {
        border-color: #c2c9df;
        overflow: visible;
      }
    }
  }
}

.dc-editor-wrap {
  height: 500px;
}
@media screen and (max-width: 1440px) {
  .emr-history-wrap {
    article {
      .filter-box {
        flex-wrap: wrap-reverse;
      }
    }
  }
}
</style>
