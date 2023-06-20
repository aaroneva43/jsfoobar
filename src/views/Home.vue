<template>
  <div class="home">
    <web-header v-show="false"></web-header>
    <Toolbar />
    <main>
      <!-- 左侧组件列表 -->
      <section class="left">
        <ComponentList />
      </section>
      <!-- 中间画布 -->
      <section class="center">
        <div
          class="content"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @mousedown="handleMouseDown"
          @mouseup="deselectCurComponent"
        >
          <Editor />
        </div>
      </section>
      <!-- 右侧属性列表 -->
      <section class="right">
        <el-tabs v-model="activeName">
          <el-tab-pane label="属性" name="attr">
            <AttrList v-if="curComponent" />
            <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <!-- <el-tab-pane label="动画" name="animation">
                        <AnimationList v-if="curComponent" />
                        <p v-else class="placeholder">请选择组件</p>
                    </el-tab-pane>
                    <el-tab-pane label="事件" name="events">
                        <EventList v-if="curComponent" />
                        <p v-else class="placeholder">请选择组件</p>
                    </el-tab-pane> -->
        </el-tabs>
      </section>
    </main>
  </div>
</template>

<script>
import WebHeader from "@/components/header";
import Editor from "@/components/Editor/index";
import ComponentList from "@/components/ComponentList"; // 左侧列表组件
import AttrList from "@/components/AttrList"; // 右侧属性列表
import AnimationList from "@/components/AnimationList"; // 右侧动画列表
import EventList from "@/components/EventList"; // 右侧事件列表
import componentList from "@/custom-component/component-list"; // 左侧列表数据
import Toolbar from "@/components/Toolbar";
import { deepCopy } from "@/utils/utils";
import { mapState } from "vuex";
import generateID from "@/utils/generateID";
import { listenGlobalKeyDown } from "@/utils/shortcutKey";

import { getTemplete } from "@/services/api";
export default {
  components: { Editor, ComponentList, AttrList, Toolbar, WebHeader },
  data() {
    return {
      activeName: "attr",
      reSelectAnimateIndex: undefined,
      id: null,
      isEdit: this.$route.params.isEdit,
    };
  },
  computed: mapState([
    "componentData",
    "curComponent",
    "isClickComponent",
    "canvasStyleData",
    "editor",
  ]),
  created() {},
  // watch: {
  //   "$route.params.id": function (newVal) {
  //     if (newVal) {
  //       this.id = this.$route.params.id;
  //       this.restore();
  //       // 全局监听按键事件
  //       listenGlobalKeyDown();
  //     }
  //   },
  // },
  // mounted(){
  //  this.id = this.$route.params.id;
  //   this.restore();
  //   // 全局监听按键事件
  //   listenGlobalKeyDown();
  // },
  activated() {
    this.id = this.$route.params.id;
    this.restore();
    // 全局监听按键事件
    listenGlobalKeyDown();
  },
  methods: {
    setComponentData(data) {
      var dataList = JSON.parse(data);
      dataList = dataList.map((x) => {
        x.fileid = x.id;
        return x;
      });
      this.$store.commit("setComponentData", this.resetID(dataList));
    },
    setCanvasStyle(data) {
      this.$store.commit("setCanvasStyle", data);
    },
    restore() {
      // 用保存的数据恢复画布
      // if (localStorage.getItem("canvasData")) {
      //   this.$store.commit(
      //     "setComponentData",
      //     this.resetID(JSON.parse(localStorage.getItem("canvasData")))
      //   );
      // }
      // if (localStorage.getItem("canvasStyle")) {
      //   this.$store.commit(
      //     "setCanvasStyle",
      //     JSON.parse(localStorage.getItem("canvasStyle"))
      //   );
      // }
      if (this.id && this.id != "new") {
        getTemplete(this.id)
          .then((res) => {
            if (res.code == 200) {
              var data = {
                id: res.data.id,
                name: res.data.name,
                hide_sex: res.data.hide_sex,
                page_orientation: res.data.page_orientation,
                page_size: res.data.page_size || 0,
                scale: 100,
                status: res.data.status || 0,
                is_default: res.data.is_default || 0,
              };
              var w = 595,
                h = 842;
              if (data.page_orientation == 0) {
                w = 842;
                h = 595;
              }
              if (data.page_size == 0) {
                data.width = w;
                data.height = h;
                data.scale = 100;
              } else {
                data.width = w / 2;
                data.height = h / 2;
                data.scale = 140;
              }
              this.setCanvasStyle(data);
              this.setComponentData(res.data.content);
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      } else {
        var data = {
          hide_sex: 0,
          page_orientation: 1,
          is_default: 0,
          page_size: 0,
          scale: 100,
          width: 595,
          height: 842,
        };
        this.setCanvasStyle(data);
        this.$store.commit("setComponentData", []);
      }
    },

    resetID(data) {
      data.forEach((item) => {
        item.id = generateID();
      });

      return data;
    },

    handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      const index = e.dataTransfer.getData("index");
      const rectInfo = this.editor.getBoundingClientRect();
      if (index) {
        const component = deepCopy(componentList[index]);
        component.style.top = (e.clientY / 4) * 3 - (rectInfo.y / 4) * 3;
        component.style.left = (e.clientX / 6) * 3 - (rectInfo.x / 6) * 3;
        component.id = generateID();
        this.$store.commit("addComponent", { component });
        this.$store.commit("recordSnapshot");
      }
    },

    handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },

    handleMouseDown(e) {
      e.stopPropagation();
      this.$store.commit("setClickComponentStatus", false);
      this.$store.commit("setInEditorStatus", true);
    },

    deselectCurComponent(e) {
      if (!this.isClickComponent) {
        this.$store.commit("setCurComponent", { component: null, index: null });
      }

      // 0 左击 1 滚轮 2 右击
      if (e.button != 2) {
        this.$store.commit("hideContextMenu");
      }
    },
  },
};
</script>

<style lang="scss">
.home {
  height: 100vh;
  background: #fff;

  main {
    height: calc(100% - 64px);
    position: relative;

    .left {
      position: absolute;
      height: 100%;
      width: 282px;
      left: 0;
      top: 0;
      padding-top: 10px;
      overflow-y: auto;
    }

    .right {
      position: absolute;
      height: 100%;
      width: 262px;
      right: 0;
      top: 0;
    }

    .center {
      margin-left: 280px;
      margin-right: 262px;
      background: #f5f5f5;
      height: 100%;
      overflow: auto;
      padding: 20px;

      .content {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    }
  }

  .placeholder {
    text-align: center;
    color: #333;
  }
}
</style>
