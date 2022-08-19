<template>
  <div v-loading="clinicalnoteProcessing" class="multi-clinicalnote-board-wrap">
    <div class="multi-clinicalnote-board-content">
      <!--编辑器只需要 普通病历、连续病程、只读的、会诊记录   其他的通过参数区分即可   -->
      <el-tabs
        v-model="currentId"
        class="multi-clinicalnote-board-tab"
        type="card"
        closable
        @tab-remove="handleTabRemove"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="item in $patientRootComponentStore.state.multi_clinicalnote_board_state.loadedClinicalnoteList"
          :key="item.id"
          :label="item.title"
          :name="item.id"
        >
          <template v-if="item.type === clinicalnoteTypes.INPATIENT_CLINICALNOTE">
            <inpatient-clinicalnote-editor :id="item.id" :clinicalnoteData="item.options"></inpatient-clinicalnote-editor>
          </template>
          <template v-else-if="item.type === clinicalnoteTypes.MEDICAL_RECORD">
            <medical-record-container :id="item.id" :clinicalnoteData="item.options"></medical-record-container>
          </template>
          <template v-else-if="item.type === clinicalnoteTypes.CONSULTATION_SINGLE">
            <consultation-editor
              :id="item.id"
              isHome
              @cancelConsultationSucceed="cancelConsultationSucceed"
              :clinicalnoteData="item.options"
              :entrancePermisstionIds="entrancePermisstionIds"
            ></consultation-editor>
          </template>
          <template v-else-if="item.type === clinicalnoteTypes.READ_ONLY">
            <readonlyEditor :id="item.id" :clinicalnoteData="item.options"></readonlyEditor>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- // todo 插槽放空信息 -->
    <slot></slot>
  </div>
</template>

<script>
/*eslint no-undef: "error"*/
// import api from '@/api/list'
import getEventHubHelper from '@/utils/event_hub_helper.js'
import { createNamespacedHelpers } from 'vuex'
import InpatientClinicalnoteEditor from '../InpatientClinicalnoteEditor/index.vue'
// import MedicalRecordContainer from '../MedicalRecordContainer'
import ConsultationEditor from '../InpatientClinicalnoteEditor/consultationEditor'
import readonlyEditor from '../InpatientClinicalnoteEditor/readonlyEditor'
const { mapState: componentsMapStates } = createNamespacedHelpers(
  'components/multiClinicalnoteBoardState'
)
import { createEventKeyWithNamespace } from '@/utils/event_hub_helper.js'
import { ClinicalnoteEditorEventKeys } from '@/components/InpatientClinicalnoteEditor'

export const ClinicalnoteTypes = {
  INPATIENT_CLINICALNOTE: 'INPATIENT_CLINICALNOTE',
  MEDICAL_RECORD: 'MEDICAL_RECORD',
  CONSULTATION_SINGLE: 'CONSULTATION_SINGLE',
  ARCHIVE_REVIEW: 'ARCHIVE_REVIEW',
  PERSONAL_TEMPLATE: 'PERSONAL_TEMPLATE',
  READ_ONLY: 'READ_ONLY',
  REVISE_CLINICALNOTE: 'REVISE_CLINICALNOTE',
  MEDTECH_REPORT_IPT: 'MEDTECH_REPORT_IPT',
  INPCLI_SIGN_OFFORDER: 'INPCLI_SIGN_OFFORDER',
  HISTORY_APPLY_FORM: 'HISTORY_APPLY_FORM',
  DOCTOR_READING_LIST: 'DOCTOR_READING_LIST',
  NURSE_VIEW: 'NURSE_VIEW',
  OUTPATIENT_EDITOR: 'OUTPATIENT_EDITOR',
}
const createEventKey = createEventKeyWithNamespace(
  'MULTI_CLINICALNOTE_BOARD_EVENT'
)
export const MultiClinicalnoteBoardEventKeys = {
  TAB_ADD: createEventKey('TAB_ADD'),
  //TAB_REMOVE: createEventKey('TAB_REMOVE'),
  TAB_CLICK: createEventKey('TAB_CLICK'),
}

