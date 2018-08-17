var App=angular
  .module('MyApp', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache','ngSanitize'])
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('pink')
            .accentPalette('orange');
    })
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $http, $location,$log) {
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
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log, $http) {
      $http.get("/com/?id="+$scope.$parent.postid+'&user='+$scope.$parent.user)
          .then(function(response) {
              $scope.todos=response.data;
              console.log("TODO");
              console.log(this);
          });
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
      $scope.submit = function () {
          console.log($scope.$parent.postid);
          if($scope.$parent) {
              console.log($scope.$parent);
          }
          console.log($scope);
          $http.get("/trigger/?id="+$scope.postid+'&user='+$scope.user+'&socket='+$scope.socket+"&text="+$scope.data)
              .then(function(response) {
                  if(!$scope.todos)
                  {
                      $scope.todos=[];
                  }
                  if(response.data.pic!=-1) {
                      $scope.todos.push(response.data);
                      console.log(this.todos);
                  }
                  else
                  {
                      alert("Log in first!");
                  }
              });

      };
      $scope.upd = function (data) {
          console.log($scope.$parent.postid);
          if($scope.$parent) {
          }
          $scope.todos.push(data);
      }
  })
.controller('RatingController', RatingController)
.directive('starRating', starRating);

function RatingController($scope, $http) {
    //set star rating to 0 first
    this.starrate = 0;
    $scope.$watch('user', function () {
        $http.get("/getstars/?id="+$scope.postid+'&user='+$scope.user)
            .then(function(response) {
                $scope.ratingForm.starrate=response.data.stars;
            });
    });
    $scope.rank = function()
    {
        $http.get("/rank/?post="+$scope.postid+'&user='+$scope.user+'&num='+$scope.ratingForm.starrate)
            .then(function(response) {
                alert(response.data.message);
            });
    };

}



function starRating() {
    return {
        restrict: 'EA',
        template:
             '<div>Rank:</div>'+
            '<ul class="star-rating">' +
            '<li></li>'+
            '<li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="clicked($index);">' +
            '<span class="font-fa fa-star fa-1g"></span>' + // or &#9733
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
                        filled: scope.ratingValue-i>=1
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
