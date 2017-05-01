/*!
 * eFit Website
 * An app for financial training in educational environments
 * http://www.e-fit.com
 * @author Armin Pfurtscheller
 * @version 1.0.0
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular, interact */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Draggable
  // --------------------------------------------------

  // controller
  var Draggable = function($scope, $element, $attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this.data = null;
    this.body = null;
    this.clone = null;
    this.disabled = false;
    this.coordinates = {};
    this.activeClass = 'active';
    this.itemClass = 'draggable';
    this.disabledClass = 'disabled';

    var me = this;
    this.$scope.$watch(
      function(){ return me.disabled; },
      function(disabled) {
        if (disabled) {
          me.$element.addClass(me.disabledClass);
        } else {
          me.$element.removeClass(me.disabledClass);
        }
      }
    );
  };

  Draggable.$inject = ['$scope','$element','$attrs'];

  Draggable.prototype.$onInit = function() {
    this.body = angular.element(document.body);
    this.$element.addClass(this.itemClass);
    var element = this.$element.get(0);

    var interactable = interact(element);

    interactable.draggable({
      inertia: true,
      autoScroll: true,
      manualStart: true,
      enabled: !this.disabled,
      snap: {
          targets:[function(x,y,interaction) {
            // if not dropped, move draggable
            // smoothly back to origin point
            if (!interaction.dropTarget) {
              return { x: 0, y: 0 };
            }
          }],
          offset: 'startCoords',
          endOnly: true
      },
      onend: this._onEndItem.bind(this),
      onmove: this._onMoveItem.bind(this),
      onstart: this._onStartItem.bind(this)
    });

    interactable.on('move', this._onMove.bind(this));
    interactable.getData = this._getData.bind(this);
  };

  Draggable.prototype._onStartItem = function(event) {
    this.clone.addClass(this.activeClass);

    this._trigger('onDragStart', {
      $event: event
    });
  };

  Draggable.prototype._onMoveItem = function(event) {
    var x = (this.coordinates.x || 0) + event.dx;
    var y = (this.coordinates.y || 0) + event.dy;
    var translate = 'translate('+x+'px,'+y+'px)';

    this.clone.css({
      'webkitTransform': translate,
      'mozTransform': translate,
      'msTransform': translate,
      'oTransform': translate,
      'transform': translate
    });

    this.coordinates.x = x;
    this.coordinates.y = y;

    this._trigger('onDragMove', {
      $event: event
    });
  };

  Draggable.prototype._onEndItem = function(event) {
    var dropped = !!event.interaction.dropTarget;

    this.coordinates = {};
    this.clone.remove();
    this.clone = null;

    this._trigger('onDragEnd', {
      $event: event
    });

    if (dropped) {
      this._trigger('onDrop', {
        $event: event,
        $data: this.data
      });
    }
  };

  Draggable.prototype._onMove = function(event) {
    var interactable = event.interactable;
    var interaction = event.interaction;
    var element = event.currentTarget;

    // we've to control `enabled` by our own as we are using the
    // `manualStart` option to create clone - noop if `disabled`
    if (this.disabled) {
      return;
    }

    // create clone if user holds mouse/finger and no interaction
    // is currently started - position absolutely at end of body!
    if (interaction.pointerIsDown && !interaction.interacting()) {
      this.clone = angular.element(element).clone();

      var offsetY = element.clientHeight / 2;
      var offsetX = element.clientWidth / 2;

      var pageY = !!event.touches ?
        event.touches[0].pageY :
        event.pageY;
      var pageX = !!event.touches ?
        event.touches[0].pageX :
        event.pageX;

      this.clone.css({
        left: (pageX - offsetX) + 'px',
        top: (pageY - offsetY) + 'px',
        position: 'absolute'
      });

      this.body.append(this.clone);
      element = this.clone.get(0);
    }

    // invoke 'drag' interaction manually with the target/clone
    interaction.start({ name: 'drag' }, interactable, element);
  };

  Draggable.prototype._getData = function() {
    return this.data;
  };

  Draggable.prototype._trigger = function(method, args) {
    this.$scope.$evalAsync(this[method].bind(this,args));
  };

  // registry
  angular.module(module).directive('draggable', function(){
    return {
      scope: {
        data: '=?draggableData',
        disabled: '=?draggableDisabled',
        onDragStart: '&draggableOnDragStart',
        onDragMove: '&draggableOnDragMove',
        onDragEnd: '&draggableOnDragEnd',
        onDrop: '&draggableOnDrop'
      },
      restrict: 'A',
      controller: Draggable,
      bindToController: true,
      controllerAs: 'draggableController'
    };
  });

  // --------------------------------------------------
  // Dropable
  // --------------------------------------------------

  // controller
  var Dropable = function($scope, $element, $attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this.disabled = false;
    this.enterClass = 'enter';
    this.activeClass = 'active';
    this.itemClass = 'dropable';
    this.acceptClass = 'draggable';
    this.disabledClass = 'disabled';

    var me = this;
    this.$scope.$watch(
      function(){ return me.disabled; },
      function(disabled) {
        if (disabled) {
          me.$element.addClass(me.disabledClass);
        } else {
          me.$element.removeClass(me.disabledClass);
        }
      }
    );
  };

  Dropable.$inject = ['$scope','$element','$attrs'];

  Dropable.prototype.$onInit = function() {
    this.body = angular.element(document.body);
    this.$element.addClass(this.itemClass);
    var accept = '.' + this.acceptClass;
    var element = this.$element.get(0);

    interact(element)
      .dropzone({
        accept: accept,
        enabled: !this.disabled,
        ondrop: this._onDrop.bind(this),
        ondragenter: this._onDragEnter.bind(this),
        ondragleave: this._onDragLeave.bind(this),
        ondropactivate: this._onDropActivate.bind(this),
        ondropdeactivate: this._onDropDeactivate.bind(this)
      });
  };

  Dropable.prototype._onDropDeactivate = function(event) {
    this.$element.removeClass(this.activeClass);

    this._trigger('onDropDeactivate', {
      $event: event
    });
  };

  Dropable.prototype._onDropActivate = function(event) {
    this.$element.addClass(this.activeClass);

    this._trigger('onDropActivate', {
      $event: event
    });
  };

  Dropable.prototype._onDragEnter = function(event) {
    this.$element.addClass(this.enterClass);

    this._trigger('onDragEnter', {
      $event: event
    });
  };

  Dropable.prototype._onDragLeave = function(event) {
    this.$element.removeClass(this.enterClass);

    this._trigger('onDragLeave', {
      $event: event
    });
  };

  Dropable.prototype._onDrop = function(event) {
    this.$element.removeClass(this.enterClass);
    var data = event.draggable.getData();

    this._trigger('onDrop',{
      $event: event,
      $data: data
    });
  };

  Dropable.prototype._trigger = function(method, args) {
    this.$scope.$evalAsync(this[method].bind(this,args));
  };

  // registry
  angular.module(module).directive('dropable', function(){
    return {
      scope: {
        disabled: '=?dropableDisabled',
        onDropDeactivate: '&dropableOnDropDeactivate',
        onDropActivate: '&dropableOnDropActivate',
        onDragEnter: '&dropableOnDragEnter',
        onDragLeave: '&dropableOnDragLeave',
        onDrop: '&dropableOnDrop'
      },
      restrict: 'A',
      controller: Dropable,
      bindToController: true,
      controllerAs: 'droppableController'
    };
  });

})(ANGULAR_MODULE, angular);
