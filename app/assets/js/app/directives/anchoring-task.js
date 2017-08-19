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
  // AnchoringTask
  // --------------------------------------------------

  // controller
  var AnchoringTask = function($scope,$elemnt,$attrs,random) {
    this.random = random;

    /*
    var a=[];
    for (var i = 0; i<10; i++) {

      this.random.push(a, i % 2 === 0 ? 'A' : 'B');
    }

    console.log(a);
    */
  };

  AnchoringTask.$inject = ['$scope','$element','$attrs', 'random'];

  AnchoringTask.prototype.$onInit = function() {
    this.init();
  };

  AnchoringTask.prototype.init = function() {
    this.resolved = false;
  };

  AnchoringTask.prototype.reset = function(){
    this.init();
  };

  AnchoringTask.prototype.update = function(){
    this.resolve();
  };

  AnchoringTask.prototype.resolve = function(){
    this.resolved = true;
    this.onResolve();
  };

  // registry
  angular.module(module).directive('anchoringTask', function(){
    return {
      scope: {
        onResolve: '&anchoringTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: AnchoringTask,
      bindToController: true,
      controllerAs: 'anchoringTaskController',
      templateUrl: 'views/directives/anchoring-task.html'
    };
  });

})(ANGULAR_MODULE, angular);
