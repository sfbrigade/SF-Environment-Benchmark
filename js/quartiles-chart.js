function quartilesChart() {
  /* TODO use d3.stack instead */

  var margin = {top: 0, right: 0, bottom: 20, left: 10},
      width = 960,
      height = 500

  var color = d3.scale.threshold()
      .range(["#f7f7f7","#252525"]);

  var stack = d3.layout.stack()
  var x = d3.scale.linear()
  var y = d3.scale.linear()

  function chart(selection) {
    selection.each(function(data) {
      /* stacked bar chart example http://bl.ocks.org/mbostock/1134768 */
      var data = arrayQuartiles(data)
      var maxVal = d3.max(data)

      /* Update the x-scale. */
      x   .domain(d3.extent(data))
          .range([0, width - margin.left - margin.right]);

      /* Update the y-scale. */
      y   .domain( [0,1] )
          .range([height - margin.top - margin.bottom, 0]);

      var trianglepoints = `${x.range()[0]} ${y.range()[0]}, ${x.range()[1]} ${y.range()[0]}, ${x.range()[1]} ${y.range()[1]} `

      /* Select the svg element, if it exists. */
      var svg = d3.select(this).selectAll("svg").data([data]);

      /* Otherwise, create the skeletal chart. */
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "triangle");
      gEnter.append("g").attr("class", "labels");

      /* Update the outer dimensions. */
      svg .attr("width", width)
          .attr("height", height);

      /* Update the inner dimensions. */
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // arrayQuartiles, color.range()
      var gradientSteps = data.map(function(val,i){
        return {offset: x(val)/x(maxVal), color: color.range()[i] }
      })
      var defs = svg.append("defs");
      var linearGradient = defs.append("linearGradient")
          .attr("id", "linear-gradient");
      linearGradient.selectAll("stop")
        .data( gradientSteps )
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

      var triangle = svg.select(".triangle").append("polygon");
      triangle.attr('class', 'triangle');
      triangle.attr("points", trianglepoints)
          .attr("fill", "none")
          .style("fill", "url(#linear-gradient)");

      /* Update the axis labels. */
      var label = svg.select('.labels').selectAll('.axislabel').data(data);
      label.enter().append('text').attr('class', 'axislabel');
      label.exit().remove();
      label.style("text-anchor", function(d, i){
            if (i === 0) {return 'end'}
            else if (i === 4 || i === 2) {return 'start'}
            else {return 'middle'}
          })
          .style('alignment-baseline', 'before-edge')
          .attr("transform", function(d,i){
            if (i === 2) { return "translate(" + x(d) + "," + y(0.15) + ")"}
            else { return "translate(" + x(d) + "," + y(0) + ")" }
          })
          .text(function(d,i){
            var val = d
            if (i === 2) val += '-Median EUI'
            if (i === 4) val += ' (kbtu/ft2)'
            return val
          })
    });
  }

  function arrayQuartiles (sortedArr) {
    return [
      sortedArr[0],
      d3.quantile(sortedArr,0.25),
      d3.quantile(sortedArr,0.5),
      d3.quantile(sortedArr,0.75),
      sortedArr[sortedArr.length-1]
    ]
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    for (prop in _) {
      margin[prop] = _[prop];
    }
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.colorRange = function(_) {
    if (!arguments.length) return color.range();
    color.range(_);
    return chart;
  };

  chart.colorDomain = function(_) {
    if (!arguments.length) return color.domain();
    color.domain(_);
    return chart;
  };

  chart.colorScale = function(_) {
    if (!arguments.length) return {domain: color.domain(), range: color.range()};
    color = _;
    return chart;
  };

  chart.xScale = function(_) {
    if (!arguments.length) return x;
    return chart;
  };
  chart.yScale = function(_) {
    if (!arguments.length) return y;
    return chart;
  };

  return chart;
}