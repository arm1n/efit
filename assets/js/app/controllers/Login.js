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
  var Login = function($scope, $injector) {
    this.$injector = $injector;
    this.$scope = $scope;
  };

  Login.$inject = ['$scope', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {RegExp} userpattern Regular expression for `username` property. */
  Login.prototype.userpattern = /^[a-z][a-z](?:0[1-9]|[12]\d|3[01])[A-Z]\d$/;

  /** @var {string} username User name for authentication. */
  Login.prototype.username = 'admin';//'ru17O1';
  Login.prototype.password = 'test';

  /** @var {string} workshop Optional workshop id for authentication. */
  Login.prototype.workshop = null;

  //
  // METHODS
  //

  /**
   * Signs a user in with personal code to gather JWT.
   *
   * @public
   * @method signin
   * @return {Void}
   */
  Login.prototype.signin = function()
    {
      var notification = this.$injector.get('notification');
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');
      var i18n = this.$injector.get('i18n');

      var form = this.$scope.loginForm;
      if (form.$invalid) {
        return;
      }

      var me = this;

      var successCallback = function()
      {
        var message = i18n.get('You are logged in now!');
        notification.success(message);
        $state.go('frontend');
      };

      var failureCallback = function(response)
      {
        form.code.$setValidity('server', false);
      };

      auth
        .login({
          username: this.username
        }).then(
          successCallback,
          failureCallback
        );
    };

  /**
   * Signs a user up with personal code and workshop.
   *
   * @public
   * @method signup
   * @return {Void}
   */
  Login.prototype.signup = function()
    {
      /*
      var notification = this.$injector.get('notification');
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');
      var i18n = this.$injector.get('i18n');

      var form = this.$scope.loginForm;
      if (form.$invalid) {
        return;
      }

      var me = this;

      var successCallback = function()
      {
        var message = i18n.get('You are logged in now!');
        notification.success(message);
        $state.go('index');
      };

      var failureCallback = function(response)
      {
        form.code.$setValidity('server', false);
        me.errorCode = response.data.error || 'UNKNOWN_SERVER_ERROR';
      };

      auth
        .login({
          username: this.username
        }).then(
          successCallback,
          failureCallback
        );
      */
    };

  /**
   * Signs an admin in with username and password.
   *
   * @public
   * @method login
   * @return {Void}
   */
  Login.prototype.login = function()
    {
      var notification = this.$injector.get('notification');
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');
      var i18n = this.$injector.get('i18n');

      var form = this.$scope.loginForm;
      if (form.$invalid) {
        return;
      }

      var successCallback = function()
      {
        var message = i18n.get('You are logged in now!');
        notification.success(message);
        $state.go('frontend');
      };

      var failureCallback = function(response)
      {
        // noop
      };

      auth
        .login({
          username: this.username,
          password: this.password
        }).then(
          successCallback,
          failureCallback
        );
    };

  angular.module(module).controller('LoginController', Login);

})(ANGULAR_MODULE, angular);
