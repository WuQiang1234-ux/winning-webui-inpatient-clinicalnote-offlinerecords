<template>
  <div style="width:0;height:0;opacity:0">
    <PgEditor
      ref="cloneSignatureEditor"
      :patientInfo="currentPatientInfo"
      :toolbarOptions="{ isShow: false }"
    />
  </div>
</template>
<script>
import dayjs from 'dayjs'
import PgEditor from '@/libs/PgEditor'
import { EditorEvent } from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
import { mapState, createNamespacedHelpers } from 'vuex'
import { compress } from '../utils'
import api from '@/api/list'
const {
  mapState: clinicalnoteMapStates,
  mapMutations: clinicalnoteMapMutations
} = createNamespacedHelpers('emr')
export default {
  name: 'CloneSignatureEditor',
  components: {
    PgEditor
  },
  props: {
    clinicalnoteData: {
      type: Object,
      default() {
        return null
      }
    }
  },
  data() {
    return {}
  },
  computed: {
    ...clinicalnoteMapStates(['activateMenu']),
    ...mapState(['currentPatientInfo', 'orgInfo'])
  },
  async mounted() {
    this.pgEditor = this.$refs['cloneSignatureEditor']
    console.log('清除签名元素编辑器--', this.$parent)
    await this.loadClinicalnoteXmlAsync()
    await this.pgEditor.signatureHelper.clearAllSignature(
      this.clinicalnoteData.emrSetId
    )
    await this.handleCloneClinicalnote()
  },
  methods: {
    ...clinicalnoteMapMutations(['setNearestCreatedEmrId']),
    async loadClinicalnoteXmlAsync() {
      const xml = this.clinicalnoteData.content.xml
      const load = (cb = () => {}) => {
        this.pgEditor.eventEmitter.$once(
          EditorEvent.PG_EVENT_XML_ONLOAD,
          () => {
            cb()
          }
        )
        this.pgEditor.pgEditorInstance.postmessage({
          type: 'FileOpen',
          param: [
            {
              srcstr: xml,
              docId: this.clinicalnoteData.emrSetId
            }
          ]
        })
      }

      if (!this.pgEditor?.pgEditorLoaded) {
        await this.pgEditor.waitEditorLoaded()
      }

      await cb2promise(cb => {
        load(cb)
      })
    },
    getNewXml() {
      let xml = this.pgEditor.pgEditorInstance.postmessage({
        type: 'SaveFileWithNotTrace',
        param: [{ docId: this.clinicalnoteData.emrSetId }]
      })[0].xml
      console.log(xml)
      return xml
    },
    handleCloneClinicalnote() {
      const xml = this.getNewXml()
      let inpEmrContxtData = compress(xml)
      let createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
      let {
        inpatEmrSetListTitle,
        inpatEmrSetTitle,
        inpatEmrTypeId,
        inpatientMrtId,
        inpMrtMonitorId,
        inpEmrDoctorId
      } = this.clinicalnoteData.content
      api
        .batchSaveClinicalnote({
          encounterId: this.currentPatientInfo.encounterId,
          bizRoleId: this.currentPatientInfo.bizRoleId,
          inpEmrSetCreateList: [
            {
              bizRoleId: this.currentPatientInfo.bizRoleId,
              encounterId: this.currentPatientInfo.encounterId,
              patientId:
                this.currentPatientInfo?.patientInfoOutput?.patientId ?? '',
              inpatEmrSetFileTime: createdAt,
              createdAt,
              inpatEmrSetStatusCode: '960074',
              mrtTypeCode: '399303381',
              inpatEmrSetId: '',
              reviewedBy: '',
              seqNo: '',
              withdrawnBy: '',
              encDeptId: this.orgInfo.orgId,
              DeptName: this.orgInfo.orgName,
              inpatEmrSetListTitle,
              inpatEmrSetTitle,
              inpatEmrTypeId,
              inpatientMrtId,
              inpMrtMonitorId,
              inpEmrDoctorId,
              cloneEmrSetId: this.clinicalnoteData.emrSetId,
              inpEmrContxtData
            }
          ]
        })
        .then(res => {
          let {
            data: { returnCode, inpEmrSetIdList, returnMsgList }
          } = res
          if (returnCode) {
            if (inpEmrSetIdList.length) {
              let { emrSetId, commonOutputInfo } = inpEmrSetIdList[0]
              if (emrSetId) {
                this.setNearestCreatedEmrId(emrSetId)
                this.$message({
                  showClose: true,
                  message: '病历克隆成功！',
                  type: 'success'
                })
                if (this.activateMenu == 'emr_tree') {
                  //重新获取树结构
                  this.$root.eventHub.$emit('clinicalnote/refreshTreeData', {
                    inpatEmrTypeId: inpatEmrTypeId,
                    inpatEmrSetId: emrSetId
                  })
                } else {
                  //重新获取时间轴数据
                  this.$root.eventHub.$emit(
                    'clinicalnote/refreshTimeLineData',
                    emrSetId
                  )
                }
              } else {
                this.$message({
                  showClose: true,
                  message: commonOutputInfo.returnMsg,
                  type: 'warning'
                })
              }
            }
          } else {
            if (returnMsgList.length) {
              this.$message({
                showClose: true,
                message: returnMsgList[0],
                type: 'warning'
              })
            }
          }

          this.$emit('close')
        })
        .catch(() => {
          this.$emit('close')
        })
    }
  }
}
</script>
