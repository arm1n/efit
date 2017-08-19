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
  var LockedState = function($scope, $element, $attrs, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;

    this.user = $injector.get('user');
  };

  LockedState.$inject = ['$scope','$element','$attrs', '$injector'];

  //
  // REGISTRY
  //
  angular.module(module).directive('lockedState', function(){
    return {
      scope: {
        isLocked: '=?lockedState'
      },
      restrict: 'A',
      transclude: {
        userText: '?userText',
        adminText: '?adminTExt'
      },
      controller: LockedState,
      bindToController: true,
      controllerAs: 'lockedStateController',
      templateUrl: 'views/directives/locked-state.html'
    };
  });

})(ANGULAR_MODULE, angular);
