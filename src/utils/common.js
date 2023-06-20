// 格式化时间
export function ParseTime(val) {
  const date = new Date(val);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${10 > month ? "0" + month : month}-${
    10 > day ? "0" + day : day
  }T00:00:00`;
}
