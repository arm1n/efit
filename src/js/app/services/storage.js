/* global ANGULAR_MODULE, angular */
(function(module, angular) {
  'use strict';

  var Storage = function($window, $document, $log) {
    this.log = $log;
    this.window = $window;
    this.document = $document;

    this._init();
  };

  Storage.$inject = ['$window', '$document', '$log'];

  Storage.prototype.set = function(key, value, expires, domain, path, secure) {
    this._store.set(key, value, expires, domain, path, secure);
  };

  Storage.prototype.get = function(key) {
    return this._store.get(key);
  };

  Storage.prototype.getAll = function() {
    return this._store.getAll();
  };

  Storage.prototype.remove = function(key) {
    this._store.remove(key);
  };

  Storage.prototype.removeAll = function() {
    this._store.removeAll();
  };

  Storage.prototype.hasLocalStorage = function() {
    try {
        return (
            'localStorage' in this.window &&
            this.$window.localStorage !== null
        );
    } catch(e){
        return false;
    }
  };

  Storage.prototype._init = function() {
      var useCookies = (
          this.useCookies ||
          !this.hasLocalStorage()
      );

      this._store = useCookies ?
          this._getCookieProxy() :
          this._getLocalStorageProxy();
  };

  Storage.prototype._getLocalStorageProxy = function() {
      var me = this;
      var setItem = function(key,value) {
        value = encodeURIComponent(angular.toJson(value));
        me.$window.localStorage.setItem(key, value);
      };

      var getItem = function(key) {
        var value = me.$window.localStorage.getItem(key);
        if( typeof value !== 'string' ) {
          return undefined;
        }

        value = decodeURIComponent(value);
        if (value === 'undefined') {
          return undefined;
        }

        try{
            return angular.fromJson(value);
        } catch(e){
            return value;
        }
      };

      var getAllItems = function() {
        var items = {};

        for (var i=0; i<me.$window.localStorage.length; i++) {
            var key = me.$window.localStorage.key(i);
            items[key] = getItem(key);
        }

        return items;
      };

      var removeItem = function(key) {
          me.$window.localStorage.removeItem(key);
      };

      var removeAllItems = function() {
          me.$window.localStorage.clear();
      };

      return {
          get: getItem,
          getAll: getAllItems,
          set: setItem,
          remove: removeItem,
          removeAll: removeAllItems
      };
  };

  Storage.prototype._getCookieProxy = function() {
    var me = this;

    var _parse = function(value) {
      if (typeof value !== 'string') {
          return undefined;
      }

      value = decodeURIComponent(value);
      if (value === 'undefined') {
          return undefined;
      }

      try{
          return angular.fromJson(value);
      } catch(e) {
          return value;
      }
    };

    var _getAll = function(parse) {
      var cookies = me.document[0].cookie.split('; '),
          items = {};

      if (cookies.length===1 && cookies[0]==='') {
        return items;
      }

      for (var i = 0 ; i < cookies.length; i++) {
          var cookie = cookies[i].split('=');

          if (!parse) {
              items[cookie[0]] = cookie[1];
              continue;
          }

          items[cookie[0]] = _parse(cookie[1]);
      }

      return items;
    };

    var setCookie = function(key,value,expires,domain,path,secure) {
      value = (
          value !== undefined &&
          typeof value === 'object'
      ) ? angular.toJson(value) : value;

      value = encodeURIComponent(value);

      if (typeof expires !== 'undefined') {
          try{

              var date = new Date(expires);

              if( isNaN(date) ) // >>> "Invalid date"
              {
                  var input = expires; expires = undefined;
                  throw new Error('Storage.set(): "'+input+'" cannot be converted to date string!');
              }

              // cookies must be in UTC!
              expires = date.toUTCString();

          } catch(e){
              this.$log.error(e.message);
          }
      }

      expires = expires ? expires : false;

      var cookie = key + '=' + value;

      if (expires) {
        cookie += ';expires=' + expires;
      }

      if (domain) {
        cookie += ';domain=' + domain;
      }

      if (path) {
        cookie += ';path=' + path;
      }

      if (secure) {
        cookie += ';secure';
      }

      me.document[0].cookie = cookie;
    };

    var getCookie = function(key) {
      var cookies = _getAll(false);
      if (cookies.hasOwnProperty(key)) {
        return _parse(cookies[key]);
      }

      return undefined;
    };

    var getAllCookies = function() {
      return _getAll(true);
    };

    var removeCookie = function(key) {
      setCookie(key, '', -1);
    };

    var removeAllCookies = function() {
      var cookies = getAllCookies();
      for (var key in cookies) {
        removeCookie(key);
      }
    };

    return {
        get: getCookie,
        getAll: getAllCookies,
        set: setCookie,
        remove: removeCookie,
        removeAll: removeAllCookies
    };
  };

  angular.module(module).service('storage', Storage);

})(ANGULAR_MODULE, angular);
