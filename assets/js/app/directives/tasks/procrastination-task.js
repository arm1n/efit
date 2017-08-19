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
  // ProcrastinationTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ProcrastinationTask = function($scope, $elemnt, $attrs, $injector) {
    var type = $injector.get('TYPE_PROCRASTINATION');
    var user = $injector.get('user');

    this.$injector = $injector;
    this.task = user.getTaskByType(type);
  };

  ProcrastinationTask.$inject = ['$scope','$element','$attrs', '$injector'];

  // SERVER

  /** @var {string} type Task's `type` property from server. */
  ProcrastinationTask.prototype.type = null;

  /** @var {object} task Task's resource from server. */
  ProcrastinationTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} resolved If player has resolved the game. */
  ProcrastinationTask.prototype.resolved = false;

  // SETTINGS

  /** @var {boolean} setting Description. */
  ProcrastinationTask.prototype.setting = null;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  ProcrastinationTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {void}
   */
  ProcrastinationTask.prototype.getPayload = function() {
    return {
      task: this.task,
      json: {
      }
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  ProcrastinationTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  ProcrastinationTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (!this.choice) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  ProcrastinationTask.prototype.init = function() {
    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  ProcrastinationTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Description.
   *
   * @public
   * @method update
   * @return {void}
   */
  ProcrastinationTask.prototype.update = function(){
    this.resolve();
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  ProcrastinationTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');

    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('procrastinationTask', function(){
    return {
      scope: {
        onResolve: '&procrastinationTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: ProcrastinationTask,
      bindToController: true,
      controllerAs: 'procrastinationTaskController',
      templateUrl: 'views/directives/tasks/procrastination-task.html'
    };
  });

})(ANGULAR_MODULE, angular);
