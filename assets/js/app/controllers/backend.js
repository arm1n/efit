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

 /**
  * @constructor
  */
  var Backend = function($injector) {
    this.$injector = $injector;
  };

  Backend.$inject = ['$injector'];

  //
  // METHODS
  //

  /**
   * Destroys user session and redirects to login.
   *
   * @public
   * @method logout
   * @return {Void}
   */
  Backend.prototype.logout = function()
    {
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');

      var successCallback = function()
        {
          $state.go('login.backend');
        };

      var failureCallback = function()
        {

        };

      auth.signout().then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Redirects router to state.
   *
   * @public
   * @method goTo
   * @param {string} state
   * @return {Void}
   */
  Backend.prototype.goTo = function(state)
    {
      var $state = this.$injector.get('$state');

      $state.go(state);
    };

  angular.module(module).controller('BackendController', Backend);

})(ANGULAR_MODULE, angular);
