angular
  .module('MyApp', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache','ngSanitize'])
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $http, $location) {
      $scope.index=0;

      console.log($scope);
      $scope.$watch('postid', function () {
          $http.get("/getsteps/?id="+$scope.postid)
              .then(function(response) {
                      $scope.steps = response.data.steps;
                      $scope.toc = response.data.toc;
                      $scope.title=response.data.title;
              });
      });

    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    function buildToggler(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }
      $scope.add = function()
      {
          if($scope.index<$scope.steps.length-1) {
              $scope.index++;
          }
      };
      $scope.sub = function()
      {
          if($scope.index>0) {
              $scope.index--;
          }
      };
      $scope.change= function(x)
      {
          console.log(x);
          $scope.index=$scope.toc.findIndex(function(e){return e==x});
          console.log($scope.index);
      };

  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });

    };
  })
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
  });


/**
Copyright 2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that can be foundin the LICENSE file at http://material.angularjs.org/HEAD/license.
**/
