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

  var State = function() {
  };

  State.prototype.current = 'STATE0';

  State.prototype.total = 5;

  State.prototype.states = {
    'STATE0': 0,
    'STATE1': 1,
    'STATE2': 2,
    'STATE3': 3,
    'STATE4': 4
  };

  State.$inject = [];

  State.prototype.add = function() {
    var current = this.states[this.current];
    var max = this.total - 1;
    if (current >= max) {
      return;
    }

    var next = current + 1;
    current = 'STATE' + next;

    this.current = current;
  };

  State.prototype.get = function() {
    return this.states[this.current];
  };

  angular.module(module).service('state', State);

})(ANGULAR_MODULE, angular);
