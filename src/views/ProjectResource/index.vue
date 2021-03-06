<script>
import { mapGetters, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import ProjectListSelector from '../../components/ProjectListSelector'
import { getHarborRepoList, editHarborRepo, deleteHarborRepo } from '@/api/harbor'
const formTemplate = {
  name: '',
  due_date: '',
  status: 'open',
  description: ''
}

export default {
  components: {
    Pagination,
    ProjectListSelector
  },
  data() {
    return {
      projectValue: '專科A',
      listLoading: true,
      dialogVisible: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      listTotal: 0, // 總筆數
      searchData: '',
      formRules: {
        description: [{ required: true, message: 'Please input description', trigger: 'blur' }]
      },
      resourceList: [],
      storage: {
        name: 'test-project',
        consumption: {
          use: 1.48,
          total: 2
        }
      },
      memberConfirmLoading: false,
      form: formTemplate
    }
  },
  computed: {
    ...mapGetters(['projectSelectedId']),
    pagedData() {
      const listData = this.resourceList.filter(data => {
        if (this.searchData == '' || data.name.toLowerCase().includes(this.searchData.toLowerCase())) {
          return data
        }
      })
      this.listTotal = listData.length
      const start = (this.listQuery.page - 1) * this.listQuery.limit
      const end = start + this.listQuery.limit
      return listData.slice(start, end)
    }
  },
  watch: {
    projectSelectedId() {
      this.fetchData()
    },
    form(value) {
      console.log(value)
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    onPagination(listQuery) {
      this.listQuery = listQuery
    },
    async fetchData() {
      this.listLoading = true
      const res = await getHarborRepoList(this.projectSelectedId)
      this.resourceList = res.data
      // this.storage = res.data.storage
      this.listLoading = false
    },
    returnPercentage(consumption) {
      const total = parseInt(consumption.total)
      const use = parseInt(consumption.use)
      const p = Math.round((use / total) * 100)
      return isNaN(p) ? 0 : p
    },
    handleEdit(idx, row) {
      this.dialogVisible = true
      this.form = Object.assign({}, this.form, row)
    },
    async handleDelete(idx, row) {
      this.$confirm(`Are you sure to Delete ${row.name}?`, 'Delete', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'error'
      }).then(async () => {
        await deleteHarborRepo(row.name)
        this.$message({
          type: 'success',
          message: 'Delete Successed'
        })
        this.fetchData()
      })
    },
    async handleConfirm(index, row) {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          this.dialogVisible = false
          const data = this.form
          await editHarborRepo(data.name, { description: data.description })
          this.$message({
            type: 'success',
            message: 'Successed'
          })
          this.fetchData()
        } else {
          return false
        }
      })
    },
    onDialogClosed() {
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form = formTemplate
      })
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="clearfix">
      <project-list-selector />
      <el-input
        v-model="searchData"
        class="ob-search-input ob-shadow search-input mr-3"
        :placeholder="$t('general.SearchName')"
        style="width: 250px; float: right"
        ><i slot="prefix" class="el-input__icon el-icon-search"
      /></el-input>
    </div>
    <el-divider />
    <el-card shadow="never" style="margin-bottom: 5px">
      <el-row :gutter="24">
        <el-col :span="12" style="font-size: 20px;">
          {{ storage.name }}
        </el-col>
        <el-col :span="4" style="font-size: 20px; text-align: center">
          {{ storage.consumption.use }} / {{ storage.consumption.total }} GB
        </el-col>
        <el-col :span="8" style="text-align:right">
          <el-progress :text-inside="true" :stroke-width="26" :percentage="returnPercentage(storage.consumption)" />
        </el-col>
      </el-row>
    </el-card>
    <div />
    <el-table v-loading="listLoading" :data="pagedData" element-loading-text="Loading" border style="width: 100%">
      <el-table-column :label="$t('general.Name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('ProjectResource.Artifacts')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          {{ scope.row.artifact_count }}
        </template>
      </el-table-column>
      <el-table-column label="pull">
        <template slot-scope="scope">
          <span>{{ scope.row.pull_count }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Description')">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.LastUpdateTime')" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time | YMDhmA }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('general.Actions')" align="center" :show-overflow-tooltip="true" width="260">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">
            <i class="el-icon-edit" />
            {{ $t('general.Edit') }}
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">
            <i class="el-icon-delete" />
            {{ $t('general.Delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="listTotal"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :page-sizes="[listQuery.limit]"
      :layout="'total, prev, pager, next'"
      @pagination="onPagination"
    />

    <el-dialog
      :title="$t(`ProjectResource.EditResource`)"
      :visible.sync="dialogVisible"
      width="50%"
      @closed="onDialogClosed"
    >
      <el-form ref="form" :model="form" :rules="formRules" label-position="top">
        <el-form-item :label="$t('general.Name')">
          {{ form.name }}
        </el-form-item>
        <el-form-item :label="$t('general.Description')" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('general.Cancel') }}</el-button>
        <el-button type="primary" :loading="memberConfirmLoading" @click="handleConfirm">{{
          $t('general.Confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss">
.newBtn {
  float: right;
  padding-right: 6px;
}
.line {
  text-align: center;
}
</style>
