import { PgEditorProvideKeys } from '../constants'

export default function () {
  return {
    data() {
      this.eventEmitter = this[PgEditorProvideKeys.PG_EDITOR_EVENT_EMITTER]
      return {}
    },
    computed: {
      store() {
        return this[PgEditorProvideKeys.PG_EDITOR_STORE]
      }
    },
    inject: [
      PgEditorProvideKeys.PG_EDITOR_STORE,
      PgEditorProvideKeys.PG_EDITOR_EVENT_EMITTER
    ]
  }
}
