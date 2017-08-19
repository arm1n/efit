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
  // Tabber
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Tabber = function($scope, $element, $attrs, $transclude) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$transclude = $transclude;

    this.hasExercise = $transclude.isSlotFilled('exercise');
  };

  Tabber.$inject = ['$scope','$element','$attrs', '$transclude'];

  //
  // PROPERTIES
  //

  /** @var {array} hasExercise If slot `exercise` has contents. */
  Tabber.prototype.hasExercise = false;

  //
  // REGISTRY
  //
  angular.module(module).directive('tabber', function(){
    return {
      scope: {
        icon: '=?tabberIcon'
      },
      restrict: 'A',
      transclude: {
        exercise: '?tabberExercise',
        description: 'tabberDescription'
      },
      controller: Tabber,
      bindToController: true,
      controllerAs: 'tabberController',
      templateUrl: 'views/directives/tabber.html'
    };
  });

})(ANGULAR_MODULE, angular);
