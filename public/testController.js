angular.module('test', ['tangcloud'])
    .controller('TestCtrl', ['$scope', '$timeout', '$http',function ($scope, $timeout,$http) {
        $http.get("/cl").then(function(response) {
                $scope.words=response.data;
                console.log(response.data);
            });
        $timeout(function(){

        }, 1000);

        $scope.test = function(word) {
            $scope.test = function(word) {
                alert("Wanna search"+word);
            };
        };
    }]);
