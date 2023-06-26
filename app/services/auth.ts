import _ from 'lodash';
import services from './module';
import { MSSP_MODEL, PERM_MODULES, PermModule, STATE_TO_MODULE, USER_PERMISSION, USER_ROLE, type UserPermission } from '../utils/biz/meta';
import { OEM } from '../constants/siteRelated';
import fwcStorage from './storage';
import { NEW_FEATURE_TOUR } from '../constants/newFeatureTour';
import { CLOUD_PLATFORMS } from '../constants/cloudPlatform';
import apiConfigService from './apiConfig';
import { storage } from '../utils/storage';

export function getUserPermission(url: string): UserPermission {
  var userPermission = fwcStorage.get('user_permission');
  var permission;

  switch (userPermission[url]) {
    case USER_PERMISSION.RO:
      permission = USER_PERMISSION.RO;
      break;

    case USER_PERMISSION.RW:
      permission = USER_PERMISSION.RW;
      break;

    case USER_PERMISSION.NONE:
    default:
      permission = USER_PERMISSION.NONE;
      break;
  }

  return permission;
}

export function currentUserRole(): string {
  return sessionStorage.getItem('user_role');
}

export function isTenant(): boolean {
  return currentUserRole() === USER_ROLE.TENANT;
}

// Current user is a mssp but he/she view the portal in a tenant view
export function isMsspAsTenant(): boolean {
  return currentUserRole() === USER_ROLE.MSSP && sessionStorage.getItem('tenant_id') !== null;
}

export function isTenantUser(url: string): string {
  if (sessionStorage.getItem('tenant_id')) {
    var tenant_id = encodeURIComponent(sessionStorage.getItem('tenant_id'));
    if (url.includes('?')) {
      url = `${url + (url.endsWith('&') ? '' : '&')}tenant=${tenant_id}`;
    } else {
      url = [url, ['tenant', tenant_id].join('=')].join('?');
    }
  }
  return url;
}

services.factory('auth', auth);

