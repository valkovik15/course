var App=angular
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
  })
.controller('RatingController', RatingController)
.directive('starRating', starRating);

function RatingController($scope, $http) {
    //set star rating to 0 first
    this.starrate = 0;
    $scope.update = function (nextStage) {
        $scope.selection = nextStage;
        if (nextStage == "rating1" || nextStage == "rating2"){
            $scope.selection  = "stage1";
        }
        if(nextStage == "rating3"){
            $scope.selection = "stage3";
        }

        if(nextStage == "rating4" || nextStage =="rating5"){
            $scope.selection = "stage2";
        }
    };

    //set opinion checkbox array

    $scope.opinionList = [{ desc: "Availability", id: "opt-1"}, {desc: "Staff Friendliness", id: "opt-2"}, {desc: "Information", id: "opt-3"},
        {desc: "Loyalty Card", id: "opt-4"}, {desc: "Location", id: "opt-5"}, {desc: "Opening Hours", id: "opt-6"}, {desc: "Solutions", id: "opt-7"}, {desc: "Wait Time", id: "opt-8"}];

    $scope.isActive = function(updateNo){
        if (updateNo) return true;
        else return false;
    };

    //function to submit form with json

    $scope.submitForm=function(){
        var data = $scope.ratingForm;
        $http.post('http://exampleseverurl', JSON.stringify(data));
        console.log(data);
    }
}




/* ###### Star rating function ######*/


function starRating() {
    return {
        restrict: 'EA',
        template:
            '<ul class="star-rating">' +
            '<li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="clicked($index);">' +
            '<span class="font-fa fa-star"></span>' + // or &#9733
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=ngModel',
            max: '=?'
        },
        link: function (scope) {
            // if there is no defined max attribute default is 5
            if (scope.max == undefined) {
                scope.max = 5;
            }

            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.clicked = function (index) {
                scope.ratingValue = index + 1;
            };
            // watch for event Handling changes update newValue as number of stars clicked
            scope.$watch("ratingValue", function (oldValue, newValue,$scope) {
                if (newValue || newValue === 0) {
                    updateStars();
                }
            });
        }
    };
}


/**
Copyright 2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that can be foundin the LICENSE file at http://material.angularjs.org/HEAD/license.
**/
