<template>
  <el-dialog
    title="收藏为短语"
    class="phrase-coll"
    :visible.sync="dialogVisible"
    width="40%"
    :append-to-body="true"
    :modal="false"
    :close-on-click-modal="false"
    @close="closeHidden"
  >
    <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="短语类型" prop="inpEmrPhraseScopeCode">
            <el-radio-group v-model="ruleForm.inpEmrPhraseScopeCode">
              <el-radio label="959739">个人</el-radio>
              <el-radio label="959737">科室</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="短语名称" prop="inpEmrPhraseName">
            <el-input
              v-model="ruleForm.inpEmrPhraseName"
              placeholder="请输入短语名称"
              style="width: 100%"
              @input="handleCheckWords(50)"
              @blur="handleCheckWords"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="短语目录" prop="phraseCatagoryName">
        <el-select
          v-model="ruleForm.phraseCatagoryName"
          filterable
          allow-create
          placeholder="请选择目录"
          style="width: 100%"
          @change="handleChange"
        >
          <el-option
            v-for="item in inPhreseCates"
            :key="item.inpEmrPhraseCatagoryId"
            :label="item.inpEmrPhraseCatagoryName"
            :value="
              item.inpEmrPhraseCatagoryId + '|' + item.inpEmrPhraseCatagoryName
            "
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="病种代码" prop="diseasesCode">
        <el-select
          v-model="ruleForm.diseaseCode"
          filterable
          clearable
          :remote-method="remoteMethod"
          remote
          placeholder="请输入关键词检索"
          :loading="loading"
          style="width: 100%"
        >
          <el-option
            v-for="item in inFilterdiseases"
            :key="item.conceptId"
            :label="item.valueDesc"
            :value="item.conceptId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="ruleForm.inpEmrPhraseScopeCode === '959737'" label="收藏科室" prop="deptId">
        <el-select v-model="ruleForm.deptId" filterable placeholder="请选择科室" style="width: 100%">
          <el-option
            v-for="item in inDepts"
            :key="item.deptId"
            :label="item.deptName"
            :value="item.deptId"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
      <el-button size="mini" type="primary" :loading="saveing" @click="submitForm('ruleForm')">保 存</el-button>
    </span>
  </el-dialog>
</template>

<script>
// /*global $:true*/
import { createNamespacedHelpers, mapState } from 'vuex'
// import { apiQueryPhraseCatagory, apiAddPhrase } from '@/api/phrase'
// import { apiQueryMedicalAdviceTypeList } from '@/api/tools.js'
import { compress } from '../../../../components/InpatientClinicalnoteEditor/BaseEditorPg/utils'
//import api from '@/api/list';
const { mapState: pubDatasStates, mapActions: pubDatasActions } =
  createNamespacedHelpers('pubDatas')
