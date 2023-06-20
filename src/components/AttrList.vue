<!-- TODO: 这个页面后续将用 JSX 重构 -->
<template>
  <div class="attr-list">
    <el-form>
      <el-form-item
        class="model5"
        v-for="({ key, label }, index) in styleKeys"
        :key="index"
        :label="label"
      >
        <!-- <el-checkbox  v-if="key == 'underline'" v-model="curComponent.style[key]==1">是</el-checkbox> -->

        <el-radio-group
          v-if="key == 'underline'"
          v-model="curComponent.style[key]"
        >
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
        <el-radio-group
          v-else-if="key == 'fontWeight'"
          v-model="curComponent.style[key]"
        >
          <el-radio :label="600">是</el-radio>
          <el-radio :label="500">否</el-radio>
        </el-radio-group>
        <el-color-picker
          v-else-if="key == 'borderColor'"
          v-model="curComponent.style[key]"
        ></el-color-picker>

        <el-color-picker
          v-else-if="key == 'color'"
          v-model="curComponent.style[key]"
        ></el-color-picker>
        <el-color-picker
          v-else-if="key == 'backgroundColor'"
          v-model="curComponent.style[key]"
        ></el-color-picker>
        <el-select
          v-else-if="key == 'fontFamily'"
          v-model="curComponent.style[key]"
        >
            <el-option
              v-for="item in fontFamilyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
        </el-select>
        <el-select
          v-else-if="selectKey.includes(key)"
          v-model="curComponent.style[key]"
        >
          <template v-if="key == 'textAlign'">
            <el-option
              v-for="item in textAlignOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </template>
          <template v-else-if="key == 'borderStyle'">
            <el-option
              v-for="item in borderStyleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </template>

          <template v-else>
            <el-option
              v-for="item in verticalAlignOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </template>
        </el-select>
        <el-input-number
          v-else-if="key == 'left'"
          v-model="curComponent.style[key]"
          :precision="0"
          controls-position="right"
          size="small"
        />
        <el-input-number
          v-else-if="key == 'top'"
          v-model="curComponent.style[key]"
          :precision="0"
          controls-position="right"
          size="small"
        />
        <el-input-number
          v-else
          v-model="curComponent.style[key]"
          controls-position="right"
          type="number"
          :min="0"
          size="small"
        />
      </el-form-item>
      <el-form-item
        v-if="curComponent && !excludes.includes(curComponent.component)"
        label="内容"
      >
        <el-input v-model="curComponent.propValue" type="textarea" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { styleData } from "@/utils/style";

export default {
  data() {
    return {
      excludes: ["Picture", "Group"], // 这些组件不显示内容
      textAlignOptions: [
        {
          label: "左对齐",
          value: "left",
        },
        {
          label: "居中",
          value: "center",
        },
        {
          label: "右对齐",
          value: "right",
        },
      ],
      borderStyleOptions: [
        {
          label: "实线",
          value: "solid",
        },
        {
          label: "虚线",
          value: "dashed",
        },
      ],
      fontFamilyOptions: [
        {
          label: "宋体",
          value: "SimSun",
        },
        {
          label: "黑体",
          value: "dashed",
        },
        {
          label: "微软雅黑",
          value: "Microsoft YaHei",
        },
        {
          label: "仿宋",
          value: "FangSong",
        },
        {
          label: "楷体",
          value: "KaiTi",
        },
      ],

      verticalAlignOptions: [
        {
          label: "上对齐",
          value: "top",
        },
        {
          label: "居中对齐",
          value: "middle",
        },
        {
          label: "下对齐",
          value: "bottom",
        },
      ],
      selectKey: ["textAlign", "borderStyle", "verticalAlign"],
      styleData,
    };
  },
  computed: {
    styleKeys() {
      if (this.$store.state.curComponent) {
        debugger
        const curComponentStyleKeys = Object.keys(
          this.$store.state.curComponent.style
        );
        return this.styleData.filter((item) =>
          curComponentStyleKeys.includes(item.key)
        );
      }
      return [];
    },
    curComponent() {
      return this.$store.state.curComponent;
    },
  },
};
</script>

<style lang="scss" scoped>
.attr-list {
  overflow: auto;
  padding: 20px;
  padding-top: 0;
  height: 100%;
}

/deep/ .el-form-item__label {
  color: #606266 !important;
}
/deep/ .el-radio__label {
  color: #606266 !important;
}

/deep/ .el-form-item {
  margin-bottom: 13px;
}
/deep/.el-input-number__decrease {
  background: #fff !important;
  color: #000 !important;
}
/deep/.el-input-number__increase {
  background: #fff !important;
  color: #000 !important;
}
</style>
