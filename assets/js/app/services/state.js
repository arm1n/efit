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
  var AppState = function()
    {
      this.httpBusy = false;
      this.routeBusy = false;
    };

  AppState.$inject = [];

  //
  // PROPERTIES
  //

  /** @var {boolean} httpBusy If $http is currently doing work. */
  AppState.prototype.httpBusy = null;

  /** @var {boolean} routerBusy If router is currently doing work. */
  AppState.prototype.routerBusy = null;

  //
  // METHODS
  //

  /**
   * Returns true if `httpBusy` or `routeBusy` is true.
   *
   * @public
   * @method isBusy
   * @return {void}
   */
  AppState.prototype.isBusy = function()
    {
      return this.httpBusy || this.routeBusy;
    };

  //
  // REGISTRY
  //
  angular.module(module).service('appState', AppState);

})();
