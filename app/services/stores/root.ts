import { makeAutoObservable, observable, computed, toJS } from 'mobx';
import { storage } from '../../utils/storage';
import { USER_ROLE, DEMO_USER_EMAIL, LINKS } from '../../utils/biz/meta/index';
import { isInTenant } from '../../utils/biz/common';
import eventbus from '../../utils/eventbus';

declare global {
  interface Window {
    t: any;
  }
}

class RootStore {
  stateName: string;
  configUrl = '/misc/common_config';

  auth: Record<string, any> = {};
  isMssp = storage.session.get('user_role') == USER_ROLE.MSSP;
  inTenant = isInTenant();

  sn = storage.local.get('sn') || '';
  version = storage.local.get('version') || '';

  rootTitle = '';
  rootTitleTooltip = '';
  currentApplication = '';
  currentSwitchStatus = true;
  currentEpid = '';

  isNoPermission = false;

  get readonly() {
    return this.$inject.auth?.isReadonly;
  }

  // addModule = addModule;
  // toggleMinimize = toggleMinimize;
  // toggleNavbar = toggleNavbar;
  // switchChange = switchChange;
  // openPrivacyPolicy = openPrivacyPolicy;
  // openTermsOfService = openTermsOfService;
  // contractsRefresh = contractsRefresh;
  // backToMssp = backToMssp;
  // deployFromAws = deployFromAws;
  // deployFromAzure = deployFromAzure;
  // deployFromGoogle = deployFromGoogle;

  $inject: Record<string, any>;

  constructor($inject: Record<string, any>) {
    makeAutoObservable(this);
    Object.assign(this, { $inject });

    const { $state, dataService, auth } = this.$inject;
    const { configUrl, onStateChanged } = this;
    window.t = eventbus;

    eventbus.on(
      'state-changed',
      function onStateChange(e, transition) {
        console.log(transition);
        dataService.get(auth.isTenantUser(configUrl)).then(
          function (configData) {
            if (configData) {
              storage.local.set({
                advancedConfiguration: configData?.AdvancedConfiguration === 'enable',
              });
              onStateChanged(transition, $state);
            }
          },
          function () {
            onStateChanged(transition, $state);
          },
        );
      },
      this,
    );
  }

  init() {}

  onStateChanged(transition, $state) {
    console.log('onStateChanged', $state);
  }
  // get time() {
  //   return new Date(this.tick).toLocaleString();
  // }
  get plusone() {
    return this.tick + 1;
  }

  reset() {
    this.tick = 0;
  }

  increase() {
    this.tick += 1;
  }

  autoBind(scope: any) {
    return Object.keys(scope).reduce((acc, method) => {
      if (typeof this[method] === 'function' && !method.startsWith('$')) acc[method] = scope[method].bind(scope);
      return acc;
    }, {});
  }
}

export default RootStore;
