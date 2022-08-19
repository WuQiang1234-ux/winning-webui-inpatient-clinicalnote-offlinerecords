<template>
  <div class="medical-inspection-wrap pub-auxiliary-wrap">
    <header class="pub-auxiliary-header">
      短语引用
      <el-radio-group v-model="inpEmrPhraseScopeCode">
        <el-radio-button label="959739">个人</el-radio-button>
        <el-radio-button label="959737">科室</el-radio-button>
        <el-radio-button label="959736">全院</el-radio-button>
      </el-radio-group>
      <i class="el-icon-refresh" style="color:#2D5AFA;cursor: pointer;" @click="handleRefresh"></i>
    </header>
    <section v-if="phraseTreeData.length" class="pub-auxiliary-content">
      <section class="search-content">
        <el-input v-model="keyWord" size="small" clearable placeholder="名称、拼音模糊搜索" />
        <el-button type="primary" size="mini" @click="handleSearch">搜索</el-button>
      </section>
      <el-row class="phrase-list-section">
        <el-col :span="6" class="leftSection">
          <ul>
            <li
              v-for="el in phraseTreeData"
              :key="el.inpEmrPhraseCatagoryId"
              :class="{
                active:
                  currentInpEmrPhraseCatagory.inpEmrPhraseCatagoryId ==
                  el.inpEmrPhraseCatagoryId
              }"
              @click="handleCateClick(el)"
            >
              <!-- <el-tooltip :content="el.inpEmrPhraseCatagoryName" placement="bottom" effect="light"> -->
              <label>{{ el.inpEmrPhraseCatagoryName }}</label>
              <!-- </el-tooltip> -->
            </li>
          </ul>
        </el-col>
        <el-col id="scrollPaginationPhrase" v-loading="loading" :span="18" class="rightSection">
          <!-- 鉴别诊断 -->
          <template
            v-if="
              currentInpEmrPhraseCatagory.inpMrtDeSectionNo == '390000234' &&
                inpEmrPhraseScopeCode == '959736'
            "
          >
            <el-tree
              key="differentialDiagnosisPhraseTree"
              :data="differentialDiagnosisPhraseTree"
              :default-expand-all="keyWord.trim().length ? true : false"
              class="custom-tree"
            >
              <div slot-scope="{ data }" class="custom-tree-node">
                <ul v-if="data.leaf">
                  <li>
                    <span class="opt">
                      <svg
                        @click="handleInsert(data)"
                        class="icon"
                        aria-hidden="true"
                        style="fill:var(--COLOR-NORMAL);ont-size=20px;cursor:pointer"
                      >
                        <use xlink:href="#wicon-left-point-square" />
                      </svg>
                      <svg
                        @click="handleDelete(data,true)"
                        class="icon"
                        aria-hidden="true"
                        style="fill:var(--COLOR-NORMAL);ont-size=20px;cursor:pointer"
                      >
                        <use xlink:href="#wicon-delete" />
                      </svg>
                    </span>
                    <div @click="handleTitleClick">{{ data.label }}</div>
                    <section>
                      <p>{{ data.content }}</p>
                    </section>
                  </li>
                </ul>
                <div v-else class="title" @click="handleTitleClick">{{ data.label }}</div>
              </div>
            </el-tree>
          </template>
          <ul v-else>
            <li v-for="el in phraseList" :key="el.inpEmrPhraseId">
              <span class="opt">
                <svg
                  @click="handleInsert(el)"
                  class="icon"
                  aria-hidden="true"
                  style="fill:var(--COLOR-NORMAL);ont-size=20px;cursor:pointer"
                >
                  <use xlink:href="#wicon-left-point-square" />
                </svg>
                <svg
                  @click="handleDelete(el,true)"
                  class="icon"
                  aria-hidden="true"
                  style="fill:var(--COLOR-NORMAL);ont-size=20px;cursor:pointer"
                >
                  <use xlink:href="#wicon-delete" />
                </svg>
              </span>
              <el-link
                type="primary"
                :underline="false"
                @click="handleShowMore(el)"
              >{{ el.isShowMore ? '收起' : '更多' }}</el-link>
              <div>{{ el.inpEmrPhraseName }}</div>
              <section :style="{ height: el.isShowMore ? 'auto' : '24px' }">
                <p>{{ el.inpEmrPhraseContentTxt }}</p>
              </section>
            </li>
          </ul>
          <section v-if="pages > pageNo + 1 && phraseList.length" class="load-more">
            <el-button size="mini" :loading="moreLoading" @click="getNextPage">加载更多</el-button>
          </section>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script>
