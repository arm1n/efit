/*!
 * fastshell
 * Fiercely quick and opinionated front-ends
 * https://HosseinKarami.github.io/fastshell
 * @author Hossein Karami
 * @version 1.0.5
 * Copyright 2017. MIT licensed.
 */
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
