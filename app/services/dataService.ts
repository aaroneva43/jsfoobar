import services from './module';
import angular, { IPromise } from 'angular';
services.factory('dataService', dataService);
import { getApiLocation } from '../utils/biz/meta/domain';
import { storage } from '../utils/storage';

export interface IDataService {
  restHTTP: (config: Record<string, any>) => IPromise<any>;
  get: (url: string, params?: Record<string, any>, options?: { throwOnInvalidPerm: boolean }) => IPromise<any>;
  post: (url: string, data?: any) => IPromise<any>;
  putFile: (url: string, data: any) => IPromise<any>;
  put: (url: string, data: Record<string, any>, params?: Record<string, any>) => IPromise<any>;
  del: (url: string, params?: Record<string, any>, data?: Record<string, any>) => IPromise<any>;
  patch: (url: string, data: any) => IPromise<any>;
}

class InvalidUserPermissionError extends Error {
  constructor() {
    super('User does not have the required permissions.');
    this.name = 'InvalidUserPermissionError';
  }
}

dataService.$inject = ['$state', '$q', '$http', /* 'dialogs',  */ '$rootScope'];

function dataService($state, $q, $http): IDataService {
  return {
    restHTTP: restHTTP,
    get: get,
    post: post,
    putFile: putFile,
    put: put,
    del: del,
    patch: patch,
  };

  function notifyError(data) {
    if (data && typeof data === 'object') {
      for (var field in data) {
        if (data[field] instanceof Array) {
          angular.forEach(data[field], function (item) {
            console.error(field + ': ' + item);
          });
        } else {
          console.error(data[field]);
        }
      }
    } else {
      console.error('Unknown error.');
    }
  }

  function restHTTP(config: Record<string, any>) {
    const token = storage.session.get('authentication');
    const defaultConfig = {
      headers: {
        authorization: token,
      },
    };

    // if (token === 'INCONSISTENT_ACCOUNT') {
    //   if (!$rootScope.notifyInconsistentAccountOpen) {
    //     $rootScope.notifyInconsistentAccountOpen = true;
    //     notifyInconsistentAccount();
    //   }
    //   return new $q.reject();
    // }

    config.url = getApiLocation() + config.url;

    config = angular.merge(config, defaultConfig);

    return $http(config)
      .then((rsp) => rsp.data)
      .catch((rsp) => {
        if (rsp.status === 401 || rsp.status === 403) {
          if (rsp?.data?.message === 'invalid_user_permission') {
            if (config.throwOnInvalidPerm) {
              return new $q.reject(new InvalidUserPermissionError());
            } else {
              $state.go('root.no_permission');
            }
          } else {
            console.log('state go login');
            $state.go('index.login');
          }
        } /* else {
        if (!response.config.url.split('?').shift().endsWith('/threat_analytics/incidents')) {
          console.log('notify error');
          notifyError(response.data);
        } else {
          return [];
        }
      } */
        return new $q.reject(rsp.data);
      });
  }

  function get(url, params, options) {
    if (params && typeof params === 'object' && 'throwOnInvalidPerm' in params) {
      options = params;
      params = {};
    } else {
      params = params || {};
      options = options || {};
    }
    return restHTTP({
      method: 'GET',
      params: params || {},
      url: url || '/',
      throwOnInvalidPerm: options.throwOnInvalidPerm,
    });
  }

  function post(url, data) {
    if (data !== undefined) {
      return restHTTP({
        method: 'POST',
        url: url || '/',
        data: data || {},
      });
    } else {
      return restHTTP({
        method: 'POST',
        url: url || '/',
      });
    }
  }

  function putFile(url, data) {
    return restHTTP({
      method: 'PUT',
      url: url || '/',
      headers: {
        'Content-Type': undefined,
      },
      data: data || {},
      transformRequest: function (data, headersGetter) {
        var formData = new FormData();
        angular.forEach(data, function (value, key) {
          if (typeof value != 'object' || value instanceof File) {
            formData.append(key as any, value);
          } else {
            formData.append(key as any, JSON.stringify(value));
          }
        });

        return formData;
      },
    });
  }

  function put(url, data, params) {
    return restHTTP({
      method: 'PUT',
      url: url || '/',
      params: params || {},
      data: data || {},
    });
  }

  function del(url, params, data) {
    return restHTTP({
      method: 'DELETE',
      url: url || '/',
      headers: {
        'Content-Type': 'application/json',
      },
      params: params || {},
      data: data || {},
    });
  }

  function patch(url, data) {
    return restHTTP({
      method: 'PATCH',
      url: url || '/',
      data: data || {},
    });
  }

  // function notifyInconsistentAccount() {
  //   var dlg = dialogs.create(
  //     'templates/directives/notify_inconsistent_account.html',
  //     'NotifyInconsistentAccountController',
  //     {},
  //     {
  //       backdrop: 'static',
  //       keyboard: false,
  //     },
  //     'dlg',
  //   );
  //   dlg.result.then(
  //     function () {
  //       $rootScope.notifyInconsistentAccountOpen = false;
  //       $state.go('root', {}, { reload: true });
  //     },
  //     function () {
  //       $rootScope.notifyInconsistentAccountOpen = false;
  //       $state.go('root', {}, { reload: true });
  //     },
  //   );
  // }
}
