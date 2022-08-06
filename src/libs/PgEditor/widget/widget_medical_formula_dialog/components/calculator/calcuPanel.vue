<template>
  <div :class="[panelClass]">
    <table class="panel-table">
      <tbody>
        <tr v-for="(trs, key) in panelList" :key="key">
          <td
            v-for="(tds, index) in trs"
            :key="index"
            :class="{
              symbol: typeof tds.value !== 'number',
              number: typeof tds.value === 'number'
            }"
          >
            <button
              :disabled="tds.disabled"
              :class="[switchNum && tds.isDown ? 'downActive' : '']"
              @click.prevent="hanldCalcsymbol(tds.value, tds.type)"
            >
              {{ tds.text }}
              <template v-if="tds.isKh">
                <div class="showNum">{{ kxkhNum === 0 ? '' : kxkhNum }}</div>
              </template>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  name: 'CalcPanel',
  props: {
    panelList: {
      type: Object,
      default: () => ({})
    },
    panelClass: {
      type: String,
      default: 'operation-panel-standard'
    },
    switchNum: {
      type: Boolean,
      default: false
    },
    kxkhNum: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {
    hanldCalcsymbol(value, type) {
      this.$emit('handle-panel-data', { value, type })
    }
  }
}
</script>
<style lang="scss">
.panel-table {
  table-layout: fixed;
  border-collapse: collapse;
}
.panel-table td {
  text-align: center;
  color: #000000;
  border: 2px solid #e6e6e6;
}

.operation-panel-standard table td button {
  cursor: pointer;
  height: 49.13px;
  width: 76.5px;
  border: none;
  outline: none;
}
.operation-panel-standard .symbol button {
  font-size: 18px;
  background-color: #f0f0f0;
  font-weight: 400;
}
.operation-panel-standard .number button {
  font-size: 24px;
  font-weight: 600;
  background-color: #ffffff;
}
.operation-panel-standard table button:hover {
  background-color: #e6e6e6;
}
.operation-panel-science table td button {
  cursor: pointer;
  height: 40px;
  width: 62px;
  border: none;
  outline: none;
}
.operation-panel-science .symbol button {
  font-size: 18px;
  background-color: #f0f0f0;
  font-weight: 400;
  position: relative;
}
.operation-panel-science .symbol button .showNum {
  position: absolute;
  font-size: 12px;
  font-weight: 600;
  top: 19px;
  right: 15px;
}
.operation-panel-science .number button {
  font-size: 24px;
  font-weight: 600;
  background-color: #ffffff;
}
.operation-panel-science table button:hover {
  background-color: #e6e6e6;
}
.operation-panel-science table button.downActive {
  border-bottom: 3px solid red;
}
</style>
