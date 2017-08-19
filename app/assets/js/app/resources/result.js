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
  var Factory = function($resource, $injector, API_URL) {
    var url = API_URL + '/result/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      getByTask: {
        method: 'GET',
        isArray: true,
        url: API_URL + '/result/task/:taskId'
      }
    };
    var options = {
    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', '$injector', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('Result', Factory);

})(ANGULAR_MODULE, angular);
