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

  // --------------------------------------------------
  // i18n
  // --------------------------------------------------
  angular.module(module).filter('i18n',['i18n',function(i18n){
    var filter = function()
      {
        return i18n.get.apply(i18n, arguments);
      };

    filter.$stateful = true;

    return filter;
  }]);

  // --------------------------------------------------
  // Percentage
  // --------------------------------------------------
  angular.module(module).filter('percent', function(){
    return function(value) {
      return (value * 100) + '%';
    };
  });

  // --------------------------------------------------
  // Coin
  // --------------------------------------------------
  angular.module(module).filter('coin', function(){
    return function(value) {

      if (value >= 1) {
        return value + '&#8364;';
      }

      return (value*100) + '&#162;';
    };
  });

  // --------------------------------------------------
  // Note
  // --------------------------------------------------
  angular.module(module).filter('note', function(){
    return function(value) {
      return value + '&#8364;';
    };
  });

})(ANGULAR_MODULE, angular);
