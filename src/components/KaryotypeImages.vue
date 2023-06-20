<template>
  <div class="container_r">
    <div class="col-r">
      <div class="box">
        <template>
          <!-- <img
            :src="`${Host}/report/get_karyotype_optimize_image/?karyotype_id=${karyotypeId}&hide_sex=${hideSex}`"
            class="item"
            alt=""
          /> -->
          <img :src="OptimizeImage" class="item" alt="" />
        </template>
      </div>
      <div class="box">
        <template>
          <!-- <el-image
            :src="`${Host}/report/get_karyotype_arrange_image/?karyotype_id=${karyotypeId}&hide_sex=${hideSex}`"
            class="item"
            alt=""
          /> -->
          <img :src="ArrangeImage" class="item" alt="" />
        </template>
      </div>
    </div>
    <div class="image-list">
      <template v-if="dataArray.length > 0">
        <template v-for="(item, index) in dataArray">
          <div
            @click="selectImage(item)"
            class="item"
            :class="{ active: item.karyotype_id === karyoData.karyotype_id }"
            :key="index"
          >
            <div class="pos">
              <div class="count">
                {{ item.chromosome_count || 0 }}
              </div>
            </div>
            <img
              :src="`${Host}/api/get_image/?image_path=${item.karyotype_image_path}&token=${token}`"
              width="100px"
              alt=""
              lazy
            />
            <div style="width: 50px">
              <div>{{ item.cell_code }}/{{ item.cell_code }}</div>
              <div>
                {{ item.karyotype_expression }}
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import {
  getOptimizeImage,
  getArrangeImage,
  GetKaryotypeAnalysisInfos,
} from "@/services/api";
export default {
  props: {
    karyotypeId: String,
    hideSex: String,
    patientId: String,
    templeteId: String,
  },
  data() {
    return {
      dataArray: [],
      OptimizeImage: "",
      ArrangeImage: "",
      karyoData: { karyotype_id: "" },
      token: sessionStorage.rst_token,
    };
  },
  created() {
    this.initImage();
  },
  methods: {
    initImage() {
      GetKaryotypeAnalysisInfos({
        patient_id: this.patientId,
        templete_id: this.templeteId,
      })
        .then((res) => {
          if (res.code == 200) {
            this.dataArray = res.data || [];
            if (this.dataArray.length > 0) {
              this.dataArray.forEach((ele, index) => {
                if (ele.karyotype_id == this.karyotypeId)
                  this.karyoData = this.dataArray[index];
              });
              if (this.karyoData.karyotype_id == "") {
                this.karyoData = this.dataArray[0];
              }
              getOptimizeImage({
                karyotype_id: this.karyoData.karyotype_id,
                hide_sex: this.hideSex || 0,
              }).then((res) => {
                this.OptimizeImage = res.data;
              });
              getArrangeImage({
                karyotype_id: this.karyoData.karyotype_id,
                hide_sex: this.hideSex || 0,
              }).then((res) => {
                this.ArrangeImage = res.data;
              });
            }
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    selectImage(item) {
      getOptimizeImage({
        karyotype_id: item.karyotype_id,
        hide_sex: this.hideSex || 0,
      }).then((res) => {
        this.OptimizeImage = res.data;
      });
      getArrangeImage({
        karyotype_id: item.karyotype_id,
        hide_sex: this.hideSex || 0,
      }).then((res) => {
        this.ArrangeImage = res.data;
      });
      this.karyoData = item;
    },
    returnImage() {
      let data = {
        karyotype_id: this.karyoData.karyotype_id,
        cell_code: this.karyoData.cell_code,
        slide_code: this.karyoData.slide_code,
        karyotype_image: this.OptimizeImage,
        arrange_image: this.ArrangeImage,
        karyotype_expression: this.karyoData.karyotype_expression,
      };
      this.$emit("returnKaryoData", data);
    },
  },
};
</script>

<style lang="scss" scoped>
.container_r {
  height: calc(100vh - 290px);
  overflow: hidden;
  display: flex;
  .col-r {
    width: calc(80vw - 190px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .box {
      width: calc(50vw - 20px);
      margin: 10px 0 10px 10px;
      min-height: 20px;
      border-bottom: solid 1px rgba(255, 255, 255, 0.2);
      .item {
        background-color: #fff;
        width: 100%;
      }
      /deep/.canvas-container {
        width: 380px !important;
        height: 285px !important;
        background-color: #fff;
      }
      /deep/.canvas {
        width: 380px !important;
        height: 285px !important;
      }
    }
    .btn-panel {
      display: flex;
      flex-wrap: wrap;
      padding: 0 10px;
      justify-content: space-between;
      .btn {
        height: 40px;
        width: calc(100% / 3 - 6px);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        margin-top: 10px;
        border-radius: 3px;
        line-height: 1;
        cursor: pointer;
        &.style1 {
          background-color: #1890ff;
        }
        &.style2 {
          background-color: #00bfbf;
        }
        &.style3 {
          background-color: #ca2f2f;
        }
      }
    }
    .ptn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      color: #fff;
      background-color: #1890ff;
      margin: 10px 10px 0;
      border-radius: 3px;
      cursor: pointer;
    }
  }

  .image-list {
    width: 150px;
    overflow: hidden;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-track {
      -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
      border-radius: 3px;
    }
    /* 滚动条滑块 */
    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: rgba(0, 0, 0, 0.1);
      -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
    }
    .item {
      width: 150px;
      height: 100px;
      background-color: #fff;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      &.active {
        position: relative;
        &::after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border: solid 4px #1890ff;
        }
      }
      .pos {
        position: absolute;
        left: 10px;
        top: 6px;
        display: flex;
        z-index: 2;
        .count {
          font-size: 16px;
          font-weight: bold;
          display: flex;
          flex-direction: column;
          .line {
            width: 20px;
            height: 4px;
          }
        }
      }
    }
  }
}
</style>
