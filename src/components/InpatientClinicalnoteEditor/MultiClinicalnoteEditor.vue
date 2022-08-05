<template>
  <PgEditor
    ref="pgEditorDom"
    :patientInfo="currentPatientInfo"
    :toolbarOptions="{ isShow: false }"
  />
</template>
<script>
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import { EditorEvent, DataElementWinIds } from '@/libs/PgEditor/constants'
import { cb2promise } from '@/utils/convertFunction'
import BaseEditor from './BaseEditorPg'
import { decompress } from './BaseEditorPg/utils'
import {
  FillingFuncsForClinicalnote,
  FillingFuncsForSerialClinicalnote
} from './BaseEditorPg/function/fillingFuncs'
export default {
  name: 'MultiClinicalnoteEditor',
  extends: BaseEditor,
  props: {
    isSubmiting: {
      type: Boolean,
      default: false
    },
    emrList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      signaturePicInfo: null
    }
  },
  computed: {
    ...mapState(['userInfo']),
    userName() {
      return this.userInfo.employeeName
    }
  },
  watch: {
    isSubmiting: {
      handler(v) {
        v && this.handleSubmitMultiClinicalnote()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    //清空父组件里的加载逻辑
    async handleLoadClinicalnoteContentAction() {},
    async handleSubmitMultiClinicalnote() {
      await this.handleLoadMultiXMLs()
      for (let i = 0; i < this.emrList.length; i++) {
        let item = this.emrList[i]
        const { content } = this.clinicalnoteData
        let formatData = {
          id: item.inpatEmrSetId,
          emrSetId: item.inpatEmrSetId,
          emrSetTitle: item.inpatEmrSetTitle,
          emrTypeId: item.inpatEmrTypeId,
          inpatientMrtId: item.inpatientMrtId,
          inpMrtMonitorId: item?.inpMrtMonitorId ?? item?.inpatientMrtTypeId,
          hasContent: item.inpatEmrSetStatusCode !== '960074',
          createdAt: item.createdAt,
          inpatEmrSetFileTime: item.inpatEmrSetFileTime,
          modifiedAt: item.modifiedAt,
          xml: item.inpatientEMRContent.inpatEmrContentData,
          inpatEmrRecordId: item?.inpatEmrRecordId,
          permission: item.permissionGetOutputVO,
          emrStatusCode:
            item?.inpEmrDisplayStatusCode || item?.inpatEmrSetStatusCode,
          inpatEmrSetStatusCode: item?.inpatEmrSetStatusCode,
          mrtEditorTypeCode: item?.inpatientEMRContent?.mrtEditorTypeCode,
          inpEmrDoctorId: item?.inpEmrDoctorId,
          sealedStatus: item?.sealedStatus, //399572897 表示病历封存
          casePrintStatus: item?.casePrintStatus, //399572894 表示病历已打印
          caseSpecialPermissionStatus: item?.caseSpecialPermissionStatus //399576453 已打印特批状态
        }
        Object.assign(content, formatData)
        //没有内容：说明病历处于新建状态下 需填充一些默认数据
        if (!content.hasContent) {
          // 设置页码
          this.insertPageNum()
          // 填充二维码内容
          this.setQrCodeContent()
          await this.injectPresetSystemDataForClinicalnoteAsync().catch(
            () => {}
          ) //填充基本信息
          if (content.emrTypeId == '121383422926546946') {
            this.fillingFuncs = new FillingFuncsForSerialClinicalnote(this)
            this.clinicalnoteData.content.list = [content]
          } else {
            this.fillingFuncs = new FillingFuncsForClinicalnote(this)
          }
          await this.fillingFuncs.init(content.emrSetId)
          await this.injectUpdateVitalSignsDataAsync() //生命体征
          //智能联动 需要依赖权限 所以放最后
          await this.insertClinicalnoteQuickInputData()
          // 诊断插入
          await this.injectDiagnosisAsync(content.inpMrtMonitorId)
        }

        await this.handleSubmitClinicalnote()
          .then(e => {
            console.log('批量提交成功：', e, item)
            item.isSubmited = true
            if (item.inpatEmrTypeId !== '121383422926546946') {
              this.$root.eventHub.$emit('clinicalnote/refreshXml', {
                editorId: item.inpatEmrSetId
              })
            }
          })
          .catch(e => {
            console.log('批量提交失败：', e, item)
            item.isSubmited = false
            //关闭loading
            this.showClinicalnoteProcessing(false)
          })
      }

      let subDocIds = []
      this.emrList.forEach(v => {
        if (v.inpatEmrTypeId == '121383422926546946' && v.isSubmited) {
          subDocIds.push(v.inpatEmrSetId)
        }
      })
      if (subDocIds.length) {
        this.$root.eventHub.$emit('clinicalnote/refreshXml', {
          editorId: this.currentPatientInfo.encounterId + '121383422926546946',
          subDocIds
        })
      }

      this.$emit('complete') //批量提交
      this.$message({
        message: '批量提交已结束！',
        type: 'success'
      })
    },
    async handleLoadMultiXMLs() {
      let pgEditor = this.getEditor()
      const load = (cb = () => {}) => {
        pgEditor.eventEmitter.$once(EditorEvent.PG_EVENT_XML_ONLOAD, () => {
          cb()
        })
        const options = this.emrList.map(item => {
          let xml = ''
          if (item.inpatientEMRContent.inpatEmrContentData) {
            xml = decompress(item.inpatientEMRContent.inpatEmrContentData)
          }

          return {
            docId: item.inpatEmrSetId,
            xml
          }
        })
        pgEditor.pgEditorInstance.postmessage({
          type: 'FilesOpen',
          param: [options]
        })
        console.log('加载多份病历---------', options)
      }

      if (!pgEditor?.pgEditorLoaded) {
        await pgEditor.waitEditorLoaded()
      }
      await cb2promise(cb => {
        load(cb)
      })
    },

    async handleSubmitClinicalnote() {
      this.showClinicalnoteProcessing(true)
      await this.prohibitedWords.setProhibitedWords()
      //电子签名通过混合框架保存id
      this.emitHybridEvent('399556282', true)
      await this.verifyDoc() //校验
      this.sendMessageToOutpatients()
      await this.sendingDataSourceInformation(
        this.clinicalnoteData.content.emrTypeId == '121383422926546946',
        this.currentDocId
      )
      //若有签名时间则更新签名时间
      const pgEditor = this.getEditor()
      let hasSignTimeCpt = pgEditor.signatureHelper.isNeedsSignature(
        this.emrSetId,
        DataElementWinIds.SIGNATURE_DATETIME //医师签名时间
      )
      if (hasSignTimeCpt) {
        pgEditor.signatureHelper.setSignatureTime({
          docId: this.currentDocId,
          signTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
      }

      await this.signClinicalnote(
        DataElementWinIds.DATA_ELEMENT_WIN_ID_OF_SIGNATURE
      )
      await this.submitClinicalnoteAsync()

      this.showClinicalnoteProcessing(false)
    },

    async verifyDoc() {
      const pgEditor = this.getEditor()
      let verifyStatusList = pgEditor.pgEditorInstance.postmessage({
        type: 'GetValidateList',
        param: [
          {
            docId: this.currentDocId
          }
        ]
      })
      if (verifyStatusList?.length) {
        this.$message({
          message: `${this.clinicalnoteData.content.emrSetTitle}数据不完善，请完善信息再提交！`,
          type: 'warning'
        })
        return Promise.reject()
      }
    }
  }
}
</script>
