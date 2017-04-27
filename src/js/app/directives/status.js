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
      templateUrl: 'views/directives/status.html'
    };
  });

})(ANGULAR_MODULE, angular);
