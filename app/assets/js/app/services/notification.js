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

  var Notification = function() {
  };

  Notification.$inject = [];

  Notification.prototype.notify = function(message, status) {
    switch(status) {
      case 'danger':
      case 'warning':
      case 'success':
        UIkit.notification(message, status);
        break;

      default:
        UIkit.notification(message);
    }
  };



  angular.module(module).service('notification', Notification);

})(ANGULAR_MODULE, angular);
