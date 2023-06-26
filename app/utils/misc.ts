export const byte2KMG = function (value: number, precision: number = 1, unitnumber: number = 0, unittype: 0 | 1 = 0, si: boolean = true): string | number {
  if (isNaN(value) || !isFinite(value)) return '-';
  if (value == 0) return value;
  const units = unittype === 0 ? ['', 'k', 'M', 'G', 'T', 'P'] : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const deviser = si ? 1000 : 1024;

  const number = Math.floor(Math.log(value) / Math.log(deviser));

  const n = unitnumber < number ? unitnumber : number;
  return (value / Math.pow(deviser, n)).toFixed(precision) + ' ' + units[n];
};
