import _ from 'lodash';
import controllers from '../module';
import angular from 'angular';
('use strict');
import { CLOUD_PLATFORMS } from '../../utils/biz/meta/cloudPlatforms';
import { storage } from '../../utils/storage';
import { APPLICATIONS_ADD_SREF } from '../../utils/biz/meta/state';

controllers.controller('ApplicationsController', ApplicationsController);
controllers.controller('EditApplicationModalController', EditApplicationModalController);
controllers.controller('RegionIpModalController', RegionIpModalController);
controllers.controller('DnsDetailModalController', DnsDetailModalController);

ApplicationsController.$inject = [
  '$scope',
  '$state',
  '$filter',
  'auth',
  'dataService',
  'valuePrepare',
  'waitingScreen',
  'fwcNotify',
  'dialogs',
  'columnService',
  'translateFilter',
  'Facets',
  'facetedSearchUtil',
  'PAGENATOR_SIMPLE_SIZE_SET',
  'timeChartService',
  'USER_PERMISSION',
];

function ApplicationsController(
  $scope,
  $state,
  $filter,
  auth,
  dataService,
  valuePrepare,
  waitingScreen,
  fwcNotify,
  dialogs,
  columnService,
  translate,
  Facets,
  facetedSearchUtil,
  PAGENATOR_SIMPLE_SIZE_SET,
  timeChartService,
  USER_PERMISSION,
) {
  var $ctrl = this;
  $ctrl.listName = 'applications';
  var fsModelKey = ['fsmodel', $ctrl.listName].join('_'); // filter facets need
  $ctrl.pageSizeKey = ['pageSize', $ctrl.listName].join('_'); // paginator need
  var isMSSPLicensed = auth.isMSSPLicensed();
  var current_license_type = sessionStorage.getItem('current_license_type');
  var platform = sessionStorage.getItem('platform');

  $ctrl.url = '/application';
  $ctrl.tipAdminHasContract = storage.local.get('tip_admin_has_contract');
  $ctrl.trial_info = storage.local.get('trial_info');
  $ctrl.showTrialInfo =
    $ctrl.trial_info && $ctrl.trial_info.expire_time && current_license_type && (current_license_type == 'aws' || current_license_type == 'azure' || current_license_type == 'gcp') ? true : false;
  if ($ctrl.showTrialInfo) {
    var date = new Date($ctrl.trial_info.expire_time);
    $ctrl.trialDate = $filter('date')(date, 'yyyy-MM-dd');
  } else {
    $ctrl.trialDate = '';
  }

  $ctrl.closeTrialInfo = closeTrialInfo;
  $ctrl.closeTipAdminHasContract = closeTipAdminHasContract;
  $ctrl.addApplication = addApplication;
  $ctrl.disableTemplateClone = false;

  var columns = [
    {
      key: 'app_name',
      label: 'Name',
      class: 'clickable text-left a-underline',
      clickable: true,
      sortable: true,
      skipNatural: true,
      valuePrepareFn: function (value, row) {
        return ['<span style="white-space: nowrap">', value, '<i class="fa fa-external-link" style="margin-left: 6px"></i>', '</span>'].join('');
      },
      alwaysShown: true,
      filterConfig: {
        type: 'string',
      },
    },
  ] as any[];
  if (isMSSPLicensed) {
    columns.push({
      key: 'assign_to',
      label: 'Assigned To',
      sortable: true,
      skipNatural: true,
      filterConfig: {
        type: 'string',
      },
    });
  }
  columns = columns.concat([
    {
      key: 'domain_name',
      label: 'Domain Name',
      class: 'list-word-wrap text-left',
      valuePrepareFn: 'application_domains',
      sortable: true,
      skipNatural: true,
      filterConfig: {
        type: 'string',
      },
    },
  ]);

  if (platform != CLOUD_PLATFORMS.PLAT_C8T.value) {
    columns = columns.concat([
      {
        key: 'platform',
        label: 'Platform',
        sortable: true,
        skipNatural: true,
        filterConfig: {
          type: 'string',
        },
      },
      {
        key: 'region',
        label: 'Region',
        class: 'clickable text-left a-underline',
        clickable: true,
        valuePrepareFn: 'application_region',
        skipNatural: true,
        filterConfig: {
          type: 'string',
        },
      },
    ]);
  }

  columns = columns.concat([
    {
      key: 'dns_status',
      label: 'DNS Status',
      class: 'text-left a-underline',
      thClass: 'text-left',
      clickable: true,
      valuePrepareFn: 'application_dns_status',
      sortable: true,
      skipNatural: true,
      filterConfig: {
        type: 'enum',
        values: [
          ['0', 'Update Pending'],
          ['1', 'OK'],
          ['-1', 'Unknown'],
        ],
      },
    },
  ]);

  if (platform === CLOUD_PLATFORMS.PLAT_C8T.value) {
    columns = columns.concat([
      {
        key: 'ep_cname',
        label: 'IP',
        sortable: true,
        skipNatural: true,
        filterConfig: {
          type: 'string',
        },
      },
    ]);
  }

  columns = columns.concat([
    {
      key: 'blocked_req',
      label: 'Blocked Requests',
      valuePrepareFn: 'application_blocked_attacks',
      sortable: true,
      skipNatural: true,
    },
    {
      key: 'req',
      label: 'Allowed Requests',
      valuePrepareFn: 'application_count',
      sortable: true,
      skipNatural: true,
    },
    {
      key: 'data',
      label: 'Data',
      valuePrepareFn: 'application_data',
      sortable: true,
      skipNatural: true,
    },
  ]);

  if (
    current_license_type == CLOUD_PLATFORMS.PLAT_AWS.value.toLowerCase() ||
    current_license_type == CLOUD_PLATFORMS.PLAT_GCP.value.toLowerCase() ||
    current_license_type == CLOUD_PLATFORMS.PLAT_MAZ.value.toLowerCase()
  ) {
    columns = columns.concat([
      {
        key: 'cost',
        label: 'Estimated Cost',
        valuePrepareFn: 'application_cost',
        sortable: true,
        skipNatural: true,
      },
    ]);
  }

  columns = columns.concat([
    {
      key: 'template_name',
      label: 'Template',
      filterConfig: {
        type: 'string',
      },
    },
    {
      key: 'block_mode',
      label: 'Block Mode',
      type: 'switch',
      valuePrepareFn: 'number_to_switch',
      disabledConditionFn: disableSwitch,
      filterConfig: {
        type: 'enum',
        values: [
          ['0', 'OFF'],
          ['1', 'ON'],
        ],
      },
    },
    {
      key: 'action',
      label: 'Action',
      type: 'action',
      class: 'whitespace-nowrap',
      actions: [
        {
          icon: 'fa fa-edit',
          tooltip: 'Edit',
          fn: editApplication,
          disabledConditionFn: disableEditAction,
        },
        {
          icon: 'fa fa-clone',
          tooltip: 'Clone Template From This Application',
          fn: cloneTemplateFromApplication,
          disabledConditionFn: () => $ctrl.disableTemplateClone,
        },
        {
          icon: 'fa fa-trash-o',
          tooltip: 'Remove',
          fn: removeApplication,
          disabledConditionFn: disableRemoveAction,
        },
      ],
      alwaysShown: true,
    },
  ]);

  columnService.setOriginalColumns($ctrl.listName, columns);

  var gridColumns = columnService.getGridColumns($ctrl.listName);

  $ctrl.gridConfig = {
    itemsByPage: PAGENATOR_SIMPLE_SIZE_SET[PAGENATOR_SIMPLE_SIZE_SET.length - 1], // paginator need
    columns: gridColumns,
  };

  // filter facets need
  $ctrl.facetedSearch = getFacetedSearch();
  $scope.$watch(
    '$ctrl.facetedSearch.model',
    function (value, oldValue) {
      if (value) {
        var regEn = /[#()<>"'\\\?]/im; // copy form validation.js nameCheck(), "" empty need remove because "!abc" -> "! abc".
        var msg = translate('The filter input value cannot contain # ( ) < > " \' ? \\ characters.');
        // "assign_to" special handler
        if (value['_assign_to'] && regEn.test(value['_assign_to'][0].value)) {
          fwcNotify.error(msg);
          return;
        }

        saveFacetedSearchModel(value);
        reload();
      }
    },
    true,
  );

  $scope.$on('grid-switch-change', function (e, value, row, column) {
    var options = {
      ep_id: row.ep_id,
      value: switchToNumber(value),
    };
    if (column.key === 'block_mode') {
      submitBlockMode(options);
    }
  });

  $scope.$on('grid-item-click', function (e, value, row, column) {
    if (column.key === 'app_name' && row) $scope.$emit('choose-application', row);
    else if (column.key === 'region' && row) {
      showRegionIpList(row);
    } else if (column.key === 'dns_status' && row) {
      copyToClipboard(row.ep_cname);
      toggleDetail(row, row.row_index);
    }

    if (column.key === 'app_name' && row && row.assign_to) {
      $scope.$emit('choose-tenant', row);
    }
  });

  $scope.$on('grid-call-server-success', function (e, data) {
    prepareData(data);
  });

  // pagination need
  var pageSize = storage.local.get($ctrl.pageSizeKey) || PAGENATOR_SIMPLE_SIZE_SET[0];
  $scope.$on('get-page-data', function (event, pagination) {
    getData(pagination);
  });

  function showRegionIpList(row) {
    var dlg = dialogs.create(
      'templates/applications/application_region_ip_modal.html',
      'RegionIpModalController',
      row,
      {
        backdrop: 'static',
        keyboard: false,
      },
      'dlg',
    );
  }

  function toggleDetail(appItem, index) {
    var dns: any = {
      can_update: appItem.can_update,
    };

    dns.isC8T = platform && platform === CLOUD_PLATFORMS.PLAT_C8T.value;
    dns.ep_id = appItem.ep_id;

    dns.certAutoStatusTips = {
      domainStatusTip: '',
      dnsEntries: [],
      nakedDomainIpsTip: '',
      acmeTip: '',
      acmeRecords: [],
    };

    if (appItem.domain_status && Object.keys(appItem.domain_status).length > 0) {
      if (dns.isC8T) {
        dns.certAutoStatusTips.domainStatusTip = [translate('endpoint_dns_update_tip_2_C8T'), '"', appItem.ep_cname, '"', ':'].join('');
      } else {
        dns.certAutoStatusTips.domainStatusTip = [translate('endpoint_dns_update_tip_2'), '"', appItem.ep_cname, '"', ':'].join('');
      }

      var domainEntries = Object.entries(appItem.domain_status);
      _.forEach(domainEntries, function (entry) {
        var ele: any = new Object();
        ele.dns = entry[0];
        if (entry[1] === 1) {
          ele.icon = '<img src="/styles/img/ic-ok.svg">';
        } else if (entry[1] === 0) {
          ele.icon = '<img src="/styles/img/ic-pending.svg">';
        } else {
          // entry[1] === -1
          ele.icon = '<i class="ti-help-alt" style="color:red"></i>';
          if ($ctrl.isC8T) {
            ele.tooltip = translate('dns_status_unknown_tooltip_C8T');
          } else {
            ele.tooltip = translate('dns_status_unknown_tooltip');
          }
        }
        dns.certAutoStatusTips.dnsEntries.push(ele);
      });
    }

    if (appItem.naked_domain_ips && appItem.naked_domain_ips.length > 0) {
      if (appItem.naked_domain_ips && appItem.naked_domain_ips.length > 0) {
        const IP_REG = {
          // from validatorsIP.js
          IP: /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
          IPv6: /^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$/,
        };
        let domainIpv4s = [],
          domainIpv6s = [];
        _.map(appItem.naked_domain_ips, (ip) => {
          if (IP_REG.IP.test(ip)) domainIpv4s.push(ip);
          if (IP_REG.IPv6.test(ip)) domainIpv6s.push(ip);
        });
        dns.certAutoStatusTips.nakedDomainIpsTip = translate('endpoint_dns_update_tip_3');
      }
    }

    console.log('acmeRecords', appItem.acme_info);
    if (appItem.acme_info && appItem.acme_info.length > 0) {
      dns.certAutoStatusTips.acmeTip = [translate('endpoint_dns_update_tip_4_2'), '"', appItem.acme_info[0].cname_value, '"', '.'].join('');

      _.forEach(appItem.acme_info, function (entry) {
        var ele: any = new Object();
        ele.cnameName = entry.cname_name;
        if (entry.status === true) {
          ele.icon = '<img src="/styles/img/ic-ok.svg">';
        } else {
          ele.icon = '<img src="/styles/img/ic-pending.svg">';
        }
        dns.certAutoStatusTips.acmeRecords.push(ele);
      });
    }

    if (appItem.acme_info && appItem.acme_info.length > 0) {
      if (appItem.acme_info.length == 1) {
        dns.dnsUpdateTip = [
          translate('endpoint_dns_update_tip_4_1'),
          '"',
          appItem.acme_info[0].cname_name,
          '"',
          translate('endpoint_dns_update_tip_4_2'),
          '"',
          appItem.acme_info[0].cname_value,
          '"',
          translate('endpoint_dns_update_tip_4_3'),
        ].join('');
      } else {
        var cnameNames = '';
        _.forEach(appItem.acme_info, function (item, index) {
          cnameNames = cnameNames.concat('"', item.cname_name, '"', ', ');
        });

        dns.dnsUpdateTip = [
          translate('endpoint_dns_update_tip_4_4'),
          cnameNames,
          translate('endpoint_dns_update_tip_4_5'),
          '"',
          appItem.acme_info[0].cname_value,
          '"',
          translate('endpoint_dns_update_tip_4_3'),
        ].join('');
      }
    }

    var dlg = dialogs.create(
      'templates/applications/application_detail.html',
      'DnsDetailModalController',
      dns,
      {
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal-xl',
      },
      'dlg',
    );
  }

  function reload() {
    getData({
      size: pageSize,
      cursor: '',
      forward: true,
    });
  }

  // filter facets need
  function getFacetedSearch() {
    var facetedSearch: any = {};
    var facets = new Facets();
    var filters = columnService.getColumnFilters($ctrl.listName);
    filters = _.remove(filters, function (filter: any) {
      return filter.key != 'dns_status';
    });
    var extraFacets = facets.genericFacets(filters);
    facets.addFacets(extraFacets);
    facetedSearchUtil.facets = facets.byId();
    facetedSearch.facets = facets;

    facetedSearch.options = {
      entries: function () {
        return $ctrl.filteredData;
      },
      source: 'history',
      complex: true,
      filterMerge: { max: 1 },
    };

    facetedSearch.model = getFacetedSearchModel();

    return facetedSearch;
  }

  // filter facets need
  function getFacetedSearchModel() {
    var model = storage.local.get(fsModelKey);
    if (model) {
      model = facetedSearchUtil.jsonForModel(model);
    } else {
      model = {};
    }
    return model;
  }

  // filter facets need
  function saveFacetedSearchModel(model) {
    storage.local.set(fsModelKey, model);
  }

  function getData(pagination) {
    var url = auth.isTenantUser($ctrl.url);
    pageSize = pagination.size; // paginator need
    var params: any = {
      size: pagination.size, // paginator need
      cursor: pagination.cursor, // paginator need
      forward: pagination.forward, // paginator need
      local_timezone: timeChartService.getOffsetHours() * 60, // get Browser Time Zone in minutes
    };

    // filter facets need
    var filter = $ctrl.facetedSearch.facets.makeQlistFilters($ctrl.facetedSearch.model);
    params.filter = JSON.stringify(filter);

    // get data
    var config = {
      method: 'GET',
      url: url,
      params: params,
      paramSerializer: function (params) {
        var parts = [];
        angular.forEach(params, function (value, key) {
          if (value === null || angular.isUndefined(value)) return;
          parts.push([encodeURIComponent(key), encodeURIComponent(value)].join('='));
        });
        return parts.join('&');
      },
    };
    waitingScreen.appear('Loading...');
    dataService
      .restHTTP(config)
      .then(
        function (data) {
          $ctrl.filteredData = $ctrl.gridData = valuePrepare.prepareBsSwitchValue(gridColumns, data.app_list);
          // paginator need
          pagination.prev_cursor = data.prev_cursor;
          pagination.next_cursor = data.next_cursor;
          pagination.totalCount = data.total;
          $scope.$broadcast('update-pagination', pagination);
          prepareData(data);
        },
        function () {
          // do nothing
        },
      )
      .finally(function () {
        waitingScreen.disappear();
      });
  }

  function prepareData(data) {
    var summary = {
      blocked_req: 0,
      req: 0,
      data: 0,
      cost: 0,
    };

    $ctrl.disableAddApp = !data.can_add;
    if (data.template_perm !== undefined) {
      $ctrl.disableTemplateClone = data.template_perm !== USER_PERMISSION.RW;
    }

    var listData = data.app_list;
    angular.forEach(listData, function (item) {
      for (var field in summary) {
        if (field === 'cost') summary[field] += Math.round(item[field]);
        else if (field === 'req') summary[field] += roundLargeNumber(item[field]);
        else if (field === 'data') summary[field] += roundLargeNumber(item[field], 1024, 3);
        else summary[field] += item[field];
      }
    });
    $ctrl.summary = summary;
  }

  function roundLargeNumber(number, base?, unitnumber?) {
    base = base || 1000;
    unitnumber = unitnumber || 2;
    for (var i = 0; number >= base && i < unitnumber; i++) {
      number = number / base;
    }
    return Math.round(number) * Math.pow(base, i);
  }

  function submitBlockMode(options) {
    var promise;
    var url = [$ctrl.url, '/', options.ep_id, '/block'].join('');
    var submitData = {
      block_mode: options.value,
    };
    waitingScreen.appear('Loading...');
    promise = dataService.put(url, submitData);
    return promise.then(submitSuccess, submitEror);
  }

  function submitSuccess(data) {
    if (data.detail == 'successfully' || !data.detail) fwcNotify.success('Saved successfully!<br>Configuration can take up to 3 minutes to take effect.');
    else fwcNotify.success(data.detail);
    waitingScreen.disappear();
    $state.reload();
  }

  function submitEror() {
    waitingScreen.disappear();
    $state.reload();
  }

  function editApplication(row, index) {
    var dlg = dialogs.create(
      'templates/applications/edit_application_modal.html',
      'EditApplicationModalController',
      row,
      {
        backdrop: 'static',
        keyboard: false,
        ep_id: row.ep_id,
      },
      'dlg',
    );
    dlg.result.then(
      function (dlgData) {
        var promise;
        var url = auth.isTenantUser([$ctrl.url, '/', row.ep_id].join(''));

        if (dlgData.cdn_status === 1) delete dlgData.region;

        waitingScreen.appear('Loading...');
        promise = dataService.put(url, dlgData);

        return promise.then(
          function success(data, status) {
            if (data.detail == 'successfully' || !data.detail) fwcNotify.success('Saved successfully!<br>Configuration can take up to 3 minutes to take effect.');
            else fwcNotify.success(data.detail);
            waitingScreen.disappear();
            $state.reload();
          },
          function error(data, status) {
            waitingScreen.disappear();
            $state.reload();
          },
        );
      },
      function (data) {
        $state.reload();
      },
    );
  }

  function removeApplication(row, index) {
    var dlg = dialogs.confirm(translate('Confirm'), translate('Are you sure you want to delete this application {{name}}?', { name: row.app_name }), {});
    dlg.result.then(
      function (btn) {
        var url = [$ctrl.url, '/', row.ep_id].join('');
        var promise = dataService.del(url);
        waitingScreen.appear('Loading...');
        return promise.then(
          function success(data, status) {
            if (data.detail == 'successfully' || !data.detail) fwcNotify.success('Delete successfully!');
            else fwcNotify.success(data.detail);
            waitingScreen.disappear();
            $state.reload();
          },
          function error(data, status) {
            waitingScreen.disappear();
            $state.reload();
          },
        );
      },
      function (btn) {},
    );
  }

  function cloneTemplateFromApplication(row) {
    const dlg = dialogs.create(
      'templates/templates/template_clone.html',
      'TemplateCloneController',
      { title: 'Clone Template From Application' },
      {
        backdrop: 'static',
        keyboard: false,
      },
      'dlg',
    );

    dlg.result
      .then((dlgData) => {
        waitingScreen.appear('Loading...');

        return dataService.post(auth.isTenantUser('/template/clone'), {
          from_application: row.ep_id,
          name: dlgData.name,
        });
      })
      .then((response) => {
        if (response && response.detail) {
          fwcNotify.success(response.detail);
        }

        waitingScreen.disappear();
      })
      .catch(() => {
        waitingScreen.disappear();
      });
  }

  function switchToNumber(value) {
    return value ? 1 : 0;
  }

  function closeTrialInfo() {
    $ctrl.showTrialInfo = false;
  }

  function closeTipAdminHasContract() {
    $ctrl.tipAdminHasContract = '';
  }

  function addApplication() {
    if ($ctrl.disableAddApp) return;
    $state.go(APPLICATIONS_ADD_SREF);
  }

  function disableEditAction(row) {
    return !row.can_update;
  }

  function disableRemoveAction(row) {
    return !row.can_delete;
  }

  function disableSwitch(row) {
    return !row.can_update;
  }

  function copyToClipboard(text) {
    console.log('text', text);
    var input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', text);
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      console.log('Copy successfully.');
    }
    document.body.removeChild(input);
  }
}

