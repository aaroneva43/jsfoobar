import angular from 'angular';
import { storage } from '../../utils/storage';
import module from '../module';

module.component('login', {
  templateUrl: 'templates/login/login.html',
  controller /* 
  controllerAs: '$ctrl', */,
});

controller.$inject = ['dataService', 'auth', '$state', '$window'];
function controller(dataService, auth, $state, $window) {
  var $ctrl = this;
  $ctrl.demoLogin = () => {
    auth.demoLogin().then(() => {
      $window.open($state.href('root.applications'), '_blank');
    });
  };
}
