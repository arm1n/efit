/* global angular */
(function(global, angular){
  'use strict';

  //
  // ANGULAR
  //
  if (typeof angular === 'undefined') {
    throw Error('Cannot initialize bomb task without angular!');
  }

  //
  // MODULE
  //
  var module = 'eFit';

  //
  // APP
  //
  angular.module(module,['ngSanitize']);

  //
  // CONSTANTS
  //

  //
  // CONFIG
  //

  //
  // EXPOSE
  //
  global.ANGULAR_MODULE = module;

})(window, angular);
