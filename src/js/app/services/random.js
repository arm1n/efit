/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  var Random = function() {
  };

  Random.$inject = [];

  Random.prototype.method = function() {};

  angular.module(module).service('random', Random);

})(ANGULAR_MODULE, angular);
