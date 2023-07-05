import controllers from '../module';
import angular from 'angular';
import { makeObservable, observable, computed, toJS } from 'mobx';
import { storage } from '../../utils/storage';

controllers.controller('LoginController', LoginController);

class fooModel {
  value = 0;
  entries = [{ a: 1 }, { a: 23 }];
  constructor() {
    makeObservable(this, {
      value: observable,
      entries: observable,
    });
  }
}
class ViewModel {
  ref = new fooModel();

  constructor(price: number) {
    makeObservable(this, {
      ref: observable,
    });
  }

  get deeep() {
    return this.ref.value + 1;
  }

  reset() {
    this.ref = {
      value: 10,
      entries: [{ a: 11 }, { a: 22 }],
    };
  }

  increase(index: number) {
    this.ref.entries.at(index).a += 1;
    console.log(JSON.stringify(toJS(this.ref)));
  }
}
LoginController.$inject = ['dataService', '$state', '$window'];
function LoginController(dataService, $state, $window) {
  var $ctrl = this;
  $ctrl.store = new ViewModel(2);

  $ctrl.demoLogin = function () {
    dataService
      .post('/saml/demo_login', {})
      .then(
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

          $window.open($state.href('root.applications'), '_blank');
        },
        function () {
          // do nothing
        },
      )
      .finally(function () {});
  };
}
