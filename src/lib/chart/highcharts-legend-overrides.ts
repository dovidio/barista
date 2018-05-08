import * as Highcharts from 'highcharts';

export const configureLegendSymbols = () => {
  // tslint:disable-next-line: no-any
  if (!(Highcharts as any).seriesTypes) {
    return;
  }
  // tslint:disable-next-line: no-any
  (Highcharts as any).seriesTypes.area.prototype.drawLegendSymbol = function(): void {
    const renderer = this.chart.renderer;
    const legendItemGroup = this.legendGroup;
    const attr = {
      fill: this.options.color,
    };
    this.legendLine = renderer.path(
      ['M10.5 5.5l3.5 4.8v3.2H2v-11L6.5 8z']).attr(attr).add(
      legendItemGroup);
  };
  // tslint:disable-next-line: no-any
  (Highcharts as any).seriesTypes.line.prototype.drawLegendSymbol = function(): void {
    const renderer = this.chart.renderer;
    const legendItemGroup = this.legendGroup;
    const attr = {
      fill: this.options.color,
    };
    this.legendLine = renderer.path(
      ['M14 2.6l-3.8 4.8-3.4-2.3L2 9.8v2.8l5-5 3.6 2.5L14 5.8z']).attr(attr).add(
      legendItemGroup);
  };
  // tslint:disable-next-line: no-any
  (Highcharts as any).seriesTypes.pie.prototype.drawLegendSymbol = function(legend: any, item: any): void {

    item.legendSymbol = this.chart.renderer.path(
      ['M13 13C13 7.5 8.5 3 3 3v10h10z'])
        .addClass('highcharts-point')
        .attr({
            zIndex: 3,
        }).add(item.legendGroup);
  };

  // tslint:disable-next-line: no-any
  (Highcharts as any).seriesTypes.column.prototype.drawLegendSymbol = function(): void {
    const renderer = this.chart.renderer;
    const legendItemGroup = this.legendGroup;
    const attr = {
      fill: this.options.color,
    };
    this.legendLine = renderer.path(
        ['M2 7.3h2.5v5.8H2z M6.8 3h2.5v10H6.8z M11.5 5.1H14V13h-2.5z']).attr(attr).add(
        legendItemGroup);
  };
};