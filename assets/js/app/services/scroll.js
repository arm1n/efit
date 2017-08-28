/*!
 * eFit Website
 * An app for financial training in educational environments
 * http://www.e-fit.com
 * @author Armin Pfurtscheller
 * @version 1.0.0
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular, UIkit, jQuery */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var Scroll = function($rootScope) {
    this._body = jQuery(document.body);
    this.$rootScope = $rootScope;
  };

  Scroll.$inject = ['$rootScope'];

  //
  // METHODS
  //

  /**
   * Shows user notification in a toast message.
   *
   * @public
   * @method scrollTo
   * @param {mixed} element
   * @param {object} options Additional options like `duration`, `easing` and `offset`.
   * @param {function} callback Optional callback to be invoked after scroll finished.
   * @return {object} Scroll object
   */
  Scroll.prototype.scrollTo = function(element, options, callback) {
    if (!(element instanceof jQuery)) {
      if (element.charAt(0) !== '#') {
        element = '#' + element;
      }

      element = jQuery(element);
    }

    options = options || {};
    options.offset = options.offset || 80;
    options.duration = options.duration || 500;
    options.easing = options.easing || 'easeOutExpo';

    var me = this;
    var onScrolled = function() {
      element.off('scrolled', onScrolled);
      if (angular.isFunction(callback)) {
        me.$rootScope.$evalAsync(callback);
      }
    };

    element.on('scrolled', onScrolled);

    UIkit.scroll(this._body, options).scrollTo(element);
  };

  //
  // REGISTRY
  //
  angular.module(module).service('scroll', Scroll);

})(ANGULAR_MODULE, angular);
