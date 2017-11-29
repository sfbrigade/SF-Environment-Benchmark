'use strict'
function legend (chartType, title, colorSwatches, showShade) {
  var margin = {top: 20, right: 5, bottom: 5, left: 5}
  var width = 160
  var height = 200

  var element = d3.select('#legend')
  var svg = element.append('svg')
  svg.attr('width', width)
     .attr('height', height)
     .append('g')

  // Update the inner dimensions.
  var g = svg.select('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  g.append('text').text(title).attr('font-size', '1.5em')

  var legendTitles = [
    'Bottom 25%',
    '25 - 50%',
    '50 - 75%',
    '75 - 100%'
  ]
  var tileSize = 16
  var padding = 5
  var tilesG = g.append('g').attr('transform', `translate(${padding}, ${10})`)
  let tile = tilesG.selectAll('.tile').data(legendTitles).enter().append('g').attr('class', 'tile')

  tile.append('rect')
      .attr('width', tileSize)
      .attr('height', tileSize)
      .attr('y', function (d, i) { return i * (tileSize + 4) })
      .attr('fill', function (d, i) { return colorSwatches[chartType][i] })
  tile.append('text')
      .text(function (d) { return d })
      .attr('alignment-baseline', 'middle')
      .attr('x', tileSize + padding)
      .attr('y', function (d, i) { return i * (tileSize + padding) + tileSize / 2 })

  var hlLineTile = g.append('g').attr('transform', `translate(${padding}, ${legendTitles.length * (tileSize + padding) + tileSize / 2})`)
  var lineFunction = d3.svg.line()
        .x(function (d) { return d.x })
        .y(function (d) { return d.y })
        .interpolate('linear')
  var hlline = [
    {x: tileSize / 2, y: 0},
    {x: tileSize / 2, y: tileSize * 2}
  ]

  hlLineTile.append('path')
      .attr('class', 'highlight')
      .attr('d', lineFunction(hlline))
      .attr('stroke', colorSwatches.highlight)
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,3')
      .attr('fill', 'none')
  hlLineTile.append('text')
      .text('Your Building')
      .attr('alignment-baseline', 'middle')
      .attr('x', tileSize + padding)
      .attr('y', tileSize)

  if (showShade) {
    var shadeTile = g.append('g').attr('transform', `translate(${padding}, ${(legendTitles.length + 2) * (tileSize + padding) + tileSize / 2})`)
    shadeTile.append('rect')
        .attr('width', tileSize)
        .attr('height', tileSize * 2)
        .attr('fill', colorSwatches.shaded)
    shadeTile.append('text')
        .text('May be eligible for')
        .attr('alignment-baseline', 'baseline')
        .attr('x', tileSize + padding)
        .attr('y', tileSize - 4)
    shadeTile.append('text')
        .text('ENERGY STAR Certification')
        .attr('alignment-baseline', 'hanging')
        .attr('x', tileSize + padding)
        .attr('y', tileSize + 4)
  }
}

module.exports = legend
