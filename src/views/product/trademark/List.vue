<template>
  <div style="padding: 10px">
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
      >添加</el-button
    >
    <!-- :data="tableData" -->
    <el-table :data="trademarkList" border style="width: 100%; margin: 20px 0">
      <el-table-column align="center" type="index" label="序号" width="80">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column width="width" label="品牌LOGO">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="height: 60px; width: 80px" />
        </template>
      </el-table-column>

      <el-table-column width="width" label="操作">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align: center"
      @size-change="handleCurrentChange"
      @current-change="getTrademarkList"
      :current-page="page"
      :page-sizes="[1, 2, 3]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
    >
    </el-pagination>

    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form style="width: 80%" :model="tmForm">
        <el-form-item label="品牌名称" label-width="100px">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,

      dialogFormVisible: false,

      tmForm: {
        tmName: "", //收集我们的品牌名称
        logoUrl: "", //收集我们的品牌logo图片路径
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if ((result.code = 200)) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    handleCurrentChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = res.data;
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },

    showAddDialog() {
      this.dialogFormVisible = true;
      this.tmForm = {
        tmName: "",
        logoUrl: "",
      };
    },
    showUpdateDialog(row) {
      this.dialogFormVisible = true;
      this.tmForm = { ...row };
    },
  async addOrUpdateTrademark() {
      //获取参数
      let trademark = this.tmForm; //tmForm就是咱们添加或者修改最终收集到的品牌数据
      //整理参数 一般是我们的参数数据不符合咱们请求的参数格式，那么就需要整理
      //发请求
      try {
        //成功干啥
        await this.$API.trademark.addOrUpdate(trademark);
        //1、提示
        this.$message.success(trademark.id ? "修改品牌成功" : "添加品牌成功");
        //2、关闭dialog,回到列表页
        this.dialogFormVisible = false;
        //3、重新发请求获取列表页数据
        // 如果添加成功，那么重新请求的是第一页数据，添加新的数据是在最后一页
        // 如果是修改成功，那么我们得重新请求这条数据所在的页
        this.getTrademarkList(trademark.id ? this.page : 1);
      } catch (error) {
        //失败干啥
        this.$message.error(trademark.id ? "修改品牌失败" : "添加品牌失败");
      }
    },
       deleteTrademark(row) {
        this.$confirm(`你确定要删除${row.tmName}吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
            try {
               await this.$API.trademark.delete(row.id);
                 this.$message.success('删除品牌成功')
                  this.getTrademarkList(this.trademarkList.length > 1?this.page:this.page - 1)
            } catch (error) {
              this.$message.error('删除品牌失败')
            }
        }).catch(() => {
           this.$message.error('删除品牌失败')          
        });
      }
  },
};
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>