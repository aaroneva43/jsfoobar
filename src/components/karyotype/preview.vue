<template>
  <div class="karyotype-preview-component" @click.stop="handleHidePanel">
    <!-- 1-5 -->
    <div class="item-box">
      <template v-for="(item, index) in rows">
        <template v-if="index >= 1 && 5 >= index">
          <draggable
            group="my-group"
            class="item-component"
            :class="{ error: red[index] }"
            :data-index="index"
            :disabled="
              flag === 'rotate' ||
              flag === 'mark' ||
              flag === 'tiaodai' ||
              flag === 'dingdai'
            "
            :key="index + 10"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template v-if="item.length > 0">
              <template v-for="(a, b) in item">
                <div
                  class="group"
                  :data-id="a.id"
                  :data-index="a.index"
                  :data-sort="a.sort"
                  :key="b"
                >
                  <div
                    class="group-box"
                    :class="{ active: a.id === kid }"
                    :id="`c_${a.id}`"
                    @mousedown.stop="handleClickRow(a, b, $event, false, index)"
                    @dblclick.stop="handleClickRow(a, b, $event, true, index)"
                  >
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image}`"
                      :style="{
                        filter: `brightness(${brightness}) contrast(${contrast})`,
                      }"
                    />
                    <template v-if="a.arrows.length > 0 && type === 'big'">
                      <template v-for="(c, d) in a.arrows">
                        <div
                          class="arrow"
                          :class="{ right: c.direction === 'left' }"
                          :key="d"
                          :style="{
                            top: `${c.offset_y}px`,
                            left: `${
                              c.direction === 'right'
                                ? c.offset_x + 'px'
                                : 'auto'
                            }`,
                            right: `${
                              c.direction === 'right'
                                ? 'auto'
                                : c.offset_x + 'px'
                            }`,
                          }"
                          @mousedown.stop="handleEditMark(c)"
                        >
                          <template v-if="c.direction === 'left'">
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                            <img
                              src="../../assets/arrow-right.svg"
                              class="icon"
                              alt=""
                            />
                          </template>
                          <template v-else>
                            <img
                              src="../../assets/arrow-left.svg"
                              class="icon"
                              alt=""
                            />
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                </div>
              </template>
            </template>

            <!-- 条带 -->
            <div
              class="tiaodai"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove($event, `Chrom0${index}ISCN09`, chromoScale)
              "
              v-if="flag === 'tiaodai'"
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom0${index}ISCN09.jpg`)
                "
                :title="tip"
                :height="`${chromo[chromoType][index - 1][1] * chromoScale}`"
              />
            </div>

            <!-- 定带 -->
            <div
              class="dingdai"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove(
                  $event,
                  `Chrom0${index}ISCN09`,
                  eventStatus(index)[0].scale
                )
              "
              v-if="flag === 'dingdai' && eventStatus(index).length > 0"
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom0${index}ISCN09.jpg`)
                "
                :title="tip"
                :height="`${
                  chromo[chromoType][index - 1][1] * eventStatus(index)[0].scale
                }`"
              />
            </div>
          </draggable>
        </template>
      </template>
    </div>

    <!-- 6-12 -->
    <div class="item-box">
      <template v-for="(item, index) in rows">
        <template v-if="index >= 6 && 12 >= index">
          <draggable
            group="my-group"
            class="item-component"
            :class="{ error: red[index] }"
            :data-index="index"
            :disabled="
              flag === 'rotate' ||
              flag === 'mark' ||
              flag === 'tiaodai' ||
              flag === 'dingdai'
            "
            :key="index + 20"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template v-if="item.length > 0">
              <template v-for="(a, b) in item">
                <div
                  class="group"
                  :data-id="a.id"
                  :data-index="a.index"
                  :data-sort="a.sort"
                  :key="b"
                >
                  <div
                    class="group-box"
                    :class="{ active: a.id === kid }"
                    :id="`c_${a.id}`"
                    @mousedown.stop="handleClickRow(a, b, $event, false, index)"
                    @dblclick.stop="handleClickRow(a, b, $event, true, index)"
                  >
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image}`"
                      :style="{
                        filter: `brightness(${brightness}) contrast(${contrast})`,
                      }"
                    />
                    <template v-if="a.arrows.length > 0 && type === 'big'">
                      <template v-for="(c, d) in a.arrows">
                        <div
                          class="arrow"
                          :class="{ right: c.direction === 'left' }"
                          :key="d"
                          :style="{
                            top: `${c.offset_y}px`,
                            left: `${
                              c.direction === 'right'
                                ? c.offset_x + 'px'
                                : 'auto'
                            }`,
                            right: `${
                              c.direction === 'right'
                                ? 'auto'
                                : c.offset_x + 'px'
                            }`,
                          }"
                          @mousedown.stop="handleEditMark(c)"
                        >
                          <template v-if="c.direction === 'left'">
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                            <img
                              src="../../assets/arrow-right.svg"
                              class="icon"
                              alt=""
                            />
                          </template>
                          <template v-else>
                            <img
                              src="../../assets/arrow-left.svg"
                              class="icon"
                              alt=""
                            />
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                </div>
              </template>
            </template>

            <!-- 条带 -->
            <div
              class="tiaodai"
              v-if="flag === 'tiaodai'"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove(
                  $event,
                  `Chrom${10 > index ? '0' + index : index}ISCN09`,
                  chromoScale
                )
              "
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom${
                    10 > index ? '0' + index : index
                  }ISCN09.jpg`)
                "
                :title="tip"
                :height="`${chromo[chromoType][index - 1][1] * chromoScale}`"
              />
            </div>

            <!-- 定带 -->
            <div
              class="dingdai"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove(
                  $event,
                  `Chrom${10 > index ? '0' + index : index}ISCN09`,
                  eventStatus(index)[0].scale
                )
              "
              v-if="flag === 'dingdai' && eventStatus(index).length > 0"
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom${
                    10 > index ? '0' + index : index
                  }ISCN09.jpg`)
                "
                :title="tip"
                :height="`${
                  chromo[chromoType][index - 1][1] * eventStatus(index)[0].scale
                }`"
              />
            </div>
          </draggable>
        </template>
      </template>
    </div>

    <!-- 13-18 -->
    <div class="item-box">
      <template v-for="(item, index) in rows">
        <template v-if="index >= 13 && 18 >= index">
          <draggable
            group="my-group"
            class="item-component"
            :class="{ error: red[index] }"
            :data-index="index"
            :disabled="
              flag === 'rotate' ||
              flag === 'mark' ||
              flag === 'tiaodai' ||
              flag === 'dingdai'
            "
            :key="index + 30"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template v-if="item.length > 0">
              <template v-for="(a, b) in item">
                <div
                  class="group"
                  :data-id="a.id"
                  :data-index="a.index"
                  :data-sort="a.sort"
                  :key="b"
                >
                  <div
                    class="group-box"
                    :class="{ active: a.id === kid }"
                    :id="`c_${a.id}`"
                    @mousedown.stop="handleClickRow(a, b, $event, false, index)"
                    @dblclick.stop="handleClickRow(a, b, $event, true, index)"
                  >
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image}`"
                      :style="{
                        filter: `brightness(${brightness}) contrast(${contrast})`,
                      }"
                    />
                    <template v-if="a.arrows.length > 0 && type === 'big'">
                      <template v-for="(c, d) in a.arrows">
                        <div
                          class="arrow"
                          :class="{ right: c.direction === 'left' }"
                          :key="d"
                          :style="{
                            top: `${c.offset_y}px`,
                            left: `${
                              c.direction === 'right'
                                ? c.offset_x + 'px'
                                : 'auto'
                            }`,
                            right: `${
                              c.direction === 'right'
                                ? 'auto'
                                : c.offset_x + 'px'
                            }`,
                          }"
                          @mousedown.stop="handleEditMark(c)"
                        >
                          <template v-if="c.direction === 'left'">
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                            <img
                              src="../../assets/arrow-right.svg"
                              class="icon"
                              alt=""
                            />
                          </template>
                          <template v-else>
                            <img
                              src="../../assets/arrow-left.svg"
                              class="icon"
                              alt=""
                            />
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                </div>
              </template>
            </template>

            <!-- 条带 -->
            <div
              class="tiaodai"
              v-if="flag === 'tiaodai'"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove($event, `Chrom${index}ISCN09`, chromoScale)
              "
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom${index}ISCN09.jpg`)
                "
                :title="tip"
                :height="`${chromo[chromoType][index - 1][1] * chromoScale}`"
              />
            </div>

            <!-- 定带 -->
            <div
              class="dingdai"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove(
                  $event,
                  `Chrom${index}ISCN09`,
                  eventStatus(index)[0].scale
                )
              "
              v-if="flag === 'dingdai' && eventStatus(index).length > 0"
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom${index}ISCN09.jpg`)
                "
                :title="tip"
                :height="`${
                  chromo[chromoType][index - 1][1] * eventStatus(index)[0].scale
                }`"
              />
            </div>
          </draggable>
        </template>
      </template>
    </div>

    <!-- 19-24,Mar -->
    <div class="item-box">
      <template v-for="(item, index) in rows">
        <template v-if="index >= 19 && 25 >= index">
          <draggable
            group="my-group"
            class="item-component"
            :class="{ error: red[index] }"
            :data-index="
              index === 23
                ? 'X'
                : index === 24
                ? 'Y'
                : index === 25
                ? 'mar'
                : index
            "
            :disabled="
              flag === 'rotate' || flag === 'mark' || flag === 'tiaodai'
            "
            :key="index + 40"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template v-if="item.length > 0">
              <template v-for="(a, b) in item">
                <div
                  class="group"
                  :data-id="a.id"
                  :data-index="a.index"
                  :data-sort="a.sort"
                  :key="b"
                >
                  <div
                    class="group-box"
                    :class="{ active: a.id === kid }"
                    :id="`c_${a.id}`"
                    @mousedown.stop="handleClickRow(a, b, $event, false, index)"
                    @dblclick.stop="handleClickRow(a, b, $event, true, index)"
                  >
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image}`"
                      :style="{
                        filter: `brightness(${brightness}) contrast(${contrast})`,
                      }"
                    />
                    <template v-if="a.arrows.length > 0 && type === 'big'">
                      <template v-for="(c, d) in a.arrows">
                        <div
                          class="arrow"
                          :class="{ right: c.direction === 'left' }"
                          :key="d"
                          :style="{
                            top: `${c.offset_y}px`,
                            left: `${
                              c.direction === 'right'
                                ? c.offset_x + 'px'
                                : 'auto'
                            }`,
                            right: `${
                              c.direction === 'right'
                                ? 'auto'
                                : c.offset_x + 'px'
                            }`,
                          }"
                          @mousedown.stop="handleEditMark(c)"
                        >
                          <template v-if="c.direction === 'left'">
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                            <img
                              src="../../assets/arrow-right.svg"
                              class="icon"
                              alt=""
                            />
                          </template>
                          <template v-else>
                            <img
                              src="../../assets/arrow-left.svg"
                              class="icon"
                              alt=""
                            />
                            <template v-if="c.edit">
                              <input
                                v-model="c.comment"
                                type="text"
                                class="input-box"
                                placeholder="请输入"
                                @blur.stop="saveArrow(c)"
                              />
                            </template>
                            <template v-else>
                              <div>{{ c.comment }}</div>
                            </template>
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                </div>
              </template>
            </template>

            <!-- 条带 -->
            <div
              class="tiaodai"
              v-if="flag === 'tiaodai'"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove(
                  $event,
                  `Chrom${
                    index === 23 ? 'X' : index === 24 ? 'Y' : index
                  }ISCN09`,
                  chromoScale
                )
              "
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom${
                    index === 23 ? 'X' : index === 24 ? 'Y' : index
                  }ISCN09.jpg`)
                "
                :title="tip"
                :height="`${chromo[chromoType][index - 1][1] * chromoScale}`"
                v-if="index >= 19 && 24 >= index"
              />
            </div>

            <!-- 定带 -->
            <div
              class="dingdai"
              @contextmenu.stop="handleContextmenu"
              @mousemove.stop="
                handleMouseMove(
                  $event,
                  `Chrom${
                    index === 23 ? 'X' : index === 24 ? 'Y' : index
                  }ISCN09`,
                  eventStatus(index)[0].scale
                )
              "
              v-if="flag === 'dingdai' && eventStatus(index).length > 0"
            >
              <img
                :src="
                  require(`../../assets/chromo/${chromoType}/Chrom${
                    index === 23 ? 'X' : index === 24 ? 'Y' : index
                  }ISCN09.jpg`)
                "
                :title="tip"
                :height="`${
                  chromo[chromoType][index - 1][1] * eventStatus(index)[0].scale
                }`"
                v-if="index >= 19 && 24 >= index"
              />
            </div>
          </draggable>
        </template>
      </template>
    </div>

    <!-- 待排区 -->
    <div class="item-box">
      <template v-for="(item, index) in rows">
        <template v-if="index === 0">
          <draggable
            class="item-component"
            group="my-group"
            data-index=""
            :disabled="
              flag === 'rotate' || flag === 'mark' || flag === 'tiaodai'
            "
            :key="index + 50"
            @start="handleDragStart"
            @end="handleDragEnd"
          >
            <template v-if="item.length > 0">
              <template v-for="(a, b) in item">
                <div
                  class="group"
                  :data-id="a.id"
                  :data-index="a.index"
                  :data-sort="a.sort"
                  :key="b"
                >
                  <div
                    class="group-box"
                    :class="{ active: a.id === kid }"
                    :id="`c_${a.id}`"
                    @mousedown.stop="handleClickRow(a, b, $event, false, index)"
                    @dblclick.prevent="
                      handleClickRow(a, b, $event, true, index)
                    "
                  >
                    <img
                      :src="`${Host}/api/get_image/?image_path=${a.image}`"
                      :style="{
                        filter: `brightness(${brightness}) contrast(${contrast})`,
                      }"
                    />
                  </div>
                </div>
              </template>
            </template>
          </draggable>
        </template>
      </template>
    </div>

    <!-- 像素菜单 -->
    <div
      class="menu"
      :style="{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        display: pos.display,
      }"
    >
      <div class="item" @click="handleClickItem(320)">320像素</div>
      <div class="item" @click="handleClickItem(400)">400像素</div>
      <div class="item" @click="handleClickItem(550)">550像素</div>
      <div class="item" @click="handleClickItem(700)">700像素</div>
      <div class="item" @click="handleClickItem(850)">850像素</div>
    </div>
  </div>
</template>
<script>
import $ from "jquery";
import Draggable from "vuedraggable";
import {
  SetGroupSort,
  RotateChromo,
  SaveArrow,
  ModifyArrowComment,
} from "@/services/api";
import { First } from "@/utils/chrome/first";
import { Second } from "@/utils/chrome/second";
import { Third } from "@/utils/chrome/third";
import { Fouth } from "@/utils/chrome/fouth";
import { Fifth } from "@/utils/chrome/fifth";
export default {
  components: { Draggable },
  props: {
    rows: {
      type: Array,
      default: () => {
        return [];
      },
    },
    activeName: {
      type: String,
      default: () => {
        return "";
      },
    },
    kid: {
      type: String,
      default: () => {
        return "";
      },
    },
    red: {
      type: Array,
      default: () => {
        return [];
      },
    },
    type: {
      type: String,
      default: () => {
        return "big";
      },
    },
    brightness: {
      type: Number,
      default: () => {
        return 1;
      },
    },
    contrast: {
      type: Number,
      default: () => {
        return 1;
      },
    },
    sharpness: {
      type: Number,
      default: () => {
        return 1;
      },
    },
  },
  watch: {
    activeName(val) {
      this.flag = val;
      this.chromoScale = localStorage.standard_chromo_scale
        ? Number(localStorage.standard_chromo_scale)
        : 0.2;
      this.chromoType = localStorage.standard_chromo_resolution
        ? Number(localStorage.standard_chromo_resolution)
        : 320;
      this.selected = [];
      console.log(this.chromoType, this.chromoScale);
    },
  },
  data() {
    return {
      // 拖动
      drag: {
        from: "",
        to: "",
      },

      // 旋转
      isRotate: false,
      rotateValue: 0,
      routeCount: 0,
      pointA: { X: 0, Y: 0 },
      pointB: { X: 0, Y: 0 },
      pointC: { X: 0, Y: 0 },
      flag: "",
      karyotype_id: "",
      isMark: false,
      chromoType: 320,
      chromoScale: 0.2,
      scale: 0.2,
      pos: {
        left: 0,
        top: 0,
        display: "none",
      },
      tip: "",

      chromo: {
        320: [
          [60, 964],
          [63, 886],
          [64, 747],
          [64, 705],
          [64, 666],
          [64, 656],
          [65, 593],
          [62, 528],
          [65, 525],
          [66, 509],
          [64, 508],
          [64, 493],
          [64, 417],
          [66, 405],
          [65, 383],
          [64, 351],
          [64, 342],
          [65, 307],
          [63, 271],
          [63, 259],
          [65, 200],
          [65, 216],
          [63, 602],
          [65, 212],
        ],
        400: [
          [50, 963],
          [51, 889],
          [50, 750],
          [53, 704],
          [53, 667],
          [50, 656],
          [52, 594],
          [51, 526],
          [53, 525],
          [52, 510],
          [53, 508],
          [53, 493],
          [55, 418],
          [53, 404],
          [51, 382],
          [52, 352],
          [65, 342],
          [52, 308],
          [52, 270],
          [51, 259],
          [53, 201],
          [56, 218],
          [53, 604],
          [54, 213],
        ],
        550: [
          [44, 963],
          [44, 887],
          [45, 751],
          [44, 704],
          [44, 668],
          [44, 654],
          [44, 594],
          [45, 526],
          [46, 524],
          [45, 511],
          [46, 512],
          [43, 496],
          [44, 417],
          [45, 403],
          [45, 381],
          [45, 352],
          [39, 342],
          [43, 306],
          [44, 270],
          [43, 258],
          [47, 199],
          [46, 217],
          [43, 601],
          [46, 213],
        ],
        700: [
          [39, 962],
          [40, 886],
          [39, 751],
          [40, 705],
          [41, 668],
          [39, 653],
          [39, 594],
          [39, 526],
          [40, 524],
          [40, 511],
          [40, 512],
          [40, 495],
          [39, 417],
          [40, 403],
          [41, 381],
          [40, 353],
          [40, 343],
          [41, 307],
          [38, 271],
          [39, 258],
          [41, 200],
          [39, 217],
          [39, 602],
          [46, 213],
        ],
        850: [
          [33, 962],
          [32, 886],
          [34, 750],
          [33, 704],
          [33, 668],
          [33, 654],
          [33, 594],
          [33, 526],
          [33, 525],
          [34, 510],
          [34, 512],
          [33, 496],
          [33, 418],
          [33, 404],
          [33, 381],
          [33, 352],
          [33, 342],
          [33, 306],
          [31, 270],
          [32, 257],
          [33, 199],
          [33, 216],
          [33, 602],
          [33, 213],
        ],
      },

      dataSource: [],
      selected: [],
    };
  },
  mounted() {
    const that = this;
    this.karyotype_id = this.$route.params.id;
    document.addEventListener("mousemove", (e) => {
      if (that.isRotate && that.flag === "rotate") {
        e.preventDefault();
        e.stopPropagation();
        that.pointC.X = e.pageX;
        that.pointC.Y = e.pageY;

        var AB = {};
        var AC = {};
        AB.X = that.pointB.X - that.pointA.X;
        AB.Y = that.pointB.Y - that.pointA.Y;
        AC.X = that.pointC.X - that.pointA.X;
        AC.Y = that.pointC.Y - that.pointA.Y; // 分别求出AB,AC的向量坐标表示
        var direct = AB.X * AC.Y - AB.Y * AC.X; // AB与AC叉乘求出逆时针还是顺时针旋转
        var lengthAB = Math.sqrt(
            Math.pow(that.pointA.X - that.pointB.X, 2) +
              Math.pow(that.pointA.Y - that.pointB.Y, 2)
          ),
          lengthAC = Math.sqrt(
            Math.pow(that.pointA.X - that.pointC.X, 2) +
              Math.pow(that.pointA.Y - that.pointC.Y, 2)
          ),
          lengthBC = Math.sqrt(
            Math.pow(that.pointB.X - that.pointC.X, 2) +
              Math.pow(that.pointB.Y - that.pointC.Y, 2)
          );
        var cosA =
          (Math.pow(lengthAB, 2) +
            Math.pow(lengthAC, 2) -
            Math.pow(lengthBC, 2)) /
          (2 * lengthAB * lengthAC);
        var angleA = Math.round((Math.acos(cosA) * 180) / Math.PI);
        if (direct < 0) {
          that.rotateValue = -angleA; //逆时针旋转，逆时针旋转减度数
        } else {
          that.rotateValue = angleA; //顺时针旋转，顺时针旋转加度数
        }
        $("#c_" + that.kid).css(
          "transform",
          "rotate(" + that.rotateValue + "deg)"
        );
      }
    });
    document.addEventListener("mouseup", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (that.flag === "rotate" && that.kid.length > 0 && that.isRotate) {
        if (that.rotateValue !== 0) {
          that.isRotate = false;
          RotateChromo({
            chromosome_id: that.kid,
            angle: that.rotateValue,
          })
            .then(() => {
              $("#c_" + that.kid).css("transform", "rotate(0deg)");
              that.rotateValue = 0;
              that.routeCount = 0;
              that.$emit("end");
            })
            .catch((err) => {
              this.$message.error(err);
            });
        }
      }
    });
    that.handleClickItem(320);
  },

  methods: {
    // 拖动开始
    handleDragStart(e) {
      this.drag.from = e.originalEvent.target.dataset.id;
    },

    // 拖动结束
    handleDragEnd(e) {
      let group = e.to.dataset.index;
      if (group === "X") {
        group = 23;
      } else if (group === "Y") {
        group = 24;
      } else if (group === "mar") {
        group = -1;
      } else if (group === "待排区") {
        group = 0;
      }
      const groupIndex = Number(group);
      const sort = e.newIndex + 1;
      const chromosome = this.drag.from;
      SetGroupSort({
        chromosome_id: chromosome,
        group_index: groupIndex,
        group_sort: sort,
      })
        .then(({ data }) => {
          data.id = chromosome;
          data.group_index = groupIndex;
          data.group_sort = sort;
          this.$emit("dragEnd", data);
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },

    // 选择核型图
    handleClickRow(item, index, e, flag, idx) {
      const that = this;
      const id = item.id;
      const opt = $("#c_" + id);
      if (id.length > 0) {
        that.pointA = {
          X: opt.width() / 2 + opt.offset().left,
          Y: opt.height() / 2 + opt.offset().top,
        };
        that.isRotate = true;
        if (1 > that.routeCount) {
          that.pointB.X = e.pageX;
          that.pointB.Y = e.pageY;
          that.routeCount++;
        }
        that.$emit("selected", {
          id: id,
          width: opt.width(),
          height: opt.height(),
          flag: flag,
        });
        if (that.flag === "dingdai") {
          const no = that.selected.findIndex((item) => item.index === idx);
          if (no > -1) {
            that.selected[no].width = opt.width();
            that.selected[no].height = opt.height();
            that.selected[no].scale =
              opt.height() / that.chromo[that.chromoType][idx - 1][1];
          } else {
            that.selected.push({
              index: idx,
              width: opt.width(),
              height: opt.height(),
              scale: opt.height() / that.chromo[that.chromoType][idx - 1][1],
            });
          }
          console.log(that.selected);
        }
      }

      console.log(!that.isMark, that.flag);

      if (!that.isMark && that.flag === "mark") {
        that.isMark = true;
        const foo = {
          karyotype_id: that.karyotype_id,
          chromosome_id: item.id,
          offset_x:
            index === 0 ? e.target.offsetWidth - e.offsetX - 3 : e.offsetX - 3,
          offset_y: e.offsetY - 20,
          direction: index === 0 ? "left" : "right",
          comment: "",
          edit: true,
        };
        item.arrows.push(foo);
        that.saveArrow(foo);
      }
    },

    // 保存箭头
    saveArrow(row) {
      if (!row.id) {
        row.edit = false;
        SaveArrow(row)
          .then(({ data }) => {
            this.isMark = false;
            this.flag = "mark";
            this.$set(row, "id", data.id);
          })
          .catch((err) => {
            this.$message.error(err);
          });
      } else {
        row.edit = false;
        ModifyArrowComment({
          arrow_id: row.id,
          comment: row.comment,
        })
          .then(() => {
            this.isMark = false;
            this.flag = "mark";
          })
          .catch((err) => {
            this.$message.error(err);
          });
      }
    },

    // 编辑箭头
    handleEditMark(row) {
      if (row.id && this.flag === "mark") {
        // this.isMark = true;
        this.flag = "mark";
        this.$set(row, "edit", true);
        this.$emit("delete", row);
      }
    },

    // 右键菜单
    handleContextmenu(e) {
      console.log(e);
      e.preventDefault();
      if (e.clientX >= 1300) {
        this.pos = {
          left: e.pageX - 210,
          top: e.pageY - 60,
          display: "block",
        };
      } else {
        this.pos = {
          left: e.pageX - 110,
          top: e.pageY - 60,
          display: "block",
        };
      }
    },

    handleClickItem(index) {
      this.chromoType = index;
      if (index === 320) {
        this.dataSource = First();
      } else if (index === 400) {
        this.dataSource = Second();
      } else if (index === 550) {
        this.dataSource = Third();
      } else if (index === 700) {
        this.dataSource = Fouth();
      } else {
        this.dataSource = Fifth();
      }
    },

    handleMouseMove(e, name, scale) {
      const arr = this.dataSource.filter((item) => item.name === name);
      if (arr.length > 0) {
        const data = arr[0].element.filter(
          (item) =>
            !(
              e.offsetX < item.lxly[0] * scale ||
              e.offsetX > item.rxry[0] * scale ||
              e.offsetY < item.lxly[1] * scale ||
              e.offsetY > item.rxry[1] * scale
            )
        );
        if (data.length > 0) {
          this.tip = data[0].name;
        }
      }
    },

    handleHidePanel() {
      this.pos.display = "none";
      this.$emit("callback");
    },

    eventStatus(index) {
      const arr = this.selected.filter((item) => item.index === index);
      return arr;
    },
  },
};
</script>
<style lang="scss" scoped>
.karyotype-preview-component {
  clear: both;
  overflow: hidden;
  position: relative;
  .item-box {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 10px;
    min-height: 160px;
    &:nth-child(1) {
      min-height: 230px;
    }
    .item-component {
      display: flex;
      justify-content: center;
      border-bottom: solid 1px #000;
      position: relative;
      width: 1%;
      flex: 1;
      margin: 0 10px 35px;
      min-height: 120px;
      .tiaodai {
        position: absolute;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: flex-end;
        img {
          width: 14px;
        }
      }
      .dingdai {
        position: absolute;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: flex-end;
        img {
          width: 14px;
        }
      }
      .group {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-direction: column;
        position: relative;
        .group-box {
          position: relative;
          &.active {
            &::after {
              border: solid 2px #1890ff;
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              content: "";
            }
          }
        }
        .arrow {
          position: absolute;
          display: flex;
          align-items: center;
          z-index: 1;
          min-width: 150px;
          .icon {
            width: 40px;
          }
          .input-box {
            width: 100px;
          }
          &.right {
            justify-content: flex-end;
            left: auto;
            .input-box {
              text-align: right;
            }
          }
        }
      }
      &::after {
        content: attr(data-index);
        position: absolute;
        left: 0;
        right: 0;
        bottom: -24px;
        line-height: 24px;
        text-align: center;
      }
      &.error {
        &::after {
          color: red;
        }
      }
    }
    &:nth-child(1) {
      .item-component {
        &:nth-child(4) {
          margin-left: 12%;
        }
      }
    }
    &:nth-child(3) {
      .item-component {
        &:nth-child(4) {
          margin-left: 12%;
        }
      }
    }
    &:nth-child(4) {
      .item-component {
        &:nth-child(5) {
          margin-left: 12%;
        }
      }
    }
  }
  .menu {
    background-color: #000;
    position: absolute;
    left: 200px;
    top: 200px;
    padding: 5px;
    width: 100px;
    border-radius: 3px;
    .item {
      height: 36px;
      color: #fff;
      line-height: 36px;
      text-align: center;
      cursor: pointer;
      border-radius: 3px;
      transition: 300ms;
      color: rgba(255, 255, 255, 0.8);
      &:hover {
        background-color: rgba(255, 255, 255, 0.25);
        color: #fff;
      }
    }
  }
}
</style>