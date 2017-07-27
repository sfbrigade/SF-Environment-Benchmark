// TODO: tooltip for histogram bars to show count

function histogramChart() {
  var margin = {top: 5, right: 5, bottom: 30, left: 25},
      width = 960,
      height = 500

  var color = d3.scale.threshold()
      // .range(["#f7f7f7","#252525"]);

  var histogram = d3.layout.histogram(),
      x = d3.scale.linear(),
      y = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left")

  var xAxisLabel = ''
  var yAxisLabel = ''

  function chart(selection) {
    selection.each(function(data) {

      // Compute the histogram.
      data = histogram(data);

      // Update the x-scale.
      x   .domain( d3.extent(data.map(function(d) { return d.x; })) )
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      y   .domain([0, d3.max(data, function(d) { return d.y; })])
          .range([height - margin.top - margin.bottom, 0]);

      // color.domain(x.domain())

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "bars");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the bars.
      var bar = svg.select(".bars").selectAll(".bar").data(data);
      bar.enter().append("rect").attr('class', 'bar');
      bar.exit().transition().duration(1000).attr('fill', '#fff' ).remove();
      bar .attr("width", x(data[0].dx) - 1)
          .attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
          .attr("height", function(d) { return y.range()[0] - y(d.y); })
          .attr('fill', '#fff' )
          .order()
      bar.transition().duration(1000).attr('fill', function(d){ return color(d.x) } )

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + y.range()[0] + ")")
          .call(xAxis)
      svg.selectAll('.xlabel').remove()
      svg.append('text')
          .attr("transform", "translate(" + (width - margin.right) + "," + (height - 3) + ")")
          .attr('class', 'axis axislabel xlabel')
          .style("text-anchor", "end")
          .text(xAxisLabel)

      // Update the y-axis.
      g.selectAll(".y.axis")
          .attr("transform", "translate(" + x.range()[0] + ",0)")
          .call(yAxis)
      svg.selectAll('.ylabel').remove()
      svg.append('text')
          .attr("transform", "translate(" + (margin.left + 10) + "," + (margin.top) + ")rotate(-90)")
          .attr('class', 'axis axislabel ylabel')
          .style("text-anchor", "end")
          .text(yAxisLabel)
    });
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

  chart.xAxisLabel = function(_) {
    if (!arguments.length) return xAxisLabel;
    xAxisLabel = _;
    return chart;
  };

  chart.yAxisLabel = function(_) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = _;
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

  // Expose the histogram's value, range and bins method.
  d3.rebind(chart, histogram, "value", "range", "bins");

  // Expose the axis' tickFormat method.
  d3.rebind(chart, xAxis, "tickFormat");
  d3.rebind(chart, yAxis, "tickFormat");

  return chart;
}