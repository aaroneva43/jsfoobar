<template>
  <div class="zoom-components" @click.stop="">
    <template v-if="source">
      <svg
        ref="svgitem"
        class="svg"
        :viewBox="`0 0 ${source.width} ${source.height}`"
        :style="{ width: `${source.width * size}px` }"
      >
        <g>
          <image
            id="image"
            :href="`${Host}/api/get_image/?image_path=${source.image}&token=${source.token}&t=${timeStamp}`"
            :width="source.width"
            :height="source.height"
          />
        </g>
      </svg>
      <el-row
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
      </el-row>
    </template>
  </div>
</template>
<script>
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
      size: 3,
    };
  },
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.zoom-components {
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