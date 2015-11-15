/**
 * Created by Abed on 11/13/2015.
 */

// create the module
// also include ngRoute for all our routing needs
var daleelQaweem = angular.module('daleelQaweem', ['ngRoute','angucomplete-alt','ui.bootstrap','ng.httpLoader']);

// configure our routes
daleelQaweem.config(function($routeProvider) {
    $routeProvider

        // route for the searchSymptoms page
        .when('/', {
            templateUrl : 'html/searchSymptoms.html',
            controller  : 'searchSymptomsController'
        })

        // route for the manage_symptoms page
        .when('/mng_sympt', {
            templateUrl : 'html/manage_symptoms.html',
            controller  : 'SymptomsController'
        })
})

.config([
    'httpMethodInterceptorProvider',
    function (httpMethodInterceptorProvider) {
        httpMethodInterceptorProvider.whitelistDomain('/api/symptom');
        httpMethodInterceptorProvider.whitelistDomain('/api/editSymptom');
        // ...
    }
]);

daleelQaweem.controller('searchSymptomsController', function($scope,$http) {

    $scope.isCollapsed = true;

    //------------ get all SYMPTOMS from db to json object for use with search------------------
    $http.get('/api/symptom').success(function(data) {
        $scope.symptoms_arr = data;
    });

    //------------ get all TOPICS from db to json object for use with search------------------
    $http.get('/api/topics').success(function(data) {
        $scope.topics_arr = data;
    });
//--------------------------
    $scope.sel_sympts = [];
    $scope.topics_result = [
        {title:'علامة غلبة الصفراء',count:0},
        {title:'علامة غلبة الدم',count:0},
        {title:'علامة غلبة السوداء',count:0},
        {title:'علامة غلبة البلغم',count:0}
    ];

    $scope.symptomSelected = function(selected) {
        if (selected) {

            $scope.sel_sympts.push(selected);//push selected symptom into array of selected

            for(var i = 0; i < $scope.topics_arr.length; i++)
                for(var j = 0; j < $scope.topics_arr[i].symptoms.length; j++){
                    if($scope.topics_arr[i].symptoms[j] == selected.originalObject._id) {
                        $scope.topics_result[i].count = $scope.topics_result[i].count + 1;
                        //console.log($scope.topics_result[i].title + " " +$scope.topics_result[i].count);
                    }
                }
        }
    };

    $scope.removeSymptom = function(index,id){

        for(var i = 0; i < $scope.topics_arr.length; i++)
            for(var j = 0; j < $scope.topics_arr[i].symptoms.length; j++){
                if($scope.topics_arr[i].symptoms[j] == id) {
                    $scope.topics_result[i].count = $scope.topics_result[i].count - 1;
                    //console.log($scope.topics_result[i].title + " " +$scope.topics_result[i].count);
                }
            }

        $scope.sel_sympts.splice(index, 1);
    }
});