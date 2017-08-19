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
   *
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
    var data = [];

    switch(me.task.type) {
      //case me.$injector.get('TYPE_INTEREST'):
      //case me.$injector.get('TYPE_INFLATION'):
      //case me.$injector.get('TYPE_DIVERSIFICATION'):
      //case me.$injector.get('TYPE_RISK'):
      case me.$injector.get('TYPE_ANCHORING'):

        var map = {};
        map[GROUP_A] = { choice1: 0, choice2: 0, count:0 };
        map[GROUP_B] = { choice1: 0, choice2: 0, count:0 };

        var mapResults = function(result) {
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

      //case me.$injector.get('TYPE_MENTAL_BOOKKEEPING'):
      //case me.$injector.get('TYPE_FRAMING'):
      //case me.$injector.get('TYPE_SAVINGS_TARGET'):
      //case me.$injector.get('TYPE_SAVINGS_SUPPORTED'):
      //case me.$injector.get('TYPE_SELF_COMMITMENT'):
      //case me.$injector.get('TYPE_PROCRASTINATION'):

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
        return [
          i18n.get('GROUP_A'),
          i18n.get('GROUP_B')
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