// /*global $:true*/
import $ from 'jquery'
import getEventHubHelper from '@/utils/event_hub_helper.js'
// import api from '@/api/list'
// import apiMedicalManager from '@/api/dailyManager/medicalManager.js'
// import { apiAddPhraseCount } from '@/api/phrase'
import {
  apiMedicalManagerData,
  apiMedicalManagerData_inpEmrPhraseCatagoryId0,
  apiMedicalManagerData_inpEmrPhraseCatagoryIdNo0,
} from './testData'
import { mapState } from 'vuex'
import { decompress } from '../../../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'

export default {
  name: 'PhraseRefen',
  props: {
    auxiliaryTab: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      total: 0,
      pageNo: 0,
      pageSize: 10,
      currentInpEmrPhraseCatagory: {
        inpEmrPhraseCatagoryId: '0',
      }, //当前选择的分类

      inpEmrPhraseScopeCode: '959739',
      keyWord: '',

      phraseTreeData: [],
      allPhraseTreeData: [],
      phraseList: [],

      loading: false, //右侧别表区域加载
      moreLoading: false, //加载更多
      differentialDiagnosisPhraseTree: [],
      apiMedicalManagerData,
      apiMedicalManagerData_inpEmrPhraseCatagoryId0,
      apiMedicalManagerData_inpEmrPhraseCatagoryIdNo0,
    }
  },
  computed: {
    currentActiveLoadedClinicalnote() {
      return this.patientRootComponentStore.state.multi_clinicalnote_board_state
        .currentActiveLoadedClinicalnote
    },
    ...mapState(['userInfo', 'orgInfo', 'currentPatientInfo']),
    pages() {
      return Math.ceil(this.total / this.pageSize)
    },
  },
  watch: {
    auxiliaryTab(v) {
      if (v == 'phraseRefen') {
        this.getPhraseCatagory()
        this.setMoreStyle()
      }
    },
    inpEmrPhraseScopeCode: {
      handler: function () {
        this.handleInitDatas()
        this.getPhraseCatagory()
      },
      immediate: true,
    },
    'currentActiveLoadedClinicalnote.options.content.paragraphIds': {
      handler: function () {
        this.filterPhraseCatagory()
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    // this.registerEventBus()
    this.eventHubHelper = getEventHubHelper(
      this.patientRootComponentStore.state.eventHub
    )
  },
  beforeDestroy() {
    // this.removeEventBus()
  },
  methods: {
    //刷新 全部数据复原  但目录不需要重置
    handleRefresh() {
      this.total = 0
      this.pageNo = 0
      this.pageSize = 10
      Object.assign(this.currentInpEmrPhraseCatagory, {
        inpEmrPhraseCatagoryId: '0',
      })
      this.inpEmrPhraseScopeCode = '959739'
      this.keyWord = ''
      this.handleLoadData(this.currentInpEmrPhraseCatagory)
    },
    //获取短语目录前需要复原数据
    handleInitDatas() {
      this.total = 0
      this.pageNo = 0
      this.pageSize = 10
      this.keyWord = ''

      this.phraseList = []
      this.phraseTreeData = []
    },
    //搜索
    handleSearch() {
      this.total = 0
      this.pageNo = 0
      this.pageSize = 10
      this.handleLoadData(this.currentInpEmrPhraseCatagory)
    },
    //获取短语目录
    async getPhraseCatagory() {
      // let res = await apiMedicalManager.getPhraseCataTree({
      //   phraseClassTypeCode: this.inpEmrPhraseScopeCode,
      //   deptId:
      //     this.inpEmrPhraseScopeCode == '959737' ? this.orgInfo.orgId : '',
      // })
      let res = this.apiMedicalManagerData
      if (res.success) {
        this.allPhraseTreeData = res.data
        if (
          !this.allPhraseTreeData.some(
            (item) => item.inpEmrPhraseCatagoryName == '最近收藏'
          )
        ) {
          this.allPhraseTreeData.unshift({
            inpEmrPhraseCatagoryId: '0',
            inpEmrPhraseCatagoryName: '最近收藏',
            inpMrtDeSectionNo: '',
          })
        }

        this.filterPhraseCatagory()
        this.handleLoadData(this.currentInpEmrPhraseCatagory)
      }
    },
    //过滤短语目录
    filterPhraseCatagory() {
      let emrSetId =
        this.currentActiveLoadedClinicalnote?.options?.content?.emrSetId
      let _paragraphIds =
        this.currentActiveLoadedClinicalnote?.options?.content?.paragraphIds ||
        []
      if (emrSetId) {
        let paragraphIds = []
        for (let i = 0; i < _paragraphIds?.length; i++) {
          let _index = paragraphIds.findIndex((v) => {
            return v.cptId == _paragraphIds[i]?.cptId
          })
          if (_index == -1) {
            paragraphIds.push(_paragraphIds[i])
          }
        }
        console.log(paragraphIds, 'paragraphIds----')

        this.phraseTreeData = []
        this.allPhraseTreeData.forEach((el) => {
          if (
            el.inpEmrPhraseCatagoryName == '通用' ||
            el.inpEmrPhraseCatagoryName == '最近收藏' ||
            el.phraseClassTypeCode
          ) {
            this.phraseTreeData.push(el)
          }
          paragraphIds.forEach((el2) => {
            if (el.inpMrtDeSectionNo == el2.cptId && !el.phraseClassTypeCode) {
              this.phraseTreeData.push(el)
            }
          })
        })
      } else {
        this.phraseTreeData = this.allPhraseTreeData
      }
    },
    //目录点击事件
    handleCateClick(catagory) {
      if (
        catagory.inpEmrPhraseCatagoryId ==
        this.currentInpEmrPhraseCatagory.inpEmrPhraseCatagoryId
      )
        return
      this.handleLoadData(catagory)
    },
    //加载数据
    async handleLoadData(selectedCatagory) {
      if (this.phraseTreeData.length == 0) return
      let currentCatagory = this.phraseTreeData.find(
        (phrase) =>
          phrase.inpEmrPhraseCatagoryId ==
          selectedCatagory.inpEmrPhraseCatagoryId
      )
      if (currentCatagory) {
        selectedCatagory = currentCatagory
      } else {
        selectedCatagory = this.phraseTreeData[0]
      }

      let { inpEmrPhraseCatagoryId, phraseClassTypeCode } = selectedCatagory
      //如果改变了选择的目录 重置页码
      if (
        inpEmrPhraseCatagoryId !==
        this.currentInpEmrPhraseCatagory.inpEmrPhraseCatagoryId
      ) {
        this.pageNo = 0
        this.phraseList = []
        this.loading = true
        Object.assign(this.currentInpEmrPhraseCatagory, selectedCatagory)
      }

      //全院下的鉴别诊断
      if (
        this.currentInpEmrPhraseCatagory.inpMrtDeSectionNo == '390000234' &&
        this.inpEmrPhraseScopeCode == '959736'
      ) {
        await this.getDifferentialDiagnosisPhraseTree()
      } else {
        let params = {
          inpEmrPhraseCatagoryId,
          inpEmrPhraseScopeCode: this.inpEmrPhraseScopeCode,
          keyWord: this.keyWord,
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          //deptIds: [this.orgInfo.orgId],//传deptIds则查当前科室的短语，不传则查当前医生的所有科室的短语
          pageType: 'P',
        }
        console.log(params)
        let res = null
        if (inpEmrPhraseCatagoryId == '0') {
          res = this.apiMedicalManagerData_inpEmrPhraseCatagoryId0
          // res = await apiMedicalManager.getFavPhraseList(params)
        } else {
          res = this.apiMedicalManagerData_inpEmrPhraseCatagoryIdNo0
          // res = await apiMedicalManager.getPhraseList(params)
        }

        let { success, data } = res
        if (success && data) {
          let _data = data.data.map((v) => {
            let base64Str =
              v.inpatientEmrPhraseContent?.inpEmrPhraseContentData ?? ''
            let xml = ''
            if (base64Str) {
              xml = decompress(base64Str)
            }
            return {
              inpEmrPhraseId: v.inpEmrPhraseId,
              phraseClassTypeCode: phraseClassTypeCode,
              inpEmrPhraseName: v.inpEmrPhraseName,
              //自研插xml  都昌老数据插纯文本
              isTxtFlag: v.mrtEditorTypeCode == '399461578' ? 0 : 1,
              inpEmrPhraseContentTxt:
                v.inpatientEmrPhraseContent?.inpEmrPhraseContentTxt ?? '',
              inpEmrPhraseContentData: xml,
              allList: data.data,
              isShowMore: false,
              rawData: v,
            }
          })

          if (this.pageNo == 0) {
            this.phraseList = _data
          } else {
            this.phraseList.push(..._data)
          }

          if (data.count != -1) {
            this.total = Number(data.count)
          }

          this.loading = false
          this.moreLoading = false
        }
      }

      setTimeout(() => {
        this.setMoreStyle()
      })
    },

    async getDifferentialDiagnosisPhraseTree() {
      // this.loading = true
      // let res = await api.differentialDiagnosisPhraseTree({
      //   inpEmrPhraseCatagoryId:
      //     this.currentInpEmrPhraseCatagory.inpEmrPhraseCatagoryId, //鉴别诊断id
      //   inpEmrPhraseScopeCode: this.inpEmrPhraseScopeCode, //全院标志
      //   keyWord: this.keyWord,
      // })
      // this.differentialDiagnosisPhraseTree = this.sortData(res.data)
      // this.loading = false
    },
    sortData(list) {
      return list.map((rawData) => {
        let contentList =
          rawData.data.map((v) => {
            return {
              id: v.inpEmrPhraseId,
              label: v.inpEmrPhraseName,
              content: v?.inpatientEmrPhraseContent?.inpEmrPhraseContentTxt,
              children: [],
              leaf: true,
            }
          }) ?? []

        let children =
          rawData.nodes.map((v) => {
            return {
              id: v.inpEmrPhraseCatagoryId,
              label: v.inpEmrPhraseCatagoryName,
              children: this.sortData(v.nodes),
            }
          }) ?? []
        if (contentList?.length) {
          children = contentList.concat(children)
        }
        let sortedData = {
          id: rawData.inpEmrPhraseCatagoryId,
          label: rawData.inpEmrPhraseCatagoryName,
          children,
        }
        return sortedData
      })
    },
    setMoreStyle() {
      $('.rightSection li').each((i, el) => {
        let contentHeight = $(el).find('p').height()
        if (contentHeight <= 24) {
          $(el).find('.el-link').hide()
        } else {
          $(el).find('.el-link').show()
        }
      })
    },
    handleShowMore(el) {
      el.isShowMore = !el.isShowMore
    },
    //删除短语
    handleDelete(data, isDiagnosis = false) {
      console.log(data)
      const lastPhrase =
        data?.allList?.length == 1 && data?.phraseClassTypeCode ? true : false
      let title = lastPhrase
        ? '删除该短语后，当前的自定义目录也会同时删除，是否确认删除'
        : '确定执行删除操作？'
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      })
        .then(async () => {
          try {
            // let res = await apiMedicalManager.apiDeletePhrase(
            //   {
            //     encounterId: this.currentPatientInfo.encounterId,
            //     inpEmrPhraseId: data.inpEmrPhraseId,
            //     phraseClassTypeCode: data.phraseClassTypeCode,
            //     inpEmrPhraseCatagoryId: data.rawData.inpEmrPhraseCatagoryId,
            //     lastPhrase,
            //     modifiedBy: this.userInfo.employeeId,
            //   },
            //   { errWarn: false }
            // )
            // if (res.success) {
            //   this.$message({
            //     message: '短语删除成功！',
            //     type: 'success',
            //   })
            // }
          } finally {
            //重新获取当前内容
            if (isDiagnosis) {
              this.handleLoadData(this.currentInpEmrPhraseCatagory)
            } else {
              let _index = this.phraseList.findIndex(
                (v) => v.inpEmrPhraseId == data.inpEmrPhraseId
              )
              if (_index >= 0) {
                this.phraseList.splice(_index, 1)
              }
              this.getPhraseCatagory()
            }
          }
        })
        .catch(() => {})
    },

    addPhraseCount(inpEmrPhraseId) {
      console.log(inpEmrPhraseId)
      // 增加短语引用计数
      // apiAddPhraseCount(
      //   {
      //     inpEmrPhraseId,
      //   },
      //   { errWarn: false }
      // )
      // 短语引用日志
      // apiMedicalManager.addRefPhaseActionLog(
      //   {
      //     inpEmrPhraseId,
      //     actionCode: '399575839',
      //     encounterId: this.currentPatientInfo.encounterId,
      //     inpatEmrSetId:
      //       this.currentActiveLoadedClinicalnote?.options?.content?.emrSetId,
      //   },
      //   { errWarn: false }
      // )
    },
    //插入病历
    handleInsert(el) {
      console.log(el)
      // debugger
      // apiMedicalManager
      //   .queryPhraseById(
      //     {
      //       inpEmrPhraseId: el.id || el.inpEmrPhraseId,
      //     },
      //     { errWarn: false }
      //   )
      //   .then((res) => {
      //     console.log(res, '短语是否存在----')
      //     //对鉴别诊断的数据进行整理
      //     if (el.id) {
      //       el.inpEmrPhraseId = el.id
      //       el.inpEmrPhraseName = el.label
      //       el.isTxtFlag = 1
      //       el.inpEmrPhraseContentData = ''
      //       el.inpEmrPhraseContentTxt = el.content
      //     }
      this.pgInsert(el)
      //   })
      //   .catch(() => {
      //     this.handleRefresh()
      //   })
    },
    pgInsert(el) {
      console.log('插入病历pgInsert', el)
      if (el.inpEmrPhraseContentData || el.inpEmrPhraseContentTxt) {
        let content = el.inpEmrPhraseContentTxt
        let type = 'text'
        if (el.isTxtFlag != 1 && el.inpEmrPhraseContentData) {
          let xml = el.inpEmrPhraseContentData
          if (xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')) {
            content = xml
          } else {
            content = decodeURI(xml)
          }
          type = 'xml'
        }
        this.eventHubHelper.emit('AuxiliaryInfo/Insert', {
          type,
          content,
          text: el.inpEmrPhraseContentTxt,
        })
        // this.addPhraseCount(el.inpEmrPhraseId)
      } else {
        this.$message({
          message: '当前短语内容为空！',
          type: 'warning',
        })
      }
    },
    // registerEventBus() {
    //   this.$root.eventHub.$on(
    //     'AuxiliaryInfo/SetPhraseReferActiveTab',
    //     this.activeTabName
    //   )
    //   this.$root.eventHub.$on(
    //     'AuxiliaryInfo/setPhraseReferInfo',
    //     this.handlePhrasePosition
    //   )
    // },
    // removeEventBus() {
    //   this.$root.eventHub.$off(
    //     'AuxiliaryInfo/SetPhraseReferActiveTab',
    //     this.activeTabName
    //   )
    //   this.$root.eventHub.$off(
    //     'AuxiliaryInfo/setPhraseReferInfo',
    //     this.handlePhrasePosition
    //   )
    // },
    async activeTabName(val) {
      this.inpEmrPhraseScopeCode = val.params.inpEmrPhraseScopeCode
      this.currentInpEmrPhraseCatagory.inpEmrPhraseCatagoryId =
        val.params.inpEmrPhraseCatagoryId
      await this.getPhraseCatagory()
      //刷新数据
      this.handleSearch()
    },
    handlePhrasePosition(val) {
      let data = this.phraseTreeData.find((v) => {
        return (
          v.inpMrtDeSectionNo == val.params.paragraphId ||
          v.inpEmrPhraseCatagoryName == val.params.labelText ||
          v.inpEmrPhraseCatagoryName == val.params.inputName
        )
      })
      if (data) {
        this.handleLoadData(data)
      }
    },

    handleTitleClick(e) {
      $(e.target).next('section').toggle()
    },
    // handleScrollLoad() {
    //   let _pages = Math.ceil(this.total / this.pageSize)
    //   //如果当前已是最后一页
    //   console.log('111111111',_pages, this.pageNo + 1)
    //   if (_pages == this.pageNo + 1) {
    //     return
    //   }
    //   let element = document.getElementById('scrollPaginationPhrase')
    //   let boxHeight = $(element).outerHeight()
    //   let contentHeight = element.scrollHeight
    //   //内容区域高度高于内容高度 直接获取下一页
    //   console.log('33333333',boxHeight, contentHeight)
    //   if (boxHeight > contentHeight) {
    //     this.getNextPage()
    //   }
    //   $(element).scroll(() => {
    //     // 滚动区域高度
    //     let boxHeight = $(element).outerHeight()
    //     // 滚动条滚动高度
    //     let scrollTop = $(element).scrollTop()
    //     // 整个内容区域的高度
    //     let contentHeight = element.scrollHeight
    //     if (
    //       contentHeight - boxHeight - scrollTop <= 10 &&
    //       this.phraseList.length < this.total
    //     ) {
    //       //如果当前已是最后一页

    //       console.log('222222',_pages, this.pageNo + 1)
    //       if (_pages == this.pageNo + 1) {
    //         return
    //       }
    //       this.getNextPage()
    //     }
    //   })
    // },
    getNextPage() {
      this.moreLoading = true
      this.pageNo++
      this.handleLoadData(this.currentInpEmrPhraseCatagory)
    },
  },
}
</script>

