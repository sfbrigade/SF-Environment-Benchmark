import histogramChart from './shared-js/histogram-chart.js'
import {rankBuildings} from './js/dataManipulation.js'
import {arrayQuartiles, objArrayToSortedNumArray} from './js/helpers.js'
import {Dashboard} from './js/dashboard.js'
import legend from './shared-js/legend.js'
import './css/dashboard.css'

import logo from './assets/sf_logo_white.png'
var sfLogo = new Image()
sfLogo.src = logo
sfLogo.alt = 'SF Dept of Environment'
document.getElementsByClassName('navbar-brand')[0].appendChild(sfLogo)

/* page elements */
var estarHistogramElement = d3.select('#energy-star-score-histogram')
var estarWidth = 500 // parseInt(estarHistogramElement.style('width'))
var estarHistogram = histogramChart()
  .width(estarWidth)
  .height(200)
  .shadeArea(Dashboard.colorSwatches.shaded)
  .range([0, 110])
  .tickFormat(d3.format(',d'))

Dashboard.displayPage = 'estar'

/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
Dashboard.handlePropertyTypeResponse = function (rows) {
  Dashboard.cleanAndFilter(rows)

  let estarVals = objArrayToSortedNumArray(Dashboard.categoryData, 'latest_energy_star_score')
  estarVals = estarVals.filter(function (d) { return d > 0 })

  let euiVals = objArrayToSortedNumArray(Dashboard.categoryData, 'latest_site_eui_kbtu_ft2')
  euiVals = euiVals.filter(function (d) { return d > 1 && d < 1000 })

  Dashboard.singleBuildingData.localRank = rankBuildings(Dashboard.singleBuildingData.ID, Dashboard.categoryData)

  var estarQuartiles = arrayQuartiles(estarVals)

  Dashboard.color.energy_star_score.domain(estarQuartiles)
  Dashboard.color.ranking.domain([ 0.25 * Dashboard.singleBuildingData.localRank[1], 0.5 * Dashboard.singleBuildingData.localRank[1], 0.75 * Dashboard.singleBuildingData.localRank[1] ])

  /* draw histogram for energy star */
  estarHistogram
    .colorScale(Dashboard.color.energy_star_score)
    .bins(20)
    .xAxisLabel('Energy Star Score')
    .yAxisLabel('# of Buildings')
  estarHistogramElement.datum(estarVals).call(estarHistogram)
  if (Dashboard.singleBuildingData.latest_benchmark === 'Complied') {
    estarHistogramElement.call(Dashboard.addHighlightLine, Dashboard.singleBuildingData.latest_energy_star_score, estarHistogram, Dashboard.singleBuildingData.building_name)
    d3.selectAll('.local-ranking-container').classed('hidden', false)
  }

  Dashboard.populateInfoBoxes(Dashboard.singleBuildingData, Dashboard.categoryData, Dashboard.floorAreaRange)

  $('#view-load').addClass('hidden')
  $('#view-content').removeClass('hidden')
}

setTimeout(Dashboard.setSidePanelHeight, 1000)

Dashboard.startQuery()

legend('energy_star_score', 'Building Percentile', Dashboard.colorSwatches, true)
