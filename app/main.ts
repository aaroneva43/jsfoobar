import angular from 'angular';
import './vendors';
import './app';

angular.bootstrap(document, ['app'], {
	strictDi: true
});
