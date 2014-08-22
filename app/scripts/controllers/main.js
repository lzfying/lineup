'use strict';

/**
 * @ngdoc function
 * @name lineupApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the lineupApp
 */
angular.module('lineupApp')
  .controller('MainCtrl', function ($scope) {
    $scope.currentPosition = 0;
    $scope.$watch(function(){console.log("CHANGED")});
  });
