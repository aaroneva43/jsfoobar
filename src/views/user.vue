<template>
  <div class="Container">
    <div class="btnContainer">
        <el-button type="primary" size="small" @click="adduser"
          >新增用户</el-button
        >
      </div>
      <el-table border :data="users" style="width: 100%; margin: 0 auto">
        <el-table-column prop="username" label="用户名"> </el-table-column>
        <el-table-column prop="name" label="用户名称"> </el-table-column>
        <el-table-column prop="role" label="角色">
          <template slot-scope="scope">
            <div v-if="scope.row.role == 1">普通用户</div>
            <div v-else>管理员</div>
          </template></el-table-column
        >
        <el-table-column prop="is_disabled" label="是否禁用">
          <template slot-scope="scope">
            <div v-if="scope.row.is_disabled == 1">禁用</div>
            <div v-else>未禁</div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间">
          <template slot-scope="scope">
            {{scope.row.create_time.split("T")[0]}}
          </template>
          </el-table-column>
        <el-table-column prop="action" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              @click="viewUserDetail(scope.row.id)"
              type="text"
              size="small"
              >编辑</el-button
            >
            <el-button
              v-if="scope.row.is_disabled != 1"
              @click="setDisable(scope.row.id, 1)"
              type="text"
              size="small"
              >禁用</el-button
            >
            <el-button
              v-else
              @click="setDisable(scope.row.id, 0)"
              type="text"
              size="small"
              >启用</el-button
            >
            <el-button @click="resetPW(scope.row.id)" type="text" size="small"
              >重置密码</el-button
            >
            <el-button @click="delUser(scope.row.id)" type="text" size="small"
              >删除</el-button
            >
          </template></el-table-column
        >
      </el-table>
    <el-dialog
      :visible.sync="UserVisible"
      top="5vh"
      width="28%"
      title="用户管理"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="UserVisible">
        <el-form ref="form" :model="user" labelWidth="100px">
          <el-form-item prop="username" label="用户名:">
            <el-input
              v-model="user.username"
            ></el-input>
            </el-form-item>
            <el-form-item prop="name" label="用户姓名:">
            <el-input
              v-model="user.name"
            ></el-input>
            </el-form-item>
            <el-form-item prop="role" label="角色:">
            <el-select
                v-model="user.role"
                style="width: 225px"
              >
                <el-option
                  label="管理员"
                  :value="0"
                />
                <el-option
                  label="普通用户"
                  :value="1"
                />
              </el-select>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="UserVisible = false"
            >取 消</el-button
          >
          <el-button size="small" type="primary" @click="saveUser"
            >确 定</el-button
          >
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getAllusers,
  getUser,
  addUser,
  modifyUser,
  deleteUser,
  setDisable,
  resetPassword,
} from "@/services/api";
export default {
  data() {
    return {
      dialogVisible: false,
      templetes: [],
      dialogUserVisible: false,
      users: [],
      UserVisible: false,
      user: {
        id: null,
        username: "",
        name: "",
        role: 1,
        create_time: "",
        is_disabled: 0,
      },
    };
  },
  created() {
    this.showUser();
  },
  methods: {
    showUser() {
      this.getAllUsers();
    },
    getAllUsers() {
      getAllusers({})
        .then((res) => {
          if (res.code == 200) {
            this.users = res.data;
          } else {
            this.users = [];
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    adduser() {
      this.UserVisible=true;
      this.user = {
        username: "",
        name: "",
        role: 1,
        is_disabled: 0,
      };
    },
    viewUserDetail(id) {
      getUser(id)
        .then((res) => {
          if (res.code == 200) {
            this.UserVisible=true;
            this.user = res.data;
          } else {
            this.$message.error("获取用户失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    saveUser(){
      if(this.user.id){
        modifyUser(this.user)
        .then((res) => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "编辑用户成功!",
              offset: 300,
            });this.getAllUsers();
            this.UserVisible=false;
          } else {
            this.$message.error("编辑用户失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
      }else{
        addUser(this.user)
        .then((res) => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "新增用户成功!",
              offset: 300,
            });this.getAllUsers();
            this.UserVisible=false;
          } else {
            this.$message.error("新增用户失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
      }
    },
    setDisable(id, is_disabled) {
      var data = {
        id: id,
        is_disabled: is_disabled,
      };
      setDisable(data)
        .then((res) => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "设置成功!",
              offset: 300,
            });this.getAllUsers();
          } else {
            this.$message.error("设置失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    delUser(id) {
      this.$confirm("是否要删除该用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
      deleteUser(id)
        .then((res) => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "删除用户成功!",
              offset: 300,
            });this.getAllUsers();
          } else {
            this.$message.error("删除用户失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
      })
    },
    resetPW(id) {
      this.$confirm("是否要重置密码?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
      resetPassword(id)
        .then((res) => {
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "重置密码成功!",
              offset: 300,
            });
          } else {
            this.$message.error("重置密码失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
      })
    },
    show() {
      this.dialogVisible = true;
      this.getAllTempletes();
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
/deep/.el-form-item__label{
  color:#666 !important;
}
</style>
