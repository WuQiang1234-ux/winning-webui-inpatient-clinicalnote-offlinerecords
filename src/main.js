import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import router from './router'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import './style/note.scss'
import './directive/dialogDragable'
Vue.config.productionTip = false
Vue.use(ElementUI)
new Vue({
  router,
  store,
  data: {
    eventHub: new Vue(),
  },
  render: (h) => h(App),
}).$mount('#app')
