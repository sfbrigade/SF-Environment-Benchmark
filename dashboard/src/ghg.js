import histogramChart from './shared-js/histogram-chart.js'
import {arrayQuartiles, objArrayToSortedNumArray} from './js/helpers.js'
import {Dashboard} from './js/dashboard.js'

import './css/dashboard.css'
import logo from './assets/sf_logo_white.png'
import ghg from './assets/GHG-icon.svg'

var sfLogo = new Image()
sfLogo.src = logo
sfLogo.alt = 'SF Dept of Environment'
document.getElementsByClassName('navbar-brand')[0].appendChild(sfLogo)

var ghgLogo = new Image()
ghgLogo.src = ghg
ghgLogo.alt = 'GHG emissions'
document.getElementById('ghg-icon').appendChild(ghgLogo)

/* page elements */
var ghgHistogramElement = d3.select('#ghg-emissions-histogram')
var ghgWidth = 500 // parseInt(ghgHistogramElement.style('width'))
var ghgHistogram = histogramChart()
  .width(ghgWidth)
  .height(200)
  .range([0, 1650])
  .tickFormat(d3.format(',d'))

Dashboard.displayPage = 'ghg'

/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
Dashboard.handlePropertyTypeResponse = function (rows) {
  Dashboard.cleanAndFilter(rows)

  let ghgVals = objArrayToSortedNumArray(Dashboard.categoryData, 'latest_total_ghg_emissions_metric_tons_co2e')
  ghgVals = ghgVals.filter(function (d) { return d > 0 })

  Dashboard.color.total_ghg_emissions_intensity_kgco2e_ft2.domain(arrayQuartiles(ghgVals))

  /* draw histogram for ghg */
  ghgHistogram
    .range([0, d3.max(ghgVals)])
    .colorScale(Dashboard.color.total_ghg_emissions_intensity_kgco2e_ft2)
    .bins(100)
    .xAxisLabel('GHG Emissions (Metric Tons CO2)')
    .yAxisLabel('# of Buildings')
    // .tickFormat(d3.format("d"))
  ghgHistogramElement.datum(ghgVals).call(ghgHistogram)
  ghgHistogramElement.call(Dashboard.addHighlightLine, Dashboard.singleBuildingData.latest_total_ghg_emissions_metric_tons_co2e, ghgHistogram, Dashboard.singleBuildingData.building_name)

  Dashboard.populateInfoBoxes(Dashboard.singleBuildingData, Dashboard.categoryData, Dashboard.floorAreaRange)

  $('#view-load').addClass('hidden')
  $('#view-content').removeClass('hidden')
}

setTimeout(Dashboard.setSidePanelHeight, 1000)

Dashboard.startQuery()
