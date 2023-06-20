<template>
  <div class="Container">
    <div class="btnContainer">
      <el-button type="primary" size="small" @click="addTemplete"
        >新增模板</el-button
      >
    </div>
    <el-table border :data="templetes" style="width: 100%; margin: 0 auto">
      <el-table-column prop="name" label="模板名称" align="center"> </el-table-column>
      <el-table-column prop="page_size" label="纸张尺寸" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.page_size == 1">A5</div>
          <div v-else>A4</div>
        </template></el-table-column
      >
      <el-table-column prop="page_orientation" label="页面方向" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.page_orientation == 1">纵向</div>
          <div v-else>横向</div>
        </template>
      </el-table-column>
      <el-table-column prop="hide_sex" label="隐藏性染色体" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.hide_sex == 2">隐藏全部</div>
          <div v-else-if="scope.row.hide_sex == 1">显示X染色体</div>
          <div v-else>不隐藏</div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="模板状态" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.status == 1">发布</div>
          <div v-else>未发布</div>
        </template></el-table-column
      >
      <el-table-column prop="is_default" label="是否默认" align="center">
        <template slot-scope="scope">
          <div v-if="scope.row.is_default == 1">默认</div>
          <div v-else>未默认</div>
        </template></el-table-column
      >
      <el-table-column prop="action" label="操作" width="290" align="center">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status != 1"
            @click="editDetail(scope.row.id)"
            type="text"
            size="small"
            >编辑</el-button
          ><el-button
            v-else
            @click="viewDetail(scope.row.id)"
            type="text"
            size="small"
            >查看</el-button
          >
          <el-button
            v-if="scope.row.status != 1"
            @click="publishTemplete(scope.row.id)"
            type="text"
            size="small"
            >发布</el-button
          >
          <el-button
            @click="copyTemplete(scope.row.id)"
            type="text"
            size="small"
            >复制模板</el-button
          >
          <el-button
            v-if="scope.row.is_default != 1&&scope.row.status == 1"
            @click="defaultTemplete(scope.row.id)"
            type="text"
            size="small"
            >设为默认</el-button
          >

          <el-button @click="delTemplete(scope.row.id)" type="text" size="small"
            >删除</el-button
          >
        </template></el-table-column
      >
    </el-table>
  </div>
</template>
<script>
import {
  getAllTempletes,
  deleteTemplete,
  publishTemplete,
  defaultReport,
  copyTemplete
} from "@/services/api";
export default {
  data() {
    return { templetes: [] };
  },
  created() {
    this.getAllTempletes();
  },
  methods: {
    getAllTempletes() {
      getAllTempletes({})
        .then((res) => {
          if (res.code == 200) {
            this.templetes = res.data;
          } else {
            this.templetes = [];
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    editDetail(id) {
      // getTemplete(id).then(({ data }) => {
      //   this.statistic = data;
      // });
      this.$router.push({ name: "ModelHome", params: { id: id, isEdit: 0 } });
    },
    viewDetail(id) {
      // getTemplete(id).then(({ data }) => {
      //   this.statistic = data;
      // });
      this.$router.push({ name: "ModelHome", params: { id: id, isEdit: 1 } });
    },
    addTemplete() {
      this.$router.push({ name: "ModelHome", params: { id: "new", isEdit: 0 } });
    },
    defaultTemplete(id) {
      this.$confirm("是否要设置该模板为默认模板?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        defaultReport(id)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "设置成功",
                offset: 300,
              });
              this.getAllTempletes();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
    copyTemplete(id) {
      this.$prompt("请输入模板名称", "复制模板", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        }).then(({ value }) => {
        copyTemplete({ templete_id:id,templete_name:value})
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "发布成功 ",
                offset: 300,
              });
              this.getAllTempletes();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
    publishTemplete(id) {
      this.$confirm("是否要发布该模板?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        publishTemplete(id)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "发布成功 ",
                offset: 300,
              });
              this.getAllTempletes();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
    delTemplete(id) {
      this.$confirm("是否要删除该模板?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteTemplete(id)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功 ",
                offset: 300,
              });
              this.getAllTempletes();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.Container {
  border-bottom: solid 1px rgba(255, 255, 255, 0.2);
  padding-right: 10px;
  .logo {
    color: #fff;
    font-size: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &::before {
      width: 32px;
      height: 32px;
      background: url(../assets/logo.svg) no-repeat;
      background-size: 100% auto;
      content: "";
      margin: 0 5px;
    }
  }
  .user {
    display: flex;
    align-items: center;
    cursor: pointer;
    .model_title {
      margin-right: 8px;
      color: #409eff;
    }
    .nick {
      margin-left: 8px;
      color: #fff;
    }
  }
}
.btnContainer {
  overflow: hidden;
  padding: 0 15px;
  margin-bottom: 10px;
  display: flex;
}
/deep/.el-form-item__label {
  color: #666 !important;
}
</style>
