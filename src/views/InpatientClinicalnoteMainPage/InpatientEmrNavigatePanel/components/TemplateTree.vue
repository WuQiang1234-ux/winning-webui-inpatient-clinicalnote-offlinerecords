<template>
  <section class="template-list-section">
    <div v-if="activeName == 'third' && personTemplateVisible" class="clinicalnote-template-four">
      <el-radio v-model="templateType" label="system" @change="handlePersonalChange">系统</el-radio>
      <el-radio v-model="templateType" label="share" @change="handlePersonalChange">共享</el-radio>
    </div>
    <el-tree
      ref="clinicalnoteTemplateTree"
      v-loading="loading"
      :class="
        activeName == 'third' && personTemplateVisible
          ? 'clinicalnote-template-tree new-template-tree'
          : 'clinicalnote-template-tree'
      "
      :data="clinicalnoteTemplateTree"
      node-key="id"
      default-expand-all
    >
      <template slot-scope="{ data }">
        <template v-if="data.isLeaf">
          <el-tooltip
            :disabled="
              data.data.mrtEfficientFlag != '98361' &&
                data.data.versionDifferentFlag != '98361' &&
                data.data.primaryMrtEfficientFlag != '98361'
            "
            :content="
              data.data.mrtEfficientFlag == '98361'
                ? '该模板对应的院级模板已经停止使用，该模板无法使用'
                : data.data.primaryMrtEfficientFlag == '98361'
                ? '该模板已经停止使用，该模板无法使用'
                : data.data.versionDifferentFlag == '98361'
                ? '该模板无法使用，医院已升级了其院级模板的内容，请前往“个人模板维护”菜单同步升级该模板'
                : ''
            "
            placement="right"
            effect="light"
          >
            <span
              :class="{
                'custom-tree-node_activate': currentClinicalnoteTemplateClassDataId.includes(
                  data.keyId
                ),
                'custom-tree-node': true,
                'is-favorite': collectIds.includes(data.data.inpatientMrtId),
                'is-share': data.data.sharedFlag == '98360',
                disabled:
                  data.data.mrtEfficientFlag == '98361' ||
                  data.data.versionDifferentFlag == '98361' ||
                  data.data.primaryMrtEfficientFlag == '98361'
              }"
              @click="clickTemplate(data)"
              @dblclick="dblclickTemplate(data)"
            >
              <span class="node-name" :style="{ fontWeight: data.isRecommend ? 'bold' : '' }">
                <i class="el-icon-tickets"></i>
                <span class="label">{{ data.isRecommend ? data.label + '（推荐）' : data.label }}</span>
              </span>
              <el-button
                v-if="data.isFavorite != 'none' && data.isFavorite != 'share'"
                type="text"
                class="node-action-toggle-favorite"
                icon="el-icon-star-on"
                @click.stop.prevent="
                  () => {
                    toggleFavoriteClinicalnoteTemplate(data)
                  }
                "
              ></el-button>
              <el-button
                v-if="data.isFavorite == 'share'"
                type="text"
                class="node-action-toggle-favorite"
                @click.stop.prevent="
                  () => {
                    toggleShareClinicalnoteTemplate(data.data)
                  }
                "
              >
                <SymbolIcon icon-class="wicon-share" font-size="18px" />
              </el-button>
            </span>
          </el-tooltip>
        </template>
        <template v-else>{{ data.label }}</template>
      </template>
    </el-tree>
  </section>
</template>
<script>
export default {
  props: {
    collectIds: {
      type: Array,
      default() {
        return []
      },
    },
    activeName: {
      type: String,
      default: '',
    },
    personTemplateVisible: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    clinicalnoteTemplateTree: {
      type: Array,
      default() {
        return []
      },
    },
    currentClinicalnoteTemplateClassDataId: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      templateType: 'system', //system系统 share共享
    }
  },
  methods: {
    toggleFavoriteClinicalnoteTemplate(data) {
      this.$emit('toggleFavoriteClinicalnoteTemplate', data)
    },
    handlePersonalChange() {
      this.$emit('handlePersonalChange', this.templateType)
    },
    clickTemplate(data) {
      console.log(data)
      //失效模板不可预览
      if (
        data.data.mrtEfficientFlag == '98361' ||
        data.data.versionDifferentFlag == '98361' ||
        data.data.primaryMrtEfficientFlag == '98361'
      )
        return
      this.$emit('clickTemplate', data)
    },
    dblclickTemplate(data) {
      //失效模板不可预览
      if (
        data.data.mrtEfficientFlag == '98361' ||
        data.data.versionDifferentFlag == '98361' ||
        data.data.primaryMrtEfficientFlag == '98361'
      )
        return
      this.$emit('dblclickTemplate', data)
    },
  },
}
</script>
