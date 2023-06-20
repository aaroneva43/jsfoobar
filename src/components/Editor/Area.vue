<template>
  <div
    :style="{
      left: start.x + 'pt',
      top: start.y + 'pt',
      width: width + 'pt',
      height: height + 'pt',
    }"
    class="area"
  ></div>
</template>

<script>
export default {
  props: {
    start: {
      type: Object,
      default: () => {},
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style lang="scss" scoped>
.area {
  border: 1px solid #70c0ff;
  position: absolute;
}
</style>
