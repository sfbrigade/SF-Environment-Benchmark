import quartilesChart from '../../js/quartiles-chart.js'
import * as dataManipulation from './js/dataManipulation.js'
import * as helpers from './js/helpers.js'
import {Dashboard} from './js/dashboard.js'

import './css/dashboard.css'

// require('file-loader!./assets/sf_logo_white.png')

/* page elements */
var euiChartElement = d3.select('#eui-quartileschart')

Dashboard.displayPage = 'eui'

/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
Dashboard.handlePropertyTypeResponse = function (rows) {
  //TODO: dataManipulation.parseSingleRecord finds the "latest" value for each metric, so the comparisons between buildings are not necessarially within the same year.  perhaps dataManipulation.parseSingleRecord should accept a param for year, passing to "latest" which finds that particular year instead of the "latest" metric. OR the apiCalls.propertyQuery call inside handleSingleBuildingResponse should take a param for year that only requests records which are not null for the individual building's "latest" metric year
  Dashboard.categoryData = rows.map(dataManipulation.parseSingleRecord)    // save data in global var
  Dashboard.categoryData = dataManipulation.cleanData(Dashboard.categoryData)        // clean data according to SFENV's criteria
  Dashboard.categoryData = dataManipulation.apiDataToArray( Dashboard.categoryData ) // filter out unwanted data


  let euiVals = helpers.objArrayToSortedNumArray(Dashboard.categoryData,'latest_site_eui_kbtu_ft2')
  euiVals = euiVals.filter(function (d) { return d > 1 && d < 1000 })

  Dashboard.color.site_eui_kbtu_ft2.domain(helpers.arrayQuartiles(euiVals))
  /* draw stacked bar for energy use intensity */
  // var euiWidth = parseInt(euiChartElement.style('width'))
  var euiWidth = 650
  var euiChart = quartilesChart()
    .width(euiWidth)
    .height(150)
    .colorScale(Dashboard.color.site_eui_kbtu_ft2)
    .margin({top: 20, right: 80, bottom: 20, left: 50})
  euiChartElement.datum(euiVals).call(euiChart)
  euiChartElement.call(Dashboard.addHighlightLine, Dashboard.singleBuildingData.latest_site_eui_kbtu_ft2, euiChart, Dashboard.singleBuildingData.building_name)


  Dashboard.populateInfoBoxes(Dashboard.singleBuildingData, Dashboard.categoryData, Dashboard.floorAreaRange)

  $('#view-load').addClass('hidden')
  $('#view-content').removeClass('hidden')
}

setTimeout(Dashboard.setSidePanelHeight, 1000)

Dashboard.startQuery()
