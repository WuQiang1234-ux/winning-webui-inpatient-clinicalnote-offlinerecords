import Vue from 'vue'
import patientRootComponentStore from './index'
applyMixin(Vue)
function applyMixin(Vue) {
  Vue.mixin({ beforeCreate: vuexInit })
}
function vuexInit() {
  var options = this.$options
  // store injection

  if (options.name == 'patientRootComponent') {
    this.$patientRootComponentStore = patientRootComponentStore()
  } else if (options.parent && options.parent.$patientRootComponentStore) {
    this.$patientRootComponentStore = options.parent.$patientRootComponentStore
  }
}
