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
  // InterestTask
  // --------------------------------------------------

  // controller
  var InterestTask = function($scope,$element,$attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this.amount = 1000;
    this.rate = 0.02;
    this.years = 1;
  };

  InterestTask.$inject = ['$scope','$element','$attrs'];

  InterestTask.prototype.$onInit = function() {
    this.init();
  };

  InterestTask.prototype.init = function() {
    this.resolved = false;
    this.correctAnswers = 0;
    this.exercise1Answer = 0;
    this.exercise2Answer = 0;
    this.exercise1Correct = false;
    this.exercise2Correct = false;
    this.exercise1Result = this._getResult(1);
    this.exercise2Result = this._getResult(1 + this.years);
  };

  InterestTask.prototype.reset = function(){
    this.init();
  };

  InterestTask.prototype.update = function(value, exercise){
    switch(exercise) {
      case 'exercise1':
        this.exercise1Answer = value;
        break;
      case 'exercise2':
        this.exercise2Answer = value;
        break;
      default:
    }

    this.exercise1Correct = this.exercise1Answer === this.exercise1Result;
    this.exercise2Correct = this.exercise2Answer === this.exercise2Result;

    if (this.exercise1Correct && this.exercise2Correct) {
      this.correctAnswers = 2;
    } else if (this.exercise1Correct) {
      this.correctAnswers = 1;
    } else if (this.exercise2Correct) {
      this.correctAnswers = 1;
    } else {
      this.correctAnswers = 0;
    }
  };

  InterestTask.prototype.resolve = function(){
    this.resolved = true;
    this.onResolve();
  };

  InterestTask.prototype._getResult = function(years) {
    return this.amount * Math.pow(1 + this.rate, years || 1);
  };

  // registry
  angular.module(module).directive('interestTask', function(){
    return {
      scope: {
        rate: '=?interestTaskRate',
        years: '=?interestTaskYears',
        amount: '=?interestTaskAmount',
        onResolve: '&interestTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: InterestTask,
      bindToController: true,
      controllerAs: 'interestTaskController',
      templateUrl: 'views/directives/interest-task.html'
    };
  });

  // --------------------------------------------------
  // InterestTask Exercise
  // --------------------------------------------------

  // controller
  var InterestTaskExercise = function($scope,$element,$attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this.disabled = false;
    this.stack = [];
    this.sum = 0;

    var me = this;
    this.$scope.$watch(
      function(){ return me.sum; },
      function(sum) {
        if (!sum) {
          me.sum = 0;
          me.stack = [];
        }
      }
    );
  };

  InterestTaskExercise.$inject = ['$scope','$element','$attrs'];
  InterestTaskExercise.prototype.notes = [5,10,20,50,100,200,500];
  InterestTaskExercise.prototype.coins = [0.01,0.02,0.05,0.1,0.2,0.5,1,2];

  InterestTaskExercise.prototype.onDrop = function(value){
    this.stack.push(value);
    this.sum += value;

    this.onUpdate({
      sum: this.sum
    });
  };

  InterestTaskExercise.prototype.revert = function() {
    this.sum -= this.stack.pop();

    this.onUpdate({
      sum: this.sum
    });
  };

  // registry
  angular.module(module).directive('interestTaskExercise', function(){
    return {
      scope: {
        sum: '=?interestTaskExerciseSum',
        onUpdate: '&interestTaskExerciseOnUpdate',
        disabled: '=?interestTaskExerciseDisabled'
      },
      restrict: 'A',
      transclude: true,
      controller: InterestTaskExercise,
      bindToController: true,
      controllerAs: 'interestTaskExerciseController',
      templateUrl: 'views/directives/interest-task-exercise.html'
    };
  });




})(ANGULAR_MODULE, angular);
