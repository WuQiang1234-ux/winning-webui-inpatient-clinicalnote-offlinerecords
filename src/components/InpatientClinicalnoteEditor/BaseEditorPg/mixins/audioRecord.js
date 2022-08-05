let audioRecord = {
  methods: {
    PgEditAudio(message, pgEditor, docId) {
      console.log(message, docId)
      if (!pgEditor) {
        return
      }
      let textAndSelectWords = [
        {
          name: '主诉',
          id: '390000201'
        },
        {
          name: '现病史',
          id: '390000202'
        }
      ]
      let selectWordsBefore = [
        {
          name: '高血压史',
          id: '399309257'
        },
        {
          name: '糖尿病史',
          id: '399322667'
        },
        {
          name: '传染病史',
          id: '399321855'
        },
        {
          name: '手术史',
          id: '399061011'
        },
        {
          name: '输血史',
          id: '391002651'
        },
        {
          name: '过敏史',
          id: '399300493'
        },
        {
          name: '吸烟史',
          id: '399300593'
        },
        {
          name: '饮酒史',
          id: '399320144'
        }
      ]
      let selectWordsAfter = [
        {
          name: '神志',
          id: '399339814'
        },
        {
          name: '精神',
          id: '399309051'
        }
      ]
      const textWords = [
        {
          name: '出生于',
          id: '399392619'
        },
        {
          name: '出身于',
          id: '399392619'
        },
        {
          name: '婚育史',
          id: '390000205'
        },
        {
          name: '婚育时',
          id: '390000205'
        },
        {
          name: '诊疗计划',
          id: '391004202'
        },
        {
          name: '出院医嘱',
          id: '399336736'
        },
        {
          name: '录入日常病程',
          id: '399001367'
        }
      ]
      const numSelectWords = [
        {
          name: '体温',
          id: '399368673'
        },
        {
          name: '脉率',
          id: '399338021'
        },
        {
          name: '脉搏',
          id: '399338021'
        },
        {
          name: '呼吸频率',
          id: '399300780'
        },
        {
          name: '呼吸',
          id: '399300780'
        },
        {
          name: '收缩压',
          id: '390040010'
        },
        {
          name: '舒张压',
          id: '390040011'
        },
        {
          name: '身高',
          id: '399368676'
        },
        {
          name: '体重',
          id: '399336820'
        }
      ]
      let text = message.keywordStr
      let receiveDatas = message.receiveData
      console.log(message)
      if (text != '主诉' && text != '现病史') {
        receiveDatas.forEach(item => {
          if (
            item.word.indexOf('编辑初步诊断') > -1 ||
            item.word.indexOf('添加入院诊断') > -1 ||
            item.word.indexOf('添加修正诊断') > -1 ||
            item.word.indexOf('添加补充诊断') > -1
          ) {
            if (item.type == 'text') {
              pgEditor.store.widgetDiagnosisDialog.mutations.show(true)
            }
          }
        })
        //匹配当前字前面的字去除特殊符号
        selectWordsBefore.forEach(key => {
          receiveDatas.forEach(item => {
            if (item.word.indexOf(key.name) > -1) {
              if (item.type == 'text') {
                let newWords =
                  item.word.indexOf(',') > -1
                    ? item.word.split(',')
                    : [item.word]
                newWords.forEach(word => {
                  if (word.indexOf(key.name) > -1) {
                    let reg = '/([^,.，。]+)' + key.name + '/'
                    if (word.match(eval(reg))) {
                      let newText = word.match(eval(reg))[1]
                      let selectArrs = pgEditor.pgEditorInstance.postmessage({
                        type: 'GetValueListByCptId',
                        param: {
                          conceptId: key.id,
                          docId: ''
                        }
                      })
                      const selectInfo = selectArrs[0]?.valueList.filter(
                        item => {
                          return item.value == newText
                        }
                      )
                      console.log(selectArrs)
                      pgEditor.pgEditorInstance.postmessage({
                        type: 'SetValue',
                        param: [
                          {
                            conceptId: key.id,
                            value: selectInfo[0].key,
                            type: 'normal',
                            buttonIconFlag: true,
                            paragraphFlag: true,
                            KeepTrace: true,
                            valueTarget: 'onlyDataElement'
                          }
                        ]
                      })
                    }
                  }
                })
              }
            }
          })
        })
        //匹配前面和后面特殊符号中间的
        selectWordsAfter.forEach(key => {
          receiveDatas.forEach(item => {
            if (item.word.indexOf(key.name) > -1) {
              if (item.type == 'text') {
                let newWords =
                  item.word.indexOf(',') > -1
                    ? item.word.split(',')
                    : [item.word]
                newWords.forEach(word => {
                  if (word.indexOf(key.name) > -1) {
                    let reg = '/' + key.name + '([^,.，。]+)/'
                    if (word.match(eval(reg))) {
                      let newText = word.match(eval(reg))[1]
                      let selectArrs = pgEditor.pgEditorInstance.postmessage({
                        type: 'GetValueListByCptId',
                        param: {
                          conceptId: key.id,
                          docId: ''
                        }
                      })
                      const selectInfo = selectArrs[0]?.valueList.filter(
                        item => {
                          return item.value == newText
                        }
                      )
                      pgEditor.pgEditorInstance.postmessage({
                        type: 'SetValue',
                        param: [
                          {
                            conceptId: key.id,
                            value: selectInfo[0].key,
                            type: 'normal',
                            buttonIconFlag: true,
                            paragraphFlag: true,
                            KeepTrace: true,
                            valueTarget: 'onlyDataElement'
                          }
                        ]
                      })
                    }
                  }
                })
              }
            }
          })
        })
        //匹配前面和后面特殊符号中间的值
        textWords.forEach(key => {
          receiveDatas.forEach(item => {
            if (item.word.indexOf(key.name) > -1) {
              if (item.type == 'text') {
                let reg = '/' + key.name + '([^,.，。]+)/'
                if (item.word.match(eval(reg))) {
                  let newText = item.word.match(eval(reg))[1]
                  pgEditor.pgEditorInstance.postmessage({
                    type: 'SetValue',
                    param: [
                      {
                        conceptId: key.id,
                        value: newText,
                        type: 'normal',
                        buttonIconFlag: true,
                        paragraphFlag: true,
                        KeepTrace: true,
                        valueTarget: 'onlyDataElement'
                      }
                    ]
                  })
                }
              }
            }
            //去掉开头的符号
            if (text.indexOf(key.name) > -1) {
              if (item.type == 'text') {
                let reg = '/^[,.，。](.+)/'
                if (item.word.match(eval(reg))) {
                  let newText = item.word.match(eval(reg))[1]
                  pgEditor.pgEditorInstance.postmessage({
                    type: 'SetValue',
                    param: [
                      {
                        conceptId: key.id,
                        value: newText,
                        type: 'normal',
                        buttonIconFlag: true,
                        paragraphFlag: true,
                        KeepTrace: true,
                        valueTarget: 'onlyDataElement'
                      }
                    ]
                  })
                } else {
                  pgEditor.pgEditorInstance.postmessage({
                    type: 'SetValue',
                    param: [
                      {
                        conceptId: key.id,
                        value: item.word,
                        type: 'normal',
                        buttonIconFlag: true,
                        paragraphFlag: true,
                        KeepTrace: true,
                        valueTarget: 'onlyDataElement'
                      }
                    ]
                  })
                }
              }
            }
          })
        })
        //获取数值
        numSelectWords.forEach(key => {
          receiveDatas.forEach(item => {
            if (item.word.indexOf(key.name) > -1) {
              if (item.type == 'text') {
                let newWords =
                  item.word.indexOf(',') > -1
                    ? item.word.split(',')
                    : [item.word]
                newWords.forEach(word => {
                  if (word.indexOf(key.name) > -1) {
                    let reg =
                      '/(?<=' + key.name + ')([1-9][0-9]*([\\.][0-9]{1,2})?)/'
                    if (word.match(eval(reg))) {
                      let newText = word.match(eval(reg))[0]
                      console.log(newText)
                      pgEditor.pgEditorInstance.postmessage({
                        type: 'SetValue',
                        param: [
                          {
                            conceptId: key.id,
                            value: newText,
                            type: 'normal',
                            buttonIconFlag: true,
                            paragraphFlag: true,
                            KeepTrace: true,
                            valueTarget: 'onlyDataElement'
                          }
                        ]
                      })
                    }
                  }
                })
              }
            }
          })
        })
      } else {
        console.log('-------8888----')
        console.log(textAndSelectWords, receiveDatas)
        //结构化数据
        textAndSelectWords.forEach(key => {
          if (text.indexOf(key.name) > -1) {
            pgEditor.pgEditorInstance.postmessage({
              type: 'SetValue',
              param: [
                {
                  conceptId: key.id,
                  value: '',
                  type: 'normal',
                  buttonIconFlag: true,
                  paragraphFlag: true,
                  KeepTrace: true,
                  valueTarget: 'onlyDataElement'
                }
              ]
            })

            console.log(key)
            receiveDatas.forEach(item => {
              pgEditor.pgEditorInstance.postmessage({
                type: 'LocateCursorWithInput',
                param: [
                  {
                    cptId: key.id,
                    position: 'innerafter', // after,before,innerbefore,innerafter
                    idType: '',
                    docId: ''
                  }
                ]
              })
              if (item.type == 'select') {
                let newArrs = []
                item.symptoms.forEach((item, index) => {
                  newArrs.push({
                    Text: item,
                    Value: index,
                    Level: '0',
                    Key: item
                  })
                })
                newArrs = [
                  {
                    Text: '测试',
                    Value: 0,
                    Level: '0',
                    Key: '测试'
                  },
                  {
                    Text: '测试1',
                    Value: 0,
                    Level: '0',
                    Key: '测试1'
                  }
                ]
                pgEditor.pgEditorInstance.postmessage({
                  type: 'InsertSingleChoiceDropEle',
                  param: [
                    {
                      elementCode: '', //元素编码
                      elementName: '下拉', //元素名称
                      dataEmementCode: '', //数据元编码
                      dataEmementName: '', //数据元名称
                      conceptDomainCode: '', //概念域ID
                      backgroundText: item.word, //背景文本
                      defaultText: item.word, //默认值
                      activateWay: 'MouseClick', //激活方式
                      expressionInput: item.word, //表达式
                      expressionInput_name: '',
                      emptyFlag: true, //可为空
                      readFlag: false, //只读
                      deleteFlag: true, //可删除
                      printFlag: true, //是否打印
                      skipFlag: true, //是否自动跳入下一元素
                      borderFlag: true, //显示边框
                      underlineFlag: false, //启用下划线
                      addFlag: false, //追加
                      keyFlag: false, //允许键盘输入
                      valueList: newArrs
                    }
                  ]
                })
              } else {
                console.log(666555)
                console.log(item.word)
                pgEditor.pgEditorInstance.postmessage({
                  type: 'InsertString',
                  param: [item.word]
                })
              }
            })
          }
        })
      }
    }
  }
}

export default audioRecord
