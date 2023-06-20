<template>
  <div id="app">
    <keep-alive>
      <router-view :key="$route.path" v-if="isLoggedIn"></router-view>
    </keep-alive>
    <router-view :key="$route.path" v-if="!isLoggedIn"></router-view>
    <!-- <router-view v-else :key="$route.path"></router-view> -->
    <!-- <template v-if="$route.meta.keepAlive">
      <keep-alive>
        <router-view :key="$route.path"></router-view>
      </keep-alive>
    </template>
    <template v-else>
      <router-view :key="$route.path"></router-view>
    </template> -->
  </div>
</template>

<script>
import { LoginOut, CheckDog } from "@/services/api";
import { Loading } from "element-ui";
import SoftKey3W from "@/utils/Syunew3W.js";
export default {
  data() {
    return {
      isLoggedIn: false,
      routename: "",
      path: "",
      DOG_DEVICE_PATH: "",
      fullscreenLoading: null,
      beforeUnload_time: "",
      gap_time: "",
    };
  },
  watch: {
    $route(to, from) {
      console.log(to.name);
      this.routename = to.name;
      if (to.name === "home" && from.name ==="login") {
        this.$router.go(0); // 刷新该页面
      }
      if (to.name === "patient"||to.name == "workuser"||to.name == "workreport"||to.name == "workmodel"||to.name == "Report") {
        this.isLoggedIn = false;
      } else {
        this.isLoggedIn = true;
      }
      // console.log(this.isLoggedIn);
      // if the route changes...
    },
  },
  created() {
    // let path = this.$route.path || "";
    // let name = this.$route;
    // console.log(name);
    // if (path != "/login" && path != "/detail") {
    //   // firebase returns null if user logged out
    //   this.isLoggedIn = true;
    // } else {
    //   this.isLoggedIn = false;
    // }
  },
  mounted() {
    this.path = this.$route.path || "";
    if (this.path != "/login") {
      if(localStorage.enable_softdog=="true"){
      this.get_dog_path();
      this.initNewDog();
      }
      //监听关闭标签页
      window.addEventListener("beforeunload", (e) =>
        this.beforeunloadHandler(e)
      );
      window.addEventListener("unload", (e) => this.unloadHandler(e));
    }
  },
  methods: {
    get_dog_path() {
      let self = this;
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
            s_pnp.Socket_UK.close();
            if (UK_Data.LastError != 0) {
              if (self.$route.path != "/login") {
                self.fullscreenLoading = Loading.service({
                  lock: true,
                  text: "请插入加密狗！！！",
                  spinner: "el-icon-loading",
                  background: "rgba(0, 0, 0, 0.7)",
                });
              }
              reject("【登录页面】未发现加密锁，请插入加密锁");
              return false;
            }
            self.DOG_DEVICE_PATH = UK_Data.return_value; //获得返回的UK的路径
            self.checkPriDog();
            resolve(UK_Data.return_value); //获得返回的UK的路径
          };
        } catch (e) {
          reject("【登录页面】程序运行异常");
        }
      });
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
      var ValidateCode = this.guid();
      var ciphertext = await this.encrypt(this.DOG_DEVICE_PATH, ValidateCode);
      var data = {
        text: ValidateCode,
        ciphertext: ciphertext,
      };
      var res1 = await CheckDog(data);
      if (res1.data && this.fullscreenLoading) {
        this.fullscreenLoading.close();
      }
    },
    initNewDog() {
      //加密狗插拔监测
      let self = this;
      let s_pnp = new SoftKey3W();
      //在使用事件插拨时，注意，一定不要关掉Sockey，否则无法监测事件插拨
      s_pnp.Socket_UK.onmessage = function got_packet(Msg) {
        let PnpData = JSON.parse(Msg.data);
        if (PnpData.type == "PnpEvent") {
          //如果是插拨事件处理消息
          if (PnpData.IsIn && self.$route.path != "/login") {
            // alert("UKEY已被插入，被插入的锁的路径是："+PnpData.DevicePath);
            console.log(
              "【登录页面】UKEY已被插入，被插入的锁的路径是：" +
                PnpData.DevicePath +
                "，时间：" +
                new Date().toLocaleString()
            );
            self.get_dog_path();
            self.checkPriDog();
          } else if (self.$route.path != "/login") {
            console.log(
              "【登录页面】UKEY已被拨出，被拨出的锁的路径是：" +
                PnpData.DevicePath +
                "，时间：" +
                new Date().toLocaleString()
            );
            self.fullscreenLoading = Loading.service({
              lock: true,
              text: "请插入加密狗！！！",
              spinner: "el-icon-loading",
              background: "rgba(0, 0, 0, 0.7)",
            });
          }
        }
      };
    },
    beforeunloadHandler() {
      console.log("gap_time" + this.gap_time);
      this.beforeUnload_time = new Date().getTime();
    },
    unloadHandler() {
      this.gap_time = new Date().getTime() - this.beforeUnload_time;
      //判断是窗口关闭还是刷新
      if (this.gap_time <= 5) {
        //如果是登录状态，关闭窗口前，移除用户
        if (this.$route.path != "/login") {
          LoginOut().then(() => {
            const user = localStorage.rst_user || null;
            sessionStorage.clear();
            localStorage.clear();
            if (user) {
              localStorage.rst_user = user;
            }
          }); //释放锁定
        }
      }
    },
  },
  destroyed() {
    window.removeEventListener("beforeunload", (e) =>
      this.beforeunloadHandler(e)
    );
    window.removeEventListener("unload", (e) => this.unloadHandler(e));
  },
};
</script>
<style lang="scss">
* {
  margin: 0;
  padding: 0;
  font-size: 14px;
  user-select: none;
}
.el-checkbox__label {
  line-height: 1;
  color: #fff;
}
.el-radio__label,
.el-form-item__label {
  color: #fff;
}
.el-message {
  min-width: auto;
  padding-left: 15px;
}
.el-message-box {
  padding-bottom: 15px;
}
img {
  display: block;
}
a,
a:active {
  color: #000;
  text-decoration: none;
}
.el-image {
  display: block;
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:active,
.el-button--primary.is-disabled:focus,
.el-button--primary.is-disabled:hover {
  color: rgba(255, 255, 255, 0.4);
}
.el-button--success.is-disabled,
.el-button--success.is-disabled:active,
.el-button--success.is-disabled:focus,
.el-button--success.is-disabled:hover {
  color: rgba(255, 255, 255, 0.4);
}
</style>
