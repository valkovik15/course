angular.module('test', ['tangcloud'])
    .controller('TestCtrl', ['$scope', '$timeout', function ($scope, $timeout) {
        $timeout(function(){
            $scope.words = [

                {id: 3, word: "test", size: 7},
                {id: 2, word: "blabla", size: 6},
                {id: 4, word: "schaap", size: 2},
                {id: 6, word: "woord3", size: 3},

            ];
        }, 1000);

        $scope.test = function(word) {
            alert("clicked on " + word);
        }
    }]);
