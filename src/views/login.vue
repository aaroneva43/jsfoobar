<template>
  <div class="login-page">
    <!-- <div class="logo">人类染色体核型智能分析系统</div> -->
    <div class="container">
      <div class="title">
        <div class="group_1"></div>
        <div class="group_2"></div>
        <div class="group_3">
          <div class="text-wrapper_1">
            <span class="text_1">Deoxyribonucleic</span>
          </div>
          <div class="text-wrapper_2">
            <span class="text_3">登录</span>
            <span class="text_4">Login</span>
          </div>
        </div>
      </div>
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            prefix-icon="el-icon-user"
            placeholder="登录名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="form.password"
            prefix-icon="el-icon-lock"
            placeholder="密码"
            clearable
          ></el-input>
        </el-form-item>
        <el-row
          type="flex"
          align="middle"
          justify="space-between"
          :style="{ paddingBottom: '15px' }"
        >
          <el-checkbox v-model="checked" class="checkbox">记住密码</el-checkbox>
          <div v-if="isNeedDog && isDogSuccess" class="valid el-icon-success">
            U盾验证成功
          </div>
          <div
            v-else-if="isNeedDog && !isDogSuccess"
            class="validfail el-icon-error"
          >
            U盾验证失败
          </div>
        </el-row>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="isLogin"
          :style="{ width: '100%' }"
          @click="handleLogin"
          >登录</el-button
        >
        <div class="tip">建议使用 1920 x 1080 分辨率浏览</div>
      </el-form>
    </div>
  </div>
</template>

<script>
import {
  AdminLogin,
  GetConfig,
  ChallengeSoftdog,
  ValidateSoftdog,
  CheckDog,
} from "@/services/api";

