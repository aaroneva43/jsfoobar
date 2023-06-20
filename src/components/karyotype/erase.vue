<template>
  <div class="erase-components" @click.stop="">
    <template v-if="source">
      <svg
        ref="svgitem"
        class="svg"
        :viewBox="`0 0 ${source.width} ${source.height}`"
        :style="{ width: `${source.width * size}px` }"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      >
        <g>
          <image
            id="image"
            :href="`${Host}/api/get_image/?image_path=${source.image}&token=${source.token}&t=${timeStamp}`"
            :width="source.width"
            :height="source.height"
            v-if="show"
          />
        </g>
        <template v-if="rows.length > 0">
          <template v-for="(item, index) in rows">
            <circle
              :key="index"
              :cx="item.split(',')[0]"
              :cy="item.split(',')[1]"
              r="4"
              style="fill: white"
            ></circle>
          </template>
        </template>
      </svg>
      <!-- <el-row
        type="flex"
        align="middle"
        justify="center"
        :style="{ marginTop: '15px' }"
      >
        <el-button
          type="primary"
          icon="el-icon-minus"
          :disabled="size === 3"
          @click.stop="size--"
        ></el-button>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="size >= 7"
          @click.stop="size++"
        ></el-button>
      </el-row> -->
    </template>
  </div>
</template>
<script>
import { HandleEraseChromo } from "@/services/api";
export default {
  props: {
    source: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      rows: [],
      flag: false,
      timeStamp: 0,
      show: true,
      size: 3,
    };
  },
  mounted() {
    this.timeStamp = new Date().getTime();
  },
  methods: {
    // 鼠标按下
    handleMouseDown() {
      console.log("鼠标按下");
      this.flag = !this.flag;
    },

    // 鼠标移动
    handleMouseMove(e) {
      if (this.flag) {
        let svg = this.$refs.svgitem;
        let pt = this.cursorPoint(e, svg);
        this.rows.push(`${Math.ceil(pt.x)},${Math.ceil(pt.y)}`);
      }
    },

    // 鼠标弹起
    handleMouseUp() {
      console.log("鼠标弹起");
      const that = this;
      if (that.flag) {
        that.flag = false;
        if (that.rows.length > 0) {
          const loading = this.$loading({
            lock: true,
            text: "正在处理中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          that.show = false;
          HandleEraseChromo({
            chromosome_id: that.source.id,
            image_type: 0,
            brush_path: that.rows.join(";"),
            brush_radius: 4,
          })
            .then(({ data }) => {
              that.timeStamp = new Date().getTime();
              that.source.image = data.image_path;
              let image = new Image();
              image.src = `${this.Host}/api/get_image/?image_path=${data.image_path}&token=${that.source.token}&t=${that.timeStamp}`;
              image.onload = function () {
                that.$nextTick(() => {
                  that.source.width = image.width;
                  that.source.height = image.height;
                  that.show = true;
                  that.$emit("change");
                });
              };
              that.rows = [];
              loading.close();
            })
            .catch((err) => {
              loading.close();
              this.$message.error(err);
            });
        }
      }
    },

    cursorPoint(evt, svg) {
      let pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    },
  },
};
</script>
<style lang="scss" scoped>
.erase-components {
  background-color: #fff;
  padding: 1%;
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.3);
  .svg {
    height: 100%;
    display: block;
    margin: 0 auto;
  }
}
</style>