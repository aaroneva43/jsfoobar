import _ from 'lodash';
import controllers from '../module';
import angular from 'angular';
('use strict');
import { CLOUD_PLATFORMS } from '../../utils/biz/meta/cloudPlatforms';
import { storage } from '../../utils/storage';
import { APPLICATIONS_ADD_SREF } from '../../utils/biz/meta/state';

controllers.controller('ApplicationsController', ApplicationsController);

ApplicationsController.$inject = ['$scope', '$state', '$filter', 'auth', 'dataService'];

function ApplicationsController($scope, $state, $filter, auth, dataService) {
  var $ctrl = this;
  $ctrl.listName = 'applications';
}
