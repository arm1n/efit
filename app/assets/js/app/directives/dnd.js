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
  // Draggable
  // --------------------------------------------------

  // controller
  var Draggable = function($scope, $element, $attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;
  };

  Draggable.prototype.$onInit = function() {
    console.log(this.$element);
  };

  Draggable.$inject = ['$scope','$element','$attrs'];

  // registry
  angular.module(module).directive('draggable', function(){
    return {
      scope: {
        //icon: '=?taskIcon'
      },
      restrict: 'A',
      controller: Task,
      bindToController: true,
      controllerAs: 'draggable'//,
      //templateUrl: 'views/directives/task.html'
    };
  });

})(ANGULAR_MODULE, angular);
