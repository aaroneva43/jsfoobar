<template>
  <div>
    <div class="toolbar">
      <el-button @click="goBack" size="small">返回</el-button>
      <el-button v-show="isEdit==0" @click="undo" size="small"
        ><i class="el-icon-refresh-left"></i
      ></el-button>
      <el-button v-show="isEdit==0" @click="redo" size="small"
        ><i class="el-icon-refresh-right"></i
      ></el-button>
      <label for="input" class="insert" v-show="isEdit==0">插入图片</label>
      <input id="input" type="file" hidden @change="handleFileChange" />
      <el-button style="margin-left: 10px" @click="preview" size="small"
        >预览</el-button
      >
      <el-button @click="save" size="small" v-show="isEdit==0">保存</el-button>
      <el-button @click="clearCanvas" size="small" v-show="isEdit==0"
        >清空画布</el-button
      >
      <!-- <el-button :disabled="!areaData.components.length" @click="compose">组合</el-button>
            <el-button
                :disabled="!curComponent || curComponent.isLock || curComponent.component != 'Group'"
                @click="decompose"
            >
                拆分
            </el-button> -->

      <!-- <el-button :disabled="!curComponent || curComponent.isLock" @click="lock"
        >锁定</el-button
      >
      <el-button
        :disabled="!curComponent || !curComponent.isLock"
        @click="unlock"
        >解锁</el-button
      > -->
      <div class="canvas-config">
        <span>画布大小： </span>
        <el-radio-group v-model="canvasStyleData.page_size" size="small">
          <el-radio-button :label="0">A4</el-radio-button>
          <el-radio-button :label="1">A5</el-radio-button>
        </el-radio-group>
        <!-- <input v-model="canvasStyleData.width">
                <span>*</span>
                <input v-model="canvasStyleData.height"> -->
      </div>
      <div class="canvas-config">
        <span> 打印方向： </span>
        <el-radio-group v-model="canvasStyleData.page_orientation" size="small">
          <el-radio-button :label="1">纵向</el-radio-button>
          <el-radio-button :label="0">横向</el-radio-button>
        </el-radio-group>
      </div>
      <div class="canvas-config">
        <span> 性染色体隐藏： </span>
        <el-radio-group v-model="canvasStyleData.hide_sex" size="small">
          <el-radio-button :label="2">隐藏全部</el-radio-button>
          <el-radio-button :label="1">显示X染色体</el-radio-button>
          <el-radio-button :label="0">不隐藏</el-radio-button>
        </el-radio-group>
      </div>
      <!-- <div class="canvas-config">
        <span> 默认模板： </span>
        <el-radio-group v-model="canvasStyleData.is_default">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </div> -->
      <div class="canvas-config">
        <span> 画布比例： </span>
        <el-input-number
          v-model="scale"
          :step="10"
          size="small"
          @change="handleScaleChange"
        />
        %
      </div>
    </div>
    <!-- 预览 -->
    <Preview v-model="isShowPreview" @change="handlePreviewChange" />
  </div>
</template>

