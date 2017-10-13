angular
.module('runinga', 
	['angular-nicescroll','LocalForageModule'])

.service('ngCopy', ['$window', function ($window) {
	return function (toCopy) {
		
	}
}])

.directive('ngClickCopy', ['ngCopy', function (ngCopy) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			element.bind('click', function (e) {
				ngCopy(attrs.ngClickCopy);
			});
		}
	}
}]);