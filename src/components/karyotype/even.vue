<template>
  <div class="sigle-page-components">
    <div class="group-list">
      <div class="item">
        <div class="text">第一组染色体</div>
        <div class="list">
          <template v-for="(item, index) in group1">
            <div
              class="li"
              :class="{
                active: numArray[0] === item.value,
                disabled: item.disabled,
              }"
              :key="`a_${index}`"
              @click="handleChangeItem(item, 0)"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
      </div>
      <div class="item">
        <div class="text">第二组染色体</div>
        <div class="list">
          <template v-for="(item, index) in group2">
            <div
              class="li"
              :class="{
                active: numArray[1] === item.value,
                disabled: item.disabled,
              }"
              :key="`b_${index}`"
              @click="handleChangeItem(item, 1)"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="group-rows">
      <template v-if="rows.length > 0">
        <div class="left" id="leftContainer" @scroll="handleScroll">
          <template v-for="(item, index) in rows">
            <div
              class="item-box"
              :key="`c_${index}`"
              @dblclick="handleShowItem(item)"
            >
              <div class="img-box">
                <template v-for="(a, b) in item.chromosomes">
                  <template v-if="a.group_index === numArray[0]">
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image_path}&token=${token}`"
                      :data-sort="a.group_sort"
                      :data-id="a.id"
                      :key="`d_${b}`"
                      alt=""
                    />
                  </template>
                </template>
              </div>
              <div class="name">
                {{ item.slide_name }}/{{ item.karyotype_code }}
              </div>
            </div>
          </template>
        </div>
        <div class="right" id="rightContainer" @scroll="handleScroll">
          <template v-for="(item, index) in rows">
            <div
              class="item-box"
              :key="`e_${index}`"
              @dblclick="handleShowItem(item)"
            >
              <div class="img-box">
                <template v-for="(a, b) in item.chromosomes">
                  <template v-if="a.group_index === numArray[1]">
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image_path}&token=${token}`"
                      :data-sort="a.group_sort"
                      :data-id="a.id"
                      :key="`f_${b}`"
                      alt=""
                    />
                  </template>
                </template>
              </div>
              <div class="name">
                {{ item.slide_name }}/{{ item.karyotype_code }}
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import { ChromosomeCompare } from "@/services/api";
export default {
  props: {
    first: {
      type: Number,
      default: () => {
        return 100;
      },
    },
    second: {
      type: Number,
      default: () => {
        return 100;
      },
    },
  },
  data() {
    return {
      group1: [
        { label: "1", disabled: false, value: 1 },
        { label: "2", disabled: false, value: 2 },
        { label: "3", disabled: false, value: 3 },
        { label: "4", disabled: false, value: 4 },
        { label: "5", disabled: false, value: 5 },
        { label: "6", disabled: false, value: 6 },
        { label: "7", disabled: false, value: 7 },
        { label: "8", disabled: false, value: 8 },
        { label: "9", disabled: false, value: 9 },
        { label: "10", disabled: false, value: 10 },
        { label: "11", disabled: false, value: 11 },
        { label: "12", disabled: false, value: 12 },
        { label: "13", disabled: false, value: 13 },
        { label: "14", disabled: false, value: 14 },
        { label: "15", disabled: false, value: 15 },
        { label: "16", disabled: false, value: 16 },
        { label: "17", disabled: false, value: 17 },
        { label: "18", disabled: false, value: 18 },
        { label: "19", disabled: false, value: 19 },
        { label: "20", disabled: false, value: 20 },
        { label: "21", disabled: false, value: 21 },
        { label: "22", disabled: false, value: 22 },
        { label: "X", disabled: false, value: 23 },
        { label: "Y", disabled: false, value: 24 },
        { label: "MAR", disabled: false, value: -1 },
      ],
      group2: [
        { label: "1", disabled: false, value: 1 },
        { label: "2", disabled: false, value: 2 },
        { label: "3", disabled: false, value: 3 },
        { label: "4", disabled: false, value: 4 },
        { label: "5", disabled: false, value: 5 },
        { label: "6", disabled: false, value: 6 },
        { label: "7", disabled: false, value: 7 },
        { label: "8", disabled: false, value: 8 },
        { label: "9", disabled: false, value: 9 },
        { label: "10", disabled: false, value: 10 },
        { label: "11", disabled: false, value: 11 },
        { label: "12", disabled: false, value: 12 },
        { label: "13", disabled: false, value: 13 },
        { label: "14", disabled: false, value: 14 },
        { label: "15", disabled: false, value: 15 },
        { label: "16", disabled: false, value: 16 },
        { label: "17", disabled: false, value: 17 },
        { label: "18", disabled: false, value: 18 },
        { label: "19", disabled: false, value: 19 },
        { label: "20", disabled: false, value: 20 },
        { label: "21", disabled: false, value: 21 },
        { label: "22", disabled: false, value: 22 },
        { label: "X", disabled: false, value: 23 },
        { label: "Y", disabled: false, value: 24 },
        { label: "MAR", disabled: false, value: -1 },
      ],
      numArray: [],
      rows: [],
      token: sessionStorage.rst_token,
      patient_id: "",
    };
  },
  mounted() {
    this.patient_id = this.$route.params.patient;
    this.init();
  },
  methods: {
    init() {
      if (this.first !== 100 && this.second === 100) {
        this.numArray = [this.first];
      }
      if (this.first !== 100 && this.second !== 100) {
        this.numArray = [this.first, this.second];
        this.group1.map(
          (item) => (item.disabled = this.numArray[1] === item.value)
        );
        this.group2.map(
          (item) => (item.disabled = this.numArray[0] === item.value)
        );
      }
      this.getData();
    },

    getData() {
      const patient_id = this.$route.params.patient;
      ChromosomeCompare({
        patient_id: patient_id,
        group_indexes: this.numArray,
      }).then(({ data }) => {
        this.rows = data;
      });
    },

    handleChangeItem(item, index) {
      if (!item.disabled) {
        this.$set(this.numArray, index, item.value);
      }
      this.group1.map(
        (item) =>
          (item.disabled = this.numArray[1] === item.value ? true : false)
      );
      this.group2.map(
        (item) =>
          (item.disabled = this.numArray[0] === item.value ? true : false)
      );
      this.getData();
      this.$emit("change", {
        rows: this.numArray,
        type: 2,
      });
    },

    handleShowItem(item) {
      this.$router.push(`/detail/${this.patient_id}/${item.karyotype_id}`);
    },

    handleScroll(e) {
      document.getElementById("leftContainer").scrollTop = e.target.scrollTop;
      document.getElementById("rightContainer").scrollTop = e.target.scrollTop;
    },
  },
};
</script>
<style lang="scss" scoped>
.sigle-page-components {
  clear: both;
  overflow: hidden;
  .group-list {
    .item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .list {
        display: flex;
        .li {
          width: 28px;
          height: 28px;
          background-color: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          font-size: 12px;
          margin-left: 10px;
          cursor: pointer;
          &.active {
            background-color: #158afe;
            color: #fff;
          }
          &.disabled {
            opacity: 0.5;
            &:hover {
              cursor: no-drop;
            }
          }
        }
      }
    }
  }
  .group-rows {
    clear: both;
    overflow: hidden;
    display: flex;
    margin-top: 20px;
    height: calc(100vh - 236px);
    .left {
      flex: 1;
      width: 1%;
      height: calc(100vh - 236px);
      overflow: hidden;
      overflow-y: scroll;
      border: solid 1px #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 5px;
      padding-bottom: 10px;
      .item-box {
        border: solid 1px red;
        width: 200px;
        margin-top: 10px;
        .img-box {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            max-height: 160px;
          }
        }
        .name {
          text-align: center;
          line-height: 32px;
        }
      }
    }
    .right {
      flex: 1;
      width: 1%;
      height: calc(100vh - 236px);
      overflow: hidden;
      overflow-y: scroll;
      border: solid 1px #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-left: 5px;
      padding-bottom: 10px;
      .item-box {
        border: solid 1px red;
        width: 200px;
        margin-top: 10px;
        .img-box {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            max-height: 160px;
          }
        }
        .name {
          text-align: center;
          line-height: 32px;
        }
      }
    }
  }
}
</style>