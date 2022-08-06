// import Vue from 'vue'
import { PgEditorProvideKeys } from '../constants'
import getStore from '../store'
import getEventEmitter from '../event_emitter'

export default function () {
  return {
    data() {
      this._store = getStore()
      this.eventEmitter = getEventEmitter()
      return {}
    },
    computed: {
      store() {
        return this._store
      }
    },
    provide() {
      return {
        [PgEditorProvideKeys.PG_EDITOR_STORE]: this.store,
        [PgEditorProvideKeys.PG_EDITOR_EVENT_EMITTER]: this.eventEmitter
      }
    }
  }
}
