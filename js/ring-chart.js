function ringChart() {
  var margin = {top: 10, right: 10, bottom: 10, left: 10}
  let width = 200
  let height = 200

  let ringHeight = 90
  let ringWidth = 90
  let ringThick = 8
  let ringRadius = d3.min([ringHeight,ringWidth])/2
  let arc = d3.svg.arc()
      .outerRadius(ringRadius)
      .innerRadius(ringRadius - ringThick)
      .startAngle(0)

  let color = d3.scale.ordinal()
      .range(["#e9a447", "#b4b4b4"])


  function chart(selection) {
    selection.each(function(data) {
      let svg = d3.select(this).selectAll("svg").data([data])
      let gEnter = svg.enter().append("svg").append("g")

      svg
        .attr("width", width)
        .attr("height", height)
        .append("g")

      let g = svg.select("g")
              .attr("transform", "translate(" +  (width / 2) + "," + (height / 2) + ")")

      let bg = g.append('path')
        .datum({ endAngle: 2 * Math.PI })
        .attr('fill', '#c6c6c6')
        .attr('d', arc)


      let fg = g.selectAll('.arc').data(data)
      fg.enter().append('path').attr("class", "arc")

      fg
        .attr('fill', function(d){ return color(d[0]) })
        .datum(function(d){ return { endAngle: arcAngle(d) } })//TODO: do this using proper binding
        .attr('d', arc)

      let label = g.selectAll('.label').data(data)
      label.enter().append('text').attr('class','label')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .text(function(d){
            return `${d[0]} out of ${d[1]}`
          })

    })

  }

  function arcAngle(arr){
    let foo = arr[1]-arr[0] + 1
    return (2*Math.PI*foo)/arr[1]
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

  chart.ringWidth = function(_) {
    if (!arguments.length) return ringWidth;
    ringWidth = _;
    return chart;
  };

  chart.ringHeight = function(_) {
    if (!arguments.length) return ringHeight;
    ringHeight = _;
    return chart;
  };

  chart.ringThick = function(_) {
    if (!arguments.length) return ringThick;
    ringThick = _;
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


  return chart;
}