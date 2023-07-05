import './vendors';
import angular from 'angular';
import './controllers';
import './services';
import './components';
import eventbus from './utils/eventbus';

angular.module('app', ['ui.router', 'app.controllers', 'app.services', 'app.components', 'mobx-angularjs']);

angular.module('app').config(appConfig).run(appRun);

appConfig.$inject = ['$stateProvider', '$urlServiceProvider'];
function appConfig($stateProvider: angular.ui.IStateProvider, $urlServiceProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      component: 'login',
    })
    .state('root', {
      url: '/root',
      templateUrl: 'templates/root.html',
      controller: 'RootController',
    })
    .state('root.applications', {
      url: '/applications',
      templateUrl: 'templates/applications/applications.html',
      controller: 'ApplicationsController',
    });

  $urlServiceProvider.rules.initial('/login');
  // $urlServiceProvider.rules.otherwise('/root');
}

appRun.$inject = ['$transitions', '$rootScope', '$state'];
function appRun($transitions, $rootScope, $state) {
  $transitions.onSuccess({}, function (transition) {
    eventbus.fire('state-changed', $rootScope, transition);
  });
}