RegionIpModalController.$inject = ['data', '$uibModalInstance'];
function RegionIpModalController(data, $uibModalInstance) {
  var dlg = this;

  dlg.readonly = true;
  dlg.modalInstance = $uibModalInstance;
  dlg.title = 'Allow WAF Cloud IP Addresses';
  dlg.region = data.region;
  dlg.data = {};

  dlg.data = {
    manageIps: data.waf_addresses ? data.waf_addresses.ManagementIP : [],
  };
  delete data.waf_addresses.ManagementIP;
  dlg.data.regionIps = data.waf_addresses;

  dlg.copyToChipboard = function () {
    var input = document.createElement('input');
    document.body.appendChild(input);
    var outputValue = _.reduce(
      dlg.data.regionIps,
      function (result, value, key) {
        if (result != '') result += ',';
        result += `${key}:[`;
        _.map(value, (v, index) => {
          if ((index as unknown as number) != value.length - 1) {
            if (v.ip) result += `${v.ip},`;
            if (v.ip6) result += `${v.ip6},`;
          } else {
            if (v.ip) result += v.ip;
            if (v.ip6) result += v.ip6;
          }
        });
        result += `]`;
        return result;
      },
      '',
    );
    input.setAttribute('value', outputValue);
    input.select();
    if (document.execCommand('copy')) {
      document.execCommand('copy');
      console.log('Copy successfully.');
    }
    document.body.removeChild(input);
  };
}

