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

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var SaveCoinTask = function($scope, $element, $attrs, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    var user = $injector.get('user');
    this.type = $injector.get('TYPE_SAVINGS_TARGET');
    this.task = user.getTaskByType(this.type);
  };

  SaveCoinTask.$inject = ['$scope', '$element', '$attrs', '$injector'];

  //
  // PROPERTIES
  //

  // SERVER

  /** @var {string} type Task's `type` property from server. */
  SaveCoinTask.prototype.type = null;

  /** @var {object} task Task's resource from server. */
  SaveCoinTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} resolved If player has resolved the game. */
  SaveCoinTask.prototype.resolved = false;

  // SETTINGS

  /** @var {number} amount Amount of total cards. */
  SaveCoinTask.prototype.amount = 3;

  /** @var {array} cards Dummy collection of cards. */
  SaveCoinTask.prototype.cards = [];

  /** @var {number} count Number of revealed cards. */
  SaveCoinTask.prototype.count = 0;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  SaveCoinTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {Void}
   */
  SaveCoinTask.prototype.getPayload = function() {
    return {
      task: this.type,
      json: {
        cards: this.count
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
  SaveCoinTask.prototype.isLocked = function() {
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
  SaveCoinTask.prototype.canResolve = function() {
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

    var cur = this.count;
    var max = this.amount;
    if (cur < max) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {Void}
   */
  SaveCoinTask.prototype.init = function() {
    this.cards = [];
    for (var i=1; i<=this.amount; i++) {
      this.cards.push(i);
    }

    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {Void}
   */
  SaveCoinTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Increases `count` and invokes `resolve()`.
   *
   * @public
   * @method update
   * @return {Void}
   */
  SaveCoinTask.prototype.update = function(){
    this.count++;

    if (this.canResolve()) {
      this.resolve();
    }
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {Void}
   */
  SaveCoinTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');
    var me = this;

    var result = this.onResolve({
      payload: this.getPayload()
    });

    var resolve = function() {
      me.resolved = true;
    };

    $q.when(result).then(resolve);
  };

  //
  // REGISTRY
  //
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
      templateUrl: 'views/directives/tasks/save-coin-task.html'
    };
  });

  // --------------------------------------------------
  // SaveCoinTask Card
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var SaveCoinTaskCard = function($scope,$element,$attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this._scratchCard = null;
  };

  SaveCoinTaskCard.$inject = ['$scope','$element','$attrs'];

  //
  // PROPERTIES
  //

  /** @var {boolean} complete If card has been revelead. */
  SaveCoinTaskCard.prototype.complete = false;

  /** @var {number} thickness Thickness of rubber in pixel. */
  SaveCoinTaskCard.prototype.thickness = 20;

  /** @var {number} treshold Treshold level when card revels. */
  SaveCoinTaskCard.prototype.threshold = 0.75;

  /** @var {string} color Color of card overlay. */
  SaveCoinTaskCard.prototype.color = '#e5e5e5';

  //
  // METHODS
  //

  /**
   * Initializes element with `Scratchcard` library.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
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

  /**
   * Checks progress' treshold has been exceeded, but is still
   * below 100%. In this case, the card will be revelead and
   * the `onComplete` callback can be invoked.
   *
   * @public
   * @method _onProgress
   * @return {Void}
   */
  SaveCoinTaskCard.prototype._onProgress = function(progress) {
    if (progress>this.threshold && progress<1) {
      var onComplete = this.onComplete.bind(this);
      this.$scope.$evalAsync(onComplete);
      this._scratchCard.complete();

      this.complete = true;
    }
  };

  //
  // REGISTRY
  //
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
      templateUrl: 'views/directives/tasks/save-coin-task-card.html'
    };
  });

})(ANGULAR_MODULE, angular);
