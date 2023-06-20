<template>
  <div class="rst-page">
    <web-header></web-header>
    <div class="container">
      <div class="image-list" id="imgList">
        <template v-if="dataArray.length > 0">
          <template v-for="(item, index) in dataArray">
            <router-link
              class="item"
              :to="`/detail/${patient_id}/${item.id}`"
              :class="{ active: item.id === id }"
              :key="index + 10"
            >
              <div class="pos">
                <div class="count">
                  {{ item.karyotype_expression }}
                  <div
                    class="line"
                    :style="{
                      backgroundColor: [
                        '#7f7f7f',
                        '#f4c60a',
                        '#3583e3',
                        '#50a449',
                      ][item.progress],
                    }"
                  ></div>
                </div>
              </div>
              <el-image
                :src="`${Host}/api/get_image/?image_path=${item.image_path}&token=${token}`"
                width="100%"
                lazy
              />
            </router-link>
          </template>
        </template>
      </div>
      <div class="preview" id="preview" ref="preview">
        <template v-if="isShow">
          <div class="btn-panel">
            <el-radio-group v-model="imageType" @change="handleSwitchImage">
              <el-radio-button label="original">原图</el-radio-button>
              <el-radio-button label="optimization">优化图</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <!-- 预览图 -->
        <div class="svg" v-if="isShow" @mousewheel="handleMouseWhell">
          <svg
            ref="svg"
            class="svg"
            id="svg"
            viewBox="0 0 1600 1200"
            @click.prevent="handleAddPointer"
            @mousedown.prevent="handleMouseSvgDown"
            @mousemove.prevent="handleSvgMouseMove"
            @mouseup.prevent="handleSvgMouseUp"
            :style="{
              transform: `scale(${scale.value / 100})`,
              left: `${scale.left}px`,
              top: `${scale.top}px`,
              cursor: active === 16 ? 'grab' : 'default',
            }"
          >
            <g id="bg" v-if="karyoData">
              <image
                :href="`${Host}/api/get_image/?image_path=${karyoData.origin_image_path}&token=${token}&t=${imageType}`"
                x="0"
                y="0"
                width="1600"
                height="1200"
                v-show="imageType === 'original'"
              />
              <image
                :href="`${Host}/api/get_image/?image_path=${karyoData.image_path}&token=${token}&a=${imageType}`"
                x="0"
                y="0"
                width="1600"
                height="1200"
                v-show="imageType === 'optimization'"
                :style="{
                  filter: `brightness(${brightness}) contrast(${contrast})`,
                }"
              />
            </g>

            <template v-if="imageType === 'optimization'">
              <!-- 轮廓 -->
              <template v-if="originArray.length > 0 && active !== 18">
                <template v-for="(item, index) in originArray">
                  <path
                    fill="transparent"
                    :d="`M${item.value}z`"
                    :key="`p_${index}`"
                    :class="{
                      selected: rst_id === item.id,
                    }"
                    @click.prevent="handleSelectChromoItem(item)"
                    @dblclick.prevent="handleDbChromoItem(item)"
                  />
                </template>
              </template>

              <!-- 计数 -->
              <template v-if="pointsArray.length > 0 && active !== 18">
                <template v-for="(item, index) in pointsArray">
                  <circle
                    r="8"
                    :key="`c_${index}`"
                    :cx="item.x"
                    :cy="item.y"
                    :style="`fill: ${
                      karyoData.chromosome_count === 46 ? 'green' : 'red'
                    }`"
                    @contextmenu.prevent="handleDeletePointer(item)"
                  ></circle>
                </template>
              </template>
            </template>

            <!-- 切割 -->
            <template v-if="chromo.arr.length > 0 && isShow">
              <polyline
                style="fill: none; stroke: red; stroke-width: 2"
                :points="chromo.arr.join(' ')"
              />
            </template>

            <!-- 涂抹 -->
            <template v-if="eraser.arr.length > 0 && isShow">
              <template v-for="(item, index) in eraser.arr">
                <circle
                  :key="`a_${index}`"
                  :cx="item.split(',')[0]"
                  :cy="item.split(',')[1]"
                  r="8"
                  style="fill: blue; fill-opacity: 0.08"
                ></circle>
              </template>
            </template>
          </svg>
        </div>

        <!-- 排列图 -->
        <div v-if="!isShow">
          <karyotype-preview
            :kid="rst_id"
            :rows="photoArray"
            :red="redArray"
            :activeName="activeName"
            :key="key_id"
            :contrast="contrast"
            :brightness="brightness"
            :sharpness="sharpness"
            type="big"
            @end="reloadPhoto"
            @selected="handleSelectItem"
            @dragEnd="handleDragEnd"
            @delete="handleDeleteArrow"
          ></karyotype-preview>
        </div>

        <!-- 放大缩小 -->
        <template v-if="isShow">
          <div class="scale-btn">
            <el-button
              type="primary"
              icon="el-icon-minus"
              size="mini"
              @click="handleChangeScale('minus')"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-refresh-left"
              size="mini"
              @click="handleResetScale"
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleChangeScale('plus')"
            ></el-button>
          </div>
        </template>

        <!-- 待排区自动排列 -->
        <el-button
          icon="el-icon-refresh"
          type="primary"
          :loading="loading"
          :style="{
            position: 'absolute',
            right: '20px',
            bottom: '20px',
            zIndex: 10,
          }"
          :disabled="imageType === 'original'"
          v-if="!isShow"
          @click="getArrangeUnclassified"
          size="mini"
          >待排区自动排列</el-button
        >

        <!-- 清空计数 -->
        <el-button
          icon="el-icon-refresh"
          type="primary"
          :style="{ position: 'absolute', right: '20px', bottom: '20px' }"
          :disabled="imageType === 'original'"
          v-if="isShow"
          @click="handleClearCount"
          size="mini"
          >清空计数</el-button
        >
      </div>
      <div class="col-l">
        <div class="history">
          <template v-if="patient">
            <div class="item">
              <div class="label">样本编号：</div>
              <div class="value">{{ patient.id }}</div>
            </div>
            <div class="item">
              <div class="label">姓名：</div>
              <div class="value">{{ patient.name || "--" }}</div>
            </div>
            <div class="item">
              <div class="label">性别：</div>
              <div class="value">
                {{
                  patient.gender ? ["", "男性", "女性"][patient.gender] : "--"
                }}
              </div>
            </div>
            <div class="item">
              <div class="label">年龄：</div>
              <div class="value">
                {{ patient.age || "--"
                }}{{
                  patient.age_unit !== null
                    ? ["岁", "月", "周", "天"][patient.age_unit]
                    : ""
                }}
              </div>
            </div>
            <div class="item">
              <div class="label">样本类型：</div>
              <div class="value">
                {{ parseSimpleType(patient.sample_type) }}
              </div>
            </div>
            <div class="item">
              <div class="label">接收日期：</div>
              <div class="value">
                {{
                  patient.receive_time
                    ? patient.receive_time.substring(0, 10)
                    : "--"
                }}
              </div>
            </div>
            <div class="item">
              <div class="label">临床诊断：</div>
              <div class="value">{{ patient.clinical_diagnosis || "--" }}</div>
            </div>
            <template v-if="karyoData">
              <div class="item">
                <div class="label">玻片号：</div>
                <div class="value">{{ karyoData.slide_name }}</div>
              </div>
              <div class="item">
                <div class="label">Cell：</div>
                <div class="value">{{ karyoData.name }}</div>
              </div>
            </template>
          </template>
        </div>
        <template v-if="karyoData">
          <div class="analysis">
            <div class="section">
              <div class="title">当前分析</div>
              <div class="current" data-text="当前计数">
                {{ karyoData.chromosome_count || 0 }}
              </div>
              <div class="current" data-text="核型表达式">
                <input
                  type="text"
                  class="input-box"
                  v-model="karyoData.karyotype_expression"
                  @blur="handleUpdateKaryotype"
                />
              </div>
            </div>
          </div>
        </template>
        <div class="statistics">
          <div class="title">分析统计</div>
          <template v-if="statistic">
            <template v-if="statistic.count_confirmed_detail.length > 0">
              <div class="item" data-label="确认计数" data-unit="张">
                {{ statistic.confirmed_total }}
              </div>
              <template v-for="(item, index) in statistic.confirmed_detail">
                <div
                  class="item"
                  :data-label="item.label"
                  data-unit="张"
                  :key="index + 10"
                >
                  {{ item.value }}
                </div>
              </template>
            </template>
            <template v-else>
              <div class="item" data-label="确认计数" data-unit="张">0</div>
            </template>
            <template v-if="statistic.expression_confirmed_detail.length > 0">
              <div
                class="item"
                data-label="确认分析"
                data-unit="张"
                :style="{ marginTop: '12px' }"
              >
                {{ statistic.expression_total }}
              </div>
              <template v-for="(item, index) in statistic.expression_confirmed">
                <div
                  class="item"
                  :data-label="item.label"
                  data-unit="张"
                  :key="index + 20"
                >
                  {{ item.value }}
                </div>
              </template>
            </template>
            <template v-else>
              <div class="item" data-label="确认分析" data-unit="张">0</div>
            </template>
          </template>
        </div>
        <template v-if="karyoData">
          <div :style="{ padding: '10px 30px' }">
            <el-checkbox
              v-model="karyoData.recheck"
              :true-label="1"
              :false-label="0"
              @change="handleReCheck"
              >是否核验</el-checkbox
            >
          </div>
        </template>
      </div>
      <div class="col-r">
        <div class="box" v-show="isShow">
          <karyotype-preview
            :kid="rst_id"
            :rows="photoArray"
            :red="redArray"
            :activeName="activeName"
            type="small"
            @callback="handelSwitchImage"
          ></karyotype-preview>
        </div>
        <div class="box" @click.stop="handelSwitchImage" v-show="!isShow">
          <karyotype-original
            :kid="rst_id"
            :row="karyoData"
            :originArray="originArray"
            :pointsArray="pointsArray"
          ></karyotype-original>
        </div>
        <template v-if="karyoData">
          <!-- 按钮组合 -->
          <div class="btn-panel-2">
            <el-button
              type="primary"
              icon="el-icon-top"
              @click="handeSetTop(karyoData.is_top)"
              >{{ karyoData.is_top === 0 ? "置顶" : "取消置顶" }}</el-button
            >
            <el-button
              icon="el-icon-refresh-right"
              :type="active === 30 ? 'danger' : 'primary'"
              @click="handleRotateChromo"
              v-if="!isShow"
              >旋转</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-c-scale-to-original"
              @click="handleFlipChromo"
              v-if="!isShow"
              >镜像</el-button
            >
            <el-button
              icon="el-icon-magic-stick"
              :type="active === 13 ? 'danger' : 'primary'"
              :disabled="imageType === 'original'"
              @click="handleClickCout"
              v-if="isShow"
              >计数</el-button
            >
            <el-button
              icon="el-icon-brush"
              :type="active === 14 ? 'danger' : 'primary'"
              :disabled="imageType === 'original'"
              @click="handleClickEraser"
              v-if="isShow"
              >涂抹</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-delete-solid"
              :disabled="imageType === 'original'"
              @click="handleDeleteChoromose"
              >删除</el-button
            >
            <el-button
              icon="el-icon-brush"
              :type="active === 15 ? 'danger' : 'primary'"
              @click="handleErase"
              v-if="!isShow"
              >擦除</el-button
            >
            <el-button
              icon="el-icon-view"
              :type="active === 18 ? 'info' : 'primary'"
              :disabled="imageType === 'original'"
              @click="handleShowOrHideBorder"
              v-if="isShow"
              >标记</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-download"
              :loading="loading"
              :disabled="imageType === 'original'"
              @click="handleExportData"
              >导出</el-button
            >
            <el-button
              icon="el-icon-bottom-left"
              :type="active === 19 ? 'danger' : 'primary'"
              @click="handleArrow"
              v-if="!isShow"
              >箭头</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-refresh-left"
              @click="handleUndo"
              >回退</el-button
            >
            <el-button type="primary" icon="el-icon-refresh" @click="handleRedo"
              >重做</el-button
            >
            <el-button
              type="primary"
              icon="el-icon-picture-outline"
              @click="optimization.show = true"
              >图像优化</el-button
            >
            <el-button
              icon="el-icon-zoom-in"
              :type="active === 20 ? 'danger' : 'primary'"
              @click="handleClickZoom"
              v-if="!isShow"
              >放大</el-button
            >
            <el-button
              icon="el-icon-notebook-2"
              :type="active === 32 ? 'danger' : 'primary'"
              @click="handleTiaodai"
              v-if="!isShow"
              >条带</el-button
            >
            <el-button
              icon="el-icon-notebook-2"
              :type="active === 33 ? 'danger' : 'primary'"
              @click="handleDingdai"
              v-if="!isShow"
              >定带</el-button
            >
          </div>

          <el-row
            :style="{ padding: '10px 0', borderBottom: 'solid 2px #555' }"
          >
            <!-- 自动分析 -->
            <template v-if="karyoData.progress === 1">
              <el-button
                type="success"
                icon="el-icon-check"
                :style="{ width: '100%' }"
                @click="handleConfirmCount"
                >确认计数并下一张</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-finished"
                :style="{ width: '100%', margin: '10px 0 0 0' }"
                @click="handleSaveKaryotype"
                >确认计数+分析并下一张</el-button
              >
            </template>

            <!-- 计数确认 -->
            <template v-if="karyoData.progress === 2">
              <el-button
                type="danger"
                icon="el-icon-close"
                :style="{ width: '100%' }"
                @click="handleCancelCount"
                >取消确认计数</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-finished"
                :disabled="karyoData.progress === 3"
                :style="{ width: '100%', margin: '10px 0 0 0' }"
                @click="handleSaveKaryotype"
                >确认计数+分析并下一张</el-button
              >
            </template>

            <!-- 确认分析 -->
            <template v-if="karyoData.progress === 3">
              <el-button
                key="confirmation_analysis"
                type="success"
                icon="el-icon-check"
                :style="{ width: '100%' }"
                disabled
                >确认计数并下一张</el-button
              >
              <el-button
                type="danger"
                icon="el-icon-close"
                :style="{ width: '100%', margin: '10px 0 0 0' }"
                @click="handleCancelKaryotype"
                >取消确认分析</el-button
              >
            </template>

            <!-- 重新自动分析 -->
            <el-button
              type="primary"
              icon="el-icon-refresh"
              :style="{ width: '100%', margin: '10px 0 0 0' }"
              @click="handleResetKaryotype"
              >重新自动分析</el-button
            >
          </el-row>

          <!-- 同源单双号对比 -->
          <el-row
            type="flex"
            justify="space-between"
            :style="{ padding: '10px 0', borderBottom: 'solid 2px #555' }"
          >
            <el-button
              type="danger"
              icon="el-icon-document-remove"
              class="danger-btn"
              :style="{ width: 'calc(50% - 5px)', margin: '0' }"
              @click="handleShowDialog(1)"
              >同源单号对比</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-document-add"
              class="danger-btn"
              :style="{ width: 'calc(50% - 5px)' }"
              @click="handleShowDialog(2)"
              >同源双号对比</el-button
            >
          </el-row>

          <!-- 报告生成 -->
          <el-row :style="{ padding: '10px 0' }">
            <el-button
              type="primary"
              icon="el-icon-upload"
              :style="{ width: '100%' }"
              @click="getPublishedTempletes"
              >生成报告</el-button
            >
            <el-button
              type="primary"
              :style="{ width: 'calc(50% - 5px)', margin: '10px 0 0 0' }"
              @click="handlePreviewPrev"
              ><i class="el-icon-arrow-left"></i>上一张</el-button
            >
            <el-button
              type="primary"
              :style="{ width: 'calc(50% - 5px)', margin: '10px 0 0 10px' }"
              @click="handlePreviewNext"
              >下一张<i class="el-icon-arrow-right"></i
            ></el-button>
          </el-row>
        </template>
      </div>

      <!-- 弹框 -->
      <el-dialog
        :visible.sync="imageDialogVisible"
        top="3vh"
        width="80%"
        title="报告图片选择"
        :modal="false"
        :size="'mini'"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <div v-if="imageDialogVisible">
          <KaryotypeImages
            @returnKaryoData="returnKaryoData"
            :karyotypeId="templeteData.karyotype_id"
            :hideSex="hideSex"
            :patientId="patient_id"
            :templeteId="templeteId"
            ref="imageKaryo"
          ></KaryotypeImages>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="imageDialogVisible = false"
            >取 消</el-button
          >
          <el-button size="small" type="primary" @click="saveimageKaryo"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <!-- 生成报告 -->
      <el-dialog
        :visible.sync="dialogVisible"
        top="5vh"
        width="800px"
        title="生成报告"
        :modal="false"
        :size="'mini'"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <div v-if="dialogVisible">
          <el-form ref="form" :model="templeteData" labelWidth="100px">
            <el-form-item prop="name" label="样本编号">
              <el-input
                v-model="patient_id"
                placeholder="请输入样本编号"
                disabled
                style="width: 340px"
              ></el-input>
              <span style="margin-left: 15px">模板选择 </span>
              <el-select
                v-model="templeteId"
                style="width: 225px"
                @change="changTemplete"
              >
                <el-option
                  v-for="(item, index) in templetes"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('patient_name')"
              :label="getTempleteName('patient_name') || '患者名称'"
            >
              <el-input
                v-model="templeteData.patient_name"
                placeholder="请输入患者名称"
                style="width: 340px"
              ></el-input>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('patient_no')"
              :label="getTempleteName('patient_no') || '病历编号'"
            >
              <el-input
                v-model="templeteData.patient_no"
                placeholder="请输入病历编号"
                style="width: 340px"
              ></el-input>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('patient_gender')"
              :label="getTempleteName('patient_gender') || '患者性别'"
            >
              <el-select
                v-model="templeteData.patient_gender"
                style="width: 340px"
              >
                <el-option label="男" :value="1">男</el-option>
                <el-option label="女" :value="2">女</el-option>
              </el-select>
              <span
                style="margin-left: 15px"
                v-if="includeTemplete('patient_age')"
                >{{ getTempleteName("patient_age") || "患者年龄" }}
              </span>
              <el-input
                v-if="includeTemplete('patient_age')"
                style="width: 125px"
                v-model.number="templeteData.patient_age"
                placeholder="请输入患者年龄"
              ></el-input>
              <el-select
                v-model="templeteData.patient_age_unit"
                style="width: 90px"
              >
                <el-option label="岁" :value="0" />
                <el-option label="月" :value="1" />
                <el-option label="周" :value="2" />
                <el-option label="天" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('inhospital_no')"
              prop="name"
              :label="getTempleteName('inhospital_no') || '住院号'"
            >
              <el-input
                v-model="templeteData.inhospital_no"
                placeholder="请输入住院号"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('gestation_week')"
              prop="name"
              :label="getTempleteName('gestation_week') || '孕周'"
            >
              <el-input
                v-model="templeteData.gestation_week"
                placeholder="请输入孕周"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('patient_phone')"
              prop="name"
              :label="getTempleteName('patient_phone') || '患者电话'"
            >
              <el-input
                v-model="templeteData.patient_phone"
                placeholder="请输入患者电话"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('medical_history')"
              prop="name"
              :label="getTempleteName('medical_history') || '患者病史'"
            >
              <el-input
                v-model="templeteData.medical_history"
                placeholder="请输入患者病史"
              ></el-input>
            </el-form-item>
            <!-- <el-form-item
              v-if="includeTemplete('patient_id')"
              prop="name"
              label="病例编号："
            >
              <el-input
                v-model="templeteData.patient_id"
                placeholder="请输入病例编号"
              ></el-input>
            </el-form-item> -->
            <el-form-item
              v-if="includeTemplete('prenatal_no')"
              prop="name"
              :label="getTempleteName('prenatal_no') || '产前编号'"
            >
              <el-input
                v-model="templeteData.prenatal_no"
                placeholder="请输入产前编号"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('health_no')"
              prop="name"
              :label="getTempleteName('health_no') || '健康号'"
            >
              <el-input
                v-model="templeteData.health_no"
                placeholder="请输入健康号"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('patient_comment')"
              prop="name"
              :label="getTempleteName('patient_comment') || '附加描述'"
            >
              <el-input
                v-model="templeteData.patient_comment"
                placeholder="请输入附加描述"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="
                includeTemplete('karyotype_image') ||
                includeTemplete('arrange_image')
              "
              prop="name"
              label="核型图选择"
            >
              <el-input
                v-model="templetekaryotype_data"
                readonly
                @click.native="selectImage"
                placeholder="核型图选择"
              ></el-input>
            </el-form-item>
            <!-- <el-form-item
              v-if="includeTemplete('karyotype_image')||includeTemplete('arrange_image')"
              prop="name"
              label="中期分裂相图:"
            >
              <el-input
                v-if="!templeteData.karyotype_image"
                v-model="templeteData.karyotype_image"
                @click.native="selectImage"
                placeholder="请选择中期分裂相图"
              ></el-input>
              <el-image
                v-else
                @click.native="selectImage"
                :src="templeteData.karyotype_image"
                style="width: 150px; height: 150px"
                alt=""
                lazy
              />
            </el-form-item>
            <el-form-item
              v-if="templeteData.arrange_image"
              prop="name"
              label="排列图："
            >
              <el-input
                v-if="!templeteData.arrange_image"
                v-model="templeteData.arrange_image"
                @click.native="selectImage"
                placeholder="请选择排列图"
              ></el-input> 
              <el-image
                @click.native="selectImage"
                :src="templeteData.arrange_image"
                style="width: 150px; height: 150px"
                alt=""
                lazy
              />
            </el-form-item> -->
            <el-form-item
              v-if="includeTemplete('karyotype_expression')"
              prop="name"
              :label="getTempleteName('karyotype_expression') || '核型表达式'"
            >
              <el-input
                type="textarea"
                autosize
                v-model="templeteData.karyotype_expression"
                placeholder="请输入核型表达式"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('cell_count_number')"
              prop="name"
              :label="getTempleteName('cell_count_number') || '计数细胞数'"
            >
              <el-input
                v-model="templeteData.cell_count_number"
                placeholder="请输入计数细胞数"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('cell_arrange_number')"
              prop="name"
              :label="getTempleteName('cell_arrange_number') || '排列细胞数'"
            >
              <el-input
                v-model="templeteData.cell_arrange_number"
                placeholder="请输入排列细胞数"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('cell_total')"
              prop="name"
              :label="getTempleteName('cell_total') || '细胞总数'"
            >
              <el-input
                v-model="templeteData.cell_total"
                placeholder="请输入细胞总数"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('sample_type')"
              prop="name"
              :label="getTempleteName('sample_type') || '样本类型'"
            >
              <el-select
                v-model="templeteData.sample_type"
                style="width: 220px"
              >
                <el-option label="外周血" value="G" />
                <el-option label="羊水" value="B" />
                <el-option label="精子库" value="D" />
                <el-option label="免费" value="F" />
                <el-option label="超声异常羊水刺穿" value="K" />
                <el-option label="超声异常引产" value="U" />
                <el-option label="复发流产" value="X" />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('collect_time')"
              :label="getTempleteName('collect_time') || '采集时间'"
            >
              <el-date-picker
                v-model="templeteData.collect_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择采集时间"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('send_doctor')"
              prop="name"
              :label="getTempleteName('send_doctor') || '送检医师'"
            >
              <el-input
                v-model="templeteData.send_doctor"
                placeholder="请输入送检医师"
              ></el-input> </el-form-item
            ><el-form-item
              v-if="includeTemplete('send_department')"
              prop="name"
              :label="getTempleteName('send_department') || '送检科室'"
            >
              <el-input
                v-model="templeteData.send_department"
                placeholder="请输入送检科室"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('receive_doctor')"
              prop="name"
              :label="getTempleteName('receive_doctor') || '接收医生'"
            >
              <el-input
                v-model="templeteData.receive_doctor"
                placeholder="请输入接收医生"
              ></el-input>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('receive_time')"
              :label="getTempleteName('receive_time') || '接收时间'"
            >
              <el-date-picker
                v-model="templeteData.receive_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择接收时间"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('check_reason')"
              prop="name"
              :label="getTempleteName('check_reason') || '检查原因'"
            >
              <el-input
                v-model="templeteData.check_reason"
                placeholder="请输入检查原因"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('check_method')"
              prop="name"
              :label="getTempleteName('check_method') || '检查方法'"
            >
              <el-select
                v-model="templeteData.check_method"
                style="width: 220px"
              >
                <el-option label="G显带" value="G" />
                <el-option label="Q显带" value="Q" />
                <el-option label="C显带" value="C" />
                <el-option label="R显带" value="R" />
                <el-option label="T显带" value="T" />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('check_time')"
              :label="getTempleteName('check_time') || '检验时间'"
            >
              <el-date-picker
                v-model="templeteData.check_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择检验时间"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('diagnosis_doctor')"
              prop="name"
              :label="getTempleteName('diagnosis_doctor') || '诊断医生'"
            >
              <el-input
                v-model="templeteData.diagnosis_doctor"
                placeholder="请输入诊断医生"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('review_doctor')"
              prop="name"
              :label="getTempleteName('review_doctor') || '审核医生'"
            >
              <el-input
                v-model="templeteData.review_doctor"
                placeholder="请输入审核医生"
              ></el-input>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('review_time')"
              :label="getTempleteName('review_time') || '审核时间'"
            >
              <el-date-picker
                v-model="templeteData.review_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择审核时间"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('diagnosis_desc')"
              prop="name"
              :label="getTempleteName('diagnosis_desc') || '诊断描述'"
            >
              <el-input
                v-model="templeteData.diagnosis_desc"
                placeholder="请输入诊断描述"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('clinical_basis')"
              prop="name"
              :label="getTempleteName('clinical_basis') || '临床描述'"
            >
              <el-input
                v-model="templeteData.clinical_basis"
                placeholder="请输入临床描述"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('clinical_diagnosis')"
              prop="name"
              :label="getTempleteName('clinical_diagnosis') || '临床诊断'"
            >
              <el-input
                v-model="templeteData.clinical_diagnosis"
                placeholder="请输入临床诊断"
              ></el-input>
            </el-form-item>
            <el-form-item
              prop="name"
              v-if="includeTemplete('report_time')"
              :label="getTempleteName('report_time') || '报告时间'"
            >
              <el-date-picker
                v-model="templeteData.report_time"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择报告时间"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('organization_name')"
              prop="name"
              :label="getTempleteName('organization_name') || '机构名称'"
            >
              <el-input
                v-model="templeteData.organization_name"
                placeholder="请输入机构名称"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('diagnosis_criterion')"
              prop="name"
              :label="getTempleteName('diagnosis_criterion') || '诊断标准'"
            >
              <el-input
                v-model="templeteData.diagnosis_criterion"
                placeholder="请输入诊断标准"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('prenatal_features')"
              prop="name"
              :label="getTempleteName('prenatal_features') || '产前诊断指征'"
            >
              <el-input
                v-model="templeteData.prenatal_features"
                placeholder="请输入产前诊断指征"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('diagnosis_basis')"
              prop="name"
              :label="getTempleteName('diagnosis_basis') || '诊断依据描述'"
            >
              <el-input
                v-model="templeteData.diagnosis_basis"
                placeholder="请输入诊断依据描述"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="includeTemplete('comment')"
              prop="name"
              :label="getTempleteName('comment') || '备注'"
            >
              <el-input
                v-model="templeteData.comment"
                placeholder="请输入备注"
              ></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="dialogVisible = false"
              >取 消</el-button
            >
            <el-button size="small" type="primary" @click="saveReport"
              >确 定</el-button
            >
            <el-button
              size="small"
              v-show="templeteData.id"
              type="primary"
              @click="GotoReport"
              >打印报告</el-button
            >
            <el-button
              size="small"
              v-show="templeteData.id"
              type="primary"
              @click="GotoLis"
              >发布到LIS</el-button
            >
          </span>
        </div>
      </el-dialog>

      <!-- 同源双号 -->
      <el-dialog
        class="modal1"
        :visible.sync="contrasts.visible"
        width="1100px"
        top="30px"
        :title="contrasts.title"
      >
        <karyotype-even
          :first="1"
          :second="2"
          @change="handleChangeNum"
          v-if="contrasts.visible"
        ></karyotype-even>
      </el-dialog>

      <!-- 同源单号 -->
      <el-dialog
        class="modal2"
        :visible.sync="contrasts.visible2"
        width="1110px"
        top="30px"
        :title="contrasts.title2"
      >
        <karyotype-odd
          :first="1"
          @change="handleChangeNum"
          v-if="contrasts.visible2"
        ></karyotype-odd>
      </el-dialog>

      <!-- 擦除 -->
      <template v-if="erase.show">
        <div class="xs-mask" @click.prevent="erase.show = false">
          <karyotype-erase
            v-if="erase.show"
            :source="erase.source"
            @change="getPhotoList"
          ></karyotype-erase>
        </div>
      </template>

      <!-- 放大缩小染色体 -->
      <template v-if="zoom.show">
        <div class="xs-mask" @click.prevent="zoom.show = false">
          <karyotype-zoom :source="zoom.source"></karyotype-zoom>
        </div>
      </template>

      <!-- 图像调整 -->
      <el-dialog
        :visible.sync="optimization.show"
        width="420px"
        title="图像调整"
      >
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <div :style="{ width: '60px' }">亮度</div>
          <div :style="{ width: '278px', marginRight: '15px', height: '16px' }">
            <input
              class="range"
              v-model.number="brightness"
              type="range"
              :min="0"
              :max="3"
              :step="0.1"
              :style="{ width: '100%' }"
            />
          </div>
          <div>{{ brightness }}</div>
        </div>
        <div
          :style="{ display: 'flex', alignItems: 'center', marginTop: '15px' }"
        >
          <div :style="{ width: '60px' }">对比度</div>
          <div :style="{ width: '278px', marginRight: '15px', height: '16px' }">
            <input
              class="range"
              v-model.number="contrast"
              type="range"
              :min="0"
              :max="3"
              :step="0.1"
              :style="{ width: '100%' }"
            />
          </div>
          <div>{{ contrast }}</div>
        </div>
        <el-row
          type="flex"
          align="middle"
          justify="end"
          :style="{ marginTop: '25px' }"
        >
          <el-button :loading="loading" plain @click="handleCloseOptimizeImage"
            >取消</el-button
          >
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSaveOptimizeImage"
            >确定</el-button
          >
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import WebHeader from "@/components/header";
import KaryotypeImages from "@/components/KaryotypeImages";
import KaryotypePreview from "@/components/karyotype/preview";
import KaryotypeEven from "@/components/karyotype/even";
import KaryotypeOdd from "@/components/karyotype/odd";
import KaryotypeErase from "@/components/karyotype/erase";
import KaryotypeZoom from "@/components/karyotype/zoom";
import KaryotypeOriginal from "@/components/karyotype/original";
import {
  ReleasePatient,
  GetChromosomeInfos,
  GetKaryotype,
  ConfirmCount,
  DeleteChromosome,
  FlipChromo,
  SetIstop,
  GetKaryotypeStatistic,
  GetPatientInformation,
  GetPublishedTempletes,
  getReport,
  getTemplete,
  GetKaryotypeAnalysisInfos,
  SaveReport,
  CancelCount,
  SaveKaryotype,
  CancelKaryotype,
  AddCountPoint,
  DeleteCountPoint,
  ClearCountPoint,
  SaveKaryotypeStatistic,
  SegmentChromo,
  EraseChromo,
  AutoAnalysisKaryo,
  ArrangeUnclassified,
  ReAutoAnalysis,
  ExportKaryotype,
  ReportToLis,
  EnterAnalysisPage,
  Undo,
  Redo,
  SetRecheck,
  MergeChrome,
  FlipInvertChromo,
  OptimizeImage,
  DeleteArrow,
} from "@/services/api";
import { PictureColorMarker } from "@/utils/dict";
export default {
  components: {
    WebHeader,
    KaryotypeImages,
    KaryotypePreview,
    KaryotypeEven,
    KaryotypeOdd,
    KaryotypeErase,
    KaryotypeZoom,
    KaryotypeOriginal,
  },
  data() {
    return {
      IsReportToLis: localStorage.report_lis,
      activeName: "",
      active: -1,
      map: null,
      canvas: null,
      edit: false,
      patient_id: "",
      loading: false,
      photoArray: [],
      token: sessionStorage.rst_token,
      dataArray: [],
      karyoData: null,
      statistic: null,
      patient: null,
      id: "",
      rst_id: "",
      key_id: new Date().getTime(),

      //模板
      dialogVisible: false,
      imageDialogVisible: false,
      templetes: [],
      templeteId: null,
      templetekaryotype_data: null,
      templeteData: {},
      templete: null,
      hideSex: 0,
      karyotypeImages: [],

      isShow: false,
      originArray: [],
      pointsArray: [],

      listArray: [],

      contrasts: {
        arr: [],
        title: "同号染色单体对比-1号染色体/2号染色体",
        visible: false,
        visible2: false,
        title2: "同号染色单体对比-1号染色体",
      },

      // 切割
      chromo: {
        arr: [],
        flag: false,
      },

      // 涂抹
      eraser: {
        arr: [],
        flag: false,
      },

      imageType: "optimization", // 原图优化图

      // 擦除
      erase: {
        show: false,
        source: null,
      },

      // 缩放
      scale: {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        value: 100,
        flag: false,
      },

      redArray: [],
      isMovie: false,

      scrollTop: 0,

      isCtrl: false,

      contrast: 1,
      brightness: 1,
      sharpness: 1,

      zoom: {
        show: false,
        source: null,
      },

      optimization: {
        show: false,
      },

      timeCount: 0,

      arrowId: "",
    };
  },
  mounted() {
    const that = this;
    const params = this.$route.params;
    const dataSource = sessionStorage.dataSource
      ? JSON.parse(sessionStorage.dataSource)
      : [];
    const imageType = sessionStorage.imageType || "0";
    this.isShow = imageType === "1" ? true : false;
    this.timeCount = new Date().getTime();
    this.dataArray = dataSource;
    this.patient_id = params.patient;
    this.id = params.id;
    const index = dataSource.findIndex((item) => item.id === params.id);
    setTimeout(() => {
      document.getElementById("imgList").scrollTop = index * 110;
    }, 50);
    this.getPatientInfo();

    // 绑定键盘事件
    document.onkeydown = (e) => {
      if (this.$route.name === "patient" && !this.dialogVisible) {
        console.log(e);

        // 上 + 左 上一张
        if (e.code === "ArrowUp" || e.code === "ArrowLeft") {
          that.handlePreviewPrev();
        }

        // 下 + 右 下一张
        if (e.code === "ArrowDown" || e.code === "ArrowRight") {
          that.handlePreviewNext();
        }

        // 删除染色体或箭头
        if (e.code === "Delete") {
          if (that.arrowId.length > 0) {
            this.$confirm("确定要删除箭头吗？", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }).then(() => {
              DeleteArrow(that.arrowId).then(() => {
                this.$message.success("删除成功");
                that.arrowId = "";
                that.getPhotoList(true);
              });
            });
          } else {
            that.handleDeleteChoromose();
          }
        }

        // 旋转
        if (!that.isShow && e.code === "KeyR") {
          that.handleRotateChromo();
        }

        // 左右镜像
        if (
          !that.isShow &&
          that.imageType === "optimization" &&
          e.code === "KeyA" &&
          this.active !== 19
        ) {
          that.handleFlipChromo();
        }

        // 上下左右镜像
        if (e.code === "KeyF" && this.active !== 19) {
          that.handleFlipInvertChromo();
        }

        // 擦除
        if (
          !that.isShow &&
          that.imageType === "optimization" &&
          e.code === "KeyE"
        ) {
          that.handleErase();
        }

        // 涂抹
        if (
          that.isShow &&
          that.imageType === "optimization" &&
          e.code === "KeyB"
        ) {
          that.handleClickEraser();
        }

        // 显示隐藏线段
        if (
          that.isShow &&
          that.imageType === "optimization" &&
          e.code === "KeyM"
        ) {
          that.handleShowOrHideBorder();
        }

        // 计数
        if (
          that.isShow &&
          that.imageType === "optimization" &&
          e.code === "KeyC"
        ) {
          that.handleClickCout();
        }

        // 放大缩小染色体
        if (
          !that.isShow &&
          that.imageType === "optimization" &&
          e.code === "KeyZ"
        ) {
          that.handleZoom();
        }

        // Ctrl
        if (e.ctrlKey) {
          that.isCtrl = true;
        }
      }
    };

    document.onkeyup = () => {
      if (this.$route.name === "patient" && !this.dialogVisible) {
        console.log("键盘弹起");
        that.isCtrl = false;
      }
    };
  },
  methods: {
    //更新左侧缩略图当前元素信息
    updateThumb() {
      const id = this.$route.params.id;
      const arr = this.dataArray;
      const index = arr.findIndex((item) => item.id === id);
      if (index >= 0) {
        const thumbInfo = arr[index];
        thumbInfo.progress = this.karyoData.progress; //更新处理进度信息
        thumbInfo.karyotype_expression = this.karyoData.karyotype_expression; //更新核型表达式信息
        thumbInfo.chromosome_count = this.karyoData.chromosome_count; //更新染色体计数信息
        //保存缩略图列表信息（否则上下页切换时看到的除了当前页面当前元素，列表中其它元素都是旧的信息）
        sessionStorage.dataSource = JSON.stringify(this.dataArray);
      }
    },

    // 获取病人信息
    getPatientInfo() {
      GetPatientInformation(this.patient_id)
        .then(({ data }) => {
          this.patient = data;
        })
        .then(() => {
          this.getKaryotype();
        });
    },

    // 获取核型图基础信息
    getKaryotype() {
      const loading = this.$loading({
        lock: true,
        text: "核型分析中......",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      GetKaryotype(this.id)
        .then(({ data }) => {
          let arr = [];
          data.count_points =
            data.count_points.length > 0 ? data.count_points.split(";") : [];
          if (data.count_points.length > 0) {
            data.count_points.map((item) => {
              const value = item.split(",");
              arr.push({
                x: Number(value[0]),
                y: Number(value[1]),
              });
            });
          }
          this.pointsArray = arr;
          this.karyoData = data;
          this.brightness = data.brightness;
          this.contrast = data.contrast;
          this.sharpness = data.sharpness;
          this.updateThumb();
          if (1 > data.progress) {
            AutoAnalysisKaryo(this.id)
              .then(() => {
                this.getKaryotype();
              })
              .catch((err) => {
                loading.close();
                this.$message.error(err);
              });
          } else {
            this.getPhotoList(false);
            this.getStatstic();
            loading.close();
          }
        })
        .catch((err) => {
          loading.close();
          this.$message.error(err);
        });
    },

    // 获取核型图统计信息
    getStatstic() {
      GetKaryotypeStatistic(this.patient_id)
        .then(({ data }) => {
          let arr1 = [];
          let total1 = 0;
          let arr2 = [];
          let total2 = 0;
          if (
            data.count_confirmed_detail &&
            data.count_confirmed_detail.length > 0
          ) {
            data.count_confirmed_detail.map((item, index) => {
              if (index % 2 === 0) {
                arr1.push({
                  label: `${item}条`,
                  value: data.count_confirmed_detail[index + 1],
                });
                total1 += data.count_confirmed_detail[index + 1];
              }
            });
          }
          if (
            data.expression_confirmed_detail &&
            data.expression_confirmed_detail.length > 0
          ) {
            data.expression_confirmed_detail.map((item, index) => {
              if (index % 2 === 0) {
                arr2.push({
                  label: item,
                  value: data.expression_confirmed_detail[index + 1],
                });
                total2 += data.expression_confirmed_detail[index + 1];
              }
            });
          }
          data.confirmed_detail = arr1;
          data.confirmed_total = total1;
          data.expression_confirmed = arr2;
          data.expression_total = total2;
          this.statistic = data;
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 获取核型图染色体列表信息
    getPhotoList(status) {
      GetChromosomeInfos(this.id)
        .then(({ data }) => {
          this.listArray = data;
          if (!this.activeName === "mark") {
            this.key_id = new Date().getTime();
          }
          this.reloadPhoto(status);
        })
        .then(() => {});
    },

    // 重新渲染排列
    reloadPhoto(status) {
      let boundary = [];
      let points = this.pointsArray;
      this.listArray.map((item) => {
        item.rotate = 0;
        if (item.count_point && item.count_point.length > 0) {
          let point = item.count_point.split(",");
          points.push({
            x: Number(point[0]),
            y: Number(point[1]),
          });
        }
        boundary.push({
          value: item.boundary.split(";").join(" "),
          id: item.id,
          karyotype_id: item.karyotype_id,
          points: item.count_point,
          image: status
            ? `${item.image_path}&token=${this.token}&t=${this.timeCount}`
            : `${item.image_path}&token=${
                this.token
              }&t=${new Date().getTime()}`,
          index: item.group_index,
          sort: item.group_sort,
          arrows: item.arrows,
        });
      });
      this.originArray = boundary;

      let arr = [];
      for (var i = 0; i <= 25; i++) {
        let item = this.originArray.filter((item) => item.index === i);
        arr.push(item);
      }
      let mar = this.originArray.filter((item) => item.index === -1);
      arr[25] = mar;
      this.photoArray = arr;
      this.$forceUpdate();
      this.showRedItems();
    },

    // 显示异常染色体
    showRedItems() {
      let arr = [];
      let yc = [];
      for (var i = 0; i <= 25; i++) {
        let item = this.originArray.filter((item) => item.index === i);
        arr.push(item);
      }
      let mar = this.originArray.filter((item) => item.index === -1);
      arr[25] = mar;
      arr.map((item, index) => {
        yc[index] = item.length !== 2 ? true : false;
        if (index === 23) {
          if (item.length === 1 || item.length === 2) {
            yc[index] = false;
          } else {
            yc[index] = true;
          }
        }
        if (index === 24) {
          if (item.length > 1) {
            yc[index] = true;
          } else {
            yc[index] = false;
          }
        }
        if (index === 25) {
          if (item.length > 0) {
            yc[index] = true;
          } else {
            yc[index] = false;
          }
        }
      });
      this.$nextTick(() => {
        this.redArray = yc;
      });
      this.loading = false;
    },

    // 获取待排区
    getArrangeUnclassified() {
      this.loading = true;
      let arr = this.listArray;
      console.log(arr);
      ArrangeUnclassified(this.id).then(({ data }) => {
        this.loading = false;
        this.karyoData.karyotype_expression = data.karyotype_expression;
        this.getPhotoList(false);
        this.updateThumb();
      });
    },

    // 水平翻转
    handleFlipInvertChromo() {
      if (this.rst_id.length === 0) {
        return this.$message.warning("请选择染色体");
      }
      FlipInvertChromo(this.rst_id).then(() => {
        this.reloadPhoto();
      });
    },

    // 回退
    handleUndo() {
      Undo().then(({ data }) => {
        if (data.is_do === 1) {
          this.key_id = new Date().getTime();
          this.getPatientInfo();
        }
      });
    },

    // 重做
    handleRedo() {
      Redo().then(({ data }) => {
        if (data.is_do === 1) {
          this.key_id = new Date().getTime();
          this.getPatientInfo();
        }
      });
    },

    // 鼠标滚轮事件
    handleMouseWhell(e) {
      e = e || window.event;
      if (e.wheelDelta > 0) {
        // 放大
        this.handleChangeScale("plus");
      } else {
        // 缩小
        this.handleChangeScale("minus");
      }
      // var scale = 1;
      // var minScale = 1;
      // var ulWidth = 1500;
      // var ulHeight = 1200;
      // var ul = document.getElementById("svg");
      // var maxScale = 2;
      // let ratio = 1.1;
      // // 缩小
      // if (e.deltaY > 0) {
      //   ratio = 1 / 1.1;
      // }
      // // 限制缩放倍数
      // const onscale = scale * ratio;
      // if (onscale > maxScale) {
      //   ratio = maxScale / scale;
      //   scale = maxScale;
      // } else if (onscale < minScale) {
      //   ratio = minScale / scale;
      //   scale = minScale;
      // } else {
      //   scale = onscale;
      // }
      // const origin = {
      //   x: (ratio - 1) * ulWidth * 0.5,
      //   y: (ratio - 1) * ulHeight * 0.5,
      // };
      // // 计算偏移量
      // x -=
      //   (ratio - 1) * (e.clientX - x - (window.innerWidth - ulWidth) * 0.5) -
      //   origin.x;
      // y -= (ratio - 1) * (e.clientY - y) - origin.y;
      // let offsetX = Math.min(
      //   Math.max(x, ulWidth - (ulWidth * (scale + 1)) / 2),
      //   (ulWidth * (scale - 1)) / 2
      // );
      // let offsetY = Math.min(
      //   Math.max(y, ulHeight - (ulHeight * (scale + 1)) / 2),
      //   (+ulHeight * (scale - 1)) / 2
      // );
      // x = offsetX;
      // y = offsetY;
      // ul.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${offsetX}, ${offsetY})`;
    },

    handleClickZoom() {
      this.active = this.active === 20 ? -1 : 20;
    },

    // 添加计数点
    handleAddPointer(e) {
      if (this.active === 13 && this.isShow) {
        let svg = this.$refs.svg;
        let pt = this.cursorPoint(e, svg);
        AddCountPoint({
          karyotype_id: this.id,
          x: Math.ceil(pt.x),
          y: Math.ceil(pt.y),
        })
          .then(({ data }) => {
            this.pointsArray.push({
              x: Math.ceil(pt.x),
              y: Math.ceil(pt.y),
            });
            this.karyoData.chromosome_count = data.chromosome_count;
            this.karyoData.karyotype_expression = data.karyotype_expression;
          })
          .catch((err) => {
            this.$message.error(err);
          });
      }
    },

    // 绑定右键删除计数点
    handleDeletePointer(item) {
      if (this.active === 13) {
        DeleteCountPoint({
          karyotype_id: this.id,
          x: item.x,
          y: item.y,
        }).then(({ data }) => {
          this.karyoData.chromosome_count = data.chromosome_count;
          this.karyoData.karyotype_expression = data.karyotype_expression;
          this.pointsArray.map((a, b) => {
            if (a.x === item.x && a.y === item.y) {
              this.pointsArray.splice(b, 1);
            }
          });
        });
      }
    },

    // 删除染色体
    handleDeleteChoromose() {
      if (this.rst_id.length === 0) {
        return this.$message.warning("请选择染色体");
      }
      this.$confirm("确定要删除染色体吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const loading = this.$loading({
          lock: true,
          text: "正在处理中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        DeleteChromosome(this.rst_id)
          .then(({ data }) => {
            this.$message.success("删除成功");
            this.karyoData.chromosome_count = data.chromosome_count;
            this.karyoData.karyotype_expression = data.karyotype_expression;
          })
          .then(() => {
            let idx = this.listArray.findIndex(
              (item) => item.id === this.rst_id
            );
            console.log(idx);
            if (idx > -1) {
              this.listArray.splice(idx, 1);
              this.rst_id = "";
              this.getKaryotype();
              loading.close();
            }
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },

    // 擦除染色体
    handleErase() {
      this.active = this.active === 15 ? -1 : 15;
      this.activeName = this.active === 15 ? "erase" : "";
    },

    // 放大缩小染色体
    handleZoom() {
      this.active = this.active === 20 ? -1 : 20;
    },

    // 显示或隐藏边框轮廓
    handleShowOrHideBorder() {
      this.active = this.active === 18 ? -1 : 18;
      this.rst_id = "";
    },

    // 箭头
    handleArrow() {
      this.active = this.active === 19 ? -1 : 19;
      this.activeName = this.active === 19 ? "mark" : "";
    },

    // 导出
    handleExportData() {
      this.loading = true;
      ExportKaryotype(this.id).then((res) => {
        this.loading = false;
        let blob = new Blob([res], { type: "application/zip" });
        let url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${this.karyoData.patient_id}_${this.karyoData.slide_code}_${this.karyoData.code}`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
    },

    // 清空计数
    handleClearCount() {
      this.$confirm("是否确定要清空计数?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        ClearCountPoint(this.id)
          .then(({ data }) => {
            this.pointsArray = [];
            this.chromo = {
              arr: [],
              flag: false,
            };
            this.eraser = {
              arr: [],
              flag: false,
            };
            this.karyoData.chromosome_count = data.chromosome_count;
            this.karyoData.karyotype_expression = data.karyotype_expression;
            this.$message.success("操作成功");
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },

    // 删除箭头
    handleDeleteArrow(row) {
      this.arrowId = row.id;
    },

    // 拖动结束
    handleDragEnd(e) {
      console.log(e);
      this.rst_id = "";
      this.karyoData.chromosome_count = e.chromosome_count;
      this.karyoData.karyotype_expression = e.karyotype_expression;
      // this.getStatstic();
      this.getPhotoList(false);
      this.key_id = new Date().getTime();
    },

    // 放大缩小
    handleChangeScale(type) {
      if (type === "plus") {
        this.scale.value += 10;
      } else {
        if (100 >= this.scale.value) {
          return;
        }
        this.scale.value -= 10;
      }
    },

    // 还原尺寸
    handleResetScale() {
      this.scale = {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        value: 100,
        flag: false,
      };
    },

    // 是否核验
    handleReCheck(val) {
      SetRecheck({
        karyotype_id: this.id,
        recheck: val,
      });
    },

    handleChangeNum(obj) {
      if (obj.type === 1) {
        this.contrasts.title2 = `同号染色单体对比-${obj.rows[0]}号染色体`;
      } else {
        this.contrasts.title = `同号染色单体对比-${obj.rows[0]}号染色体/${obj.rows[1]}号染色体`;
      }
    },

    handeSetTop(status) {
      SetIstop({
        karyotype_id: this.id,
        is_top: status === 0 ? 1 : 0,
      })
        .then(() => {
          this.$message.success(status === 0 ? "置顶成功" : "取消置顶");
          this.getKaryotype();
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 镜像
    handleFlipChromo() {
      if (this.rst_id.length === 0) {
        return this.$message.warning("请选择染色体");
      }
      FlipChromo(this.rst_id).then(() => {
        this.reloadPhoto();
      });
    },

    handleSelectItem(e) {
      this.rst_id = e.id;
      if (
        (this.active === 15 || this.active === 20) &&
        this.rst_id.length > 0
      ) {
        let arr = this.originArray.filter((item) => item.id === e.id);
        if (arr.length > 0) {
          arr[0].width = e.width;
          arr[0].height = e.height;
          arr[0].token = this.token;
          if (this.active === 20) {
            this.zoom.show = true;
            this.zoom.source = arr[0];
          } else {
            this.erase.show = true;
            this.erase.source = arr[0];
          }
        }
      }
      if (e.flag) {
        this.isShow = true;
      }
    },

    handleShowDialog(type) {
      if (type === 1) {
        this.contrasts.title2 = "同号染色单体对比-1号染色体";
        this.contrasts.visible2 = true;
      } else {
        this.contrasts.title = "同号染色单体对比-1号染色体/2号染色体";
        this.contrasts.visible = true;
      }
    },

    //获取发布的模板
    getPublishedTempletes() {
      GetPublishedTempletes({})
        .then((res) => {
          if (res.code == 200) {
            this.templetes = res.data;
            var selected = this.templetes.find((x) => x.is_default == 1);
            if (selected) {
              this.templeteId = selected.id;
              this.getReport(selected.id);
              this.initReport(true);
            } else if (this.templetes.length > 0) {
              this.templeteId = this.templetes[0].id;
              this.getReport(this.templetes[0].id);
              this.initReport(true);
            }
          } else {
            this.templetes = [];
          }
        })
        .catch((err) => {
          this.$message.error(err.msg);
        });
    },

    getReport(id) {
      getTemplete(id)
        .then((res) => {
          if (res.code == 200) {
            this.templete = JSON.parse(res.data.content);
            this.hideSex = res.data.hide_sex || 0;

            this.dialogVisible = true;
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    changTemplete() {
      this.initReport(false);
      this.getReport(this.templeteId);
    },

    includeTemplete(name) {
      return this.templete.find((x) => x.fileId == name) != null;
    },
    getTempleteName(name) {
      return (
        (this.templete.find((x) => x.fileId == name) &&
          this.templete
            .find((x) => x.fileId == name)
            .propValue.replace(":", "")
            .replace("：", "")) ||
        ""
      );
    },
    saveimageKaryo() {
      this.$refs.imageKaryo.returnImage();
    },

    returnKaryoData(data) {
      this.imageDialogVisible = false;
      if (data) {
        this.templeteData.karyotype_id = data.karyotype_id;
        this.templetekaryotype_data = data.slide_code + "/" + data.cell_code;
        this.templeteData.karyotype_expression = data.karyotype_expression;
        this.templeteData.karyotype_image = data.karyotype_image;
        this.templeteData.arrange_image = data.arrange_image;
      }
    },

    selectImage() {
      this.imageDialogVisible = true;
      // getOptimizeImage({
      //   karyotype_id: this.id,
      //   hide_sex: this.templete.hide_sex||0,
      // }).then(res=>{
      //   this.OptimizeImage=res;
      // })
      // getArrangeImage({
      //   karyotype_id: this.id,
      //   hide_sex: this.templete.hide_sex||0,
      // }).then(res=>{
      //   this.ArrangeImage=res;
      // })
    },

    initReport(isfresh) {
      getReport(this.patient_id)
        .then((res) => {
          if (res.code == 200) {
            this.templeteData = res.data;
            this.templeteData.patient_age_unit = 0;
            if (
              this.templeteData.templete_id &&
              this.templeteId != this.templeteData.templete_id &&
              isfresh == true
            ) {
              this.templeteId = this.templeteData.templete_id;
              this.getReport(this.templeteId);
            }
            if (this.templeteData.karyotype_id) {
              GetKaryotypeAnalysisInfos({
                patient_id: this.patient_id,
                templete_id: this.templeteId,
              }).then((ele) => {
                var dataArray = ele.data || [];
                var data = dataArray.find(
                  (x) => x.karyotype_id == this.templeteData.karyotype_id
                );
                this.templetekaryotype_data =
                  data.slide_code + "/" + data.cell_code;
              });
            }
          }
          this.dialogVisible = true;
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    saveReport() {
      if (this.loading == true) {
        return;
      }
      this.loading = true;
      const loading = this.$loading({
        lock: true,
        text: "loading...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      this.templeteData.templete_id = this.templeteId;
      this.templeteData.patient_id = this.patient_id;
      if (
        this.templeteData.review_time &&
        this.templeteData.review_time.indexOf("T") == -1
      )
        this.templeteData.review_time =
          this.templeteData.review_time + "T00:00:00";
      if (
        this.templeteData.check_time &&
        this.templeteData.check_time.indexOf("T") == -1
      )
        this.templeteData.check_time =
          this.templeteData.check_time + "T00:00:00";
      if (
        this.templeteData.report_time &&
        this.templeteData.report_time.indexOf("T") == -1
      )
        this.templeteData.report_time =
          this.templeteData.report_time + "T00:00:00";
      if (
        this.templeteData.collect_time &&
        this.templeteData.collect_time.indexOf("T") == -1
      )
        this.templeteData.collect_time =
          this.templeteData.collect_time + "T00:00:00";
      if (
        this.templeteData.receive_time &&
        this.templeteData.receive_time.indexOf("T") == -1
      )
        this.templeteData.receive_time =
          this.templeteData.receive_time + "T00:00:00";
      SaveReport(this.templeteData)
        .then((res) => {
          this.loading = false;
          if (res.code == 200) {
            // this.dialogVisible = false;
            this.$message.success("保存成功");
            this.templeteData.id = res.data || "";
            GetPatientInformation(this.patient_id).then(({ data }) => {
              this.patient = data;
            });
            loading.close();
            // let routeData = this.$router.resolve({
            //   name: "Report",
            //   params: { id: this.patient_id, hideSex: this.hideSex },
            // });
            // window.open(routeData.href, "_blank");
            // this.$router.push({ name: "Report", params: { id: reportId } });
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          loading.close();
          this.loading = false;
          this.$message.error(err);
        });
    },

    GotoReport() {
      this.$router.push({
        name: "Report",
        params: { id: this.patient_id, hideSex: this.hideSex },
      });
      // window.open(routeData.href, "_blank");
    },
    GotoLis() {
      this.loading = true;
      const loading = this.$loading({
        lock: true,
        text: "发布到LIS...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      ReportToLis(this.patient_id)
        .then((res) => {
          loading.close();
          this.loading = false;
          if (res.code == 200) {
            // this.dialogVisible = false;
            this.$message({
              type: "success",
              message: "发布成功",
              offset: 300,
            });
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((err) => {
          loading.close();
          this.loading = false;
          this.$message.error(err);
        });
    },

    viewDetail(id) {
      // getTemplete(id).then(({ data }) => {
      //   this.statistic = data;
      // });
      this.$router.push({ name: "Home", params: { id: id } });
    },

    // 上一张
    handlePreviewPrev() {
      const id = this.$route.params.id;
      const arr = this.dataArray;
      const index = arr.findIndex((item) => item.id === id);
      console.log(index);
      if (index === 0) {
        return;
      }
      EnterAnalysisPage().then(() => {
        this.$router.push(`/detail/${this.patient_id}/${arr[index - 1].id}`);
      });
    },

    // 下一张
    handlePreviewNext() {
      const id = this.$route.params.id;
      const arr = this.dataArray;
      const index = arr.findIndex((item) => item.id === id);
      console.log(index, arr.length - 1);
      if (index === arr.length - 1) {
        this.getKaryotype();
        this.getStatstic();
        return;
      }
      EnterAnalysisPage().then(() => {
        this.$router.push(`/detail/${this.patient_id}/${arr[index + 1].id}`);
      });
    },

    // 确认计数
    handleConfirmCount() {
      const loading = this.$loading({
        lock: true,
        text: "请求中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      ConfirmCount(this.id)
        .then(() => {
          loading.close();
          // this.getKaryotype();
          // this.getStatstic();
          const index = this.dataArray.findIndex((item) => item.id === this.id);
          if (index > -1) {
            this.dataArray[index].progress = 2;
          }
          sessionStorage.dataSource = JSON.stringify(this.dataArray);
          this.$message.success("操作成功");
          this.handlePreviewNext();
        })
        .catch((err) => {
          loading.close();
          this.$message.error(err);
        });
    },

    // 取消确认计数
    handleCancelCount() {
      this.$confirm("是否确定要取消计数?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        CancelCount(this.id)
          .then(() => {
            this.getKaryotype();
            this.getStatstic();
            this.$message.success("操作成功");
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },

    // 取消确认分析
    handleCancelKaryotype() {
      this.$confirm("是否确定要取消分析?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        CancelKaryotype(this.id)
          .then(() => {
            this.getKaryotype();
            this.getStatstic();
            this.$message.success("操作成功");
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },

    // 确认分析
    handleSaveKaryotype() {
      SaveKaryotype(this.id)
        .then(() => {
          // this.getKaryotype();
          // this.getStatstic();
          const index = this.dataArray.findIndex((item) => item.id === this.id);
          if (index > -1) {
            this.dataArray[index].progress = 3;
          }
          sessionStorage.dataSource = JSON.stringify(this.dataArray);
          this.$message.success("操作成功");
          this.handlePreviewNext();
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 重新自动分析
    handleResetKaryotype() {
      this.$confirm("是否确定重新自动分析?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        ReAutoAnalysis(this.id)
          .then(() => {
            this.getKaryotype();
            this.getStatstic();
            this.$message.success("操作成功");
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },

    // 保存图像优化
    handleSaveOptimizeImage() {
      this.loading = true;
      OptimizeImage({
        karyotype_id: this.id,
        contrast: this.contrast,
        brightness: this.brightness,
      })
        .then(() => {
          this.loading = false;
          this.optimization.show = false;
        })
        .catch((err) => {
          this.loading = false;
          this.$message.error(err);
        });
    },

    handleCloseOptimizeImage() {
      this.contrast = 1;
      this.brightness = 1;
      this.optimization.show = false;
    },

    getColor(index) {
      return PictureColorMarker(index);
    },

    handleRotateChromo() {
      if (this.active === 30) {
        this.active = -1;
        this.activeName = "";
      } else {
        this.active = 30;
        this.activeName = "rotate";
      }
      this.rst_id = "";
    },

    handleTiaodai() {
      if (this.active === 32) {
        this.active = -1;
        this.activeName = "";
      } else {
        this.active = 32;
        this.activeName = "tiaodai";
      }
      this.rst_id = "";
    },

    handleDingdai() {
      if (this.active === 33) {
        this.active = -1;
        this.activeName = "";
      } else {
        this.active = 33;
        this.activeName = "dingdai";
      }
      this.rst_id = "";
    },

    handleClickCout() {
      this.chromo = {
        arr: [],
        flag: false,
      };
      if (this.active === 13) {
        this.active = -1;
      } else {
        this.active = 13;
      }
    },

    handleClickEraser() {
      this.rst_id = "";
      this.chromo = {
        arr: [],
        flag: false,
      };
      if (this.active === 14) {
        this.active = -1;
      } else {
        this.active = 14;
      }
    },

    // 鼠标按下
    handleMouseSvgDown(e) {
      console.log(e);
      e.preventDefault();

      // 切割
      if (
        !this.chromo.flag &&
        this.rst_id.length > 0 &&
        this.active === -1 &&
        this.imageType === "optimization"
      ) {
        this.chromo.flag = true;
      }

      // 涂抹
      if (
        !this.eraser.flag &&
        this.active === 14 &&
        this.imageType === "optimization"
      ) {
        this.eraser.flag = true;
      }

      // 平移画布
      if (!this.scale.flag && this.rst_id.length === 0 && this.active !== 14) {
        this.scale.x = this.getMousePos(e).x;
        this.scale.y = this.getMousePos(e).y;
        this.scale.flag = true;
        this.isMovie = true;
      }
    },

    getMousePos(event) {
      const e = event || window.event;
      const x = e.clientX - document.getElementById("preview").offsetLeft;
      const y = e.clientY - document.getElementById("preview").offsetTop;
      return { x: x, y: y };
    },

    // 原图优化图切换
    handleSwitchImage() {
      this.scale = {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        value: 100,
        flag: false,
      };
      this.active = -1;
    },

    // 鼠标移动
    handleSvgMouseMove(e) {
      e.preventDefault();
      // 切割
      if (
        this.chromo.flag &&
        this.rst_id.length > 0 &&
        this.active === -1 &&
        this.imageType === "optimization"
      ) {
        let svg = this.$refs.svg;
        let pt = this.cursorPoint(e, svg);
        this.chromo.arr.push(`${Math.ceil(pt.x)},${Math.ceil(pt.y)}`);
      }

      // 涂抹
      if (
        this.active === 14 &&
        this.eraser.flag &&
        this.imageType === "optimization"
      ) {
        let svg = this.$refs.svg;
        let pt = this.cursorPoint(e, svg);
        this.eraser.arr.push(`${Math.ceil(pt.x)},${Math.ceil(pt.y)}`);
      }

      // 平移
      if (this.isMovie && this.scale.flag && this.active !== 14) {
        const mosPostion = this.getMousePos(e);
        const svg = document.getElementById("svg");
        let x = mosPostion.x - this.scale.x;
        let y = mosPostion.y - this.scale.y;
        let moveX = Number(svg.style.left.split("px")[0]);
        let moveY = Number(svg.style.top.split("px")[0]);
        moveX += x;
        moveY += y;
        this.scale.left = moveX;
        this.scale.top = moveY;
        this.scale.x = this.getMousePos(e).x;
        this.scale.y = this.getMousePos(e).y;
      }
    },

    // 鼠标弹起
    handleSvgMouseUp(e) {
      console.log("鼠标弹起");
      e.preventDefault();
      // 切割
      if (
        this.chromo.flag &&
        this.rst_id.length > 0 &&
        this.active === -1 &&
        this.imageType === "optimization"
      ) {
        this.chromo.flag = false;
        let arr = this.chromo.arr.filter((item) => item.length > 0);
        if (arr.length > 2) {
          const loading = this.$loading({
            lock: true,
            text: "正在处理中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          SegmentChromo({
            chromosome_id: this.rst_id,
            boundary: arr.join(";"),
          })
            .then(({ data }) => {
              this.chromo = {
                arr: [],
                flag: false,
              };
              // this.listArray.splice(idx, 1);
              // this.listArray.push.apply(this.listArray, data.new_chromosomes);
              this.karyoData.chromosome_count = data.chromosome_count;
              this.karyoData.karyotype_expression = data.karyotype_expression;
              this.rst_id = "";
              this.getKaryotype();
              loading.close();
            })
            .then(() => {})
            .catch((err) => {
              this.chromo = {
                arr: [],
                flag: false,
              };
              this.$message.error(err);
              loading.close();
            });
        }
      }

      // 涂抹
      if (
        this.eraser.flag &&
        this.active === 14 &&
        this.imageType === "optimization"
      ) {
        const loading = this.$loading({
          lock: true,
          text: "正在处理中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        this.eraser.flag = false;
        EraseChromo({
          karyotype_id: this.id,
          brush_path: this.eraser.arr.join(";"),
          brush_radius: 8,
        })
          .then(({ data }) => {
            this.eraser.arr = [];
            // this.listArray.push(data.new_chromosome);
            this.karyoData.chromosome_count = data.chromosome_count;
            this.getPhotoList(false);
            // this.handleClickEraser();
            loading.close();
          })
          .catch((err) => {
            this.eraser.arr = [];
            this.$message.error(err);
            loading.close();
          });
      }

      // 平移
      if (this.scale.flag && this.isMovie && this.active !== 14) {
        this.scale.flag = false;
        this.isMovie = false;
      }
    },

    cursorPoint(evt, svg) {
      let pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    },

    handleUpdateKaryotype() {
      SaveKaryotypeStatistic({
        karyotype_id: this.id,
        karyotype_expression: this.karyoData.karyotype_expression,
      }).catch((err) => {
        this.$message.error(err);
      });
    },

    handleSelectChromoItem(item) {
      if (this.active === -1) {
        if (item.id === this.rst_id) {
          this.rst_id = "";
        } else {
          if (
            this.isCtrl &&
            this.rst_id.length > 0 &&
            item.id.length > 0 &&
            this.rst_id !== item.id
          ) {
            // 合并染色体
            console.log(this.rst_id, item.id);
            MergeChrome({
              chromosome_id1: this.rst_id,
              chromosome_id2: item.id,
            })
              .then(({ data }) => {
                this.karyoData.karyotype_expression = data.karyotype_expression;
                this.karyoData.chromosome_count = data.chromosome_count;
                this.rst_id = "";
                this.getKaryotype();
              })
              .catch((err) => {
                this.$message.error(err);
              });
          } else {
            this.rst_id = item.id;
          }
        }
      }
    },

    handleDbChromoItem(item) {
      this.rst_id = item.id;
      this.isShow = !this.isShow;
    },

    handelSwitchImage() {
      this.isShow = !this.isShow;
      this.imageType = "optimization";
      this.activeName = "";
      this.active = -1;
      sessionStorage.imageType = this.isShow ? 1 : 0;
    },

    parseSimpleType(type) {
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
  },
  destroyed() {
    console.log("离开页面");
  },
  beforeRouteLeave(to, from, next) {
    ReleasePatient(this.patient_id); //释放锁定
    next();
  },
};
</script>
<style lang="scss" scoped>
.rst-page {
  height: 100vh;
  background-color: #070517;
  overflow: hidden;

  .container {
    height: calc(100vh - 60px);
    overflow: hidden;
    display: flex;

    .col-l {
      width: 220px;
      border: solid 1px rgba(255, 255, 255, 0.3);
      margin-left: 10px;

      .history {
        color: #fff;
        padding-top: 14px;

        .item {
          display: flex;
          align-items: center;
          padding-bottom: 10px;

          .label {
            width: 90px;
            text-align: right;
          }
        }
      }

      .analysis {
        clear: both;
        overflow: hidden;

        .section {
          padding: 30px 15px 15px;

          .title {
            color: red;
          }

          .current {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #158afe;
            padding-top: 15px;
            font-size: 40px;
            font-weight: bold;

            &::before {
              content: attr(data-text);
              font-size: 16px;
              color: #00bfbf;
              margin-bottom: 5px;
              font-weight: normal;
            }
          }

          .input-box {
            height: 52px;
            text-align: center;
            background-color: transparent;
            font-size: 40px;
            color: #158afe;
            border-width: 0;
            outline-style: none;
            font-weight: bold;
            width: 100%;
            border-bottom: solid 2px #158afe;
          }
        }
      }

      .statistics {
        clear: both;
        overflow: hidden;
        padding: 30px 15px 15px;

        .title {
          color: red;
          padding-bottom: 13px;
        }

        .item {
          display: flex;
          align-items: center;
          height: 26px;
          color: #00bfbf;
          margin-top: 2px;
          font-weight: bold;

          &::before {
            content: attr(data-label);
            color: #fff;
            width: 70px;
            text-align: right;
            margin-right: 5px;
            font-weight: normal;
          }

          &::after {
            content: attr(data-unit);
            color: #fff;
            margin-left: 5px;
            font-weight: normal;
          }
        }
      }
    }

    .preview {
      background-color: #fff;
      overflow: hidden;
      position: relative;
      flex: 1;
      width: 1%;
      min-width: 1200px;

      .btn-panel {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10;
      }

      .svg {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;

        path {
          stroke: blue;
          stroke-width: 2;
          stroke-opacity: 1;

          &:hover {
            stroke: red;
          }

          &.active {
            stroke: green;

            &:hover {
              stroke: red;
            }
          }

          &.selected {
            stroke: red;
          }
        }
      }

      .scale-btn {
        position: absolute;
        right: 140px;
        bottom: 20px;
        z-index: 10;
      }
    }

    .col-r {
      width: 320px;
      margin-left: 10px;

      .box {
        border-bottom: solid 1px rgba(255, 255, 255, 0.2);
        background-color: #fff;
        height: 260px;

        .item {
          background-color: #fff;
          width: 100%;
        }

        /deep/.karyotype-preview-component {
          height: 260px;
          background-color: #fff;
          overflow: hidden;
          overflow-y: auto;
          position: relative;

          .item-box {
            min-height: 50px;
            padding: 0 5px;

            .item-component {
              margin: 0 3px 20px;
              min-height: auto;

              .group {
                img {
                  zoom: 0.2;
                  border-width: 1px;
                }
              }

              &::after {
                font-size: 12px;
                line-height: 24px;
                bottom: -24px;
              }
            }

            &:nth-child(1) {
              .item-component {
                &:nth-child(4) {
                  margin-left: 10%;
                }
              }
            }

            &:nth-child(3) {
              .item-component {
                &:nth-child(4) {
                  margin-left: 10%;
                }
              }
            }

            &:nth-child(4) {
              .item-component {
                &:nth-child(5) {
                  margin-left: 10%;
                }
              }
            }

            &:nth-child(5) {
              .item-component {
                margin-bottom: 5px;
              }
            }
          }

          &::before {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            background-color: rgba(0, 0, 0, 0);
            content: "";
          }
        }
      }

      .btn-panel-2 {
        display: flex;
        border-bottom: solid 2px #555;
        flex-wrap: wrap;
        justify-content: space-between;
        padding-bottom: 10px;

        .el-button {
          width: calc(100% / 3 - 5px);
          margin: 7px 0 0 0;
          padding: 0;
          height: 40px;
        }
      }
      .danger-btn {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: -webkit-linear-gradient(left, #cf4ce5, #f94a74);
        border-width: 0;
      }
    }

    .image-list {
      overflow: hidden;
      overflow-y: auto;
      margin-right: 10px;

      &::-webkit-scrollbar {
        width: 0;
      }

      .item {
        width: 100px;
        height: 100px;
        background-color: #fff;
        margin-bottom: 10px;
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
            border: solid 4px #158afe;
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
    .xs-mask {
      background-color: rgba(0, 0, 0, 0.5);
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }
  }

  /deep/ .modal2 .el-dialog__body {
    padding: 20px 0 0 20px;
  }

  /deep/ .modal1 .el-dialog__body {
    padding: 20px;
  }
}

/deep/ .el-form-item__label {
  color: #606266 !important;
}
</style>