export default {
  name: 'DialogColl',
  data() {
    return {
      loading: false,
      saveing: false,
      dialogVisible: true,
      inPhreseCates: null,
      indiseases: null,
      inFilterdiseases: null,
      ruleForm: {
        inpEmrPhraseScopeCode: '959739',
        inpEmrPhraseName: '',
        phraseCatagoryName: '',
        inpEmrPhraseCatagoryName: '',
        inpEmrPhraseCatagoryId: '',
        deptId: '',
        inpEmrPhraseContentTxt: '',
        inpEmrPhraseContentData: '',
        diseaseCode: '',
      },
      rules: {
        inpEmrPhraseScopeCode: [
          { required: true, message: '请选择的短语类型', trigger: 'blur' },
        ],
        inpEmrPhraseName: [
          { required: true, message: '请输入短语名称', trigger: 'blur' },
        ],
        phraseCatagoryName: [
          { required: true, message: '请选择短语目录', trigger: 'blur' },
        ],
        deptId: [
          { required: true, message: '请选择收藏科室', trigger: 'blur' },
        ],
      },
      //当前被收藏短语的段落id
      paragraphId: '',
    }
  },
  computed: {
    inDepts() {
      return this.deptList
    },
    ...pubDatasStates(['deptList']),
    ...mapState(['orgInfo']),
  },
  watch: {
    'ruleForm.inpEmrPhraseScopeCode': {
      handler: function () {
        this.getCatagray()
      },
      immediate: true,
    },
  },
  created() {
    this.getCatagray()
    // 传true获取当前用户拥有的科室 不传（false）则为全部科室
    this.updateDeptList(true)
    this.getDiseasesList()
  },
  methods: {
    //触发隐藏弹窗
    closeHidden() {
      this.$emit('close')
    },
    //远程搜索病种
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          this.inFilterdiseases = this.indiseases.filter((item) => {
            return item.valueDesc.indexOf(query) > -1
          })
        }, 200)
      } else {
        this.options4 = []
      }
    },
    handleChange(data) {
      if (data.indexOf('|') > -1) {
        const arrs = data.split('|')
        this.ruleForm.inpEmrPhraseCatagoryId = arrs[0]
        this.ruleForm.inpEmrPhraseCatagoryName = arrs[1]
      } else {
        this.ruleForm.inpEmrPhraseCatagoryId = ''
        this.ruleForm.inpEmrPhraseCatagoryName = data
      }
      console.log(data, this.ruleForm)
    },
    //保存短语
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveing = true
          let params = {
            diseaseCode: this.ruleForm.diseaseCode,
            inpatEmrSetId: this.ruleForm.inpatEmrSetId,
            deptId: this.ruleForm.deptId || this.orgInfo.orgId,
            inpEmrPhraseCatagoryId: this.ruleForm.inpEmrPhraseCatagoryId,
            inpEmrPhraseContentData: compress(
              this.ruleForm.inpEmrPhraseContentData
            ),
            inpMrtDeSectionNo: this.paragraphId,
            inpEmrPhraseCatagoryName: this.ruleForm.inpEmrPhraseCatagoryName,

            inpEmrPhraseContentTxt: this.ruleForm.inpEmrPhraseContentTxt,
            inpEmrPhraseName: this.ruleForm.inpEmrPhraseName,
            inpEmrPhraseScopeCode: this.ruleForm.inpEmrPhraseScopeCode,
            phraseSection: [
              {
                inpEmrPhraseSectionCode: '',
                inpEmrPhraseSectionName: '',
              },
            ],
          }
          // apiAddPhrase(params)
          //   .then((res) => {
          //     if (res.success) {
          //       this.$message({
          //         message: '短语收藏成功！',
          //         type: 'success',
          //       })
          //       this.saveing = false
          //       this.closeHidden()
          //       //打开右侧辅助区域
          //       this.$root.eventHub.$emit('AuxiliaryInfo/ShowContentArea')
          //       //定位右侧辅助区域Tab
          //       this.$root.eventHub.$emit(
          //         'AuxiliaryInfo/SetActiveTab',
          //         'phraseRefen'
          //       )
          //       this.$root.eventHub.$emit(
          //         'AuxiliaryInfo/SetPhraseReferActiveTab',
          //         {
          //           params: {
          //             inpEmrPhraseCatagoryId: res.data.inpEmrPhraseCatagoryId,
          //             inpEmrPhraseScopeCode:
          //               this.ruleForm.inpEmrPhraseScopeCode,
          //           },
          //         }
          //       )
          //     }
          //   })
          //   .catch(() => {
          //     this.saveing = false
          //   })
        }
      })
    },
    //获取短语下拉目录
    getCatagray() {
      // apiQueryPhraseCatagory({
      //   phraseClassTypeCode: this.ruleForm.inpEmrPhraseScopeCode,
      //   deptId:
      //     this.ruleForm.inpEmrPhraseScopeCode == '959737'
      //       ? this.orgInfo.orgId
      //       : ''
      // }).then(res => {
      //   if (res.success) {
      //     this.inPhreseCates = res.data
      //     let _temp = this.inPhreseCates.find(v => {
      //       return v.inpMrtDeSectionNo === this.paragraphId
      //     })
      //     if (_temp) {
      //       this.ruleForm.phraseCatagoryName =
      //         _temp.inpEmrPhraseCatagoryId +
      //         '|' +
      //         _temp.inpEmrPhraseCatagoryName
      //       this.ruleForm.inpEmrPhraseCatagoryId = _temp.inpEmrPhraseCatagoryId
      //       this.ruleForm.inpEmrPhraseCatagoryName =
      //         _temp.inpEmrPhraseCatagoryName
      //     } else {
      //       this.ruleForm.inpEmrPhraseCatagoryId = this.inPhreseCates[0].inpEmrPhraseCatagoryId
      //       this.ruleForm.inpEmrPhraseCatagoryName = this.inPhreseCates[0].inpEmrPhraseCatagoryName
      //       this.ruleForm.phraseCatagoryName =
      //         this.inPhreseCates[0].inpEmrPhraseCatagoryId +
      //         '|' +
      //         this.inPhreseCates[0].inpEmrPhraseCatagoryName
      //     }
      //   }
      // })
    },
    //获取病种列表
    getDiseasesList(val) {
      let params = {
        codeSystemId: '390290193',
        keyword: val,
        pageNo: 0,
        pageSize: 100,
        pageType: 'A',
      }
      console.log(params)
      // apiQueryMedicalAdviceTypeList(params).then((res) => {
      //   if (res.success) {
      //     this.indiseases = res.data
      //   }
      // })
    },
    //自研获取选择的短语内容、xml节点信息
    checkSelectionRef(p) {
      this.ruleForm.inpEmrPhraseContentTxt = p.innerText
      this.ruleForm.inpEmrPhraseContentData = p.XML
      this.ruleForm.inpEmrPhraseName = p.innerText.substring(0, 10)
      this.ruleForm.inpatEmrSetId = p.inpatEmrSetId
      console.log(p)
      if (p?.Labels?.length == 1) {
        this.paragraphId = p.Labels[0].CptID
      } else {
        this.paragraphId = null
      }
    },
    //检查文本
    handleCheckWords(_maxLength) {
      if (
        !/^[A-Za-z0-9\u4e00-\u9fa5]+$/gi.test(this.ruleForm.inpEmrPhraseName)
      ) {
        if (_maxLength?.type == 'blur') {
          // if (this.ruleForm.inpEmrPhraseName === '') {
          //   this.$message({
          //     message: '短语名称只能输入中文、英文字母和数字！',
          //     type: 'warning'
          //   })
          // }
          this.ruleForm.inpEmrPhraseName = ''
        } else {
          this.ruleForm.inpEmrPhraseName =
            this.ruleForm.inpEmrPhraseName.substr(
              0,
              this.ruleForm.inpEmrPhraseName.length - 1
            )
        }
      }
      if (_maxLength?.type == 'blur') return
      let currentLength = 0
      let sliceLength = 0
      for (
        let i = 0;
        i < this.ruleForm.inpEmrPhraseName.length &&
        currentLength <= _maxLength * 2;
        i++
      ) {
        if (
          this.ruleForm.inpEmrPhraseName.charCodeAt(i) > 0 &&
          this.ruleForm.inpEmrPhraseName.charCodeAt(i) < 128
        ) {
          currentLength++
        } else {
          currentLength += 2
        }
        sliceLength++
      }
      if (currentLength > _maxLength * 2) {
        this.ruleForm.inpEmrPhraseName = this.ruleForm.inpEmrPhraseName.substr(
          0,
          sliceLength - 1
        )
      }
    },
    ...pubDatasActions(['updateDeptList']),
  },
}
</script>

<style lang="scss" scoped>
.phrase-coll {
  height: 100%;
}
</style>
