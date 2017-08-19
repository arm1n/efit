/*!
 * eFit Website
 * An app for financial training in educational environments
 * http://www.e-fit.com
 * @author Armin Pfurtscheller
 * @version 1.0.0
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Task
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Task = function() {
  };

  Task.$inject = ['$scope','$element','$attrs'];

  //
  // REGISTRY
  //
  angular.module(module).directive('task', function(){
    return {
      scope: {
        icon: '=?taskIcon'
      },
      restrict: 'A',
      transclude: {
        exercise: 'taskExercise',
        description: 'taskDescription'
      },
      controller: Task,
      bindToController: true,
      controllerAs: 'taskController',
      templateUrl: 'views/directives/task.html'
    };
  });

})(ANGULAR_MODULE, angular);
