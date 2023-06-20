<template>
  <div class="Container">
    <div class="btnContainer">
      <el-form ref="form" :model="form" labelWidth="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item prop="username" label="查询时间:">
              <el-date-picker
                style="width: 385px"
                v-model="form.daterange"
                type="daterange"
                range-separator="至"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :clearable="false"
              >
              </el-date-picker> </el-form-item
          ></el-col>
          <el-col :span="6">
            <el-form-item prop="sample_types" label="样本类型:">
              <el-select
                multiple
                v-model="form.sample_types"
                style="min-width: 150px"
              >
                <el-option label="外周血" value="G" />
                <el-option label="羊水" value="B" />
                <el-option label="精子库" value="D" />
                <el-option label="免费" value="F" />
                <el-option label="超声异常羊水刺穿" value="K" />
                <el-option label="超声异常引产" value="U" />
                <el-option label="复发流产" value="X" />
              </el-select> </el-form-item
          ></el-col>
          <el-col :span="5">
            <el-form-item prop="analyser" label="阅片者:">
              <el-input v-model="form.analyser"></el-input> </el-form-item
          ></el-col>
        </el-row>
      </el-form>
      <el-col :span="5"
        ><el-button type="primary" size="small" @click="search">搜索</el-button>
        <el-button type="primary" size="small" @click="openVisible"
          >配置</el-button
        >
        <el-button type="success" size="small" @click="exportEX"
          >导出</el-button
        >
      </el-col>
    </div>
    <el-table border :data="templetes" style="width: 100%; margin: 0 auto">
      <el-table-column type="index" width="60" label="序号"> </el-table-column>
      <el-table-column
        v-for="(item, index) in selectColumn"
        :prop="item.field"
        :label="item.name"
        :key="index"
      >
      </el-table-column>
      <!-- <el-table-column v-else prop="page_size" label="纸张尺寸">
        <template slot-scope="scope">
          <div v-if="scope.row.page_size == 1">A5</div>
          <div v-else>A4</div>
        </template></el-table-column
      > -->
    </el-table>
    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="page_number"
        :page-size=10
        layout="prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      top="5vh"
      width="750px"
      title="配置显示"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form ref="dialogform" :model="column" labelWidth="90px">
        <el-row type="flex" align="center">
          <el-form-item prop="item" label="配置字段：">
            <el-checkbox-group v-model="checkList">
              <el-checkbox
                v-for="(item, index) in column"
                :key="index"
                :label="item.field"
                >{{ item.name }}</el-checkbox
              >
            </el-checkbox-group>
          </el-form-item>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="SaveStatisticFieldInfo"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  GetStatisticFieldInfo,
  SaveStatisticFieldInfo,
  GetStatisticByPage,
  ExportStatisticByPage,
} from "@/services/api";
export default {
  data() {
    return {
      templetes: [],
      column: [],
      checkList: [],
      selectColumn: [],
      form: { daterange: [], analyser: "", sample_types: [] },
      dialogVisible: false,
      total: 0,
      page_number: 1,
    };
  },
  created() {
    let date = new Date(),
      year = date.getFullYear(), //获取完整的年份(4位)
      month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
      strDate = date.getDate(); // 获取当前日(1-31)
    if (month >= 1 && month <= 9) month = "0" + month; // 如果月份是个位数，在前面补0
    if (strDate >= 0 && strDate <= 9) strDate = "0" + strDate; // 如果日是个位数，在前面补0
    let currentdate = `${year}-${month}-${strDate}`;
    let lastdate = `${year - 1}-${month}-${strDate}`;
    this.form.daterange = [lastdate, currentdate];
    this.GetStatisticByPage();
  },
  methods: {
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.page_number = val;
      this.getData();
    },
    search() {
      this.page_number = 1;
      this.getData();
    },
    getData() {
      var query = JSON.parse(JSON.stringify(this.form));
      query.start_time = query.daterange[0];
      let date = new Date(query.daterange[1]);
      date.setDate(date.getDate()+1);
      let  year = date.getFullYear(), //获取完整的年份(4位)
        month = date.getMonth() + 1, //获取当前月份(0-11,0代表1月)
        strDate = date.getDate(); // 获取当前日(1-31)
      if (month >= 1 && month <= 9) month = "0" + month; // 如果月份是个位数，在前面补0
      if (strDate >= 0 && strDate <= 9) strDate = "0" + strDate; // 如果日是个位数，在前面补0
      let currentdate = `${year}-${month}-${strDate}`;
      query.end_time = currentdate;
      GetStatisticByPage({
        analyser: query.analyser == "" ? null : query.analyser,
        sample_types: query.sample_types,
        start_time: query.start_time ? `${query.start_time}T00:00:00` : null,
        end_time: query.end_time ? `${query.end_time}T00:00:00` : null,
        time_inverted: 1,
        per_page: 10,
        fields: this.selectColumn.map((x) => x.field),
        page_number: this.page_number,
      })
        .then((res) => {
          if (res.code == 200) {
            this.templetes = res.data.data.map((x) => {
              x.review_time = x.review_time&&x.review_time.replaceAll("T", " ")||"-";
              x.report_time = x.report_time&&x.report_time.replaceAll("T", " ")||"-";
              x.receive_time = x.receive_time&&x.receive_time.replaceAll("T", " ")||"-";
              return x;
            });
            this.total = res.data.total || 0;
          } else {
            this.templetes = [];
            this.total = res.data.total || 0;
          }
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    GetStatisticByPage() {
      GetStatisticFieldInfo({})
        .then((res) => {
          if (res.code == 200) {
            this.column = res.data;
            this.selectColumn = res.data.filter((x) => x.is_selected == 1);
          } else {
            this.column = [];
          }
          this.search();
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    openVisible() {
      this.checkList = this.selectColumn.map((x) => x.field);
      this.dialogVisible = true;
    },
    SaveStatisticFieldInfo() {
      SaveStatisticFieldInfo(this.checkList).then((res1) => {
        if (res1.code == 200) {
          this.column = this.column.map((x) => {
            x.is_selected = this.checkList.indexOf(x.field) > -1;
            return x;
          });
          this.selectColumn = this.column.filter((x) => x.is_selected == 1);
          this.$message({
            type: "success",
            message: "设置成功",
            offset: 300,
          });
          this.dialogVisible = false;
          this.search();
        }
      });
    },
    exportEX() {
      this.$confirm("是否要导出这批数据?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        var query = JSON.parse(JSON.stringify(this.form));
        query.start_time = query.daterange[0];
        query.end_time = query.daterange[1];
        ExportStatisticByPage({
          analyser: query.analyser == "" ? null : query.analyser,
          sample_types: query.sample_types,
          start_time: query.start_time ? `${query.start_time}T00:00:00` : null,
          end_time: query.end_time ? `${query.end_time}T23:59:59` : null,
          time_inverted: 1,
          fields: this.selectColumn.map((x) => x.field),
          // per_page: 1,
          // page_number: 20,
        })
          .then((result) => {
            const link = document.createElement("a"); //创建a标签
            const blob = new Blob([result], {
              type: "application/octet-stream",
            }); //设置文件流
            link.style.display = "none";
            // 设置连接
            link.href = URL.createObjectURL(blob); //将文件流转化为blob地址
            link.download = "染色体统计报表.xlsx";
            document.body.appendChild(link);
            // 模拟点击事件
            link.click(); //设置点击事件
          })
          .catch((err) => {
            this.$message.error(err);
          });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.Container {
  border-bottom: solid 1px rgba(255, 255, 255, 0.2);
  padding-right: 10px;
  .logo {
    color: #fff;
    font-size: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &::before {
      width: 32px;
      height: 32px;
      background: url(../assets/logo.svg) no-repeat;
      background-size: 100% auto;
      content: "";
      margin: 0 5px;
    }
  }
  .user {
    display: flex;
    align-items: center;
    cursor: pointer;
    .model_title {
      margin-right: 8px;
      color: #409eff;
    }
    .nick {
      margin-left: 8px;
      color: #fff;
    }
  }
}
.btnContainer {
  overflow: hidden;
  padding: 0 15px;
  margin-bottom: 10px;
  display: flex;
}
/deep/.el-form-item__label {
  color: #666 !important;
}
/deep/.el-checkbox__label {
  color: #444 !important;
}
/deep/.el-radio__label {
  color: #444 !important;
}
/deep/.el-tag.el-tag--info {
  background-color: #efefef;
  border-color: #444;
  color: #444;
}
</style>
