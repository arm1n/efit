/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Asynchronous Validators
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ValidatorWorkshopExists = function($scope, $element, $attrs, $q, Workshop)
    {
      this.$q = $q;
      this.$scope = $scope;
      this.$attrs = $attrs;
      this.$element = $element;

      this.Workshop = Workshop;

      this.keyLocked = 'validatorWorkshopLocked';
    };

  ValidatorWorkshopExists.$inject = ['$scope', '$element', '$attrs', '$q', 'Workshop'];

  //
  // METHODS
  //

  /**
   * Applies `validatorWorkshopExists` to $asyncValidators.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  ValidatorWorkshopExists.prototype.$onInit = function()
    {
      this.ngModel.$asyncValidators.validatorWorkshopExists = this.validate.bind(this);
    };

  /**
   * Queries server to see if the workshop exists. It sets implicitly `validatorWorkshopLocked`
   * to avoid multiple server queries and sets to invalid if `isActive` is not true (= locked).
   *
   * @public
   * @method validate
   * @return {Void}
   */
  ValidatorWorkshopExists.prototype.validate = function(modelValue/*, newValue*/)
    {
      var defer = this.$q.defer();

      var me = this;
      var successCallback = function(workshop)
      {
        if (!workshop.isActive) {
          me.ngModel.$setValidity(me.keyLocked, false);
          defer.reject();
          return;
        }

        me.ngModel.$setValidity(me.keyLocked, true);
        defer.resolve();
      };

      var failureCallback = function()
      {
        defer.reject();
      };

      this.Workshop.validateWorkshopFrontend(
        {
          code: modelValue
        },
        successCallback,
        failureCallback
      );

      return defer.promise;
    };

  //
  // REGISTRY
  //
  angular.module(ANGULAR_MODULE).directive('validatorWorkshopExists',function() {
      return {
        restrict: 'A',
        require: {
          ngModel: 'ngModel'
        },
        bindToController: true,
        controller: ValidatorWorkshopExists
      };
  });

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ValidatorWorkshopUnique = function($scope, $element, $attrs, $q, Workshop)
    {
      this.$q = $q;
      this.$scope = $scope;
      this.$attrs = $attrs;
      this.$element = $element;

      this.Workshop = Workshop;
    };

  ValidatorWorkshopUnique.$inject = ['$scope', '$element', '$attrs', '$q', 'Workshop'];

  //
  // METHODS
  //

  /**
   * Applies `validatorWorkshopUnique` to $asyncValidators.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  ValidatorWorkshopUnique.prototype.$onInit = function()
    {
      this.ngModel.$asyncValidators.validatorWorkshopUnique = this.validate.bind(this);
    };

  /**
   * Queries server to see if the workshop exists.
   *
   * @public
   * @method validate
   * @return {Void}
   */
  ValidatorWorkshopUnique.prototype.validate = function(modelValue/*, newValue*/)
    {
      var defer = this.$q.defer();

      var successCallback = function()
      {
        defer.reject();
      };

      var failureCallback = function()
      {
        defer.resolve();
      };

      this.Workshop.validateWorkshopBackend(
        {
          code: modelValue
        },
        successCallback,
        failureCallback
      );

      return defer.promise;
    };

  //
  // REGISTRY
  //
  angular.module(ANGULAR_MODULE).directive('validatorWorkshopUnique',function() {
      return {
        restrict: 'A',
        require: {
          ngModel: 'ngModel'
        },
        bindToController: true,
        controller: ValidatorWorkshopUnique
      };
  });

})(ANGULAR_MODULE, angular);
