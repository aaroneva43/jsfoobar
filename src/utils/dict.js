// 字典库

// 性别
export function Sex(index) {
  return ["", "男性", "女性"][index];
}

// 样本类型
export function YBType(key) {
  const obj = {
    B: "羊水",
    D: "精子库",
    F: "免费",
    G: "外周血",
    K: "超声异常羊水穿刺",
    U: "超声异常引产",
    X: "复发流产",
  };
  return obj[key];
}

// 核型图处理进度
export function PictureDoProcess(index) {
  return ["未分析", "自动分析", "计数确认", "排列确认"][index];
}

// 核型图颜色标记
export function PictureColorMarker(index) {
  return ["#7f7f7f", "#3583e3", "#b8741a", "#a30014"][index];
}

// 核型图进度标记
export function PictureProcessMarker(index) {
  return ["#7f7f7f", "#f4c60a", "#3583e3", "#50a449"][index];
}

// 核型图排序
export function PictureSort(index) {
  return ["打分", "玻片", "进度", "克隆号"][index];
}
