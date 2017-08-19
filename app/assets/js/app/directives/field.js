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

 /**
  * @constructor
  */
  var FormField = function($scope, $element, $attrs, $transclude, $timeout)
    {
      this.$scope = $scope;
      this.$attrs = $attrs;
      this.$element = $element;
      this.$timeout = $timeout;
      this.$transclude = $transclude;
    };

  FormField.$inject = ['$scope', '$element', '$attrs', '$transclude', '$timeout'];

  //
  // PROPERTIES
  //

  /** @var {string} name Name of form element. */
  FormField.prototype.name = null;

  /** @var {string} label Label of form element. */
  FormField.prototype.label = null;

  /** @var {string} failureClass Class to append on failure. */
  FormField.prototype.failureClass = 'uk-form-danger';

  /** @var {string} successClass Class to append on success. */
  FormField.prototype.successClass = 'uk-form-success';

  //
  // METHODS
  //

  /**
   * Renders custom transclusion (form element) and
   * sets up watchers as well as clean up methods.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  FormField.prototype.$onInit = function()
    {
      // create dom id from `name` and $scope id
      // controller properties are only available
      // in $onInit() callback from Angular 1.5.x
      this.id = this.name + '-' + this.$scope.$id;

      // replace template with transcluded element
      var me = this;
      var transcludeFn = function(clone, scope)
      {
        var element = angular.element('#' + me.id);
        element.replaceWith(clone);
        me._transElement = clone;
        me._transScope = scope;
      };

      var timeoutFn = function()
      {
        me.$transclude(transcludeFn);
      };

      this.$timeout(timeoutFn);

      // add watchers for necessary directive props
      this._unwatchSuccess = this.$scope.$watch(
        function()
        {
          return me.hasSuccess();
        },
        function(hasSuccess)
        {
          if (!me._transElement) {
            return;
          }

          if (hasSuccess) {
            me._transElement.addClass(me.successClass);
          } else {
            me._transElement.removeClass(me.successClass);
          }
        }
      );

      this._unwatchError = this.$scope.$watch(
        function()
        {
          return me.hasError();
        },
        function(hasError)
        {
          if (!me._transElement) {
            return;
          }

          if (hasError) {
            me._transElement.addClass(me.failureClass);
          } else {
            me._transElement.removeClass(me.failureClass);
          }
        }
      );

      // register cleanup method on scope destruction
      this.$scope.$on('$destroy', function(){
        me._transElement.remove();
        me._transScope.$destroy();
        me._unwatchValidations();
        me._unwatchSuccess();
        me._unwatchError();
      });
    };

  /**
   * Retrieves angular form controller.
   *
   * @public
   * @method getForm
   * @return {FormController}
   */
  FormField.prototype.getForm = function()
    {
        return this.$scope.fieldForm;
    };

  /**
   * Retrieves form field reference.
   *
   * @public
   * @method getForm
   * @return {FormController}
   */
  FormField.prototype.getFormField = function()
    {
      var form = this.getForm();
      if (!form) {
        return null;
      }

      return form[this.name] || null;
    };

  /**
   * Checks if field has been touched.
   *
   * @public
   * @method isTouched
   * @return {boolean}
   */
  FormField.prototype.isTouched = function()
    {
        try {
          var field = this.getFormField();
          return field.$touched;
        } catch(e) {
          return false;
        }
    };

  /**
   * Checks if field is valid.
   *
   * @public
   * @method isValid
   * @return {boolean}
   */
  FormField.prototype.isValid = function()
    {
        try {
          var field = this.getFormField();
          return field.$valid;
        } catch(e) {
          return false;
        }
    };

  /**
   * Checks if field is touched and invalid.
   *
   * @public
   * @method hasError
   * @return {boolean}
   */
  FormField.prototype.hasError = function()
    {
      if (!this.isTouched()) {
        return false;
      }

      return !this.isValid();
    };

  /**
   * Checks if field is touched and valid.
   *
   * @public
   * @method hasSuccess
   * @return {boolean}
   */
  FormField.prototype.hasSuccess = function()
    {
      if (!this.isTouched()) {
        return false;
      }

      return this.isValid();
    };

  //
  // REGISTRY
  //
  angular.module(ANGULAR_MODULE).directive('formField',function() {

      return {
          scope: {
              name:'=formField',
              label:'=?formFielddLabel',
              failureClass:'=?formFieldFailureClass',
              successClass:'=?formFieldSuccessClass'
          },
          transclude: {
            messageUrl: '?formFieldMessageUrl',
            messageEmail: '?formFieldMessageEmail',
            messageNumber: '?formFieldMessageNumber',
            messagePattern: '?formFieldMessagePattern',
            messageRequired: '?formFieldMessageRequired',
            messageMinLength: '?formFieldMessageMinLength',
            messageMaxLength: '?formFieldMessageMaxLength'
          },
          restrict: 'A',
          controller: FormField,
          bindToController: true,
          controllerAs: 'formFieldController',
          templateUrl: 'views/directives/form-field.html'
      };

  });

})(ANGULAR_MODULE, angular);
