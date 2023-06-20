<template>
  <div class="sigle-page">
    <div class="group-list">
      <div class="item">
        <div class="text">染色体</div>
        <div class="list">
          <template v-for="(item, index) in group">
            <div
              class="li"
              :class="{
                active: numArray[0] === item.value,
                disabled: item.disabled,
              }"
              :key="`${index}_${item.value}`"
              @click="handleChangeItem(item)"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="group-rows">
      <template v-if="rows.length > 0">
        <template v-for="(item, index) in rows">
          <div class="item-box" :key="index" @dblclick="handleShowItem(item)">
            <div class="img-box">
              <template v-for="(a, b) in item.chromosomes">
                <template v-if="a.group_index === numArray[0]">
                  <img
                    :src="`${Host}/api/get_image/?image_path=${a.image_path}&token=${token}`"
                    :data-sort="a.group_sort"
                    :data-id="a.id"
                    :key="`i_${b}`"
                  />
                </template>
              </template>
            </div>
            <div class="name">
              {{ item.slide_name }}/{{ item.karyotype_code }}
            </div>
          </div>
        </template>
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
  },
  data() {
    return {
      group: [
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
      if (this.first !== 100) {
        this.numArray = [this.first];
      }
      this.getData();
    },

    getData() {
      ChromosomeCompare({
        patient_id: this.patient_id,
        group_indexes: this.numArray,
      }).then(({ data }) => {
        this.rows = data;
      });
    },

    handleChangeItem(item) {
      if (!item.disabled) {
        this.$set(this.numArray, 0, item.value);
      }
      this.getData();
      this.$emit("change", {
        rows: this.numArray,
        type: 1,
      });
    },

    handleShowItem(item) {
      this.$router.push(`/detail/${this.patient_id}/${item.karyotype_id}`);
    },
  },
};
</script>
<style lang="scss" scoped>
.sigle-page {
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
    margin-top: 10px;
    flex-wrap: wrap;
    height: calc(100vh - 192px);
    overflow-y: scroll;
    .item-box {
      border: solid 1px red;
      width: 200px;
      margin-top: 10px;
      margin-right: 10px;
      float: left;
      &:nth-child(5n) {
        margin-right: 0;
      }
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
</style>