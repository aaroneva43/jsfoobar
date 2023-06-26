import './vendors';
import angular from 'angular';
import './controllers';
import './services';

angular.module('app', ['ui.router', 'app.controllers', 'app.services', 'mobx-angularjs']);

angular.module('app').config(appConfig).run(appRun);

appConfig.$inject = ['$stateProvider', '$urlServiceProvider'];
function appConfig($stateProvider: angular.ui.IStateProvider, $urlServiceProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login/login.html',
      controller: 'LoginController',
      controllerAs: '$ctrl',
    })
    .state('root', {
      url: '/root',
      templateUrl: 'templates/login/root.html',
      controller: 'RootController',
      controllerAs: '$ctrl',
    })
    .state('root.applications', {
      url: '/applications',
      templateUrl: 'templates/applications/applications.html',
      controller: 'ApplicationsController',
      controllerAs: '$ctrl',
    });

  $urlServiceProvider.rules.initial('/login');
  // $urlServiceProvider.rules.otherwise('/root');
}

appRun.$inject = ['$transitions', '$rootScope', '$state'];
function appRun($transitions, $rootScope, $state) {}