DnsDetailModalController.$inject = ['data', '$uibModalInstance', 'dataService', 'waitingScreen', 'dateTimeService'];
function DnsDetailModalController(data, $uibModalInstance, dataService, waitingScreen, dateTimeService) {
  var dlg = this;
  var urlDnsInfo = ['/application/', data.ep_id, '?dns_resolve=true'].join('');

  dlg.modalInstance = $uibModalInstance;
  dlg.title = 'DNS Status';
  dlg.data = data;

  dlg.gridConfig_DNS_HTTP = {
    tableClass: 'table dns_status_table',
    columns: [
      {
        key: 'dns_status',
        label: 'Status',
        valuePrepareFn: 'endpoint_dns_status',
      },
      {
        key: 'domain_name',
        label: 'Domain Name',
        class: 'list-word-wrap text-left',
      },
      {
        key: 'current_record',
        label: 'Current DNS Record',
        valuePrepareFn: 'endpoint_dns_current_record',
      },
      {
        key: 'ep_cname',
        label: 'Change To',
        class: 'list-word-wrap text-left',
        valuePrepareFn: 'endpoint_dns_cname',
      },
    ],
  };

  dlg.gridConfig_DNS_Challenge = {
    tableClass: 'table dns_status_table',
    columns: [
      {
        key: 'status',
        label: 'Status',
        valuePrepareFn: 'endpoint_dns_status',
      },
      {
        key: 'type',
        label: 'Type',
      },
      {
        key: 'cname_name',
        label: 'Name',
      },
      {
        key: 'cname_value',
        label: 'Value',
      },
    ],
  };

  dlg.onUpdate = function (method) {
    var promise;

    waitingScreen.appear('Loading...');
    if (method === 'GET') {
      promise = dataService.get(urlDnsInfo);
    } else {
      promise = dataService.put(urlDnsInfo);
    }
    promise.then(
      function (data) {
        waitingScreen.disappear();
        if (!data) return;

        dlg.dnsData = [];
        dlg.dnsChallengeData = [];
        if (data && data.detail === 'successfully') {
          _.forEach(data.result.domain_status, function (value, key) {
            dlg.dnsData.push({ domain_name: key, dns_status: value.dns_status, current_record: value.current_record, ep_cname: data.result.ep_cname });
          });

          if (!_.isEmpty(data.result.naked_domain_ips)) {
            if (data.result.naked_domain_ips.A && data.result.naked_domain_ips.A.length > 0) {
              dlg.data.certAutoStatusTips.nakedDomainIpv4sTip = 'IPv4: ' + data.result.naked_domain_ips.A.join(', ');
            }
            if (data.result.naked_domain_ips.AAAA && data.result.naked_domain_ips.AAAA.length > 0) {
              dlg.data.certAutoStatusTips.nakedDomainIpv6sTip = 'IPv6: ' + data.result.naked_domain_ips.AAAA.join(', ');
            }
          }
          dlg.dnsChallengeData = data.result.acme_info.map((item) => {
            return Object.assign({ type: 'CNAME' }, item);
          });
          dlg.updatedTime = ` ${dateTimeService.changeUtcStrToLocalStr_moment(data.result.update_time, dateTimeService.format_a1)}`;
        }
      },
      function () {
        waitingScreen.disappear();
      },
    );
  };
  dlg.onUpdate('GET');
}

