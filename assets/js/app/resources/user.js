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
  // FACTORY
  //

  /**
   * @constructor
   */
  var Factory = function($resource, API_URL) {
    var url = API_URL + '/user/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      current: {
        method: 'GET',
        skipGlobalErrorMessage: true,
        url: API_URL + '/user/current'
      }
    };
    var options = {

    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('User', Factory);

})(ANGULAR_MODULE, angular);
