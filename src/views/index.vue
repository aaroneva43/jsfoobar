<template>
  <div class="home-page">
    <web-header></web-header>
    <div class="choose">
      <el-form ref="form2" :model="query" label-width="60px">
        <el-form-item label="玻片：" :style="{ marginBottom: '0px' }">
          <template v-if="slideArray.length > 0">
            <el-checkbox-group
              v-model="form.slide_names"
              @change="getKaryotypeByPatient"
            >
              <template v-for="(item, index) in slideArray">
                <el-checkbox :label="item" :key="index"></el-checkbox>
              </template>
            </el-checkbox-group>
          </template>
        </el-form-item>
        <el-row type="flex" align="center">
          <el-col :style="{ width: '480px' }">
            <el-form-item label="进度：" :style="{ marginBottom: '0px' }">
              <el-checkbox-group
                v-model="form.progresses"
                @change="getKaryotypeByPatient"
              >
                <el-checkbox :label="0"
                  ><div
                    style="border-bottom: 5px solid #7f7f7f; line-height: 20px"
                    title="未分析"
                  >
                    未分析
                  </div></el-checkbox
                >
                <el-checkbox :label="1"
                  ><div
                    style="border-bottom: 5px solid #f4c60a; line-height: 20px"
                    title="自动分析"
                  >
                    自动分析
                  </div></el-checkbox
                >
                <el-checkbox :label="2"
                  ><div
                    style="border-bottom: 5px solid #3583e3; line-height: 20px"
                    title="计数确认"
                  >
                    计数确认
                  </div></el-checkbox
                >
                <el-checkbox :label="3"
                  ><div
                    style="border-bottom: 5px solid #50a449; line-height: 20px"
                    title="排列确认"
                  >
                    排列确认
                  </div></el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :style="{ width: '420px' }">
            <el-form-item label="颜色：" :style="{ marginBottom: '0px' }">
              <el-row type="flex" align="middle" class="color-array">
                <div
                  class="li"
                  :class="{ active: form.color === '' }"
                  :style="{
                    background:
                      'linear-gradient(to right, #d500f9 0%, #7c4dff 100%)',
                  }"
                  @click="handleSelectColor('')"
                  title="全部"
                ></div>
                <div
                  class="li"
                  :class="{ active: form.color === 0 }"
                  :style="{ backgroundColor: '#7f7f7f' }"
                  @click="handleSelectColor(0)"
                  title="灰色"
                ></div>
                <div
                  class="li"
                  :class="{ active: form.color === 1 }"
                  :style="{ backgroundColor: '#3583e3' }"
                  @click="handleSelectColor(1)"
                  title="蓝色"
                ></div>
                <div
                  class="li"
                  :class="{ active: form.color === 2 }"
                  :style="{ backgroundColor: '#b8741a' }"
                  @click="handleSelectColor(2)"
                  title="黄色"
                ></div>
                <div
                  class="li"
                  :class="{ active: form.color === 3 }"
                  :style="{ backgroundColor: '#a30014' }"
                  @click="handleSelectColor(3)"
                  title="红色"
                ></div>
              </el-row>
            </el-form-item>
          </el-col>
          <el-col :style="{ width: '390px' }">
            <el-form-item label="排序：" :style="{ marginBottom: '0px' }">
              <el-radio-group
                v-model="form.order_by"
                @change="getKaryotypeByPatient"
              >
                <el-radio :label="0">打分</el-radio>
                <el-radio :label="1">玻片</el-radio>
                <el-radio :label="2">进度</el-radio>
                <el-radio :label="3">克隆号</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="container">
      <div class="side">
        <div class="search-box">
          <el-date-picker
            v-model="query.start_time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="开始日期"
            :picker-options="pickerOptionsStart"
            :style="{ width: '100%' }"
          >
          </el-date-picker>
          <el-date-picker
            v-model="query.end_time"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="结束日期"
            :picker-options="pickerOptionsEnd"
            :style="{ width: '100%', marginTop: '15px' }"
          >
          </el-date-picker>
          <el-input
            v-model="query.patient_id"
            placeholder="请输入病历号"
            :style="{ marginTop: '15px' }"
            clearable
          ></el-input>
          <el-button
            type="primary"
            icon="el-icon-search"
            :style="{ width: '100%', marginTop: '15px' }"
            :loading="loading"
            @click="handleSearch"
            >搜索</el-button
          >
        </div>
        <template v-if="patientArray.length > 0">
          <div class="title">
            <div><i class="el-icon-s-unfold"></i> 病例列表</div>
            <el-dropdown>
              <span class="el-dropdown-link userinfo-inner">
                <i class="el-icon-plus" style="color: #fff"></i
              ></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="exportPatient"
                  >导入本地病例</el-dropdown-item
                >
                <el-dropdown-item @click.native="Webshellsp"
                  >启用显微镜</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="search-result">
            <ul
              class="infinite-list"
              v-infinite-scroll="load"
              infinite-scroll-delay="300"
              style="overflow: visible"
            >
              <li
                v-for="(item, index) in patientArray"
                class="infinite-list-item"
                :key="index"
              >
                <div
                  class="item"
                  :class="{ active: selected.id === item.id }"
                  :key="index"
                  @click="handleSelectItem(item, index)"
                >
                  <div class="label">
                    {{ item.id }}({{
                      item.count_confirmed +
                      "," +
                      item.arrange_confirmed +
                      "/" +
                      item.total_karyotype
                    }})
                    <!-- <i
                      v-show="item.reported == 1" style="color:#eee;margin-left:5px;"
                      class="el-icon-document"
                    ></i> -->
                  </div>
                  <div
                    class="status"
                    :class="{
                      not: item.reported === 0,
                      done: item.reported === 1,
                    }"
                  >
                    {{ ["未开始", "已出报告"][item.reported] }}
                    <i
                      v-if="item.reported === 1"
                      style="color: #eee; margin-left: 5px"
                      class="el-icon-document"
                    ></i>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </template>
        <div class="information">
          <div class="title">统计</div>
          <div class="list">
            <div class="item" data-title="玻片数量：">
              {{ statistic.slide_count }}
            </div>
            <div class="item" data-title="图片数量：">
              {{ statistic.cell_count }}
            </div>
            <div class="item" data-title="未分析：">
              {{ statistic.unanalysed_count }}
            </div>
            <div class="item" data-title="已分析：">
              {{ statistic.analysed_count }}
            </div>
            <div class="item" data-title="确认计数：">
              {{ statistic.count_confirmed_count }}
            </div>
            <div class="item" data-title="确认排列：">
              {{ statistic.expression_confirmed_count }}
            </div>
            <!-- <div class="item auto" data-title="已出报告："> <span v-for="(item,index) in statistic.report_ids" style="margin-right: 5px;cursor: pointer; color:#3583e3;" :key="index">报告{{ index+1 }}</span></div> -->
          </div>
          <div class="title">病例信息</div>
          <div class="list">
            <div class="item auto" data-title="病例编号：">
              {{ selected.id || "--" }}
            </div>
            <div class="item" data-title="姓名：">
              {{ selected.name || "--" }}
            </div>
            <div class="item" data-title="性别：">
              {{ selected.gender || "--" }}
            </div>
            <div class="item" data-title="年龄："></div>
            <div class="item" data-title="出生日期：">
              {{ selected.birthdate || "--" }}
            </div>
            <div class="item" data-title="样本类型：">
              {{ selected.sample_type || "--" }}
            </div>
            <div class="item" data-title="接收日期：">
              {{ selected.receive_time || "--" }}
            </div>
            <div class="item auto" data-title="临床诊断："></div>
          </div>
        </div>
      </div>
      <div class="image-list">
        <template v-if="vloading">
          <el-skeleton animated :style="{ marginTop: '10px' }" />
        </template>
        <template v-else>
          <template v-if="rows.length > 0">
            <template v-for="(item, index) in rows">
              <!-- <router-link
                :to="`/detail/${form.patient_id}/${item.id}`"
                @click="AutoAnalysisKaryotype(item.id)"
                class="item" :key="index"
              > -->
              <div
                @dblclick="AutoAnalysisKaryotype(form.patient_id, item.id)"
                class="item"
                :key="index"
              >
                <div class="img-box">
                  <el-image
                    :src="`${Host}/api/get_image/?image_path=${item.image_path}&token=${token}`"
                    width="100%"
                    lazy
                  />
                </div>
                <div
                  class="pos-bottom"
                  :style="{ backgroundColor: getColor(item.color) }"
                >
                  {{ item.slide_name }}/{{ item.code
                  }}{{
                    item.progress === 3 ? `/${item.karyotype_expression}` : ""
                  }}
                </div>
                <div class="pos-topright">
                  <i
                    class="el-icon-delete"
                    @click.stop="DeleteKaryotype(item)"
                    style="font-size: 18px"
                  ></i>
                </div>
                <div class="pos">
                  <div class="count">
                    {{ item.karyotype_expression }}
                    <div
                      class="line"
                      :style="{ backgroundColor: getProcess(item.progress) }"
                    ></div>
                  </div>
                </div>
                <div class="color-array">
                  <div
                    class="li"
                    :style="{ backgroundColor: '#7f7f7f' }"
                    @click.stop="handleSetColor(item, 0)"
                  ></div>
                  <div
                    class="li"
                    :style="{ backgroundColor: '#3583e3' }"
                    @click.stop="handleSetColor(item, 1)"
                  ></div>
                  <div
                    class="li"
                    :style="{ backgroundColor: '#b8741a' }"
                    @click.stop="handleSetColor(item, 2)"
                  ></div>
                  <div
                    class="li"
                    :style="{ backgroundColor: '#a30014' }"
                    @click.stop="handleSetColor(item, 3)"
                  ></div>
                </div>
                <div
                  class="top"
                  :class="{
                    'el-icon-top': item.is_top === 1,
                    'el-icon-bottom': item.is_top === 0,
                  }"
                  :title="item.is_top === 0 ? '置顶' : '取消置顶'"
                  :style="{ display: item.is_top === 1 ? 'flex' : 'none' }"
                  @click.prevent="handleSetTop(item)"
                ></div>
              </div>
            </template>
          </template>
          <template v-else>
            <el-empty description="暂无数据"></el-empty>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import WebHeader from "@/components/header";
