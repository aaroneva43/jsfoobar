import services from './module';
import _ from 'lodash';
import angular from 'angular';
import dayjs from 'dayjs';
import { Address4 } from 'ip-address';
import { FWC_MENU } from '../utils/biz/meta/menu';
import { MAP_REGIONS, COUNTRY_CODE_MAP } from '../utils/biz/meta/geo';
import { SERVER_TYPE, URL_TYPES, USER_PERMISSION, SYSLOG_FORMAT_TYPE } from '../utils/biz/meta';
import { CLOUD_PLATFORMS } from '../utils/biz/meta/cloudPlatforms';
import { changeUtcStrToLocalStr_moment } from '../utils/datetime';
import { DATE_FORMAT_A1 } from '../utils/datetime';

import { byte2KMG } from '../utils/misc';

services.factory('valuePrepare', valuePrepare);

valuePrepare.$inject = ['translateFilter'];
function valuePrepare(translate) {
  return {
    valuePrepareFn: valuePrepareFn,
    mapRegion: mapRegion,
    mapRegionArr: mapRegionArr,
    prepareBsSwitchValue: prepareBsSwitchValue,
    hasDuplicates: hasDuplicates,
    checkIPorIPRangeArray: checkIPorIPRangeArray,
  };

  function valuePrepareFn() {
    return {
      // Arguments for each value prepare function: value, row, column config, grid controller
      value_translate: function (value, row) {
        return translate(value);
      },
      switch_text: function (value, row) {
        return translate(value === 'enable' ? 'Enable' : value === 'disable' ? 'Disable' : value ? 'Enable' : 'Disable');
      },
      datetime: function (value, row) {
        // var date = new Date(value);
        return dayjs(value).format(DATE_FORMAT_A1);
      },
      upper_case: function (value: string) {
        return value.toUpperCase();
      },
      application_domains: function (value, row) {
        if (_.isEmpty(row.extra_domains)) return value;

        var cell_html = value,
          tip_html = '';

        _.mapValues(row.extra_domains, function (val) {
          tip_html = [tip_html, "<div class=\\'word-wrap-a\\'>", val, '</div>'].join('');
        });

        var str_content = [cell_html, '<span class="grid-tip-number">', row.extra_domains.length, '</span>'].join('');
        var str_html = ['<span class="grid-tip" uib-tooltip-html="\'', tip_html, '\'" tooltip-placement="bottom-right" tooltip-class="grid-tip-box">', str_content, '</span>'].join('');
        return str_html;
      },
      application_region: function (value, row) {
        if (row.platform == CLOUD_PLATFORMS.PLAT_C8T.value) {
          return row.area;
        } else {
          if (!angular.isArray(value)) return value;

          var textDelimiter = '<br/>',
            tooltipDelimiter = '\n';
          return value.length > 3
            ? [
                '<span uib-tooltip="',
                value.join(tooltipDelimiter),
                '" tooltip-placement="bottom" tooltip-class="grid-tip-box">',
                [value[0], value[1], value[2], '...'].join(textDelimiter),
                '</span>',
              ].join('')
            : value.join(textDelimiter);
        }
      },
      application_dns_status: function (value, row) {
        var str_status,
          tooltip_text,
          tip_str,
          tip_type = row.platform == CLOUD_PLATFORMS.PLAT_C8T.value ? 'Endpoint IP' : 'Endpoint CNAME';
        if (value === 1) {
          tip_str = translate('The DNS record has been changed to the {{type}}', { type: tip_type });
          str_status = 'OK';
          tooltip_text = '	<span uib-tooltip="' + tip_str + ' ';
        } else if (value === 0) {
          tip_str = translate('Change your DNS record to the {{type}}', { type: tip_type });
          str_status = 'Update Pending';
          tooltip_text = '	<span uib-tooltip="' + tip_str + ' ';
        } else {
          if (row.platform == CLOUD_PLATFORMS.PLAT_C8T.value) {
            tip_str = translate('dns_status_unknown_tooltip_C8T');
          } else {
            tip_str = translate('dns_status_unknown_tooltip');
          }
          str_status = 'Unknown';
          tooltip_text = '	<span uib-tooltip="' + tip_str + ' ';
        }
        var tooltip_click = translate('Click to copy {{type}} to the clipboard.', { type: tip_type });
        var str_html = [
          '<span class="tip-label applications-grid" style="white-space: nowrap">',
          tooltip_text,
          // row.ep_cname,
          // '\n',
          // tooltip_click,
          '" tooltip-placement="bottom">',
          str_status,
          '<i class="fa fa-external-link" style="margin-left: 6px"></i>',
          '	</span>',
          '</span>',
        ].join('');
        return str_html;
      },
      application_server_status: function (value) {
        var icon;
        if (value.status === 0) icon = '<i class="fa fa-check color-lightgreen"></i> ';
        else icon = '<i class="fa fa-info-circle color-red"></i> ';
        return [icon, value.detail].join('');
      },
      application_blocked_attacks: function (value) {
        return value;
      },
      application_count: function (value) {
        return byte2KMG(value, 0, 2); // unit:'k', 'M'
      },
      application_data: function (value) {
        return byte2KMG(value, 0, 3, 1); // unit:'KB', 'MB', 'GB'
      },
      application_cost: function (value) {
        if (isNaN(value)) {
          return '-';
        }
        return '$' + Math.round(value);
      },
      application_wizard_record_value: function (value) {
        var newArr = _.concat(value['A'], value['CNAME']);
        var htmlArr = [];
        _.forEach(newArr, function (val, key) {
          if (key != newArr.length - 1) {
            val = val + '<br>';
          }
          htmlArr.push(val);
        });
        return htmlArr.join('');
      },
      template_features: function (value, row) {
        var flatData = _.flatMap(FWC_MENU, function (d) {
          return d.children || d; //children priority, then self
        });
        return _.reduce(
          value,
          function (resulst, v) {
            var find = _.find(flatData, { id: v });
            if (find && find.label) resulst.push(translate(find.label));
            return resulst;
          },
          [],
        ).join(', ');
      },
      threat_level: function (value: string) {
        return ["<span class='severity-label severity-", value.toLowerCase(), "'>", translate(value), '</span>'].join('');
      },
      app_name: function (value, row) {
        if (value) {
          return value;
        } else if (row.device) {
          return row.device;
        } else {
          return '';
        }
      },
      log_ip_with_flag: function (value, row) {
        var flag = row['country_flag'] ? row['country_flag'] : row['srccountry'] ? COUNTRY_CODE_MAP[row['srccountry']] : '';
        var html = ['<span class="ip-with-flag"><span class="country_flag country_', flag, '"></span>', value, '</span>'].join('');
        return html;
      },
      log_url: function (value, row) {
        var html = '';
        if (value && value.length > 40) {
          html = ['<span title="', _.escape(value), '">', _.escape(value.substring(0, 40)), '...</span>'].join('');
        } else {
          html = ['<span>', _.escape(value), '</span>'].join('');
        }
        return html;
      },
      country_with_flag: function (value, row) {
        var flag = COUNTRY_CODE_MAP[value];
        var html = ['<span class="ip-with-flag"><span class="country_flag country_', flag, '"></span>', value, '</span>'].join('');
        return html;
      },
      fortiview_actions: function (value, row) {
        var block = row['Block'] ? parseInt(row['Block']) : 0;
        var alert = row['Alert'] ? parseInt(row['Alert']) : 0;
        var html = ['<div fwc-compare-bar caption="\'', block, '/', alert, '\'" values="[', block, ', ', alert, ']"></div>'].join('');
        return html;
      },
      fortiview_services: function (value, row) {
        var http = row['HTTP'] ? parseInt(row['HTTP']) : 0;
        var https = row['HTTPS'] ? parseInt(row['HTTPS']) : 0;
        var html = ['<div fwc-compare-bar caption="\'', http, '/', https, '\'" values="[', http, ', ', https, ']"></div>'].join('');
        return html;
      },
      mitb_input_type: function (value, row) {
        if (value == 'regular-input') return translate('Standard Input');
        else if (value == 'password-input') return translate('Password Input');
        else return '';
      },
      url_access_action: function (value, row) {
        if (value == 'pass') {
          return translate('Pass');
        } else if (value == 'alert_deny') {
          return translate('Alert & Deny');
        } else if (value == 'continue') {
          return translate('Continue');
        } else if (value == 'deny_no_log') {
          return translate('Deny (no log)');
        } else {
          return '';
        }
      },
      bot_recognition: function (value, row) {
        if (value == 'disabled') return translate('Disable');
        else if (value == 'real-browser-enforcement') return translate('Real Browser Enforcement');
        else if (value == 'captcha-enforcement') return translate('CAPTCHA Enforcement');
        else return '';
      },
      custom_rule_action: function (value, row) {
        if (value == 'alert') {
          return translate('Alert');
        } else if (value == 'alert_deny') {
          return translate('Deny');
        } else if (value == 'block_period') {
          return [translate('Period Block'), ' (', row['block_period'], ')'].join('');
        } else if (value == 'deny_no_log') {
          return translate('Deny (no log)');
        } else {
          return '';
        }
      },
      custom_rule_type: function (value, row) {
        var typeOptions = {
          'source-ip-filter': 'Source IP',
          'url-filter': 'URL',
          'http-header-filter': 'HTTP Header',
          'access-limit-filter': 'Access Rate Limit',
          'security-rules': 'Security Rules',
          'http-transaction': 'Transaction Timeout',
          'response-code': 'HTTP Response Code',
          'content-type': 'Content Type',
          'packet-interval': 'Packet Interval Timeout',
          parameter: 'Parameter',
          occurrence: 'Occurrence',
        };
        return typeOptions[value] || '';
      },
      custom_rule_value: function (value, row) {
        var result = '';
        switch (row['filter_type']) {
          case 'source-ip-filter':
            result = row['source-ip'];
            break;
          case 'url-filter':
            result = row['request-file'];
            break;
          case 'http-header-filter':
            if (row['header-field-check'] == 'enable') {
              if (row['header-name-type'] == 'predefined') {
                var headerTypes = {
                  Accept: 'Accept',
                  'X-Forwarded-For': 'X-Forwarded-For',
                  authorization: 'Authorization',
                  connection: 'Connection',
                  cookie: 'Cookie',
                  host: 'Host',
                  referer: 'Referer',
                  'user-agent': 'User-Agent',
                  'x-pad': 'X-Pad',
                };
                result = headerTypes[row['predefined-header']];
              } else if (row['header-name-type'] == 'custom') result = row['custom-header-name'];
            } else if (row['http-method-check'] == 'enable') {
              result = row['http-method-value'];
            }
            break;
          case 'access-limit-filter':
            result = row['access-rate-limit'];
            break;
          case 'security-rules':
            result = '';
            break;
          case 'http-transaction':
            result = row['http-transaction-timeout'];
            break;
          case 'response-code':
            result = row['response-code'];
            break;
          case 'content-type':
            result = '';
            break;
          case 'packet-interval':
            result = row['packet-interval-timeout'];
            break;
          case 'parameter':
            result = row['name'];
            break;
          case 'occurrence':
            result = row['occurrence-num'];
            break;
          default:
            break;
        }

        return result;
      },
      lb_algorithm: function (value, row) {
        if (row.server_balance === 'disable') return 'N/A';
        if (value === 'round-robin') return translate('Round Robin');
        if (value === 'weighted-round-robin') return translate('Weighted Round Robin');
        if (value === 'src-ip-hash') return translate('Source IP Hash');
        return translate('Least Connection');
      },
      lb_persistence_type: function (value, row) {
        if (row.server_balance === 'disable') return 'N/A';
        if (value === 'source-ip') return translate('Source IP');
        if (value === 'insert-cookie') return translate('Insert Cookie');
        return translate('None');
      },
      server_status: function (value, row) {
        if (row.health_check === 'enable') {
          if (row.server_type === 'dynamic') {
            if (value === 'failed') {
              return ['<i class="nucleo-icon icon-simple-remove color-grey"></i>', translate('Failed')].join('&nbsp;&nbsp;');
            } else if (value.length == 0) {
              var tip_html = '<div>None</div>',
                content_html = ['<i class="nucleo-icon icon-simple-remove color-grey"></i>', translate('Failed')].join('&nbsp;&nbsp;');
              return ['<span class="grid-tip" uib-tooltip-html="\'', tip_html, '\'" tooltip-placement="top-right" tooltip-class="grid-tip-box">', content_html, '</span>'].join('');
            } else if (value[0].status === 'disable') {
              return ['<i class="nucleo-icon icon-simple-remove color-grey"></i>', translate('Disable')].join('&nbsp;&nbsp;');
            } else {
              var allUp = true,
                allDown = true;
              var tip_html = '<div>',
                content_html: string;
              for (var i = 0; i < value.length; i++) {
                if (value[i].status === 'up') {
                  allDown = false;
                } else if (value[i].status === 'down') {
                  allUp = false;
                }
                tip_html += [value[i].ip, ': ', value[i].status, '<br>'].join('');
              }
              tip_html += '</div>';
              if (allUp) {
                content_html = ['<i class="nucleo-icon icon-bulb-63 icon-success"></i>', translate('Active')].join('&nbsp;&nbsp;');
              } else if (allDown) {
                content_html = ['<i class="nucleo-icon icon-bell-55 icon-danger"></i>', translate('Out of Service')].join('&nbsp;&nbsp;');
              } else {
                content_html = ['<i class="nucleo-icon icon-bell-55 icon-danger"></i>', translate('Partly Out of Service')].join('&nbsp;&nbsp;');
              }
              return ['<span class="grid-tip" uib-tooltip-html="\'', tip_html, '\'" tooltip-placement="top-right" tooltip-class="grid-tip-box">', content_html, '</span>'].join('');
            }
          } else {
            if (value === 'up') {
              return ['<i class="nucleo-icon icon-bulb-63 icon-success"></i>', translate('Active')].join('&nbsp;&nbsp;');
            }
            if (value === 'down') {
              return ['<i class="nucleo-icon icon-bell-55 icon-danger"></i>', translate('Out of Service')].join('&nbsp;&nbsp;');
            }
            return ['<i class="nucleo-icon icon-simple-remove color-grey"></i>', translate('Disable')].join('&nbsp;&nbsp;');
          }
        }
        return 'Disable';
      },
      server_protocol: function (value, row) {
        if (value === 'disable') return translate('HTTP');
        if (value === 'enable') return translate('HTTPS');
        return value;
      },
      server_port: function (value, row) {
        if (row.ssl === 'enable') return [value, '<i class="fa fa-lock"></i>'].join(' ');
        return value;
      },
      server_type: function (value, row) {
        switch (value) {
          case 'ip':
            return 'IP';
          case 'domain':
            return 'Domain';
          case 'dynamic':
            return 'Dynamic';
          default:
            return '';
        }
      },
      server_hc: function (value, row) {
        if (value === 'enable') return translate('Enable');
        if (value === 'disable') return translate('Disable');
        return value;
      },
      csrf_filter: function (value, row) {
        if (row['filter']) return value;
        else return '';
      },
      number_to_switch: function (value) {
        return value === 1 ? true : false;
      },
      tenant_management_username: function (value, row) {
        if (row.type == 'Tenant') {
          // var tip_label = row.tenant_alias ? row.tenant_alias : row.user_name;
          // var html_str = [
          // 	'<span class="tip-label">',
          // 	,'	<span uib-tooltip="' + row.user_name + '" tooltip-placement="bottom" tooltip-class="grid-tip-box">'
          // 	,tip_label
          // 	,'	</span>'
          // 	,'</span>'
          // ].join('');
          var html_str = [
            '<div class="clickable a-underline">', // <a> class
            row.tenant_alias,
            '</div>',
          ].join('');
          return html_str;
        } else {
          return '';
        }
      },
      tenant_management_permission: function (value, row) {
        if (_.isEmpty(value)) return;

        var per_options = {
          application: 'Application',
          global_setting: 'Global Settings',
          user_admin: 'Admin Management',
          template: 'Template',
        };
        var num = 0,
          // max_num = msspModel == MSSP_MODEL.MSSP_SHARED ? 3 : 1,//cell_html display max num
          max_num = 1,
          cell_html = '',
          tip_html = '';

        _.mapValues(value, function (o, k) {
          var per_label, show_str;
          switch (o) {
            case USER_PERMISSION.RW:
              per_label = translate('Read-Write');
              break;
            case USER_PERMISSION.RO:
            default:
              per_label = translate('Read Only');
              break;
          }
          show_str = [per_options[k], ' : ', per_label].join('');

          if (num < max_num) {
            cell_html = num == 0 ? show_str : [cell_html, ', ', show_str].join('');
          } else {
            tip_html = [tip_html, "<div class=\\'word-wrap-a\\'>", show_str, '</div>'].join('');
          }
          num++;
        });

        if (num <= max_num) {
          return cell_html;
        } else {
          var str_content = [cell_html, '<span class="grid-tip-number">', num - max_num, '</span>'].join('');
          var str_html = ['<span class="grid-tip" uib-tooltip-html="\'', tip_html, '\'" tooltip-placement="bottom-right" tooltip-class="grid-tip-box">', str_content, '</span>'].join('');
          return str_html;
        }
      },
      tenant_management_endpoints: function (value, row) {
        if (_.isEmpty(value)) return;

        var num = 0,
          // max_num = msspModel == MSSP_MODEL.MSSP_SHARED ? 3 : 1,//cell_html display max num
          max_num = 1,
          cell_html = '',
          tip_html = '';

        _.mapValues(value, function (o) {
          var show_str = [o[0], ' (', o[1], ')'].join(''); // example: zhangsan (www.baidu.com)

          if (num < max_num) {
            cell_html = num == 0 ? show_str : [cell_html, ', ', show_str].join('');
          } else {
            tip_html = [tip_html, "<div class=\\'word-wrap-a\\'>", show_str, '</div>'].join('');
          }
          num++;
        });

        if (num <= max_num) {
          return cell_html;
        } else {
          var str_content = [cell_html, '<span class="grid-tip-number">', num - max_num, '</span>'].join('');
          var str_html = ['<span class="grid-tip" uib-tooltip-html="\'', tip_html, '\'" tooltip-placement="bottom-right" tooltip-class="grid-tip-box">', str_content, '</span>'].join('');
          return str_html;
        }
      },
      tenant_management_app_usage: function (value, row) {
        if (value == undefined) {
          return;
        }
        var text = [value[0], ' Used / ', value[1], ' Total'].join('');
        if (value[1] == 0 || value[0] > value[1]) {
          return ['<span class="tenant-management-usage-zero">', text, '</span>'].join('');
        } else {
          return text;
        }
      },
      tenant_management_bw_usage: function (value, row) {
        if (value == undefined) {
          return;
        }
        var text = [byte2KMG(value[0]), ' bps / ', value[1], ' Mbps Total'].join('');
        if (value[1] == 0) {
          return ['<span class="tenant-management-usage-zero">', text, '</span>'].join('');
        } else {
          return text;
        }
      },
      audit_log_app_name: function (value) {
        return value.toUpperCase() === 'NULL' ? '' : value;
      },
      audit_log_tenant_name: function (value) {
        return value.toUpperCase() === 'NULL' ? '' : value;
      },
      audit_log_action: function (value) {
        return value.toUpperCase() === 'NULL' ? '' : value;
      },
      signature_name: function (value) {
        var displayedString = value;
        return displayedString;
      },
      uri_type: function (value) {
        if (value.status == 'disable' || !value.status) return '';

        let url_type = URL_TYPES[_.findIndex(URL_TYPES, { value: value.operator ? value.operator : value.type })];
        var displayedString = [translate(url_type ? url_type.label : value.type), ' : ', value.value].join('');
        return displayedString;
      },
      attack_log_alert_enabled: function (value, row) {
        return value ? true : false;
      },
      attack_log_alert_filters: function (value, row) {
        /**
         * value is sth like:
         * [{
         * 	field: 'user_agent', // 'src_ip', 'user_agent', 'url', 'main_type', 'sub_type', 'signature_id'
         * 	operator: 'is', // 'is', 'is_not', 'is_in', 'is_not_in', 'is_between', 'is_not_between'
         * 	value: 'agent1'
         * }, {
         * 	field: 'main_type',
         * 	operator: 'is_in',
         * 	value: 't1,t2'
         * }, {
         * 	field: 'src_ip',
         * 	operator: 'is_between',
         * 	startValue: '1.1.1.1',
         * 	endValue: '1.1.1.10'
         * }]
         */
        if (!angular.isArray(value)) return value;

        if (value.length === 0) return '';

        var result = [];
        var label_value_separator = ':';
        result.push('<div class="tags-panel-container">');
        _.each(value, function (filterObj) {
          var label = ['attack_log_alert_filter_field_', filterObj.field].join('');
          label = translate(label);
          var filterValue;
          switch (filterObj.operator) {
            case 'is':
              filterValue = filterObj.value;
              break;
            case 'is_not':
              filterValue = ['! ', filterObj.value].join('');
              break;
            case 'is_in':
              filterValue = filterObj.value.split(',').join(' or ');
              break;
            case 'is_not_in':
              filterValue = ['! (', filterObj.value.split(',').join(' or '), ')'].join('');
              break;
            case 'is_between':
              filterValue = [filterObj.startValue, ' - ', filterObj.endValue].join('');
              break;
            case 'is_not_between':
              filterValue = ['! ', filterObj.startValue, ' - ', filterObj.endValue].join('');
              break;
          }
          var filterHtmlArray = [
            '<div class="tags-panel-tag">',
            '<span class="tags-panel-label">',
            label,
            label_value_separator,
            '</span>',
            '<span class="tags-panel-value">',
            filterValue,
            '</span>',
            '</div>',
          ];
          result.push(filterHtmlArray.join(''));
        });
        result.push('</div>');
        return result.join('');
      },
      attack_log_alert_recipient: function (value, row) {
        if (value === true) return row.notified;
        else if (value === false) return translate('Default');
        else return value;
      },
      attack_log_export_server_type: function (value, row) {
        return _.find(SERVER_TYPE, { value: value }).label;
      },
      attack_log_export_server: function (value, row) {
        return [row.address, ':', row.port].join('');
      },
      attack_log_export_format: function (value, row) {
        var log_format_label = '';
        _.map(SYSLOG_FORMAT_TYPE, function (o) {
          if (o.value == value) {
            log_format_label = o.label;
          }
        });
        return log_format_label;
      },
      attack_log_export_protocol: function (value, row) {
        return _.toUpper(value);
      },
      hmm_learning_stage: function (value, row) {
        var icon, text;
        switch (value) {
          case 1:
            icon = 'nucleo-icon icon-building';
            text = 'Collecting';
            break;
          case 2:
            icon = 'fa fa-puzzle-piece';
            text = 'Building';
            break;
          case 3:
            icon = 'nucleo-icon icon-testing';
            text = 'Testing';
            break;
          case 4:
            icon = 'fa fa-rocket';
            text = 'Running';
            break;
          case 5:
            icon = 'fa fa-ban';
            text = 'Discarded';
            break;
          default:
            icon = 'fa fa-hourglass-half';
            text = 'Unconfirmed';
        }
        var html = ['<i class="ml-treeview-detail-icon ', icon, '"></i> ', text].join('');

        var ratio_complete = '';
        if (row.arg_ratio == row.max_arg_ratio) {
          ratio_complete = '<i class="ml-treeview-detail-icon nucleo-icon icon-check-2 color-green""></i>';
        }

        if (value == 1 || value == 3) {
          const compareValue = row.max_arg_ratio > 0 ? ((100 * row.arg_ratio) / row.max_arg_ratio).toFixed(1) : 0;
          return [
            '<div class="d-flex y-center">',
            '<div class="d-flex y-center" style="padding-right: 10px">',
            html,
            ratio_complete,
            '</div>',
            '<div fwc-tip-target>',
            '<div fwc-compare-bar class="inline" caption="',
            compareValue,
            '" caption-position="left" caption-percentage="1" values="[0, ',
            compareValue,
            ']" max="100"></div>',
            '<div fwc-tip>',
            '<table>',
            translate('Left Samples: '),
            parseInt((row.max_arg_ratio - row.arg_ratio) as any),
            '</table>',
            '</div></div>',
            '</div>',
          ].join('');
        } else {
          return html;
        }
      },
      endpoint_dns_status: function (value, row) {
        if (value === -1) {
          return 'Unknown';
        } else if (value === 1 || value) {
          return 'OK';
        } else if (value === 0 || !value) {
          return 'Pending';
        }
        return 'Unknown';
      },
      endpoint_dns_current_record: function (value, row) {
        if (!_.isEmpty(value)) {
          var record = '';
          if (!_.isEmpty(value.A)) {
            if (Array.isArray(value.A) && value.A.length > 0) {
              value.A.map((item, i) => {
                record += i ? `, ${item}` : `A: ${item}`;
                if (i == value.A.length - 1) {
                  record += '<br>';
                }
              });
            } else if (typeof value.A === 'string') {
              record += `<label style='margin-left: 36px'>A: ${value.A}</label><br>`;
            }
          }
          if (!_.isEmpty(value.AAAA)) {
            if (Array.isArray(value.AAAA) && value.AAAA.length > 0) {
              value.AAAA.map((item, i) => {
                record += i ? `, ${item}` : `AAAA: ${item}`;
                if (i == value.AAAA.length - 1) {
                  record += '<br>';
                }
              });
            } else if (typeof value.AAAA === 'string') {
              record += `<label style='margin-left: 9px'>AAAA: ${value.AAAA}</label><br>`;
            }
          }
          if (!_.isEmpty(value.CNAME)) {
            if (Array.isArray(value.CNAME) && value.CNAME.length > 0) {
              value.CNAME.map((item, i) => {
                record += i ? `, ${item}` : `CNAME: ${item}`;
              });
            } else if (typeof value.CNAME === 'string') {
              record += `<label>CNAME: ${value.CNAME}</label>`;
            }
          }
          return record;
        }
        return value;
      },
      endpoint_dns_cname: function (value, row) {
        const IP_REG = {
          // from validatorsIP.js
          IP: /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
          IPv6: /^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$/,
        };
        return _.isEmpty(value) ? '' : IP_REG.IP.test(value) ? `A: ${value}` : IP_REG.IPv6.test(value) ? `AAAA: ${value}` : `CNAME: ${value}`;
      },
      endpoint_sni_san: function (value, row) {
        if (_.isEmpty(value)) return value;

        var num = 0,
          max_num = 1, //cell_html display max num
          cell_html = '',
          tip_html = '';

        _.mapValues(value, function (o, k) {
          var show_str = o;

          if (num < max_num) {
            cell_html = num == 0 ? show_str : [cell_html, ', ', show_str].join('');
          } else {
            tip_html = [tip_html, "<div class=\\'word-wrap-a\\'>", show_str, '</div>'].join('');
          }
          num++;
        });

        if (num <= max_num) {
          return cell_html;
        } else {
          var str_content = [cell_html, '<span class="grid-tip-number">', num - max_num, '</span>'].join('');
          var str_html = ['<span class="grid-tip" uib-tooltip-html="\'', tip_html, '\'" tooltip-placement="bottom-right" tooltip-class="grid-tip-box">', str_content, '</span>'].join('');
          return str_html;
        }
      },
      apigateway_user_createtime: function (value, row) {
        if (!row.idx || !value) return 'To be created';
        return changeUtcStrToLocalStr_moment(value, DATE_FORMAT_A1);
      },
      apigateway_api_key_secret: function (value, row) {
        return `<fwc-secret value=${value} type="password" style="width:340px;">`;
      },
      apigateway_url_prefix: function (value, row) {
        var arr = [];
        _.forEach(value, function (o) {
          arr.push(o['frontend']);
        });
        return arr.join(',');
      },
      apigateway_api_key_verification: function (value, row) {
        return translate(value === true ? 'Enable' : 'Disable');
      },
      apigateway_allow_users: function (value, row) {
        if (!angular.isArray(value)) return value;

        return value.join(',');
      },
      contract_bindwidth: function (value) {
        return value ? [value, ' Mbps'].join('') : '';
      },
      fabric_connectors_status: function (value) {
        if (!value) {
          return '';
        }
        if (value == 'enable') {
          return '<i class="fa fa-check color-lightgreen"></i>';
        } else {
          return '<i class="fa fa-times color-red"></i>';
        }
      },
      origin_server_mkey: function (value, row) {
        if (row.server_type == 'dynamic') {
          return row.cloud_connector;
        } else {
          var server_address = row.server_address || '';
          if (row.locked) {
            var content = [server_address, '<i class="fa fa-lock"></i>'].join(' ');
            var tip_str = 'Origin server locked.';
            return ['<span class="grid-tip" ', 'uib-tooltip="' + tip_str + '" ', 'tooltip-placement="right" tooltip-class="grid-tip-box">', content, '</span>'].join('');
          }
          return server_address;
        }
      },
      platform_uppercase: function (value) {
        switch (value) {
          case 'aws':
            return 'AWS';
          case 'azure':
            return 'Azure';
          case 'gcp':
            return 'GCP';
        }
        return value;
      },
      reports_recipients: function (value) {
        if (!value) {
          return '';
        }
        var str = '';
        var recipients = value.split(',');
        for (var i = 0; i < recipients.length; i++) {
          if (i != 0) {
            str += '<br>';
          }
          str += recipients[i];
        }
        return str;
      },
      reports_time_range: function (value) {
        if (!value) {
          return '';
        }
        switch (value) {
          case '24h':
            return 'Last 24 Hours';
          case '7d':
            return 'Last 7 Days';
          case '14d':
            return 'Last 14 Days';
          case '30d':
            return 'Last 30 Days';
        }
        return value;
      },
      fabric_region: function (value, row) {
        var azureServerRegions = {
          global: 'Global',
          china: 'China',
          germany: 'Germany',
          us_gov: 'US Gov',
        };
        if (row.type == 'azure') {
          return azureServerRegions[row.server_region] || row.server_region || '';
        } else if (row.type == 'gcp') {
          return row.zone || '';
        } else {
          return value || '';
        }
      },
      api_key_datetime: function (value) {
        if (!value) {
          return '';
        }
        return dayjs(value * 1000).format(DATE_FORMAT_A1);
      },
      api_key_status: function (value) {
        return value && value != 'false' ? 'Active' : 'Inactive';
      },
      global_white_request_url: function (value) {
        if (!value) {
          return '';
        }
        if (value.length < 64) {
          return value;
        }
        var part = value.substring(0, 63);
        return ['<span class="grid-tip" uib-tooltip="', value, '" tooltip-placement="bottom-right" tooltip-class="grid-tip-box grid-tip-box-break">', part, '...', '</span>'].join('');
      },
      param_val_rule_overview: function (value, record) {
        var rules = record['sub_rule_list'];

        var content = rules
          .map(function (rule, index, self) {
            return [
              '<span style="display:inline-block;">',
              rule['name'],
              rule['required'] ? '<a style="color:red;">*</a>' : '',
              '</span>',
              rule['type_check'] ? ': ' : '',
              rule['arg_type'] === 'data-type' ? rule['arg_val'] : '',
              rule['arg_type'] === 'regular-expression'
                ? '<span style="max-width: 200px; x-overflow: hidden; display: inline-block; line-height: 10px; white-space: nowrap; text-overflow: ellipsis;">' + rule['arg_val'] + '</span>'
                : '',
              index === self.length - 1 ? '' : '<a> | </a>',
              '</span>',
            ].join('');
          })
          .join('');

        return ['<div>', content, '</div>'].join('');
      },
      param_val_action: function (value, row) {
        if (value == 'alert') {
          return translate('Alert');
        } else if (value == 'alert_deny') {
          return translate('Deny');
        } else if (value == 'block_period') {
          return [translate('Period Block'), ' (', row['block_period'], ')'].join('');
        } else if (value == 'deny_no_log') {
          return translate('Deny (no log)');
        } else {
          return '';
        }
      },
    };
  }

  function mapRegion(regionKey) {
    var obj = { value: regionKey, label: '' };
    _.map(MAP_REGIONS, function (o) {
      if (o.value == regionKey) {
        obj = o;
      }
    });
    return obj;
  }

  function mapRegionArr(regionKeyArr) {
    var newArr = [];
    _.map(regionKeyArr, function (o) {
      newArr.push(mapRegion(o));
    });
    return newArr;
  }

  function prepareBsSwitchValue(columns, data) {
    var gridValuePrepareFn = valuePrepareFn();
    angular.forEach(data, function (row, index) {
      row.row_index = index;
      angular.forEach(columns, function (column) {
        if (column.type === 'switch' && column.valuePrepareFn) {
          row[column.key] = gridValuePrepareFn[column.valuePrepareFn](row[column.key], row, column);
        }
      });
    });
    return data;
  }

  /**
   * check array has duplicate value
   * return true/false
   */
  function hasDuplicates(arr) {
    return _.some(arr, function (elt, index) {
      return arr.indexOf(elt) !== index;
    });
  }

  /**
   * check ip or ip range if valid
   * @param {*} allIpsValues ip or ip range array
   *
   */
  function checkIPorIPRangeArray(allIpsValues) {
    var flag = false,
      alertMsg = '',
      ip_value = '';

    _.forEach(allIpsValues, function (val) {
      ip_value = val;
      if (val.indexOf('-') > -1) {
        var arr = val.split('-'),
          val1,
          val2;
        if (arr.length > 2) {
          flag = false; // invalid ip
          alertMsg = translate('tip_ip_iprange', { v: ip_value });
        } else {
          val1 = arr[0];
          val2 = arr[1];
          var address_ip_4_1 = new Address4(val1),
            address_ip_4_2 = new Address4(val2);
          if (Address4.isValid(val1) && Address4.isValid(val2)) {
            if (hasDuplicates(allIpsValues)) {
              flag = false;
              alertMsg = translate('tip_duplicate');
            } else {
              flag = true;
            }
          } else {
            flag = false; // invalid ip
            alertMsg = translate('tip_ip_iprange', { v: ip_value });
          }
        }
      } else {
        var address_ip_4 = new Address4(val);
        if (Address4.isValid(val)) {
          if (hasDuplicates(allIpsValues)) {
            flag = false;
            alertMsg = translate('tip_duplicate');
          } else {
            flag = true;
          }
        } else {
          flag = false; // invalid ip
          alertMsg = translate('tip_ip_iprange', { v: ip_value });
        }
      }
      if (!flag) return false;
    });

    return {
      flag: flag,
      alertMsg: alertMsg,
    };
  }
}
