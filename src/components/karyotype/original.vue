<template>
  <div class="original-components">
    <svg ref="svg" class="svg" id="svg" viewBox="0 0 1600 1200">
      <g id="bg" v-if="row">
        <image
          x="0"
          y="0"
          width="1600"
          height="1200"
          :href="`${Host}/api/get_image/?image_path=${row.image_path}&token=${token}`"
        />
      </g>

      <!-- 轮廓 -->
      <template v-if="originArray.length > 0">
        <template v-for="(item, index) in originArray">
          <path
            fill="transparent"
            :d="`M${item.value}z`"
            :key="`${index}_${item.id}`"
            :class="{
              selected: kid === item.id,
            }"
          />
        </template>
      </template>

      <!-- 计数 -->
      <template v-if="pointsArray.length > 0">
        <template v-for="(item, index) in pointsArray">
          <circle
            r="8"
            :key="index + 300"
            :cx="item.x"
            :cy="item.y"
            :style="`fill: ${row.chromosome_count === 46 ? 'green' : 'red'}`"
          ></circle>
        </template>
      </template>
    </svg>
  </div>
</template>
<script>
export default {
  props: {
    row: {
      type: Object,
      default: () => {
        return {};
      },
    },
    originArray: {
      type: Array,
      default: () => {
        return [];
      },
    },
    pointsArray: {
      type: Array,
      default: () => {
        return [];
      },
    },
    kid: {
      type: String,
      default: () => {
        return "";
      },
    },
  },
  data() {
    return {
      token: sessionStorage.rst_token,
    };
  },
};
</script>
<style lang="scss" scoped>
.original-components {
  clear: both;
  overflow: hidden;
  .svg {
    width: 100%;
    height: 100%;
    path {
      stroke: blue;
      stroke-width: 2;
      stroke-opacity: 1;
      &:hover {
        stroke: red;
      }
      &.selected {
        stroke: red;
      }
    }
  }
}
</style>