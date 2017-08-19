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

  angular.module(module).controller('BackendController', Backend);

})(ANGULAR_MODULE, angular);
