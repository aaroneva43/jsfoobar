import moment from 'moment-timezone/builds/moment-timezone-with-data';
/**
 * example:
 * 		('2019-02-01 01:00:00 UTC','YYYY-MM-DD HH:mm:ss') -> '2019-02-01 0-00-00'
 * 		('20190201T010000','YYYYMMDDTHHmmss') -> '20190201T090000'
 * 		('20190201T010000','YYYYMMDD HHmmss') -> '20190201 090000'
 *
 * @param {String} value UTC time string have T
 * @param {String} format_str Time format 'YYYYMMDDTHHmmss' / 'YYYYMMDD HHmmss'
 * @return {String} time string
 */
export const changeUtcStrToLocalStr_moment = function (value: string, format_str: string): string {
  const utcDate = moment.utc(value, format_str);
  return utcDate.isValid() ? moment(utcDate).local().format(format_str) : 'Invalid Date';
};

export const DATE_FORMAT_A1 = 'YYYY-MM-DD HH:mm:ss';
export const DATE_FORMAT_A2 = 'YYYY-MM-DD';
export const DATE_FORMAT_B1 = 'YYYYMMDDTHHmmss';
export const DATE_FORMAT_B2 = 'YYYYMMDD HHmmss';