import {
  GetPatientByPage,
  GetSlideNames,
  GetKaryotypeByPatient,
  GetKaryotypeStatistic,
  SetIstop,
  SetColor,
  LockPatient,
  AutoAnalysisKaryo,
  DeleteKaryotype,
  ReleasePatient,
} from "@/services/api";
import { PictureProcessMarker, PictureColorMarker } from "@/utils/dict";
export default {
  components: { WebHeader },
  data() {
    return {
      // 设置开始日期
      pickerOptionsStart: {
        disabledDate: (time) => {
          let endDateVal = this.query.end_time;
          if (endDateVal) {
            return time.getTime() > new Date(endDateVal).getTime();
          } else {
            return false;
          }
        },
        // 限制时间
        selectableRange: [
          new Date().getHours() +
            ":" +
            new Date().getMinutes() +
            ":" +
            new Date().getSeconds() +
            " - 23:59:59",
        ],
      },
      // 设置结束日期
      pickerOptionsEnd: {
        disabledDate: (time) => {
          let beginDateVal = this.query.start_time;
          if (beginDateVal) {
            return time.getTime() < new Date(beginDateVal).getTime() - 86400000;
          } else {
            return false;
          }
        },
        // 限制时间
        selectableRange: [
          new Date().getHours() +
            ":" +
            new Date().getMinutes() +
            ":" +
            new Date().getSeconds() +
            " - 23:59:59",
        ],
      },
      query: {
        start_time: "",
        end_time: "",
        new_end_time: "",
        patient_id: "",
        per_page: 10,
      },
      selected: {
        id: "",
      },
      loading: false,
      vloading: true,
      patientArray: [],
      slideArray: [], // 玻片
      form: {
        patient_id: "",
        slide_names: [],
        progresses: [0, 1, 2, 3],
        color: null,
        order_by: 0,
      },
      rows: [],
      statistic: {},
      token: sessionStorage.rst_token,
      count: 0,
      srearchDisable: false,
    };
  },
  mounted() {
    this.handleSearch();
  },
  methods: {
    exportPatient() {
      //导入本地病例
      this.$message({
        type: "success",
        message: "功能未开放，敬请期待!",
      });
    },
    Webshellsp() {
      //启用显微镜
      window.location.href = "KaryoCollection://";
    },
    DeleteKaryotype(item) {
      this.$confirm("此操作将永久删除该核型图, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        DeleteKaryotype(item.id)
          .then((res) => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              var Index = this.rows.findIndex((x) => x.id == item.id);
              this.rows.splice(Index, 1);
              this.getStatstic(this.selected.id);
              // this.getKaryotypeByPatient();
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
    AutoAnalysisKaryotype(patient_id, id) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const Analysisloading = this.$loading({
        lock: true,
        text: "拼命加载中。。。",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      LockPatient(patient_id)
        .then((res) => {
          if (res.code == 200 && res.data == true) {
            AutoAnalysisKaryo(id)
              .then(() => {
                this.loading = false;
                Analysisloading.close();
                if (res.code == 200) {
                  this.$router.push({
                    path: "/detail/" + patient_id + "/" + id,
                    params: { patient: patient_id, id: id },
                  });
                } else {
                  ReleasePatient(patient_id); //释放锁定
                }
              })
              .catch((err) => {
                this.loading = false;
                Analysisloading.close();
                ReleasePatient(patient_id); //释放锁定
                this.$message.error(err);
              });
          } else {
            this.$message.error("病例已被锁定！");
            this.loading = false;
            Analysisloading.close();
          }
        })
        .catch((err) => {
          this.loading = false;
          Analysisloading.close();
          this.$message.error(err);
        });
    },
    changeDate() {
      let query = this.query;
      if (query.start_time && query.end_time) {
        if (query.start_time > query.end_time) {
          this.srearchDisable = true;
        } else {
          this.srearchDisable = false;
        }
      } else {
        this.srearchDisable = false;
      }
    },
    load() {
      if (this.count == -1) {
        return;
      }
      let query = this.query;
      this.loading = true;
      this.count++;
      GetPatientByPage({
        start_time: query.start_time ? `${query.start_time}T00:00:00` : null,
        end_time: query.new_end_time ? `${query.new_end_time}` : null,
        patient_id: query.patient_id,
        per_page: query.per_page,
      })
        .then((res) => {
          var data = res.data;
          if (data.length < query.per_page) {
            this.count = -1;
          } else {
            var end_time = data[data.length - 1].create_time;
            this.query.new_end_time = end_time;
          }
          if (data.length > 0) {
            this.patientArray = this.patientArray.concat(data);
          }
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error(err);
        });
    },
    // 检索病例信息
    handleSearch() {
      this.query.page_number = 1;
      this.count = 1;
      let query = this.query;
      this.loading = true;
      GetPatientByPage({
        start_time: query.start_time ? `${query.start_time}T00:00:00` : null,
        end_time: query.end_time ? `${query.end_time}T23:59:59` : null,
        patient_id: query.patient_id,
        per_page: query.per_page,
      })
        .then((res) => {
          var data = res.data;
          if (data.length < query.per_page) {
            this.count = -1;
          } else {
            var end_time = data[data.length - 1].create_time;
            this.query.new_end_time = end_time;
          }
          if (data.length > 0) {
            this.patientArray = data;
            this.handleSelectItem(data[0]);
          } else {
            this.patientArray = [];
            this.rows = [];
            this.statistic = {};
            this.selected = {
              id: "",
            };
            sessionStorage.removeItem("dataSource");
          }
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error(err);
        });
    },

    // 选择病人
    handleSelectItem(row) {
      this.selected = row;
      this.form.patient_id = row.id;
      this.getSlideName(row.id);
      this.getStatstic(row.id);
    },

    // 获取病例核型图统计信息
    getStatstic(id) {
      GetKaryotypeStatistic(id).then(({ data }) => {
        this.statistic = data;
      });
    },

    // 获取病例玻片名称列表
    getSlideName(id) {
      GetSlideNames(id)
        .then(({ data }) => {
          this.slideArray = data;
          this.form.slide_names = data;
          this.getKaryotypeByPatient();
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 获取病例的核型图
    getKaryotypeByPatient() {
      const form = this.form;
      if (form.slide_names.length > 0 && form.progresses.length > 0) {
        this.vloading = true;
        if (form.color === "") {
          form.color = null;
        }
        GetKaryotypeByPatient(form)
          .then(({ data }) => {
            this.rows = data;
            this.vloading = false;
            sessionStorage.dataSource = JSON.stringify(data);
          })
          .catch((err) => {
            this.vloading = false;
            this.$message.error(err);
          });
      } else {
        this.rows = [];
      }
    },

    // 选择颜色
    handleSelectColor(color) {
      this.form.color = color;
      this.getKaryotypeByPatient();
    },

    getProcess(index) {
      return PictureProcessMarker(index);
    },

    getColor(index) {
      return PictureColorMarker(index);
    },

    // 置顶/取消置顶
    handleSetTop(row) {
      SetIstop({
        karyotype_id: row.id,
        is_top: row.is_top === 0 ? 1 : 0,
      })
        .then(() => {
          row.is_top = row.is_top === 0 ? 1 : 0;
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 设置核型图颜色标记
    handleSetColor(item, color) {
      SetColor({
        karyotype_id: item.id,
        color: color,
      })
        .then(() => {
          item.color = color;
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.home-page {
  height: 100vh;
  background-color: #001529;
  overflow: hidden;
  .choose {
    clear: both;
    overflow: hidden;
    border-bottom: solid 1px rgba(255, 255, 255, 0.2);
    padding: 5px 0 5px 5px;
    .color-array {
      height: 32px;
      .li {
        background-color: #fff;
        width: 50px;
        height: 18px;
        margin-right: 15px;
        cursor: pointer;
        &.active {
          position: relative;
          &::after {
            content: "";
            border: solid 2px #fff;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
          }
        }
      }
    }
    /deep/.el-form-item__label {
      line-height: 32px;
    }
    /deep/.el-form-item__content {
      line-height: 32px;
    }
    /deep/.el-checkbox-group {
      height: 32px;
    }
    /deep/.el-checkbox {
      margin-right: 20px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  .container {
    height: calc(100vh - 126px);
    overflow: hidden;
    display: flex;
    .side {
      width: 325px;
      border-right: solid 1px rgba(255, 255, 255, 0.2);
      overflow: hidden;
      .search-box {
        border-bottom: solid 1px rgba(255, 255, 255, 0.2);
        padding: 10px;
      }
      .title {
        padding: 0 13px;
        height: 32px;
        line-height: 32px;
        color: #fff;
        background-color: #073f74;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        // text-align: center;
        // border-radius: 3px;
      }
      .search-result {
        clear: both;
        overflow: hidden;
        padding: 10px;
        max-height: 200px;
        overflow: hidden;
        overflow-y: auto;
        border-bottom: solid 1px rgba(255, 255, 255, 0.2);
        .item {
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 30px;
          border: solid 1px #001529;
          cursor: pointer;
          border-radius: 3px;
          &.active {
            border-color: rgba(255, 255, 255, 0.35);
            background-color: #073f74;
          }
          .label {
            color: #fff;
            line-height: 1;
          }
          .status {
            color: #666;
            line-height: 1;
            display: flex;
            align-items: center;
            &::before {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              content: "";
              margin-right: 5px;
            }
            &.not {
              &::before {
                background-color: #666;
              }
            }
            &.started {
              color: #409eff;
              &::before {
                background-color: #409eff;
              }
            }
            &.done {
              color: #89ff40;
              &::before {
                background-color: #89ff40;
              }
            }
          }
        }
      }
      .information {
        padding: 10px;
        overflow: hidden;
        overflow-y: auto;
        color: #fff;
        height: calc(100vh - 462px);
        .title {
          height: 32px;
          line-height: 32px;
          color: #fff;
          background-color: #073f74;
          text-align: center;
          border-radius: 3px;
        }
        .list {
          display: flex;
          flex-wrap: wrap;
          padding: 10px 0;
          .item {
            line-height: 32px;
            color: #fff;
            width: 50%;
            display: flex;
            align-items: center;
            &.auto {
              width: 100%;
            }
            &::before {
              content: attr(data-title);
              width: 76px;
            }
          }
        }
      }
    }
    .image-list {
      padding: 0 0 10px 10px;
      overflow: hidden;
      overflow-y: auto;
      flex: 1;
      width: 1%;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: start;
      .item {
        width: calc(100% / 6 - 10px);
        min-width: 254px;
        margin-top: 10px;
        margin-right: 10px;
        overflow: hidden;
        position: relative;
        .img-box {
          height: 190px;
          background-color: #fff;
          overflow: hidden;
          border-radius: 10px 10px 0 0;
        }
        .pos-bottom {
          display: none;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          color: #fff;
          border-radius: 0 0 10px 10px;
        }
        .pos-topright {
          display: none;
          position: absolute;
          right: 14px;
          top: 8px;
          cursor: pointer;
        }
        .pos {
          position: absolute;
          left: 14px;
          top: 8px;
          display: flex;
          .count {
            font-size: 20px;
            font-weight: bold;
            display: flex;
            flex-direction: column;
            .line {
              width: 28px;
              height: 5px;
            }
          }
        }
        .top {
          position: absolute;
          right: 10px;
          bottom: 42px;
          width: 28px;
          height: 28px;
          background-color: #398fea;
          align-items: center;
          justify-content: center;
          line-height: 1;
          color: #fff;
          font-size: 20px;
          border-radius: 50%;
          display: none;
        }
        .color-array {
          position: absolute;
          left: 10px;
          bottom: 42px;
          display: none;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          align-content: center;
          width: 38px;
          height: 38px;
          .li {
            width: 13px;
            height: 13px;
            border-radius: 3px;
            &:nth-child(1) {
              margin: 0 3px 0 0;
            }
            &:nth-child(3) {
              margin: 3px 3px 0 0;
            }
            &:nth-child(4) {
              margin: 3px 0px 0 0;
            }
          }
        }
        &:hover {
          .top {
            display: flex;
          }
          .color-array {
            display: flex;
            & :hover {
              width: 20px;
              height: 20px;
            }
          }
          .pos-topright {
            display: flex;
          }
        }
      }
      /deep/.el-empty {
        width: 100%;
      }
    }
  }
}
</style>
