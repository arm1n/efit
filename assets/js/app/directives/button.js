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
  var Button = function() {
    if (angular.isArray(this.classNames)) {
      this.cssClasses = [this.baseClass]
        .concat(this.classNames);
    } else {
      this.cssClasses = [
        this.baseClass,
        this.classNames
      ];
    }
  };

  Button.$inject = ['$scope','$element','$attrs'];

  Button.prototype.baseClass = 'uk-button';

  Button.prototype.classNames = 'uk-default';

  //
  // REGISTRY
  //
  angular.module(module).directive('button', function(){
    return {
      scope: {
        isLoading: '=?buttonIsLoading',
        classNames: '=?buttonCssClasses'
      },
      restrict: 'A',
      transclude: true,
      controller: Button,
      bindToController: true,
      controllerAs: 'buttonController',
      templateUrl: 'views/directives/button.html'
    };
  });

})(ANGULAR_MODULE, angular);
