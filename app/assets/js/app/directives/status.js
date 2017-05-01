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
  // Status
  // --------------------------------------------------

  // controller
  var Status = function() {
    this.iconRatio = 1;
    this.isCompact = false;
    this.iconColor = 'currentcolor';
  };

  Status.$inject = ['$scope','$element','$attrs'];

  // registry
  angular.module(module).directive('status', function(){
    return {
      scope: {
        iconRatio:'=?statusIconRatio',
        iconColor:'=?statusIconColor',
        isCompact:'=?statusIsCompact'
      },
      restrict: 'A',
      transclude: true,
      controller: Status,
      bindToController: true,
      controllerAs: 'statusController',
      templateUrl: 'views/directives/status.html'
    };
  });

  // --------------------------------------------------
  // Status Icons
  // --------------------------------------------------

  // controller
  var StatusIcons = function($scope,$attrs,$element,stateService) {
    this.stateService = stateService;

    this.ratio = 1;
    this.color = 'currentcolor';
  };

  StatusIcons.$inject = ['$scope', '$attrs', '$element', 'state'];

  // registry
  angular.module(module).directive('statusIcons', function(){
    return {
      scope: {
        ratio:'=?statusIconsRatio',
        color:'=?statusIconsColor',
      },
      restrict: 'A',
      transclude: true,
      controller: StatusIcons,
      bindToController: true,
      controllerAs: 'statusIconsController',
      templateUrl: 'views/directives/status-icons.html'
    };
  });

  // --------------------------------------------------
  // Status Label
  // --------------------------------------------------

  // controller
  var StatusLabel = function($scope,$attrs,$element,stateService) {
    this.stateService = stateService;
  };

  StatusLabel.$inject = ['$scope', '$attrs', '$element', 'state'];

  // registry
  angular.module(module).directive('statusLabel', function(){
    return {
      scope: {},
      restrict: 'A',
      transclude: true,
      controller: StatusLabel,
      bindToController: true,
      controllerAs: 'statusLabelController',
      templateUrl: 'views/directives/status-label.html'
    };
  });

})(ANGULAR_MODULE, angular);
