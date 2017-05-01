/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

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
