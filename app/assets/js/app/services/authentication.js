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
  var Authentication = function($q, $http, storage, API_URL)
    {
      this.$q = $q;
      this.$http = $http;
      this.API_URL = API_URL;

      this.user = undefined;
    };

  /**
   * @property {Array.<string>} $inject
   */
  Authentication.$inject = ['$q', '$http', 'storage', 'API_URL'];

  //
  // PROPERTIES
  //

  /** @var {string} path Description. */
  Authentication.prototype.basePath = '';

  /**
   * Sends a POST request to registration route and returns promise.
   * @param {Object} data Data to submit.
   * @return {Promise}
   */
  Authentication.prototype.register = function(data)
    {
      /*
      var me = this,
        _successCB = function(response)
        {
          // noop
        },
        _errorCB = function(rejection)
        {
          me._showError(rejection);
        };

      var promise = this.$http.post(
        this.getUrl('register'),
        {
          data: data
        }
      );

      promise.success(_successCB);
      promise.error(_errorCB);

      return promise;
      */
    };

  /**
   * Sends a POST request to login route.
   * @param {Object} data Data to submit.
   * @return {Promise}
   */
  Authentication.prototype.login = function(data)
    {
      var me = this;
      var _successCB = function(response)
        {
          var token = response.data.token;
          var decoded = jwt_decode(token);




          console.log(decoded);
          //me.user = response.data;
        };
      var _failureCB = function(rejection)
        {
          //me._showError(rejection);
        };

      var promise = this.$http.post(
        this.API_URL + '/auth',
        {
          _username: data.username,
          _password: data.password
        }
      );

      promise.then(
        _successCB,
        _failureCB
      );

      return promise;
    };

  /**
   * Sends a GET request to logout route.
   * @return {Promise}
   */
  Authentication.prototype.logout = function()
    {
      /*
      var me = this,
        _successCB = function(response)
        {
          me.user = null;
        },
        _errorCB = function(rejection)
        {
          me._showError(rejection);
        };

      var promise = this.$http.get();
      promise.success(_successCB);
      promise.error(_errorCB);

      return promise;
      */
    };

  /**
   * Fetches current user from API. In case of HTTP 401 will
   * resolve with null, all other states will reject promise.
   * @return {Promise}
   */
  Authentication.prototype.getUser = function()
    {
      /*
      var defer = this.$q.defer();
      if( this.user!==undefined )
      {
        defer.resolve(this.user);
        return defer.promise;
      }

      var me = this;
      var _successCB = function(response)
        {
          me.user = response.data;
          defer.resolve(me.user);
        },
        _errorCB = function(rejection,status)
        {
          switch(status)
          {
            case 401:
              me.user = null;
              defer.resolve(me.user);
              break;
            default:
              defer.reject(rejection);
              me._showError(rejection);
          }
        };

      var promise = this.$http.get();
      promise.success(_successCB);
      promise.error(_errorCB);

      return defer.promise;
      */
    };

  angular.module(module).service('authentication', Authentication);

})(ANGULAR_MODULE, angular);
