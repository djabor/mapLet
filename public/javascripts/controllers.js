'use strict';
angular.module('maplet.controllers', ['ngResource','ngCookies']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', '$cookies', '$route', function($scope,$resource,$location,$window,$routeParams,$cookies,$route){
	$scope.Settings = $resource('/resources/settings')
	$scope.location = $location
	$scope.resource = $resource
	$scope.route = $routeParams
	$scope.Math = $window.Math
	$scope.getPolys = $scope.resource('/resources/polys');
	$scope.trace = $scope.resource('/resources/trace');
	$scope.route = {};
	$scope.flags = {
		polys: false,
		panos: false
	}
}];

var MainCtrl = ['$scope', function($scope){
	var directionsService = new google.maps.DirectionsService();
	$scope.origin = '31.891098,34.808532';
	$scope.destination = '31.891815,34.812189';
	$scope.calcRoute = function() {
		var request = {
			origin: $scope.origin,
			destination: $scope.destination,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};
		directionsService.route(request, function(resp, status){
			if (status == google.maps.DirectionsStatus.OK) {
				var polys = resp.routes[0].legs[0].steps;
				var points = [];
				for(var i =0; i<polys.length;i++){
					var tmpPoints = fDecodeLine(polys[i].polyline.points);
					if (i < polys.length)
						tmpPoints.pop()
					for (var p = 0;p<tmpPoints.length;p++){
						points.push(tmpPoints[p]);
					}
				}
			}
			$scope.$apply(function(){
				$scope.route.Polys = points;
				if ($scope.route.Polys.length > 0){
					$scope.flags.polys = true;
				}
			});
		});
	}
	$scope.getPolyPanos = function(){
		$scope.getPolys.save({}, {polys:$scope.route.Polys}, function(resp){
			$scope.route.Panos = resp.panos;
			$scope.flags.panos = true;
		});
	}

	$scope.traceRoute = function(){
		$scope.trace.save({}, {polys:$scope.route.Panos}, function(resp){
			console.log(resp);
			$scope.route.traced = resp.panos;
		});	
	}
}];

function ord (string) {
	var str = string + ''
	, code = str.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF) {
		var hi = code;
		if (str.length === 1)
			return code;
		var low = str.charCodeAt(1);
		return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
	}
	if (0xDC00 <= code && code <= 0xDFFF)
		return code;
	return code;
}

function fDecodeLine (encoded){
	var len = encoded.length;
	var index = 0;
	var lat = 0;
	var lng = 0;
	var points = [];

	while (index < len) {
		var shift = 0;
		var result = 0;
		do {
			var b = ord(encoded.substr(index++,1)) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lat += dlat;
		shift = 0;
		result = 0;
		do {
			var b = ord(encoded.substr(index++,1)) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
		lng += dlng;
		var first = lng * 0.00001;
		var second = lat * 0.00001;
		points.push(second + ',' + first);
	}
	return points;
}