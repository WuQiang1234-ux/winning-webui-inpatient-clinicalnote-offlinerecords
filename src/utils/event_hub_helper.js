export default function getEventHubHelper(ee) {
  let eventHandlers = []
  return {
    on(eventName, handler) {
      ee.$on(eventName, handler)
      eventHandlers.push({
        eventName,
        handler
      })
    },
    off(eventName, handler) {
      ee.$off(eventName, handler)
      const index = eventHandlers.findIndex(item => {
        return item.eventName === eventName && item.handler === handler
      })
      eventHandlers.splice(index)
    },
    destroy() {
      eventHandlers.forEach(item => {
        ee.$off(item.eventName, item.handler)
      })
      eventHandlers = []
    },
    emit(eventName, ...params) {
      ee.$emit(eventName, ...params)
    }
  }
}

export function createEventKeyWithNamespace(namespace) {
  return function (key) {
    return `${namespace}_${key}`
  }
}
