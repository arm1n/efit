/*!
 * eFit Website
 * An app for financial training in educational environments
 * http://www.e-fit.com
 * @author Armin Pfurtscheller
 * @version 1.0.0
 * Copyright 2017. MIT licensed.
 */
/* global ANGULAR_MODULE, angular, UIkit */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var Modal = function() {
  };

  Modal.$inject = [];

  //
  // METHODS
  //

  /**
   * Shows user notification in a toast message.
   *
   * @public
   * @method notify
   * @param {string} message
   * @param {string} status One of `danger`, `warning`, `success`.
   * @return {void}
   */
  Modal.prototype.show = function(message, status) {
    var x = UIkit.modal('<p class="uk-modal-body">UIkit dialog!</p>');

    console.log( x );
  };

  /**
   * Shows user success notification.
   *
   * @public
   * @method success
   * @param {string} message
   * @return {void}
   */
  Modal.prototype.success = function(message) {
    this.notify(message, 'success');
  };

  /**
   * Shows user error notification.
   *
   * @public
   * @method error
   * @param {string} message
   * @return {void}
   */
  Modal.prototype.error = function(message) {
    this.notify(message, 'danger');
  };

  /**
   * Shows user warning notification.
   *
   * @public
   * @method warning
   * @param {string} message
   * @return {void}
   */
  Modal.prototype.warning = function(message) {
    this.notify(message, 'warning');
  };

  //
  // REGISTRY
  //
  angular.module(module).service('modal', Modal);

})(ANGULAR_MODULE, angular);
