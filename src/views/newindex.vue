<template>
  <div class="home-page">
    <web-header></web-header>
    <div class="choose">
      <div class="side">
        <div class="search-box">
          <el-date-picker
            style="width: 293px"
            v-model="daterange"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
          <!-- <el-date-picker
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
          </el-date-picker> -->
          <!-- <el-checkbox-group v-model="checkList">
            <el-checkbox :label="0">未发报告</el-checkbox>
            <el-checkbox :label="1">已发报告</el-checkbox>
          </el-checkbox-group> -->
          <el-input
            v-model="query.patient_id"
            style="width: 293px"
            placeholder="请输入样本编号"
            :style="{ marginTop: '15px' }"
            @keyup.enter.native="handleSearch"
            clearable
          ></el-input>
          <el-button
            type="primary"
            icon="el-icon-search"
            :style="{ width: '293px', marginTop: '15px' }"
            :loading="loading"
            @click="handleSearch"
            >搜索</el-button
          >
        </div>
        <template v-if="patientArray.length > 0">
          <div class="title">
            <div><i class="el-icon-s-unfold"></i> 样本列表</div>
            <!-- <el-upload
              class="upload-demo"
              ref="upload"
              :action="uploadAction"
              :on-change="handleChange"
              :before-upload="handlePreview"
              :on-success="handleSuccess"
              :headers="header"
              multiple
              name="content"
              :data="uploadData"
              :file-list="fileList"
              :auto-upload="true"
            >
              <span class="el-dropdown-link userinfo-inner">
                <i
                  class="el-icon-plus"
                  title="导入本地样本"
                  @click="exportPatient"
                  style="color: #fff"
                ></i
              ></span>
            </el-upload> -->
            <i
              class="el-icon-plus"
              title="导入本地样本"
              @click="exportPatient"
              style="color: #fff"
            ></i>
            <uploader
              v-show="!1"
              :options="options"
              @file-success="onFileSuccess"
              @file-error="handleError"
            >
              <uploader-unsupport></uploader-unsupport>
              <uploader-drop>
                <uploader-btn
                  id="uploadDocument"
                  directory
                  :style="{ marginLeft: '10px' }"
                ></uploader-btn>
              </uploader-drop>
            </uploader>
            <!-- <el-dropdown>
              <span class="el-dropdown-link userinfo-inner">
                <i class="el-icon-plus" @click="exportPatient" style="color: #fff"></i
              ></span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="exportPatient"
                  >导入本地样本</el-dropdown-item
                >
                <el-dropdown-item @click.native="Webshellsp"
                  >启用显微镜</el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown> -->
          </div>
          <div class="search-result" id="search-result">
            <ul
              class="infinite-list"
              id="infinite-list"
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
                  <div class="statusContent">
                    <div
                      class="status"
                      :class="{
                        not: item.reported === 0,
                        done: item.reported === 1,
                      }"
                    >
                      {{ ["未出报告", "已出报告"][item.reported] }}
                      <!-- <i
                      v-if="item.reported === 1"
                      style="color: #eee; margin-left: 5px"
                      class="el-icon-document"
                    ></i> -->
                    </div>
                    <el-dropdown>
                      <i
                        title="更多"
                        style="color: #eee; margin-left: 5px"
                        class="el-icon-more"
                      ></i>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="ExportSample(item.id)">
                          导出样本
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="!user.role"
                          @click.native="DelPatient(item.id)"
                        >
                          删除样本
                        </el-dropdown-item>
                        <!-- <el-dropdown-item @click.native="Webshellsp">调用显微镜</el-dropdown-item> -->
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </template>
      </div>
      <div class="container">
        <div class="information">
          <div class="title">
            样本信息
            <div><i class="el-icon-warning"></i></div>
          </div>
          <div class="list_l">
            <div class="item" data-title="样本编号：">
              {{ selected.id || "--" }}
              <div
                @click="editPatient(selected.id)"
                style="
                  font-size: 15px;
                  color: #3583e3;
                  margin-left: 10px;
                  cursor: pointer;
                "
              >
                编辑
              </div>
            </div>
            <div class="item" data-title="姓名：">
              {{ selected.name || "--" }}
            </div>
            <div class="item" data-title="性别：">
              {{
                selected.gender == 1 ? "男" : selected.gender == 2 ? "女" : "--"
              }}
            </div>
            <div class="item" data-title="年龄：">
              {{ selected.age || "--" }}
              {{
                !selected.age
                  ? " "
                  : selected.age_unit == 0
                  ? "岁"
                  : selected.age_unit == 1
                  ? "月"
                  : selected.age_unit == 2
                  ? "周"
                  : selected.age_unit == 3
                  ? "天"
                  : " "
              }}
            </div>
            <div class="item" data-title="接收医生：">
              {{ selected.receive_doctor || "--" }}
            </div>
            <div class="item" data-title="接收日期：">
              {{
                (selected.receive_time &&
                  selected.receive_time.split("T")[0]) ||
                "--"
              }}
            </div>
            <div class="item" data-title="样本类型：">
              {{ GetSampleType(selected.sample_type) }}
            </div>
            <div class="item auto" data-title="临床诊断：">
              {{ selected.clinical_diagnosis || "--" }}
            </div>
          </div>
          <div class="title">
            统计
            <div><i class="el-icon-menu"></i></div>
          </div>
          <div class="list1">
            <div style="display: flex; flex-direction: row; line-height: 27px">
              玻片数：
              <div class="item" data-title="玻片数：">
                {{ statistic.slide_count }}
              </div>
            </div>
            <div style="display: flex; flex-direction: row; line-height: 27px">
              图片数：
              <div class="item" data-title="图片数：">
                {{ statistic.cell_count }}
              </div>
            </div>
          </div>
          <div class="list">
            <div class="item" data-title="计    数：">
              <div class="blue">{{ statistic.analysed_count }}</div>
              <div class="content">
                <span
                  v-for="(item, index) in statistic.analysed_count_detail"
                  :key="index"
                >
                  <template>
                    <span v-if="index % 2 == 0">{{ item + ":" }}</span>
                    <span
                      v-else-if="
                        index == statistic.analysed_count_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}</span
                    >
                    <!-- <span
                      v-else-if="
                        index != statistic.analysed_count_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}&nbsp;</span
                    > -->
                    <span v-else style="color: #f4c60a">{{ item }}&nbsp;</span>
                  </template>
                </span>
              </div>
            </div>

            <div class="item" data-title="排    列：">
              <div class="blue">{{ statistic.analysed_count }}</div>
              <div class="content">
                <span
                  v-for="(item, index) in statistic.analysed_expression_detail"
                  :key="index"
                >
                  <template>
                    <span v-if="index % 2 == 0">{{ item + ":" }}</span>
                    <span
                      v-else-if="
                        index == statistic.analysed_expression_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}</span
                    >
                    <!-- <span
                      v-else-if="
                        index != statistic.analysed_expression_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}&nbsp;</span
                    > -->
                    <span v-else style="color: #f4c60a">{{ item }}&nbsp;</span>
                  </template>
                </span>
              </div>
            </div>
            <div class="item" data-title="确认计数：">
              <div class="blue">{{ statistic.count_confirmed_count }}</div>
              <div class="content">
                <span
                  v-for="(item, index) in statistic.count_confirmed_detail"
                  :key="index"
                >
                  <template>
                    <span v-if="index % 2 == 0">{{ item + ":" }}</span>
                    <span
                      v-else-if="
                        index == statistic.count_confirmed_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}</span
                    >
                    <!-- <span
                      v-else-if="
                        index !=
                        statistic.count_confirmed_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}&nbsp;</span
                    > -->
                    <span v-else style="color: #f4c60a">{{ item }}&nbsp;</span>
                  </template>
                </span>
              </div>
            </div>
            <div class="item" data-title="确认排列：">
              <div class="blue">{{ statistic.expression_confirmed_count }}</div>
              <div class="content">
                <span
                  v-for="(item, index) in statistic.expression_confirmed_detail"
                  :key="index"
                >
                  <template>
                    <span v-if="index % 2 == 0">{{ item + ":" }}</span>
                    <span
                      v-else-if="
                        index ==
                        statistic.expression_confirmed_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}</span
                    >
                    <!-- <span
                      v-else-if="
                        index !=
                        statistic.expression_confirmed_detail.length - 1
                      "
                      style="color: #f4c60a"
                      >{{ item }}&nbsp;</span
                    > -->
                    <span v-else style="color: #f4c60a">{{ item }}&nbsp;</span>
                  </template>
                </span>
              </div>
            </div>
            <!-- <div class="item" data-title="未分析：">
              {{ statistic.unanalysed_count }}
            </div> -->
            <!-- <div class="item auto" data-title="已出报告："> <span v-for="(item,index) in statistic.report_ids" style="margin-right: 5px;cursor: pointer; color:#3583e3;" :key="index">报告{{ index+1 }}</span></div> -->
          </div>
          <!-- <div class="list3">
            <div
              class="menuPlus"
              :class="{ active: dstatus }"
              @click="dstatus = !dstatus"
            >
              删除
            </div>
            <div class="menuList" :class="{ active: dstatus }">
              <el-tooltip
                class="item"
                effect="dark"
                content="未计数"
                placement="top"
              >
                <div class="li" @click="DelUnconfirmed(1)">未计数</div>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="未分析"
                placement="top"
              >
                <div class="li" @click="DelUnconfirmed(2)">未分析</div>
              </el-tooltip>
            </div>
          </div> -->
          <div style="margin-top: 5px">
            <el-button
              type="danger"
              style="margin-right: 5px"
              size="small"
              @click="DelUnconfirmed(1)"
              >删除未确认</el-button
            >
            <el-button type="danger" size="small" @click="DelAllconfirmed()"
              >批量删除</el-button
            >
          </div>
          <div class="list2">
            <div
              class="menuPlus"
              :class="{ active: status }"
              @click="status = !status"
            >
              分析
            </div>
            <div class="menuList" :class="{ active: status }">
              <el-tooltip
                class="item"
                effect="dark"
                content="10个"
                placement="top"
              >
                <div class="li" @click="AppendAnalysis(10)">10</div>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="30个"
                placement="top"
              >
                <div class="li" @click="AppendAnalysis(30)">30</div>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="全部"
                placement="top"
              >
                <div class="li" @click="AppendAnalysis('all')">全部</div>
              </el-tooltip>
            </div>
          </div>
        </div>
        <el-form
          ref="form2"
          :model="query"
          style="
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          "
          label-width="55px"
        >
          <el-row type="flex" align="center">
            <!-- <el-col
            :span="2"
              :style="{
                color: '#fff',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              }"
            >
              <div style="line-height: 30px; padding-left: 5px">
                <i class="el-icon-full-screen"></i> 涮选
              </div>
            </el-col> -->
            <el-col
              :span="10"
              style="border-right: 1px solid rgba(255, 255, 255, 0.2)"
            >
              <el-form-item
                label="玻片："
                :style="{ marginBottom: '0px', paddingLeft: '5px' }"
              >
                <template v-if="slideArray.length > 0">
                  <el-checkbox
                    v-model="checkAll1"
                    @change="handleCheckAllChange1"
                    >全选</el-checkbox
                  >
                  <el-checkbox-group
                    :class="'cccheckbox'"
                    v-model="form.slide_names"
                    @change="getKaryotypeByPatient"
                  >
                    <template v-for="(item, index) in slideArray">
                      <el-checkbox :label="item" :key="index"></el-checkbox
                      ><i
                        :key="index"
                        @click="DeleteSlide(item, index)"
                        class="el-icon-delete"
                        style="
                          cursor: pointer;
                          margin-left: -8px;
                          margin-right: 5px;
                          color: #fff;
                        "
                      ></i>
                    </template>
                  </el-checkbox-group>
                </template>
              </el-form-item>
            </el-col>
            <el-col
              :span="10"
              :style="{
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              }"
            >
              <el-form-item
                label="进度："
                class="checkboxItem"
                :style="{ marginBottom: '0px', paddingLeft: '5px' }"
                ><el-checkbox
                  v-model="checkAll2"
                  @change="handleCheckAllChange2"
                  >全选</el-checkbox
                >
                <el-checkbox-group
                  v-model="form.progresses"
                  @change="getKaryotypeByPatient"
                >
                  <el-checkbox :label="0"
                    ><div
                      style="
                        border-bottom: 3px solid #7f7f7f;
                        line-height: 20px;
                      "
                      title="未分析"
                    >
                      未分析
                    </div></el-checkbox
                  >
                  <el-checkbox :label="1"
                    ><div
                      style="
                        border-bottom: 3px solid #f4c60a;
                        line-height: 20px;
                      "
                      title="自动分析"
                    >
                      自动分析
                    </div></el-checkbox
                  >
                  <el-checkbox :label="2"
                    ><div
                      style="
                        border-bottom: 3px solid #3583e3;
                        line-height: 20px;
                      "
                      title="计数确认"
                    >
                      计数确认
                    </div></el-checkbox
                  >
                  <el-checkbox :label="3"
                    ><div
                      style="
                        border-bottom: 3px solid #50a449;
                        line-height: 20px;
                      "
                      title="排列确认"
                    >
                      排列确认
                    </div></el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>
            </el-col>
            <el-col
              :span="5"
              :style="{
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              }"
            >
              <el-form-item
                label="颜色："
                :style="{ marginBottom: '0px', paddingLeft: '5px' }"
              >
                <el-row type="flex" align="middle" class="color-array">
                  <!-- <div
                    class="li"
                    :class="{ active: form.color === '' }"
                    :style="{
                      background:
                        'linear-gradient(to right, #d500f9 0%, #7c4dff 100%)',
                    }"
                    @click="handleSelectColor('')"
                    title="全部"
                  ></div> -->
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
                  <el-switch
                    v-model="colorSeletAll"
                    @click="handleSelectColor('')"
                    inactive-text="全选"
                  >
                  </el-switch>
                </el-row>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <div style="display: flex; align-items: center">
                <el-form-item
                  label="排序："
                  :style="{ marginBottom: '0px', paddingLeft: '5px' }"
                >
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
                <i
                  v-if="isShowList"
                  @click="(isShowList = false), (selection = [])"
                  style="padding: 0 10px 0 0; color: #fff; cursor: pointer"
                  title="显示列表"
                  class="el-icon-menu"
                ></i>
                <i
                  v-else
                  @click="(isShowList = true), (selection = [])"
                  style="padding: 0 10px 0 0; color: #fff; cursor: pointer"
                  title="显示图表"
                  class="el-icon-s-operation"
                ></i>
              </div>
            </el-col>
          </el-row>
        </el-form>

        <div v-if="isShowList" class="row-list">
          <el-table
            :highlight-current-row="false"
            :data="rows"
            style="width: 100%"
            @row-dblclick="rowAutoAnalysisKaryotype"
            :row-style="getBgColor"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column prop="slide_name" label="玻片" align="center">
              <template slot-scope="scope">
                <div
                  style="border-left: 5px solid #7f7f7f; padding: 25px 0"
                  :style="{
                    borderColor:
                      scope.row.color == 0
                        ? '#7f7f7f'
                        : scope.row.color == 1
                        ? '#3583e3'
                        : scope.row.color == 2
                        ? '#b8741a'
                        : '#a30014',
                  }"
                >
                  {{ scope.row.slide_name }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="细胞" align="center">
            </el-table-column>
            <el-table-column
              prop="image_path"
              label="中期分裂图"
              align="center"
            >
              <template slot-scope="scope">
                <div style="display: flex; justify-content: center">
                  <img
                    :src="`${Host}/api/get_image/?image_path=${scope.row.image_path}&token=${token}`"
                    width="80"
                    height="80"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="chromosome_count"
              label="计数数量"
              align="center"
            >
            </el-table-column>

            <el-table-column prop="image_path" label="计数确认" align="center">
              <template slot-scope="scope">
                <i
                  v-if="scope.row.progress > 2 || scope.row.progress == 2"
                  class="el-icon-check"
                ></i>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="image_path" label="排列确认" align="center">
              <template slot-scope="scope">
                <i v-if="scope.row.progress == 3" class="el-icon-check"></i>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="karyotype_expression"
              label="核型表达式"
              align="center"
            >
            </el-table-column>
            <el-table-column prop="name" label="位置信息" align="center">
            </el-table-column>
          </el-table>
        </div>
        <div v-if="!isShowList" class="image-list">
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
                  @dblclick="AutoAnalysisKaryotype(form.patient_id, item)"
                  class="item"
                  :key="index"
                >
                  <div
                    class="img-box"
                    :class="item.recheck == true ? 'recheck' : ''"
                  >
                    <el-image
                      :src="`${Host}/api/get_image/?image_path=${item.image_path}&token=${token}`"
                      width="100%"
                      lazy
                    />
                  </div>
                  <div
                    class="pos-bottom"
                    :class="item.recheck == true ? 'recheck-bottom' : ''"
                    :style="{ backgroundColor: getColor(item.color) }"
                  >
                    {{ item.slide_name }}/{{ item.name
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

                  <div class="pos-bottomright">
                    <el-checkbox v-model="checked[index]"></el-checkbox>
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
                  <div class="coloritem-array">
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
    <el-dialog
      :visible.sync="dialogVisible"
      top="5vh"
      width="750px"
      title="编辑样本"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="patientData"
        class="patientData"
        :rules="rules"
        v-if="patientData"
        :model="patientData"
        labelWidth="100px"
      >
        <el-row type="flex" align="center">
          <el-form-item prop="name" label="姓名:" style="width: 320px">
            <el-input v-model="patientData.name"></el-input>
          </el-form-item>
          <el-form-item
            prop="patient_no"
            label="病历编号:"
            style="width: 320px"
          >
            <el-input v-model="patientData.patient_no"></el-input>
          </el-form-item>
        </el-row>
        <el-row type="flex" align="center">
          <el-form-item prop="gender" label="性别:" style="width: 320px">
            <el-radio-group v-model="patientData.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="birthdate" label="年龄:">
            <el-input
              style="width: 120px; margin-right: 10px"
              v-model="patientData.age"
            ></el-input>
            <el-select
              v-model.number="patientData.age_unit"
              style="width: 90px"
            >
              <el-option label="岁" :value="0" />
              <el-option label="月" :value="1" />
              <el-option label="周" :value="2" />
              <el-option label="天" :value="3" />
            </el-select>
          </el-form-item>
        </el-row>
        <el-form-item prop="check_reason" label="检查原因:">
          <el-input v-model="patientData.check_reason"></el-input>
        </el-form-item>
        <el-row type="flex" align="center">
          <el-form-item
            prop="sample_type"
            label="样本类型:"
            style="width: 320px"
          >
            <el-select v-model="patientData.sample_type" style="width: 220px">
              <el-option label="外周血" value="G" />
              <el-option label="羊水" value="B" />
              <el-option label="精子库" value="D" />
              <el-option label="免费" value="F" />
              <el-option label="超声异常羊水刺穿" value="K" />
              <el-option label="超声异常引产" value="U" />
              <el-option label="复发流产" value="X" />
            </el-select>
          </el-form-item>
          <el-form-item prop="collect_time" label="采集时间:">
            <el-date-picker
              v-model="patientData.collect_time"
              value-format="yyyy-MM-dd"
              type="date"
              placeholder="选择接收时间"
            >
            </el-date-picker
          ></el-form-item>
        </el-row>
        <el-row type="flex" align="center">
          <el-form-item
            prop="send_doctor"
            label="送检医生:"
            style="width: 320px"
          >
            <el-input v-model="patientData.send_doctor"></el-input>
          </el-form-item>
          <el-form-item
            prop="check_method"
            label="检查方法:"
            style="width: 320px"
          >
            <el-select v-model="patientData.check_method" style="width: 220px">
              <el-option label="G显带" value="G" />
              <el-option label="Q显带" value="Q" />
              <el-option label="C显带" value="C" />
              <el-option label="R显带" value="R" />
              <el-option label="T显带" value="T" />
            </el-select>
          </el-form-item>
        </el-row>
        <el-row type="flex" align="center">
          <el-form-item
            prop="receive_doctor"
            label="接收医生:"
            style="width: 320px"
          >
            <el-input v-model="patientData.receive_doctor"></el-input>
          </el-form-item>
          <el-form-item prop="receive_time" label="接收时间:">
            <el-date-picker
              v-model="patientData.receive_time"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择接收时间"
            >
            </el-date-picker
          ></el-form-item>
        </el-row>
        <el-form-item prop="medical_history" label="病史:">
          <el-input v-model="patientData.medical_history"></el-input>
        </el-form-item>
        <el-form-item prop="clinical_desc" label="临床描述:">
          <el-input v-model="patientData.clinical_desc"></el-input>
        </el-form-item>
        <el-form-item prop="clinical_diagnosis" label="临床诊断:">
          <el-input v-model="patientData.clinical_diagnosis"></el-input>
        </el-form-item>

        <el-form-item prop="prenatal_no" label="产前编号:" style="width: 320px">
          <el-input v-model="patientData.prenatal_no"></el-input>
        </el-form-item>
        <el-form-item prop="prenatal_features" label="产前诊断指征:">
          <el-input v-model="patientData.prenatal_features"></el-input>
        </el-form-item>

        <el-form-item prop="comment" label="备注:">
          <el-input v-model="patientData.comment"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="savePatient"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="uploaddialogVisible"
      top="10vh"
      width="550px"
      title="导入样本"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="uploadData" labelWidth="100px">
        <el-row type="flex" align="center">
          <el-upload
            class="upload-demo"
            :action="uploadAction"
            :on-change="handleChange"
            :before-upload="handlePreview"
            :on-success="handleSuccess"
            :headers="header"
            multiple
            :limit="5"
            name="content"
            :data="uploadData"
            :file-list="fileList"
            :auto-upload="false"
          >
            <el-button slot="trigger" size="small" type="primary"
              >选择样本文件夹</el-button
            >
            <el-button style="margin-left: 10px" size="small" type="success"
              >上传到服务器</el-button
            >
            <div slot="tip" class="el-upload__tip"></div>
          </el-upload>
        </el-row>
      </el-form>
    </el-dialog>
    <!-- <div class="container">
      
    </div> -->
  </div>
</template>
<script>
import { Loading } from "element-ui";
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
  GetPatientInformation,
  ModifyPatient,
  GetAnalysisProgress,
  UploadSampleControl,
  AppendAnalysis,
  DelPatient,
  DeleteUnconfirmedAnalysed,
  DeleteUnconfirmedCounted,
  EnterAnalysisPage,
  ExportSample,
  IsReported,
  get_cur_user,
  DeleteBatchKaryotype,
  DeleteSlide,
} from "@/services/api";
import { PictureProcessMarker, PictureColorMarker } from "@/utils/dict";
export default {
  components: { WebHeader },
  data() {
    return {
      checked: [],
      checkAll1: true,
      checkAll2: true,
      isIndeterminate2: false,
      isIndeterminate1: false,
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
      daterange: [],
      query: {
        start_time: "",
        end_time: "",
        new_end_time: "",
        patient_id: "",
        per_page: 20,
      },
      checkList: [0, 1],
      selected: {
        id: "",
      },
      loading: false,
      vloading: true,
      AllpatientArray: [],
      patientArray: [],
      slideArray: [], // 玻片
      form: {
        patient_id: "",
        slide_names: [],
        progresses: [0, 1, 2, 3],
        color: null,
        order_by: 0,
      },
      rules: {
        // name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
        // clinical_diagnosis: [
        //   { required: true, message: "请输入诊断", trigger: "blur" },
        // ],
      },
      patientData: null,
      dialogVisible: false,
      colorSeletAll: true,
      rows: [],
      statistic: {},
      token: sessionStorage.rst_token,
      count: 0,
      srearchDisable: false,
      uploadData: { upload_id: null, relative_path: "", flag: "" },
      fileList: [],
      isUploadEnd: false,
      AnalysisTimer: null,
      fullscreenLoading: null,
      uploaddialogVisible: false,
      status: false,
      dstatus: false,
      isShowList: false,
      selection: [],
      user: null,
      options: {
        target: `${this.Host}/api/upload_sample/`,
        testChunks: false,
        headers: {
          Authorization: "Bearer " + sessionStorage.rst_token,
        },
        chunkSize: "204800000",
        query: function (file, res, status) {
          return {
            upload_id: sessionStorage.upload_id,
            content: file.file,
            relative_path: file.relativePath,
          };
        },
      },
      errTotal: 0,
      successTotal: 0,
    };
  },
  mounted() {
    sessionStorage.upload_id = this.guid();
    this.handleSearch();
    this.getCurUser();
  },
  activated() {
    if (this.form.patient_id) {
      GetPatientInformation(this.form.patient_id).then((res) => {
        this.selected = res.data;
      });
      this.getSlideName(this.form.patient_id, true);
      this.getStatsticnew(this.form.patient_id);
      IsReported(this.form.patient_id).then((res) => {
        if (res.code == 200) {
          var patient = this.patientArray.find(
            (x) => x.id == this.form.patient_id
          );
          patient.reported = res.data;
        }
      });
    }
  },
  deactivated() {
    // if (sessionStorage.scrollTop) {
    //   sessionStorage.scrollTop = 0;
    // }
    if (this.AnalysisTimer) {
      clearInterval(this.AnalysisTimer);
    }
  },
  watch: {
    colorSeletAll(newVal) {
      if (newVal == true) {
        this.handleSelectColor("");
      }
    },

    // checkList(newVal) {
    //   this.patientArray = this.AllpatientArray.filter(
    //     (x) => newVal.indexOf(x.reported) > -1
    //   );
    // },
  },
  computed: {
    uploadAction() {
      return `${this.Host}/api/upload_sample/`;
    },
    header() {
      return { Authorization: "Bearer " + this.token };
    },
  },
  methods: {
    handleCheckAllChange1(val) {
      this.form.slide_names = val ? this.slideArray : [];
      this.isIndeterminate1 = false;
      this.getKaryotypeByPatient();
    },
    handleCheckAllChange2(val) {
      this.form.progresses = val ? [0, 1, 2, 3] : [];
      this.isIndeterminate2 = false;
      this.getKaryotypeByPatient();
    },
    getCurUser() {
      get_cur_user()
        .then((res) => {
          if (res.code == 200) {
            this.user = res.data;
          } else {
            this.user = {};
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    DeleteSlide(Slide, index) {
      this.$confirm("确定要删除玻片吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        var model = {
          patient_id: this.selected.id,
          slide_name: Slide,
        };
        DeleteSlide(model)
          .then((res) => {
            if (res.code == 200) {
              this.slideArray.splice(index, 1);
              this.getKaryotypeByPatient();
              this.getStatstic(this.selected.id);
              this.$message({
                type: "success",
                message: "删除玻片成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: (res && res.msg) || "删除玻片失败！",
              });
            }
          })
          .catch((err) => {
            this.$message({
              type: "error",
              message: "删除玻片失败！" + err,
            });
            console.error(err);
          });
      });
    },
    handleSelectionChange(val) {
      this.selection = val;
    },
    DelAllconfirmed() {
      if (!this.isShowList && this.checked.findIndex((x) => x == true) == -1) {
        this.$message({
          type: "error",
          message: "请选择要删除的核型图！",
        });
        return;
      } else if (this.isShowList && this.selection.length == 0) {
        this.$message({
          type: "error",
          message: "请选择要删除的核型图！",
        });
        return;
      }
      this.$confirm("确定要批量删除核型图吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        var karyotype_ids = [];
        var model = {
          patient_id: this.selected.id,
          karyotype_ids: [],
        };
        if (!this.isShowList) {
          this.checked.forEach((ele, index) => {
            if (ele) {
              karyotype_ids.push(this.rows[index].id);
            }
          });
          model = {
            patient_id: this.selected.id,
            karyotype_ids: karyotype_ids,
          };
        } else {
          this.selection.forEach((ele) => {
            karyotype_ids.push(ele.id);
          });
          model = {
            patient_id: this.selected.id,
            karyotype_ids: karyotype_ids,
          };
        }
        DeleteBatchKaryotype(model)
          .then((res) => {
            if (res.code == 200) {
              this.getKaryotypeByPatient();
              this.getStatstic(this.selected.id);
              this.$message({
                type: "success",
                message: "批量删除核型图成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: (res && res.msg) || "批量删除核型图失败！",
              });
            }
          })
          .catch((err) => {
            this.$message({
              type: "error",
              message: "批量删除核型图失败！" + err,
            });
            console.error(err);
          });
      });
    },
    DelUnconfirmed(type) {
      this.$confirm(
        "确定要批量删除" +
          (type == 1 ? "未确认的" : "未确认分析的") +
          "核型图吗？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        if (type == 1) {
          DeleteUnconfirmedCounted(this.selected.id)
            .then((res) => {
              if (res.code == 200) {
                this.getKaryotypeByPatient();
                this.getStatstic(this.selected.id);
                this.$message({
                  type: "success",
                  message: "批量删除核型图成功!",
                });
              } else {
                this.$message({
                  type: "error",
                  message: (res && res.msg) || "批量删除核型图失败！",
                });
              }
            })
            .catch((err) => {
              this.$message({
                type: "error",
                message: "批量删除核型图失败！" + err,
              });
              console.error(err);
            });
        } else {
          DeleteUnconfirmedAnalysed(this.selected.id)
            .then((res) => {
              if (res.code == 200) {
                this.getKaryotypeByPatient();
                this.getStatstic(this.selected.id);
                this.$message({
                  type: "success",
                  message: "批量删除核型图成功!",
                });
              } else {
                this.$message({
                  type: "error",
                  message: (res && res.msg) || "批量删除核型图失败！",
                });
              }
            })
            .catch((err) => {
              this.$message({
                type: "error",
                message: "批量删除核型图失败！" + err,
              });
              console.error(err);
            });
        }
      });
    },
    ExportSample(patient_id) {
      this.$confirm("确定要导出该样本吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        ExportSample(patient_id)
          .then((result) => {
            const link = document.createElement("a"); //创建a标签
            const blob = new Blob([result], {
              type: "application/octet-stream",
            }); //设置文件流
            link.style.display = "none";
            // 设置连接
            link.href = URL.createObjectURL(blob); //将文件流转化为blob地址
            link.download = patient_id + ".zip";
            document.body.appendChild(link);
            // 模拟点击事件
            link.click(); //设置点击事件
          })
          .catch((err) => {
            this.$message({
              type: "error",
              message: "导出样本失败！",
            });
            console.error(err);
          });
      });
    },
    DelPatient(patient_id) {
      this.$confirm("确定要删除该样本吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        DelPatient(patient_id)
          .then((res) => {
            if (res.code == 200) {
              this.AllpatientArray.splice(
                this.AllpatientArray.findIndex((x) => x.id == patient_id),
                1
              );
              this.patientArray.splice(
                this.patientArray.findIndex((x) => x.id == patient_id),
                1
              );
              this.$message({
                type: "success",
                message: "删除样本成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: (res && res.msg) || "删除样本失败！",
              });
            }
          })
          .catch((err) => {
            this.$message({
              type: "error",
              message: "删除样本失败！",
            });
            console.error(err);
          });
      });
    },
    AppendAnalysis(times) {
      this.fullscreenLoading = Loading.service({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      if (times == "all") {
        AppendAnalysis({
          patient_id: this.selected.id,
          append_number: "全部",
        })
          .then((res) => {
            this.fullscreenLoading.close();
            if (res.code == 200) {
              this.getSlideName(this.selected.id);
              this.getStatstic(this.selected.id);
              this.$message({
                type: "success",
                message: "追加分析成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: (res && res.msg) || "追加分析失败！",
              });
            }
          })
          .catch((err) => {
            this.fullscreenLoading.close();
            this.$message({
              type: "error",
              message: (err && err.msg) || "追加分析失败！",
            });
            console.error(err);
          });
      } else {
        AppendAnalysis({
          patient_id: this.selected.id,
          append_number: times,
        })
          .then((res) => {
            this.fullscreenLoading.close();
            if (res.code == 200) {
              this.getSlideName(this.selected.id);
              this.getStatstic(this.selected.id);
              this.$message({
                type: "success",
                message: "追加分析成功!",
              });
            } else {
              this.$message({
                type: "error",
                message: (res && res.msg) || "追加分析失败！",
              });
            }
          })
          .catch((err) => {
            this.fullscreenLoading.close();
            this.$message({
              type: "error",
              message: (err && err.msg) || "追加分析失败！",
            });
            console.error(err);
          });
      }
    },
    GetSampleType(type) {
      if (type) {
        switch (type) {
          case "G":
            return "外周血";
          case "B":
            return "羊水";
          case "D":
            return "精子库";
          case "F":
            return "免费";
          case "K":
            return "超声异常羊水刺穿";
          case "U":
            return "超声异常引产";
          case "X":
            return "复发流产";
          default:
            return "--";
        }
      } else {
        return "--";
      }
    },
    GetSampleControl() {
      var Udata = {
        upload_id: this.uploadData.upload_id,
        flag: "finish",
      };
      UploadSampleControl(Udata).then((res) => {
        if (res && res.code == 200) {
          if (this.AnalysisTimer) {
            clearInterval(this.AnalysisTimer);
          }
          this.AnalysisTimer = setInterval(() => {
            this.GetUploadAnalysis();
          }, 5000);
        } else {
          this.fullscreenLoading.close();
          if (this.AnalysisTimer) {
            clearInterval(this.AnalysisTimer);
          }
        }
      });
    },
    GetUploadAnalysis() {
      GetAnalysisProgress(this.uploadData.upload_id).then((res) => {
        if (!res || !res.data) {
          this.fullscreenLoading.close();
          this.$message({
            type: "success",
            message: "上传成功!",
          });
          if (this.AnalysisTimer) {
            clearInterval(this.AnalysisTimer);
          }
          this.handleSearch();
        } else if (res.code != 200) {
          this.fullscreenLoading.close();
          if (this.AnalysisTimer) {
            clearInterval(this.AnalysisTimer);
          }
          this.fileList = [];
          this.uploadData = { upload_id: null, relative_path: "" };
          this.$message({
            type: "error",
            message: res.msg,
          });
        } else if (res.data.status == "success") {
          this.fullscreenLoading.close();
          this.$message({
            type: "success",
            message: "上传成功!",
          });
          if (this.AnalysisTimer) {
            clearInterval(this.AnalysisTimer);
          }
          this.handleSearch();
        } else if (res.data.status == "error") {
          this.fullscreenLoading.close();
          if (this.AnalysisTimer) {
            clearInterval(this.AnalysisTimer);
          }
          this.fileList = [];
          this.uploadData = { upload_id: null, relative_path: "" };
          this.$message({
            type: "error",
            message: res.msg,
          });
        }
      });
    },
    exportPatient() {
      //导入本地病例
      this.fileList = [];
      this.uploadData = { upload_id: null, relative_path: "" };
      this.uploadData.upload_id = this.guid();
      sessionStorage.upload_id = this.uploadData.upload_id;
      document.getElementById("uploadDocument").click();
      // this.$nextTick(() => {
      //   document.getElementsByClassName(
      //     "el-upload__input"
      //   )[0].webkitdirectory = true;
      // });
    },
    handleSuccess(res) {
      if (res.code != 200) {
        var Udata = {
          upload_id: this.uploadData.upload_id,
          flag: "cancel",
        };
        UploadSampleControl(Udata);
        this.fullscreenLoading.close();
        if (this.AnalysisTimer) {
          clearInterval(this.AnalysisTimer);
        }
        this.$refs.upload.abort();
        this.fileList = [];
        this.uploadData = { upload_id: null, relative_path: "", flag: "" };
        this.$message({
          type: "error",
          message: res.msg,
        });
      }
    },
    handleError(res) {
      var Udata = {
        upload_id: this.uploadData.upload_id,
        flag: "cancel",
      };
      UploadSampleControl(Udata);
      this.fullscreenLoading.close();
      if (this.AnalysisTimer) {
        clearInterval(this.AnalysisTimer);
      }
      this.$refs.upload.abort();
      this.fileList = [];
      this.uploadData = { upload_id: null, relative_path: "", flag: "" };
      this.$message({
        type: "error",
        message: res.msg,
      });
    },
    handlePreview(file) {
      this.uploadData.relative_path = file.webkitRelativePath;
      this.fullscreenLoading = Loading.service({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      if (this.AnalysisTimer) {
        clearInterval(this.AnalysisTimer);
      }
      this.AnalysisTimer = setInterval(() => {
        this.GetSampleControl();
      }, 5000);
    },
    handleChange(file) {
      console.log(file);
      return false;
    },
    // 图片上传成功
    onFileSuccess(data, files) {
      this.fullscreenLoading = Loading.service({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      if (files.completed) {
        if (this.AnalysisTimer) {
          clearInterval(this.AnalysisTimer);
        }
        this.AnalysisTimer = setInterval(() => {
          this.GetSampleControl();
        }, 5000);
      }
    },
    S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },
    guid() {
      return (
        this.S4() +
        this.S4() +
        "-" +
        this.S4() +
        "-" +
        this.S4() +
        "-" +
        this.S4() +
        "-" +
        this.S4() +
        this.S4() +
        this.S4()
      );
    },
    editPatient(id) {
      GetPatientInformation(id).then((res) => {
        this.dialogVisible = true;
        this.patientData = res.data;
      });
    },
    savePatient() {
      this.$refs["patientData"].validate((valid) => {
        if (valid) {
          if (this.patientData.collect_time&&this.patientData.collect_time.indexOf("T") == -1)
            this.patientData.collect_time =
              this.patientData.collect_time + "T00:00:00";
          if (this.patientData.receive_time&&this.patientData.receive_time.indexOf("T") == -1)
            this.patientData.receive_time =
              this.patientData.receive_time + "T00:00:00";
          ModifyPatient(this.patientData)
            .then((res) => {
              if (res.code == 200) {
                GetPatientInformation(this.patientData.id).then((res1) => {
                  this.selected = res1.data;
                });
                this.$message({
                  type: "success",
                  message: "更新样本成功!",
                });
                this.dialogVisible = false;
              }
            })
            .catch((err) => {
              this.$message.error(err);
            });
        }
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
              this.checked.splice(Index, 1);
              this.getStatstic(this.selected.id);
              // this.getKaryotypeByPatient();
            } else {
              this.$message({
                type: "error",
                message: (res && res.msg) || "删除失败！",
              });
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
    getBgColor(row) {
      let stylejson = {};
      if (row.row.recheck == true) {
        stylejson = { "background-color": "#e6b223" };
      }
      return stylejson;
    },
    rowAutoAnalysisKaryotype(row) {
      this.AutoAnalysisKaryotype(this.form.patient_id, row);
    },
    AutoAnalysisKaryotype(patient_id, item) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const Analysisloading = this.$loading({
        lock: true,
        text: "核型分析中。。。",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      LockPatient(patient_id)
        .then((res) => {
          if (res.code == 200 && res.data == true) {
            if (item.progress == 0) {
              AutoAnalysisKaryo(item.id)
                .then(() => {
                  if (res.code == 200) {
                    if (item.progress == 0) {
                      item.progress == 1;
                    }
                    EnterAnalysisPage()
                      .then((res2) => {
                        this.loading = false;
                        Analysisloading.close();
                        if (res2.code == 200) {
                          this.$router.push({
                            path: "/detail/" + patient_id + "/" + item.id,
                            params: { patient: patient_id, id: item.id },
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
              EnterAnalysisPage()
                .then((res2) => {
                  this.loading = false;
                  Analysisloading.close();
                  if (res2.code == 200) {
                    this.$router.push({
                      path: "/detail/" + patient_id + "/" + item.id,
                      params: { patient: patient_id, id: item.id },
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
            }
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
            this.AllpatientArray = this.AllpatientArray.concat(data);
            this.patientArray = this.patientArray.concat(data);
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          // this.$message.error(err);
        });
    },
    // 检索病例信息
    handleSearch() {
      this.query.page_number = 1;
      this.count = 1;
      if (this.daterange && this.daterange.length > 0) {
        this.query.start_time = this.daterange[0];
        this.query.end_time = this.daterange[1];
      } else {
        this.query.start_time = null;
        this.query.end_time = null;
      }
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
            this.loading = false;
          } else {
            var end_time = data[data.length - 1].create_time;
            this.query.new_end_time = end_time;
          }
          if (data.length > 0) {
            this.AllpatientArray = data;
            this.patientArray = data;
            this.handleSelectItem(data[0], 0);
          } else {
            this.AllpatientArray = [];
            this.patientArray = [];
            this.rows = [];
            this.statistic = {};
            this.selected = {
              id: "",
            };
            sessionStorage.removeItem("dataSource");
          }
          if (document.getElementById("search-result")) {
            document.getElementById("search-result").scrollTop = 0;
          }
          this.loading = false;
        })
        .then(() => {
          console.log(sessionStorage.scrollTop);
          if (sessionStorage.scrollTop) {
            document.getElementById("search-result").scrollTop =
              sessionStorage.scrollTop * 40 + 5;
          }
        })
        .catch(() => {
          this.loading = false;
          // this.$message.error(err);
        });
    },

    // 选择病人
    handleSelectItem(row, index) {
      GetPatientInformation(row.id).then((res) => {
        this.selected = res.data;
      });
      sessionStorage.scrollTop = index;
      this.form.patient_id = row.id;
      this.getSlideName(row.id);
      this.getStatstic(row.id);
    },

    // 获取病例核型图统计信息
    getStatstic(id) {
      GetKaryotypeStatistic(id).then(({ data }) => {
        this.statistic = data;
        this.statistic.analysedCountDetail = "";
        var item = this.patientArray.find((x) => x.id == id);
        item.count_confirmed = this.statistic.count_confirmed_count;
        item.arrange_confirmed = this.statistic.expression_confirmed_count;
        item.total_karyotype = this.statistic.cell_count;
        if (this.statistic.analysed_count_detail.length > 0) {
          this.statistic.analysed_count_detail.forEach((ele, index) => {
            if (index < 6) {
              if (index % 2 == 0) {
                this.statistic.analysedCountDetail += ele + ":";
              } else {
                this.statistic.analysedCountDetail += ele + " ";
              }
            }
          });
          this.statistic.analysedCountDetail =
            this.statistic.analysedCountDetail.substr(
              0,
              this.statistic.analysedCountDetail.length - 1
            );
          // if (this.statistic.analysed_count_detail.length > 6) {
          //   this.statistic.analysedCountDetail =
          //     this.statistic.analysedCountDetail + "...";
          // }
        }
        this.statistic.analysedExpressionDetail = "";
        if (this.statistic.analysed_expression_detail.length > 0) {
          this.statistic.analysed_expression_detail.forEach((ele, index) => {
            if (index < 6) {
              if (index % 2 == 0) {
                this.statistic.analysedExpressionDetail += ele + ":";
              } else {
                this.statistic.analysedExpressionDetail += ele + " ";
              }
            }
          });
          this.statistic.analysedExpressionDetail =
            this.statistic.analysedExpressionDetail.substr(
              0,
              this.statistic.analysedExpressionDetail.length - 1
            );

          // if (this.statistic.analysed_expression_detail.length > 6) {
          //   this.statistic.analysedExpressionDetail =
          //     this.statistic.analysedExpressionDetail + "...";
          // }
        }
        this.statistic.countConfirmedDetail = "";
        if (this.statistic.count_confirmed_detail.length > 0) {
          this.statistic.count_confirmed_detail.forEach((ele, index) => {
            if (index % 2 == 0) {
              this.statistic.countConfirmedDetail += ele + ":";
            } else {
              this.statistic.countConfirmedDetail += ele + " ";
            }
          });
          this.statistic.countConfirmedDetail =
            this.statistic.countConfirmedDetail.substr(
              0,
              this.statistic.countConfirmedDetail.length - 1
            );
        }
        this.statistic.expressionConfirmedDetail = "";
        if (this.statistic.expression_confirmed_detail.length > 0) {
          this.statistic.expression_confirmed_detail.forEach((ele, index) => {
            if (index % 2 == 0) {
              this.statistic.expressionConfirmedDetail += ele + ":";
            } else {
              this.statistic.expressionConfirmedDetail += ele + " ";
            }
          });
          this.statistic.expressionConfirmedDetail =
            this.statistic.expressionConfirmedDetail.substr(
              0,
              this.statistic.expressionConfirmedDetail.length - 1
            );
        }
      });
    },
    // 获取病例核型图统计信息
    getStatsticnew(id) {
      GetKaryotypeStatistic(id).then(({ data }) => {
        this.statistic = data;
        this.statistic.analysedCountDetail = "";
        var patient = this.patientArray.find((x) => x.id == id);

        patient.count_confirmed = data.count_confirmed_count;
        patient.arrange_confirmed = data.expression_confirmed_count;
        patient.total_karyotype = data.cell_count;
        if (this.statistic.analysed_count_detail.length > 0) {
          this.statistic.analysed_count_detail.forEach((ele, index) => {
            if (index < 6) {
              if (index % 2 == 0) {
                this.statistic.analysedCountDetail += ele + ":";
              } else {
                this.statistic.analysedCountDetail += ele + " ";
              }
            }
          });
          this.statistic.analysedCountDetail =
            this.statistic.analysedCountDetail.substr(
              0,
              this.statistic.analysedCountDetail.length - 1
            );
          if (this.statistic.analysed_count_detail.length > 6) {
            this.statistic.analysedCountDetail =
              this.statistic.analysedCountDetail + "...";
          }
        }
        this.statistic.analysedExpressionDetail = "";
        if (this.statistic.analysed_expression_detail.length > 0) {
          this.statistic.analysed_expression_detail.forEach((ele, index) => {
            if (index < 6) {
              if (index % 2 == 0) {
                this.statistic.analysedExpressionDetail += ele + ":";
              } else {
                this.statistic.analysedExpressionDetail += ele + " ";
              }
            }
          });
          this.statistic.analysedExpressionDetail =
            this.statistic.analysedExpressionDetail.substr(
              0,
              this.statistic.analysedExpressionDetail.length - 1
            );

          if (this.statistic.analysed_expression_detail.length > 6) {
            this.statistic.analysedExpressionDetail =
              this.statistic.analysedExpressionDetail + "...";
          }
        }
        this.statistic.countConfirmedDetail = "";
        if (this.statistic.count_confirmed_detail.length > 0) {
          this.statistic.count_confirmed_detail.forEach((ele, index) => {
            if (index % 2 == 0) {
              this.statistic.countConfirmedDetail += ele + ":";
            } else {
              this.statistic.countConfirmedDetail += ele + " ";
            }
          });
          this.statistic.countConfirmedDetail =
            this.statistic.countConfirmedDetail.substr(
              0,
              this.statistic.countConfirmedDetail.length - 1
            );
        }
        this.statistic.expressionConfirmedDetail = "";
        if (this.statistic.expression_confirmed_detail.length > 0) {
          this.statistic.expression_confirmed_detail.forEach((ele, index) => {
            if (index % 2 == 0) {
              this.statistic.expressionConfirmedDetail += ele + ":";
            } else {
              this.statistic.expressionConfirmedDetail += ele + " ";
            }
          });
          this.statistic.expressionConfirmedDetail =
            this.statistic.expressionConfirmedDetail.substr(
              0,
              this.statistic.expressionConfirmedDetail.length - 1
            );
        }
      });
    },
    // 获取病例玻片名称列表
    getSlideName(id, IsRefersh) {
      GetSlideNames(id)
        .then(({ data }) => {
          this.slideArray = data;
          // this.slideArray =this.slideArray.concat(data) ;
          // this.slideArray =this.slideArray.concat(data) ;
          // this.slideArray =this.slideArray.concat(data) ;
          if (!IsRefersh) {
            this.form.slide_names = data;
          }
          this.getKaryotypeByPatient();
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 获取病例的核型图
    getKaryotypeByPatient() {
      const form = this.form;
      if (form.slide_names.length == this.slideArray.length) {
        this.checkAll1 = true;
        this.isIndeterminate1 = false;
      } else if (form.slide_names.length != 0) {
        this.checkAll1 = false;
        this.isIndeterminate1 = true;
      } else {
        this.checkAll1 = false;
        this.isIndeterminate1 = false;
      }
      if (form.progresses.length == 4) {
        this.checkAll2 = true;
        this.isIndeterminate2 = false;
      } else if (form.progresses.length != 0) {
        this.checkAll2 = false;
        this.isIndeterminate2 = true;
      } else {
        this.checkAll2 = false;
        this.isIndeterminate2 = false;
      }
      if (form.slide_names.length > 0 && form.progresses.length > 0) {
        this.vloading = true;
        if (form.color === "") {
          form.color = null;
        }
        GetKaryotypeByPatient(form)
          .then(({ data }) => {
            this.rows = data;
            this.checked = this.rows.map((x) => {
              return false;
            });
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
      if (color != "") this.colorSeletAll = false;
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
  beforeDestroy() {
    if (this.fullscreenLoading) this.fullscreenLoading.close();
    if (this.AnalysisTimer) {
      clearInterval(this.AnalysisTimer);
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.fullscreenLoading) this.fullscreenLoading.close();
    if (this.AnalysisTimer) {
      clearInterval(this.AnalysisTimer);
    }
    if (to.name != "detail") from.meta.keepAlive = false;
    else from.meta.keepAlive = true;
    next();
  },
};
</script>
<style lang="scss" scoped>
.home-page {
  height: 100vh;
  background-color: #001529;
  overflow: hidden;
  .choose {
    display: flex;
    flex-direction: row;
    clear: both;
    overflow: hidden;
    border-top: solid 1px rgba(255, 255, 255, 0.2);
    border-bottom: solid 1px rgba(255, 255, 255, 0.2);
    padding: 5px 0 5px 5px;
    .color-array {
      height: 32px;
      .li {
        background-color: #fff;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        margin-right: 6px;
        cursor: pointer;
        &.active {
          position: relative;
          &::after {
            content: "";
            border: solid 2px #fff;
            border-radius: 50%;
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
      box-sizing: border-box;
    }
    .checkboxItem {
      /deep/.el-form-item__content {
        line-height: 32px;
        box-sizing: border-box;
        display: flex;
      }
    }
    /deep/.el-checkbox-group {
      // height: 32px;
    }
    /deep/.el-checkbox {
      margin-right: 12px;
      &:last-child {
        margin-right: 0;
      }
    }
    /deep/.el-radio {
      margin-right: 10px;
    }
    /deep/.el-switch__label {
      color: #fff;
    }

    .side {
      width: 325px;
      border-right: solid 1px rgba(255, 255, 255, 0.2);
      overflow: hidden;
      /deep/.el-checkbox-group {
        line-height: 46px !important;
      }

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
        padding: 10px 5px;
        height: calc(100vh - 275px);
        overflow: hidden;
        overflow-y: auto;
        border-bottom: solid 1px rgba(255, 255, 255, 0.2);
        .item {
          padding: 5px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 40px;
          line-height: 30px;
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
          .statusContent {
            display: flex;
            flex-direction: row;
            align-items: center;
            i {
              transform: rotate(90deg);
            }
          }
          .status {
            color: #ffffff;
            line-height: 1;
            display: flex;
            align-items: center;
            padding: 5px 10px;
            background-color: #4f565f;
            border-radius: 10px;
            // &::before {
            //   width: 6px;
            //   height: 6px;
            //   border-radius: 50%;
            //   content: "";
            //   margin-right: 5px;
            // }
            &.not {
              color: #ffffff;
              background-color: #4f565f;
              // &::before {
              //   background-color: #666;
              // }
            }
            &.started {
              color: #409eff;
              // &::before {
              //   background-color: #409eff;
              // }
            }
            &.done {
              background-color: #138dff;
              color: #ffffff;
              // &::before {
              //   background-color: #89ff40;
              // }
            }
          }
        }
      }
    }
  }
  .container {
    height: calc(100vh - 50px);
    width: calc(100% - 270px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin: 0 0 0 10px;
    .information {
      display: flex;
      flex-direction: row;
      padding: 5px 0;
      overflow: hidden;
      color: #fff;
      height: 135px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      .title {
        padding: 10px 0;
        display: flex;
        flex-direction: column;
        width: 120px;
        align-items: center;
        justify-content: space-between;
        line-height: 27px;
        font-size: 18px;
        color: #fff;
        text-align: center;
        div {
          background-color: #3b373d;
          color: #158aff;
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          i {
            font-size: 28px;
          }
        }
      }
      .list1 {
        width: 110px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        flex-direction: column;
        .item {
          line-height: 27px;
          color: #fff;
          width: 32px;
          height: 27px;
          background: linear-gradient(180deg, #00d2ff 0%, #2c3cfe 100%);
          border-radius: 10px;
          box-shadow: 0px 10px 20px 0px rgba(20, 31, 159, 0.15);
          border-radius: 13px;
          text-align: center;
        }
      }
      .list_l {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        padding: 10px 0;
        width: 400px;
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        .item {
          line-height: 27px;
          color: #fff;
          width: 50%;
          display: flex;
          align-items: center;
          &::before {
            content: attr(data-title);
            width: 70px;
          }
        }
      }
      .list {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        padding: 5px 0;
        max-width: 600px;
        .item {
          line-height: 27px;
          color: #fff;
          width: 90%;
          display: flex;
          align-items: center;
          flex: 1;
          &::before {
            content: attr(data-title);
            width: 70px;
          }
          .content {
            width: 400px;
            float: left;
            overflow: hidden; /*内容会被修剪，并且其余内容是不可见的*/
            text-overflow: ellipsis; /*显示省略符号来代表被修剪的文本。*/
            white-space: nowrap;
          }
          .blue {
            line-height: 22px;
            color: #fff;
            width: 30px;
            height: 22px;
            background: linear-gradient(180deg, #00d2ff 0%, #2c3cfe 100%);
            border-radius: 10px;
            box-shadow: 0px 10px 20px 0px rgba(20, 31, 159, 0.15);
            border-radius: 13px;
            text-align: center;
            margin-right: 10px;
            margin-left: 5px;
          }
        }
      }
    }
    .image-list {
      padding: 0 0 30px 10px;
      width: 100%;
      overflow: hidden;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: start;

      .item {
        width: calc(100% / 5 - 10px);
        min-width: 254px;
        margin-top: 10px;
        margin-right: 10px;
        overflow: hidden;
        position: relative;
        .img-box {
          min-height: 230px;
          width: 100%;
          height: aspect-ratio(3/4);
          background-color: #fff;
          overflow: hidden;
          border-radius: 10px 10px 0 0;
        }
        .recheck {
          border-top: 5px solid #e6b223;
          border-left: 5px solid #e6b223;
          border-right: 5px solid #e6b223;
        }
        .recheck-bottom {
          border-bottom: 5px solid #e6b223;
          border-left: 5px solid #e6b223;
          border-right: 5px solid #e6b223;
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
        .pos-bottomright {
          position: absolute;
          left: 14px;
          bottom: 8px;
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
        .coloritem-array {
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
          .coloritem-array {
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
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 0px;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  border-radius: 3px;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
.patientData {
  /deep/.el-form-item__label {
    color: #444 !important;
  }
  /deep/.el-radio__label {
    color: #444 !important;
  }
}
// /deep/.el-dialog__header {
//   background-color: #001529;
//   .el-dialog__title {
//     color: #fff;
//   }
// }
// /deep/.el-dialog__body {
//   background-color: #001529;
// }
// /deep/.el-dialog__footer {
//   background-color: #001529;
// }
/deep/.el-upload-list {
  display: none;
}
// /deep/.el-checkbox-group {
//   display: flex;
//   flex-wrap: wrap;
//   overflow: hidden ;
//   &:hover {
//     display: inline-table !important;
//   }
// }

.list3 {
  position: relative;
  .menuPlus {
    width: 55px;
    height: 55px;
    border: solid 3px #fff;
    // box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    background-color: #ea6c62;
    border-radius: 50%;
    position: absolute;
    right: 28px;
    bottom: 73px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 17px;
    cursor: pointer;
    z-index: 10;
    transition: 300ms;
    text-align: center;
    // &.active {
    //   transform: rotate(45deg);
    //   background-color: red;
    // }
  }
  .menuList {
    width: 200px;
    height: 200px;
    position: absolute;
    right: -120px;
    bottom: -120px;
    border-radius: 50%;
    .li {
      width: 50px;
      height: 50px;
      background-color: #fff;
      border-radius: 50%;
      position: absolute;
      left: 108px;
      top: 108px;
      transition: 300ms;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      transform: rotate(360deg);
      cursor: pointer;
    }
    &.active .li {
      transform: rotate(0deg);
      &:nth-child(1) {
        top: -45px;
        left: 60px;
        background-color: #e6b223;
      }
      &:nth-child(2) {
        top: -45px;
        left: 115px;
        background-color: #1a81ff;
      }
      &:nth-child(3) {
        top: -45px;
        left: 170px;
        background-color: #7dca5c;
      }
    }
  }
}
.list2 {
  position: relative;
  .menuPlus {
    width: 55px;
    height: 55px;
    border: solid 3px #fff;
    // box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    background-color: #1a81ff;
    border-radius: 50%;
    position: absolute;
    right: 148px;
    bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 17px;
    cursor: pointer;
    z-index: 10;
    transition: 300ms;
    text-align: center;
    // &.active {
    //   transform: rotate(45deg);
    //   background-color: red;
    // }
  }
  .menuList {
    width: 200px;
    height: 200px;
    position: absolute;
    right: -20px;
    bottom: -120px;
    border-radius: 50%;
    .li {
      width: 50px;
      height: 50px;
      background-color: #fff;
      border-radius: 50%;
      position: absolute;
      left: 118px;
      top: 113px;
      transition: 300ms;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transform: rotate(360deg);
      cursor: pointer;
    }
    &.active .li {
      transform: rotate(0deg);
      &:nth-child(1) {
        top: 17px;
        left: 35px;
        background-color: #e6b223;
      }
      &:nth-child(2) {
        top: 17px;
        left: 90px;
        background-color: #ea6c62;
      }
      &:nth-child(3) {
        top: 17px;
        left: 145px;
        background-color: #7dca5c;
      }
    }
  }
}

.cccheckbox {
  display: inline !important;
  flex-wrap: wrap !important;
  overflow-y: auto !important;
  // &:hover {
  //   display: inline !important;
  //   // height: 100px;
  // }
}
.row-list {
  padding: 0 0 30px 10px;
  width: 100%;
  overflow: hidden;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: start;
  /deep/ .el-table {
    background-color: #001529;
    color: #fff;
    overflow-y: auto;
  }
  /deep/ .el-table td.el-table__cell {
    border-bottom: 1px solid #334454;
  }
  /deep/.el-table tbody tr:hover > td {
    background-color: #01579b;
    color: #fff;
  }

  /deep/ .el-table th {
    background-color: #073f74;
    color: #fff;
  }
  /deep/ .el-table tr {
    background-color: #001529;
    color: #fff;
  }
  /deep/ .el-table__cell {
    border-bottom: 1px solid #334454;
  }
  /deep/ .is-leaf {
    border-bottom: 1px solid #334454;
  }
  /deep/ .el-table::before {
    background-color: #334454;
  }
}
</style>
