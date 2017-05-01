/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // BombTask
  // --------------------------------------------------

  // controller
  var BombTask = function($scope, $attrs, $element, $filter, $interval, randomService) {
    // this._storageKey = 'bomb_task_state';

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

  BombTask.prototype.$onInit = function() {
    this.init();
  };

  BombTask.prototype.init = function() {
    this._initInternals();
    this._initMatrix();
    this._initBomb();

    this._desist();

    if (!this.dynamic) {
      this.start();
    }
  };

  BombTask.prototype.reset = function() {
    this._removeState();

    this.init();
  };

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
    this._persist();
  };

  BombTask.prototype.stop = function() {
    if (this.dynamic && this._intervalId) {
      this.$interval.cancel(this._intervalId);
    }

    this.stopped = true;
    this._persist();
  };

  BombTask.prototype.resolve = function() {
    for (var i=0; i<this.collection.length; i++) {
      this.collection[i].$$resolved = true;
    }

    this.resolved = true;
    this.onResolve();
    this._persist();
  };

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

    this._persist();
  };

  BombTask.prototype.trackId = function(column) {
    return column.row + '_' + column.col;
  };

  BombTask.prototype.isBomb = function(column) {
    return angular.equals(this.bomb,column);
  };

  BombTask.prototype._getColumn = function(data) {
    var row = data.row - 1;
    var col = data.col - 1;

    return this.matrix[row][col];
  };

  BombTask.prototype._getState = function() {
    /*
    if (typeof sessionStorage !== 'undefined') {
      return angular.fromJson(sessionStorage.getItem(this._storageKey));
    }
    */

    return null;
  };

  BombTask.prototype._setState = function(/*data*/) {
    /*
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this._storageKey,angular.toJson(data));
    }
    */
  };

  BombTask.prototype._removeState = function() {
    /*
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this._storageKey);
    }
    */
  };

  BombTask.prototype._persist = function() {
    /*
    var state = {
      bomb: this.bomb,
      started: this.started,
      stopped: this.stopped,
      resolved: this.resolved,
      collection: this.collection
    };

    if( this.dynamic )
    {
      state.iterator = this.iterator;
      state._intIndex = this._intIndex;
    }

    this._setState(state);
    */
  };

  BombTask.prototype._desist = function() {
    /*
    var state = this._getState();
    if (state === null) {
      return;
    }

    this.bomb = this._getColumn(state.bomb);

    var column;

    if( state.iterator )
    {
      this.iterator = [];
      for( var i=0;i<state.iterator.length;i++ )
      {
        column = this._getColumn(
          state.iterator[i]
        );

        this.iterator.push(column);
      }
    }

    for( var j=0;j<state.collection.length;j++ ) {
      column = this._getColumn(
        state.collection[j]
      );

      this.update(column,true);
    }

    if (state.started) {
      this.start(state._intIndex);
    }

    if (state.stopped) {
      this.stop();
    }

    if (state.resolved) {
      this.resolve();
    }
    */
  };

  BombTask.prototype._initInternals = function() {
    this.collection = [];

    this.hasBomb = false;
    this.started = false;
    this.stopped = false;
    this.resolved = false;

    this.collectedBoxes = 0;
    this.remainingBoxes = 0;
    this.totalBoxes = this.rows * this.cols;
  };

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

  BombTask.prototype._initBomb = function() {
    var row = this.randomService.between(0,this.rows-1);
    var col = this.randomService.between(0,this.cols-1);

    this.bomb = this.matrix[row][col];
  };

  // controller
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

  // controller
  var BombTaskCard = function(){
  };

  BombTaskCard.prototype.model = null;

  BombTaskCard.prototype.isActive = false;

  BombTaskCard.prototype.isDisabled = false;

  BombTaskCard.prototype.isClickable = true;

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
