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
  // BombTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var BombTask = function($scope, $attrs, $element, $filter, $interval, randomService) {
    this.$interval = $interval;
    this.$element = $element;
    this.$filter = $filter;
    this.$attrs = $attrs;
    this.$scope = $scope;

    this.randomService = randomService;

    this.avg = 12;
    this.rows = 5;
    this.cols = 5;
    this.interval = 1;
    this.random = false;
    this.dynamic = false;

    this.totalBoxes = 0;
    this.stopped = false;
    this.started = false;
    this.hasBomb = false;
    this.resolved = false;
    this.remainingBoxes = 0;
    this.collectedBoxes = 0;
  };

  BombTask.$inject = ['$scope', '$attrs', '$element', '$filter', '$interval', 'random'];

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
  BombTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {Void}
   */
  BombTask.prototype.init = function() {
    this._initMembers();
    this._initMatrix();
    this._initBomb();

    if (!this.dynamic) {
      this.start();
    }
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {Void}
   */
  BombTask.prototype.reset = function() {
    this.init();
  };

  /**
   * Sets `started` flag. If `dynamic` is true,
   * the interval will start to reveal cards.
   *
   * @public
   * @method start
   * @return {Void}
   */
  BombTask.prototype.start = function(index) {
    if (this.dynamic) {
      var me = this;
      var max = this.iterator.length;

      this._intIndex = index || 0;
      this._intervalId = me.$interval(
        function(){

          var item = me.iterator[me._intIndex];
          me.update(item,true);

          me._intIndex++;
          if (me._intIndex===max) {
            me.stop();
          }

        },
        this.interval*1000, // = from seconds
        max - this._intIndex // = max iterations
      );
    }

    this.started = true;
  };

  /**
   * Sets `stopped` flag. If `dynamic` is true,
   * the interval will be stopped in addition.
   *
   * @public
   * @method start
   * @return {Void}
   */
  BombTask.prototype.stop = function() {
    if (this.dynamic && this._intervalId) {
      this.$interval.cancel(this._intervalId);
    }

    this.stopped = true;
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {Void}
   */
  BombTask.prototype.resolve = function() {
    for (var i=0; i<this.collection.length; i++) {
      this.collection[i].$$resolved = true;
    }

    this.resolved = true;
    this.onResolve();
  };

  /**
   * Callback for card click. Updates all
   * related properties for final result.
   *
   * @public
   * @method update
   * @param {object} column
   * @param {boolean} active
   * @return {Void}
   */
  BombTask.prototype.update = function(column, active) {
    var index = this.collection.indexOf(column);

    if (active) {
      if (index<0) {
        this.collection.push(column);
        this.collectedBoxes++;
      }

      column.$$active = true;
    } else {
      if (index>=0) {
        this.collection.splice(index,1);
        column.$$active = false;
        this.collectedBoxes--;
      }
    }

    if (this.isBomb(column)) {
      this.hasBomb = true;
    }

    var total = this.totalBoxes;
    var collected = this.collectedBoxes;
    this.remainingBoxes = total - collected;
  };

  /**
   * Provides indiviual tracking id for column.
   *
   * @public
   * @method trackId
   * @param {object} column
   * @return {Void}
   */
  BombTask.prototype.trackId = function(column) {
    return column.row + '_' + column.col;
  };

  /**
   * Determines if column is actual bomb.
   *
   * @public
   * @method isBomb
   * @param {object} column
   * @return {Void}
   */
  BombTask.prototype.isBomb = function(column) {
    return angular.equals(this.bomb,column);
  };

  /**
   * Initialzes internal properties.
   *
   * @private
   * @method _initMembers
   * @return {Void}
   */
  BombTask.prototype._initMembers = function() {
    this.collection = [];

    this.hasBomb = false;
    this.started = false;
    this.stopped = false;
    this.resolved = false;

    this.collectedBoxes = 0;
    this.remainingBoxes = 0;
    this.totalBoxes = this.rows * this.cols;
  };

  /**
   * Calculates the actual matrix.
   *
   * @private
   * @method _initMatrix
   * @return {Void}
   */
  BombTask.prototype._initMatrix = function() {
    this.matrix = [];
    this.iterator = [];

    for (var i=0; i<this.rows; i++) {

      var columns = [];
      for( var j=0; j<this.cols; j++ ) {
        var data = {
          row: i+1,
          col: j+1
        };

        columns.push(data);

        if (this.dynamic) {
          if (!this.random) {
            this.iterator.push(data);
          } else {
            this.randomService.push(this.iterator,data);
          }
        }
      }

      this.matrix.push(columns);
    }
  };

  /**
   * Initializes bomb's actual location.
   *
   * @private
   * @method _initBomb
   * @return {Void}
   */
  BombTask.prototype._initBomb = function() {
    var row = this.randomService.between(0,this.rows-1);
    var col = this.randomService.between(0,this.cols-1);

    this.bomb = this.matrix[row][col];
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('bombTask',function(){
    return {
      scope: {
        avg: '=?bombTaskAvg',
        rows: '=?bombTaskRows',
        cols: '=?bombTaskCols',
        random: '=?bombTaskRandom',
        dynamic: '=?bombTaskDynamic',
        interval: '=?bombTaskInterval',
        onResolve: '&bombTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: BombTask,
      bindToController: true,
      controllerAs: 'bombTaskController',
      templateUrl: 'views/directives/bomb-task.html'
    };
  });

  // --------------------------------------------------
  // BombTask Card
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var BombTaskCard = function(){
  };

  //
  // PROPERTIES
  //

  /** @var {string} id Card's accociated model. */
  BombTaskCard.prototype.model = null;

  /** @var {string} isActive If card is active. */
  BombTaskCard.prototype.isActive = false;

  /** @var {string} isDisabled If card is disabled. */
  BombTaskCard.prototype.isDisabled = false;

  /** @var {string} isClickable If card is clickable. */
  BombTaskCard.prototype.isClickable = true;

  //
  // METHODS
  //

  /**
   * Toggles `isActive` if `isDisabled` and
   * `isClickable` allow the action. Invokes
   * `onToggle` callback for consumer.
   *
   * @public
   * @method toggle
   * @return {Void}
   */
  BombTaskCard.prototype.toggle = function() {
    if (this.isDisabled || !this.isClickable) {
      return;
    }

    this.isActive = !this.isActive;

    this.onToggle({
      model:this.model,
      state:this.isActive
    });
  };

  // registry
  angular.module(module).directive('bombTaskCard', function(){
    return {
      scope: {
        model:'=bombTaskCard',
        onToggle:'&bombTaskCardOnToggle',
        isActive:'=?bombTaskCardIsActive',
        isDisabled:'=?bombTaskCardIsDisabled',
        isClickable:'=?bombTaskCardIsClickable'
      },
      restrict: 'A',
      transclude: true,
      controller: BombTaskCard,
      bindToController: true,
      controllerAs: 'bombTaskCardController',
      templateUrl: 'views/directives/bomb-task-card.html'
    };
  });

})(ANGULAR_MODULE, angular);
