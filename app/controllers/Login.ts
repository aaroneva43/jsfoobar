import controllers from './module';
'use strict';
controllers.controller('LoginController', IndexController);
console.log(33);

IndexController.$inject = ['$scope'];
function IndexController($scope) {
  var $ctrl = this;
  alert(33)
}

