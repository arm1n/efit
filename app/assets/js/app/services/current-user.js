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

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var user = function($injector) {
    this.$injector = $injector;
  };

  user.$inject = ['$injector'];

  //
  // PROPERTIES
  //

  /** @var {array} _payload JSON representation of current user. */
  user.prototype._payload = null;

  //
  // METHODS
  //

  /**
   * Fetches current user through `User` resource.
   * Triggers the `user_updated` event on
   * $rootScope for all services being in charge.
   *
   * @public
   * @method load
   * @return {void}
   */
  user.prototype.load = function(state) {
    var $rootScope = this.$injector.get('$rootScope');
    var User = this.$injector.get('User');

    var me = this;
    var successCallback = function(user) {
      // set the properties for all users
      // with role other than `ROLE_USER`
      user.tickets = user.tickets || 0;
      user.state = user.state || 1;
      me.set(user);

      // trigger `user_updated`
      $rootScope.$broadcast(
        'user_updated',
        user
      );

      // resolve user
      return user;
    };

    var failureCallback = function() {
      // noop
    };

    var current = User.current();
    return current.$promise.then(
      successCallback,
      failureCallback
    );
  };

  /**
   * Sets current user.
   *
   * @public
   * @method set
   * @param {Object} user
   * @return {void}
   */
  user.prototype.set = function(user) {
    this._payload = user.toJSON();
  };

  /**
   * Gets current user.
   *
   * @public
   * @method add
   * @return {Object|null}
   */
  user.prototype.get = function() {
    return this._payload;
  };

  //
  // REGISTRY
  //
  angular.module(module).service('user', user);

})(ANGULAR_MODULE, angular);
