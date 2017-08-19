/*!
 * eFit Website
 * An app for financial training in educational environments
 * http://www.e-fit.com
 * @author Armin Pfurtscheller
 * @version 1.0.0
 * Copyright 2017. MIT licensed.
 */
/* global angular */
(function(global, angular){
  'use strict';

  //
  // ANGULAR
  //
  if (typeof angular === 'undefined') {
    throw Error('Cannot initialize eFit without angular!');
  }

  //
  // MODULE
  //
  var module = 'eFit';

  //
  // APP
  //
  var app = angular.module(module,[
    'ngSanitize',
    'ngMessages',
    'ngResource',
    'ui.router'
  ]);

  //
  // CONSTANTS
  //
  app.constant('VIEWS_PATH', '/views');
  //app.constant('API_URL', 'http://localhost:8000/api');
  //app.constant('API_URL','http://localhost/felix/e-fit/backend/web/app_dev.php/api');
  app.constant('API_URL', 'https://efit-production.scalingo.io/api');

  app.constant('GROUP_A', 1);
  app.constant('GROUP_B', 2);

  app.constant('STATE_BEGINNER', 1);
  app.constant('STATE_AMATEUR', 2);
  app.constant('STATE_ADVANCED', 3);
  app.constant('STATE_EXPERT', 4);

  app.constant('TYPE_INTEREST', 'INTEREST');
  app.constant('TYPE_DIVERSIFICATION', 'DIVERSIFICATION');

  app.constant('TYPE_RISK', 'RISK');
  app.constant('TYPE_ANCHORING', 'ANCHORING');
  app.constant('TYPE_MENTAL_BOOKKEEPING', 'MENTAL_BOOKKEEPING');
  app.constant('TYPE_FRAMING', 'FRAMING');

  app.constant('TYPE_SAVINGS_TARGET', 'SAVINGS_TARGET');
  app.constant('TYPE_SAVINGS_SUPPORTED', 'SAVINGS_SUPPORTED');
  app.constant('TYPE_SELF_COMMITMENT', 'SELF_COMMITMENT');
  app.constant('TYPE_PROCRASTINATION', 'PROCRASTINATION');

  //
  // CONFIG
  //
  app.config([
    '$locationProvider', '$stateProvider', '$urlRouterProvider', '$httpProvider',
    '$templateRequestProvider', '$resourceProvider', '$qProvider', 'VIEWS_PATH',
    function(
      $locationProvider, $stateProvider, $urlRouterProvider, $httpProvider,
      $templateRequestProvider, $resourceProvider, $qProvider, VIEWS_PATH) {

      // -------------------------
      // LOCATION
      // -------------------------

      //$locationProvider.html5Mode(true);
      //$locationProvider.hashPrefix('!');

      // -------------------------
      // INTERCEPTORS
      // -------------------------
      $httpProvider.interceptors.push('httpInterceptor');

      // -------------------------
      // PROMISES
      // -------------------------
      $qProvider.errorOnUnhandledRejections(false);

      // -------------------------
      // RESOURCES
      // -------------------------
      $resourceProvider.defaults.actions = {
        get:    { method: 'GET' },
        list:   { method: 'GET', isArray:true },
        update: { method: 'PATCH' },
        create: { method: 'POST'},
        delete: { method: 'DELETE'}
      };

      // -------------------------
      // TEMPLATES
      // -------------------------

      // assign default `templateUrl` for states
      $stateProvider.decorator('views', function(state, parent) {
        //
        // Assigns default template URL:
        // ./path/to/state/[view/][/name].html
        //
        var newViewConfig = {}, views = parent(state);
        angular.forEach(views, function(config, view){
          var viewMatch = view.match(/([^@]+)\@/); // [parentView/]view@state.name
          var viewName = viewMatch ? '/' + viewMatch[1] : '';

          var stateName = state.name.replace(/\./g, '/');
          var basePath = VIEWS_PATH + '/';

          var templateUrl = config.templateUrl || [
            basePath,
            stateName,
            viewName,
            '.html'
          ].join('');

          config.templateUrl = templateUrl;
          newViewConfig[view] = config;
        });

        return newViewConfig;
      });

      // ignore JWT authorization on template requests
      $templateRequestProvider.httpOptions({
        skipAuthorization: true
      });

      // -------------------------
      // STATES
      // -------------------------

      // main (i18n)
      $stateProvider.state('main', {
        url: '',
        abstract: true,
        resolve: {
          translations: ['i18n', function(i18n){
            return i18n.load('de', {
              skipAuthorization: true
            });
          }]
        },
        template: '<div data-ui-view=""></div>'
      });

      // frontend
      $stateProvider.state('frontend', {
        parent: 'main',
        url: '/',
        resolve: {
          user: ['user', '$state', function(user, $state){
            var promise = user.load().$promise;
            return promise.catch(function(){
              console.log('YES');
              $state.go('login.frontend');
            });
          }]
        },
        data: {
          role: [
            'ROLE_USER',
            'ROLE_ADMIN',
            'ROLE_SUPER_ADMIN'
          ]
        },
        views: {
          'navbar@frontend': {},
          'home@frontend': {},
          'topics@frontend': {},

          'financial-knowledge@frontend':{},
          'financial-knowledge/interest-task@frontend':{},
          'financial-knowledge/diversification-task@frontend':{},

          'consumer-behaviour@frontend':{},
          'consumer-behaviour/bomb-task@frontend':{},
          'consumer-behaviour/anchoring-task@frontend':{},
          'consumer-behaviour/mental-bookkeeping-task@frontend':{},
          'consumer-behaviour/framing-task@frontend':{},

          'self-control@frontend':{},
          'self-control/savings-target-task@frontend':{},
          'self-control/savings-supported-task@frontend':{},
          'self-control/self-commitment-task@frontend':{},
          'self-control/procrastination-task@frontend':{},

          'status@frontend': {},
          'contact@frontend': {
            controller: 'ContactController',
            controllerAs: 'contactController'
          },
          'footer@frontend': {},
          'offcanvas@frontend': {},
          '@': {
            controller: 'FrontendController',
            controllerAs: 'frontendController'
          }
        }
      });

      // backend
      $stateProvider.state('backend', {
        parent: 'main',
        url: '/admin',
        data: {
          role: 'ROLE_ADMIN'
        },
        redirectTo: 'backend.workshops',
        views: {
          'main@backend': {},
          'navbar@backend': {},
          'footer@backend': {},
          'offcanvas@backend': {},
          '@': {
            controller: 'BackendController',
            controllerAs: 'backendController'
          }
        }
      });

      $stateProvider.state('backend.workshops', {
        url: '?{expand:int}',
        resolve: {
          workshops: ['Workshop', function(Workshop){
            return Workshop.list().$promise;
          }]
        },
        params: {
          expand: {
            value: null,
            dynamic: true
          }
        },
        controller: 'WorkshopController',
        controllerAs: 'workshopController'
      });

      // login
      $stateProvider.state('login', {
        url: '/login',
        parent: 'main',
        abstract: true,
        redirectTo: 'login.frontend.index'
      });

      $stateProvider.state('login.frontend', {
        url: '/app',
        data: {
          redirects: {
            ROLE_USER: 'frontend'
          }
        },
        redirectTo: 'login.frontend.index',
        controller: 'LoginFrontendController',
        controllerAs: 'loginFrontendController'
      });

      $stateProvider.state('login.frontend.index', {
        url: ''
      });

      $stateProvider.state('login.frontend.signup', {
        url: '/schule'
      });

      $stateProvider.state('login.frontend.signin', {
        url: '/zuhause'
      });

      $stateProvider.state('login.backend', {
        url: '/admin',
        data: {
          redirects: {
            ROLE_ADMIN: 'backend'
          }
        },
        controller: 'LoginBackendController',
        controllerAs: 'loginBackendController'
      });

      $urlRouterProvider.otherwise('/');
    }
  ]);

  //
  // RUN
  //
  app.run(['$injector', function($injector) {
      var $transitions = $injector.get('$transitions');
      var $rootScope = $injector.get('$rootScope');
      var appState = $injector.get('appState');
      var $state = $injector.get('$state');
      var auth = $injector.get('auth');

      var $trace = $injector.get('$trace');
      $trace.enable('TRANSITION');

      var onStart = function(transition) {
        appState.routerBusy = true;

        var state = transition.to();
        var data = state.data || {};
        var role = data.role || null;
        var redirects = data.redirects || {};

        // no authentication check for states
        // without any authorization settings
        if (role === null) {

          // try to redirect authenticated users
          // with auth roles to configured route
          var user = auth.getUser();
          if (user === null) {
            return;
          }

          var roles = user.roles || [];
          for (role in redirects) {
            if (roles.indexOf(role)>=0) {
              var target = redirects[role];
              return $state.target(target);
            }
          }

          return true;
        }

        // assert role an array for callbacks
        if (!angular.isArray(role)) {
          role = [role];
        }

        var successCallback = function()
          {
            return true;
          };

        var failureCallback = function()
          {
            // redirect to login page depending on
            // given role with unsufficient rights
            switch(role[0])
            {
              case 'ROLE_ADMIN':
              case 'ROLE_SUPER_ADMIN':
                return $state.target('login.backend');
              default:
                return $state.target('login.frontend');
            }
          };

        return auth.hasRole(role).then(
          successCallback,
          failureCallback
        );
      };

      var onError = function(/*transition*/) {
        appState.routerBusy = false;
      };

      var onSuccess = function(transition) {
        $rootScope.state = transition.to();
        appState.routerBusy = false;
      };

      $rootScope.$watch(
        function() {
          return appState.isBusy();
        },
        function(isBusy) {
          $rootScope.isBusy = isBusy;
          $rootScope.httpBusy = appState.httpBusy;
          $rootScope.routerBusy = appState.routerBusy;
        }
      );

      $transitions.onError({}, onError);
      $transitions.onStart({}, onStart);
      $transitions.onSuccess({}, onSuccess);
    }
  ]);

  //
  // EXPOSE
  //
  global.ANGULAR_MODULE = module;

})(window, angular);
