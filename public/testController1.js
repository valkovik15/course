angular.module('app', ['tangcloud'])
    .controller('TestCtrl', ['$scope', '$timeout', '$http',function ($scope, $timeout,$http) {
        $http.get("/cl").then(function(response) {
                $scope.words=response.data;
            });
        $timeout(function(){


        }, 1000);

        $scope.test = function(word) {
            alert("clicked on " + word);
        }
    }]);