EditApplicationModalController.$inject = ['$scope', 'data', '$uibModalInstance', 'dataService', 'waitingScreen', 'MAP_REGIONS', 'CLOUD_PLATFORMS', 'fwcNotify', 'CONTINENTS', 'auth'];
function EditApplicationModalController($scope, data, $uibModalInstance, dataService, waitingScreen, MAP_REGIONS, CLOUD_PLATFORMS, fwcNotify, CONTINENTS, auth) {
  var dlg = this;
  var urlGetCountryInfo = '/misc/check-ip-region';

  dlg.readonly = false;
  dlg.validate = validate;
  dlg.valuePrepare = valuePrepare;
  dlg.modalInstance = $uibModalInstance;
  dlg.title = 'Edit Application Setting';
  dlg.nameTip = 'Enter a name for your application. Maximum length is 64 and can not contain " and \' characters.';
  dlg.regionOptions = [];
  dlg.regionChangingReminders = [];

  dlg.isC8T = data.platform && data.platform === CLOUD_PLATFORMS.PLAT_C8T.value;

  dlg.continentOptions = [];

  dlg.data = {
    app_name: data.app_name,
    cdn_status: data.cdn_status,
    region: data.platform_region, // is not C8
    user_name: data.user_name,
    alias_name: data.owner,
    assign_to_user_name: data.assign_to_user_name,
    is_global_cdn: 1,
    continent: 'NA',
  };

  waitingScreen.appear('Loading...');
  dataService
    .get(urlGetCountryInfo, {
      platform: data.platform,
      ep_id: data.ep_id,
    })
    .then(
      function (data) {
        waitingScreen.disappear();
        if (!data || !data.platform_regions) return;

        dlg.regionOptions = _.filter(MAP_REGIONS, function (region) {
          return data.platform_regions.indexOf(region.value) !== -1;
        });

        if (!dlg.data.region && dlg.regionOptions.length > 0) {
          dlg.data.region = dlg.regionOptions[0].value;
        }

        // unset region if no regionOption is available
        if (
          dlg.regionOptions
            .map(function (itm) {
              return itm.value;
            })
            .indexOf(dlg.data.region) === -1
        ) {
          dlg.data.region = null;
        }

        if (!dlg.isC8T && data.app_of_dup_domain) {
          dlg.disableCdnSwitch = true;
          var dupDomainTip = [
            'This application shares the same domain name with application ',
            data.app_of_dup_domain,
            '. Its CDN settings are automatically inherited from application ',
            data.app_of_dup_domain,
            '.',
          ].join('');
          fwcNotify.info(dupDomainTip);
        }

        dlg.continentOptions = CONTINENTS.filter(function (itm) {
          return (data.continent_list || []).includes(itm.value);
        });

        Object.keys(dlg.data).forEach(function (p) {
          if (data.hasOwnProperty(p)) {
            dlg.data[p] = data[p];
          }
        });
      },
      function () {
        waitingScreen.disappear();
      },
    );

  dataService.get(auth.isTenantUser(`/application/${data.ep_id}/modules`)).then(
    function (data) {
      var mlbotEnabled = (data || [])
        .filter(function (itm) {
          return itm.id === 'ml_bot_detection' || itm.id === 'machine_learning';
        })
        .find(function (itm) {
          return itm.status === 'enable';
        });

      var apiProtEnabled = (data || []).find(function (itm) {
        return itm.id === 'ml_api_protection' && itm.status === 'enable';
      });

      if (mlbotEnabled) {
        dlg.regionChangingReminders.push({
          msg: 'Machine learning data for Anomaly detection and Bot Detection would be lost if switching region for the application.',
          level: 'danger',
        });
      }

      if (apiProtEnabled) {
        dlg.regionChangingReminders.push({
          msg: 'Machine Learning data of ML API protection may need up to 10 minutes to sync to other regions. The learned data cannot be seen and modified until synchronized.',
          level: 'warning',
        });
      }
    },
    function (data) {},
  );

  $scope.$watch('dlg.data.region', function (newVal, oldVal) {
    if (newVal !== oldVal && dlg.regionChangingReminders.length) {
      dlg.showRegionChangingReminders = true;
    }
  });

  function validate() {
    if (dlg.data.cdn_status === 0 && !(typeof dlg.data.region === 'string' && dlg.data.region.length > 0)) {
      dlg.regionErrMsg = 'This field is required.';
      return true;
    } else {
      dlg.regionErrMsg = null;
      return false;
    }
  }

  function valuePrepare(submitData) {
    if (!submitData.cdn_status) {
      submitData.is_global_cdn = 0;
      submitData.continent = '';
    }
    if (submitData.is_global_cdn) {
      submitData.continent = '';
    }

    return submitData;
  }
}
