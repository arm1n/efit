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
    var url = API_URL + '/ticket/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      getByWorkshop: {
        method: 'GET',
        isArray: true,
        url: API_URL + '/ticket/workshop/:workshopId'
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
  angular.module(module).factory('Ticket', Factory);

})(ANGULAR_MODULE, angular);