<style lang="scss" scoped>
.pub-auxiliary-header {
  display: flex;
  align-items: center;
  padding-right: 4em;
  /deep/ .el-radio-group {
    display: block;
    margin: 6px auto;
  }
}

.pub-auxiliary-content {
  display: flex;
  flex-direction: column;
  .search-content {
    height: 52px;
    padding: 8px 0;
    display: flex;
    /deep/.el-input {
      flex: 1;
    }

    /deep/ .el-button {
      margin-left: 4px;
      padding: 0 9px;
      height: 32px;
    }
  }
}

.phrase-list-section {
  display: flex;
  height: calc(100% - 52px);
  font-size: 16px;
  .leftSection {
    border-right: 2px solid #d7dbea;
    overflow: auto;
    ul {
      li {
        padding: 0 4px;
        line-height: 2;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        cursor: pointer;

        &.active {
          color: var(--COLOR-NORMAL);
          background: var(--COLOR-ACTIVE-BG);
        }

        &:hover {
          color: var(--COLOR-NORMAL);
        }
      }
    }
  }

  .rightSection {
    padding-left: 8px;
    overflow: auto;
    .load-more {
      text-align: center;
      padding: 16px 8px 8px;
    }
    ul {
      li {
        position: relative;
        padding: 4px 0;
        border-bottom: 1px dashed #d7dbea;

        .opt {
          position: absolute;
          right: 0;
          top: 6px;
          i {
            cursor: pointer;
            padding: 4px;
          }
        }

        .el-link {
          position: absolute;
          right: 3px;
          top: 36px;
          font-size: 14px;
        }

        div {
          padding-right: 50px;
          line-height: 30px;
          white-space: nowrap;
          text-overflow: ellipsis;
          word-break: break-all;
          max-width: 70%;
          overflow: hidden;
        }

        section {
          position: relative;
          margin-right: 36px;
          height: 24px;
          overflow: hidden;
          p {
            color: #666;
            font-size: 14px;
            line-height: 24px;
          }
        }
      }
    }
  }
}

.custom-tree {
  .custom-tree-node {
    flex: 1 1 auto;
    width: calc(100% - 18px);

    ul {
      padding-left: 18px;
      li {
        border-bottom: none;
        padding: 0 4px 0 0;
        & + li {
          border-top: 1px dashed #d7dbea;
        }
        section {
          display: none;
          margin-right: 0;
          height: auto;
        }
      }
    }
  }
  /deep/ .el-tree-node__content {
    height: auto;
    align-items: flex-start;
  }
  /deep/ .el-tree-node {
    white-space: normal;
  }
}
</style>
