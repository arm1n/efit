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
