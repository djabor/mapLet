'use strict'; 

angular.module('maplet', ['ngResource', 'ngCookies']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/Main.html', controller: MainCtrl, name:'Main'}).
		otherwise({redirectTo: '/main'});
}])