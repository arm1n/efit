/*!
 * fastshell
 * Fiercely quick and opinionated front-ends
 * https://HosseinKarami.github.io/fastshell
 * @author Hossein Karami
 * @version 1.0.5
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  var Random = function() {
  };

  Random.$inject = [];

  Random.prototype.method = function() {};

  angular.module(module).service('random', Random);

})(ANGULAR_MODULE, angular);
