/*!
 * eFit Website
 * An app for financial training in educational environments
 * http://www.e-fit.com
 * @author Armin Pfurtscheller
 * @version 1.0.0
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular, Scratchcard */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // SaveCoinTask
  // --------------------------------------------------

  // controller
  var SaveCoinTask = function() {
    this.amount = 3;
    this.cards = [];
    this.count = 0;
  };

  SaveCoinTask.$inject = ['$scope','$element','$attrs'];

  SaveCoinTask.prototype.$onInit = function() {
    this.init();
  };

  SaveCoinTask.prototype.init = function() {
    this.cards = [];
    for (var i=1; i<=this.amount; i++) {
      this.cards.push(i);
    }

    this.resolved = false;
  };

  SaveCoinTask.prototype.reset = function(){
    this.init();
  };

  SaveCoinTask.prototype.update = function(){
    this.count++;
    this.resolve();
  };

  SaveCoinTask.prototype.resolve = function(){
    if (this.count<this.amount) {
      return;
    }

    this.resolved = true;
    this.onResolve();
  };

  // registry
  angular.module(module).directive('saveCoinTask', function(){
    return {
      scope: {
        amount: '=?saveCoinTaskAmount',
        onResolve: '&saveCoinTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: SaveCoinTask,
      bindToController: true,
      controllerAs: 'saveCoinTaskController',
      templateUrl: 'views/directives/save-coin-task.html'
    };
  });

  // --------------------------------------------------
  // SaveCoinTask Card
  // --------------------------------------------------

  // controller
  var SaveCoinTaskCard = function($scope,$element,$attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this.thickness = 20;
    this.threshold = 0.75;
    this.color = '#e5e5e5';

    this.complete = false;
    this._scratchCard = null;
  };

  SaveCoinTaskCard.$inject = ['$scope','$element','$attrs'];

  SaveCoinTaskCard.prototype.$onInit = function() {
    this._scratchCard = new Scratchcard(
      this.$element.get(0),
      {
        painter: new Scratchcard.Painter({
          thickness: this.thickness,
          color: this.color
        })
      }
    );

    this._scratchCard.on('progress', this._onProgress.bind(this));
  };

  SaveCoinTaskCard.prototype._onProgress = function(progress) {
    if (progress>this.threshold && progress<1) {
      var onComplete = this.onComplete.bind(this);
      this.$scope.$evalAsync(onComplete);
      this._scratchCard.complete();

      this.complete = true;
    }
  };

  // registry
  angular.module(module).directive('saveCoinTaskCard', function(){
    return {
      scope: {
        color: '=?saveCoinTaskColor',
        thickness: '=?saveCoinTaskCardThickness',
        threshold: '=?saveCoinTaskCardThreshold',
        onComplete: '&saveCoinTaskCardOnComplete'
      },
      restrict: 'A',
      transclude: true,
      controller: SaveCoinTaskCard,
      bindToController: true,
      controllerAs: 'saveCoinTaskCardController',
      templateUrl: 'views/directives/save-coin-task-card.html'
    };
  });




})(ANGULAR_MODULE, angular);
