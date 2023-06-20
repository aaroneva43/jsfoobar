<template>
  <div class="header-component">
    <router-link to="/" class="logo">Deoxyribonucleic</router-link>
    <div class="user">
      <!-- <router-link to="/" style="margin-right: 10px" v-if="isShowIndex"
        ><i
          title="首页"
          class="el-icon-s-home"
          style="font-size: 35px; color: #fff"
        ></i
      ></router-link>
      <router-link
        to="/"
        class="back-btn el-icon-s-home"
        v-if="path !== '/' && path !== '/new'"

      ></router-link> -->
      <div
        class="back-btn el-icon-s-home"
        v-if="path !== '/' && path !== '/new'"
        @click="goback"
      >
        返回首页
      </div>
      <!-- <div
        :title="DOG_DEVICE_PATH"
        style="font-size: 15px; color: #fff; margin-right: 10px"
      >
        加密狗验证监测：{{ dog_is_success }}
      </div> -->
      <el-dropdown>
        <span class="el-dropdown-link userinfo-inner">
          <el-avatar
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            :size="32"
          ></el-avatar
        ></span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="gotoLink(1)">
            管理页
          </el-dropdown-item>
          <el-dropdown-item @click.native="dialogPWVisible = true">
            修改密码
          </el-dropdown-item>
          <!-- <el-dropdown-item @click.native="Webshellsp">调用显微镜</el-dropdown-item> -->
          <el-dropdown-item @click.native="logout1">退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="nick" @click="logout1">{{ user.name || user.username }}</div>
    </div>
    <el-dialog
      :visible.sync="dialogUserVisible"
      top="5vh"
      width="60%"
      style="min-height: 700px"
      title="用户列表"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
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
            {{ scope.row.create_time.split("T")[0] }}
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
    </el-dialog>
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
            <el-input v-model="user.username"></el-input>
          </el-form-item>
          <el-form-item prop="name" label="用户姓名:">
            <el-input v-model="user.name"></el-input>
          </el-form-item>
          <el-form-item prop="role" label="角色:">
            <el-select v-model="user.role" style="width: 225px">
              <el-option label="管理员" :value="0" />
              <el-option label="普通用户" :value="1" />
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="UserVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="saveUser"
            >确 定</el-button
          >
        </span>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogVisible"
      top="5vh"
      width="60%"
      style="min-height: 700px"
      title="自定义模板列表"
      :modal="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="btnContainer">
        <el-button type="primary" size="small" @click="addTemplete"
          >新增模板</el-button
        >
      </div>
      <el-table border :data="templetes" style="width: 100%; margin: 0 auto">
        <el-table-column prop="name" label="模板名称"> </el-table-column>
        <el-table-column prop="page_size" label="纸张尺寸">
          <template slot-scope="scope">
            <div v-if="scope.row.page_size == 1">A5</div>
            <div v-else>A4</div>
          </template></el-table-column
        >
        <el-table-column prop="page_orientation" label="页面方向">
          <template slot-scope="scope">
            <div v-if="scope.row.page_orientation == 1">纵向</div>
            <div v-else>横向</div>
          </template>
        </el-table-column>
        <el-table-column prop="hide_sex" label="隐藏性染色体">
          <template slot-scope="scope">
            <div v-if="scope.row.hide_sex == 1">隐藏</div>
            <div v-else>未隐藏</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="模板状态">
          <template slot-scope="scope">
            <div v-if="scope.row.status == 1">发布</div>
            <div v-else>未发布</div>
          </template></el-table-column
        >
        <el-table-column prop="is_default" label="是否默认">
          <template slot-scope="scope">
            <div v-if="scope.row.is_default == 1">默认</div>
            <div v-else>未默认</div>
          </template></el-table-column
        >
        <el-table-column prop="action" label="操作" width="220">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status != 1"
              @click="viewDetail(scope.row.id)"
              type="text"
              size="small"
              >编辑</el-button
            >
            <el-button
              v-if="scope.row.status != 1"
              @click="publishTemplete(scope.row.id)"
              type="text"
              size="small"
              >发布</el-button
            >
            <el-button
              v-if="scope.row.is_default != 1"
              @click="defaultTemplete(scope.row.id)"
              type="text"
              size="small"
              >设为默认</el-button
            >
            <el-button
              @click="delTemplete(scope.row.id)"
              type="text"
              size="small"
              >删除</el-button
            >
          </template></el-table-column
        >
      </el-table>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogPWVisible"
      top="5vh"
      width="28%"
      title="用户管理"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="password"
        :rules="rules"
        :model="password"
        labelWidth="100px"
      >
        <el-form-item prop="old_password" label="旧密码:">
          <el-input v-model="password.old_password" show-password></el-input>
        </el-form-item>
        <el-form-item prop="new_password" label="新密码:">
          <el-input v-model="password.new_password" show-password></el-input>
        </el-form-item>
        <el-form-item prop="re_password" label="确认密码:">
          <el-input v-model="password.re_password" show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogPWVisible = false"
          >取 消</el-button
        >
        <el-button size="small" type="primary" @click="modifyPW"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  LoginOut,
  getAllTempletes,
  deleteTemplete,
  publishTemplete,
  defaultReport,
  getAllusers,
  getUser,
  addUser,
  modifyUser,
  deleteUser,
  setDisable,
  resetPassword,
  modifyPassword,
  get_cur_user,
  heartbeat,
  ChallengeSoftdog,
  ValidateSoftdog,
  ReleasePatient,
} from "@/services/api";
import { mapActions } from "vuex";
import store from "@/store";
import SoftKey3W from "@/utils/Syunew3W.js";
import Worker from "worker-loader!@/workers/worker";
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.password.new_password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      worker: null,
      Timer: null,
      DOG_DEVICE_PATH: null, //加密狗设备路径
      dog_is_success: null,
      dog_Timer: null,
      dialogVisible: false,
      templetes: [],
      dialogUserVisible: false,
      users: [],
      UserVisible: false,
      dialogPWVisible: false,
      s_pnp: null,
      password: {
        old_password: "",
        new_password: "",
        re_password: "",
      },
      user: {
        id: null,
        username: "",
        name: "",
        role: 1,
        create_time: "",
        is_disabled: 0,
      },
      rules: {
        old_password: [
          { required: true, message: "请输入旧密码", trigger: "blur" },
        ],
        new_password: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          { validator: validatePass, trigger: "blur" },
        ],
        re_password: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validatePass2, trigger: "blur" },
        ],
      },
      path: "",
      fresh: false,
    };
  },
  computed: {
    isShowIndex() {
      let path = this.$route.path;
      if (path == "/workuser" || path == "/workmodel") {
        return true;
      } else {
        return false;
      }
    },
  },
  // deactivated() {
  //   this.$store.state.isHeartbeat = false;
  //   this.$store.state.isSoftdog = false;
  //   if (this.Timer) {
  //     clearInterval(this.Timer);
  //   }
  //   if (this.dog_Timer) {
  //     clearInterval(this.dog_Timer);
  //   }
  // },
  // activated() {
  //   this.initCreatDog();
  // },
  // created() {
  //   this.initCreatDog();
  // },
  mounted() {
      this.path = this.$route.path;
    if (!this.user || !this.user.id) {
      this.getCurUser();
    }
  },
  methods: {
    ...mapActions(["setSoftdog", "setHeartbeat"]),
    initCreatDog() {
      this.path = this.$route.path;
      if (
        localStorage.enable_heartbeat == "true" &&
        !this.$store.state.isHeartbeat
      ) {
        this.init();
        this.setHeartbeat(true);
        var heartbeat_duration = Number(localStorage.heartbeat_duration) * 1000;
        this.Timer = setInterval(() => {
          this.init();
        }, heartbeat_duration);
      }
      if (
        localStorage.enable_softdog == "true" &&
        !this.$store.state.isSoftdog
      ) {
        this.initDogPath(); //初始化加密狗路径
        this.setSoftdog(true);
        var softdog_duration = Number(localStorage.softdog_duration) * 1000;
        this.worker = new Worker();
        this.worker.postMessage("开启线程");
        this.worker.onmessage = (e) => {
          console.log(e.data);
          this.dog_Timer = setInterval(() => {
            this.worker.postMessage("关闭线程");
            this.worker.terminate();
            this.checkSoftdog();
          }, softdog_duration);
        };
      } else if (!this.user || !this.user.id) {
        this.getCurUser();
      }
    },
    init() {
      heartbeat()
        .then((res) => {
          //心跳验证
          if (!res.data || res.data != "success") {
            console.log(
              "心跳失败1:" + res.msg + "，时间：" + new Date().toLocaleString()
            );
          }
        })
        .catch((error) => {
          console.log(
            "心跳失败2:" + error.msg + "，时间：" + new Date().toLocaleString()
          );
        });
    },
    initDogCheck() {
      try {
        //todo加密狗验证操作
        this.dog_plug_monitor();
        this.checkSoftdog();
      } catch (err) {
        console.error("加密狗加密报错1:" + err);
      }
    },
    async checkSoftdog() {
      try {
        if (this.DOG_DEVICE_PATH) {
          const res1 = await ChallengeSoftdog();
          if (res1 && res1.code == 200) {
            var ValidateCode = res1.data;
            if (!ValidateCode) {
              console.log(
                "加密狗加密报错，ValidateCode为空，时间：" +
                  new Date().toLocaleString()
              );
            }
            const res2 = await this.encrypt(this.DOG_DEVICE_PATH, ValidateCode);
            const res3 = await ValidateSoftdog(res2);
            if (res3 && res3.code == 200) {
              if (res3.data.is_success == false) {
                // this.logout();
                console.log(
                  "加密狗挑战失败，U盾验证失败:" +
                    res3.data.is_success +
                    "，时间：" +
                    new Date().toLocaleString()
                );
                if (!this.user || !this.user.id) this.getCurUser();
                this.dog_is_success = res3.data.is_success;
              } else {
                console.log(
                  "加密狗挑战成功:" +
                    res3.data.is_success +
                    "，时间：" +
                    new Date().toLocaleString()
                );
                if (!this.user || !this.user.id) this.getCurUser();
                this.dog_is_success = res3.data.is_success;
                sessionStorage.setItem("dog_valid_time", res3.data.valid_time);
              }
            } else {
              this.dog_is_success = false;
              console.log(
                "加密狗挑战失败，时间：" + new Date().toLocaleString()
              );
            }
          } else {
            this.dog_is_success = false;
            console.log(
              "获取加密狗挑战失败，时间：" + new Date().toLocaleString()
            );
            this.$message.error("获取U盾验证失败!");
            // this.logout();
          }
        } else {
          this.dog_is_success = false;
          console.log(
            "加密狗路径查找失败，时间：" + new Date().toLocaleString()
          );
          this.$message.error("U盾验证路径查找失败！");
          // this.logout();
        }
      } catch (error) {
        console.log(
          "获取加密狗挑战失败" +
            JSON.stringify(error) +
            "，时间：" +
            new Date().toLocaleString()
        );
      }
    },
    initDogPath() {
      this.get_dog_path()
        .then((res) => {
          this.DOG_DEVICE_PATH = res;
          console.log(
            "加密狗获取路径成功:" +
              this.DOG_DEVICE_PATH +
              "，时间：" +
              new Date().toLocaleString()
          );
          this.initDogCheck(); //初始化心跳与加密狗
        })
        .catch((err) => {
          console.log(
            "加密狗获取路径失败:" +
              err +
              "，时间：" +
              new Date().toLocaleString()
          );
          this.initDogCheck(); //初始化心跳与加密狗
        });
    },
    get_dog_path() {
      //获取加密狗设备路径
      return new Promise((resolve, reject) => {
        try {
          let s_pnp = new SoftKey3W();

          s_pnp.Socket_UK.onopen = function () {
            s_pnp.FindPort(0); //发送命令取UK的路径
          };
          s_pnp.Socket_UK.onmessage = function got_packet(Msg) {
            let UK_Data = JSON.parse(Msg.data);
            if (UK_Data.type != "Process") return; //如果不是流程处理消息，则跳过

            s_pnp.Socket_UK.close(); //关闭连接
            if (UK_Data.LastError != 0) {
              reject("错误码：" + UK_Data.LastError.toString());
            }
            s_pnp.Socket_UK.close();
            // this.DevicePath = UK_Data.return_value; //获得返回的UK的路径
            resolve(UK_Data.return_value); //获得返回的UK的路径
          };
        } catch (e) {
          reject("程序运行异常");
        }
      });
    },
    dog_plug_monitor() {
      //加密狗插拔监测
      let s_pnp = new SoftKey3W();
      //在使用事件插拨时，注意，一定不要关掉Sockey，否则无法监测事件插拨
      s_pnp.Socket_UK.onmessage = function got_packet(Msg) {
        let PnpData = JSON.parse(Msg.data);
        if (PnpData.type == "PnpEvent") {
          //如果是插拨事件处理消息
          if (PnpData.IsIn) {
            // alert("UKEY已被插入，被插入的锁的路径是："+PnpData.DevicePath);
            console.log(
              "UKEY已被插入，被插入的锁的路径是：" +
                PnpData.DevicePath +
                "，时间：" +
                new Date().toLocaleString()
            );
            this.DOG_DEVICE_PATH = PnpData.DevicePath;
          } else {
            console.log(
              "UKEY已被拨出，被拨出的锁的路径是：" +
                PnpData.DevicePath +
                "，时间：" +
                new Date().toLocaleString()
            );
            this.DOG_DEVICE_PATH = null;
          }
        }
      };
    },
    encrypt(device_path, dog_text) {
      //加密
      return new Promise((resolve, reject) => {
        try {
          let s_pnp = new SoftKey3W();
          s_pnp.Socket_UK.onopen = function () {
            s_pnp.EncString(dog_text, device_path); //发送加密命令
          };
          s_pnp.Socket_UK.onmessage = function got_packet(Msg) {
            let UK_Data = JSON.parse(Msg.data);
            if (UK_Data.type != "Process") {
              return; //如果不是流程处理消息，则跳过
            }
            if (UK_Data.LastError != 0) {
              s_pnp.Socket_UK.close();
              console.log(
                "加密出错，错误码：" +
                  UK_Data.LastError.toString() +
                  "，时间：" +
                  new Date().toLocaleString()
              );
              reject("加密出错，错误码：" + UK_Data.LastError.toString());
              return false;
            }
            s_pnp.Socket_UK.close();
            resolve(UK_Data.return_value);
          };
        } catch (e) {
          console.log("加密程序运行异常，时间：" + new Date().toLocaleString());
          reject("程序运行异常");
        }
      });
    },
    Webshellsp() {
      window.location.href = "KaryoCollection://";
    },
    gotoLink(type) {
      switch (type) {
        case 1:
          this.$router.push({
            path: "/workreport",
          });
          break;
        case 2:
          this.$router.push("/workmodel");
          break;
        // case 3:
        //   this.$router.push("/ecg/1");
        //   break;
      }
    },
    showUser() {
      this.dialogUserVisible = true;
      this.getAllUsers();
    },
    getCurUser() {
      get_cur_user()
        .then((res) => {
          if (res.code == 200) {
            this.user = res.data;
            sessionStorage.user=JSON.stringify(this.user);
          } else {
            this.user = {};
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
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
      this.UserVisible = true;
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
            this.UserVisible = true;
            this.user = res.data;
          } else {
            this.$message.error("获取用户失败！");
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    saveUser() {
      if (this.user.id) {
        modifyUser(this.user)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "编辑用户成功!",
                offset: 300,
              });
              this.getAllUsers();
              this.UserVisible = false;
            } else {
              this.$message.error("编辑用户失败！");
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      } else {
        addUser(this.user)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "新增用户成功!",
                offset: 300,
              });
              this.getAllUsers();
              this.UserVisible = false;
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
            });
            this.getAllUsers();
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
              });
              this.getAllUsers();
            } else {
              this.$message.error("删除用户失败！");
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
    modifyPW() {
      this.$refs["password"].validate((valid) => {
        if (valid) {
          modifyPassword(this.password)
            .then((res) => {
              if (res.code == 200) {
                this.$message({
                  type: "success",
                  message: "重置密码成功!",
                  offset: 300,
                });
                this.dialogPWVisible = false;
              } else {
                this.$message.error("重置密码失败！");
              }
            })
            .catch((err) => {
              this.$message.error(err);
            });
        }
      });
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
      });
    },
    show() {
      this.dialogVisible = true;
      this.getAllTempletes();
    },
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
    viewDetail(id) {
      // getTemplete(id).then(({ data }) => {
      //   this.statistic = data;
      // });
      this.$router.push({ name: "Home", params: { id: id } });
    },
    addTemplete() {
      this.$router.push({ name: "Home", params: { id: "new" } });
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
    logout1() {
      this.$confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        LoginOut().then(() => {
          const user = localStorage.rst_user || null;
          store.commit("clearCancelToken");
          sessionStorage.clear();
          localStorage.clear();
          if (user) {
            localStorage.rst_user = user;
          }
          this.$router.push("/login");
        });
      });
    },
    logout() {
      LoginOut().then(() => {
        const user = localStorage.rst_user || null;
        store.commit("clearCancelToken");
        sessionStorage.clear();
        localStorage.clear();
        if (user) {
          localStorage.rst_user = user;
        }
        this.$router.push("/login");
      });
    },
    goback() {
      ReleasePatient().then(() => {
        this.$router.push("/");
      });
    },
  },
  // beforeRouteLeave(to, from, next) {
  //   this.$store.state.isHeartbeat = false;
  //   this.$store.state.isSoftdog = false;
  //   if (this.Timer) {
  //     clearInterval(this.Timer);
  //   }
  //   if (this.dog_Timer) {
  //     clearInterval(this.dog_Timer);
  //   }
  //   next();
  // },
  // beforeDestroy() {
  //   this.$store.state.isHeartbeat = false;
  //   this.$store.state.isSoftdog = false;
  //   if (this.Timer) {
  //     clearInterval(this.Timer);
  //   }
  //   if (this.dog_Timer) {
  //     clearInterval(this.dog_Timer);
  //   }
  // },
};
</script>
<style lang="scss" scoped>
.header-component {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 10px;
  .logo {
    color: #fff;
    font-size: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &::before {
      width: 65px;
      height: 65px;
      background: url(../assets/img/logo2.png) no-repeat;
      background-size: 100% auto;
      content: "";
      margin: 10px 0 0 0;
    }
  }
  .user {
    display: flex;
    align-items: center;
    cursor: pointer;
    .back-btn {
      width: 110px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      color: #fff;
      background: -webkit-linear-gradient(left, #0bd2b0, #21b0fa);
      margin-right: 74px;
      &::before {
        margin-right: 5px;
      }
    }
    .model_title {
      margin-right: 8px;
      color: #409eff;
    }
    .nick {
      margin-left: 8px;
      color: #fff;
    }
  }

  .btnContainer {
    overflow: hidden;
    padding: 0 15px;
    margin-bottom: 10px;
    display: flex;
  }
}
/deep/.el-form-item__label {
  color: #666 !important;
}
</style>
