// tslint:disable-next-line: no-any
declare var require: any;
// tslint:disable-next-line: no-require-imports no-var-requires
const highcharts = require('highcharts');

/**
 * Sets the Legend Symbols to our custom legend symbols
 * this function needs to be self executing because uglify
 * drops the execution call when building an app with the --prod flag
 */
// tslint:disable-next-line: no-void-expression
export const configureLegendSymbols = ((): void => {
  // tslint:disable-next-line: no-any
  if (!highcharts.seriesTypes) {
    return;
  }

  // tslint:disable-next-line: no-any
  highcharts.seriesTypes.area.prototype.drawLegendSymbol = function(legend: any, item: any): void {
    item.legendSymbol = this.chart.renderer.path(
      ['M10.5 5.5l3.5 4.8v3.2H2v-11L6.5 8z']
    )
    .addClass('highcharts-point')
    .add(item.legendGroup);
  };
  // tslint:disable-next-line: no-any no-undef
  highcharts.seriesTypes.line.prototype.drawLegendSymbol = function(legend: any, item: any): void {
    item.legendSymbol = this.chart.renderer.path(
      ['M14 2.6l-3.8 4.8-3.4-2.3L2 9.8v2.8l5-5 3.6 2.5L14 5.8z']
    )
    .addClass('highcharts-point')
    .add(item.legendGroup);
  };

  // tslint:disable-next-line: no-any no-undef
  highcharts.seriesTypes.column.prototype.drawLegendSymbol = function(legend: any, item: any): void {
    item.legendSymbol = this.chart.renderer.path(
      ['M2 7.3h2.5v5.8H2z M6.8 3h2.5v10H6.8z M11.5 5.1H14V13h-2.5z']
    )
    .addClass('highcharts-point')
    .add(item.legendGroup);
  };
})();