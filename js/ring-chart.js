/*
todo: implement something like this:
https://bl.ocks.org/mbostock/3887193
*/
function ringChart() {
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 500,
      height = 500

  var color = d3.scale.ordinal()
      .range(["#e9a447", "#b4b4b4"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.value; });

  function findValueAndTotal(category, data){
    /* expecting data to be [{value: number, category: string}] */
    var total = data.reduce(function(acc, val) {
      return acc + val.value;
    }, 0)
    var value = data.find(function(el){
      return el.category === category
    }).value
    return [{value: value, category: category}, {value:total-value, category: 'the-rest'}]
  }

  function chart(selection) {
    selection.each(function(data) {
      /* data is expected to be an array of objects like: {x:num, y:num, r:num, id:str} where id is optional */
      /* Sort the data so smaller radius dots will be drawn on top */

      var foo = findValueAndTotal('foo1',data)
      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([pie(foo)]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");

      gEnter.append("g").attr("class", "arc")

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      // // Update the dots.
      // var dot = svg.select(".dots").selectAll(".dot").data(data);
      // dot.enter().append("circle").attr('class', 'dot');
      // dot.exit().transition().duration(1000).attr("r", function(d) { return 0 }).remove();
      // dot .attr("r", function(d) { return 0; })
      //     .attr("cx", function(d) { return x(d.x); })
      //     .attr("cy", function(d) { return y(d.y); })
      //     .attr('fill', function(d){ return color(d.x) } )
      //     .attr('fill-opacity', 0.6)
      //     // .attr('data-id', function(d) { return d.id })
      //     .order()
      // dot.transition().duration(1000)
      //     .attr("r", function(d) { return r(d.r); })

    })

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


  return chart;
}