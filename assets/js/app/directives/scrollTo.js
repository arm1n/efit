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
  // ScrollTo
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ScrollTo = function($scope, $element, $attrs, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    console.log('YES');
  };

  ScrollTo.$inject = ['$scope','$element','$attrs', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {object} options Options for `scroll` service. */
  ScrollTo.prototype.options = {};

  /** @var {function} callback Callback for scroll finished. */
  ScrollTo.prototype.callback = null;

  //
  // METHODS
  //

  /**
   * Watches user's `state` property and maps them for view.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  ScrollTo.prototype.$onInit = function() {
    this.$element.on('click', this._onClick);
  };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  ScrollTo.prototype.$onDestroy = function() {
    this.$element.off('click', this._onClick);
  };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  ScrollTo.prototype._onClick = function() {
    var scroll = this.$injector.get('scroll');

    console.log('YES');

    scroll.scrollTo(
      this.element,
      this.options,
      this.callback
    );
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('scrollTo', function(){
    return {
      scope: {
        element: '=scrollTo',
        options: '=?scrollToOptions',
        callback: '=?scrollToCallback'
      },
      restrict: 'A',
      controller: ScrollTo,
      bindToController: true
    };
  });

})(ANGULAR_MODULE, angular);