export default {
  name: 'MultiClinicalnoteBoard',
  components: {
    InpatientClinicalnoteEditor,
    // MedicalRecordContainer,
    ConsultationEditor,
    readonlyEditor,
  },
  data() {
    return {
      entrancePermisstionIds: [
        '399297352',
        '399297355',
        '399297356',
        '399442431',
      ], //暂存、提交、撤销提交、取消
    }
  },
  computed: {
    ...componentsMapStates(['clinicalnoteProcessing']),
    loadedClinicalnoteIdList() {
      return this.$patientRootComponentStore.getters[
        'multi_clinicalnote_board_state/loadedClinicalnoteIdList'
      ]
    },
    currentActiveLoadedClinicalnoteId() {
      return this.$patientRootComponentStore.getters[
        'multi_clinicalnote_board_state/currentActiveLoadedClinicalnoteId'
      ]
    },
    loadedClinicalnoteList() {
      return this.$patientRootComponentStore.state
        .multi_clinicalnote_board_state.loadedClinicalnoteList
    },
    currentPatientInfo() {
      return this.$patientRootComponentStore.state.currentPatientInfo
    },

    clinicalnoteTypes() {
      return ClinicalnoteTypes
    },
    currentId: {
      get() {
        return (
          this.$patientRootComponentStore.state.multi_clinicalnote_board_state
            .currentActiveLoadedClinicalnote?.id ?? ''
        )
      },
      set() {},
    },
  },
  created() {
    this.eventHubHelper = getEventHubHelper(
      this.$patientRootComponentStore.state.eventHub
    )
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    async handleDoDelete(id) {
      // let _target = this.loadedClinicalnoteList.find((v) => {
      //   return v.id == id
      // })
      console.log(this.loadedClinicalnoteIdList)
      let _index = this.loadedClinicalnoteIdList.indexOf(id)
      this.$patientRootComponentStore.commit(
        'multi_clinicalnote_board_state/deleteInLoadedClinicalnoteListById',
        id
      )
      if (
        this.$patientRootComponentStore.state.multi_clinicalnote_board_state
          .currentActiveLoadedClinicalnote.id == id
      ) {
        if (_index - 1 >= 0) {
          this.$patientRootComponentStore.commit(
            'multi_clinicalnote_board_state/setCurrentActiveClinicalnoteById',
            this.loadedClinicalnoteIdList[_index - 1]
          )
        } else {
          this.$patientRootComponentStore.commit(
            'multi_clinicalnote_board_state/setCurrentActiveClinicalnoteById',
            this.loadedClinicalnoteIdList[0]
          )
        }
      }

      if (this.loadedClinicalnoteIdList.length == 0) {
        this.$patientRootComponentStore.commit(
          'multi_clinicalnote_board_state/clearLoadedClinicalnoteList'
        )
      }
    },
    async handleTabRemove(id, action) {
      console.log(id, action, '关闭呀关闭-----')
      //1.当前窗口没有被激活的话直接关闭,
      //2.激活的是住院病历首页直接关闭
      //3.激活的会诊记录直接关闭
      let { type } =
        this.$patientRootComponentStore.state.multi_clinicalnote_board_state
          .currentActiveLoadedClinicalnote
      // console.log(this.currentId, id)
      // debugger
      let flag =
        this.currentId !== id ||
        type == 'MEDICAL_RECORD' ||
        type == 'CONSULTATION_SINGLE' ||
        type == 'PERSONAL_TEMPLATE' ||
        type == 'MEDTECH_REPORT_IPT' ||
        type == 'INPCLI_SIGN_OFFORDER' ||
        type == 'HISTORY_APPLY_FORM' ||
        type == 'DOCTOR_READING_LIST' ||
        type == 'OUTPATIENT_EDITOR' ||
        type == 'READ_ONLY'

      if (action === 'delete' || flag) {
        this.handleDoDelete(id)
      } else {
        this.eventHubHelper.emit(
          ClinicalnoteEditorEventKeys.MEDICAL_RECORDS_BEFORE_DELETION,
          id,
          () => {
            this.handleDoDelete(id)
          },
          this.currentPatientInfo?.encounterId
        )
      }
    },
    handleTabClick(tab) {
      if (tab.name == this.currentActiveLoadedClinicalnoteId) return
      this.$patientRootComponentStore.commit(
        'multi_clinicalnote_board_state/setCurrentActiveClinicalnoteById',
        tab.name
      )
      if (this.currentActiveLoadedClinicalnoteId.includes('readonly')) return
      let currentClinicalnote = this.loadedClinicalnoteList[tab.index]
      let id = this.getEmrSetId(currentClinicalnote)
      console.log(
        currentClinicalnote.options.content.emrTypeId,
        'currentClinicalnote.options.content.emrTypeId'
      )
      this.eventHubHelper.emit(MultiClinicalnoteBoardEventKeys.TAB_CLICK, {
        id,
        typeId: currentClinicalnote.options.content.emrTypeId,
      })
    },

    getEmrSetId(data) {
      return data.options.content.emrSetId
    },
    cancelConsultationSucceed(emrSetId) {
      //重新获取时间轴病历菜单
      this.$root.eventHub.$emit('clinicalnote/refreshTimeLineData')
      //重新获取树形病历菜单
      this.$root.eventHub.$emit('clinicalnote/refreshTreeData')

      //关闭该病历
      this.$root.eventHub.$emit(
        ClinicalnoteEditorEventKeys.HANDLE_CLOSE_CLINICALNOTE,
        emrSetId
      )
    },
  },
}
</script>

<style lang="scss">
.multi-clinicalnote-board-wrap {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  //box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  align-items: center;

  .multi-clinicalnote-board-content {
    height: 100%;
    width: 100%;
  }
  .el-loading-mask {
    //中间加载层的z-index应低于侧边悬浮的z-index
    z-index: 8;
  }
}
.multi-clinicalnote-board-tab.el-tabs {
  height: 100%;
  width: 100%;
  flex: 1 1 auto;

  & > .el-tabs__header {
    background-color: var(--COLOR-ACTIVE-BG);
    color: #3a3a3a;
    font-size: 16px;
    height: 36px;
    margin: 0 0;
    border-bottom: none;

    .el-tabs__nav {
      border: none;
      z-index: 0;
    }

    .el-tabs__nav-wrap.is-scrollable.is-top {
      .el-tabs__nav-prev,
      .el-tabs__nav-next {
        line-height: 40px;
        padding: 0px 5px;
      }
    }

    .el-tabs__item {
      height: 36px;
      line-height: 36px;

      &.is-active {
        background-color: #ffffff;
        color: var(--COLOR-NORMAL);
      }
    }
  }
  & > .el-tabs__content {
    background-color: #ffffff;
    height: calc(100% - 36px);
    width: 100%;

    .el-tab-pane {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
  }
}
</style>
