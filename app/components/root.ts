import angular from 'angular';
import { storage } from '../utils/storage';
import module from './module';
import { FWC_MENU } from '../utils/biz/meta/menu';
import { OEM } from '../utils/biz/meta/domain';
import $ from 'jquery';
import { pick, flatMapDeep, flatMap } from 'lodash-es';

import { isTemplate, isInTenant } from '../utils/biz/common';
import {
  APPLICATIONS_ADD_SREF,
  CONTRACTS_SREF,
  CONTRACT_MANAGEMENT_SREF,
  TENANTMANAGEMENT_ADD_SREF,
  NO_PERMISSION_SREF,
  ROLE_MANAGEMENT_DLG_SREF,
  INCIDENT_MONITOR,
  CUSTOM_BLOCK_PAGE_DLG_SELF,
  WAF_GATEWAYS,
  ATTACK_LOGS,
} from '../utils/biz/meta/state';
import { USER_ROLE, DEMO_USER_EMAIL, LINKS } from '../utils/biz/meta/index';
import { CLOUD_PLATFORMS } from '../utils/biz/meta/cloudPlatforms';
import { react2angular } from 'react18-react2angular';
// import MyComponent from './root_react.jsx';

module.component('root', {
  templateUrl: 'templates/root.html',
  controller,
});
// module.component('root', react2angular(MyComponent, [], ['$state', '$stateParams', 'auth', 'dataService']));

controller.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'auth', 'dataService'];

