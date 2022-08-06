import Vue from 'vue'
import _ from 'lodash'
import editor from './editor'
import toolbar from './toolbar'

import widgetAiRecommendTip from './widget_ai_recommend_tip'
import widgetContextMenu from './widget_context_menu'
import widgetMedicalFormulaDialog from './widget_medical_formula_dialog'
import widgetSpecialSymbolsDialog from './widget_special_symbols_dialog'
import widgetDiagnosisDialog from './widget_diagnosis_dialog'
import widgetDynamicCollectionDialog from './widget_dynamic_collection_dialog'

const planStore = {
  editor,
  toolbar,

  widgetAiRecommendTip,
  widgetContextMenu,
  widgetMedicalFormulaDialog,
  widgetSpecialSymbolsDialog,
  widgetDiagnosisDialog,
  widgetDynamicCollectionDialog
}

function enhanceStoreMutations(store) {
  const storeSliceKeys = _.keys(store)

  _.forEach(storeSliceKeys, function (storeSliceKey) {
    const storeSlice = store[storeSliceKey]
    const mutations = storeSlice.mutations
    const mutationKeys = _.keys(mutations)

    _.forEach(mutationKeys, function (mutationKey) {
      mutations[mutationKey] = _.bind(mutations[mutationKey], storeSlice)
    })
  })

  return store
}

export default function getStore() {
  const store = _.mapValues(_.cloneDeep(planStore), val => {
    val.state = Vue.observable(val.state)
    val.timeStamp = new Date().getTime()
    return val
  })

  return enhanceStoreMutations(store)
}
