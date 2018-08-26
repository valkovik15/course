var app = angular.module("app", ["xeditable",'tangcloud']);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.controller('Ctrl', function($scope, $timeout,$http) {
  $scope.user = {
    name: 'awesome user'
  };
    $http.get("/cl").then(function(response) {
        $scope.words=response.data;
        console.log(response.data);
    });
    $timeout(function(){


    }, 1000);

    $scope.test = function(word) {
        alert("Wanna search"+word);
    };
    $scope.updateUser = function() {
        return $http.post('/updateUser', {id: $scope.iden, name: $scope.nam, email:$scope.email});
    };

});