function controller($scope, $rootScope, $state, $stateParams, auth, dataService) {
  var $ctrl = this;

  var configUrl = '/misc/common_config';

  $.get({ url: './data/syscfg.json', cache: false }).done(function (rsp) {
    if (rsp.system_maintaining === true) {
      $state.go('index.maintenance');
    }
  });

  $ctrl.readonly = auth.isReadonly; //  auth.isReadonly not auth.isReadonly(), This is a special handler that root.html can monitor this value.
  $ctrl.isMssp = storage.session.get('user_role') == USER_ROLE.MSSP;
  $ctrl.inTenant = isInTenant();

  $ctrl.sn = storage.local.get('sn') || '';
  $ctrl.version = storage.local.get('version') || '';

  $ctrl.rootTitle = '';
  $ctrl.rootTitleTooltip = '';
  $ctrl.currentApplication = '';
  $ctrl.currentSwitchStatus = true;
  $ctrl.currentEpid = '';

  $ctrl.isNoPermission = false;
  $ctrl.currentYear = new Date().getFullYear();

  $ctrl.addModule = addModule;
  $ctrl.toggleMinimize = toggleMinimize;
  $ctrl.toggleNavbar = toggleNavbar;
  $ctrl.switchChange = switchChange;
  $ctrl.openPrivacyPolicy = openPrivacyPolicy;
  $ctrl.openTermsOfService = openTermsOfService;
  $ctrl.contractsRefresh = contractsRefresh;
  $ctrl.backToMssp = backToMssp;
  $ctrl.deployFromAws = deployFromAws;
  $ctrl.deployFromAzure = deployFromAzure;
  $ctrl.deployFromGoogle = deployFromGoogle;

  $ctrl.isTemplate = isTemplate($state);

  if (OEM) {
    $ctrl.sn = '';
  } else {
    $ctrl.sn = storage.local.get('sn') || '';

    if (storage.session.get('user_email') == DEMO_USER_EMAIL || storage.session.get('current_license_type') == 'none') {
      $ctrl.showSubscribe = true;
    }
  }

  Object.assign($ctrl, storage.local.get(['version', 'build', 'branch', 'buildtime']));

  // Store account_id in $rootScope when root is loaded
  $rootScope.account_id = storage.session.get('account_id');

  $scope.$on('appear-waiting-screen', appearWaitingScreen);
  $scope.$on('disappear-waiting-screen', disappearWaitingScreen);

  $scope.$on('state-changed', function (e, transition) {
    dataService.get(auth.isTenantUser(configUrl)).then(
      function (configData) {
        if (configData) {
          storage.local.set({
            advancedConfiguration: configData?.AdvancedConfiguration === 'enable',
          });
          afterStateChanged(transition);
        }
      },
      function () {
        afterStateChanged(transition);
      },
    );
  });

  // choose-tenant trigger from other controllers
  $scope.$on('choose-tenant', function (e, row) {
    if (row.user_id) {
      const tenant_name = row.assign_to || row.alias || row.user_name;
      const tenant_id = row.tenant_id || row.user_id;

      storage.session.set({
        tenant_id,
        tenant_name,
      });

      $ctrl.inTenant = isInTenant();

      if ($state.current.name === 'root.applications') {
        $state.go('root.application.dashboard', { ep_id: row.ep_id });
      } else {
        dataService.get(auth.isTenantUser(configUrl)).then(
          function (data) {
            const advanced = data?.AdvancedConfiguration;
            if (advanced) storage.local.set('advancedConfiguration', advanced === 'enable');

            $state.go('root.applications', { ep_id: row.ep_id });
          },
          function () {
            console.warn('Need advancedConfiguration of tenant: ' + tenant_name);
          },
        );
      }
    }
  });

  $scope.$on('choose-application', function (e, row) {
    $ctrl.currentEpid = row.ep_id;
    $rootScope.application = row;
    $state.go('root.application.dashboard', { ep_id: row.ep_id });
  });

  $scope.$on('choose-template', function (e, row) {
    var targetState;
    var flatData = flatMap(FWC_MENU, function (d) {
      return d.children || d;
    });
    // find target state in available menu modules
    flatData.some((item) => {
      if (!item || !item.tplsref || !row.features.includes(item.id)) {
        return false;
      }

      targetState = item.tplsref;
      return true;
    });
    if (!targetState) {
      targetState = 'root.template';
    }
    $state.go(targetState, { template_id: row.template_id });
  });

  $scope.$on('root-title-changed', function (e, title, tooltip) {
    $ctrl.rootTitle = title;
    $ctrl.rootTitleTooltip = tooltip;
  });

  $scope.$on('block-mode-changed', function (e, status) {
    $ctrl.currentSwitchStatus = status == 0 ? false : true;
  });

  $scope.$on('menu-config-changed', function (e, data) {
    dataService.get(auth.isTenantUser(configUrl)).then(
      function (configData) {
        if (configData) {
          storage.local.set({
            advancedConfiguration: configData?.AdvancedConfiguration === 'enable',
          });
          afterMenuConfigChanged(data);
        }
      },
      function () {
        afterMenuConfigChanged(data);
      },
    );
  });

  function afterMenuConfigChanged(data) {
    var menuItems;
    if ($state.includes('root.template')) {
      menuItems = getTemplateMenu(FWC_MENU, data);
    } else if (!data || !data.length) {
      menuItems = getDefaultMenu(FWC_MENU);
    } else {
      menuItems = getApplicationMenu(FWC_MENU, data);
    }

    $ctrl.menuItems = cookMenuItems(angular.copy(menuItems));
    $ctrl.menuItems = $ctrl.menuItems.filter((item) => !item.children || item.children.length > 0);
  }

  function afterStateChanged(transition) {
    var stateName = transition.to().name;
    $ctrl.minimize = false;
    $ctrl.currentItem = '';
    $ctrl.currentChild = '';
    $ctrl.showContractsRefresh = false;
    $ctrl.showBlockMode = false;
    $ctrl.isTemplate = isTemplate($state);

    const adminInTenant = isInTenant();
    const tenantName = storage.session.get('tenant_name');

    if (stateName === APPLICATIONS_ADD_SREF) {
      stateName = stateName.substring(0, stateName.indexOf('Add'));
    }
    if (stateName === TENANTMANAGEMENT_ADD_SREF) {
      stateName = stateName.substring(0, stateName.indexOf('Add'));
    }
    if (stateName === CONTRACTS_SREF || stateName === CONTRACT_MANAGEMENT_SREF) {
      // $ctrl.showContractsRefresh = auth.isReadonly() ? false : true;
      // Do not display refresh contract button in such cases:
      // 1.OEM 2.admin 3.tenant 4.tenant admin
      if ((!OEM && !isInTenant && storage.session.get('is_sub_user') == 'false') || !storage.session.get('is_sub_user')) {
        $ctrl.showContractsRefresh = true;
      }
    }
    if (stateName === ROLE_MANAGEMENT_DLG_SREF) {
      var roleDlgParams = transition._targetState._params;
      if (roleDlgParams && roleDlgParams.role_name) {
        $ctrl.rootTitle = 'Edit Role';
      } else {
        $ctrl.rootTitle = 'Add Role';
      }
      $ctrl.minimize = true;
      $ctrl.rootTitleTooltip = '';
    }
    if (stateName === CUSTOM_BLOCK_PAGE_DLG_SELF) {
      var params = transition._targetState._params;
      if (params && params.msg_name) {
        $ctrl.rootTitle = 'Edit Message';
      } else {
        $ctrl.rootTitle = 'Add Message';
      }
      $ctrl.minimize = true;
      $ctrl.rootTitleTooltip = '';
    }
    if (stateName === INCIDENT_MONITOR) {
      $ctrl.rootTitle = 'Threat Analytics';
      $ctrl.minimize = true;
      $ctrl.rootTitleTooltip = '';

      if (adminInTenant && tenantName) {
        $ctrl.rootTitle = `${$ctrl.rootTitle} (Tenant: ${tenantName})`;
        $ctrl.rootTitleTooltip = '';
      }
    }
    if (stateName === WAF_GATEWAYS) {
      $ctrl.rootTitle = 'WAF Gateways';
      $ctrl.minimize = true;
    }
    if (stateName === ATTACK_LOGS) {
      $ctrl.rootTitle = 'Attack Logs';
      $ctrl.minimize = true;

      if (adminInTenant && tenantName) {
        $ctrl.rootTitle = `${$ctrl.rootTitle} (Tenant: ${tenantName})`;
        $ctrl.rootTitleTooltip = '';
      }
    }
    if ($state.includes('root.application')) {
      $ctrl.showBlockMode = true;
    }

    angular.forEach(FWC_MENU, function (item) {
      if (item.sref) {
        if (item.sref === stateName || item.tplsref === stateName) {
          $ctrl.currentItem = item.id;
        }
      } else {
        var getL1MenuById = function (menuId) {
          var find = function (menu, id) {
            var f = false;
            var iter = function (menu, id) {
              if (menu.id === id) f = true;
              if (menu.children) {
                for (var i = 0; i < menu.children.length; i++) {
                  var itm = menu.children[i];
                  if (f === false) f = find(itm, id);
                }
              }
              return f;
            };
            return iter(menu, id);
          };

          return (
            FWC_MENU.find(function (itm) {
              return find(itm, menuId);
            }) || ({} as { [key: string]: undefined })
          );
        };
        var handleChildren = function (menuItem) {
          angular.forEach(menuItem.children, function (child) {
            if ((child.sref && (child.sref === stateName || stateName.indexOf(child.sref) >= 0)) || (child.tplsref && (child.tplsref === stateName || stateName.indexOf(child.tplsref) >= 0))) {
              $ctrl.currentItem = menuItem.id;
              $ctrl.currentChild = child.id;

              if (['mssp', 'global'].indexOf(getL1MenuById($ctrl.currentItem).id) > -1) {
                $ctrl.minimize = true;
                $ctrl.rootTitle = child.label;
                const { tenant_id, tenant_name } = storage.session.get(['tenant_id', 'tenant_name']);
                if (tenant_id && tenant_name) {
                  $ctrl.rootTitle = `${$ctrl.rootTitle} (Tenant: ${tenant_name});`;
                }
                $ctrl.rootTitleTooltip = '';
              }
            }

            if (child.children) handleChildren(child);
          });
        };

        handleChildren(item);
      }
    });

    if (stateName === NO_PERMISSION_SREF) {
      $ctrl.isNoPermission = true;
      $ctrl.menuItems = cookMenuItems(getGlobalMenu(FWC_MENU));
      $('body').removeClass('sidebar-mini');
      return;
    }

    if (!$ctrl.minimize) {
      $ctrl.menuItems = cookMenuItems($ctrl.menuItems || getDefaultMenu(FWC_MENU));
      $('body').removeClass('sidebar-mini');
    } else {
      $ctrl.menuItems = cookMenuItems(getGlobalMenu(FWC_MENU));
      $('body').addClass('sidebar-mini');
    }
  }

  function appearWaitingScreen(event, message) {
    $ctrl.appearWaitingScreen = true;
    $ctrl.waitingMessage = message;

    // show new feature tour
    try {
      const { version, toursBrowsed = [] } = storage.local.get(['version', 'tourOK']);

      if (!OEM && auth.getNewFeatureTourTemplates().length && !toursBrowsed.includes(version)) {
        // dialogs.create(
        //   'templates/new_feature_tour/tour.html',
        //   'newFeatureTourController',
        //   {},
        //   {
        //     windowClass: 'new-feature-tour',
        //   },
        //   '$ctrl',
        // );
      }
    } catch (error) {
      if (error.name === 'GET_NEW_FEATURE_TOUR_TPL_FAIL') {
        console.warn(error.msg);
      } else {
        console.error(error);
      }
    }
  }

  function disappearWaitingScreen() {
    $ctrl.appearWaitingScreen = false;
  }

  function addModule() {
    // console.log($ctrl.menuItems);
    // var dlg = dialogs.create(
    //   'templates/menu_component.html',
    //   'menuComponentController',
    //   $ctrl.menuItems,
    //   {
    //     backdrop: 'static',
    //     keyboard: false,
    //   },
    //   'dlg',
    // );
    // dlg.result.then(
    //   function (data) {
    //     var menuItems;
    //     if ($state.includes('root.template')) {
    //       menuItems = getTemplateMenu(FWC_MENU, data);
    //     } else {
    //       menuItems = getApplicationMenu(FWC_MENU, data);
    //     }
    //     $ctrl.menuItems = cookMenuItems(angular.copy(menuItems));
    //   },
    //   function () {},
    // );
    // return dlg.result;
  }

  function minimizeSidebar() {
    $ctrl.minimize = true;
    $('body').addClass('sidebar-mini');

    if ($state.includes('root.template')) {
      $state.go('root.templates');
    } else {
      $state.go('root.applications');
    }
  }

  function maximizeSidebar() {
    // $ctrl.minimize = false;
    // $('body').removeClass('sidebar-mini');
  }

  function toggleMinimize(flag) {
    if (typeof flag === 'undefined') {
      if ($ctrl.minimize) {
        maximizeSidebar();
      } else {
        minimizeSidebar();
      }
    } else {
      if (flag) {
        minimizeSidebar();
      } else {
        maximizeSidebar();
      }
    }
  }

  function toggleNavbar() {
    $('body').toggleClass('nav-open');
    $('.navbar-toggle').toggleClass('toggled');
  }

  function switchChange() {
    var promise;
    var url = ['/application/', $stateParams.ep_id ? $stateParams.ep_id : $ctrl.currentEpid, '/block'].join('');
    var submitData = {
      block_mode: $ctrl.currentSwitchStatus == true ? 1 : 0,
    };
    promise = dataService.put(url, submitData);

    return promise.then(
      function success(data, status) {
        if (data.detail == 'successfully' || !data.detail) {
          // fwcNotify.success('Saved successfully!<br>Configuration can take up to 3 minutes to take effect.');
        } else {
          // fwcNotify.success(data.detail);
        }
        $state.reload();
      },
      function error(data, status) {
        $state.reload();
      },
    );
  }

  function openPrivacyPolicy() {
    window.open(LINKS.PRIVACY_POLICY_URL);
  }

  function openTermsOfService() {
    window.open(LINKS.TERMS_OF_SERVICE_URL);
  }

  function processMenuItems(constantItems, savedItems, filterFunc) {
    var menuItems: any[] = [];

    (constantItems || []).forEach(function (constantItem) {
      var item: any = pick(constantItem, ['label', 'id', 'icon', 'sref', 'tplsref', 'mini']);
      if (constantItem.sref) {
        // leaf node
        if (filterFunc(constantItem, savedItems)) {
          var find = find(savedItems, { id: constantItem.id });
          if (find) {
            item.inherited = find.inherited;
          }
          menuItems.push(item);
        }
      } else {
        // non-leaf node
        if (!constantItem.children || !constantItem.children.length) {
          console.log('menu config error.');
        } else {
          var children = processMenuItems(constantItem.children, savedItems, filterFunc);
          if (children.length) {
            item.children = children;
            menuItems.push(item);
          }
        }
      }
    });

    return menuItems;
  }

  function getGlobalMenu(constantItems) {
    return constantItems.filter((item) => item.global);
  }

  function getDefaultMenu(constantItems) {
    function defaultFilter(constantItem, savedItems) {
      return !constantItem.config || (constantItem.config && constantItem.default);
    }
    return processMenuItems(constantItems, [], defaultFilter);
  }

  function getApplicationMenu(constantItems, data) {
    function inSavedFilter(constantItem, savedItems) {
      var find = find(savedItems, { id: constantItem.id });
      return !constantItem.config || (find && find.status != 'disable');
    }
    var flatData = flatMenu(data);
    return processMenuItems(constantItems, flatData, inSavedFilter);
  }

  function getTemplateMenu(constantItems, data) {
    function inSavedFilter(constantItem, savedItems) {
      var is_global = [
        'tenantmanagement',
        'applications',
        'auditlogs',
        'reports',
        'adminmanagement',
        'rolemanagement',
        'templates',
        'contracts',
        'fabric_connectors',
        'settings',
        'threat_analytics',
        'attack_logs',
        'waf_gateways',
      ].includes(constantItem.id);
      var find = find(savedItems, { id: constantItem.id });
      return is_global || (constantItem.template && find && find.status == 'enable');
    }
    var flatData = flatMenu(data);
    return processMenuItems(constantItems, flatData, inSavedFilter);
  }

  function flatMenu(menu) {
    return flatMapDeep(menu, function (d) {
      var item = [pick(d, ['id', 'status', 'inherited'])];
      if (Array.isArray(d.children)) {
        item.push(d.children);
      }
      return item;
    });
  }

  function cookMenuItems(menus = []) {
    return menus.filter(auth.isMenuVisible).forEach((item) => {
      if ($ctrl.isMssp && item.id == 'global') {
        item.label = `Global ${isInTenant() ? '(Tenant)' : '(MSSP)'}`;
      }
      if (item.children) {
        item.children = cookMenuItems(item.children);
      }
    });
  }

  function contractsRefresh() {
    const { tenant_id, is_sub_user } = storage.session.get(['tenant_id', 'is_sub_user']);
    if (tenant_id) {
      return;
    }
    if (is_sub_user && is_sub_user != 'false') {
      return;
    }

    var url_refresh = '/misc/contract/refresh';

    dataService.get(url_refresh).then(
      function (data) {
        // Update login info
        const { permission: user_permission, current_license_type, is_sub_user, user_role, mssp_model, platform } = data;
        if (user_permission) {
          storage.local.set({
            user_permission,
          });
          storage.session.set({
            current_license_type,
            is_sub_user,
            user_role,
            mssp_model,
            platform,
          });
        }

        // fwcNotify.success(data.detail);
        $state.reload();
      },
      function (data) {},
    );
  }

  function backToMssp() {
    sessionStorage.removeItem('tenant_id');
    sessionStorage.removeItem('tenant_name');
    $ctrl.inTenant = false;
    $state.go('root', {}, { reload: true });
  }

  function deployFromAws() {
    window.open(CLOUD_PLATFORMS.PLAT_AWS.marketUrl);
  }

  function deployFromAzure() {
    window.open(CLOUD_PLATFORMS.PLAT_MAZ.marketUrl);
  }

  function deployFromGoogle() {
    window.open(CLOUD_PLATFORMS.PLAT_GCP.marketUrl);
  }
}
