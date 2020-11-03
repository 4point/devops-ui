<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { getTestItemByCase, addTestItemByCase, updateTestItem, deleteTestItem } from '@/api/testItem'
import {
  getTestValueByItem,
  addTestValueByItem,
  deleteTestValue,
  getTestValueType,
  getTestValueLocation
} from '@/api/testValue'
import { getTestCaseById } from '@/api/testCase'

const testItemFormTemplate = {
  name: '',
  is_passed: false
}

const testValueFormTemplate = {
  type: '',
  location: '',
  key: '',
  value: ''
}

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      activeName: 'testItem',
      testCaseId: 0,
      testCase: { name: '', data: { method: '', url: '' } },
      testItemList: [],
      testItemDialogVisible: false,
      selectTestItem: '',
      testValueList: [],
      testValueDialogVisible: false,
      listLoading: true,
      listQuery: {
        page: 1, //目前第幾頁
        limit: 10 //一頁幾筆
      },
      listTotal: 0, //總筆數
      testItemForm: testItemFormTemplate,
      testValueForm: testValueFormTemplate,
      confirmLoading: false,
      searchData: '',
      dialogStatus: 1,
      testValueTypeList: [],
      testValueLocationList: [],
      testItemFormRules: {
        name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
        is_passed: [{ required: true, message: 'Please select is passed', trigger: 'blur' }]
      },
      testValueFormRules: {
        type_id: [{ required: true, message: 'Please select type', trigger: 'blur' }],
        location_id: [{ required: true, message: 'Please select location', trigger: 'blur' }],
        key: [{ required: true, message: 'Please select key', trigger: 'blur' }],
        value: [{ required: true, message: 'Please select value', trigger: 'blur' }]
      }
    }
  },
  watch: {
    async selectTestItem(val) {
      this.fetchTestValueData(val)
    }
  },
  computed: {
    ...mapGetters(['userRole']),
    pagedData() {
      const listData = this.testItemList.filter((data) => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    },
    dialogStatusText() {
      switch (this.dialogStatus) {
        case 1:
          return 'Add'
        case 2:
          return 'Edit'
        default:
          return 'Null'
      }
    }
  },
  created() {
    this.listLoading = true
    Promise.all([getTestValueType(), getTestValueLocation()])
      .then((res) => {
        this.testValueTypeList = res[0].data.map((item) => {
          return { label: item.type_name, value: item.type_id }
        })
        this.testValueLocationList = res[1].data.map((item) => {
          return { label: item.type_name, value: item.location_id }
        })
      })
      .finally(() => {
        this.listLoading = false
      })
    this.testCaseId = parseInt(this.$route.params.testCaseId)
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      Promise.all([getTestCaseById(this.testCaseId), getTestItemByCase(this.testCaseId)]).then((res) => {
        this.testCase = res[0].data
        this.testItemList = res[1].data
        this.listLoading = false
      })
    },
    async fetchTestValueData(val) {
      const res = await getTestValueByItem(val)

      this.testValueList = res.data.map((item) => {
        item['type'] = this.testValueTypeList.find((type) => type.value == item.type_id)
        item['location'] = this.testValueLocationList.find((location) => location.value == item.location_id)
        return item
      })
      console.log('this.testValueList', this.testValueList)
    },
    handleTestItemAdding() {
      this.testItemDialogVisible = true
      this.dialogStatus = 1
    },
    handleTestItemEdit(idx, row) {
      this.testItemDialogVisible = true
      this.dialogStatus = 2
      this.testItemForm = Object.assign({}, this.testItemForm, row)
    },
    handleDelete() {},
    handleTestValueAdding() {
      this.testValueDialogVisible = true
      this.dialogStatus = 1
    },
    handleTestValueEdit(idx, row) {
      this.testValueDialogVisible = true
      this.dialogStatus = 2
      this.testValueForm = Object.assign({}, this.testValueForm, row)
    },
    handleDelete() {},
    returnTagType(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'info'
      return success === total ? 'success' : 'danger'
    },
    testResults(row) {
      const { success, total } = row.last_test_result
      if (!success || !total) return 'No Test'
      return success + ' / ' + total
    },
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['testItemForm'].resetFields()
        this.$refs['testValueForm'].resetFields()
        this.testItemForm = testItemFormTemplate
        this.testValueForm = testValueFormTemplate
      })
    },
    handleTestItemConfirm() {
      this.$refs['testItemForm'].validate(async (valid) => {
        if (valid) {
          if (this.dialogStatus == 1) {
            await addTestItemByCase(this.testCaseId, this.testItemForm)
          } else {
            await updateTestItem(this.testItemForm['id'], this.testItemForm)
          }
          this.$refs['testItemForm'].resetFields()
          this.testItemDialogVisible = false
          this.fetchData()
        } else {
          return false
        }
      })
    },
    async handleTestItemDelete(idx, row) {
      await deleteTestItem(row['id'])
      this.fetchData()
    },
    handleTestValueConfirm() {
      this.$refs['testValueForm'].validate(async (valid) => {
        if (valid) {
          if (this.dialogStatus == 1) {
            await addTestValueByItem(this.selectTestItem, this.testValueForm)
          } else {
            await addTestValueByItem(this.selectTestItem, this.testValueForm)
          }
          this.$refs['testValueForm'].resetFields()
          this.testValueDialogVisible = false
          this.fetchTestValueData(this.selectTestItem)
        } else {
          return false
        }
      })
    },
    async handleTestValueDelete(idx, row) {
      await deleteTestValue(row['id'])
      this.fetchTestValueData(this.selectTestItem)
    }
  }
}
</script>
<template>
  <div class="app-container">
    <el-card class="box-card el-col-6 column custom-list" shadow="never">
      <div slot="header" class="clearfix">
        <span style="font-size: 25px; padding-bottom: 10px">Test Case</span>
      </div>
      <el-form :label-position="'left'">
        <el-row>
          <el-col>
            <el-form-item label="Name">{{ testCase.name }} </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Method">
              {{ testCase.data.method }}
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="Path">
              {{ testCase.data.url }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-tabs v-model="activeName" type="border-card" class="el-col-14 column">
      <el-tab-pane label="Test Item" name="testItem">
        <div class="clearfix">
          <span class="newBtn" v-if="userRole === 'Engineer'">
            <el-button type="success" @click="handleTestItemAdding">
              <i class="el-icon-plus" />
              Add Test Item
            </el-button>
          </span>
          <el-input
            v-model="searchData"
            class="ob-search-input ob-shadow search-input mr-3"
            placeholder="Please input test case name"
            style="width: 250px; float: right"
            ><i slot="prefix" class="el-input__icon el-icon-search"></i
          ></el-input>
        </div>
        <el-table
          :data="testItemList"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          style="margin-top: 10px"
        >
          <el-table-column label="Id">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column label="Name">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="Is Pass?">
            <template slot-scope="scope">
              {{ scope.row.is_passed }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="200" v-if="userRole === 'Engineer'">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleTestItemEdit(scope.$index, scope.row)">
                <i class="el-icon-edit" />
                Edit
              </el-button>
              <el-popconfirm
                confirm-button-text="Delete"
                cancel-button-text="Cancel"
                icon="el-icon-info"
                icon-color="red"
                title="Are you sure?"
                @onConfirm="handleTestItemDelete(scope.$index, scope.row)"
              >
                <el-button slot="reference" size="mini" type="danger"> <i class="el-icon-delete" /> Delete</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="Test Value" name="testValue">
        <div class="clearfix">
          <el-select v-model="selectTestItem" placeholder="Select Test Item">
            <el-option v-for="item in testItemList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <span class="newBtn" v-if="userRole === 'Engineer'">
            <el-button type="success" @click="handleTestValueAdding">
              <i class="el-icon-plus" />
              Add Test Value
            </el-button>
          </span>
          <el-input
            v-model="searchData"
            class="ob-search-input ob-shadow search-input mr-3"
            placeholder="Please input test value name"
            style="width: 250px; float: right"
            ><i slot="prefix" class="el-input__icon el-icon-search"></i
          ></el-input>
        </div>
        <el-table
          :data="testValueList"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          style="margin-top: 10px"
        >
          <el-table-column label="Type">
            <template slot-scope="scope">
              {{ scope.row.type.label }}
            </template>
          </el-table-column>
          <el-table-column label="Location">
            <template slot-scope="scope">
              {{ scope.row.location.label }}
            </template>
          </el-table-column>
          <el-table-column label="Key">
            <template slot-scope="scope">
              {{ scope.row.key }}
            </template>
          </el-table-column>
          <el-table-column label="Value">
            <template slot-scope="scope">
              {{ scope.row.value }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="200" v-if="userRole === 'Engineer'">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleTestValueEdit(scope.$index, scope.row)">
                <i class="el-icon-edit" />
                Edit
              </el-button>
              <el-popconfirm
                confirm-button-text="Delete"
                cancel-button-text="Cancel"
                icon="el-icon-info"
                icon-color="red"
                title="Are you sure?"
                @onConfirm="handleTestValueDelete(scope.$index, scope.row)"
              >
                <el-button slot="reference" size="mini" type="danger"> <i class="el-icon-delete" /> Delete</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      :title="`${dialogStatusText} Test Item`"
      :visible.sync="testItemDialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        label-position="top"
        ref="testItemForm"
        :model="testItemForm"
        :rules="testItemFormRules"
        label-width="20%"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="testItemForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Is Passed?" prop="is_passed">
          <el-switch v-model="testItemForm.is_passed" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testItemDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleTestItemConfirm" :loading="confirmLoading">Confirm</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="`${dialogStatusText} Test Case`"
      :visible.sync="testValueDialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form
        label-position="top"
        ref="testItemForm"
        :model="testValueForm"
        :rules="testValueFormRules"
        label-width="20%"
      >
        <el-form-item label="Type" prop="type_id">
          <el-select v-model="testValueForm.type_id" style="width: 100%">
            <el-option v-for="item in testValueTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Location" prop="location_id">
          <el-select v-model="testValueForm.location_id" style="width: 100%">
            <el-option
              v-for="item in testValueLocationList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Key" prop="key">
          <el-input v-model="testValueForm.key"></el-input>
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="testValueForm.value"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="testValueDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleTestValueConfirm" :loading="confirmLoading">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.clearfix {
  clear: both;
  .newBtn {
    float: right;
    padding-right: 6px;
  }
}
</style>