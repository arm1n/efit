/* global angular, FastClick */
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
  app.constant('VIEWS_PATH', 'views');
  app.constant('API_URL','http://localhost/felix/e-fit/backend/web/app_dev.php/api');
  //app.constant('API_URL', 'https://efit-production.scalingo.io/api');

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
      $locationProvider.html5Mode(false);
      $locationProvider.hashPrefix('!');

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
        template: '<div id="main" data-ui-view=""></div>'
      });

      // frontend
      $stateProvider.state('frontend', {
        parent: 'main',
        url: '/',
        resolve: {
          user: ['user', '$state', function(user, $state){
            var promise = user.load().$promise;
            return promise.catch(function(){
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
          'offcanvas@': {
            controller: 'FrontendController',
            controllerAs: 'frontendController'
          },
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
          'offcanvas@': {
            controller: 'BackendController',
            controllerAs: 'backendController'
          },
          '@': {
            controller: 'BackendController',
            controllerAs: 'backendController'
          }
        },

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

      FastClick.attach(document.body);
    }
  ]);

  //
  // EXPOSE
  //
  global.ANGULAR_MODULE = module;

})(window, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  var HttpInterceptor = function($injector)
    {
      this.$injector = $injector;
      this._urls = {};
    };

  /** @var {Array.<string>} $inject Dependencies to be injected by Angular. */
  HttpInterceptor.$inject = ['$injector'];

  /**
   * Gets latest response from $http.
   */
  HttpInterceptor.prototype.getLastSuccessResponse = function()
    {
      return this._lastSuccessResponse;
    };

  /**
   * Gets latest error from $http.
   */
  HttpInterceptor.prototype.getLastErrorResponse = function()
    {
      return this._lastErrorResponse;
    };

  /**
   * Gets latest response from $http.
   */
  HttpInterceptor.prototype.getLastResponse = function()
    {
      return this._lastResponse;
    };

  /**
   * Returns a hash of all requested urls.
   */
  HttpInterceptor.prototype.getUrls = function()
    {
      return this._urls;
    };

  /**
   * Intercepts $http request's config before invocation.
   * @param {object} config
   * @return {object} config
   */
  HttpInterceptor.prototype.request = function(config)
    {
      var appState = this.$injector.get('appState');

      // set app state to busy
      appState.httpBusy = true;

      // save url in internal cache
      this._setUrl(config);

      // common headers
      config.headers['X-Requested-With'] = 'XMLHttpRequest';

      // custom settings
      /*
      switch(config.method)
      {
        case 'POST':
        case 'PUT':
          var $httpParamSerializer = this.$injector.get('$httpParamSerializer');
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
          config.data = $httpParamSerializer(config.data);
          break;

        default:
      }
      */

      // JWT authorization
      var successCallback = function(token) {
        if (token) {
          config.headers.Authorization = 'Bearer ' + token;
        }

        return config;
      };

      var failureCallback = function() {
        return config;
      };

      if (config.skipAuthorization) {
        return config;
      }

      var jwtToken = this._getJWTToken(config);
      var $q = this.$injector.get('$q');
      return $q.when(jwtToken).then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Intercepts $http request error's config before invocation.
   * @param {object} config
   * @return {object} config
   */
  HttpInterceptor.prototype.requestError = function(rejection)
    {
      var appState = this.$injector.get('appState');
      var $q = this.$injector.get('$q');

      appState.httpBusy = false;

      return $q.reject(rejection);
    };

  /**
   * Intercepts $http response before forwarding.
   * @param {object} config
   * @return {object} config
   */
  HttpInterceptor.prototype.response = function(response)
    {
      var appState = this.$injector.get('appState');

      this._setLastSuccessResponse(response);
      this._setLastResponse(response);

      appState.httpBusy = false;

      return response;
    };

  /**
   * Intercepts $http error response before forwarding.
   * @param {object} config
   * @return {object} config
   */
  HttpInterceptor.prototype.responseError = function(rejection)
    {
      var appState = this.$injector.get('appState');
      var $q = this.$injector.get('$q');

      this._showGlobalErrorMessage(rejection);
      this._setLastErrorResponse(rejection);
      this._setLastResponse(rejection);

      appState.httpBusy = false;

      return $q.reject(rejection);
    };

  /**
   * Sets fully qualified url with query string for a request.
   * This is useful to manage Angular's $cacheFactory for $http.
   * @param {object} config
   */
  HttpInterceptor.prototype._setUrl = function(config)
    {
      var $httpParamSerializer = this.$injector.get('$httpParamSerializer');
      var params = $httpParamSerializer(config.params);
      var url = config.url + (
        params ?
          '?' + params :
          ''
      );

      this._urls[url] = true;
    };

  /**
   * @ignore
   */
  HttpInterceptor.prototype._setLastResponse = function(responseOrRejection)
    {
      this._lastResponse = responseOrRejection;
    };

  /**
   * @ignore
   */
  HttpInterceptor.prototype._setLastErrorResponse = function(rejection)
    {
      this._lastErrorResponse = rejection;
    };

  /**
   * @ignore
   */
  HttpInterceptor.prototype._setLastSuccessResponse = function(response)
    {
      this._lastSuccessResponse = response;
    };

  /**
   * @ignore
   */
  HttpInterceptor.prototype._showGlobalErrorMessage = function(rejection)
  {
    var notification = this.$injector.get('notification');
    var i18n = this.$injector.get('i18n');

    var config = rejection.config || {};
    if (config.skipGlobalErrorMessage) {
      return;
    }

    var data = rejection.data || {};
    if (!data.message) {
      return;
    }

    notification.error(i18n.get(data.message));
  };

  /**
   * @ignore
   */
  HttpInterceptor.prototype._getJWTToken = function() {
    var auth = this.$injector.get('auth');
    var jwt = this.$injector.get('jwt');

    // a) no token available in storage
    var token = jwt.getToken();
    if (!token) {
      return null;
    }

    // b) token is still valid, check for
    // refresh if it expires in 5 minutes
    if (jwt.isExpired(token, 600)) {
      var successCallback = function() {
        return jwt.getToken();
      };

      var failureCallback = function() {
        return null;
      };

      return auth.refresh().then(
        successCallback,
        failureCallback
      );
    }

    // c) use current token
    return jwt.getToken();
  };

  //
  // REGISTRY
  //
  angular.module(module).factory('httpInterceptor',['$injector',function($injector){

      var httpInterceptor = $injector.instantiate(HttpInterceptor);

      return { // important: $http service invokes this methods with global scope!
        getUrls: function(){ return httpInterceptor.getUrls(); },
        getLastResponse: function(){ return httpInterceptor.getLastResponse(); },
        getLastErrorResponse: function(){ return httpInterceptor.getLastErrorResponse(); },
        getLastSuccessResponse: function(){ return httpInterceptor.getLastSuccessResponse(); },
        request: function(config){ return httpInterceptor.request(config); },
        response: function(response){ return httpInterceptor.response(response); },
        requestError: function(rejection){ return httpInterceptor.responseError(rejection); },
        responseError: function(rejection){ return httpInterceptor.responseError(rejection); }
      };
    }]);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular, UIkit */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var Notification = function() {
  };

  Notification.$inject = [];

  //
  // METHODS
  //

  /**
   * Shows user notification in a toast message.
   *
   * @public
   * @method notify
   * @param {string} message
   * @param {string} status One of `danger`, `warning`, `success` or `primary`.
   * @param {object} options Additional options like `timeout` and `pos`.
   * @return {object} Notification object
   */
  Notification.prototype.notify = function(message, status, options) {
    status = status || 'default';
    options = options || {};

    options.message = message;
    options.status = status;

    return UIkit.notification(options);
  };

  /**
   * Shows user success notification.
   *
   * @public
   * @method success
   * @param {string} message
   * @return {void}
   */
  Notification.prototype.success = function(message, options) {
    this.notify(message, 'success', options);
  };

  /**
   * Shows user primary notification.
   *
   * @public
   * @method success
   * @param {string} message
   * @return {void}
   */
  Notification.prototype.primary = function(message, options) {
    this.notify(message, 'primary', options);
  };

  /**
   * Shows user error notification.
   *
   * @public
   * @method error
   * @param {string} message
   * @return {void}
   */
  Notification.prototype.error = function(message, options) {
    this.notify(message, 'danger', options);
  };

  /**
   * Shows user warning notification.
   *
   * @public
   * @method warning
   * @param {string} message
   * @return {void}
   */
  Notification.prototype.warning = function(message, options) {
    this.notify(message, 'warning', options);
  };

  /**
   * Closes all open notifications.
   *
   * @public
   * @method closeAll
   * @return {void}
   */
  Notification.prototype.closeAll = function() {
    UIkit.notification.closeAll();
  };

  //
  // REGISTRY
  //
  angular.module(module).service('notification', Notification);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var AppState = function($injector)
    {
      this.$injector = $injector;
    };

  AppState.$inject = ['$injector'];

  //
  // PROPERTIES
  //

  /** @var {boolean} httpBusy If $http is currently doing work. */
  AppState.prototype.httpBusy = false;

  /** @var {boolean} routerBusy If router is currently doing work. */
  AppState.prototype.routerBusy = false;

  //
  // METHODS
  //

  /**
   * Returns true if `httpBusy` or `routeBusy` is true.
   *
   * @public
   * @method isBusy
   * @return {void}
   */
  AppState.prototype.isBusy = function() {
    return this.httpBusy || this.routeBusy;
  };

  //
  // REGISTRY
  //
  angular.module(module).service('appState', AppState);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {

  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var Animation = function($injector)
    {
      this.$injector = $injector;
    };

  Animation.$inject = ['$injector'];

  /**
   * Gets correctly prefixed animation end event.
   *
   * @private
   * @property animationEndEvent
   * @return {void}
   */
  Animation.prototype.animationEndEvent = (function() {
    var dummy = document.createElement('div');
    var events = {
      'WebkitAnimation': 'webkitAnimationEnd',
      'MozTAnimation': 'animationend',
      'animation': 'animationend'
    };

    for(var key in events){
        var event = dummy.style[key];
        if( event !== undefined ){
          return events[key];
        }
    }

    return null;
  })();

  /**
   * Gets correctly prefixed transition end event.
   *
   * @private
   * @property transitionEndEvent
   * @return {void}
   */
  Animation.prototype.transitionEndEvent = (function() {
    var dummy = document.createElement('div');
    var events = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    for(var key in events){
        var event = dummy.style[key];
        if( event !== undefined ){
          return events[key];
        }
    }

    return null;
  })();

  /**
   * Prepares cross-browser compatible tranlsate hash for ng-style.
   *
   * @public
   * @method translate
   * @param {number} x
   * @param {number} y
   * @param {number} [z]
   * @return {object}
   */
  Animation.prototype.translate = function(x, y, z) {
    var string = this.$injector.get('string');

    var translate = angular.isUndefined(z) ?
      string.sprintf('translate(%spx,%spx)', x, y) :
      string.sprintf('translate3d(%spx,%spx,%spx)', x, y, z);

    return {
      'webkitTransform': translate,
      'mozTransform': translate,
      'msTransform': translate,
      'oTransform': translate,
      'transform': translate
    };
  };

  /**
   * Polyfills potentially missing `requestAnimationFrame`.
   *
   * @private
   * @method requestAnimationFrame
   * @return {void}
   */
  Animation.prototype.requestAnimationFrame = (function(){
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var i = 0; i < vendors.length && !window.requestAnimationFrame; i++) {
          window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
          window.cancelAnimationFrame = (
            window[vendors[i]+'CancelAnimationFrame'] ||
            window[vendors[i]+'CancelRequestAnimationFrame']
          );
      }

      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var timeout = function() { callback(currTime + timeToCall); };
            var id = window.setTimeout(timeout, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
      }

      return window.requestAnimationFrame.bind(window);
  }());

  /**
   * Polyfills potentially missing `cancelAnimationFrame`.
   *
   * @private
   * @method cancelAnimationFrame
   * @return {void}
   */
  Animation.prototype.cancelAnimationFrame = (function(){
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) { clearTimeout(id); };
    }

    return window.cancelAnimationFrame.bind(window);
  })();

  //
  // REGISTRY
  //
  angular.module(module).service('animation', Animation);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  var Random = function() {
    this._spareRandomCache = null;
  };

  Random.$inject = [];

  Random.prototype.between = function(min, max) {
    min = typeof min !== 'undefined' ? min : 0;
    max = typeof max !== 'undefined' ? max : 1;

    var fact = (max - min + 1);
    var rand = Math.random();

    return Math.floor(rand * fact + min);
  };

  Random.prototype.gaussian = function(mean, stdDev) {
    stdDev = typeof stdDev !== 'undefined' ? stdDev : 1;
    mean = typeof mean !== 'undefined' ? mean : 0;

    var spare = this._spareRandomCache;
    if (this._spareRandomCache !== null) {
      this._spareRandomCache = null;
      return mean + stdDev * spare;
    }

    var u, v, s;

    do {
      u = 2 * Math.random() - 1;
      v = 2 * Math.random() - 1;
      s = u*u + v*v;
    } while (s >= 1 || s===0);

    var m = Math.sqrt(-2 * Math.log(s) / s);
    this._spareRandomCache = v * m;
    return mean + stdDev * u * m;
  };

  Random.prototype.pick = function(array) {
    return array[this.between(0, array.length - 1)];
  };

  Random.prototype.push = function(array, value) {
    var rand = this.between(0, array.length - 1);
    array.push(array[rand]);
    array[rand] = value;

    return array.length;
  };

  Random.prototype.shuffle = function(array) {
    for( var i=array.length-1; i>0; i-- ) {
      var rand = this.between(0, i);
      var temp = array[i];

      array[i] = array[rand];
      array[rand] = temp;
    }

    return array;
  };

  //
  // REGISTRY
  //
  angular.module(module).service('random', Random);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {

  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var String = function()
    {
    };

  String.$inject = [];

  /**
   * Replaces placeholders (= '%s') from a string with variables.
   *
   * @public
   * @method sprintf
   * @param {string} input String to replace placeholders.
   * @param {object} variables Object holding replacements.
   * @return {string}
   */
  String.prototype.sprintf = function(input,variables)
    {
        if (!angular.isArray(variables)) {
          variables = [].slice.call(arguments, 1);
        }

        for (var i=0; i<variables.length; i++) {
          input = input.replace(/%s/,variables[i]);
        }

        return input;
    };

  /**
   * Truncates a string by given params.
   *
   * @public
   * @method truncate
   * @param {string} input String to be truncated.
   * @param {number} [maxLength=20] Maximum number of chars.
   * @return {string}
   */
  String.prototype.truncate = function(input,maxLength)
    {
        maxLength = maxLength || 20;
        if (input.length <= maxLength) {
          return input;
        }

        return input.substring(0,maxLength) + '...';
    };

  /**
   * Trims a string.
   *
   * @public
   * @method trim
   * @param {string} input String to trim.
   * @return {string}
   */
  String.prototype.trim = function(input)
    {
        return input.replace(/^\s+|\s+$/g, '');
    };

  /**
   * Transforms a string to camel case.
   *
   * @public
   * @method toCamel
   * @param {string} input String to convert.
   * @return {string}
   */
  String.prototype.toCamel = function(input)
    {
        return input.replace(/([-_][a-z])/g, function(part){
            return part.toUpperCase().replace(/[-_]/,'');
        });
    };

  /**
   * Transforms a string to spinal case.
   *
   * @public
   * @method toSpinal
   * @param {string} input String to convert.
   * @return {string}
   */
  String.prototype.toSpinal = function(input)
    {
        return input.replace(/([A-Z]|_[a-z])/g, function(part){
            return '-' + part.toLowerCase().replace(/_/,'');
        });
    };

  /**
   * Transforms a string to snake case.
   *
   * @public
   * @method toSnake
   * @param {string} input String to convert.
   * @return {string}
   */
  String.prototype.toSnake = function(input)
    {
        return input.replace(/([A-Z]|-[a-z])/g, function(part){
            return '_' + part.toLowerCase().replace(/-/,'');
        });
    };

  //
  // REGISTRY
  //
  angular.module(module).service('string', String);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  /**
   * @varructor
   */
  var Storage = function($injector) {
    this.$injector = $injector;
  };

  Storage.MODE_COOKIES = 'COOKIES';
  Storage.MODE_STORAGE = 'STORAGE';
  Storage.$inject = ['$injector'];

  /**
   * Gets the current storage interface of the service.
   * Can be one of modes `COOKIES` or `STORAGE`. If no
   * one is given will default to local storage if it's
   * supported, otherwise falls back to cookies.
   *
   * @public
   * @method getProxy
   * @param {String} mode
   * @return {Object}
   */
  Storage.prototype.getProxy = function(mode) {
    switch (mode) {
      case Storage.MODE_COOKIES:
       return this._getCookieProxy();

      case Storage.MODE_STORAGE:
       return this._getLocalStorageProxy();

     default:
      if (this.supportsLocalStorage()) {
        return this._getLocalStorageProxy();
      }

      return this._getCookieProxy();
    }
  };

  /**
   * Checks if browser supports local storage.
   *
   * @public
   * @method supportsLocalStorage
   * @return {Boolean}
   */
  Storage.prototype.supportsLocalStorage = function() {
    var $window = this.$injector.get('$window');
    var storageProxy = $window.localStorage;
    var key = '__local__storage__feature__test';
    var val = '__local__storage__feature__test';

    try {
     storageProxy.setItem(key, val);
     storageProxy.removeItem(key);
    } catch (e) {
     return false;
    }

    return true;
  };

  /**
   * Stringifies and uri encodes a value.
   *
   * @private
   * @param {Mixed} value
   * @method _encode
   *
   * @return {String}
   */
  Storage.prototype._encode = function(value) {
    try {
     value = JSON.stringify(value);
    } catch (e) {
     value = undefined;
    }

    return encodeURIComponent(value);
  };

  /**
   * Decodes a stringified and uri encoded value.
   *
   * @private
   * @param {Mixed}
   * @method _decodeValue
   *
   * @return {Mixed}
   */
  Storage.prototype._decode = function(value) {
    var decoded;
    switch (typeof value) {
     case 'string':
       decoded = decodeURIComponent(value);
       try {
         decoded = JSON.parse(decoded);
       } catch (e) {
         /* noop */
       }
       break;
     default:
       decoded = undefined;
    }

    if (decoded === 'undefined') {
     decoded = undefined;
    }

    if (decoded === undefined) {
     decoded = null;
    }

    return decoded;
  };

  /**
   * Provides cookie storage proxy layer.
   *
   * @private
   * @method _getCookieProxy
   *
   * @return {Object}
   */
  Storage.prototype._getCookieProxy = function() {
    var documentProxy = this.$injector.get('$document');

    var me = this;
    var _getAll = function(parse) {
     var items = {};

     var cookies = documentProxy.cookie.split('; ');
     if (cookies.length === 1 && cookies[0] === '') {
       return items;
     }

     for (var i = 0; i < cookies.length; i++) {
       var cookie = cookies[i].split('=');
       if (!parse) {
         items[cookie[0]] = cookie[1];
         continue;
       }

       items[cookie[0]] = me._decode(cookie[1]);
     }

     return items;
    };

    var setCookie = function(key, value, expires, domain, path, secure) {
     value = me._encode(value);

     try {
       var date = new Date(expires);
       if (isNaN(date)) {
         var input = expires;
         expires = undefined;
         throw new Error('storage.js: "' + input + '" cannot be converted to date string!');
       }

       expires = date.toUTCString();
     } catch (e) {
       /* noop */
     }

     expires = expires ? expires : false;

     var cookie = key + '=' + value;
     cookie += expires ? ';expires='+expires : '';
     cookie += domain ? ';domain='+domain : '';
     cookie += path ? ';path='+path : '';
     cookie += secure ? ';secure' : '';

     documentProxy.cookie = cookie;
    };

    var getCookie = function(key) {
     var cookies = _getAll(false);
     if (cookies.hasOwnProperty(key)) {
       return me._decode(cookies[key]);
     }

     return null;
    };

    var getAllCookies = function() {
     return _getAll(true);
    };

    var removeCookie = function(key) {
     setCookie(key, '', -1);
    };

    var removeAllCookies = function() {
     for (var key in getAllCookies()) {
       removeCookie(key);
     }
    };

    return {
     getItem: getCookie,
     getAllItems: getAllCookies,
     setItem: setCookie,
     removeItem: removeCookie,
     removeAllItems: removeAllCookies
    };
  };

  /**
   * Provides local storage proxy layer.
   *
   * @private
   * @method _getLocalStorageProxy
   *
   * @return {Object}
   */
  Storage.prototype._getLocalStorageProxy = function() {
    var $window = this.$injector.get('$window');
    var storageProxy = $window.localStorage;

    var me = this;
    var setItem = function(key, value) {
     value = me._encode(value);
     storageProxy.setItem(key, value);
    };

    var getItem = function(key) {
     var value = storageProxy.getItem(key);
     return me._decode(value);
    };

    var getAllItems = function() {
     var items = {};

     for (var i = 0; i < storageProxy.length; i++) {
       var key = storageProxy.key(i);
       items[key] = getItem(key);
     }

     return items;
    };

    var removeItem = function(key) {
     storageProxy.removeItem(key);
    };

    var removeAllItems = function() {
     storageProxy.clear();
    };

    return {
     getItem: getItem,
     getAllItems: getAllItems,
     setItem: setItem,
     removeItem: removeItem,
     removeAllItems: removeAllItems
    };
  };

  //
  // REGISTRY
  //
  angular.module(module).service('storage', Storage);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var Auth = function($injector)
    {
      this.$injector = $injector;
    };

  /**
   * @property {Array.<string>} $inject
   */
  Auth.$inject = ['$injector'];

  //
  // METHODS
  //

  /**
   * Sends a POST request to register route and
   * persists retrieved JWT token on success.
   *
   * @public
   * @method signin
   * @param {Object} data Data to submit.
   * @param {string} [firewall='frontend'] firewall
   * @param {Object} [config={}] $http config.
   * @return {Promise}
   */
  Auth.prototype.signup = function(data, firewall, config)
    {
      var $http = this.$injector.get('$http');

      firewall = firewall || 'frontend';
      config = config || {};

      var me = this;
      var successCallback = function(response)
        {
          me._saveToken(response.data);
        };

      var failureCallback = function()
        {
          // noop
        };

      var url = this._getSignupUrl(firewall);

      var promise = $http.post(
        url,
        {
          _username: data.username,
          _password: data.password
        },
        angular.extend(config || {})
      );

      promise.then(
        successCallback,
        failureCallback
      );

      return promise;
    };

  /**
   * Sends a POST request to login route and
   * persists retrieved JWT token on success.
   *
   * @public
   * @method signin
   * @param {Object} data Data to submit.
   * @param {string} [firewall='frontend'] firewall
   * @param {Object} [config={}] $http config.
   * @return {Promise}
   */
  Auth.prototype.signin = function(data, firewall, config)
    {
      var $http = this.$injector.get('$http');

      firewall = firewall || 'frontend';
      config = config || {};

      var me = this;
      var successCallback = function(response)
        {
          me._saveToken(response.data);
        };

      var failureCallback = function()
        {
          // noop
        };

      var url = this._getSigninUrl(firewall);

      var promise = $http.post(
        url,
        {
          _username: data.username,
          _password: data.password
        },
        angular.extend(config || {}, {
          skipAuthorization: true
        })
      );

      promise.then(
        successCallback,
        failureCallback
      );

      return promise;
    };

  /**
   * Destroys JWT token representing user.
   *
   * @public
   * @method logout
   * @param {Object} [config] $http config.
   * @return {Void}
   */
  Auth.prototype.signout = function(config)
    {
      var $http = this.$injector.get('$http');
      var user = this.$injector.get('user');
      var jwt = this.$injector.get('jwt');

      var successCallback = function()
        {
          jwt.removeRefreshToken();
          jwt.removeToken();
          user.unload();
        };

      var failureCallback = function()
        {
          // noop
        };

      return $http.get(
        this._getSignoutUrl(),
        config || {}
      ).then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Sends a POST request to refresh route
   * with saved refresh token from login().
   *
   * @public
   * @method refresh
   * @param {Object} [config] $http config.
   * @return {Promise}
   */
  Auth.prototype.refresh = function(config)
    {
      var $http = this.$injector.get('$http');
      var jwt = this.$injector.get('jwt');

      var me = this;
      var successCallback = function(response)
        {
          me._saveToken(response.data);
          return response;
        };

      var failureCallback = function(rejection)
        {
          return rejection;
        };

      var promise = $http.post(
        this._getRefereshUrl(),
        {
          /* jshint camelcase: false */
          refresh_token: jwt.getRefreshToken()
          /* jshint camelcase: true */
        },
        angular.extend(config || {}, {
          skipAuthorization: true
        })
      );

      return promise.then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Returns decoded JWT token containing
   * user information such as `username`.
   * Note: By default expired tokens are
   * not accepted, set parameter if you
   * want to accept expired tokens too!
   *
   * @public
   * @method getUser
   * @param {boolean} [acceptExpired=false]
   * @return {Object|null}
   */
  Auth.prototype.getUser = function(acceptExpired)
    {
      acceptExpired = acceptExpired || false;

      var jwt = this.$injector.get('jwt');

      var token = jwt.getToken();
      if (!token) {
        return null;
      }

      if (!acceptExpired) {
        if (jwt.isExpired()) {
          return null;
        }
      }

      return jwt.decode(token);
    };

  /**
   * Checks if user has given role provided
   * in `roles` property encoded into JWT.
   *
   * @public
   * @method hasRole
   * @param {string|array} role
   * @return {Promise}
   */
  Auth.prototype.hasRole = function(role)
    {
      var jwt = this.$injector.get('jwt');
      var $q = this.$injector.get('$q');
      var defer = $q.defer();
      var promise = defer.promise;

      var isArray = angular.isArray(role);
      if (isArray && role.length === 0) {
        defer.reject(null);
        return promise;
      }

      if (!role) {
        defer.reject(null);
        return promise;
      }

      // accept expired tokens - we will
      // use refresh() to get new token
      // if current one is invalid now
      var user = this.getUser(true);
      if (user === null) {
        defer.reject(null);
        return promise;
      }

      // primitive method for role check
      var resolveRole = function(user) {
        var roles = user.roles || [];
        if (angular.isString(role)) {
          role = [role];
        }

        var hasRole = false;
        for (var i=0; i<role.length; i++) {
          if (roles.indexOf(role[i]) >= 0) {
            hasRole = true;
            break;
          }
        }

        if (hasRole) {
          defer.resolve();
          return;
        }

        defer.reject();
      };

      // immediately resolve valid tokens
      if (!jwt.isExpired()) {
        resolveRole(user);
        return promise;
      }

      // try to refresh invalid tokens
      var me = this;
      var successCallback = function()
        {
          user = me.getUser();
          resolveRole(user);
        };

      var failureCallback = function()
        {
          defer.reject();
        };

      this.refresh().then(
        successCallback,
        failureCallback
      );

      return promise;
    };

  /**
   * Saves server response containing
   * the `token` and `refresh_token`.
   *
   * @private
   * @method _saveToken
   * @param {object} response
   * @return {void}
   */
  Auth.prototype._saveToken = function(data)
    {
      /* jshint camelcase: false */
      var jwt = this.$injector.get('jwt');

      jwt.setRefreshToken(data.refresh_token);
      jwt.setToken(data.token);
      /* jshint camelcase: true */
    };

  /**
   * Returns endpoint to gather JWT depending on firewall.
   *
   * @private
   * @method _getSigninUrl
   * @param {string} firewall
   * @return {string}
   */
  Auth.prototype._getSigninUrl = function(firewall){
    var API_URL = this.$injector.get('API_URL');

    switch(firewall) {
      case 'backend':
      case 'frontend':
        return API_URL + '/auth/' + firewall + '/signin';
      default:
        throw new Error('Unknown firewall name: ' + firewall);
    }
  };

  /**
   * Returns endpoint to register at given firewall.
   *
   * @private
   * @method _getSignupUrl
   * @param {string} firewall
   * @return {string}
   */
  Auth.prototype._getSignupUrl = function(firewall){
    var API_URL = this.$injector.get('API_URL');

    switch(firewall) {
      case 'frontend':
        return API_URL + '/auth/' + firewall + '/signup';
      case 'backend':
        throw new Error('Not implemented yet!');
      default:
        throw new Error('Unknown firewall name: ' + firewall);
    }
  };

  /**
   * Returns endpoint to refresh the JWT.
   *
   * @private
   * @method _getRefereshUrl
   * @return {string}
   */
  Auth.prototype._getRefereshUrl = function(){
    var API_URL = this.$injector.get('API_URL');

    return API_URL + '/auth/refresh';
  };

  /**
   * Returns endpoint to revoke the JWT.
   *
   * @private
   * @method _getSignoutUrl
   * @param {string} firewall
   * @return {string}
   */
  Auth.prototype._getSignoutUrl = function(){
    var API_URL = this.$injector.get('API_URL');

    return API_URL + '/signout';
  };

  //
  // REGISTRY
  //
  angular.module(module).service('auth', Auth);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {

  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var I18N = function($injector)
    {
      this.translations = {};
      this.$injector = $injector;

      this.setLocale(this._detectLocale());
    };

  I18N.$inject = ['$injector'];

  //
  // PROPERTIES
  //

  /** @var {object} locales Currently supported locales. */
  I18N.prototype.locales = {
    'de': true
  };

  /** @var {string} defaultLocale Default locale to use. */
  I18N.prototype.defaultLocale = 'de';

  /**
   * Loads translations according to current locale if not available.
   *
   * @public
   * @method load
   * @param {locale} [locale] Two letter language code.
   * @param {Object} [config] Additional config for $http
   * @return {Promise|void}
   */
  I18N.prototype.load = function(locale, config)
    {
      locale = locale || this.getLocale();
      config = config || {};

      if (this.translations[locale]) {
        return;
      }

      var $http = this.$injector.get('$http');
      var $log = this.$injector.get('$log');

      var me = this;
      var url = this._getJSONUrl(locale);
      var successCallback = function(response)
        {
          me.translations[locale] = response.data;
        };

      var failureCallback = function()
        {
          $log.error('Could not load translations!');
        };

      return $http.get(url, config).then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Sets locale to given paraemter if it's a valid one.
   * Falls back to `defaultLocale` if it's an invalid one.
   *
   * @public
   * @method setLocale
   * @param {string} locale
   * @return {void}
   */
  I18N.prototype.setLocale = function(locale)
    {
      if (this.locales[locale]) {
        this.locale = locale;
        return;
      }

      this.locale = this.defaultLocale;
    };

  /**
   * Delivers the currently used locale for translations.
   *
   * @public
   * @method setLocale
   * @param {string} locale
   * @return {void}
   */
  I18N.prototype.getLocale = function()
    {
      return this.locale;
    };

  /**
   * Makes a lookup within current translation dictionary.
   *
   * @param {string} key The i18n key.
   * @param {string} ... Parameters to be replaced.
   * @return {string}
   */
  I18N.prototype.get = function(key)
    {
      var string = this.$injector.get('string');
      var params = [].slice.call(arguments,1);
      var locale = this.getLocale();

      var text;
      try {
        text = this.translations[locale][key];
      } catch(e) {}

      return string.sprintf(text || key, params);
    };

  /**
   * Returns endpoint to gather JSON translations.
   *
   * @private
   * @method _getTranslationsUrl
   * @param {string} locale
   * @return {string}
   */
  I18N.prototype._getJSONUrl = function(locale)
    {
      return 'assets/json/' + locale + '.json';
    };

  /**
   * @ignore
   */
  I18N.prototype._detectLocale = function()
    {
      var navigator = this.$injector.get('$window').navigator;
      var android = /android.*\W(\w\w)-(\w\w)\W/i;
      var language;

      // try to find locale on android devices!
      if( navigator && navigator.userAgent &&
          (language = navigator.userAgent.match(android)) ) {
          language = language[1];
      }

      // for all other browsers
      if (!language && navigator) {
        if( navigator.language ) {
          language = navigator.language;
        } else if( navigator.userLanguage ) {
          language = navigator.userLanguage;
        } else if( navigator.systemLanguage ) {
          language = navigator.systemLanguage;
        } else if( navigator.browserLanguage ) {
          language = navigator.browserLanguage;
        }
      }

      // now we can get iso code
      if (language) {
        return language.substr(0,2);
      }

      // use `defaultLocale` as fallback
      return this.defaultLocale;
    };

  //
  // REGISTRY
  //
  angular.module(module).service('i18n', I18N);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  /**
  * @constructor
  */
  var JWT = function($injector, storage) {
    this.$injector = $injector;
    this.storage = storage.getProxy();
  };

  JWT.$inject = ['$injector', 'storage'];

  //
  // PROPERTIES
  //

  /** @var {string} tokenKey Token key for local storage. */
  JWT.prototype.tokenKey = 'NAksNyshI3';

  /** @var {string} refreshKey Refresh key for local storage. */
  JWT.prototype.refreshKey = 'i08BFNG9t5';

  //
  // METHODS
  //

  /**
   * Gets JWT token from local storage.
   *
   * @public
   * @method getToken
   * @return {string|null}
   */
  JWT.prototype.getToken = function()
    {
      return this.storage.getItem(this.tokenKey);
    };

  /**
   * Sets JWT token in local storage.
   *
   * @public
   * @method setToken
   * @param {string} token
   * @return {void}
   */
  JWT.prototype.setToken = function(token)
    {
      this.storage.setItem(this.tokenKey,token);
    };

  /**
   * Removes JWT token from local storage.
   *
   * @public
   * @method removeToken
   * @return {void}
   */
  JWT.prototype.removeToken = function()
    {
      this.storage.removeItem(this.tokenKey);
    };

  /**
   * Gets JWT refresh token from local storage.
   *
   * @public
   * @method getRefreshToken
   * @return {string|null}
   */
  JWT.prototype.getRefreshToken = function()
    {
      return this.storage.getItem(this.refreshKey);
    };

  /**
   * Sets JWT refresh token in local storage.
   *
   * @public
   * @method setRefreshToken
   * @param {string} refreshToken
   * @return {void}
   */
  JWT.prototype.setRefreshToken = function(refreshToken)
    {
      this.storage.setItem(this.refreshKey, refreshToken);
    };

  /**
   * Removes JWT refresh token from local storage.
   *
   * @public
   * @method removeToken
   * @return {void}
   */
  JWT.prototype.removeRefreshToken = function()
    {
      this.storage.removeItem(this.refreshKey);
    };

  /**
   * Converts timestamp into date object.
   *
   * @public
   * @method getExpirationDate
   * @param {string} token
   * @return {date}
   */
  JWT.prototype.getExpirationDate = function(token)
    {
      var $log = this.$injector.get('$log');

      token = token || this.getToken();
      if (!token) {
        $log.error('No token given or available!');
        return null;
      }

      var decoded = this.decode(token);
      if (typeof decoded.exp==='undefined') {
        $log.error('No `exp` property available!');
        return null;
      }

      var date = new Date(0);
      date.setUTCSeconds(decoded.exp);

      return date;
    };

  /**
   * Determines if given token is expired.
   *
   * @public
   * @method isExpired
   * @param {string} token
   * @param {number} offset In seconds.
   * @return {boolean}
   */
  JWT.prototype.isExpired = function(token, offset)
    {
      offset = offset || 0;
      token = token || this.getToken();

      var date = this.getExpirationDate(token);
      if (date === null) {
        return true;
      }

      var now = new Date().valueOf();
      offset = now + offset * 1000;
      date = date.valueOf();

      return date <= offset;
    };

  /**
   * Tries to decode a JWT token.
   *
   * @public
   * @method decode
   * @param {string} token
   * @return {object|null}
   */
  JWT.prototype.decode = function(token)
    {
      var $log = this.$injector.get('$log');

      try {
        var parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('JWT must have 3 parts!');
        }

        var decoded = this._base64Decode(parts[1]);
        if (!decoded) {
          throw new Error('Cannot decode the token!');
        }

        return angular.fromJson(decoded);
      } catch(e) {
        $log.error(e);
        return null;
      }
    };

  /**
   * Validates and decodes a base64 url.
   *
   * @private
   * @method _base64Decode
   * @param {string} input
   * @return {string}
   */
  JWT.prototype._base64Decode = function(input)
    {
      var $window = this.$injector.get('$window');
      var $log = this.$injector.get('$log');

      var output = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      try{
        switch (output.length % 4) {
          case 0: {
            break;
          }

          case 2: {
            output += '=='; break;
          }

          case 3: {
            output += '='; break;
          }

          default: {
            throw new Error('Illegal base64url code!');
          }
        }
      } catch(e) {
        $log.error(e);
        return '';
      }

      var decoded = $window.atob(output);
      var escaped = $window.escape(decoded);

      return $window.decodeURIComponent(escaped);
    };

  //
  // REGISTRY
  //
  angular.module(module).service('jwt', JWT);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var User = function($injector) {
    this.$injector = $injector;

    this._states = [
      $injector.get('STATE_BEGINNER'),
      $injector.get('STATE_AMATEUR'),
      $injector.get('STATE_ADVANCED'),
      $injector.get('STATE_EXPERT')
    ];

    this._eventSource = null;
    this._results = [];
    this._payload = {};
    this._pending = {};
    this._tasks = {};
  };

  User.$inject = ['$injector'];

  //
  // PROPERTIES
  //

  /** @var {number} state Current state of user. */
  User.prototype.state = null;

  /** @var {number} group Random group of user. */
  User.prototype.group = null;

  /** @var {number} tickets Current ticket count. */
  User.prototype.tickets = null;

  //
  // METHODS
  //

  /**
   * Fetches current user through `User` resource.
   *
   * @public
   * @method load
   * @return {void}
   */
  User.prototype.load = function() {
    var User = this.$injector.get('User');

    var me = this;
    var successCallback = function(user) {

      // save only json payload from
      // ng-resource's `user` object
      me._payload = user.toJSON();

      // initialize members
      me._initTickets();
      me._initState();
      me._initGroup();

      // gameplay setup calls
      // only for `ROLE_USER`!
      if (!me.isUser()) {
        return;
      }

      // init tasks at first!
      me._initWatches();
      me._initTasks();

      // then results & SSE!
      me._initPending();
      me._initResults();
      me._initSSE();
    };

    var failureCallback = function() {
      // noop
    };

    var current = User.current();

    current.$promise.then(
      successCallback,
      failureCallback
    );

    return current;
  };

  /**
   * Resets current user session from application.
   *
   * @public
   * @method reset
   * @return {void}
   */
  User.prototype.unload = function() {
    var sse = this.$injector.get('sse');

    if (this._eventSource) {
      sse.removeSource(this._eventSource);
    }

    if (this._unwatchTickets) {
      this._unwatchTickets();
    }

    if (this._unwatchState) {
      this._unwatchState();
    }

    this._eventSource = null;
    this._results = [];
    this._payload = {};
    this._pending = {};
    this._tasks = {};

    this.tickets = null;
    this.state = null;
    this.group = null;
  };

  /**
   * Updates user from external scopes.
   * This is helpful for refreshing its
   * state without invoking a request to
   * the server when user was embedded in
   * another request's response.
   *
   * @public
   * @method update
   * @param {object} result
   * @return {void}
   *
   */
  User.prototype.update = function(result) {
    this._payload = result.user;

    this._addResult(result);
    this._initTickets();
    this._initState();
    this._initGroup();
  };

  /**
   * Checks if current user has role `ROLE_USER`.
   *
   * @public
   * @method isUser
   * @return {boolean}
   */
  User.prototype.isUser = function() {
    return this.hasRole('ROLE_USER');
  };

  /**
   * Checks if current user has role `ROLE_ADMIN`.
   *
   * @public
   * @method isAdmin
   * @return {boolean}
   */
  User.prototype.isAdmin = function() {
    return this.hasRole('ROLE_ADMIN');
  };

  /**
   * Checks if current user has role `ROLE_SUPER_ADMIN`.
   *
   * @public
   * @method isSuperAdmin
   * @return {boolean}
   */
  User.prototype.isSuperAdmin = function() {
    return this.hasRole('ROLE_SUPER_ADMIN');
  };

  /**
   * Checks if current user's workshop is active.
   *
   * @public
   * @method isInWorkshop
   * @return {boolean}
   */
  User.prototype.isInWorkshop = function() {
    if (!this.isUser()) {
      return true;
    }

    return this._payload.workshop.isActive;
  };

  /**
   * Checks if current user has given role.
   *
   * @public
   * @method hasRole
   * @param {string|array} role
   * @return {boolean}
   */
  User.prototype.hasRole = function(role) {
    if (!angular.isArray(role)) {
      role = [role];
    }

    var roles = this._payload.roles || [];
    for (var i=0; i<role.length; i++) {
      if (roles.indexOf(role[i])>=0) {
        return true;
      }
    }

    return false;
  };

  /**
   * Provides user's task hash map.
   *
   * @public
   * @method getTasks
   * @return {object}
   */
  User.prototype.getTasks = function() {
    return this._tasks;
  };

  /**
   * Gets `task` resource of user by type.
   *
   * @public
   * @method getTaskByType
   * @param {string} type
   * @return {object|null}
   */
  User.prototype.getTaskByType = function(type) {
    return this._tasks[type] || null;
  };

  /**
   * Gets pending `result` resource of user by type.
   *
   * @public
   * @method getResultByType
   * @param {string} type
   * @return {object|null}
   */
  User.prototype.getPendingByType = function(type) {
    return this._pending[type] || null;
  };

  /**
   * Gets `state` mapped to string representation.
   *
   * @public
   * @method getGroupAsString
   * @return {string}
   */
  User.prototype.getGroupAsString = function() {
    switch(this.group) {
      case this.$injector.get('GROUP_A'):
        return 'GROUP_A';
      case this.$injector.get('GROUP_B'):
        return 'GROUP_B';
      default:
        return null;
    }
  };

  /**
   * Gets `state` mapped to string representation.
   *
   * @public
   * @method getStateAsString
   * @return {string}
   */
  User.prototype.getStateAsString = function() {
    switch(this.state) {
      case this.$injector.get('STATE_AMATEUR'):
        return 'STATE_AMATEUR';
      case this.$injector.get('STATE_ADVANCED'):
        return 'STATE_ADVANCED';
      case this.$injector.get('STATE_EXPERT'):
        return 'STATE_EXPERT';
      default:
        return 'STATE_BEGINNER';
    }
  };

  /**
   * Initializes `state` member.
   *
   * @private
   * @method _initState
   * @return {void}
   */
  User.prototype._initState = function() {
    var STATE_BEGINNER = this.$injector.get('STATE_BEGINNER');
    this.state = this._payload.state || STATE_BEGINNER;
  };

  /**
   * Initializes `group` member.
   *
   * @private
   * @method _initGroup
   * @return {void}
   */
  User.prototype._initGroup = function() {
    this.group = this._payload.group || null;
  };

  /**
   * Initializes `tickets` member.
   *
   * @private
   * @method init
   * @return {void}
   */
  User.prototype._initTickets = function() {
    var tickets = this._payload.tickets;
    this.tickets = tickets || [];
  };

  /**
   * Watches `state` and `tickets` for changes to
   * show the corresponding user notifications.
   *
   * @private
   * @method _initWatches
   * @return {void}
   */
  User.prototype._initWatches = function() {
    var notification = this.$injector.get('notification');
    var $rootScope = this.$injector.get('$rootScope');
    var i18n = this.$injector.get('i18n');
    var me = this;

    var _watchStateExpression = function() {
      return me.state;
    };

    var _watchStateCallback = function(newState, oldState) {
      if (newState === oldState) {
        return;
      }

      notification.success(
        i18n.get(
          'Congratulations, you have reached the state %s!',
          i18n.get(me.getStateAsString())
        )
      );
    };

    var _watchTicketsExpression = function() {
      return me.tickets;
    };

    var _watchTicketsCallback = function(newTickets, oldTickets) {
      if (newTickets === oldTickets) {
        return;
      }

      var oldCount = oldTickets && oldTickets.length;
      var newCount = newTickets && newTickets.length;

      var tickets = newCount - oldCount;
      if (tickets < 0) {
        return;
      }

      var message = tickets === 1 ?
        i18n.get('Congratulations, you have earned 1 new ticket!') :
        i18n.get('Congratulations, you have earned %s new tickets!', tickets);

      notification.primary(message);
    };

    this._unwatchTickets = $rootScope.$watchCollection(
      _watchTicketsExpression,
      _watchTicketsCallback
    );

    this._unwatchState = $rootScope.$watch(
      _watchStateExpression,
      _watchStateCallback
    );
  };


  /**
   * Destroys user session and redirects to login.
   *
   * @private
   * @method _initSSE
   * @return {Void}
   */
  User.prototype._initSSE = function()
    {
      var $rootScope = this.$injector.get('$rootScope');
      var API_URL = this.$injector.get('API_URL');
      var sse = this.$injector.get('sse');

      // don't setup SSE when playing remote
      var workshop = this._payload.workshop;
      if (!workshop.isActive) {
        return;
      }

      var me = this;

      var _onMessage = function(data) {
        $rootScope.$evalAsync(function(){
          angular.forEach(data, function(item) {
            var unix = Date.parse(item.updatedAt);
            var task = me._tasks[item.type];
            task.isActive = !!item.isActive;

            if (!isNaN(unix)) {
              item.updatedAt = unix;
            }
          });
        });
      };

      var url = API_URL + '/sse/workshop/' + workshop.id + '/tasks';
      var options = { onMessage: _onMessage, sleep: 1 };
      this._eventSource = sse.addSource(url, options);
    };

  /**
   * Caches task hash map from workshop
   * for lookups from `getTaskByType()`.
   *
   * @private
   * @method _initTasks
   * @return {void}
   */
  User.prototype._initTasks = function() {
    var workshop = this._payload.workshop;
    if (!workshop) {
      return;
    }

    var me = this;
    angular.forEach(workshop.tasks,function(task) {
      me._tasks[task.type] = task;
    });
  };

  /**
   * Caches pending hash map from workshop
   * for lookups from `getPendingByType()`.
   *
   * @private
   * @method _initPending
   * @return {void}
   */
  User.prototype._initPending = function() {
    var pending = this._payload.pending;
    if (!pending) {
      return;
    }

    var me = this;
    angular.forEach(pending,function(result) {
      me._pending[result.task.type] = result;
    });
  };

  /**
   * Caches results hash map from workshop
   * for lookups from `getResultsByType()`.
   *
   * @private
   * @method _initResults
   * @return {void}
   */
  User.prototype._initResults = function() {
    var _addResult = this._addResult.bind(this);
    var results = this._payload.results || [];

    angular.forEach(results, _addResult);
  };

  /**
   * Adds result to collection and sets `$$result`
   *
   * @private
   * @method _addResult
   * @param {object} result
   * @return {void}
   */
  User.prototype._addResult = function(result) {
    var task = this.getTaskByType(result.task.type);
    if (task !== null) {
      var current = task.$$results || 0;
      task.$$results = current + 1;
    }

    this._results.push(result);
  };

  //
  // REGISTRY
  //
  angular.module(module).service('user', User);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var Mail = function($injector)
    {
      this.$injector = $injector;
    };

  Mail.$inject = ['$injector'];

  //
  // METHODS
  //

  /**
   * Sends a POST request to send mail.
   *
   * @public
   * @method send
   * @param {Object} data
   * @param {Object} [config] $http config.
   * @return {Promise}
   */
  Mail.prototype.send = function(data, config) {
    var notification = this.$injector.get('notification');
    var $http = this.$injector.get('$http');
    var i18n = this.$injector.get('i18n');

    var successCallback = function(/*response*/)
      {
        notification.success(
          i18n.get(
            'Your email has been sent!'
          )
        );
      };

    var failureCallback = function(/*rejection*/)
      {
      };

    var promise = $http.post(
      this._getPostUrl(),
      {
        _name: data.name,
        _mail: data.email,
        _subject: data.subject,
        _message: data.message
      },
      config || {}
    );

    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Returns endpoint to send the email.
   *
   * @private
   * @method _getPostUrl
   * @return {string}
   */
  Mail.prototype._getPostUrl = function(){
    var API_URL = this.$injector.get('API_URL');

    return API_URL + '/mail';
  };

  //
  // REGISTRY
  //
  angular.module(module).service('mail', Mail);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular, EventSource */
(function(module, angular) {
  'use strict';

  //
  // SERVICE
  //

  /**
   * @constructor
   */
  var SSE = function($injector)
    {
      this.$injector = $injector;
      this._sources = {};
    };

  SSE.$inject = ['$injector'];

  //
  // METHODS
  //

  /**
   * Adds a new event source to listen to.
   *
   * @public
   * @method add
   * @param string url
   * @param string event
   * @param function callback
   * @return {void}
   */
  SSE.prototype.addSource = function(url, config) {
    config = config || {};

    config.retry = config.retry || null;
    config.event = config.event || null;
    config.sleep = config.sleep || null;
    config.onError = config.onError || function(){};
    config.onMessage = config.onMessage || function(){};

    url = this._buildUrl(url, config);
    var source = new EventSource(url);

    source.onmessage = function(event) {
      var data = angular.fromJson(event.data);
      config.onMessage.call(this, data, event);
    };

    source.onerror = function(event) {
      config.onError.call(this, event);
      console.log('>>> SSE ERROR');
    };

    this._sources[url] = source;
    return source;
  };

  /**
   * Adds a new event source to listen to.
   *
   * @public
   * @method removeSource
   * @param object source
   * @return {void}
   */
  SSE.prototype.removeSource = function(source) {
    delete this._sources[source.url];
    source.close();
  };

  /**
   * Appends JWT token as query string to url.
   * Adds optional config options if available.
   *
   * @private
   * @method _getUrl
   * @param string url
   * @param object config
   * @return {string}
   */
  SSE.prototype._buildUrl = function(url, config){
    var jwt = this.$injector.get('jwt');
    var token = jwt.getToken();

    url = url + '?bearer=' + token;

    if (config.event) {
      url += '&event=' + config.event;
    }

    if (config.sleep) {
      url += '&sleep=' + config.sleep;
    }

    if (config.retry) {
      url += '&retry=' + config.retry;
    }

    return url;
  };

  //
  // REGISTRY
  //
  angular.module(module).service('sse', SSE);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Card
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var CardContainer = function() {
  };

  CardContainer.$inject = ['$scope', '$element', '$attrs'];

  //
  // PROPERTIES
  //

  /** @var {array} cards Stack of registered cards. */
  CardContainer.prototype.cards = [];

  /** @var {boolean} canToggle If cards can be toggled. */
  CardContainer.prototype.canToggle = false;

  //
  // METHODS
  //

  /**
   * Adds a `card` directive to stack.
   *
   * @public
   * @method click
   * @return {Void}
   */
  CardContainer.prototype.add = function(card) {
    this.cards.push(card);
  };

  /**
   * Toggles card state if `canToggle` is true.
   *
   * @public
   * @method set
   * @return {boolean}
   */
  CardContainer.prototype.set = function(card) {
    if (card.selected && !this.canToggle) {
      return false;
    }

    // toggle current card's state
    var selected = !!card.selected;
    card.selected = selected ? null : true;

    // reset all other card states
    angular.forEach(this.cards, function(current) {
      if (current.id === card.id) {
        return;
      }

      current.selected = card.selected ? false : null;
    });

    return true;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('cardContainer', function(){
    return {
      scope: {
        canToggle: '=?cardContainerCanToggle'
      },
      restrict: 'A',
      controller: CardContainer,
      bindToController: true,
      controllerAs: 'cardContainerController'
    };
  });

  // --------------------------------------------------
  // Card
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Card = function($scope, $element, $attrs, $transclude) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;

    this.id = this.$scope.$id;
    this.hasIcon = $transclude.isSlotFilled('icon');
  };

  Card.$inject = ['$scope', '$element', '$attrs', '$transclude'];

  //
  // PROPERTIES
  //

  /** @var {number} id Unique id of card. */
  Card.prototype.id = null;

  /** @var {mixed} data Passthrough data of card. */
  Card.prototype.data = null;

  /** @var {boolean} selected If card is selected. */
  Card.prototype.selected = null;

  /** @var {boolean} disabled If card is disabled. */
  Card.prototype.disabled = null;

  /** @var {boolean} hasIcon If card has `icon` slot filled. */
  Card.prototype.hasIcon = null;

  /** @var {boolean} isCheckbox If card should behave as checkbox. */
  Card.prototype.isCheckbox = false;

  //
  // METHODS
  //

  /**
   * Invokes the `cardOnClick` callback.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  Card.prototype.$onInit = function() {
    if (!this.cardContainer) {
      return;
    }

    this.cardContainer.add(this);
  };

  /**
   * Invokes the `cardOnClick` callback.
   *
   * @public
   * @method click
   * @return {Void}
   */
  Card.prototype.click = function($event) {
    if (this.disabled) {
      return;
    }

    $event.stopPropagation();
    $event.preventDefault();

    if (this.cardContainer) {
      var changed = this.cardContainer.set(this);
      if (!changed) {
        return;
      }
    }

    this.onClick({
      data: this.data,
      selected: this.selected,
      disabled: this.disabled
    });
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('card', function(){
    return {
      scope: {
        data: '=?cardData',
        onClick: '&cardOnClick',
        selected: '=?cardSelected',
        disabled: '=?cardDisabled',
        isCheckbox: '=?cardIsCheckbox'
      },
      restrict: 'A',
      transclude: {
        text: 'cardText',
        title: 'cardTitle',
        icon: '?cardIcon',
        buttons: '?cardButtons'
      },
      controller: Card,
      bindToController: true,
      controllerAs: 'cardController',
      require:{
        cardContainer: '^?cardContainer',
      },
      templateUrl: 'views/directives/card.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular, Chartist */
(function(module, angular) {
  'use strict';

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Chart = function($scope, $attrs, $element, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this._chart = null;
  };

  Chart.$inject = ['$scope', '$attrs', '$element', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {array} data Chart data for series. */
  Chart.prototype.data = [];

  //
  // METHODS
  //

  /**
   * Inits chart with options and data
   * and renders it with these settings.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  Chart.prototype.$onInit = function()
    {
      var options = this._getOptions();

      var data = {
        labels: this._getLabels(),
        series: this._getData()
      };

      this._render(data, options);
    };

  /**
   * Cleans up everything on destruction.
   *
   * @public
   * @method $onDestroy
   * @return {Void}
   */
  Chart.prototype.$onDestroy = function()
    {
      if (this._chart !== null) {
        this._chart.detach();
        this._chart = null;
      }
    };

  /**
   * Gets data depending on current `task`.
   *
   * @public
   * @method _getData
   * @param {array} data
   * @return int
   */
  Chart.prototype._getData = function() {
    var GROUP_A = this.$injector.get('GROUP_A');
    var GROUP_B = this.$injector.get('GROUP_B');

    var me = this;

    var map = {};
    var data = [];
    var mapResults;

    switch(me.task.type) {
      //case me.$injector.get('TYPE_INTEREST'):
      //case me.$injector.get('TYPE_INFLATION'):
      //case me.$injector.get('TYPE_DIVERSIFICATION'):
      //case me.$injector.get('TYPE_RISK'):
      case me.$injector.get('TYPE_ANCHORING'):
      case me.$injector.get('TYPE_MENTAL_BOOKKEEPING'): {
        map[GROUP_A] = { choice1: 0, choice2: 0, count:0 };
        map[GROUP_B] = { choice1: 0, choice2: 0, count:0 };

        mapResults = function(result) {
          var group = result.json.group;

          switch (result.json.choice) {
            case 1:
              map[group].choice1++;
              break;
            case 2:
              map[group].choice2++;
              break;
            default:
          }

          map[group].count++;
        };

        angular.forEach(this.results, mapResults);

        var groupA = map[GROUP_A];
        var groupB = map[GROUP_B];

        // series 1
        data.push([
          groupA.choice1 / groupA.count,
          groupB.choice1 / groupB.count
        ]);

        // series 2
        data.push([
          groupA.choice2 / groupA.count,
          groupB.choice2 / groupB.count
        ]);

        break;
      }

      //case me.$injector.get('TYPE_FRAMING'):
      //case me.$injector.get('TYPE_SAVINGS_TARGET'):
      //case me.$injector.get('TYPE_SAVINGS_SUPPORTED'):
      //case me.$injector.get('TYPE_SELF_COMMITMENT'):
      case me.$injector.get('TYPE_PROCRASTINATION'): {
        var SPLIT = 'SPLIT';
        var ALL = 'ALL';

        map[SPLIT] = { success: 0, failure: 0, count:0 };
        map[ALL] = { success: 0, failure: 0, count:0 };

        mapResults = function(result) {
          var mode = result.json.mode;

          console.log(result.json.mode, result.json.success);

          if (result.json.success) {
            map[mode].success++;
          } else {
            map[mode].failure++;
          }

          map[mode].count++;
        };

        angular.forEach(this.results, mapResults);

        var split = map[SPLIT];
        var all = map[ALL];

        console.log(map);

        // series 1
        data.push([
          split.success / split.count,
          all.success / all.count
        ]);

        // series 2
        data.push([
          split.failure / split.count,
          all.failure / all.count
        ]);

        break;
      }

      default:
    }

    return data;
  };

  /**
   * Gets labels depending on current `task`.
   *
   * @private
   * @method _getLabels
   * @return array
   */
  Chart.prototype._getLabels = function() {
    var i18n = this.$injector.get('i18n');

    switch(this.task.type) {
      case this.$injector.get('TYPE_ANCHORING'):
      case this.$injector.get('TYPE_MENTAL_BOOKKEEPING'):
        return [
          i18n.get('GROUP_A'),
          i18n.get('GROUP_B')
        ];
      case this.$injector.get('TYPE_PROCRASTINATION'):
        return [
          i18n.get('ALL'),
          i18n.get('SPLIT')
        ];
      default:
        return [];
    }
  };

  /**
   * Gets options depending on current `task`.
   *
   * @private
   * @method _getOptions
   * @return array
   */
  Chart.prototype._getOptions = function() {
    var i18n = this.$injector.get('i18n');

    switch(this.task.type) {
      case this.$injector.get('TYPE_ANCHORING'):
      case this.$injector.get('TYPE_MENTAL_BOOKKEEPING'):
        return {
          seriesBarDistance: 15,
          chartPadding: {
            top: 50,
            left: 0,
            right: 0,
            bottom: 0
          },
          axisY:{
            labelInterpolationFnc: function(value) {
              return (value * 100) + '%';
            },
            ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
            type: Chartist.FixedScaleAxis,
            high: 1,
            low: 0
          },
          plugins: [
            Chartist.plugins.legend({
              legendNames: [
                i18n.get('Choice 1'),
                i18n.get('Choice 2')
              ]
            })
          ]
        };
      case this.$injector.get('TYPE_PROCRASTINATION'):
        return {
          seriesBarDistance: 15,
          chartPadding: {
            top: 50,
            left: 0,
            right: 0,
            bottom: 0
          },
          axisY:{
            labelInterpolationFnc: function(value) {
              return (value * 100) + '%';
            },
            ticks: [0, 0.2, 0.4, 0.6, 0.8, 1],
            type: Chartist.FixedScaleAxis,
            high: 1,
            low: 0
          },
          plugins: [
            Chartist.plugins.legend({
              legendNames: [
                i18n.get('Target reached'),
                i18n.get('Target dismissed')
              ]
            })
          ]
        };

      default:
        return {};
    }
  };

  /**
   * Renders chart depending on current `task`.
   *
   * @private
   * @method _render
   * @return array
   */
  Chart.prototype._render = function(data, options) {
    var $timeout = this.$injector.get('$timeout');

    this.$element.addClass('ct-chart');
    var element = this.$element.get(0);

    var me = this;
    var render = function() {
      switch(me.task.type) {
        case me.$injector.get('TYPE_ANCHORING'):
        case me.$injector.get('TYPE_MENTAL_BOOKKEEPING'):
        case me.$injector.get('TYPE_PROCRASTINATION'):
          me._chart = new Chartist.Bar(element, data, options);
          break;
        default:
      }
    };

    $timeout(render, 100);
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('chart', function(){
    return {
      scope: {
        task: '=?chartTask',
        results: '=?chartResults'
      },
      restrict: 'A',
      controller: Chart,
      bindToController: true,
      controllerAs: 'chartController'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular, UIkit */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Modal
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Modal = function($scope, $attrs, $element, $transclude) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$transclude = $transclude;

    this._element = null;
    this._modal = null;
    this._scope = null;
  };

  Modal.$inject = ['$scope', '$attrs', '$element', '$transclude'];

  //
  // PROPERTIES
  //

  /** @var {boolean} isVisible Flag for modal visibility. */
  Modal.prototype.isVisible = false;

  //
  // METHODS
  //

  /**
   * Registers UIkit callbacks and watches.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  Modal.prototype.$onInit = function()
    {
      var me = this;

      // listeners
      this._onShow = function() {
        me.$scope.$evalAsync(me.onShow);
      };

      this._onShown = function() {
        me.$scope.$evalAsync(me.onShown);
      };

      this._onBeforeShow = function() {
        me.$scope.$evalAsync(me.onBeforeShow);
      };

      this._onHide = function() {
        me.$scope.$evalAsync(me.onHide);
      };

      this._onHidden = function() {
        me.$scope.$evalAsync(function(){
          me.isVisible = false;
          me.onHidden();
        });
      };

      this._onBeforeHide = function() {
        me.$scope.$evalAsync(me.onBeforeHide);
      };

      // watches
      this._unwatch = this.$scope.$watch(
        'modalController.isVisible',
        function(isVisible) {
          if (isVisible) {
            me.transclude();
            return;
          }

          me.destroy();
        }
      );
    };

  /**
   * Cleans up everything on destruction.
   *
   * @public
   * @method $onDestroy
   * @return {Void}
   */
  Modal.prototype.$onDestroy = function()
    {
      this._unwatch();
      this.destroy();
    };

  /**
   * Transcludes contents and shows modal.
   *
   * @public
   * @method render
   * @return {Void}
   */
  Modal.prototype.transclude = function() {
    var me = this;

    var transclude = function(clone, scope) {
      // save element and scope
      me._element = clone;
      me._scope = scope;

      // register UIKit listeners
      me._element.on('show', me._onShow);
      me._element.on('shown', me._onShown);
      me._element.on('beforeshow', me._onBeforeShow);

      me._element.on('hide', me._onHide);
      me._element.on('hidden', me._onHidden);
      me._element.on('beforeHide', me._onBeforeHide);

      // replace with actual element
      me.$element.append(clone);

      // create and show the modal
      me._modal = UIkit.modal(clone);
      me._modal.show();
    };

    this.$transclude(transclude);
  };

  /**
   * Destructs current modal transclusion from DOM.
   *
   * @public
   * @method $onDestroy
   * @return {Void}
   */
  Modal.prototype.destroy = function() {
    if (this._element !== null) {
      this._element.off('show', this._onShow);
      this._element.off('shown', this._onShown);
      this._element.off('beforeshow', this._onBeforeShow);

      this._element.off('hide', this._onHide);
      this._element.off('hidden', this._onHidden);
      this._element.off('beforeHide', this._onBeforeHide);

      this._element.remove();
      this._element = null;
    }

    if (this._scope !== null) {
      this._scope.$destroy();
      this._scope = null;
    }

    if (this._modal !== null) {
      this._modal.hide();
      this._modal = null;
    }
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('modal', function(){
    return {
      scope: {
        isVisible: '=?modal',
        onShow:'&modalOnShow',
        onHide:'&modalOnHide',
        onShown:'&modalOnShown',
        onHidden:'&modalOnHidden',
        onBeforeShow:'&modalOnBeforeShow',
        onBeforeHide:'&modalOnBeforeHide'
      },
      restrict: 'A',
      controller: Modal,
      transclude: 'element',
      bindToController: true,
      controllerAs: 'modalController'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Status
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Status = function($scope, $attrs, $element, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.iconRatio = 1;
    this.isCompact = false;
    this.iconColor = 'currentcolor';
  };

  Status.$inject = ['$scope', '$element', '$attrs', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {object} tasks User's task hash map. */
  Status.prototype.tasks = {};

  /** @var {array} tickets User's ticket collection. */
  Status.prototype.tickets = [];

  /** @var {boolean} tasksVisible If task overview is visible. */
  Status.prototype.tasksVisible = false;

  /** @var {boolean} ticketsVisible If tickets overview is visible. */
  Status.prototype.ticketsVisible = false;

  //
  // METHODS
  //

  /**
   * Watches user's `tasks` and `tickets` properties and maps them for view.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  Status.prototype.$onInit = function()
    {
      var user = this.$injector.get('user');

      var me = this;

      var _watchTicketsExpression = function(){
        return user.tickets;
      };

      var _watchTicketsCallback = function(tickets) {
        me.tickets = tickets;
      };

      this._unwatchTickets = this.$scope.$watchCollection(
        _watchTicketsExpression,
        _watchTicketsCallback
      );

      var _watchTasksExpression = function(){
        return user.getTasks();
      };

      var _watchTasksCallback = function(tasks) {
        me.tasks = tasks;
      };

      this._unwatchTasks = this.$scope.$watch(
        _watchTasksExpression,
        _watchTasksCallback
      );
    };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  Status.prototype.$onDestroy = function() {
    this._unwatchTickets();
    this._unwatchTasks();
  };

  /**
   * Toggles `tasksVisible` property.
   *
   * @public
   * @method toggleTasks
   * @return {Void}
   */
  Status.prototype.toggleTasks = function()
    {
      this.tasksVisible = !this.tasksVisible;
    };

  /**
   * Toggles `ticketsVisible` property.
   *
   * @public
   * @method toggleTickets
   * @return {Void}
   */
  Status.prototype.toggleTickets = function()
    {
      this.ticketsVisible = !this.ticketsVisible;
    };

  //
  // REGISTRY
  //
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

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var StatusIcons = function($scope, $attrs, $element, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.ratio = 1;
    this.color = 'currentcolor';
  };

  StatusIcons.$inject = ['$scope', '$attrs', '$element', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {boolean} isBeginner If user has state `STATE_BEGINNER` or higher. */
  StatusIcons.prototype.isBeginner = false;

  /** @var {boolean} isAmateuer If user has state `STATE_AMATEUR` or higher. */
  StatusIcons.prototype.isAmateuer = false;

  /** @var {boolean} isAdvanced If user has state `STATE_ADVANCED` or higher. */
  StatusIcons.prototype.isAdvanced = false;

  /** @var {boolean} isExpert If user has state `STATE_EXPERT` or higher. */
  StatusIcons.prototype.isExpert = false;

  /** @var {boolean} isProfi If user has state `STATE_PROFI` or higher. */
  StatusIcons.prototype.isProfi = false;

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
  StatusIcons.prototype.$onInit = function()
    {
      var STATE_BEGINNER = this.$injector.get('STATE_BEGINNER');
      var STATE_AMATEUR = this.$injector.get('STATE_AMATEUR');
      var STATE_ADVANCED = this.$injector.get('STATE_ADVANCED');
      var STATE_EXPERT = this.$injector.get('STATE_EXPERT');
      var user = this.$injector.get('user');

      var me = this;

      var _watchExpression = function(){
        return user.state;
      };

      var _watchCallback = function(state) {
        me.isBeginner = state >= STATE_BEGINNER;
        me.isAmateur = state >= STATE_AMATEUR;
        me.isAdvanced = state >= STATE_ADVANCED;
        me.isExpert = state >= STATE_EXPERT;
      };

      this._unwatch = this.$scope.$watch(
        _watchExpression,
        _watchCallback
      );
    };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  StatusIcons.prototype.$onDestroy = function() {
    this._unwatch();
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('statusIcons', function() {
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

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var StatusLabel = function($scope, $attrs, $element, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;
  };

  StatusLabel.$inject = ['$scope', '$attrs', '$element', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {string} state String represenation of user's `state`. */
  StatusLabel.prototype.state = null;

  /** @var {boolean} isCompact If presentation is in compact format. */
  StatusLabel.prototype.isCompact = false;

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
  StatusLabel.prototype.$onInit = function()
    {
      var user = this.$injector.get('user');

      var me = this;

      var _watchExpression = function() {
        return user.state;
      };

      var _watchCallback = function() {
        me.state = user.getStateAsString();
      };

      this._unwatch = this.$scope.$watch(
        _watchExpression,
        _watchCallback
      );
    };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  StatusLabel.prototype.$onDestroy = function() {
    this._unwatch();
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('statusLabel', function(){
    return {
      scope: {
        isCompact: '=?statusLabelIsCompact'
      },
      restrict: 'A',
      transclude: true,
      controller: StatusLabel,
      bindToController: true,
      controllerAs: 'statusLabelController',
      templateUrl: 'views/directives/status-label.html'
    };
  });

  // --------------------------------------------------
  // Status Label
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var StatusTickets = function($scope, $attrs, $element, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;
  };

  StatusTickets.$inject = ['$scope', '$attrs', '$element', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {number} tickets Current user ticket count. */
  StatusTickets.prototype.tickets = 0;

  /** @var {boolean} isCompact If presentation is in compact format. */
  StatusTickets.prototype.isCompact = false;

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
  StatusTickets.prototype.$onInit = function()
    {
      var user = this.$injector.get('user');

      var me = this;

      var _watchExpression = function() {
        return user.tickets;
      };

      var _watchCallback = function(tickets) {
        me.tickets = tickets ? tickets.length : 0;
      };

      this._unwatch = this.$scope.$watchCollection(
        _watchExpression,
        _watchCallback
      );
    };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  StatusTickets.prototype.$onDestroy = function() {
    this._unwatch();
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('statusTickets', function(){
    return {
      scope: {
        isCompact: '=?statusTicketsIsCompact'
      },
      restrict: 'A',
      transclude: true,
      controller: StatusTickets,
      bindToController: true,
      controllerAs: 'statusTicketsController',
      templateUrl: 'views/directives/status-tickets.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Tabber
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Tabber = function($scope, $element, $attrs, $transclude) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$transclude = $transclude;

    this.domId = 'tabber-' + $scope.$id;

    this.hasExercise = $transclude.isSlotFilled('exercise');
  };

  Tabber.$inject = ['$scope','$element','$attrs', '$transclude'];

  //
  // PROPERTIES
  //

  /** @var {array} hasExercise If slot `exercise` has contents. */
  Tabber.prototype.hasExercise = false;

  //
  // REGISTRY
  //
  angular.module(module).directive('tabber', function(){
    return {
      scope: {
        icon: '=?tabberIcon'
      },
      restrict: 'A',
      transclude: {
        exercise: '?tabberExercise',
        description: 'tabberDescription'
      },
      controller: Tabber,
      bindToController: true,
      controllerAs: 'tabberController',
      templateUrl: 'views/directives/tabber.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular, interact */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Draggable
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Draggable = function($scope, $element, $attrs, $injector) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$injector = $injector;

    this._body = null;
    this._clone = null;
    this._coordinates = {};
    this._interactable = null;
    this._activeClass = 'active';
    this._itemClass = 'draggable';
    this._disabledClass = 'disabled';

    var me = this;
    this._unwatch = $scope.$watch(
      function(){ return me.disabled; },
      function(disabled) {
        if (disabled) {
          me.$element.addClass(me._disabledClass);
        } else {
          me.$element.removeClass(me._disabledClass);
        }

        me._interactable.draggable({enabled: !disabled});
      }
    );

    this._onResize = this._onResize.bind(this);
  };

  Draggable.$inject = ['$scope','$element','$attrs','$injector'];

  //
  // PROPERTIES
  //

  /** @var {object} data Connected data for draggable. */
  Draggable.prototype.data = null;

  /** @type {boolean} clone If clone item should be used. */
  Draggable.prototype.clone = false;

  /** @var {boolean} disabled If draggable is disabled. */
  Draggable.prototype.disabled = false;

  /** @type {boolean} clone If clone item should be used. */
  Draggable.prototype.restriction = 'parent';

  //
  // METHODS
  //

  /**
   * Initializes `interact` library on element
   * with all available callbacks for dragging.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  Draggable.prototype.$onInit = function() {
    var $window = this.$injector.get('$window');

    this._body = angular.element(document.body);
    this.$element.addClass(this._itemClass);
    var element = this.$element.get(0);

    this._interactable = interact(element);

    var me = this;
    var options = {
      inertia: true,
      autoScroll: true,
      enabled: !this.disabled,
      onend: this._onEndItem.bind(this),
      onmove: this._onMoveItem.bind(this),
      onstart: this._onStartItem.bind(this),
      snap: {
          targets:[function(x,y,interaction) {
            // 'startCoords' doesn't work here, so
            // we catch initial position once from
            // interaction element and this values
            if (!me._origin) {
              me._origin = {
                x: interaction.startCoords.page.x,
                y: interaction.startCoords.page.y
              };
            }

            // if not dropped, move draggable
            // smoothly back to origin point
            if (!interaction.dropTarget) {
              return {
                x: me._origin.x, // instead of 0
                y: me._origin.y  // instead of 0
              };
            }
          }],
          //offset: 'startCoords',
          endOnly: true
      }
    };

    if (this.clone) {
      angular.extend(options, { manualStart: true });
      this._interactable.on('move', this._onMove.bind(this));
    }

    this._interactable.draggable(options);
    this._interactable.getData = this._getData.bind(this);

    this._window = angular.element($window);
    this._window.on('resize', this._resize);
  };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  Draggable.prototype.$onDestroy = function() {
    this._window.off('resize', this._onResize);
    this._interactable.unset();
    this._unwatch();
  };

  /**
   * Resets `origin` info for snapping.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  Draggable.prototype._onResize = function() {
    this._origin = null;
  };

  /**
   * Adds `activeClass` to clone and invokes `onDragStart`.
   *
   * @private
   * @method _onStartItem
   * @return {Void}
   */
  Draggable.prototype._onStartItem = function(event) {
    var target = !this.clone ?
      angular.element(event.target) :
      this._clone;

    target.addClass(this._activeClass);

    this._trigger('onDragStart', {
      $event: event,
      $data: this.data
    });
  };

  /**
   * This performs actual dragging logic with CSS.
   * The method triggers the `onDragMove` callback.
   *
   * @private
   * @method _onMoveItem
   * @return {Void}
   */
  Draggable.prototype._onMoveItem = function(event) {
    var target = !this.clone ?
      angular.element(event.target) :
      this._clone;

    var x = (this._coordinates.x || 0) + event.dx;
    var y = (this._coordinates.y || 0) + event.dy;

    this._translate(target,x,y);

    this._trigger('onDragMove', {
      $event: event,
      $data: this.data
    });
  };

  /**
   * This performs resetting work by removing clone.
   * It invokes always the `onDragEnd` and the `onDrop`
   * callbacks - if dropped on target element.
   *
   * @private
   * @method _onEndItem
   * @return {Void}
   */
  Draggable.prototype._onEndItem = function(event) {
    var dropped = !!event.interaction.dropTarget;

    if (!this.clone) {
      var target = angular.element(event.target);
      target.removeClass(this._activeClass);

      // remove translate for snapping if
      // animating back to origin coords!
      if (!dropped) {
        this._translate(target,0,0);
      }

    } else {
      this._coordinates = {};
      this._clone.remove();
      this._clone = null;
    }

    this._trigger('onDragEnd', {
      $event: event,
      $data: this.data
    });

    if (dropped) {
      this._trigger('onDrop', {
        $event: event,
        $data: this.data
      });
    }
  };

  /**
   * Creates the clone and triggers manual kick-off for `interact`.
   * This is necessary because we want:
   *
   * 1) being able to show clone object
   * 2) being able to have disable control
   *
   * @private
   * @method _onMove
   * @return {Void}
   */
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
      this._clone = angular.element(element).clone();

      var offsetY = element.clientHeight / 2;
      var offsetX = element.clientWidth / 2;

      var pageY = !!event.touches ?
        event.touches[0].pageY :
        event.pageY;
      var pageX = !!event.touches ?
        event.touches[0].pageX :
        event.pageX;

      this._clone.css({
        left: (pageX - offsetX) + 'px',
        top: (pageY - offsetY) + 'px',
        position: 'absolute'
      });

      this._body.append(this._clone);
      element = this._clone.get(0);
    }

    // invoke 'drag' interaction manually with the target/clone
    interaction.start({ name: 'drag' }, interactable, element);
  };

  /**
   * Retrieves the connected drag object data.
   *
   * @private
   * @method _getData
   * @return {object}
   */
  Draggable.prototype._getData = function() {
    return this.data;
  };

  /**
   * Translates DOM node to given coordinates.
   *
   * @private
   * @method _translate
   * @param object element
   * @param number x
   * @param number y
   * @return {void}
   */
  Draggable.prototype._translate = function(element, x, y) {
    var translate = 'translate('+x+'px,'+y+'px)';

    element.css({
      'webkitTransform': translate,
      'mozTransform': translate,
      'msTransform': translate,
      'oTransform': translate,
      'transform': translate
    });

    this._coordinates.x = x;
    this._coordinates.y = y;
  };

  /**
   * Primitive method for invoking callbacks.
   *
   * @private
   * @method _trigger
   * @return {void}
   */
  Draggable.prototype._trigger = function(method, args) {
    this.$scope.$evalAsync(this[method].bind(this,args));
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('draggable', function(){
    return {
      scope: {
        data: '=?draggableData',
        clone: '=?draggableClone',
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

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Dropable = function($scope, $element, $attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this._interactable = null;
    this._enterClass = 'enter';
    this._activeClass = 'active';
    this._itemClass = 'dropable';
    this._acceptClass = 'draggable';
    this._disabledClass = 'disabled';

    var me = this;
    this._unwatch = $scope.$watch(
      function(){ return me.disabled; },
      function(disabled) {
        if (disabled) {
          me.$element.addClass(me._disabledClass);
        } else {
          me.$element.removeClass(me._disabledClass);
        }
      }
    );
  };

  Dropable.$inject = ['$scope','$element','$attrs'];

  //
  // PROPERTIES
  //

  /** @var {boolean} disabled If draggable is disabled. */
  Dropable.prototype.disabled = false;

  //
  // METHODS
  //

  /**
   * Initializes `interact` library on element
   * with all available callbacks for dragging.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  Dropable.prototype.$onInit = function() {
    this._body = angular.element(document.body);
    this.$element.addClass(this._itemClass);
    var accept = '.' + this._acceptClass;
    var element = this.$element.get(0);

    this._interactable = interact(element)
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

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  Dropable.prototype.$onDestroy = function() {
    this._interactable.unset();
    this._unwatch();
  };

  /**
   * Removes the active class from element and
   * triggers the `onDropDeactivate` callback.
   *
   * @private
   * @method _onDropDeactivate
   * @return {Void}
   */
  Dropable.prototype._onDropDeactivate = function(event) {
    this.$element.removeClass(this._activeClass);
    var data = event.draggable.getData();

    this._trigger('onDropDeactivate', {
      $event: event,
      $data: data
    });
  };

  /**
   * Applies the active class from element and
   * triggers the `onDropActivate` callback.
   *
   * @private
   * @method _onDropDeactivate
   * @return {Void}
   */
  Dropable.prototype._onDropActivate = function(event) {
    this.$element.addClass(this._activeClass);
    var data = event.draggable.getData();

    this._trigger('onDropActivate', {
      $event: event,
      $data: data
    });
  };

  /**
   * Applies the enter class from element and
   * triggers the `onDragEnter` callback.
   *
   * @private
   * @method _onDropDeactivate
   * @return {Void}
   */
  Dropable.prototype._onDragEnter = function(event) {
    this.$element.addClass(this._enterClass);
    var data = event.draggable.getData();

    this._trigger('onDragEnter', {
      $event: event,
      $data: data
    });
  };

  /**
   * Removes the enter class from element and
   * triggers the `onDragLeave` callback.
   *
   * @private
   * @method _onDropDeactivate
   * @return {Void}
   */
  Dropable.prototype._onDragLeave = function(event) {
    this.$element.removeClass(this._enterClass);
    var data = event.draggable.getData();

    this._trigger('onDragLeave', {
      $event: event,
      $data: data
    });
  };

  /**
   * Removes the enter class from element and
   * triggers the `onDrop` callback with data
   * from the draggable element.
   *
   * @private
   * @method _onDropDeactivate
   * @return {Void}
   */
  Dropable.prototype._onDrop = function(event) {
    this.$element.removeClass(this._enterClass);
    var data = event.draggable.getData();

    this._trigger('onDrop',{
      $event: event,
      $data: data
    });
  };

  /**
   * Primitive method for invoking callbacks.
   *
   * @private
   * @method _trigger
   * @return {void}
   */
  Dropable.prototype._trigger = function(method, args) {
    this.$scope.$evalAsync(this[method].bind(this,args));
  };

  //
  // REGISTRY
  //
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

/* global ANGULAR_MODULE, angular, UIkit, jQuery */
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

    this._source = null;
    this._target = null;
    this._scroller = null;
    this._onClick = this._onClick.bind(this);
    this._onScrolled = this._onScrolled.bind(this);
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
    // try to grab target from - can be either
    // a jquery element or a string id / hash
    if (this.element instanceof jQuery) {
      this._target = this.element;
    } else {
      if (angular.isString(this.element)) {
        if (this.element.charAt(0) !== '#') {
          this._target = '#' + this.element;
        }

        this._target = jQuery(this._target);
      }
    }

    if (this._target === null) {
      console.warn('scroll-to.js: Invalid target element!');
      return;
    }

    // need to create a dummy `<a href='#hash'></a>`
    // element to set it as source object for UIkit
    var href = '#' + this._target.id;
    this._source = jQuery('<a href="'+href+'"></a>');

    this.options = this.options || {};
    this.options.offset = this.options.offset || 80;
    this.options.duration = this.options.duration || 500;
    this.options.easing = this.options.easing || 'easeOutExpo';

    this.$element.on('click', this._onClick);
    this._source.on('scrolled', this._onScrolled);

    this._scroller = UIkit.scroll(this._source, this.options);
  };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  ScrollTo.prototype.$onDestroy = function() {
    this._source.off('scrolled', this._onScrolled);
    this.$element.off('click', this._onClick);

    this._scroller.$destroy(true);

    this._scroller = null;
    this._source = null;
    this._target = null;
  };

  /**
   * Invokes scrolling to target element.
   *
   * @private
   * @method _onClick
   * @return {void}
   */
  ScrollTo.prototype._onClick = function() {
    this._scroller.scrollTo(this._target);
  };

  /**
   * Tries to invoke callback after scrolling.
   *
   * @private
   * @method _onScrolled
   * @return {void}
   */
  ScrollTo.prototype._onScrolled = function() {
    if (!angular.isFunction(this.callback)) {
      return;
    }

    this.$scope.$evalAsync(this.callback);
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

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Evaluation
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var Evaluation = function($scope, $element, $attrs, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.user = $injector.get('user');
    this.domId = 'evaluation-' + $scope.$id;
  };

  Evaluation.$inject = ['$scope','$element','$attrs', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {string} domId Unique dom id for scrolling. */
  Evaluation.prototype.domId = null;

  //
  // REGISTRY
  //
  angular.module(module).directive('evaluation', function(){
    return {
      scope: {
        parent: '=evaluation'
      },
      restrict: 'A',
      transclude: {
        text: 'evaluationText',
        customButtons: '?evaluationCustomButtons',
        defaultButtons: '?evaluationDefaultButtons'
      },
      controller: Evaluation,
      bindToController: true,
      controllerAs: 'evaluationController',
      templateUrl: 'views/directives/evaluation.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Locked State
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var LockedState = function($scope, $element, $attrs, $injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;

    this.user = $injector.get('user');
  };

  LockedState.$inject = ['$scope','$element','$attrs', '$injector'];

  //
  // REGISTRY
  //
  angular.module(module).directive('lockedState', function(){
    return {
      scope: {
        isLocked: '=?lockedState'
      },
      restrict: 'A',
      transclude: {
        userText: '?userText',
        adminText: '?adminTExt'
      },
      controller: LockedState,
      bindToController: true,
      controllerAs: 'lockedStateController',
      templateUrl: 'views/directives/locked-state.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // Form Field
  // --------------------------------------------------

  //
  // CONTROLLER
  //

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

      this._transcludeElements = [];
      this._transcludeScopes = [];
      this._cloneDefault = null;
      this._cloneLabel = null;
      this._unlisten = [];
      this._unwatch = [];
    };

  FormField.$inject = ['$scope', '$element', '$attrs', '$transclude', '$timeout'];

  //
  // PROPERTIES
  //

  /** @var {string} id Dom id form element. */
  FormField.prototype.id = '';

  /** @var {string} label Label of form element. */
  FormField.prototype.label = '';

  /** @var {ngModelController} model Added `ngModel` controller. */
  FormField.prototype.ngModel = null;

  /** @var {boolean} resetEmpty If validation resets on empty model. */
  FormField.prototype.resetEmpty = true;

  /** @var {boolean} showMessages True if `ngMessages` are visible. */
  FormField.prototype.showMessages = false;

  /** @var {string} labelClass Class to append to label. */
  FormField.prototype.labelClass = 'uk-form-label';

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
      this.id = 'form-field-' + this.$scope.$id;

      // add watch properties
      this._addWatches();

      // transclude contents
      this._transclude();
    };

  /**
   * Removes transcluded elements, scope and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  FormField.prototype.$onDestroy = function()
    {
      angular.forEach(this._transcludeElements, function(element){
        element.remove();
      });

      angular.forEach(this._transcludeScopes, function(scope){
        scope.$destroy();
      });

      angular.forEach(this._unlisten, function(unlisten){
        unlisten();
      });

      angular.forEach(this._unwatch, function(unwatch){
        unwatch();
      });
    };

  /**
   * Sets model controller from transcluded form
   * element using the `ng-model` attribute and
   * the `form-field-model` helper component.
   *
   * @public
   * @method setModel
   * @param {NgModelController} ngModel
   * @return {void}
   */
  FormField.prototype.setModel = function(ngModel)
    {
      this.ngModel = ngModel;
    };

  /**
   * Updates validation depending on `ngModel.$valid`.
   *
   * @private
   * @method _update
   * @return {void}
   */
  FormField.prototype._update = function()
    {
      if (this.ngModel.$valid) {
        this._cloneDefault.removeClass(this.failureClass);
        this._cloneDefault.addClass(this.successClass);
      } else {
        this._cloneDefault.removeClass(this.successClass);
        this._cloneDefault.addClass(this.failureClass);
      }

      this.showMessages = this.ngModel.$invalid;
    };

  /**
   * Resets corresponding validation properties.
   *
   * @private
   * @method _reset
   * @return {boolean}
   */
  FormField.prototype._reset = function()
    {
      this._cloneDefault.removeClass(this.failureClass);
      this._cloneDefault.removeClass(this.successClass);
      this.ngModel.$setUntouched();
      this.showMessages = false;
    };

  /**
   * Adds scope watches for `isValid()` and `isInvalid()`.
   *
   * @private
   * @method _addWatches
   * @return {void}
   */
  FormField.prototype._addWatches = function()
    {
      var me = this;

      // observes `ngModel` controller for changing any
      // of its validation properties such as `$valid`
      var unwatchModel = this.$scope.$watchCollection(
        'formFieldController.ngModel',
        function(newModel, oldModel)
        {
          // ignore initial invocation
          if (newModel === oldModel) {
            return;
          }

          // as long as model hasn't been
          // touched no validation's made
          if (!newModel.$touched) {
              return;
          }

          // wait for async validators
          if (newModel.$pending) {
            return;
          }

          // if no view value is present
          // reset all validation props!
          if (!newModel.$viewValue) {
            if (me.resetEmpty) {
              me._reset();
              return;
            }
          }

          me._update();
        }
      );

      this._unwatch.push(unwatchModel);
    };

  /**
   * Transcludes `default` and `label` slot programmatically
   * to append custom attributes and events to dom elements.
   *
   * @private
   * @method _transclude
   * @return {void}
   */
  FormField.prototype._transclude = function()
    {
      var me = this;

      // adds `id` attribute to be focues by <label>
      var transcludeDefault = function(clone, scope)
      {
        var domId = '#default-' + me.id;
        var template = angular.element(domId);

        clone.attr('id', me.id);

        template.replaceWith(clone);

        me._cloneDefault = clone;

        me._transcludeScopes.push(scope);
        me._transcludeElements.push(clone);
      };

      // adds `labelClass` and sets `for` attribute
      // for <label> in order to auto focus element
      var transcludeLabel = function(clone, scope)
      {
        var domId = '#label-' + me.id;
        var template = angular.element(domId);

        clone.attr('for', me.id);
        clone.addClass(me.labelClass);

        template.replaceWith(clone);

        me._cloneLabel = clone;

        me._transcludeScopes.push(scope);
        me._transcludeElements.push(clone);
      };

      // wait for dom to be ready before transclude
      var timeout = function()
      {
        me.$transclude(transcludeDefault, null, null);
        me.$transclude(transcludeLabel, null, 'label');
      };

      this.$timeout(timeout);
    };

  //
  // REGISTRY
  //
  angular.module(ANGULAR_MODULE).directive('formField',function() {
    return {
      scope: {
          name: '=formField',
          resetEmpty: '=?formFieldResetEmpty',
          labelClass: '=?formFieldLabelClass',
          failureClass: '=?formFieldFailureClass',
          successClass: '=?formFieldSuccessClass'
      },
      transclude: {
        label: '?label',
        messageMin: '?messageMin',
        messageMax: '?messageMax',
        messageUrl: '?messageUrl',
        messageEmail: '?messageEmail',
        messageNumber: '?messageNumber',
        messagePattern: '?messagePattern',
        messageRequired: '?messageRequired',
        messageMinlength: '?messageMinlength',
        messageMaxlength: '?messageMaxlength',
        messagesCustom: '?messagesCustom'
      },
      restrict: 'A',
      controller: FormField,
      bindToController: true,
      controllerAs: 'formFieldController',
      templateUrl: 'views/directives/form-field.html'
    };
  });

  // --------------------------------------------------
  // Form Field Model
  // --------------------------------------------------

  /**
   * @constructor
   */
  var FormFieldModel = function($scope, $attrs, $element, $log) {
    this.$log = $log;
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
  };

  FormFieldModel.$inject = ['$scope', '$attrs', '$element', '$log'];

  //
  // METHODS
  //

  /**
   * Registers `ngModel` on `formField` controller.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  FormFieldModel.prototype.$onInit = function()
    {
      if (!this.formField) {
        this.$log.warn('formFieldModel: No form field controller found!');
        return;
      }

      this.formField.setModel(this.ngModel);
    };

  //
  // REGISTRY
  //
  angular.module(module).directive('formFieldModel', function(){
    return {
      restrict: 'A',
      require: {
        'ngModel': 'ngModel',
        'formField': '^?formField'
      },
      bindToController: true,
      controller: FormFieldModel
    };
  });

})(ANGULAR_MODULE, angular);

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

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // InterestTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var InterestTask = function($scope, $element, $attrs, $injector) {
    var type = $injector.get('TYPE_INTEREST');
    var user = $injector.get('user');

    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.task = user.getTaskByType(type);
  };

  InterestTask.$inject = ['$scope', '$element', '$attrs', '$injector'];

  //
  // PROPERTIES
  //

  // SERVER

  /** @var {object} task Task's resource from server. */
  InterestTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} resolved If player has resolved the game. */
  InterestTask.prototype.resolved = false;

   /** @var {number} correctAnswers Count of correct answers. */
  InterestTask.prototype.correctAnswers = 0;

  /** @var {number} exercise1Answer Answer for first exercise. */
  InterestTask.prototype.exercise1Answer = 0;

  /** @var {number} exercise2Answer Answer for second exercise. */
  InterestTask.prototype.exercise2Answer = 0;

  /** @var {boolean} exercise1Correct Resolution state of first exercise. */
  InterestTask.prototype.exercise1Correct = false;

  /** @var {boolean} exercise2Correct Resolution state of second exercise. */
  InterestTask.prototype.exercise2Correct = false;

  /** @var {number} exercise1Result Correct result for first exercise. */
  InterestTask.prototype.exercise1Result = 0;

  /** @var {number} exercise2Result Correct result for second exercise. */
  InterestTask.prototype.exercise2Result = 0;

  // SETTINGS

  /** @var {number} amount Amount of money. */
  InterestTask.prototype.amount = 1000;

  /** @var {number} rate Interest rate. */
  InterestTask.prototype.rate = 0.02;

  /** @var {number} years Number of years. */
  InterestTask.prototype.years = 1;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  InterestTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {Void}
   */
  InterestTask.prototype.getPayload = function() {
    /* jshint camelcase: false */
    return {
      task: this.task,
      json: {
        exercise1: {
          current_result: this.exercise1Result,
          actual_result: this.exercise1Answer,
          is_valid: this.exercise1Correct
        },
        exercise2: {
          current_result: this.exercise2Result,
          actual_result: this.exercise2Answer,
          is_valid: this.exercise2Correct
        }
      }
    };
    /* jshint camelcase: true */
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  InterestTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  InterestTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (!this.exercise1Answer) {
      return false;
    }

    if (!this.exercise2Answer) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {Void}
   */
  InterestTask.prototype.init = function() {
    this.resolved = false;
    this.correctAnswers = 0;
    this.exercise1Answer = 0;
    this.exercise2Answer = 0;
    this.exercise1Correct = false;
    this.exercise2Correct = false;
    this.exercise1Result = this._calculateResult(1);
    this.exercise2Result = this._calculateResult(1 + this.years);
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {Void}
   */
  InterestTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Updates answers, state and counters
   * for given exercise for evaluation.
   *
   * @public
   * @method update
   * @param {number} value
   * @param {string} exercise
   * @return {Void}
   */
  InterestTask.prototype.update = function(value, exercise){
    switch(exercise) {
      case 'exercise1':
        this.exercise1Answer = value;
        break;
      case 'exercise2':
        this.exercise2Answer = value;
        break;
      default:
    }

    this.exercise1Correct = this.exercise1Answer === this.exercise1Result;
    this.exercise2Correct = this.exercise2Answer === this.exercise2Result;

    if (this.exercise1Correct && this.exercise2Correct) {
      this.correctAnswers = 2;
    } else if (this.exercise1Correct) {
      this.correctAnswers = 1;
    } else if (this.exercise2Correct) {
      this.correctAnswers = 1;
    } else {
      this.correctAnswers = 0;
    }
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {Void}
   */
  InterestTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');
    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Calculates result for given years.
   *
   * @private
   * @method _calculateResult
   * @param {number} years
   * @return {number}
   */
  InterestTask.prototype._calculateResult = function(years) {
    return this.amount * Math.pow(1 + this.rate, years || 1);
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('interestTask', function(){
    return {
      scope: {
        rate: '=?interestTaskRate',
        years: '=?interestTaskYears',
        amount: '=?interestTaskAmount',
        onResolve: '&interestTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: InterestTask,
      bindToController: true,
      controllerAs: 'interestTaskController',
      templateUrl: 'views/directives/tasks/interest-task.html'
    };
  });

  // --------------------------------------------------
  // InterestTask Exercise
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var InterestTaskExercise = function($scope,$element,$attrs) {
    this.$element = $element;
    this.$scope = $scope;
    this.$attrs = $attrs;

    this.disabled = false;
    this.stack = [];
    this.sum = 0;

    var me = this;
    this._unwatch = $scope.$watch(
      function(){ return me.sum; },
      function(sum) {
        if (!sum) {
          me.sum = 0;
          me.stack = [];
        }
      }
    );
  };

  InterestTaskExercise.$inject = ['$scope','$element','$attrs'];

  //
  // PROPERTIES
  //

  /** @var {boolean} disabled If exercise is currently disabled. */
  InterestTaskExercise.prototype.disabled = false;

  /** @var {array} stack Stack collection all notes and coins. */
  InterestTaskExercise.prototype.stack = [];

  /** @var {number} sum Total sum of all values from `stack`. */
  InterestTaskExercise.prototype.sum = 0;

  /** @var {array} notes All selectable notes for exercise. */
  InterestTaskExercise.prototype.notes = [500,200,100,50,20,10,5];

  /** @var {array} notes All selectable coins for exercise. */
  InterestTaskExercise.prototype.coins = [2,1,0.5,0.2,0.1,0.05,0.02,0.01];

  //
  // METHODS
  //

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  InterestTaskExercise.prototype.$onDestroy = function() {
    this._unwatch();
  };

  /**
   * Adds value to `stack`, increases `sum`
   * and invokes the `onUpdate` callback.
   *
   * @public
   * @method onDrop
   * @return {Void}
   */
  InterestTaskExercise.prototype.onDrop = function(value){
    this.stack.push(value);
    this.sum += value;

    this.onUpdate({
      sum: this.sum
    });
  };

  /**
   * Removes last item from `stack`, decreases
   * `sum` and invokes the `onUpdate` callback.
   *
   * @public
   * @method revert
   * @return {Void}
   */
  InterestTaskExercise.prototype.revert = function() {
    this.sum -= this.stack.pop();

    this.onUpdate({
      sum: this.sum
    });
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('interestTaskExercise', function(){
    return {
      scope: {
        sum: '=?interestTaskExerciseSum',
        onUpdate: '&interestTaskExerciseOnUpdate',
        disabled: '=?interestTaskExerciseDisabled'
      },
      restrict: 'A',
      transclude: true,
      controller: InterestTaskExercise,
      bindToController: true,
      controllerAs: 'interestTaskExerciseController',
      templateUrl: 'views/directives/tasks/interest-task-exercise.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // DiversificationTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var DiversificationTask = function($scope, $elemnt, $attrs, $injector) {
    var type = $injector.get('TYPE_DIVERSIFICATION');
    var user = $injector.get('user');

    this.$injector = $injector;
    this.task = user.getTaskByType(type);
  };

  DiversificationTask.$inject = ['$scope','$element','$attrs', '$injector'];

  // SERVER

  /** @var {object} task Task's resource from server. */
  DiversificationTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} resolved If player has resolved the game. */
  DiversificationTask.prototype.resolved = false;

  /** @var {string} heads Current class of heads side. */
  DiversificationTask.prototype.heads = 'K';

  /** @var {string} tails Current class of tails side. */
  DiversificationTask.prototype.tails = 'Z';

  /** @var {array} companies Data for companies. */
  DiversificationTask.prototype.companies = {};

  /** @var {array} tickets Data for tickets. */
  DiversificationTask.prototype.tickets = {};

  /** @var {array} sides Two values for coin. */
  DiversificationTask.prototype.sides = [];

  /** @var {number} result Final result. */
  DiversificationTask.prototype.sides = [];

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  DiversificationTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {void}
   */
  DiversificationTask.prototype.getPayload = function() {
    return {
      task: this.task,
      json: {
        tickets: {
          one: this.tickets.one.company,
          two: this.tickets.two.company
        },
        throws: {
          one: this.throws.one.toss,
          two: this.throws.two.toss
        }
      },
      ticketCount: this.getTicketCount()
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  DiversificationTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  DiversificationTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (!this.tickets.one.company) {
      return false;
    }

    if (!this.tickets.two.company) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  DiversificationTask.prototype.init = function() {
    var random = this.$injector.get('random');

    this.sides = [
      this.heads,
      this.tails
    ];

    this.throws = {
      one: {
        id: 1,
        toss: random.pick(this.sides)
      },
      two: {
        id: 2,
        toss: random.pick(this.sides)
      }
    };

    this.tickets = {
      one: {
        id: 1,
        company: null
      },
      two: {
        id: 2,
        company: null
      }
    };

    this.companies = {
      one: {
        id: 1,
        count: 0,
        tickets: {},
        name: 'Smart',
        image: 'company-a.svg'
      },
      two: {
        id: 2,
        count: 0,
        tickets: {},
        name: 'Phone',
        image: 'company-b.svg'
      }
    };

    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  DiversificationTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Adds or removes a ticket from given company.
   *
   * @public
   * @method update
   * @param ticket
   * @param company
   * @param action
   * @return {void}
   */
  DiversificationTask.prototype.update = function(ticket, company, action){
    switch (action) {
      case 'add':
        if (!company.tickets[ticket.id]) {
          company.tickets[ticket.id] = ticket;
          ticket.company = company.name;
          company.count++;
        }
        break;
      case 'remove':
        if (company.tickets[ticket.id]) {
          delete company.tickets[ticket.id];
          ticket.company = null;
          company.count--;
        }
        break;
      default:
    }
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  DiversificationTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');

    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Calculates final ticket amount by predefined formula.
   *
   * @public
   * @method getTicketCount
   * @return {number}
   */
  DiversificationTask.prototype.getTicketCount = function(){
    var factorA = this.throws.one.toss === this.heads ? 2 : 1;
    var factorB = this.throws.two.toss === this.heads ? 2 : 1;

    var ticketsA = this.companies.one.count * factorA;
    var ticketsB = this.companies.two.count * factorB;

    return ticketsA + ticketsB;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('diversificationTask', function(){
    return {
      scope: {
        onResolve: '&diversificationTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      bindToController: true,
      controller: DiversificationTask,
      controllerAs: 'diversificationTaskController',
      templateUrl: 'views/directives/tasks/diversification-task.html'
    };
  });

  // --------------------------------------------------
  // DiversificationTask Coin
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var DiversificationTaskCoin = function($scope,$element,$attrs,$injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this._element = this.$element.find('.coin');
    this._animationEndEvent = this._getAnimationEndEvent();
  };

  DiversificationTaskCoin.$inject = ['$scope','$element','$attrs','$injector'];

  //
  // PROPERTIES
  //

  /** @var {string} toss One of `heads` or `tails`. */
  DiversificationTaskCoin.prototype.toss = null;

  /** @var {string} heads Current class of heads side. */
  DiversificationTaskCoin.prototype.sides = [];

  /** @var {string} heads Current class of heads side. */
  DiversificationTaskCoin.prototype.heads = 'K';

  /** @var {string} tails Current class of tails side. */
  DiversificationTaskCoin.prototype.tails = 'Z';

  /** @var {boolean} flip Flag to invoke a new toss. */
  DiversificationTaskCoin.prototype.flip = false;

  /** @var {boolean} flip Flag to apply CSS classes. */
  DiversificationTaskCoin.prototype.animate = false;

  /** @var {string} backClass CSS class for back side. */
  DiversificationTaskCoin.prototype.back = 'back';

  /** @var {string} frontClass CSS class for front side. */
  DiversificationTaskCoin.prototype.front = 'front';

  /** @var {string} startSide Initially displayed side of coin. */
  DiversificationTaskCoin.prototype.startSide = 'K';

  //
  // METHODS
  //

  /**
   * Sets up
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  DiversificationTaskCoin.prototype.$onInit = function() {
    var $timeout = this.$injector.get('$timeout');
    var me = this;

    this.sides = [
      {
        value: this.heads,
        class: this.front
      },
      {
        value: this.tails,
        class: this.back
      }
    ];

    if (this.startSide !== this.heads) {
      this.sides[0].class = this.back;
      this.sides[1].class = this.front;
    }

    me._toss = me._getToss();

    var _timeoutCallback = function() {
      var _iterateSides = function(side) {
        if (side.value === me._toss.value) {
          side.class = me.front;
          return;
        }

        side.class = me.back;
      };

      angular.forEach(me.sides, _iterateSides);
    };

    var _watchFlipCallback = function(newFlip/*,oldFlip*/) {
      if (newFlip) {
        me.onStart({toss: me._toss.value});
        $timeout(_timeoutCallback, 100);
        me.animate = true;
      }
    };

    var _watchFlipExpression = function() {
      return me.flip;
    };

    var _watchTossCallback = function(newToss, oldToss) {
      if (newToss !== oldToss) {
        me._toss = me._getToss();
      }
    };

    var _watchTossExpression = function() {
      return me.toss;
    };

    var _evalAsyncCallback = function() {
      me.onFinish({toss: me._toss.value});
      me.animate = false;
    };

    var _animationEndCallback = function() {
      me.$scope.$evalAsync(_evalAsyncCallback);
    };

    this.onInit({toss: me._toss.value});

    if (this._animationEndEvent) {
      this._element.on(this._animationEndEvent, _animationEndCallback);
    }

    this._unwatchFlip = this.$scope.$watch(_watchFlipExpression, _watchFlipCallback);
    this._unwatchToss = this.$scope.$watch(_watchTossExpression, _watchTossCallback);
  };

  /**
   * Removes event listener and watches.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  DiversificationTaskCoin.prototype.$onDestroy = function() {
    this._element.off(this._animationEndEvent);
    this._unwatchToss();
    this._unwatchFlip();
  };

  /**
   * Gets correctly prefixed transition event.
   *
   * @private
   * @method _getTransitionEvent
   * @return {void}
   */
  DiversificationTaskCoin.prototype._getAnimationEndEvent = function() {
    var dummy = document.createElement('div');
    var transitions = {
      'WebkitAnimation': 'webkitAnimationEnd',
      'MozTAnimation': 'animationend',
      'animation': 'animationend'
    };

    for(var key in transitions){
        var event = dummy.style[key];
        if( event !== undefined ){
          return transitions[key];
        }
    }

    return null;
  };

  /**
   * Transforms `toss` to one side either
   * by random or by given consumer input.
   *
   * @private
   * @method _getToss
   * @return {void}
   */
  DiversificationTaskCoin.prototype._getToss = function() {
    var $filter = this.$injector.get('$filter');
    var random = this.$injector.get('random');
    var picked = random.pick(this.sides);

    if (this.toss === null) {
      return picked;
    }

    var filtered = $filter('filter')(
      this.sides,
      {
        value: this.toss
      }
    );

    if (filtered.length === 0) {
      console.warn('Invalid value for `toss` - using random value!');
      return picked;
    }

    return filtered[0];
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('diversificationTaskCoin', function(){
    return {
      scope: {
        toss: '=?diversificationTaskCoinToss',
        flip: '=?diversificationTaskCoinFlip',
        onInit: '&diversificationTaskCoinOnInit',
        onStart: '&diversificationTaskCoinOnStart',
        onFinish: '&diversificationTaskCoinOnFinish',
        startSide: '=?diversificationTaskCoinStartSide'
      },
      restrict: 'A',
      transclude: true,
      bindToController: true,
      controller: DiversificationTaskCoin,
      controllerAs: 'diversificationTaskCoinController',
      templateUrl: 'views/directives/tasks/diversification-task-coin.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // BombTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var BombTask = function($scope, $attrs, $element, $injector) {
    var type = $injector.get('TYPE_RISK');
    var user = $injector.get('user');

    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.task = user.getTaskByType(type);
  };

  BombTask.$inject = ['$scope', '$attrs', '$element', '$injector'];

  //
  // PROPERTIES
  //

  // SERVER

  /** @var {object} task Task's resource from server. */
  BombTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} started If the task has started. */
  BombTask.prototype.started = false;

  /** @var {boolean} stopped If the task has stopped. */
  BombTask.prototype.stopped = false;

  /** @var {boolean} hasBomb If bomb is in current collection. */
  BombTask.prototype.hasBomb = false;

  /** @var {boolean} resolved If player has resolved the game. */
  BombTask.prototype.resolved = false;

  /** @var {number} totalBoxes Total boxes of current game. */
  BombTask.prototype.totalBoxes = 0;

  /** @var {number} remainingBoxes Remaining boxes of current game. */
  BombTask.prototype.remainingBoxes = 0;

  /** @var {number} collectedBoxes Collected boxes of current game. */
  BombTask.prototype.collectedBoxes = 0;

  // SETTINGS

  /** @var {number} avg Average of collected boxes from statistics. */
  BombTask.prototype.avg = 12;

  /** @var {number} rows Amount of rows for bomb task. */
  BombTask.prototype.rows = 5;

  /** @var {number} cols Amount of cols for bomb task. */
  BombTask.prototype.cols = 5;

  /** @var {number} interval Timeout for interval in seconds. */
  BombTask.prototype.interval = 1;

  /** @var {boolean} random
   * - If `random` = false, boxes are collected row-wise one-by-one, starting in the top-left corner
   * - If `random` = true, boxes are collected randomly (Fisher-Yates Algorithm)
   * Note that this affects game play independently of `dynamic` property
   */
  BombTask.prototype.random = false;

  /** @var {boolean} dynamic
   * - If `dynamic` = true, one box per time interval is collected automatically
   * - In case of `dynamic` = true, game play is affected by the variables `interval` and `random`
   * - If `dynamic` = false, subjects collect as many boxes as they want by clicking or entering the respective number
   * - In case of `dynamic` = false, game play is affected by the variables `random`
   */
  BombTask.prototype.dynamic = false;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {Void}
   */
  BombTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {Void}
   */
  BombTask.prototype.getPayload = function() {
    return {
      task: this.task,
      json: {
        hasBomb: this.hasBomb,
        collectedBoxes: this.collectedBoxes
      },
      ticketCount: this.getTicketCount()
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  BombTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  BombTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (this.dynamic) {
      return this.stopped;
    }

    if (!this.collectedBoxes) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {Void}
   */
  BombTask.prototype.init = function() {
    this._initMembers();
    this._initMatrix();
    this._initBomb();

    if (!this.dynamic) {
      this.start();
    }
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {Void}
   */
  BombTask.prototype.reset = function() {
    this.init();
  };

  /**
   * Sets `started` flag. If `dynamic` is true,
   * the interval will start to reveal cards.
   *
   * @public
   * @method start
   * @return {Void}
   */
  BombTask.prototype.start = function(index) {
    if (this.dynamic) {
      var $interval = this.$injector.get('$interval');

      this._intIndex = index || 0;

      var me = this;
      var max = this.iterator.length;
      this._intervalId = $interval(
        function(){

          var item = me.iterator[me._intIndex];
          me.update(item,true);

          me._intIndex++;
          if (me._intIndex===max) {
            me.stop();
          }

        },
        this.interval*1000, // = from seconds
        max - this._intIndex // = max iterations
      );
    }

    this.started = true;
  };

  /**
   * Sets `stopped` flag. If `dynamic` is true,
   * the interval will be stopped in addition.
   *
   * @public
   * @method start
   * @return {Void}
   */
  BombTask.prototype.stop = function() {
    if (this.dynamic && this._intervalId) {
      var $interval = this.$injector.get('$interval');
      $interval.cancel(this._intervalId);
    }

    this.stopped = true;
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {Void}
   */
  BombTask.prototype.resolve = function() {
    var $q = this.$injector.get('$q');
    var result = this.onResolve({
      payload: this.getPayload()
    });

    var resolveCard = function(card) {
      card.$$resolved = true;
    };

    var me = this;
    var successCallback = function() {
      angular.forEach(me.collection, resolveCard);
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Calculates final ticket amount by predefined formula.
   *
   * @public
   * @method getTicketCount
   * @return {number}
   */
  BombTask.prototype.getTicketCount = function(){
    if (this.hasBomb) {
      return 1;
    }

    return this.collectedBoxes + 1;
  };

  /**
   * Callback for card click. Updates all
   * related properties for final result.
   *
   * @public
   * @method toggle
   * @param {object} column
   * @param {boolean} active
   * @return {Void}
   */
  BombTask.prototype.toggle = function(column, active) {
    var index = this.collection.indexOf(column);

    if (active) {
      if (index<0) {
        this.collection.push(column);
        this.collectedBoxes++;
      }

      column.$$active = true;
    } else {
      if (index>=0) {
        this.collection.splice(index,1);
        column.$$active = false;
        this.collectedBoxes--;
      }
    }

    if (this.isBomb(column)) {
      this.hasBomb = true;
    }

    var total = this.totalBoxes;
    var collected = this.collectedBoxes;
    this.remainingBoxes = total - collected;
  };

  /**
   * Provides indiviual tracking id for column.
   *
   * @public
   * @method trackId
   * @param {object} column
   * @return {Void}
   */
  BombTask.prototype.trackId = function(column) {
    return column.row + '_' + column.col;
  };

  /**
   * Determines if column is actual bomb.
   *
   * @public
   * @method isBomb
   * @param {object} column
   * @return {Void}
   */
  BombTask.prototype.isBomb = function(column) {
    return angular.equals(this.bomb,column);
  };

  /**
   * Initialzes internal properties.
   *
   * @private
   * @method _initMembers
   * @return {Void}
   */
  BombTask.prototype._initMembers = function() {
    this.collection = [];

    this.hasBomb = false;
    this.started = false;
    this.stopped = false;
    this.resolved = false;

    this.collectedBoxes = 0;
    this.remainingBoxes = 0;
    this.totalBoxes = this.rows * this.cols;
  };

  /**
   * Calculates the actual matrix.
   *
   * @private
   * @method _initMatrix
   * @return {Void}
   */
  BombTask.prototype._initMatrix = function() {
    this.matrix = [];
    this.iterator = [];

    for (var i=0; i<this.rows; i++) {

      var columns = [];
      for( var j=0; j<this.cols; j++ ) {
        var data = {
          row: i+1,
          col: j+1
        };

        columns.push(data);

        if (this.dynamic) {
          if (!this.random) {
            this.iterator.push(data);
          } else {
            var random = this.$injector.get('random');
            random.push(this.iterator,data);
          }
        }
      }

      this.matrix.push(columns);
    }
  };

  /**
   * Initializes bomb's actual location.
   *
   * @private
   * @method _initBomb
   * @return {Void}
   */
  BombTask.prototype._initBomb = function() {
    var random = this.$injector.get('random');

    var row = random.between(0,this.rows-1);
    var col = random.between(0,this.cols-1);

    this.bomb = this.matrix[row][col];
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('bombTask',function(){
    return {
      scope: {
        avg: '=?bombTaskAvg',
        rows: '=?bombTaskRows',
        cols: '=?bombTaskCols',
        random: '=?bombTaskRandom',
        dynamic: '=?bombTaskDynamic',
        interval: '=?bombTaskInterval',
        onResolve: '&bombTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: BombTask,
      bindToController: true,
      controllerAs: 'bombTaskController',
      templateUrl: 'views/directives/tasks/bomb-task.html'
    };
  });

  // --------------------------------------------------
  // BombTask Card
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var BombTaskCard = function(){
  };

  //
  // PROPERTIES
  //

  /** @var {string} id Card's accociated model. */
  BombTaskCard.prototype.model = null;

  /** @var {string} isActive If card is active. */
  BombTaskCard.prototype.isActive = false;

  /** @var {string} isDisabled If card is disabled. */
  BombTaskCard.prototype.isDisabled = false;

  /** @var {string} isClickable If card is clickable. */
  BombTaskCard.prototype.isClickable = true;

  //
  // METHODS
  //

  /**
   * Toggles `isActive` if `isDisabled` and
   * `isClickable` allow the action. Invokes
   * `onToggle` callback for consumer.
   *
   * @public
   * @method toggle
   * @return {Void}
   */
  BombTaskCard.prototype.toggle = function() {
    if (this.isDisabled || !this.isClickable) {
      return;
    }

    this.isActive = !this.isActive;

    this.onToggle({
      model:this.model,
      state:this.isActive
    });
  };

  // registry
  angular.module(module).directive('bombTaskCard', function(){
    return {
      scope: {
        model:'=bombTaskCard',
        onToggle:'&bombTaskCardOnToggle',
        isActive:'=?bombTaskCardIsActive',
        isDisabled:'=?bombTaskCardIsDisabled',
        isClickable:'=?bombTaskCardIsClickable'
      },
      restrict: 'A',
      transclude: true,
      controller: BombTaskCard,
      bindToController: true,
      controllerAs: 'bombTaskCardController',
      templateUrl: 'views/directives/tasks/bomb-task-card.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // AnchoringTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var AnchoringTask = function($scope, $element, $attrs, $injector) {
    var type = $injector.get('TYPE_ANCHORING');
    var user = $injector.get('user');

    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.task = user.getTaskByType(type);
    this.group = user.getGroupAsString();
  };

  AnchoringTask.$inject = ['$scope','$element','$attrs', '$injector'];

  //
  // PROPERTIES
  //

  // SERVER

  /** @var {object} task Task's resource from server. */
  AnchoringTask.prototype.task = null;

  // GAMEPLAY

  /** @var {number} choice Currently selected user answer. */
  AnchoringTask.prototype.choice = null;

  /** @var {string} group Current user's group assignment. */
  AnchoringTask.prototype.group = false;

  /** @var {boolean} resolved If player has resolved the game. */
  AnchoringTask.prototype.resolved = false;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   * Sets up event source for listening to
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  AnchoringTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {object}
   */
  AnchoringTask.prototype.getPayload = function() {
    var user = this.$injector.get('user');

    return {
      task: this.task,
      json: {
        group: user.group,
        choice: this.choice
      }
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  AnchoringTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  AnchoringTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (!this.choice) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  AnchoringTask.prototype.init = function() {
    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  AnchoringTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Description.
   *
   * @public
   * @method update
   * @param {number} choice
   * @param {number} selected
   * @return {void}
   */
  AnchoringTask.prototype.update = function(choice, selected){
    this.choice = selected ? choice : null;
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  AnchoringTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');


    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('anchoringTask', function(){
    return {
      scope: {
        onResolve: '&anchoringTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: AnchoringTask,
      bindToController: true,
      controllerAs: 'anchoringTaskController',
      templateUrl: 'views/directives/tasks/anchoring-task.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // MentalBookkeepingTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var MentalBookkeepingTask = function($scope, $element, $attrs, $injector) {
    var type = $injector.get('TYPE_MENTAL_BOOKKEEPING');
    var user = $injector.get('user');

    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.task = user.getTaskByType(type);
    this.group = user.getGroupAsString();
  };

  MentalBookkeepingTask.$inject = ['$scope','$element','$attrs', '$injector'];

  //
  // PROPERTIES
  //

  // SERVER

  /** @var {object} task Task's resource from server. */
  MentalBookkeepingTask.prototype.task = null;

  // GAMEPLAY

  /** @var {number} choice Currently selected user answer. */
  MentalBookkeepingTask.prototype.choice = null;

  /** @var {string} group Current user's group assignment. */
  MentalBookkeepingTask.prototype.group = false;

  /** @var {boolean} resolved If player has resolved the game. */
  MentalBookkeepingTask.prototype.resolved = false;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   * Sets up event source for listening to
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  MentalBookkeepingTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {object}
   */
  MentalBookkeepingTask.prototype.getPayload = function() {
    var user = this.$injector.get('user');

    return {
      task: this.task,
      json: {
        group: user.group,
        choice: this.choice
      }
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  MentalBookkeepingTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  MentalBookkeepingTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (!this.choice) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  MentalBookkeepingTask.prototype.init = function() {
    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  MentalBookkeepingTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Description.
   *
   * @public
   * @method update
   * @param {number} choice
   * @param {number} selected
   * @return {void}
   */
  MentalBookkeepingTask.prototype.update = function(choice, selected){
    this.choice = selected ? choice : null;
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  MentalBookkeepingTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');
    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('mentalBookkeepingTask', function(){
    return {
      scope: {
        onResolve: '&mentalBookkeepingTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      bindToController: true,
      controller: MentalBookkeepingTask,
      controllerAs: 'mentalBookkeepingTaskController',
      templateUrl: 'views/directives/tasks/mental-bookkeeping-task.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // FramingTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var FramingTask = function($scope, $elemnt, $attrs, $injector) {
    var type = $injector.get('TYPE_FRAMING');
    var user = $injector.get('user');

    this.$injector = $injector;
    this.task = user.getTaskByType(type);
  };

  FramingTask.$inject = ['$scope','$element','$attrs', '$injector'];

  // SERVER

  /** @var {object} task Task's resource from server. */
  FramingTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} resolved If player has resolved the game. */
  FramingTask.prototype.resolved = false;

  /** @var {boolean} lotteryA If player opts in for lottery A. */
  FramingTask.prototype.lotteryA = null;

  /** @var {boolean} lotteryB If player opts in for lottery A. */
  FramingTask.prototype.lotteryB = null;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  FramingTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {void}
   */
  FramingTask.prototype.getPayload = function() {
    return {
      task: this.task,
      json: {
        lotteryA: this.lotteryA,
        lotteryB: this.lotteryB
      }
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  FramingTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  FramingTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (this.lotteryA === null) {
      return false;
    }

    if (this.lotteryB === null) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  FramingTask.prototype.init = function() {
    this.lotteryA = null;
    this.lotteryB = null;
    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  FramingTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Updates provided lottery with given state.
   *
   * @public
   * @method update
   * @param {string} lottery
   * @param {boolean} state
   * @return {void}
   */
  FramingTask.prototype.update = function(lottery, state){
    this[lottery] = state;
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  FramingTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');

    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('framingTask', function(){
    return {
      scope: {
        onResolve: '&framingTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: FramingTask,
      bindToController: true,
      controllerAs: 'framingTaskController',
      templateUrl: 'views/directives/tasks/framing-task.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // SavingsTargetTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var SavingsTargetTask = function($scope, $element, $attrs, $injector) {
    var type = $injector.get('TYPE_SAVINGS_TARGET');

    this.$attrs = $attrs;
    this.$scope = $scope;
    this.$element = $element;
    this.$injector = $injector;

    this._flag = false;

    this.user = this.$injector.get('user');
    this.task = this.user.getTaskByType(type);
    this.result = this.user.getPendingByType(type);

    this.storage = this.$injector.get('storage').getProxy();
    this._storageKey = '__savings__target__task__updated__at__';
  };

  SavingsTargetTask.$inject = ['$scope','$element','$attrs', '$injector'];

  // SERVER

  /** @var {object} user Alias to user service. */
  SavingsTargetTask.prototype.user = null;

  /** @var {object} task Task's resource from server. */
  SavingsTargetTask.prototype.task = null;

  /** @var {object} result Task's pending result from server. */
  SavingsTargetTask.prototype.result = null;

  // GAMEPLAY

  /** @var {number} step Current step . */
  SavingsTargetTask.prototype.step = 1;

  /** @var {number} total Players wish for saving target. */
  SavingsTargetTask.prototype.total = 3;

  /** @var {string} wish Players wish for saving target. */
  SavingsTargetTask.prototype.wish = null;

  /** @var {number} amount Players first amount for saving target. */
  SavingsTargetTask.prototype.amount = null;

  /** @var {number} amountRepeated Players second amount for saving target. */
  SavingsTargetTask.prototype.amountRepeated = null;

  /** @var {boolean} resolved If player has resolved the game. */
  SavingsTargetTask.prototype.resolved = false;

  // MISC

  /** @var {object} form Form collecting user input. */
  SavingsTargetTask.prototype.form = null;

  /** @var {number} minAmount Minimum amount for `amount` input. */
  SavingsTargetTask.prototype.minAmount = 1;

  /** @var {number} maxAmount Maximum amount for `amount` input. */
  SavingsTargetTask.prototype.maxAmount = 999;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  SavingsTargetTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {void}
   */
  SavingsTargetTask.prototype.getPayload = function() {
    var payload = {
      task: this.task,
      json: {
        step: this.step,
        wish: this.wish,
        total: this.total,
        amount: this.amount,
        amountRepeated: this.amountRepeated
      },
      isPending: this.amountRepeated === null
    };

    if (this.result !== null) {
      payload = angular.extend(
        this.result,
        payload
      );
    }

    return payload;
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  SavingsTargetTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    // if result was created and
    // we are waiting for paused
    // state, we skip unlocking
    // by using internal `_flag`
    if (this.task.isActive) {
      return this._flag;
    }

    // reset `_flag` as soon as
    // `isActive` changed again
    this.storage.removeItem(
      this._storageKey
    );

    this._flag = false;
    return true;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  SavingsTargetTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.form.$invalid) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  SavingsTargetTask.prototype.init = function() {
    if (this.result !== null) {
      var json = this.result.json;

      // set flag only if still waiting for `isActive` change
      var updatedAt = this.storage.getItem(this._storageKey);
      if (angular.isNumber(updatedAt)) {
        this._flag = updatedAt >= this.task.updatedAt;
      }

      // amount repeated cannot be desisted cause it's the
      // condition in last step before setting `isPending`
      this.amount = json.amount;
      this.total = json.total;
      this.wish = json.wish;
      this.step = json.step;
    }

    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  SavingsTargetTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Increases `step` and invokes `resolve()`.
   *
   * @public
   * @method update
   * @return {void}
   */
  SavingsTargetTask.prototype.update = function(){
    if (this.step < this.total) {
      this.step++;
    }

    if (!this.canResolve()) {
      return;
    }

    var me = this;
    var successCallback = function(){};
    var failureCallback = function(){
      me.step--;
    };

    this.resolve().then(
      successCallback,
      failureCallback
    );
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  SavingsTargetTask.prototype.resolve = function(){
    var notification = this.$injector.get('notification');
    var i18n = this.$injector.get('i18n');
    var $q = this.$injector.get('$q');

    var callback = this.result === null ?
      this.onResolve :
      this.onUpdate;

    var result = callback({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function(result) {
      if (result.isPending) {
        if (me.step < me.total) {
          var message = i18n.get('Thank you for your input!');
          notification.success(message);
        }

        me.result = result;
        me.storage.setItem(
          me._storageKey,
          me.task.updatedAt
        );
        me._flag = true;
        return;
      }

      me.resolved = true;
    };

    var failureCallback = function() {
    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Calculates difference between `amount` and `amountRepeated`.
   *
   * @public
   * @method getDifference
   * @return {void}
   */
  SavingsTargetTask.prototype.getDifference = function(){
    return this.amountRepeated - this.amount;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('savingsTargetTask', function(){
    return {
      scope: {
        onUpdate: '&savingsTargetTaskOnUpdate',
        onResolve: '&savingsTargetTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: SavingsTargetTask,
      bindToController: true,
      controllerAs: 'savingsTargetTaskController',
      templateUrl: 'views/directives/tasks/savings-target-task.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // SelfCommitmentTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var SelfCommitmentTask = function($scope, $elemnt, $attrs, $injector) {
    var type = $injector.get('TYPE_SELF_COMMITMENT');
    var user = $injector.get('user');

    this.$injector = $injector;
    this.task = user.getTaskByType(type);
  };

  SelfCommitmentTask.$inject = ['$scope','$element','$attrs', '$injector'];

  // SERVER

  /** @var {object} task Task's resource from server. */
  SelfCommitmentTask.prototype.task = null;

  // GAMEPLAY

  /** @var {boolean} resolved If player has resolved the game. */
  SelfCommitmentTask.prototype.resolved = false;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  SelfCommitmentTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {void}
   */
  SelfCommitmentTask.prototype.getPayload = function() {
    return {
      task: this.task,
      json: {}
    };
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  SelfCommitmentTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  SelfCommitmentTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  SelfCommitmentTask.prototype.init = function() {
    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  SelfCommitmentTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Description.
   *
   * @public
   * @method update
   * @return {void}
   */
  SelfCommitmentTask.prototype.update = function(){
    this.resolve();
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  SelfCommitmentTask.prototype.resolve = function(){
    var $q = this.$injector.get('$q');

    var result = this.onResolve({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function() {
      me.resolved = true;
    };
    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('selfCommitmentTask', function(){
    return {
      scope: {
        onResolve: '&selfCommitmentTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      bindToController: true,
      controller: SelfCommitmentTask,
      controllerAs: 'selfCommitmentTaskController',
      templateUrl: 'views/directives/tasks/self-commitment-task.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular, moment */
/* jshint bitwise: false */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // ProcrastinationTask
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ProcrastinationTask = function($scope, $elemnt, $attrs, $injector) {
    var type = $injector.get('TYPE_PROCRASTINATION');
    var user = $injector.get('user');

    this.$injector = $injector;
    this.task = user.getTaskByType(type);
    this.result = user.getPendingByType(type);

    this.domId = 'procrastination-task-' + $scope.$id;

    this._intervalId = null;
    this._onInterval = this._onInterval.bind(this);
  };

  ProcrastinationTask.$inject = ['$scope','$element','$attrs', '$injector'];

  // SERVER

  /** @var {string} type Task's `type` property from server. */
  ProcrastinationTask.prototype.type = null;

  /** @var {object} task Task's resource from server. */
  ProcrastinationTask.prototype.task = null;

  /** @var {object} result Task's pending result from server. */
  ProcrastinationTask.prototype.result = null;

  // GAMEPLAY

  /** @var {string} mode One of `ALL` or `SPLIT`. */
  ProcrastinationTask.prototype.mode = null;

  /** @var {number} rounds Current game round count. */
  ProcrastinationTask.prototype.count = 0;

  /** @var {number} total Total rounds depends on `mode`. */
  ProcrastinationTask.prototype.total = 1;

  /** @var {array} rounds Results of single game rounds. */
  ProcrastinationTask.prototype.rounds = [];

  /** @var {number} openRounds Number of left rounds to play. */
  ProcrastinationTask.prototype.openRounds = null;

  /** @var {number} minCatched Minimum catched bubbles depends on `mode`. */
  ProcrastinationTask.prototype.minCatched = null;

  /** @var {number} maxEscaped Maximum escaped bubbles depends on `mode`. */
  ProcrastinationTask.prototype.maxEscaped = null;

  /** @var {number} updatedAt When last result was written. */
  ProcrastinationTask.prototype.updatedAt = null;

  /** @var {number} invalidAt When task will be unresolvable. */
  ProcrastinationTask.prototype.invalidAt = null;

  /** @var {string} state One of `IDLE`, `DECISION`, `PLAYING`. */
  ProcrastinationTask.prototype.state = 'IDLE';

  /** @var {boolean} resolved If player has resolved the game. */
  ProcrastinationTask.prototype.resolved = false;

  // MISC

  /** @var {string} domId Unique dom id for this task for scrolling purposes. */
  ProcrastinationTask.prototype.domId = null;

  /** @var {boolean} warmup If dry-run has been finished. */
  ProcrastinationTask.prototype.hasWarmup = false;

  /** @var {number} warmupMaxEscaped Maximum escaped bubbles for demo mode. */
  ProcrastinationTask.prototype.warmupMaxEscaped = 2;

  /** @var {number} warmupMinCatched Minimum catched bubbles for demo mode. */
  ProcrastinationTask.prototype.warmupMinCatched = 20;

  //
  // METHODS
  //

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  ProcrastinationTask.prototype.$onInit = function() {
    this.init();
  };

  /**
   * Proxies to `init()` if controller's ready.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  ProcrastinationTask.prototype.$onDestroy = function() {
    var $interval = this.$injector.get('$interval');

    if (this._intervalId !== null) {
      $interval.cancel(this._intervalId);
    }
  };

  /**
   * Retrieves result payload for server.
   *
   * @public
   * @method getPayload
   * @return {void}
   */
  ProcrastinationTask.prototype.getPayload = function() {
    var payload = {
      task: this.task,
      json: {
        mode: this.mode,
        state: this.state,
        rounds: this.rounds,
        success: this.hasSuccess()
      },
      isPending: this._isPending(),
      ticketCount: this.getTicketCount()
    };

    if (this.result !== null) {
      payload = angular.extend(
        this.result,
        payload
      );
    }

    return payload;
  };

  /**
   * Whether or not task is currently locked.
   *
   * @public
   * @method isLocked
   * @return {boolean}
   */
  ProcrastinationTask.prototype.isLocked = function() {
    if (this.task === null) {
      return true;
    }

    return !this.task.isActive;
  };

  /**
   * Whether or not task can be sent to server.
   *
   * @public
   * @method canResolve
   * @return {boolean}
   */
  ProcrastinationTask.prototype.canResolve = function() {
    var user = this.$injector.get('user');
    if (!user.isUser()) {
      return false;
    }

    if (this.isLocked()) {
      return false;
    }

    if (this.resolved) {
      return false;
    }

    if (!this.hasWarmup) {

    }

    return true;
  };

  /**
   * Sets up initial state.
   *
   * @public
   * @method init
   * @return {void}
   */
  ProcrastinationTask.prototype.init = function() {
    // check for pending result
    if (this.result !== null) {
      var json = this.result.json;

      // 1) apply round / count
      this.rounds = json.rounds;
      this.count = json.rounds.length;

      // 2) call setters only now
      this.setMode(json.mode);
      this.setState(json.state);
    }

    this.resolved = false;
  };

  /**
   * Resets initial state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  ProcrastinationTask.prototype.reset = function(){
    this.init();
  };

  /**
   * Description.
   *
   * @public
   * @method update
   * @return {void}
   */
  ProcrastinationTask.prototype.update = function(result){
    switch (this.state) {
      case 'IDLE':
        this.setState('DECISION');
        break;

      case 'DECISION':
        this.setState('PLAYING');
        break;

      case 'PLAYING':
        this.count = this.rounds.push(result);
        break;
      default:
    }

    if (!this.canResolve()) {
      return;
    }

    this.resolve();
  };

  /**
   * Sets `resolved` flag. Calls `onResolve`
   * callback with JSON result for consumer.
   *
   * @public
   * @method resolve
   * @return {void}
   */
  ProcrastinationTask.prototype.resolve = function(){
    var notification = this.$injector.get('notification');
    var i18n = this.$injector.get('i18n');
    var $q = this.$injector.get('$q');

    var callback = this.result === null ?
      this.onResolve :
      this.onUpdate;

    var result = callback({
      payload: this.getPayload()
    });

    var me = this;
    var successCallback = function(result) {
      var message;

      if (result.isPending) {
        me.result = result;

        switch (me.state) {
          case 'IDLE': break;
          case 'DECISION': break;
          case 'PLAYING':
            switch (me.mode) {
              case 'ALL': break;
              case 'SPLIT':
                if (me.count > 0) {
                  message = i18n.get(
                    'Super, you have succeeded exercise %s of %s!',
                    me.count,
                    me.total
                  );
                  notification.success(message);
                }
                break;
              default:
                break;
            }
            break;
          default:
        }

        return;
      }

      if (!me.hasSuccess()) {
        message = i18n.get('Sorry, but the time has expired for this exercise and you retrieve only 1 ticket!');
        notification.error(message);
      } else {
        message = i18n.get('Super, you have successfully done this exercise and retrieve 5 tickets!');
        notification.success(message);
      }

      me.resolved = true;
    };

    var failureCallback = function() {

    };

    var promise = $q.when(result);
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Sets game mode to `ALL` or `SPLIT`.
   *
   * @public
   * @method setMode
   * @param {string} mode
   * @return {void}
   */
  ProcrastinationTask.prototype.setMode = function(mode){
    switch (mode) {
      case 'ALL':
        this.total = 1;
        this.maxEscaped = 15;
        this.minCatched = 150;
        break;
      case 'SPLIT':
        this.total = 3;
        this.maxEscaped = 5;
        this.minCatched = 50;
        break;
      default:
        return;
    }

    this.mode = mode;
    this.openRounds = this.total - this.count;
  };

  /**
   * Sets game state to `IDLE`, `DECISION` or `PLAYING`.
   *
   * @public
   * @method setState
   * @param {string} state
   * @return {void}
   */
  ProcrastinationTask.prototype.setState = function(state){
    var $interval = this.$injector.get('$interval');

    switch (state) {
      case 'IDLE':
        break;
      case 'DECISION':
        break;
      case 'PLAYING':
        var updatedAt = this.result.updatedAt;
        this.updatedAt = moment.unix(updatedAt);
        this.invalidAt = this.updatedAt.clone();

        switch (this.mode) {
          case 'ALL':
            this.invalidAt.add(6, 'weeks');
            break;
          case 'SPLIT':
            this.invalidAt.add(2, 'weeks');
            break;
          default:
        }

        this._intervalId = $interval(this._onInterval, 1000);

        break;
      default:
        return;
    }

    this.state = state;
  };

  /**
   * Sets `hasWarmup` flag after dry run.
   *
   * @public
   * @method setWarmup
   * @param {boolean} warmup
   * @return {void}
   */
  ProcrastinationTask.prototype.setWarmup = function(warmup){
    this.hasWarmup = warmup;
  };

  /**
   * Whether or not task is actually invalid.
   *
   * @public
   * @method isInvalid
   * @return {boolean}
   */
  ProcrastinationTask.prototype.isInvalid = function() {
    if (this.invalidAt === null) {
      return false;
    }

    return this._now().isAfter(this.invalidAt);
  };

  /**
   * If amount of results corresponds to `total`.
   *
   * @public
   * @method hasSuccess
   * @return {boolean}
   */
  ProcrastinationTask.prototype.hasSuccess = function() {
    return this.rounds.length === this.total;
  };

  /**
   * Retrieves the current played round.
   *
   * @public
   * @method getCurrentRound
   * @return {string}
   */
  ProcrastinationTask.prototype.getCurrentRound = function(){
    return this.count + 1;
  };

  /**
   * Calculates remaining time for finishing
   * this task depending on chosen game mode.
   *
   * @public
   * @method getRemainingTime
   * @return {string}
   */
  ProcrastinationTask.prototype.getRemainingTime = function(){
    var string = this.$injector.get('string');
    var i18n = this.$injector.get('i18n');

    if (this.invalidAt === null) {
      return '';
    }

    var difference = this.invalidAt.diff(this._now());
    var duration = moment.duration(difference);

    var seconds = ~~duration.asSeconds();
    var minutes = ~~duration.asMinutes();
    var hours = ~~duration.asHours();
    var days = ~~duration.asDays();
    var value, keys;

    if (days > 0) {
      value = days;
      keys = ['day', 'days'];
    } else if (hours > 0) {
      value = hours;
      keys = ['hour', 'hours'];
    } else if (minutes > 0) {
      value = minutes;
      keys = ['minute', 'minutes'];
    } else {
      value = seconds >= 0 ? seconds : 0;
      keys = ['second', 'seconds'];
    }

    var key = value === 1 ?
      keys[0] :
      keys[1];

    var unit = i18n.get(key);

    return string.sprintf('%s %s', value, unit);
  };

  /**
   * Calculates final ticket amount by predefined formula.
   *
   * @public
   * @method getTicketCount
   * @return {number}
   */
  ProcrastinationTask.prototype.getTicketCount = function(){
    if (this.hasSuccess()) {
      return 5;
    }

    return 1;
  };

  /**
   * Interval callback for checking invalidation.
   *
   * @private
   * @method _onInterval
   * @return {boolean}
   */
  ProcrastinationTask.prototype._onInterval = function() {
    var $interval = this.$injector.get('$interval');
    if (!this.isInvalid() || !this.canResolve()) {
      return;
    }

    $interval.cancel(this._intervalId);
    this.count = this.total;
    this.resolve();
  };

  /**
   * Whether or not task is currently pending.
   *
   * @private
   * @method _isPending
   * @return {boolean}
   */
  ProcrastinationTask.prototype._isPending = function() {
    return this.count < this.total;
  };

  /**
   * Gets the current timestamp as moment.
   *
   * @private
   * @method _now
   * @return {object}
   */
  ProcrastinationTask.prototype._now = function() {
    /*
    if (!this._testInvalidation) {
      this._testInvalidation = this.invalidAt.clone().subtract(3, 'seconds')
    } else {
      this._testInvalidation.add(1, 'second');
    }
    return this._testInvalidation;
    */
    return moment();
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('procrastinationTask', function(){
    return {
      scope: {
        onUpdate: '&procrastinationTaskOnUpdate',
        onResolve: '&procrastinationTaskOnResolve'
      },
      restrict: 'A',
      transclude: true,
      controller: ProcrastinationTask,
      bindToController: true,
      controllerAs: 'procrastinationTaskController',
      templateUrl: 'views/directives/tasks/procrastination-task.html'
    };
  });

  // --------------------------------------------------
  // ProcrastinationTask Game
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ProcrastinationTaskGame = function($scope,$element,$attrs,$injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.domId = 'viewport-' + $scope.$id;

    this._nextId = 0;
    this._tapped = 0;
    this._rounds = 0;
    this._retries = 0;
    this._timeout = 100;
    this._requestId = null;

    this._loop = this._loop.bind(this);
    this._update = this._update.bind(this);
    this._resize = this._resize.bind(this);

    this._window = angular.element(window);
    this._viewport = this.$element.find('.viewport');
  };

  ProcrastinationTaskGame.$inject = ['$scope','$element','$attrs','$injector'];

  //
  // PROPERTIES
  //

  /** @var {number} catched Count of catched bubbles. */
  ProcrastinationTaskGame.prototype.catched = 0;

  /** @var {number} escaped Count of escaped bubbles. */
  ProcrastinationTaskGame.prototype.escaped = 0;

  /** @var {number} accuracy Players scoring accuracy. */
  ProcrastinationTaskGame.prototype.accuracy = 0;

  /** @var {object} bubbles Hash map keeping bubble objects. */
  ProcrastinationTaskGame.prototype.bubbles = {};

  /** @var {object} viewport Viewport holding dimensions and offsets. */
  ProcrastinationTaskGame.prototype.viewport = {};

  /** @var {boolean} state One of `IDLE`, `RUNNING`, `TIMEOUT`, `GAME_OVER` or `GAME_DONE`. */
  ProcrastinationTaskGame.prototype.state = 'IDLE';

  /** @var {boolean} expired Flag for expiring current game while its running. */
  ProcrastinationTaskGame.prototype.expired = false;

  /** @var {number} maxRounds Maximum number of rounds after `GAME_DONE`. */
  ProcrastinationTaskGame.prototype.maxRounds = 1;

  /** @var {number} maxRounds Maximum number of retries after `GAME_OVER`. */
  ProcrastinationTaskGame.prototype.maxRetries = Number.POSITIVE_INFINITY;

  /** @var {number} maxEscaped Maximum amount of escaped bubbles for `GAME_OVER`. */
  ProcrastinationTaskGame.prototype.maxEscaped = 15;

  /** @var {number} maxEscaped Maximum amount of escaped bubbles for `GAME_DONE`. */
  ProcrastinationTaskGame.prototype.minCatched = 150;

  /** @var {string} bubbleDelay Timeout until next bubble will appear on viewport. */
  ProcrastinationTaskGame.prototype.bubbleDelay = 100;

  //
  // METHODS
  //

  /**
   * Sets up event listeners and animation frame.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.$onInit = function() {
    this._window.on('resize', this._resize);
    this._resize();

    var me = this;
    this._unwatch = this.$scope.$watch(
      function() {
        return me.expired;
      },
      function(isExpired) {
        if (isExpired) {
          me.expire();
        }
      }
    );
  };

  /**
   * Removes event listener and animation frame.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.$onDestroy = function() {
    this._window.off('resize', this._resize);
  };

  /**
   * Invokes game loop and sets `RUNNING` state.
   *
   * @public
   * @method start
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.start = function() {
    this._loop();
    this.state = 'RUNNING';
  };

  /**
   * Stops and sets `GAME_OVER` state.
   *
   * @public
   * @method gameOver
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.quit = function() {
    this._unloop();

    this._retries++;

    this.bubbles = {};
    this.state = 'GAME_OVER';

    var result = this._getResult();
    this.onGameOver({ result: result });
  };

  /**
   * Stops and sets `FINISHED` state.
   *
   * @public
   * @method done
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.done = function() {
    this._unloop();

    this._rounds++;

    this.bubbles = {};
    this.state = 'GAME_DONE';

    var result = this._getResult();
    this.onGameDone({ result: result });
  };

  /**
   * Stops and sets `TIMEOUT` state.
   *
   * @public
   * @method expire
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.expire = function() {
    this._unloop();

    this.bubbles = {};
    this.state = 'TIMEOUT';
  };

  /**
   * Resets game and sets `IDLE` state.
   *
   * @public
   * @method reset
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.reset = function() {
    this._unloop();

    this._nextId = 0;
    this._tapped = 0;
    this._timeout = 100;
    this._requestId = null;

    this.catched = 0;
    this.escaped = 0;
    this.accuracy = 0;
    this.state = 'IDLE';
  };

  /**
   * Initializes
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.onClick = function($event) {
    switch (this.state) {
      case 'IDLE':
        this.start();
        break;
      case 'RUNNING':
        this._tapped++;

        var target = $event.target;
        var viewport = this._viewport.get(0);

        // only update accuracy immediately if
        // clicked on viewport, otherwise this
        // will be done after bubble animation!
        if (viewport.id === target.id) {
          this._setAccuracy();
        }

        break;
      case 'TIMEOUT':
        // noop - disabled
        break;
      case 'GAME_OVER':
        if (this.canRetry()) {
          this.reset();
          this.start();
        }

        break;
      case 'GAME_DONE':
        if (this.canRestart()) {
          this.reset();
          this.start();
        }

        break;
      default:
    }
  };

  /**
   * True if player can retry game after `GAME_OVER`.
   *
   * @public
   * @method canRetry
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.canRetry = function() {
    return this._retries < this.maxRetries;
  };

  /**
   * True if player can retry game after `GAME_OVER`.
   *
   * @public
   * @method canRestart
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.canRestart = function() {
    return this._rounds < this.maxRounds;
  };

  /**
   * Adds bubble controller to internal hash.
   *
   * @public
   * @method addBubble
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.addBubble = function(bubble) {
    this.bubbles[bubble.id] = bubble;
  };

  /**
   * Removes bubble, update counters and checks game state.
   *
   * @public
   * @method removeBubble
   * @return {void}
   */
  ProcrastinationTaskGame.prototype.removeBubble = function(bubble) {
    // don't remove twice ($onDestroy)
    if (!this.bubbles[bubble.id]) {
      return;
    }

    // catched - check min count
    if (bubble.catched) {
      this.catched++;

      // update accuracy
      this._setAccuracy();

      var min = this.minCatched;
      if (this.catched >= min) {
        this.done();
      }
    }

    // escaped - check max count
    if (bubble.escaped) {
      this.escaped++;

      var max = this.maxEscaped;
      if (this.escaped >= max) {
        this.quit();
      }
    }

    delete this.bubbles[bubble.id];
  };

  /**
   * Actual gaming loop for animation frame.
   *
   * @private
   * @method _loop
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._loop = function() {
    var animation = this.$injector.get('animation');

    this._requestId = animation.requestAnimationFrame(this._loop);
    this.$scope.$evalAsync(this._update);
  };

  /**
   * Removes current animation frame.
   *
   * @public
   * @method stop
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._unloop = function() {
    var animation = this.$injector.get('animation');
    animation.cancelAnimationFrame(this._requestId);
  };

  /**
   * Animation frame callback handling creation of new
   * bubbles being rendered and propagates `update()`.
   *
   * @private
   * @method _update
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._update = function() {
    var random = this.$injector.get('random');

    this._timeout--;
    if (this._timeout === 0 ) {
      this._timeout = random.between(0, this.bubbleDelay) + 25;
      this.bubbles[this._nextId++] = null;
    }

    for (var id in this.bubbles) {
      var bubble = this.bubbles[id];
      if (!bubble) {
        continue;
      }

      bubble.update();
    }
  };

  /**
   * Sets up new `ratio` of viewport and propages `resize()`.
   *
   * @private
   * @method resize
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._resize = function() {
    this.viewport = this._getViewport();

    var height = this.viewport.height;
    var width = this.viewport.width;

    this.ratio = width / height;

    for (var id in this.bubbles) {
      var bubble = this.bubbles[id];
      if (!bubble) {
        continue;
      }

      bubble.resize();
    }
  };

  /**
   * Gets result payload for game callbacks.
   *
   * @private
   * @method _getResult
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._getResult = function() {
    return {
      catched: this.catched,
      escaped: this.escaped,
      accuracy: this.accuracy
    };
  };

  /**
   * Calculates and sets `accuracy` property.
   *
   * @private
   * @method _setAccuracy
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._setAccuracy = function() {
    this.accuracy = this.catched / this._tapped;
  };

  /**
   * Gets viewport dimensions and offsets.
   *
   * @private
   * @method _getViewport
   * @return {void}
   */
  ProcrastinationTaskGame.prototype._getViewport = function() {
    var width = this._viewport.width();
    var height = this._viewport.height();
    var top = this._viewport.scrollTop();
    var left = this._viewport.scrollLeft();

    return {
      top: top,
      left: left,
      width: width,
      height: height,
      right: left + width,
      bottom: top + height
    };
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('procrastinationTaskGame', function(){
    return {
      scope: {
        expired: '=?procrastinationTaskGameExpired',
        maxRounds: '=?procrastinationTaskGameMaxRounds',
        maxRetries: '=?procrastinationTaskGameMaxRetries',
        onGameDone: '&procrastinationTaskGameOnGameDone',
        onGameOver: '&procrastinationTaskGameOnGameOver',
        minCatched: '=?procrastinationTaskGameMinCatched',
        maxEscaped: '=?procrastinationTaskGameMaxEscaped',
        bubbleDelay: '=?procrastinationTaskGameBubbleDelay'
      },
      restrict: 'A',
      transclude: true,
      bindToController: true,
      controller: ProcrastinationTaskGame,
      controllerAs: 'procrastinationTaskGameController',
      templateUrl: 'views/directives/tasks/procrastination-task-game.html'
    };
  });

  // --------------------------------------------------
  // ProcrastinationTask Bubble
  // --------------------------------------------------

  //
  // CONTROLLER
  //

  /**
   * @constructor
   */
  var ProcrastinationTaskBubble = function($scope,$element,$attrs,$injector) {
    this.$scope = $scope;
    this.$attrs = $attrs;
    this.$element = $element;
    this.$injector = $injector;

    this.domId = 'bubble-' + $scope.$id;
  };

  ProcrastinationTaskBubble.$inject = ['$scope','$element','$attrs','$injector'];

  //
  // PROPERTIES
  //

  /** @var {array} themes Predefined themes for bubbles. */
  ProcrastinationTaskBubble.prototype.themes = [
    'theme-1',
    'theme-2',
    'theme-3',
    'theme-4',
    'theme-5'
  ];

  /**

  /** @var {string} class CSS class namem for bubble. */
  ProcrastinationTaskBubble.prototype.class = 'bubble';

  /** @var {object} style Style definitions for bubble. */
  ProcrastinationTaskBubble.prototype.style = {};

  /** @var {string} theme A random theme for bubble. */
  ProcrastinationTaskBubble.prototype.theme = null;

  /** @var {number} radius Radius of bubble. */
  ProcrastinationTaskBubble.prototype.radius = null;

  /** @var {number} radius Animation speed of bubble. */
  ProcrastinationTaskBubble.prototype.speed = null;

  /** @var {number} wave Horizontal swinging intensity. */
  ProcrastinationTaskBubble.prototype.wave = null;

  /** @var {number} x Current x position of bubble. */
  ProcrastinationTaskBubble.prototype.x = null;

  /** @var {number} y Current y position of bubble. */
  ProcrastinationTaskBubble.prototype.y = null;

  //
  // METHODS
  //

  /**
   * Registeres bubble with game controller after inital setup.
   *
   * @public
   * @method $onInit
   * @return {void}
   */
  ProcrastinationTaskBubble.prototype.$onInit = function() {
    var random = this.$injector.get('random');
    var game = this.gameController;

    this.theme = random.pick(this.themes);

    this.radius = random.between(0, 15) + 20;
    this.speed = random.between(0, 2.5)  + 2;
    this.wave = 2 + this.radius;

    this.y = game.viewport.height + random.between(0, 50) + 50;
    this.x = random.between(this.radius, game.viewport.width) - this.radius;

    this._originalR = game.ratio;
    this._originalX = this.x;

    this.style = {
      top: this.y,
      left: this.x,
      width: this.radius * 2,
      height: this.radius * 2
    };

    this.gameController.addBubble(this);
  };

  /**
   * Unregisteres bubble with game controller.
   *
   * @public
   * @method $onDestroy
   * @return {void}
   */
  ProcrastinationTaskBubble.prototype.$onDestroy = function() {
    this.gameController.removeBubble(this);
  };

  /**
   * Updates `x` and `y` coordinates and applies style.
   *
   * @public
   * @method update
   * @return {void}
   */
  ProcrastinationTaskBubble.prototype.update = function() {
    var sin = Math.sin(new Date().getTime() * 0.002);
    this.x = this.wave * sin + this._originalX;
    this.y = this.y - this.speed;

    this.style.left = this.x;
    this.style.top = this.y;

    var offscreenY = -this.radius * 2;
    if (this.y > offscreenY) {
      return;
    }

    this.escaped = true;
    this.gameController.removeBubble(this);
  };

  /**
   * Updates `x` coordinate according to new ratio.
   *
   * @public
   * @method resize
   * @return {void}
   */
  ProcrastinationTaskBubble.prototype.resize = function() {
    var $timeout = this.$injector.get('$timeout');

    var me = this;
    var timeout = function() {
      var ratio = me.gameController.ratio;
      var move = ratio / me._originalR;

      me._originalX *= move;
      me._resizeId = null;
    };

    if (this._resizeId) {
      $timeout.cancel(this._resizeId);
    }

    this._resizeId = $timeout(timeout, 250);
  };

  /**
   *
   *
   * @public
   * @method onClick
   * @return {void}
   */
  ProcrastinationTaskBubble.prototype.onClick = function() {
    var animation = this.$injector.get('animation');
    var $timeout = this.$injector.get('$timeout');
    var endEvent = animation.animationEndEvent;

    var me = this;

    var evalAsync = function() {
      me.gameController.removeBubble(me);
    };

    var onAnimationEnd = function() {
      me.$scope.$evalAsync(evalAsync);
      me.$element.off(endEvent, onAnimationEnd);
    };

    if (event) {
      this.$element.on(endEvent, onAnimationEnd);
    } else {
      $timeout(evalAsync, 50);
    }

    this.catched = true;
  };

  //
  // REGISTRY
  //
  angular.module(module).directive('procrastinationTaskBubble', function(){
    return {
      scope: {
        id: '=procrastinationTaskBubble'
      },
      restrict: 'A',
      transclude: true,
      require: {
        'gameController': '^procrastinationTaskGame'
      },
      bindToController: true,
      controller: ProcrastinationTaskBubble,
      controllerAs: 'procrastinationTaskBubbleController',
      templateUrl: 'views/directives/tasks/procrastination-task-bubble.html'
    };
  });

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

 /**
  * @constructor
  */
  var LoginFrontend = function($scope, $injector) {
    this.$injector = $injector;
    this.$scope = $scope;
  };

  LoginFrontend.$inject = ['$scope', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {string} code Workshop code for authentication. */
  LoginFrontend.prototype.code = null;

  /** @var {string} username User name for authentication. */
  LoginFrontend.prototype.username = null;

  /** @var {RegExp} codeMinLength Minimum length of password. */
  LoginFrontend.prototype.codeMinLength = 8;

  /** @var {RegExp} codePattern Regular expression for `username` property. */
  LoginFrontend.prototype.codePattern = /^[A-Za-z0-9]+$/;

  /** @var {RegExp} userpattern Regular expression for `username` property. */
  LoginFrontend.prototype.userpattern = /^[A-Za-z][A-Za-z](?:0[1-9]|[12]\d|3[01])[A-Za-z]\d$/;

  //
  // METHODS
  //

  /**
   * Signs a user in with personal code to gather JWT token.
   *
   * @public
   * @method signin
   * @return {Void}
   */
  LoginFrontend.prototype.signin = function()
    {
      var notification = this.$injector.get('notification');
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');
      var i18n = this.$injector.get('i18n');

      var form = this.$scope.loginForm;
      if (form.$invalid) {
        return;
      }

      var successCallback = function()
      {
        var message = i18n.get('You have successfully signed in!');
        notification.success(message);
        $state.go('frontend');
      };

      var failureCallback = function()
      {
        // @see: httpInterceptor
      };

      auth.signin({
        username: this.username
      }, 'frontend').then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Signs a user up with personal and workshop code.
   *
   * @public
   * @method signup
   * @return {Void}
   */
  LoginFrontend.prototype.signup = function()
    {
      var notification = this.$injector.get('notification');
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');
      var i18n = this.$injector.get('i18n');

      var form = this.$scope.loginForm;
      if (form.$invalid) {
        return;
      }

      var successCallback = function()
      {
        var message = i18n.get('You have successfully signed up!');
        notification.success(message);
        $state.go('frontend');
      };

      var failureCallback = function()
      {
        // @see: httpInterceptor
      };

      auth
        .signup({
          username: this.username,
          password: this.code
        }, 'frontend').then(
          successCallback,
          failureCallback
        );
    };

  angular.module(module).controller('LoginFrontendController', LoginFrontend);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

 /**
  * @constructor
  */
  var LoginBackend = function($scope, $injector) {
    this.$injector = $injector;
    this.$scope = $scope;
  };

  LoginBackend.$inject = ['$scope', '$injector'];

  //
  // PROPERTIES
  //

  /** @var {string} username Username for authentication. */
  LoginBackend.prototype.username = null;

  /** @var {string} workshop Password for authentication. */
  LoginBackend.prototype.password = null;

  /** @var {RegExp} usernameMinLength Minimum length of username. */
  LoginBackend.prototype.usernameMinLength = 5;

  /** @var {RegExp} passwordMinLength Minimum length of password. */
  LoginBackend.prototype.passwordMinLength = 4;

  /** @var {RegExp} passwordMaxLength Maximum length of password. */
  LoginBackend.prototype.passwordMaxLength = 4096;

  //
  // METHODS
  //

  /**
   * Signs an admin in with username and password.
   *
   * @public
   * @method signin
   * @return {Void}
   */
  LoginBackend.prototype.signin = function()
    {
      var notification = this.$injector.get('notification');
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');
      var i18n = this.$injector.get('i18n');

      var form = this.$scope.loginForm;
      if (form.$invalid) {
        return;
      }

      var successCallback = function()
      {
        var message = i18n.get('You are logged in now!');
        notification.success(message);
        $state.go('backend');
      };

      var failureCallback = function()
      {
        // @see: httpInterceptor
      };

      auth.signin({
        username: this.username,
        password: this.password
      }, 'backend').then(
        successCallback,
        failureCallback
      );
    };

  angular.module(module).controller('LoginBackendController', LoginBackend);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

 /**
  * @constructor
  */
  var Contact = function($scope, $injector) {
    this.$injector = $injector;
    this.$scope = $scope;
  };

  Contact.$inject = ['$scope','$injector'];

  //
  // PROPERTIES
  //

  /** @var {string} name Name of contact. */
  Contact.prototype.name = null;

  /** @var {string} email Email of contact. */
  Contact.prototype.email = null;

  /** @var {string} subject Subject of contact. */
  Contact.prototype.subject = null;

  /** @var {string} message Message of contact. */
  Contact.prototype.message = null;

  /** @var {string} messageMinLength Message minmimum length. */
  Contact.prototype.messageMinLength = 25;

  //
  // METHODS
  //

  /**
   * Sends an email from contact form to admins.
   *
   * @public
   * @method submit
   * @return {Void}
   */
  Contact.prototype.submit = function()
    {
      var mail = this.$injector.get('mail');
      var form = this.$scope.contactForm;
      if (form.$invalid) {
        return;
      }

      var me = this;

      var successCallback = function()
      {
        me.reset();
      };

      var failureCallback = function()
      {
        // @see: httpInterceptor
      };

      mail.send({
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message
      }).then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Resets all form inputs to initial state.
   *
   * @public
   * @method reset
   * @return {Void}
   */
  Contact.prototype.reset = function()
    {
      this.name = null;
      this.email = null;
      this.subject = null;
      this.message = null;
    };

  angular.module(module).controller('ContactController', Contact);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

 /**
  * @constructor
  */
  var Frontend = function($injector) {
    this.$injector = $injector;

    this.user = this.$injector.get('user');
  };

  Frontend.$inject = ['$injector'];

  //
  // PROPERTIES
  //

  /** @var {object} user User service object. */
  Frontend.prototype.user = null;

  //
  // METHODS
  //

  /**
   * Creates a new result resource from task payload.
   *
   * @public
   * @method createResult
   * @param {object} payload
   * @return {Void}
   */
  Frontend.prototype.createResult = function(payload)
  {
    var Result = this.$injector.get('Result');
    var user = this.$injector.get('user');

    var successCallback = function(result)
      {
        // update user object from response
        // handling comparisons for `state`,
        // `tickets` and showing messages
        user.update(result);
      };

    var failureCallback = function()
      {
        // noop
      };

    var result = new Result(payload);
    var promise = result.$create();
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Updates a new result resource from task `result`.
   *
   * @public
   * @method updateResult
   * @param {object} result
   * @return {Void}
   */
  Frontend.prototype.updateResult = function(payload)
  {
    var Result = this.$injector.get('Result');
    var user = this.$injector.get('user');

    var successCallback = function(result)
      {
        // update user object from response
        // handling comparisons for `state`,
        // `tickets` and showing messages
        user.update(result);
      };

    var failureCallback = function()
      {
        // noop
      };

    var promise = Result.update({ id: payload.id }, payload).$promise;
    promise.then(
      successCallback,
      failureCallback
    );

    return promise;
  };

  /**
   * Destroys user session and redirects to login.
   *
   * @public
   * @method logout
   * @return {Void}
   */
  Frontend.prototype.logout = function()
    {
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');

      var successCallback = function()
        {
          $state.go('login.frontend');
        };

      var failureCallback = function()
        {

        };

      auth.signout().then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Redirects router to state.
   *
   * @public
   * @method goTo
   * @param {string} state
   * @return {Void}
   */
  Frontend.prototype.goTo = function(state)
    {
      var $state = this.$injector.get('$state');

      $state.go(state);
    };

  angular.module(module).controller('FrontendController', Frontend);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

 /**
  * @constructor
  */
  var Backend = function($injector) {
    this.$injector = $injector;
  };

  Backend.$inject = ['$injector'];

  //
  // METHODS
  //

  /**
   * Destroys user session and redirects to login.
   *
   * @public
   * @method logout
   * @return {Void}
   */
  Backend.prototype.logout = function()
    {
      var $state = this.$injector.get('$state');
      var auth = this.$injector.get('auth');

      var successCallback = function()
        {
          $state.go('login.backend');
        };

      var failureCallback = function()
        {

        };

      auth.signout().then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Redirects router to state.
   *
   * @public
   * @method goTo
   * @param {string} state
   * @return {Void}
   */
  Backend.prototype.goTo = function(state)
    {
      var $state = this.$injector.get('$state');

      $state.go(state);
    };

  angular.module(module).controller('BackendController', Backend);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

 /**
  * @constructor
  */
  var Workshop = function($scope, $injector, workshops) {
    this.workshops = workshops;
    this.$injector = $injector;
    this.$scope = $scope;

    this._resultsSource = null;
    this._userSources = {};
    this._workshops = {};
    this._tasks = {};

    this._initWorkshops();
    this._initListener();
  };

  Workshop.$inject = ['$scope', '$injector', 'workshops'];

  //
  // PROPERTIES
  //

  /** @var {string} name Name of new workshop. */
  Workshop.prototype.name = null;

  /** @var {string} code Code of new workshop. */
  Workshop.prototype.code = null;

  /** @var {RegExp} nameMinLength Minimum length of workshop name. */
  Workshop.prototype.nameMinLength = 8;

  /** @var {RegExp} codeMinLength Minimum length of workshop code. */
  Workshop.prototype.codeMinLength = 8;

  /** @var {RegExp} userpattern Regular expression for `username` property. */
  Workshop.prototype.codePattern = /^[A-Za-z0-9]+$/;

  /** @var {object} deleteWorkshop Currently marked workshop for deletion. */
  Workshop.prototype.deleteWorkshop = null;

  /** @var {object} drawingWorkshop Currently marked workshop for drawing. */
  Workshop.prototype.drawingWorkshop = null;

  /** @var {array} drawingTickets Randomly picked tickets of drawing. */
  Workshop.prototype.drawingTickets = null;

  /** @var {array} drawingAmount Amount of chosen tickets for drawing. */
  Workshop.prototype.drawingAmount = 2;

  /** @var {array} chartResults Currently loaded results for chart. */
  Workshop.prototype.chartResults = null;

  /** @var {object} chartTask Currently selected task of results. */
  Workshop.prototype.chartTask = null;

  //
  // METHODS
  //

  /**
   * Toggles `$$expanded` flag on workshop depending on query params.
   * https://ui-router.github.io/ng1/docs/latest/interfaces/ng1.ng1controller.html#uionparamschanged
   *
   * @public
   * @method uiOnParamsChanged
   * @param {object} params
   * @return {void}
   */
  Workshop.prototype.uiOnParamsChanged = function(params)
    {
      var workshop = this._workshops[params.expand];

      if (workshop) {
        workshop.$$expanded = true;
        this._expanded = workshop;
        return;
      }

      if (this._expanded) {
        this._expanded.$$expanded = false;
        this._expanded = null;
        return;
      }
    };

  /**
   * Creates a new workshop.
   *
   * @public
   * @method create
   * @return {void}
   */
  Workshop.prototype.create = function()
    {
      var notification = this.$injector.get('notification');
      var Workshop = this.$injector.get('Workshop');
      var i18n = this.$injector.get('i18n');

      var workshop = new Workshop({
        name: this.name,
        code: this.code
      });

      var me = this;

      var successCallback = function(workshop)
        {
          var message = i18n.get('Workshop has been created successfully!');
          notification.success(message);

          me.workshops.unshift(workshop);
          me._initWorkshop(workshop);

          me.name = null;
          me.code = null;
        };

      var failureCallback = function()
        {
          // noop
        };

      workshop.$create().then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Deletes a workshop after confirmation.
   *
   * @public
   * @method delete
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype.delete = function(workshop)
    {
      var notification = this.$injector.get('notification');
      var i18n = this.$injector.get('i18n');

      var me = this;

      var successCallback = function()
        {
          var message = i18n.get('Workshop has been deleted successfully!');
          notification.success(message);

          var index = me.workshops.indexOf(workshop);
          me.workshops.splice(index, 1);

          me._removeUsersStream(workshop);
        };

      var failureCallback = function()
        {
          // noop
        };

      workshop.$delete().then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Loads task's results and invokes modal dialog.
   *
   * @public
   * @method markWorkshopForDrawing
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype.markWorkshopForDrawing = function(workshop)
    {
      var Ticket = this.$injector.get('Ticket');
      var random = this.$injector.get('random');

      var me = this;
      var successCallback = function(tickets)
        {
          me.drawingTickets = random.shuffle(tickets);
          me.drawingWorkshop = workshop;
        };

      var failureCallback = function()
        {
        };

      var resource = Ticket.getByWorkshop({ workshopId: workshop.id });
      resource.$promise.then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Invokes confirmation modal for deleting a workshop.
   *
   * @public
   * @method markWorkshopForDeletion
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype.markWorkshopForDeletion = function(workshop)
    {
      this.deleteWorkshop = workshop;
    };

  /**
   * Toggles `isActive` of a workshop.
   *
   * @public
   * @method toggleActive
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype.toggleWorkshop = function(workshop)
    {
      var notification = this.$injector.get('notification');
      var i18n = this.$injector.get('i18n');

      var me = this;

      var successCallback = function(workshop)
        {
          var message = i18n.get(
            workshop.isActive ?
              'Workshop has been unlocked successfully. Students can register now!' :
              'Workshop has been locked successfully. Students can now only use their access from home!'
          );
          notification.success(message);

          me._initWorkshop(workshop);
        };

      var failureCallback = function()
        {
          // revert the change on failed update!
          workshop.isActive = !workshop.isActive;
        };

      workshop.isActive = !workshop.isActive;

      workshop.$update().then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Loads task's results and invokes modal dialog.
   *
   * @public
   * @method markTaskForChart
   * @param {object} task
   * @return {void}
   */
  Workshop.prototype.markTaskForChart = function(task)
    {
      var Result = this.$injector.get('Result');

      var me = this;
      var successCallback = function(results)
        {
          me.chartResults = results;
          me.chartTask = task;
        };

      var failureCallback = function()
        {
        };

      var resource = Result.getByTask({ taskId: task.id });
      resource.$promise.then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Toggles `isActive` of a task.
   *
   * @public
   * @method toggleTask
   * @param {object} task
   * @return {void}
   */
  Workshop.prototype.toggleTask = function(task)
    {
      var notification = this.$injector.get('notification');
      var i18n = this.$injector.get('i18n');
      var Task = this.$injector.get('Task');

      var successCallback = function(/*workshop*/)
        {
          var message = i18n.get(
            task.isActive ?
              'Task has been unlocked successfully. Students can send results now!' :
              'Task has been locked successfully. Students cannot send results currently!'
          );
          notification.success(message);
        };

      var failureCallback = function()
        {
          // revert the change on failed update!
          task.isActive = !task.isActive;
        };

      task.isActive = !task.isActive;

      var resource = Task.update({ id: task.id}, task);
      resource.$promise.then(
        successCallback,
        failureCallback
      );
    };

  /**
   * Sets `expand` query parameter dependending on
   * workshop's current `$$expanded` flag info.
   *
   * @public
   * @method expand
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype.expand = function(workshop)
    {
      var $state = this.$injector.get('$state');
      var expand = !workshop.$$expanded ?
        workshop.id : 
        null;

      $state.go('backend.workshops', {
        expand: expand
      });
    };

  /**
   * Sets up an event source for streaming user count.
   *
   * @private
   * @method _addUsersStream
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype._addUsersStream = function(workshop)
    {
      var API_URL = this.$injector.get('API_URL');
      var sse = this.$injector.get('sse');

      var me = this;

      var _onMessage = function(data) {
        me.$scope.$evalAsync(function(){
          workshop.$$users = data;
        });
      };

      var url = API_URL + '/sse/workshop/' + workshop.id + '/users';
      var options = { onMessage: _onMessage, sleep: 10 };
      var source = sse.addSource(url, options);
      this._userSources[workshop.id] = source;
    };

  /**
   * Removes an event source from internal stack and service.
   *
   * @private
   * @method _removeUsersStream
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype._removeUsersStream = function(workshop)
    {
      var sse = this.$injector.get('sse');

      var source = this._userSources[workshop.id];
      if (!source) {
        return;
      }

      delete this._userSources[workshop.id];
      sse.removeSource(source);
    };

  /**
   * Sets up event sources for updating result counters.
   *
   * @private
   * @method _streamResults
   * @return {void}
   */
  Workshop.prototype._streamResults = function()
    {
      var API_URL = this.$injector.get('API_URL');
      var sse = this.$injector.get('sse');

      var me = this;

      // --- SSE ---
      var _onMessage = function(workshop, data) {
        me.$scope.$evalAsync(function(){
          // remove event source if workshop is not
          // active at the moment === one-shot only
          if (!workshop.isActive) {
            sse.removeSource(me._resultsSource);
          }

          angular.forEach(data, function(item){
            var task = me._tasks[item.id];
            task.$$results = item.results;
          });
        });
      };

      var _watchExpression = function() {
        // workshop must be opened, but we also need
        // to watch `isActive` state to catch toggle
        // from property to reinitialize event source
        return me._expanded && me._expanded.isActive;
      };

      var _watchCallback = function() {
        if (me._resultsSource) {
          sse.removeSource(me._resultsSource);
        }

        if (me._expanded) {
          var url = API_URL + '/sse/workshop/' + me._expanded.id + '/results';
          var onMessage = _onMessage.bind(me, me._expanded);
          var options = { onMessage: onMessage, sleep: 5 };
          me._resultsSource = sse.addSource(url, options);
        }
      };

      this._unwatch = this.$scope.$watch(
        _watchExpression,
        _watchCallback
      );
    };

  /**
   * Maps all workshops to hash maps, sets up streaming and query params.
   *
   * @private
   * @method _initWorkshops
   * @return {void}
   */
  Workshop.prototype._initWorkshops = function()
    {
      var $uiRouterGlobals = this.$injector.get('$uiRouterGlobals');

      // create hash maps for workshops and tasks for ease lookups
      angular.forEach(this.workshops, this._initWorkshop.bind(this));

      // now make the initial call to change handler
      this.uiOnParamsChanged($uiRouterGlobals.params);

      // kick off general streaming of task results
      this._streamResults();
    };

  /**
   * Adds workshop and tasks to hash map and initializes
   * streaming for workshop depending on `isActive` flag.
   *
   * @private
   * @method _initWorkshop
   * @param {object} workshop
   * @return {void}
   */
  Workshop.prototype._initWorkshop = function(workshop)
    {
      // map all `tasks` to internal hash and set `$$results`
      var me = this;
      angular.forEach(workshop.tasks, function(task){
        var old = me._tasks[task.id] || null;
        task.$$results = old !== null ?
          old.$$results
          : 0;

        me._tasks[task.id] = task;
      });

      // check `$$expanded` flag for this workshop
      var id = this._expanded && this._expanded.id;
      workshop.$$expanded = workshop.id === id;

      // initialize `$$users` and set up streaming
      workshop.$$users = workshop.users.length;

      if (!workshop.isActive) {
        this._removeUsersStream(workshop);
      } else {
        this._addUsersStream(workshop);
      }

      this._workshops[workshop.id] = workshop;
    };

  /**
   * Removes all watches, listeners and sources
   * as soon as controller's $scope is destroyed.
   *
   * @private
   * @method _initListener
   * @return {void}
   */
  Workshop.prototype._initListener = function()
    {
      var sse = this.$injector.get('sse');

      var me = this;

      var _onDestroy = function() {
        for (var id in me._userSources) {
          sse.removeSource(me._userSources[id]);
        }

        if (me._resultsSource) {
          sse.removeSource(me._resultsSource);
        }

        me._resultsSource = null;
        me._userSources = {};

        me._unlisten();
        me._unwatch();
      };

      this._unlisten = this.$scope.$on('$destroy', _onDestroy);
    };


  angular.module(module).controller('WorkshopController', Workshop);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // FACTORY
  //

  /**
   * @constructor
   */
  var Factory = function($resource, API_URL) {
    var url = API_URL + '/workshop/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      validateWorkshopBackend: {
        method: 'GET',
        skipGlobalErrorMessage: true,
        url: API_URL + '/workshop/code/:code'
      },
      validateUsernameFrontend: {
        method: 'GET',
        skipGlobalErrorMessage: true,
        url: API_URL + '/auth/validate/username/:username'
      },
      validateWorkshopFrontend: {
        method: 'GET',
        skipGlobalErrorMessage: true,
        url: API_URL + '/auth/validate/workshop/:code'
      }
    };
    var options = {

    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('Workshop', Factory);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // FACTORY
  //

  /**
   * @constructor
   */
  var Factory = function($resource, API_URL) {
    var url = API_URL + '/ticket/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      getByWorkshop: {
        method: 'GET',
        isArray: true,
        url: API_URL + '/ticket/workshop/:workshopId'
      }
    };
    var options = {
    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('Ticket', Factory);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // FACTORY
  //

  /**
   * @constructor
   */
  var Factory = function($resource, $injector, API_URL) {
    var url = API_URL + '/result/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      getByTask: {
        method: 'GET',
        isArray: true,
        url: API_URL + '/result/task/:taskId'
      }
    };
    var options = {
    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', '$injector', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('Result', Factory);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // FACTORY
  //

  /**
   * @constructor
   */
  var Factory = function($resource, API_URL) {
    var url = API_URL + '/task/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
    };
    var options = {
    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('Task', Factory);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  //
  // FACTORY
  //

  /**
   * @constructor
   */
  var Factory = function($resource, API_URL) {
    var url = API_URL + '/user/:id';
    var paramDefaults = { id: '@id' };
    var actions = {
      current: {
        method: 'GET',
        skipGlobalErrorMessage: true,
        url: API_URL + '/user/current'
      }
    };
    var options = {

    };

    return $resource(url, paramDefaults, actions, options);
  };

  Factory.$inject = ['$resource', 'API_URL'];

  //
  // REGISTRY
  //
  angular.module(module).factory('User', Factory);

})(ANGULAR_MODULE, angular);

/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  // --------------------------------------------------
  // i18n
  // --------------------------------------------------
  angular.module(module).filter('i18n',['i18n',function(i18n){
    var filter = function()
      {
        return i18n.get.apply(i18n, arguments);
      };

    filter.$stateful = true;

    return filter;
  }]);

  // --------------------------------------------------
  // Percentage
  // --------------------------------------------------
  angular.module(module).filter('percent', function(){
    return function(value, fraction) {
      fraction = isNaN(fraction) ? 0 : fraction;
      value = isNaN(value) ? 0 : value * 100;

      return value.toFixed(fraction) + '%';
    };
  });

  // --------------------------------------------------
  // Coin
  // --------------------------------------------------
  angular.module(module).filter('coin', function(){
    return function(value) {

      if (value >= 1) {
        return value + '&#8364;';
      }

      return (value*100) + '&#162;';
    };
  });

  // --------------------------------------------------
  // Note
  // --------------------------------------------------
  angular.module(module).filter('note', function(){
    return function(value) {
      return value + '&#8364;';
    };
  });

})(ANGULAR_MODULE, angular);

/* globals UIkit */
(function() {
  'use strict';

  UIkit.component('off-canvas-scroll', {

    defaults: {
      offset: 0,
      target: '',
      duration: 1000,
      transition: 'easeOutExpo'
    },

    props: {
      target: String,
      offset: Number,
      duration: Number,
      transition: String
    },

    computed: {
        offcanvas: function() {
          return UIkit.offcanvas(this.target);
        },

        $offcanvas: function() {
          return this.offcanvas && this.offcanvas.$el;
        }
    },

    init: function() {
      if (!this.target) {
        console.error('off-canvas-scroll: Required "target" option is not set.');
        return;
      }

      if (!this.offcanvas) {
        console.error('off-canvas-scroll: No offcanvas component found with id: ' + this.target);
        return;
      }
    },

    events: {
      click: function(event, data) {
        if (data && data.scroll) {
          return;
        }

        this.offcanvas.hide();
        this.$offcanvas.on('hidden', this._onHidden);
      }
    },

    methods: {

      _onHidden: function() {
        this.$offcanvas.off('hidden', this._onHidden);

        this._dummyScroll = UIkit.scroll(this.$el, {
          transition: this.transition,
          duration: this.duration,
          offset: this.offset
        });

        this.$el.on('scrolled', this._onScrolled);
        this.$el.trigger('click', { scroll: true });
      },

      _onScrolled: function() {
        this.$el.off('scrolled', this._onScrolled);
        this._dummyScroll.$destroy();
      }
    }
  });

})();

/**
 * DOM initializations.
 */
(function($){
  'use strict';

  var _onReady = function() {
  };

  $(document).ready(_onReady);

})(jQuery);
