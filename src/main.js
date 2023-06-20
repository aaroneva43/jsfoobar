import Vue from "vue";
import ElementUI from "element-ui";
import "./assets/theme/index.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/custom-component"; // 注册自定义组件
import "@/assets/iconfont/iconfont.css";
import "@/styles/animate.scss";
import "@/styles/reset.css";
import uploader from 'vue-simple-uploader'


Vue.use(uploader);
Vue.use(ElementUI);
Vue.config.productionTip = false;

Vue.prototype.Host = process.env.VUE_APP_API_URL;
// Vue.prototype.Host = "http://10.4.2.18:8000";
// Vue.prototype.Host = "http://127.0.0.1:8080";
// Vue.prototype.Host = "http://172.16.177.230:8080";

router.beforeEach((to, from, next) => {
  store.commit("clearCancelToken");
  if (to.path == "/login") {
    sessionStorage.clear();
  }
  const token = sessionStorage.rst_token;
  if (!token && to.path !== "/login") {
    next({ path: "/login" });
  } else {
    next();
  }
});
import VueWorker from 'vue-worker'
Vue.use(VueWorker)
import Print from 'vue-print-nb'
Vue.use(Print);
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