import store from "@/store";
import { mapActions } from "vuex";
import SoftKey3W from "@/utils/Syunew3W.js";
export default {
  data() {
    return {
      form: {
        username: "",
        password: "",
      },
      rules: {
        username: [{ required: true, message: "用户名不能为空" }],
        password: [{ required: true, message: "密码不能为空" }],
      },
      loading: false,
      checked: false,
      isDogSuccess: false,
      isDogInsert: false,
      isNeedDog: false,
      DOG_DEVICE_PATH: null, //加密狗设备路径
      dog_Timer: null,
      dog_is_success: false,
    };
  },
  created() {
    const user = localStorage.rst_user || null;
    if (user) {
      this.form = JSON.parse(user);
      this.checked = true;
    }
  },
  mounted() {
    this.initConfig();
    this.enterKeyup(); // 绑定enter事件
  },
  computed: {
    isLogin() {
      if (this.isNeedDog && this.isDogSuccess) {
        return false;
      } else if (!this.isNeedDog) {
        return false;
      } else {
        return true;
      }
    },
  },
  // watch: {
  //   $route() {
  //     const This = this;
  //     const vueInstance = this.$refs.routerView;
  //     console.log(vueInstance);
  //     const caches = vueInstance.$vnode.parent.componentInstance.cache;
  //     Object.keys(caches).map((key) => {
  //       if (!This.delBeforeViews.find((item) => item.path == key)) {
  //         This.removeCache(caches[key].componentInstance);
  //       }
  //     });
  //   },
  // },
  methods: {
    ...mapActions(["setSoftdog", "setHeartbeat"]),
    enterKey(event) {
      if (
        !this.isLogin &&
        this.form.username != "" &&
        this.form.password != ""
      ) {
        const code = event.keyCode
          ? event.keyCode
          : event.which
          ? event.which
          : event.charCode;
        if (code == 13) {
          this.handleLogin();
        }
      }
    },
    enterKeyupDestroyed() {
      document.removeEventListener("keyup", this.enterKey);
    },
    enterKeyup() {
      document.addEventListener("keyup", this.enterKey);
    },
    removeCache(vueInstance) {
      const key =
        vueInstance.$vnode.key ??
        vueInstance.$vnode.componentInstance.Ctor.cid +
          (vueInstance.$vnode.componentInstance.tag
            ? `::${vueInstance.$vnode.componentInstance.tag}`
            : "");
      const cache = vueInstance.$vnode.parent.componentInstance.cache;
      const keys = vueInstance.$vnode.parent.componentInstance.keys;
      if (cache[key]) {
        vueInstance.$destroy();
        delete cache[key];
        const index = keys.indexOf(key);
        if (index > -1) {
          keys.splice(index, 1);
        }
      }
    },
    initConfig() {
      localStorage.heartbeat_duration = 60;
      localStorage.enable_heartbeat = false;
      localStorage.softdog_duration = 60;
      localStorage.enable_softdog = false;
      localStorage.report_lis = false;
      GetConfig(null).then((res) => {
        localStorage.standard_chromo_resolution =
          res.data.standard_chromo_resolution;
        localStorage.standard_chromo_scale = res.data.standard_chromo_scale;
        if (res.data && res.data.enable_heartbeat == true) {
          localStorage.enable_heartbeat = true;
          localStorage.heartbeat_duration =
            Number(res.data.heartbeat_duration) / 5;
        } else {
          localStorage.heartbeat_duration = 60;
          localStorage.enable_heartbeat = false;
        }
        if (res.data && res.data.report_lis == true) {
          localStorage.report_lis = true;
        }
        if (res.data && res.data.enable_softdog == true) {
          localStorage.softdog_duration = Number(res.data.softdog_duration) / 5;
          this.isNeedDog = true;
          localStorage.enable_softdog = true;
          this.CheckDog();
          // this.dog_Timer = setInterval(() => {
          //   this.checkPriDog();
          // }, 5000);
        } else {
          this.isNeedDog = false;
          localStorage.softdog_duration = 60;
          localStorage.enable_softdog = false;
        }
      });
    },

    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid() {
      return (
        this.S4() +
        this.S4() +
        this.S4() +
        this.S4() +
        this.S4() +
        this.S4() +
        this.S4() +
        this.S4()
      );
    },
    async checkPriDog() {
      if (this.isDogInsert) {
        var ValidateCode = this.guid();
        var ciphertext = await this.encrypt(this.DOG_DEVICE_PATH, ValidateCode);
        var data = {
          text: ValidateCode,
          ciphertext: ciphertext,
        };
        var res1 = await CheckDog(data);
        if (res1.data) {
          this.isDogSuccess = true;
        } else {
          this.isDogSuccess = false;
        }
      } else {
        this.isDogSuccess = false;
      }
    },
    async CheckDog() {
      try {
        this.isDogInsert = false;
        var res = await this.get_dog_path();
        this.isDogInsert = true;
        this.DOG_DEVICE_PATH = res;
        console.log(
          "【登录页面】加密狗获取路径成功:" +
            this.DOG_DEVICE_PATH +
            "，时间：" +
            new Date().toLocaleString()
        );
        this.dog_plug_monitor(); //初始化心跳与加密狗
        this.checkPriDog();
      } catch (err) {
        this.dog_plug_monitor();
        this.isDogSuccess = false;
        console.error(err);
      }
    },
    handleLogin() {
      this.setHeartbeat(false);
      this.setSoftdog(false);
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          AdminLogin(this.form)
            .then(({ data }) => {
              sessionStorage.rst_token = data;
              this.loading = false;
              if (this.checked) {
                localStorage.rst_user = JSON.stringify(this.form);
              } else {
                localStorage.rst_user = "";
              }
              this.$router.push("/");
              // if (
              //   !localStorage.enable_softdog ||
              //   localStorage.enable_softdog == undefined
              // ) {
              //   GetConfig(null).then((res) => {
              //     if (res.data && res.data.enable_heartbeat == true) {
              //       localStorage.enable_heartbeat = true;
              //       localStorage.heartbeat_duration =
              //         Number(res.data.heartbeat_duration) / 5;
              //     } else {
              //       localStorage.heartbeat_duration = 60;
              //       localStorage.enable_heartbeat = false;
              //     }
              //     if (res.data && res.data.report_lis == true) {
              //       localStorage.report_lis = true;
              //     }
              //     if (res.data && res.data.enable_softdog == true) {
              //       localStorage.softdog_duration =
              //         Number(res.data.softdog_duration) / 5;
              //       this.isNeedDog = true;
              //       localStorage.enable_softdog = true;
              //       this.initDogPath();
              //     } else {
              //       this.isNeedDog = false;
              //       localStorage.softdog_duration = 60;
              //       localStorage.enable_softdog = false;
              //     }
              //   });
              // } else if (localStorage.enable_softdog == "true") {
              //   this.initDogPath();
              // } else {
              //   this.$router.push("/");
              // }
            })
            .catch((err) => {
              this.loading = false;
              this.$message.error(
                "【登录页面】" + err + "，时间：" + new Date().toLocaleString()
              );
            });
        }
      });
    },
    initDogCheck() {
      this.dog_plug_monitor();
      this.checkSoftdog();
    },
    async checkSoftdog() {
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
          console.log(
            "【登录页面】加密狗挑战验证码:" +
              ValidateCode +
              "，时间：" +
              new Date().toLocaleString()
          );
          const res2 = await this.encrypt(this.DOG_DEVICE_PATH, ValidateCode);
          const res3 = await ValidateSoftdog(res2);
          if (res3 && res3.code == 200) {
            if (res3.data.is_success == false) {
              this.$message.error(
                "【登录页面】U盾验证失败,无法登陆,请联系管理员!"
              );
              return;
            }
            console.log(
              "【登录页面】加密狗挑战成功:" +
                res3.data.is_success +
                "，时间：" +
                new Date().toLocaleString()
            );
            this.dog_is_success = res3.data.is_success;
            sessionStorage.setItem("dog_valid_time", res3.data.valid_time);
            this.$router.push("/");
          } else {
            this.dog_is_success = false;
            console.log(
              "【登录页面】加密狗挑战失败" +
                "，时间：" +
                new Date().toLocaleString()
            );
            this.$message.error(
              "【登录页面】U盾验证失败,无法登陆,请联系管理员!"
            );
            this.logout();
          }
        } else {
          this.dog_is_success = false;
          console.log(
            "【登录页面】获取加密狗挑战失败" +
              "，时间：" +
              new Date().toLocaleString()
          );
          this.$message.error("【登录页面】U盾验证失败,无法登陆,请联系管理员!");
        }
      } else {
        this.dog_is_success = false;
        console.log(
          "【登录页面】加密狗路径查找失败！" +
            "，时间：" +
            new Date().toLocaleString()
        );
        this.$message.error(
          "【登录页面】U盾验证路径查找失败,无法登陆,请联系管理员！"
        );
      }
    },
    initDogPath() {
      this.get_dog_path()
        .then((res) => {
          this.DOG_DEVICE_PATH = res;
          this.isDogInsert = true;
          console.log(
            "【登录页面】加密狗获取路径成功:" +
              this.DOG_DEVICE_PATH +
              "，时间：" +
              new Date().toLocaleString()
          );
          this.initDogCheck(); //初始化心跳与加密狗
        })
        .catch((err) => {
          this.isDogInsert = false;
          console.log(
            "【登录页面】加密狗获取路径失败:" +
              err +
              "，时间：" +
              new Date().toLocaleString()
          );
          this.initDogCheck(); //初始化心跳与加密狗
        });
    },
    get_dog_path() {
      //获取加密狗设备路径
      let self = this;
      return new Promise((resolve, reject) => {
        try {
          let s_pnp = new SoftKey3W();
          s_pnp.Socket_UK.onopen = function () {
            s_pnp.FindPort(0); //发送命令取UK的路径
          };
          s_pnp.Socket_UK.onmessage = function got_packet(Msg) {
            let UK_Data = JSON.parse(Msg.data);
            if (UK_Data.type != "Process") return; //如果不是流程处理消息，则跳过

            s_pnp.Socket_UK.close();
            if (UK_Data.LastError != 0) {
              self.isDogInsert = false;
              reject("【登录页面】未发现加密锁，请插入加密锁");
              return false;
            }
            self.isDogInsert = true;
            // self.DevicePath = UK_Data.return_value; //获得返回的UK的路径
            resolve(UK_Data.return_value); //获得返回的UK的路径
          };
        } catch (e) {
          self.isDogInsert = false;
          reject("【登录页面】程序运行异常");
        }
      });
    },
    dog_plug_monitor() {
      //加密狗插拔监测
      let s_pnp = new SoftKey3W();
      let self = this;
      //在使用事件插拨时，注意，一定不要关掉Sockey，否则无法监测事件插拨
      s_pnp.Socket_UK.onmessage = function got_packet(Msg) {
        let PnpData = JSON.parse(Msg.data);
        if (PnpData.type == "PnpEvent") {
          //如果是插拨事件处理消息
          if (PnpData.IsIn) {
            // alert("UKEY已被插入，被插入的锁的路径是："+PnpData.DevicePath);
            console.log(
              "【登录页面】UKEY已被插入，被插入的锁的路径是：" +
                PnpData.DevicePath +
                "，时间：" +
                new Date().toLocaleString()
            );
            self.isDogInsert = true;
            self.DOG_DEVICE_PATH = PnpData.DevicePath;
            if (!self.isDogSuccess) {
              self.checkPriDog();
            }
          } else {
            console.log(
              "【登录页面】UKEY已被拨出，被拨出的锁的路径是：" +
                PnpData.DevicePath +
                "，时间：" +
                new Date().toLocaleString()
            );
            self.isDogSuccess = false;
            self.isDogInsert = false;
            self.DOG_DEVICE_PATH = null;
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
              reject("程序运行异常");
              return; //如果不是流程处理消息，则跳过
            } //如果不是流程处理消息，则跳过

            if (UK_Data.LastError != 0) {
              s_pnp.Socket_UK.close();
              console.log(
                "【登录页面】加密出错，错误码：" +
                  UK_Data.LastError.toString() +
                  "，时间：" +
                  new Date().toLocaleString()
              );
              reject(
                "【登录页面】加密出错，错误码：" + UK_Data.LastError.toString()
              );
              return false;
            }
            s_pnp.Socket_UK.close();
            resolve(UK_Data.return_value);
          };
        } catch (e) {
          console.log(
            "【登录页面】加密程序运行异常，时间：" + new Date().toLocaleString()
          );
          reject("【登录页面】程序运行异常");
        }
      });
    },
  },
  // beforeDestroy() {
  //   // 销毁enter事件
  //   this.enterKeyupDestroyed();
  //   if (this.dog_Timer) {
  //     clearInterval(this.dog_Timer);
  //   }
  // },
  // beforeRouteLeave(to, from, next) {
  //   if (this.dog_Timer) {
  //     clearInterval(this.dog_Timer);
  //   }
  //   next();
  // },
};
</script>
<style lang="scss">
.login-page {
  height: 100vh;
  width: 100vw;
  // background: -webkit-linear-gradient(45deg, #070d41, #0c307c);
  background-size: 100% 100%;
  background-image: url("../assets/img/bg1.png");
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  .logo {
    position: absolute;
    left: 12px;
    top: 12px;
    color: #fff;
    font-size: 20px;
    display: flex;
    align-items: center;
    &::before {
      content: "";
      width: 50px;
      height: 50px;
      background: url("../assets/logo.svg") no-repeat;
      background-size: 100% auto;
    }
  }
  .container {
    position: absolute;
    left: 57%;
    top: 0;
    bottom: 0;
    margin: auto 0;
    border-radius: 15px;
    background-image: url("../assets/img/bg3.png");
    background-size: 444px 584px;
    width: 444px;
    height: 584px;
    padding: 80px 85px;
    border: solid 1px rgba(255, 255, 255, 0.15);
    .title {
      display: flex;
      align-items: center;
      flex-direction: row;
      color: #fff;
      padding: 10px 0 30px;
      .group_1 {
        height: 60px;
        border-radius: 5px;
        width: 5px;
        background-color: rgba(64, 180, 255, 1);
      }
      .group_2 {
        width: 65px;
        height: 65px;
        background: url("../assets/img/logo1.png") no-repeat;
        background-size: 100% auto;
      }
      .text_1 {
        font-size: 18px;
        line-height: 28px;
      }
      .text_3 {
        font-size: 18px;
        line-height: 28px;
        margin-right: 10px;
      }
    }
    .tip {
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 12px;
      padding-top: 15px;
    }
    .checkbox {
      color: #fff;
      .el-checkbox__label {
        line-height: 1;
      }
    }
    .valid {
      color: #fff;
      display: flex;
      align-items: center;
      &::before {
        color: #1bca71;
        margin-right: 5px;
      }
    }

    .validfail {
      color: #fff;
      display: flex;
      align-items: center;
      &::before {
        color: #ff0000;
        margin-right: 5px;
      }
    }
  }
}
</style>
