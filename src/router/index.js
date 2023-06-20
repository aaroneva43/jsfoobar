import Vue from "vue";
import VueRouter from "vue-router";
import Main from "@/views/main";
Vue.use(VueRouter);
// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
const routes = [
  {
    path: "/new",
    name: 'home',
    meta: {
      keepAlive: true
    },
    component: () => import("@/views/index"),
  }, {
    path: "/",
    name: 'home',
    meta: {
      keepAlive: true
    },
    component: () => import("@/views/newindex"),
  },
  {
    path: "/login",
    name: 'login',
    meta: {
      keepAlive: false
    },
    component: () => import("@/views/login"),
  },
  {
    path: "/detail/:patient/:id",
    name: 'patient',
    meta: {
      keepAlive: false
    },
    component: () => import("@/views/detail"),
  },
  {
    path: "/Home/:id/:isEdit",
    name: "ModelHome",
    meta: {
      keepAlive: true
    },
    component: () => import("@/views/Home"),
  },
  {
    path: "/Report/:id/:hideSex",
    name: "Report",
    meta: {
      keepAlive: true
    },
    component: () => import("@/views/report"),
  },
  {
    path: "/workuser",
    icon: "el-icon-s-home",
    component: Main,
    children: [
      {
        path: "/workuser",
        name:"workuser",
        component: () => import("@/views/user")
      }
    ]
  },
  {
    path: "/workreport",
    icon: "el-icon-document",
    component: Main,
    children: [
      {
        path: "/workreport",
        name:"workreport",
        component: () => import("@/views/workreport")
      }
    ]
  }, {
    path: "/workmodel",
    icon: "el-icon-s-home",
    component: Main,
    children: [
      {
        path: "/workmodel",
        name:"workmodel",
        component: () => import("@/views/model")
      }
    ]
  },
];

const router = new VueRouter({
  routes,
});

export default router;
