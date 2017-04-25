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
  angular.module(module,[]);

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
