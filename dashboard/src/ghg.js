import histogramChart from '../../js/histogram-chart.js'
import * as dataManipulation from './js/dataManipulation.js'
import * as helpers from './js/helpers.js'
import {Dashboard} from './js/dashboard.js'

import './css/dashboard.css'

// require('file-loader!./assets/sf_logo_white.png')

/* page elements */
var ghgHistogramElement = d3.select('#ghg-emissions-histogram')
var ghgWidth = 500 //parseInt(ghgHistogramElement.style('width'))
var ghgHistogram = histogramChart()
  .width(ghgWidth)
  .height(200)
  .range([0,1650])
  .tickFormat(d3.format(',d'))

Dashboard.displayPage = 'ghg'


/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
Dashboard.handlePropertyTypeResponse = function (rows) {
  //TODO: dataManipulation.parseSingleRecord finds the "latest" value for each metric, so the comparisons between buildings are not necessarially within the same year.  perhaps dataManipulation.parseSingleRecord should accept a param for year, passing to "latest" which finds that particular year instead of the "latest" metric. OR the apiCalls.propertyQuery call inside handleSingleBuildingResponse should take a param for year that only requests records which are not null for the individual building's "latest" metric year
  Dashboard.categoryData = rows.map( dataManipulation.parseSingleRecord )    // save data in global var
  Dashboard.categoryData = dataManipulation.cleanData( Dashboard.categoryData )        // clean data according to SFENV's criteria
  Dashboard.categoryData = dataManipulation.apiDataToArray( Dashboard.categoryData ) // filter out unwanted data


  let ghgVals = helpers.objArrayToSortedNumArray( Dashboard.categoryData, 'latest_total_ghg_emissions_metric_tons_co2e')
  ghgVals = ghgVals.filter(function (d) { return d > 0 })

  Dashboard.color.total_ghg_emissions_intensity_kgco2e_ft2.domain(helpers.arrayQuartiles(ghgVals))

  /* draw histogram for ghg */
  ghgHistogram
    .range([0,d3.max(ghgVals)])
    .colorScale(Dashboard.color.total_ghg_emissions_intensity_kgco2e_ft2)
    .bins(100)
    .xAxisLabel('GHG Emissions (Metric Tons CO2)')
    .yAxisLabel('Buildings')
    // .tickFormat(d3.format("d"))
  ghgHistogramElement.datum(ghgVals).call(ghgHistogram)
  ghgHistogramElement.call(Dashboard.addHighlightLine, Dashboard.singleBuildingData.latest_total_ghg_emissions_metric_tons_co2e, ghgHistogram, Dashboard.singleBuildingData.building_name)


  Dashboard.populateInfoBoxes(Dashboard.singleBuildingData, Dashboard.categoryData, Dashboard.floorAreaRange)

  $('#view-load').addClass('hidden')
  $('#view-content').removeClass('hidden')
}

setTimeout(Dashboard.setSidePanelHeight, 1000)

Dashboard.startQuery()