auth.$inject = ['$rootScope', '$cookies', '$http', 'waitingScreen', '$state', '$q'];
function auth($rootScope, $cookies, $http, waitingScreen, $state, $q) {
  return {
    getToken: getToken,
    isReadonly: isReadonly,
    logOut: logOut,
    setCookie: setCookie,
    removeCookie: removeCookie,
    isMSSPLicensed: isMSSPLicensed,
    isTenantLicensed: isTenantLicensed,
    isTenantUser: isTenantUser,
    clearAuth: clearAuth,
    getUserPermission: getUserPermission,
    isMenuVisible: isMenuVisible,
    getNewFeatureTourTemplates: getNewFeatureTourTemplates,
  };

  function getToken() {
    var token = sessionStorage.getItem('authentication');
    if (token) {
      // already login, check whether account id is inconsistent
      if ($rootScope.account_id && $rootScope.account_id !== sessionStorage.getItem('account_id')) {
        // inconsistent account_id, only used in front-end
        // should not be sent by API request
        return 'INCONSISTENT_ACCOUNT';
      }
    }
    return token;
  }

  function isReadonly() {
    var result = false;
    var userPermission = fwcStorage.get('user_permission');

    if ($state.includes('root.application')) {
      if ($rootScope['application'] && 'can_update' in $rootScope['application']) {
        result = !$rootScope['application']['can_update'];
      } else {
        var permission = userPermission['/application'];
        if (permission !== USER_PERMISSION.RW) {
          result = true;
        }
      }
    } else if ($state.includes('root.template')) {
      if ($rootScope.template && $rootScope.template.predefine) {
        result = true;
      } else {
        var permission = userPermission['/template'];
        if (permission == USER_PERMISSION.RO) {
          result = true;
        }
      }
    } else if ($state.includes('root.contracts')) {
      var permission = userPermission['/contract'];
      if (permission != USER_PERMISSION.RW) {
        result = true;
      }
    } else if ($state.includes('root.attacklogs')) {
      var permission = userPermission['/threat_analytics'];
      if (permission != USER_PERMISSION.RW) {
        result = true;
      }
    } else if ($state.includes('root') && userPermission) {
      var matchModule = PERM_MODULES.ALL as PermModule;
      var permission;
      // if($state.current.name in STATE_TO_MODULE)
      // 	matchModule = STATE_TO_MODULE[$state.current.name];
      _.forEach(STATE_TO_MODULE, function (val, key) {
        if ($state.includes(key)) {
          matchModule = STATE_TO_MODULE[key];
        }
      });
      if (matchModule in userPermission) {
        permission = userPermission[matchModule];
      } else {
        permission = userPermission[PERM_MODULES.ALL];
      }
      if (matchModule == '/incidents') {
        // module is /incidents, depends on /threat_analytics
        permission = userPermission['/threat_analytics'];
      }
      if (permission == USER_PERMISSION.RO) {
        result = true;
      }
    }
    return result;
  }

  function logOut() {
    var apiLocation = apiConfigService.getApiLocation();
    var url = [apiLocation, '/main/logout'].join('');
    var token = getToken();

    if (token === 'INCONSISTENT_ACCOUNT') {
      return new $q.reject();
    }
    waitingScreen.appear();
    return $http({
      method: 'POST',
      headers: {
        Authorization: token,
      },
      url: url,
      data: {},
    }).finally(function () {
      waitingScreen.disappear();
      clearAuth();
    });
  }

  function clearAuth() {
    var domain = window.location.hostname.replace('www.', '.');
    sessionStorage.removeItem('authentication');
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('is_sub_user');
    sessionStorage.removeItem('current_license_type');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('tenant_id');
    sessionStorage.removeItem('tenant_name');
    sessionStorage.removeItem('account_id');
    sessionStorage.removeItem('platform');
    sessionStorage.removeItem('mssp_model');
    sessionStorage.removeItem('mssp_pool_signup');
    sessionStorage.removeItem('on_premise');

    fwcStorage.remove('accountData');
    fwcStorage.remove('user_error');
    fwcStorage.remove('sn');
    fwcStorage.remove('trial_info');
    fwcStorage.remove('user_permission');
    fwcStorage.remove('tenant_permission');
    fwcStorage.remove('tip_admin_has_contract');
    fwcStorage.remove('access_token');
    fwcStorage.remove('build');
    fwcStorage.remove('branch');
    fwcStorage.remove('buildtime');

    $rootScope.account_id = null;
  }

  function setCookie(key, value) {
    var domain = window.location.hostname;
    // if(domain.indexOf('www') >= 0)
    // 	domain = domain.replace('www.', '.');
    $cookies.put(key, value, { domain: domain });
  }

  function removeCookie(key) {
    var domain = window.location.hostname;
    // if(domain.indexOf('www') >= 0)
    // 	domain = domain.replace('www.', '.');
    $cookies.remove(key, { domain: domain });
  }

  function isMSSPLicensed() {
    var tenantId = sessionStorage.getItem('tenant_id');
    var userRole = sessionStorage.getItem('user_role');
    var msspModel = sessionStorage.getItem('mssp_model');

    if (tenantId) {
      return false;
    } else {
      if (userRole == USER_ROLE.MSSP && msspModel == MSSP_MODEL.MSSP_LICENSED) {
        return true;
      } else {
        return false;
      }
    }
  }

  function isTenantLicensed() {
    const { tenantId, userRole, msspModel } = storage.session.get(['tenant_id', 'user_role', 'mssp_model']);

    if (msspModel != MSSP_MODEL.MSSP_LICENSED) {
      return false;
    } else {
      if (userRole == USER_ROLE.TENANT || tenantId) {
        return true;
      } else {
        return false;
      }
    }
  }

  function isMsspOrTenantOrOEM() {
    const userRole = sessionStorage.getItem('user_role');

    if (userRole === USER_ROLE.MSSP || userRole === USER_ROLE.TENANT) {
      return true;
    }

    // userRole can be '' when MSSP tenant is with no contract
    if (userRole === '' && (OEM === 'c8' || OEM === 'jisc' || OEM === 'tim')) {
      return true;
    }

    return false;
  }

  function isMenuVisible(menu) {
    var visible = true;
    var id = typeof menu === 'string' ? menu : menu.id;
    var currentLicenseType = sessionStorage.getItem('current_license_type');
    var isSubUser = sessionStorage.getItem('is_sub_user');
    var advancedConfiguration = fwcStorage.get('advancedConfiguration');
    var isMssp = sessionStorage.getItem('user_role') === USER_ROLE.MSSP;
    var isMsspAsTenant = sessionStorage.getItem('tenant_id');
    var appContext = $rootScope.application || $rootScope.template || {};
    var platform = sessionStorage.getItem('platform');
    var isC8 = platform === CLOUD_PLATFORMS.PLAT_C8T.value;
    var isTenant = sessionStorage.getItem('user_role') === USER_ROLE.TENANT;

    if (['adminmanagement', 'settings'].includes(id)) {
      if (currentLicenseType === 'none' && !isSubUser) visible = false;
    }

    if (id === 'templates') {
      if (!advancedConfiguration || advancedConfiguration == 'false') visible = false;
    }

    if (id === 'mssp') {
      if (!isMssp || isMsspAsTenant) visible = false;
    }

    if (id === 'ml_api_protection' || id === 'trafficsummary') {
      if (isC8) visible = false;
    }

    if (id === 'contracts') {
      if (isMssp && !isMsspAsTenant) visible = false;
    }

    if (id == 'contractmanagement') {
      if (!isMssp || isMsspAsTenant) visible = false;
    }

    if (id === 'VulnerabilityScan') {
      if (isMsspOrTenantOrOEM()) visible = false;
    }

    if (id === 'waf_gateways') {
      if (isMssp || isTenant) visible = false;
    }

    // This is not a module id, but a new-tour id (on-premise TA)
    if (id === 'threat_analytics_appliances') {
      if (isMsspOrTenantOrOEM()) visible = false;
    }

    return visible;
  }
}
