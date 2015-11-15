/**********************************************************************
 * Topic Admin
 */

// CONSTS

var SYMPTOMS_COLLECTION_URL = '/api/symptom';
/**********************************************************************
 * Symptoms controller
 */

daleelQaweem.controller('SymptomsController', function($scope, $http, $window) {
    var symptomsController = this

  //------------ get all symptoms from db ------------------
    $http.get(SYMPTOMS_COLLECTION_URL).success(function(data) {
      $scope.symptoms = data;
    });

      //---------- checkbox selected -----------------------

        $scope.topics=[{id:'safraa', title:'علامة غلبة الصفراء'},
          {id:'damm', title:'علامة غلبة الدم'},
          {id:'sawdaa', title:'علامة غلبة السوداء'},
          {id:'balgham', title:'علامة غلبة البلغم'}];
        $scope.selection=[];
        // toggle selection for a given topic by id
        $scope.toggleSelection = function toggleSelection(topicTitle) {
          var idx = $scope.selection.indexOf(topicTitle);

          // is currently selected
          if (idx > -1) {
            $scope.selection.splice(idx, 1);
          }

          // is newly selected
          else {
            $scope.selection.push(topicTitle);
          }
        };

      //------------------ validate forms -----------------

      $scope.form = {} //define sub scope

      $scope.edit = true;//make textboxes editable
      $scope.incomplete = true;//check if fields were filled

      $scope.form.symptomName = '';
      $scope.form.symptomDescript = '';

      $scope.validateForm = function() {

        $scope.incomplete = true;

        if (($scope.form.symptomName.length != 0) &&
           ($scope.form.symptomDescript.length != 0)) {
          $scope.incomplete = false;
        }
      };


//----------- add symptoms -------

      $scope.addSymptom = function() {

        if($scope.edit) {

          $http.post(SYMPTOMS_COLLECTION_URL, {
            name: $scope.form.symptomName,
            description: $scope.form.symptomDescript,
            topics: $scope.selection
          }).success(function (data) {

            $scope.symptoms.push(data);

          });

          clearUI();
          $scope.form.symptomName = "";
          $scope.form.symptomDescript = "";

        }else{

          $http.post("/api/editSymptom",
              {id:$scope.temp_id,name:$scope.form.symptomName,description:$scope.form.symptomDescript,topics:$scope.selection})
              .success(function(data) {

          });

          clearUI();
          $scope.form.symptomName = "";
          $scope.form.symptomDescript = "";
          $scope.edit = true;
          $window.location.reload();
        }
      };

//---------------- edit symptoms ------------------

      $scope.editSymptom = function(id,name,descript) {

        clearUI();

        $scope.edit = false;
        $scope.temp_id = id; //save id to use in post
        $scope.form.symptomName = name;
        $scope.form.symptomDescript = descript;
        $scope.incomplete = false;

        $http.get('/api/editSymptom', {params: { symptom_id: id }}).success(function(data) {

          for(var i = 0; i <data.length; i++) {
            document.getElementById(data[i]._id).checked = true;
            $scope.toggleSelection(data[i]._id);
          }

        });

      };

//---------------- delete sympotm -----------------

      $scope.deleteSymptom = function(del_id){

        $http.post("/api/deleteSymptom",
            {id:del_id})
            .success(function(data) {

              $window.location.reload();
            });
      }

//---------------- cancel Edit -----------------

      $scope.cancelEdit = function(){

        clearUI();

        $scope.edit = true;
        $scope.form.symptomName = "";
        $scope.form.symptomDescript = "";
        $scope.incomplete = false;
      }

//---------------------------------------------

      function clearUI(){

        //uncheck all checkboxes
        for(var i = 0; i <$scope.topics.length; i++) {
          document.getElementById($scope.topics[i].id).checked = false;
        }
        //clear array of selected checkbox ids
        $scope.selection=[];

        //$scope.form.symptomName = "";
        //$scope.form.symptomDescript = "";
      }

    });//close controller