<script>
import generateID from "@/utils/generateID";
import toast from "@/utils/toast";
import { mapState } from "vuex";
import Preview from "@/components/Editor/Preview";
import { commonStyle, commonAttr } from "@/custom-component/component-list";
import eventBus from "@/utils/eventBus";
import { deepCopy } from "@/utils/utils";
import { SaveTemplete } from "@/services/api";
export default {
  components: { Preview },
  data() {
    return {
      isEdit: this.$route.params.isEdit,
      isShowPreview: false,
      needToChange: [
        "top",
        "left",
        "width",
        "height",
        "fontSize",
        "borderWidth",
      ],
      scale: "100%",
      timer: null,
    };
  },
  computed: mapState([
    "componentData",
    "canvasStyleData",
    "areaData",
    "curComponent",
  ]),
  watch: {
    "canvasStyleData.page_size": {
      handler(newVal) {
        var w = 595,
          h = 842;
        if (this.canvasStyleData.page_orientation == 0) {
          w = 842;
          h = 595;
        }
        if (newVal == 0) {
          this.scale = 100;
          this.canvasStyleData.width = w;
          this.canvasStyleData.height = h;
          this.handleScaleChange();
        } else {
          this.scale = 140;
          this.canvasStyleData.width = w / 2;
          this.canvasStyleData.height = h / 2;
          this.handleScaleChange();
        }
      },
      deep: false,
      immediate: true,
    },
    "canvasStyleData.page_orientation": {
      handler(newVal) {
        var w = 595,
          h = 842;
        if (this.canvasStyleData.page_size == 1) {
          w = 595 / 2;
          h = 842 / 2;
        }
        if (newVal == 1) {
          this.canvasStyleData.width = w;
          this.canvasStyleData.height = h;
          this.handleScaleChange();
        } else {
          this.canvasStyleData.width = h;
          this.canvasStyleData.height = w;
          this.handleScaleChange();
        }
      },
      deep: false,
      immediate: true,
    },
  },
  created() {
    eventBus.$on("preview", this.preview);
    eventBus.$on("save", this.save);
    eventBus.$on("clearCanvas", this.clearCanvas);
    // if (!this.canvasStyleData.page_size) {
    //   this.canvasStyleData.page_size = "a4";
    // }
    // if (!this.canvasStyleData.page_orientation) {
    //   this.canvasStyleData.page_orientation = "1";
    // }
    // if (!this.canvasStyleData.hide_sex) {
    //   this.canvasStyleData.hide_sex = "1";
    // }
    this.scale = this.canvasStyleData.scale;
  },
  methods: {
    format(value) {
      const scale = this.scale;
      return (value * parseInt(scale)) / 100;
    },

    getOriginStyle(value) {
      const scale = this.canvasStyleData.scale;
      const result = value / (parseInt(scale) / 100);
      return result;
    },

    handleScaleChange() {
      clearTimeout(this.timer);
      let self = this;
      this.timer = setTimeout(() => {
        // 画布比例设一个最小值，不能为 0
        // eslint-disable-next-line no-bitwise
        this.scale = ~~this.scale || 1;
        const componentData = deepCopy(this.componentData);
        componentData.forEach((component) => {
          Object.keys(component.style).forEach((key) => {
            if (this.needToChange.includes(key)) {
              // 根据原来的比例获取样式原来的尺寸
              // 再用原来的尺寸 * 现在的比例得出新的尺寸
              // 不能用 Math.round 防止 1 px 的边框变 0
              component.style[key] = Math.ceil(
                this.format(this.getOriginStyle(component.style[key]))
              );
            }
          });
        });
        this.$store.commit("setComponentData", componentData);
        if (self.canvasStyleData.height > 2000 && self.scale == 100) {
          self.canvasStyleData.width = 595;
          self.canvasStyleData.height = 842;
          self.$store.commit("setCanvasStyle", {
            ...self.canvasStyleData,
            scale: self.scale,
          });
        } else {
          self.$store.commit("setCanvasStyle", {
            ...self.canvasStyleData,
            scale: self.scale,
          });
        }
      }, 500);
    },

    lock() {
      this.$store.commit("lock");
    },

    unlock() {
      this.$store.commit("unlock");
    },

    compose() {
      this.$store.commit("compose");
      this.$store.commit("recordSnapshot");
    },

    decompose() {
      this.$store.commit("decompose");
      this.$store.commit("recordSnapshot");
    },
    goBack() {
      this.$router.push("/workmodel");
    },
    undo() {
      this.$store.commit("undo");
    },

    redo() {
      this.$store.commit("redo");
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      if (!file.type.includes("image")) {
        toast("只能插入图片");
        return;
      }
      const reader = new FileReader();
      reader.onload = (res) => {
        const fileResult = res.target.result;
        const img = new Image();
        img.onload = () => {
          this.$store.commit("addComponent", {
            component: {
              ...commonAttr,
              id: generateID(),
              component: "Picture",
              label: "图片",
              icon: "",
              propValue: fileResult,
              style: {
                ...commonStyle,
                top: 0,
                left: 0,
                width: img.width,
                height: img.height,
              },
            },
          });

          this.$store.commit("recordSnapshot");

          // 修复重复上传同一文件，@change 不触发的问题
          document.querySelector("#input").setAttribute("type", "text");
          document.querySelector("#input").setAttribute("type", "file");
        };

        img.src = fileResult;
      };

      reader.readAsDataURL(file);
    },

    preview() {
      this.isShowPreview = true;
      this.$store.commit("setEditMode", "preview");
    },

    save() {
      var componentData = JSON.parse(JSON.stringify(this.componentData));
      componentData = componentData.map((x) => {
        x.id = x.fileId;
        return x;
      });
      // console.log(this.componentData);
      // console.log(this.canvasStyleData);
      if (!this.canvasStyleData.id) {
        this.$prompt("请输入模板名称", "保存模板", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
        })
          .then(({ value }) => {
            this.canvasStyleData.name = value;
            // localStorage.setItem(
            //   "canvasData",
            //   JSON.stringify(this.componentData)
            // );
            // localStorage.setItem(
            //   "canvasStyle",
            //   JSON.stringify(this.canvasStyleData)
            // );
            var data = {
              id: this.canvasStyleData.id || null,
              name: value,
              page_size: this.canvasStyleData.page_size,
              page_orientation: this.canvasStyleData.page_orientation,
              hide_sex: this.canvasStyleData.hide_sex,
              content: JSON.stringify(componentData),
              status: this.canvasStyleData.status || 0,
              is_default: this.canvasStyleData.is_default || 0,
            };
            SaveTemplete(data)
              .then((res) => {
                if (res.code == 200) {
                  this.canvasStyleData.id = res.data;
                  this.$message({
                    type: "success",
                    message: "保存成功 ",
                    offset: 300,
                  });
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch((err) => {
                this.$message.error(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        var data = {
          id: this.canvasStyleData.id || null,
          name: this.canvasStyleData.name,
          page_size: this.canvasStyleData.page_size,
          page_orientation: this.canvasStyleData.page_orientation,
          hide_sex: this.canvasStyleData.hide_sex,
          content: JSON.stringify(componentData),
          status: this.canvasStyleData.status || 0,
          is_default: this.canvasStyleData.is_default || 0,
        };
        SaveTemplete(data)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "保存成功 ",
                offset: 300,
              });
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      }
    },

    clearCanvas() {
      this.$store.commit("setCurComponent", { component: null, index: null });
      this.$store.commit("setComponentData", []);
      this.$store.commit("recordSnapshot");
    },

    handlePreviewChange() {
      this.$store.commit("setEditMode", "edit");
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  padding: 15px 10px;
  white-space: nowrap;
  overflow-x: auto;
  background: #fff;
  border-bottom: 1px solid #ddd;

  .canvas-config {
    display: inline-block;
    margin-left: 10px;
    font-size: 14px;
    color: #606266;

    input {
      width: 50px;
      margin-left: 10px;
      outline: none;
      padding: 0 5px;
      border: 1px solid #ddd;
      color: #606266;
    }

    span {
      margin-left: 10px;
    }
  }

  .insert {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    transition: 0.1s;
    font-weight: 500;
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 3px;
    margin-left: 10px;

    &:active {
      color: #3a8ee6;
      border-color: #3a8ee6;
      outline: 0;
    }

    &:hover {
      background-color: #ecf5ff;
      color: #3a8ee6;
    }
  }
}
/deep/ .el-input-number__decrease {
  background: #fff;
  color: #666;
}
/deep/ .el-input-number__increase {
  background: #fff;
  color: #666;
}
/deep/ .el-radio__label {
  color: #606266 !important;
}
</style>
