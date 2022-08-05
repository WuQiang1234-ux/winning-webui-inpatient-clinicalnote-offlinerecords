import apiConfigure from '@/api/configure'
import { isDraftStatus } from '../utils'
import { isAudit } from '@/utils/editor.js'
import { mapState, createNamespacedHelpers } from 'vuex'
const { mapState: clinicalnoteMapStates } = createNamespacedHelpers('emr')

let mixin = {
  data() {
    return {}
  },
  computed: {
    ...mapState([
      'qualityControlData',
      'currentPatientInfo',
      'userInfo',
      'orgInfo'
    ]),
    ...clinicalnoteMapStates(['AllConfigure'])
  },
  methods: {
    async serialPrint(
      loadedSubDocList,
      inpatEmrTypeId,
      pgEditor,
      inpMrtMonitorId,
      emrDocInfo
    ) {
      const { encounterId } = this.currentPatientInfo
      let flag = this.AllConfigure?.data
        .find(el => {
          return el.inpatEmrParamConfigCode === 'DEPT_PRINT_PARAMETER'
        })
        ?.inpatEmrParamConfigContent.includes(this.orgInfo?.orgId)
      //连续病程
      let printStartIndex = loadedSubDocList.findIndex(
        el => !isDraftStatus(el.inpatEmrSetStatusCode)
      )
      if (printStartIndex !== -1) {
        let printPrevList = loadedSubDocList.slice(printStartIndex)
        let printEndIndex = printPrevList.findIndex(el =>
          isDraftStatus(el.inpatEmrSetStatusCode)
        )
        if (printEndIndex == -1) {
          printEndIndex = printPrevList.length
        }
        let printList = printPrevList.slice(0, printEndIndex)
        const res = await apiConfigure.getPrintConfiguration({
          encounterId,
          inpatEmrTypeId
        })
        console.log('查打印次数', res.data, printList)
        //--------

        if (flag) {
          if (isAudit(printList)) {
            this.$message({
              message: '该科室的病历文书需要审签通过才能打印！',
              type: 'warning'
            })
            return Promise.reject()
          }
        }

        printList.forEach(el => {
          const xml = pgEditor.pgEditorInstance.postmessage({
            type: 'FileSave',
            param: [{ docId: el.id }]
          })[0].xml
          let activatedPrintItem = res.data.find(
            ele => el.id == ele.inpatEmrSetId
          )
          let isPrint = activatedPrintItem.printed

          let printMaxCount = +(activatedPrintItem?.printMaxCount ?? -1)
          let printCount = +(activatedPrintItem.printedCount || 0)
          // let printEnabledFlag = activatedPrintItem.printLockFlag == '98175'//是否允许打印标志
          console.log('最大打印次数', printMaxCount, '当前的打印数', printCount)
          emrDocInfo.push({
            docId: el.id,
            docName: el.emrSetTitle,
            emrTypeId: inpatEmrTypeId,
            docContent: xml,
            isPrtNewPage: el?.newPage || false,
            hasPrtCount: printCount,
            maxAlPrtCount: printMaxCount,
            // printEnabledFlag,
            isPrint,
            isCommit: true,
            isHideTab: false
          })
        })
        console.log(
          JSON.stringify(emrDocInfo.map(el => ({ isPrint: el.isPrint }))),
          '打印控制前'
        )
        emrDocInfo.forEach((el, i) => {
          if (i && !emrDocInfo[i - 1].isPrint) {
            el.isPrint = false
          }
        })
        if (emrDocInfo.length) {
          inpMrtMonitorId = loadedSubDocList?.find(v => {
            return v.id == emrDocInfo[0].docId
          })?.inpMrtMonitorId
        }

        console.log(
          JSON.stringify(emrDocInfo.map(el => ({ isPrint: el.isPrint }))),
          '打印控制后'
        )
      } else {
        console.log('当前没有可打印的病历')
      }
    },
    async ordinaryPrint(
      emrSetId,
      pgEditor,
      inpatEmrSetStatusCode,
      inpatEmrTypeId,
      docName,
      emrDocInfo
    ) {
      const { encounterId } = this.currentPatientInfo
      let flag = this.AllConfigure?.data
        .find(el => {
          return el.inpatEmrParamConfigCode === 'DEPT_PRINT_PARAMETER'
        })
        ?.inpatEmrParamConfigContent.includes(this.orgInfo?.orgId)
      if (flag) {
        if (isAudit([{ inpatEmrSetStatusCode }])) {
          this.$message({
            message: '该科室的病历文书需要审签通过才能打印！',
            type: 'warning'
          })

          return Promise.reject()
        }
      }
      //普通的
      const res = await apiConfigure.getPrintConfiguration({
        encounterId,
        inpatEmrTypeId
      })
      console.log('查打印次数000', flag, res.data)

      let activatedPrintItem = res.data.find(
        ele => emrSetId == ele.inpatEmrSetId
      )
      let isPrint = activatedPrintItem.printed
      let printMaxCount = +(activatedPrintItem?.printMaxCount ?? -1)

      let printCount = +(activatedPrintItem.printedCount || 0)
      // let printEnabledFlag = activatedPrintItem.printLockFlag == '98175'//是否允许打印标志
      console.log('最大打印次数', printMaxCount, '当前的打印数', printCount)
      if (printMaxCount !== -1 && printMaxCount <= printCount) {
        this.$message({
          message: '当前病历已超过最多打印次数，不能打印!',
          type: 'warning'
        })

        return Promise.reject()
      }
      const xml = pgEditor.pgEditorInstance.postmessage({
        type: 'FileSave',
        param: [{ docId: this.currentDocId }]
      })[0].xml
      emrDocInfo.push({
        docId: emrSetId,
        docName,
        emrTypeId: inpatEmrTypeId,
        docContent: xml,
        isHideTab: true,
        isPrtNewPage: false,
        isPrint,
        hasPrtCount: printCount,
        maxAlPrtCount: printMaxCount,
        // printEnabledFlag,
        isCommit: !isDraftStatus(inpatEmrSetStatusCode)
      })
      console.log(emrDocInfo)
    },
    async consultationPrint(
      emrSetId,
      pgEditor,
      inpatEmrTypeId,
      docName,
      inpatEmrSetStatusCode,
      emrDocInfo
    ) {
      const { encounterId } = this.currentPatientInfo
      //会诊单
      let xml = pgEditor.pgEditorInstance.postmessage({
        type: 'SaveDocsAsXml',
        param: []
      })

      let xmlList = xml.split('<?xml version="1.0" encoding="utf-8"?>')
      xmlList.shift()
      const res = await apiConfigure.getPrintConfiguration({
        encounterId,
        inpatEmrTypeId
      })
      console.log('查打印次数', res.data)

      console.log('xmlList', xmlList)
      let activatedPrintItem = res.data.find(
        ele => emrSetId == ele.inpatEmrSetId
      )
      let isPrint = activatedPrintItem.printed
      let printMaxCount = +(activatedPrintItem?.printMaxCount ?? -1)
      let printCount = +(activatedPrintItem.printedCount || 0)
      // let printEnabledFlag = activatedPrintItem.printLockFlag == '98175'//是否允许打印标志
      console.log('最大打印次数', printMaxCount, '当前的打印数', printCount)
      if (printMaxCount !== -1 && printMaxCount <= printCount) {
        this.$message({
          message: '当前病历已超过最多打印次数，不能打印!',
          type: 'warning'
        })

        return Promise.reject()
      }
      xmlList.forEach(el => {
        emrDocInfo.push({
          docId: emrSetId,
          docName,
          emrTypeId: inpatEmrTypeId,
          docContent: el,
          isPrtNewPage: false,
          isPrint,
          hasPrtCount: printCount,
          maxAlPrtCount: printMaxCount,
          // printEnabledFlag,
          isHideTab: true,
          isCommit: !isDraftStatus(inpatEmrSetStatusCode)
        })
      })
      console.log(emrDocInfo)
    }
  }
}

export default mixin
