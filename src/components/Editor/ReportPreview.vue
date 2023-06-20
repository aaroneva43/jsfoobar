<template>
  <div class="bg">
    <el-button class="close" @click="close">返回</el-button>

    <!-- <el-button class="print" @click="print">打印</el-button> -->
    <el-button class="print" ref="printClick" v-print="printObj"
      >打印</el-button
    >
    <div class="canvas-container" id="myValue">
      <div
        class="canvas"
        :style="{
          width: changeStyleWithScale(canvasStyleData.width) + 'pt',
          height: changeStyleWithScale(canvasStyleData.height) + 'pt',
        }"
      >
        <ComponentWrapper
          v-for="(item, index) in componentData"
          :key="index"
          :config="item"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getStyle } from "@/utils/style";
import { mapState } from "vuex";
import ComponentWrapper from "./ComponentWrapper";
import { changeStyleWithScale } from "@/utils/translate";
import {
  getReport,
  getTemplete,
  getOptimizeImage,
  getArrangeImage,
} from "@/services/api";
import generateID from "@/utils/generateID";
export default {
  components: { ComponentWrapper },
  model: {
    prop: "show",
    event: "change",
  },
  props: {
    reportId: {
      type: String,
      default: "",
    },
    hideSex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      printObj: {
        id: "myValue",
        popTitle: "",
        extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
        beforeOpenCallback(vue) {
          vue.printLoading = true;
          console.log("打开之前");
        },
        openCallback(vue) {
          vue.printLoading = false;
          console.log("执行了打印");
        },
        closeCallback() {
          console.log("关闭了打印工具");
        },
      },
      templeteId: null,
      templeteData: null,
      OptimizeImage: "",
      ArrangeImage: "",
      token: sessionStorage.rst_token,
    };
  },
  mounted() {
    this.getReport();
  },
  computed: mapState(["componentData", "canvasStyleData"]),
  methods: {
    changeStyleWithScale,
    getStyle,
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
    getReport() {
      getReport(this.reportId)
        .then((res) => {
          if (res.code == 200) {
            this.templeteData = res.data;
            this.templeteData.karyotype_expression=this.templeteData.karyotype_expression.replace(/\n/g, "<br>");
            this.templeteData.patient_age = this.templeteData.patient_age || "";

            this.templeteData.check_time =
              (this.templeteData.check_time &&
                this.templeteData.check_time.split("T")[0]) ||
              "";
            this.templeteData.collect_time =
              (this.templeteData.collect_time &&
                this.templeteData.collect_time.split("T")[0]) ||
              "";
            this.templeteData.receive_time =
              (this.templeteData.receive_time &&
                this.templeteData.receive_time.split("T")[0]) ||
              "";
            this.templeteData.report_time =
              (this.templeteData.report_time &&
                this.templeteData.report_time.split("T")[0]) ||
              "";
            this.templeteData.review_time =
              (this.templeteData.review_time &&
                this.templeteData.review_time.split("T")[0]) ||
              "";
            this.templeteId = res.data.templete_id;
            getOptimizeImage({
              karyotype_id: this.templeteData.karyotype_id,
              hide_sex: this.hideSex || 0,
            }).then((res) => {
              this.OptimizeImage = res.data;
              getArrangeImage({
                karyotype_id: this.templeteData.karyotype_id,
                hide_sex: this.hideSex || 0,
              }).then((res) => {
                this.ArrangeImage = res.data;
                this.restore();
              });
            });
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    restore() {
      if (this.templeteId) {
        getTemplete(this.templeteId)
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
              if (data.page_size == 1) {
                w = 595 / 2;
                h = 842 / 2;
              }
              if (data.page_orientation == 1) {
                data.width = w;
                data.height = h;
              } else {
                data.width = h;
                data.height = w;
              }
              this.setCanvasStyle(data);
              this.setComponentData(res.data.content);
            } else {
              let data = {
                width: 595,
                height: 842,
              };
              this.setCanvasStyle(data);
            }
          })
          .catch((err) => {
            let data = {
              width: 595,
              height: 842,
            };
            this.setCanvasStyle(data);
            this.$message.error(err);
          });
      } else {
        let data = {
          width: 595,
          height: 842,
        };
        this.setCanvasStyle(data);
      }
    },
    resetID(data) {
      data.forEach((item) => {
        var age_unit = 0;
        for (const key in this.templeteData) {
          if (Object.hasOwnProperty.call(this.templeteData, key)) {
            if (key == item.fileId) {
              item.value = this.templeteData[key];
            }
            if (key == "patient_age_unit") {
              age_unit = this.templeteData[key] || 0;
            }
          }
        }
        if (item.fileId == "patient_age") {
          item.value =
            item.value +
            (!item.value
              ? ""
              : age_unit == "1"
              ? "月"
              : age_unit == "2"
              ? "周"
              : age_unit == "3"
              ? "天"
              : "岁");
        }

        if (item.fileId == "check_method") {
          item.value = item.value + "显带";
        }

        if (item.fileId == "sample_type") {
          item.value =
            item.value == "G"
              ? "外周血"
              : item.value == "B"
              ? "羊水"
              : item.value == "D"
              ? "精子库"
              : item.value == "F"
              ? "免费"
              : item.value == "K"
              ? "超声异常羊水刺穿"
              : item.value == "U"
              ? "超声异常引产"
              : "复发流产";
        }
        // var patient_age = this.templeteData((y) => y.fileId == "patient_age");
        // patient_age.value+=

        if (item.fileId == "karyotype_image" && item.type == "image") {
          item.component = "Picture";
          item.propValue = this.OptimizeImage;
        } else if (item.fileId == "arrange_image" && item.type == "image") {
          item.component = "Picture";
          item.propValue = this.ArrangeImage;
        } else if (item.type == "image") {
          item.component = "Picture";
          item.propValue = `${this.Host}/api/get_image/?image_path=${item.value}&token=${this.token}`;
        }

        if (item.fileId == "patient_gender") {
          item.value = item.value == "1" ? "男" : "女";
        }
        item.id = generateID();
      });
      return data;
    },
    print() {
      const newstr = document.getElementById("myValue").innerHTML;
      const oldstr = document.body.innerHTML;
      document.body.innerHTML = newstr;
      window.print();
      document.body.innerHTML = oldstr;
      // return false  用注释的方法会导致打印页面关闭后，原页面无法正常运行
      // const newWin = window.open("");
      // newWin.document.body.innerHTML = newstr;
      // newWin.document.close();
      // newWin.focus();
      // setTimeout(() => {
      //   newWin.print();
      //   newWin.close();
      // }, 300);
    },
    close() {
      this.$emit("goback", false);
    },
  },
};
</script>
<style media="print">
@page {
  size: auto; /* auto is the initial value */
  margin: 3mm; /* this affects the margin in the printer settings */
}
</style>
<style lang="scss" scoped>
.bg {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: fixed;
  background: #00000050;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;

  .canvas-container {
    width: calc(100% - 40px);
    height: calc(100% - 120px);
    overflow: auto;

    .canvas {
      background: #fff;
      position: relative;
      margin: auto;
    }
  }

  .print {
    position: absolute;
    right: 110px;
    top: 20px;
  }
  .close {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}
</style>
