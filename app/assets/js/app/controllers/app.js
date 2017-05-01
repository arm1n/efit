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

  var App = function($scope, state) {
    this.$scope = $scope;
    this.state = state;
  };

  App.$inject = ['$scope', 'state'];

  App.prototype.update = function() {
    this.state.add();
  };

  angular.module(module).controller('AppController', App);

})(ANGULAR_MODULE, angular);
