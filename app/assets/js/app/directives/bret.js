/*!
 * fastshell
 * Fiercely quick and opinionated front-ends
 * https://HosseinKarami.github.io/fastshell
 * @author Hossein Karami
 * @version 1.0.5
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Bret
  // --------------------------------------------------

  var Bret = function($scope, $attrs, $element, $filter, $interval) {
    this._storageKey = 'bret_state';

    this.$interval = $interval;
    this.$element = $element;
    this.$filter = $filter;
    this.$attrs = $attrs;
    this.$scope = $scope;
  };

  Bret.$inject = ['$scope', '$attrs', '$element', '$filter', '$interval'];

  Bret.prototype.avg = 12;

  Bret.prototype.rows = 5;

  Bret.prototype.cols = 5;

  Bret.prototype.dynamic = false;

  Bret.prototype.random = false;

  Bret.prototype.interval = 1;

  Bret.prototype.$onInit = function() {
    this.init();
  };

  Bret.prototype.init = function() {

    // init internal members
    this._initInternals();
    this._initWatches();
    this._initMatrix();
    this._initBomb();

    // restore state
    this._desist();

    // auto kick off
    if (!this.dynamic) {
      this.start();
    }
  };

  Bret.prototype.reset = function() {

    // unset watches and storage
    // this._collectionUnwatchF();
    // this._bombUnwatchF();
    this._removeState();

    // reinitialize
    this.init();
  };

  Bret.prototype.start = function(index) {

    // automatically resolve cards
    // by given time interval, so
    // by random order or rows
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

  Bret.prototype.stop = function() {
    if (this.dynamic && this._intervalId) {
      this.$interval.cancel(this._intervalId);
    }

    this.stopped = true;
    this._persist();
  };

  Bret.prototype.resolve = function() {
    for (var i=0; i<this.collection.length; i++) {
      this.collection[i].$$resolved = true;
    }

    this.resolved = true;
    this.onResolve();
    this._persist();
  };

  Bret.prototype.update = function(column,active) {
    var index = this.collection.indexOf(column);

    if (active) {
      if (index<0) {
        this.collection.push(column);
      }

      column.$$active = true;
    } else {
      if (index>=0) {
        this.collection.splice(index,1);
        column.$$active = false;
      }
    }

    this._persist();
  };

  Bret.prototype.trackId = function(column) {
    return column.row + '_' + column.col;
  };

  Bret.prototype.isBomb = function(column) {
    return angular.equals(this.bomb,column);
  };

  Bret.prototype.hasBomb = function() {
    var me = this;
    var filtered = this.$filter('filter')(
      this.collection,
      function(column)
      {
        return me.isBomb(column);
      }
    );

    return +(filtered.length === 1);
  };

  Bret.prototype.getTotalBoxes = function() {
    return this.rows * this.cols;
  };

  Bret.prototype.getCollectedBoxes = function() {
    return this.collection.length;
  };

  Bret.prototype.getRemainingBoxes = function() {
    return this.getTotalBoxes() - this.getCollectedBoxes();
  };

  Bret.prototype._getColumn = function(data) {
    var row = data.row - 1;
    var col = data.col - 1;

    return this.matrix[row][col];
  };

  Bret.prototype._getState = function() {
    if (typeof sessionStorage !== 'undefined') {
      return angular.fromJson(sessionStorage.getItem(this._storageKey));
    }

    return null;
  };

  Bret.prototype._setState = function(data) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this._storageKey,angular.toJson(data));
    }
  };

  Bret.prototype._removeState = function() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(this._storageKey);
    }
  };

  Bret.prototype._persist = function() {
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

  Bret.prototype._desist = function() {
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

  Bret.prototype._initInternals = function() {
    this.collection = [];
    this.started = false;
    this.stopped = false;
    this.resolved = false;
  };

  Bret.prototype._initWatches = function() {
    /*
    var me = this;
    this._collectionUnwatchF = this.$scope.$watchCollection(
      function(){ return me.collection; },
      function(collection){
        me.form.boxes_collected = collection.length;
        me.form.boxes_scheme = angular.toJson(collection);
      }
    );

    this._bombUnwatchF = this.$scope.$watch(
      function(){ return me.hasBomb(); },
      function(hasBomb){
        me.form.bomb = hasBomb;
        me.form.bomb_location = angular.toJson(me.bomb);
      }
    );
    */
  };

  /**
  * @ignore
  */
  Bret.prototype._initMatrix = function() {
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
            this._pushRandom(this.iterator,data);
          }
        }
      }

      this.matrix.push(columns);
    }
  };

  Bret.prototype._initBomb = function() {
    var row = this._getRandom(0,this.rows-1);
    var col = this._getRandom(0,this.cols-1);

    this.bomb = this.matrix[row][col];
  };

  Bret.prototype._getRandom = function(min,max) {
    return Math.floor(Math.random() * (max-min+1) + min);
  };

  Bret.prototype._pushRandom = function(array,value) {
    // Methodology: Inside-Out Shuffle Algorithm
    var rand = this._getRandom(0,array.length);
    array.push(array[rand]);
    array[rand] = value;

    return array.length;
  };

  Bret.prototype._shuffleArray = function(array) {
    // Methodology: Fisher-Yates-Algorithm
    for (var i=array.length-1; i>0; i--) {
      var rand = this._getRandom(0,i),
          temp = array[i];

          array[i] = array[rand];
          array[rand] = temp;
    }

    return array;
  };

  angular.module(module).directive('bret',function(){
    return {
      scope: {
        rows: '=?bretRows',
        cols: '=?bretCols',
        random: '=?bretRandom',
        dynamic: '=?bretDynamic',
        interval: '=?bretInterval',
        onResolve: '&bretOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: Bret,
      bindToController: true,
      controllerAs: 'bretController',
      templateUrl: 'assets/views/bret.html'
    };
  });

  // --------------------------------------------------
  // Bret Card
  // --------------------------------------------------

  var BretCard = function(){
  };

  BretCard.prototype.model = null;

  BretCard.prototype.isActive = false;

  BretCard.prototype.isDisabled = false;

  BretCard.prototype.isClickable = true;

  BretCard.prototype.toggle = function() {
    if (this.isDisabled || !this.isClickable) {
      return;
    }

    this.isActive = !this.isActive;

    this.onToggle({
      model:this.model,
      state:this.isActive
    });
  };

  angular.module(module).directive('bretCard', function(){
    return {
      scope: {
        model:'=bretCard',
        onToggle:'&bretCardOnToggle',
        isActive:'=?bretCardIsActive',
        isDisabled:'=?bretCardIsDisabled',
        isClickable:'=?bretCardIsClickable'
      },
      restrict: 'A',
      transclude: true,
      controller: BretCard,
      bindToController: true,
      controllerAs: 'bretCardController',
      templateUrl: 'assets/views/bret-card.html'
    };
  });

})(ANGULAR_MODULE, angular);
