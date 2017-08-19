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
  var Index = function($injector) {
    this.$injector = $injector;
  };

  Index.$inject = ['$injector'];

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
  Index.prototype.logout = function()
    {
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');

      var successCallback = function()
        {
          $state.go('login');
        };

      var failureCallback = function()
        {

        };

      auth.logout();
      $state.go('login');
    };

  Index.prototype.test = function()
    {
      var $http = this.$injector.get('$http');
      var API_URL = this.$injector.get('API_URL');

      $http.get(API_URL + '/test');
    };

  angular.module(module).controller('IndexController', Index);

})(ANGULAR_MODULE, angular);
