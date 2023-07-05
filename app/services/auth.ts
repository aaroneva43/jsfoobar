import _ from 'lodash';
import cookie from 'js-cookie';
import services from './module';
import { MSSP_MODEL, PERM_MODULES, PermModule, STATE_TO_MODULE, USER_PERMISSION, USER_ROLE, type UserPermission } from '../utils/biz/meta';
import { OEM, getApiLocation } from '../utils/biz/meta/domain';
import { CLOUD_PLATFORMS } from '../utils/biz/meta/cloudPlatforms';
import { storage } from '../utils/storage';
services.factory('auth', auth);

export function getUserPermission(url: string): UserPermission {
  var userPermission = storage.local.get('user_permission');
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
  return storage.session.get('user_role');
}

export function isTenant(): boolean {
  return currentUserRole() === USER_ROLE.TENANT;
}

// Current user is a mssp but he/she view the portal in a tenant view
export function isMsspAsTenant(): boolean {
  return currentUserRole() === USER_ROLE.MSSP && storage.session.get('tenant_id') !== null;
}

export function isTenantUser(url: string): string {
  if (storage.session.get('tenant_id')) {
    var tenant_id = encodeURIComponent(storage.session.get('tenant_id'));
    if (url.includes('?')) {
      url = `${url + (url.endsWith('&') ? '' : '&')}tenant=${tenant_id}`;
    } else {
      url = [url, ['tenant', tenant_id].join('=')].join('?');
    }
  }
  return url;
}

auth.$inject = ['$rootScope', '$http', '$state', '$q', 'dataService'];
function auth($rootScope, $http, $state, $q, dataService) {
  return {
    getToken: getToken,
    isReadonly: isReadonly,
    logOut: logOut,
    demoLogin: demoLogin,
    setCookie: setCookie,
    removeCookie: removeCookie,
    isMSSPLicensed: isMSSPLicensed,
    isTenantLicensed: isTenantLicensed,
    isTenantUser: isTenantUser,
    clearAuth: clearAuth,
    getUserPermission: getUserPermission,
    isMenuVisible: isMenuVisible,
  };

  function getToken() {
    var token = storage.session.get('authentication');
    if (token) {
      // already login, check whether account id is inconsistent
      if ($rootScope.account_id && $rootScope.account_id !== storage.session.get('account_id')) {
        // inconsistent account_id, only used in front-end
        // should not be sent by API request
        return 'INCONSISTENT_ACCOUNT';
      }
    }
    return token;
  }

  function isReadonly() {
    var result = false;
    var userPermission = storage.local.get('user_permission');

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
    var url = [getApiLocation(), '/main/logout'].join('');
    var token = getToken();

    if (token === 'INCONSISTENT_ACCOUNT') {
      return new $q.reject();
    }
    return dataService
      .post({
        headers: {
          Authorization: token,
        },
        url: url,
        data: {},
      })
      .finally(function () {
        clearAuth();
      });
  }

  function clearAuth() {
    storage.session.rm([
      'authentication',
      'user_email',
      'is_sub_user',
      'current_license_type',
      'user_role',
      'tenant_id',
      'tenant_name',
      'account_id',
      'platform',
      'mssp_model',
      'mssp_pool_signup',
      'on_premise',
    ]);

    storage.local.rm(['accountData', 'user_error', 'sn', 'trial_info', 'user_permission', 'tenant_permission', 'tip_admin_has_contract', 'access_token', 'build', 'branch', 'buildtime']);

    $rootScope.account_id = null;
  }

  function setCookie(key, value) {
    var domain = window.location.hostname;
    // if(domain.indexOf('www') >= 0)
    // 	domain = domain.replace('www.', '.');
    cookie.put(key, value, { domain: domain });
  }

  function removeCookie(key) {
    var domain = window.location.hostname;
    // if(domain.indexOf('www') >= 0)
    // 	domain = domain.replace('www.', '.');
    cookie.remove(key, { domain: domain });
  }

  function isMSSPLicensed() {
    const { tenantId, userRole, msspModel } = storage.session.get(['tenant_id', 'user_role', 'mssp_model']);

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
    const userRole = storage.session.get('user_role');

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
    var currentLicenseType = storage.session.get('current_license_type');
    var isSubUser = storage.session.get('is_sub_user');
    var advancedConfiguration = storage.local.get('advancedConfiguration');
    var isMssp = storage.session.get('user_role') === USER_ROLE.MSSP;
    var isMsspAsTenant = storage.session.get('tenant_id');
    var appContext = $rootScope.application || $rootScope.template || {};
    var platform = storage.session.get('platform');
    var isC8 = platform === CLOUD_PLATFORMS.PLAT_C8T.value;
    var isTenant = storage.session.get('user_role') === USER_ROLE.TENANT;

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

  function demoLogin() {
    return dataService.post('/saml/demo_login', {}).then(
      function (response) {
        const {
          sn,
          trial_info,
          permission: user_permission,
          version,
          user_data: accountData,
          authentication,
          account_id,
          current_license_type,
          user_role,
          mssp_model,
          platform,
          is_sub_user,
          mssp_pool_signup,
        } = response || {};

        // clear data of last log in
        storage.session.rm(['tenant_id', 'tenant_name', 'fortinet_expired_notification']);
        storage.session.set({
          accountData,
        });

        //if admin has contract, GUI show tip
        storage.session.rm('tip_admin_has_contract');

        storage.local.set({
          sn,
          trial_info,
          user_permission,
          version,
        });

        storage.session.set({
          authentication,
          account_id,
          user_email: 'demo@fortinet.com',
          current_license_type,
          user_role,
          mssp_model,
          platform,
          is_sub_user,
          mssp_pool_signup,
        });
        
      },
      function () {
        // do nothing
      },
    );
  }
}
