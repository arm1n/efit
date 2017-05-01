/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  var State = function(notification) {
    this.notification = notification;
  };

  State.$inject = ['notification'];

  State.BEGINNER = 1;
  State.AMATEUR = 2;
  State.ADVANCED = 3;
  State.EXPERT = 4;
  State.PROFI = 5;

  State.prototype.states = [
    State.BEGINNER,
    State.AMATEUR,
    State.ADVANCED,
    State.EXPERT,
    State.PROFI
  ];

  State.prototype.currentState = State.BEGINNER;
  State.prototype.isBeginner = true;
  State.prototype.isAmateuer = false;
  State.prototype.isAdvanced = false;
  State.prototype.isExpert = false;
  State.prototype.isProfi = false;

  State.prototype.add = function() {
    var total = this.states.length;
    var state = this.currentState;
    if (state === total) {
      return;
    }

    this.set(this.states[state]);

    this.notification.notify(
      'Gratulation, du hast einen neuen Status erreicht!',
      'success'
    );
  };

  State.prototype.get = function() {
    switch(this.currentState) {
      case State.BEGINNER:
        return 'BEGINNER';
      case State.AMATEUR:
        return 'AMATEUR';
      case State.ADVANCED:
        return 'ADVANCED';
      case State.EXPERT:
        return 'EXPERT';
      case State.PROFI:
        return 'PROFI';
      default:
        return null;
    }
  };

  State.prototype.set = function(state) {
    if (this.states.indexOf(state) < 0) {
      return;
    }

    this.isBeginner = state >= State.BEGINNER;
    this.isAmateur = state >= State.AMATEUR;
    this.isAdvanced = state >= State.ADVANCED;
    this.isExpert = state >= State.EXPERT;
    this.isProfi = state >= State.PROFI;

    this.currentState = state;
  };

  angular.module(module).service('state', State);

})(ANGULAR_MODULE, angular);
