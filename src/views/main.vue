<template>
  <div class="home-page">
    <web-header></web-header>
    <div class="container">
      <div class="nav">
        <el-menu
          :default-active="routerPath"
          :collapse="collapse"
          unique-opened
          router
        >
          <div v-for="(item, index) in menu" :key="index">
            <el-menu-item @click="gotoLink(item.authorityCode)" :index="filter(item.authorityCode)">
              <div :class="icon(item.authorityCode)"></div>
              <div class="title">{{ item.label }}</div>
            </el-menu-item>
          </div>
        </el-menu>
        <el-tooltip
          class="item"
          effect="dark"
          content="展开/收缩"
          placement="top"
        >
          <div
            class="openClose"
            :class="{
              'el-icon-s-fold': !collapse,
              'el-icon-s-unfold': collapse,
            }"
            @click="showAndHide"
          ></div>
        </el-tooltip>
      </div>
      <div class="page" :class="{ active: collapse }">
        <router-view :key="$route.path"></router-view>
      </div>
    </div>
  </div>
</template>
<script>
import WebHeader from "@/components/header";
export default {
  components: { WebHeader },
  data() {
    return {
      menu: [
        {
          authorityCode: "Report_Index",
          label: "统计报表",
        },
        {
          authorityCode: "Model_Index",
          label: "自定义模板",
        },
        {
          authorityCode: "User_Index",
          label: "用户管理",
        },
      ],
      user:null,
      collapse: false,
    };
  },
  computed: {
    routerPath() {
      return this.$route.meta.guidePath
        ? this.$route.meta.jumpPath
        : this.$route.path;
    },
  },
  created () {
    this.user=JSON.parse(sessionStorage.user);
    if(this.user.role!=0){
      this.menu=[
        {
          authorityCode: "Report_Index",
          label: "统计报表",
        },
        {
          authorityCode: "Model_Index",
          label: "自定义模板",
        },
      ]
    }else{
      this.menu=[
        {
          authorityCode: "Report_Index",
          label: "统计报表",
        },
        {
          authorityCode: "Model_Index",
          label: "自定义模板",
        },
        {
          authorityCode: "User_Index",
          label: "用户管理",
        },
      ]
    }
  },
  methods: {
    showAndHide() {
      const status = !this.collapse;
      this.collapse = status;
    },
    icon(key) {
      const obj = {
        SCI_Index: "el-icon-s-home",
        User_Index: "el-icon-user-solid",
        Model_Index: "el-icon-s-tools",
        Report_Index: "el-icon-document",
      };
      return obj[key];
    },
    filter(key) {
      const obj = {
        SCI_Index: "/home", // 首页
        User_Index: "/workuser", // 首页
        Model_Index: "/workmodel", // 首页
        Report_Index: "/workreport", // 首页
      };
      return obj[key];
    },
    gotoLink(item){
      console.log(item)
      if (item=="Report_Index")
        this.$router.push("/workreport");
      else if (item=="Model_Index")
        this.$router.push("/workmodel");
      else
        this.$router.push("/workuser");
    }
  },
};
</script>
<style lang="scss" scoped>
/*样式重构*/
.el-menu {
  border-width: 0;
  background-color: transparent;
  margin: 6px 0 0 0;
}
.el-menu-item,
.el-submenu__title {
  height: 48px;
  line-height: 48px;
  color: #595959;
  border-left: solid 3px #fff;
  display: flex;
  align-items: center;
  padding-left: 15px !important;
}
.el-submenu.is-active .el-submenu__title,
.el-menu-item.is-active {
  background-color: #f3f9ff;
  border-left-color: #1a81ff;
  padding-left: 15px !important;
}
.el-submenu.is-active,
.el-menu-item.is-active {
  border-left-color: transparent;
  color: #1a81ff;
}
.el-submenu .el-menu-item {
  max-width: 189px;
  min-width: 189px;
  height: 44px;
  line-height: 44px;
  padding-left: 39px !important;
}
.home-page {
  height: 100vh;
  background-color: #001529;
  overflow: hidden;
  .container {
    height: calc(100vh - 44px);
    overflow: hidden;
    display: flex;
    .nav {
      height: 100%;
      background-color: #fff;
      border-right: solid 1px #edf0f2;
      .el-menu {
        width: 190px;
        overflow: hidden;
        overflow-y: auto;
        height: calc(100vh - 91px);
        &.el-menu--collapse {
          width: 64px;
          .title {
            display: none;
          }
        }
      }
      .openClose {
        border-top: solid 1px #f5f5f5;
        cursor: pointer;
        padding: 15px 0;
        text-align: center;
        font-size: 16px;
        background-color: #fff;
        width: 100%;
      }
    }
    .page {
      width: calc(100% - 191px);
      overflow: hidden;
      overflow-y: auto;
      background: #eee;
      padding: 20px;
      &.active {
        width: calc(100% - 65px);
      }
    }
  }
}
</style>
