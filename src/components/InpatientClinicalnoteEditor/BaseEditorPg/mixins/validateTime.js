import { EditorEvent } from '@/libs/PgEditor/constants'
import api from '@/api/list.js'
import dayjs from 'dayjs'
let validateTimeMixin = {
  data() {
    return {
      cachedBasicDatas: [], //缓存基础数据
      currentInputOldValue: '' //存储日期改变之前的值  用于回填
    }
  },
  beforeDestroy() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_INPUT_CHANGE,
      this.handleDateTimeChange
    )
    pgEditor.eventEmitter.$off(
      EditorEvent.PG_EVENT_INPUT_CLICK,
      this.handleDateTimeInputClick
    )
  },
  mounted() {
    const pgEditor = this.getEditor()
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_INPUT_CHANGE,
      this.handleDateTimeChange
    )
    pgEditor.eventEmitter.$on(
      EditorEvent.PG_EVENT_INPUT_CLICK,
      this.handleDateTimeInputClick
    )
  },
  methods: {
    handleDateTimeInputClick(e) {
      let elId = e.cptId
      if (elId == '399301320' || elId == '399301329') {
        this.currentInputOldValue = e.value
      }
    },
    async handleDateTimeChange(e) {
      let elId = e.CptID
      //手术前小结记录：拟行手术日期(都昌版本和自研版本id不一致兼容)    手术前讨论记录：讨论日期
      if (elId == '399301320' || elId == '399336874' || elId == '399301329') {
        if (this.cachedBasicDatas.length == 0) {
          //获取基础数据
          let res = await api.querySystemConceptData({
            encounterId: this.currentPatientInfo.encounterId
          })

          this.cachedBasicDatas = res.data
        }
        if (!e.Value) return

        //本次设置的时间
        let elValue = dayjs(e.DateTimeValue).format('YYYY-MM-DD')

        //患者入院时间
        let enterTime = this.cachedBasicDatas.find(v => {
          return v.conceptId == '399336454'
        })?.dataValue
        if (enterTime) {
          enterTime = dayjs(enterTime).format('YYYY-MM-DD')

          //如果本次设置的时间小于患者入院时间
          if (elValue < enterTime) {
            let inputText =
              elId == '399301329' ? '讨论日期' : '拟实施手术及操作日期'
            this.$message({
              message: inputText + '不能早于入院时间',
              type: 'warning',
              onClose: () => {
                //修不成功的
                const pgEditor = this.getEditor()
                console.log(
                  'this.currentInputOldValue',
                  e.eleId,
                  this.currentInputOldValue
                )
                pgEditor.pgEditorInstance.postmessage({
                  type: 'SetValue',
                  param: [
                    {
                      conceptId: e.eleId,
                      value: this.currentInputOldValue,
                      valueType: 'text',
                      type: 'normal',
                      idType: 'XID',
                      resetDateTime: false,
                      valueTarget: 'onlyDataElement'
                    }
                  ]
                })
              }
            })
          }
        }
      }
    }
  }
}

export default validateTimeMixin
