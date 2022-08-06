import Vue from 'vue'
export default function getEventEmitter() {
  const target = new Vue()
  target.timeStamp = new Date().getTime()
  return target
}
