import controllers from '../module';
import angular from 'angular';

controllers.controller('LoginController', LoginController);

function LoginController() {
  var $ctrl = this;
  $ctrl.foo = 123;
}
