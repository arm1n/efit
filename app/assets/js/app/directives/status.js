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

  var Status = function(state) {
    this.state = state;
  };

  Status.$inject = ['state'];

  Status.prototype.isCompact = false;

  Status.prototype.toggle = function() {};

  angular.module(module).directive('status', function(){
    return {
      scope: {
        isCompact:'=?statusIsCompact',
      },
      restrict: 'A',
      transclude: true,
      controller: Status,
      bindToController: true,
      controllerAs: 'statusController',
      templateUrl: 'assets/views/status.html'
    };
  });

})(ANGULAR_MODULE, angular);
