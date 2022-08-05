import { MessageBox } from 'element-ui'
import store from '@/store'
export default class ProhibitedWords {
  constructor(pgEditor, patientInfo) {
    this.pgEditor = pgEditor
    this.patientInfo = patientInfo
    this.prohibitedWordsList = []
    this.init()
  }

  async init() {
    if (
      !store.state.globalConfig.prohibitedWords[this.patientInfo.genderCode]
    ) {
      //获取签名图片信息
      await store.dispatch(
        'globalConfig/getProhibitedWords',
        this.patientInfo.genderCode
      )
    }
    this.prohibitedWordsList =
      store.state.globalConfig.prohibitedWords[this.patientInfo.genderCode]
  }

  setProhibitedWords(docId = '') {
    if (!this.prohibitedWordsList?.length) return
    let ProhibitedWordsInDoc = this.pgEditor.pgEditorInstance.postmessage({
      type: 'ProhibitedDoc',
      param: [
        {
          docId,
          ProhibiteList: this.prohibitedWordsList
        }
      ]
    })

    console.log(ProhibitedWordsInDoc, '调用编辑器违禁词验证---')

    if (ProhibitedWordsInDoc?.length && ProhibitedWordsInDoc[0]?.list?.length) {
      return new Promise((resolve, reject) => {
        let message = '当前病历存在' +
          (this.patientInfo.genderCode == '50602' ? '男性' : '女性') +
          '病人违禁词：' +
          ProhibitedWordsInDoc[0].list.join('、') + '，是否继续提交该病历？'
        MessageBox.confirm(message, '提示', {
          confirmButtonText: ' 是 ',
          cancelButtonText: ' 否 ',
          type: 'warning'
        }).then(() => {
          console.log(1)
          resolve(true)
        }).catch(() => {
          console.log(0)
          reject()
        })
      })
    }
  }
}
