import quartilesChart from '../../js/quartiles-chart.js'
import {arrayQuartiles, objArrayToSortedNumArray} from './js/helpers.js'
import {Dashboard} from './js/dashboard.js'

import './css/dashboard.css'

import logo from './assets/sf_logo_white.png'
var sfLogo = new Image()
sfLogo.src = logo
sfLogo.alt = "SF Dept of Environment"
document.getElementsByClassName('navbar-brand')[0].appendChild(sfLogo)

import eui from './assets/EUI.svg'
var euiLogo = new Image()
euiLogo.src = eui
euiLogo.alt = "EUI"
document.getElementById('eui-icon').appendChild(euiLogo)

/* page elements */
var euiChartElement = d3.select('#eui-quartileschart')

Dashboard.displayPage = 'eui'

/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
Dashboard.handlePropertyTypeResponse = function (rows) {
  Dashboard.cleanAndFilter(rows)

  let euiVals = objArrayToSortedNumArray(Dashboard.categoryData,'latest_site_eui_kbtu_ft2')
  euiVals = euiVals.filter(function (d) { return d > 1 && d < 1000 })

  Dashboard.color.site_eui_kbtu_ft2.domain(arrayQuartiles(euiVals))
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
