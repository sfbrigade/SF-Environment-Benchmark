"use strict";

  $('.panel-body.side.flex-grow').height('800px');

  $('.nav.nav-pills li a').on('click', function() {
    if (($(this).is('#eui-tab')) || ($(this).is('#ghg-tab'))) {
      $('.panel-body.side.flex-grow').height('');
    } else {
      $('.panel-body.side.flex-grow').height('800px');
    }
  });

//TODO: CHANGE limit on returned properties in function propertyTypeQuery()
const DATASOURCE = '75rg-imyz' // 'j2j3-acqj'
const METRICS = ['benchmark','energy_star_score','site_eui_kbtu_ft2','source_eui_kbtu_ft2','percent_better_than_national_median_site_eui','percent_better_than_national_median_source_eui','total_ghg_emissions_metric_tons_co2e','total_ghg_emissions_intensity_kgco2e_ft2','weather_normalized_site_eui_kbtu_ft2','weather_normalized_source_eui_kbtu_ft2']
const LIMITEDMETRICS = ['latest_energy_star_score', 'latest_total_ghg_emissions_metric_tons_co2e', 'latest_site_eui_kbtu_ft2']
const BLK = /(.+)\//
const LOT = /[\/\.](.+)/

/* glogal reference objects */
/* colorSwatches should be shared between map.js & dashboard.js */
var colorSwatches = {
      energy_star_score: ['#EF839E','#ECD68C','#80D9AF','#4FAD8E'],
      total_ghg_emissions_intensity_kgco2e_ft2: ['#4FAD8E', '#80D9AF', '#ECD68C', '#EF839E'],
      site_eui_kbtu_ft2: ['#4FAD8E','#80D9AF', '#ECD68C', '#EF839E'],
      highlight: '#ff00fc'
    };

var color = {
  energy_star_score: d3.scale.threshold().range(colorSwatches.energy_star_score),
  total_ghg_emissions_intensity_kgco2e_ft2: d3.scale.threshold().range(colorSwatches.total_ghg_emissions_intensity_kgco2e_ft2),
  site_eui_kbtu_ft2: d3.scale.threshold().range(colorSwatches.site_eui_kbtu_ft2)
}

/* use soda-js to query */
// ref: https://github.com/socrata/soda-js
let consumer = new soda.Consumer('data.sfgov.org')

/* variables for testing */
// let specificParcel = {parcel_s: '0267/009'}
// let testquery = {
//   // columns: 'property_type_self_selected, parcel_s, floor_area',
//   where: whereArray( 'Office', [100000, 200000] ),
//   // limit: 10
// }

let groups = {
  Office:{
    names: [
      '<25k',
      '25-50k',
      '50-100k',
      '100-300k',
      '>300k'
    ],
    floorArea: [
      25000,
      50000,
      100000,
      300000
    ]
  },
  Hotel: {
    names: [
      '<25k',
      '25-50k',
      '50-100k',
      '100-250k',
      '>250k'
    ],
    floorArea: [
      25000,
      50000,
      100000,
      250000
    ]
  },
  Retail: {
    names: [
      '<20k',
      '>20k'
    ],
    floorArea: [
      20000
    ]
  }
}
for (let category in groups){
  /* d3.scale to get "similar" sized buildings */
  groups[category].scale = d3.scale.threshold()
        .domain(groups[category].floorArea)
        .range(groups[category].names);
}

/* example queries */
// console.log( formQueryString(testquery) )
// propertyQuery( 1, specificParcel, null, handleSingleBuildingResponse )
// propertyQuery( null, null, formQueryString(testquery), handlePropertyTypeResponse )
// propertyQuery( null, {property_type_self_selected:'Office'}, null, handlePropertyTypeResponse )


/* page elements */
var estarHistogramElement = d3.select('#energy-star-score-histogram')
var estarWidth = 500 //parseInt(estarHistogramElement.style('width'))
var estarHistogram = histogramChart()
  .width(estarWidth)
  .height(200)
  .range([0,104])
  .bins(50)
  .tickFormat(d3.format(',d'))

var ghgHistogramElement = d3.select('#ghg-emissions-histogram')
var ghgWidth = 500 //parseInt(ghgHistogramElement.style('width'))
var ghgHistogram = histogramChart()
  .width(ghgWidth)
  .height(200)
  .range([0,1650])
  .bins(100)
  .tickFormat(d3.format(',d'))

var euiChartElement = d3.select('#eui-stackedbar')






/* query machine go! */
let singleBuildingData
let categoryData
let floorAreaRange


// if(! offline){
  var urlVars = getUrlVars();
  if (urlVars.apn == undefined){
      console.error("Not a valid APN")
      //TODO: alert the user
  } else {
    // APN numbers look like 3721/014 and come from SF Open Data --
    // -- see example: https://data.sfgov.org/Energy-and-Environment/Existing-Commercial-Buildings-Energy-Performance-O/j2j3-acqj
    console.log("Trying APN: " + urlVars['apn']);
    $('#view-welcome').addClass('hidden')
    $('#view-load').removeClass('hidden')
    propertyQuery( 1, {parcel_s: urlVars['apn']}, null, handleSingleBuildingResponse )
  }
// }else{
//     handleSingleBuildingResponse(offline.single)
// }


// Get URL parameters
// see also: http://snipplr.com/view/19838
// Usage: `map = getUrlVars()` while at example.html?foo=asdf&bar=jkls
// sets map['foo']='asdf' and map['bar']='jkls'
function getUrlVars() {
  var vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
      vars[key] = value;
    });
  return vars;
}



/**
* whereArray - form the 'where array' that goes into formQueryString
* @param {string} propertyType - property_type_self_selected
* @param {array} range - [min,max] of floor_area
* @return {array} the 'where array'
*/
function whereArray(propertyType, range){
  if (range[0] == undefined) {range[0] = 0}
  let res = [
    "property_type_self_selected='" + propertyType + "'",
    'floor_area > ' + range[0]
  ]
  if (range[1]) {
    res.push('floor_area < ' + range[1])
  }
  return res
}

/**
* formQueryString - form a SOQL query string
* for multi-condition WHERE, otherwise use soda-js Consumer
* see https://dev.socrata.com/docs/queries/query.html
* @param {object} params - query params, limited in implementation
* @return {string} the query string
*/
function formQueryString(params){
  let query = 'SELECT '

  if (params.columns){
    // params.columns is a string of comma separated column headings
    query += params.columns + ' '
  } else {
    query += '* '
  }

  if (params.where){
    // params.where is an array of conditions written out as strings
    query += 'WHERE ' + params.where[0] + ' '
    let i = 1, len = params.where.length
    if (len > 1){
      for (; i<len; i++) {
        query += 'AND ' + params.where[i] + ' '
      }
    }
  }

  if (params.limit){
    //params.limit is an integer
    query += 'LIMIT ' + params.limit
  }

  return query
}

/**
* propertyQuery - query sfdata for a parcel or parcels
* @param {number} limit - how many entries to return
* @param {object} whereparams - query params, generally of the form {parcel_s: "####/###"} or {property_type_self_selected: "Office"}
* @param {string} soqlQuery - complete SOQL query string.  it seems this will override parameters in 'limit' and 'whereparams' if not null
* @param {function} handler - callback handler function for returned json
* @return some sort of promise
*/
function propertyQuery(limit, whereparams, soqlQuery, handler) {
  consumer.query()
    .withDataset(DATASOURCE)
    .limit(limit)
    .where(whereparams)
    .soql(soqlQuery)
    .getRows()
      // this might be starting down the road to callback hell
      .on('success', handler)
      .on('error', function(error) { console.error(error); });
}

/**
* handleSingleBuildingResponse - do something with the returned data, expects only one row
* @param {array} rows - returned from consumer.query.getRows, expects rows.length === 0
*/
function handleSingleBuildingResponse(rows) {
  if (typeof rows[0] == 'undefined') {
    return $('#view-load').html('The record for the chosen building was not found')
  }
  singleBuildingData = parseSingleRecord(rows[0]) //save data in global var

  let type = singleBuildingData.property_type_self_selected

  /* check to see if  the returned building is one of our supported building types */
  if (Object.keys(groups).indexOf(type) == -1) {
    console.error("not a supported building type");
    $('#view-load').html('The chosen building type is not supported by this dashboard interface')
  } else {
    // let minMax = ts.invertExtent(ts(+singleBuildingData.floor_area))
    let minMax = groups[type].scale.invertExtent(groups[type].scale(+singleBuildingData.floor_area))
    floorAreaRange = minMax
    // if(! offline){
      propertyQuery( null, null, formQueryString({where: whereArray( type, minMax )}), handlePropertyTypeResponse )
    // } else {
    //   handlePropertyTypeResponse(offline.multiple)
    // }
  }
}

/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
function handlePropertyTypeResponse(rows) {
  categoryData = apiDataToArray( rows.map(parseSingleRecord) ) //save data in global var

  let estarVals = objArrayToSortedNumArray(categoryData, 'latest_energy_star_score')
  estarVals = estarVals.filter(function (d) { return d > 0 })

  let ghgVals = objArrayToSortedNumArray(categoryData, 'latest_total_ghg_emissions_metric_tons_co2e')
  ghgVals = ghgVals.filter(function (d) { return d > 0 })

  let euiVals = objArrayToSortedNumArray(categoryData,'latest_site_eui_kbtu_ft2')
  euiVals = euiVals.filter(function (d) { return d > 0 && d < 1000 }) /* 1000 here is arbitrary to cut out outlier of SFMOMA & some others*/

  /* set color domains */
  var estarQuartiles = arrayQuartiles(estarVals)
  color.energy_star_score.domain(estarQuartiles)
  color.total_ghg_emissions_intensity_kgco2e_ft2.domain(arrayQuartiles(ghgVals))
  color.site_eui_kbtu_ft2.domain(arrayQuartiles(euiVals))

  /** Calculate z-score (Wasted a lot of time trying to get JS libs to work here, seems to be a lot easer to
  *                      explicitly calculat it--admittedly, it could be me as I'm not super JavaScript savvy)
  *       Libraries explored:
  *         - jStat: https://github.com/jstat/jstat
  *         - simple-statistics: https://github.com/simple-statistics/simple-statistics
  */
  // categoryData.zscoreVal = jstat.zscore(singleBuildingData.latest_energy_star_score, estarVals)
  categoryData.zscoreVal = (singleBuildingData.latest_energy_star_score - d3.mean(estarVals)) / d3.deviation(estarVals)

  /* draw histogram for energy star */
  estarHistogram.colorScale(color.energy_star_score).bins(100).xAxisLabel('Energy Star Score').yAxisLabel('Buildings')
  estarHistogramElement.datum(estarVals).call(estarHistogram)
  estarHistogramElement.call(histogramHighlight,singleBuildingData.latest_energy_star_score, estarHistogram)

  /* draw histogram for ghg */
  ghgHistogram
    .range([0,d3.max(ghgVals)])
    .colorScale(color.total_ghg_emissions_intensity_kgco2e_ft2)
    .bins(100)
    .xAxisLabel('GHG Emissions (Metric Tons CO2)')
    .yAxisLabel('Buildings')
  ghgHistogramElement.datum(ghgVals).call(ghgHistogram)
  ghgHistogramElement.call(histogramHighlight,singleBuildingData.latest_total_ghg_emissions_metric_tons_co2e,ghgHistogram)

  /* draw stacked bar for energy use intensity */
  // var euiWidth = parseInt(euiChartElement.style('width'))
  var euiWidth = 450
  var euiChart = hStackedBarChart()
    .width(euiWidth)
    .height(60)
    .colorScale(color.site_eui_kbtu_ft2)
    .margin({top: 10, right: 50, bottom: 10, left: 50})
  euiChartElement.datum(euiVals).call(euiChart)
  euiChartElement.call(stackedBarHighlight, singleBuildingData.latest_site_eui_kbtu_ft2, euiChart)

  populateInfoBoxes(singleBuildingData, categoryData, floorAreaRange)

  /* variables for the ring chart */
  var ringRange = [0,100];
  var ringHeight = 150;
  var ringWidth = 150;

  /**
   * Use c3.js for ring chart
   */
  //  TODO: override standard mouseover behavior (hide data)
  var ringChart = c3.generate({
     bindto: '#energy-star-score-radial',
     data: {
         columns: [
             ['data', 0]
         ],
         type: 'gauge'
     },
     gauge: {
       // units: 'units',
       label: {
          show:false, // to turn off the min/max labels.
          format: function(value, ratio) {
            return value + ' out of ' + ringRange[1];
          }
       },
       min: ringRange[0], // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
       max: ringRange[1],
       width: 14, // for adjusting arc thickness
       startingAngle: 0,
       fullCircle: true
     },
     color: {
         pattern: colorSwatches.energy_star_score, // the three color levels for the percentage values.
         threshold: {
            unit: 'value', // percentage is default
            max: ringRange[1], // 100 is default
            values: estarQuartiles
         }
     },
     size: {
         height: ringHeight,
         width: ringWidth
    }
  });

  ringChart.load({
    columns: [['data', +singleBuildingData.latest_energy_star_score]]
  });

  $('#view-load').addClass('hidden')
  $('#view-content').removeClass('hidden')
}

/**
* parseSingleRecord - parse the returned property record object
* @param {object} record - the record object returned from SODA
* @return {object} the record from @param with our "latest_" properties added
*/
function parseSingleRecord(record){
  if (record.parcel_s === undefined) {return null}
  if (! record.hasOwnProperty('property_type_self_selected') ) { record.property_type_self_selected = 'N/A'}
  record.parcel1 = BLK.exec(record.parcel_s)[1]
  record.parcel2 = LOT.exec(record.parcel_s)[1]
  record.blklot = '' + record.parcel1 + record.parcel2
  record.ID = '' + record.blklot
  METRICS.forEach(function (metric) {
    record = latest(metric, record)
  })
  return record
}

/**
* latest - loop through a single parcel to find the latest data
* @param {string} metric - the parcel metric being recorded
* @param {object} entry - the parcel record object
* @return {object} - the entry param with new "latest_" properties
*/
function latest (metric, entry) {
  //TODO: create [years] dynamically based on the current year?
  var years = [2011,2012,2013,2014,2015]
  if (metric === 'benchmark') years.unshift(2010)
  var yearTest = years.map(function(d){
    if (metric === 'benchmark') return 'benchmark_' + d + '_status'
    else return '_' + d + '_' + metric
  })
  yearTest.forEach(function(year,i){
    if (entry[year] != null){
      entry['latest_'+metric] = entry[year]
      entry['latest_'+metric+'_year'] = years[i]
    }
    else {
      entry['latest_'+metric] = entry['latest_'+metric] || 'N/A'
      entry['latest_'+metric+'_year'] = entry['latest_'+metric+'_year'] || 'N/A'
    }
  })
  return entry
}

/**
* apiDataToArray - transform record array to get a simpler, standardized array of k-v pairs
* @param {array} data - the input array of data records
* @return {array} an array of objects only latest_energy_star_score, latest_total_ghg_emissions_metric_tons_co2e, latest_weather_normalized_site_eui_kbtu_ft2
*/
function apiDataToArray (data) {
  let arr = data.map((parcel)=>{
    // if ( typeof parcel != 'object' || parcel === 'null' ) continue
    let res = {id: parcel.ID}
    LIMITEDMETRICS.forEach(metric=>{
        res[metric] = (typeof parseInt(parcel[metric]) === 'number' && !isNaN(parcel[metric])) ? parseInt(parcel[metric]) : -1
    })
    return res
  })
  return arr
}



// /**
// * digestData - reduces data from api into summary form
// */
// function digestData (categoryFilter) {
//   var arr = returnedApiData
//   if (categoryFilter && categoryFilter !== 'All') {
//     arr = arr.filter(function(parcel){
//       return parcel.property_type_self_selected === categoryFilter
//     })
//   }
//   var result = arr.reduce(function (prev, curr) {
//     // # of Properties
//     // SF of floor area
//     // Energy Like for Like 2013-2014 (418 properties)
//     // Total GHG Emissions (MT CO2e)
//     // Compliance Rate
//     return {
//       count: prev.count + 1,
//       floor_area: prev.floor_area + +curr.floor_area,
//       total_ghg: (isNaN(+curr.latest_total_ghg_emissions_metric_tons_co2e)) ? prev.total_ghg : prev.total_ghg + +curr.latest_total_ghg_emissions_metric_tons_co2e,
//       compliance: (curr.latest_benchmark === 'Complied') ? prev.compliance + 1 : prev.compliance
//     }
//   }, {count:0,floor_area:0,total_ghg:0,compliance:0})
//   result.compliance = roundToTenth(100*(result.compliance/result.count))
//   result.total_ghg = roundToTenth(result.total_ghg)
//   result.type = categoryFilter
//   return result
// }

/**
* populateInfoBoxes - brute force put returned data into infoboxes on the page
* @param {object} singleBuildingData - data for a single building
* @param {object} categoryData - data for the single building's category
* @param {object} floorAreaRange - floor area range for this category
* @return null
*/
function populateInfoBoxes (singleBuildingData,categoryData,floorAreaRange) {
  d3.select('#building-energy-star-score').text(singleBuildingData.latest_energy_star_score)
  d3.select('#building-eui').text(singleBuildingData.latest_site_eui_kbtu_ft2)
  d3.selectAll('.building-ghg-emissions ').text(singleBuildingData.latest_total_ghg_emissions_metric_tons_co2e)
  d3.selectAll('.building-type-lower').text(singleBuildingData.property_type_self_selected.toLowerCase())
  d3.selectAll('.building-type-upper').text(singleBuildingData.property_type_self_selected.toUpperCase())

  d3.select('#building-floor-area').text(numberWithCommas(singleBuildingData.floor_area))
  // d3.selectAll('.foo-building-compliance').text(singleBuildingData.)
  d3.selectAll('.building-name').text(singleBuildingData.building_name)
  d3.select('#building-street-address').text(singleBuildingData.building_address)
  d3.select('#building-city-address').text(
    singleBuildingData.full_address_city + ' ' +
    singleBuildingData.full_address_state + ', ' +
    singleBuildingData.full_address_zip + ' '
  )
  d3.selectAll('.building-type-sq-ft').text(numberWithCommas(floorAreaRange[0]) + '-' + numberWithCommas(floorAreaRange[1]))

  let euirank = rankBuildings(singleBuildingData.ID, categoryData, 'latest_weather_normalized_site_eui_kbtu_ft2')
  d3.select('#building-ranking').text(euirank[0])
  d3.select('#total-building-type').text(euirank[1])

  //TODO: change #local-ranking-tooltip
  // the following doesn't quite work:
  $("#local-ranking-tooltip").attr("data-original-title",
    "Based on score and energy use intensity, " + singleBuildingData.building_name +"'s energy use ranks #"
    + euirank[0] +" out of " + euirank[1] + " " + singleBuildingData.property_type_self_selected.toLowerCase() +
    " buildings sized between " + numberWithCommas(floorAreaRange[0])
    + '-' + numberWithCommas(floorAreaRange[1]) + " square feet.")
}

/**
* rankBuildings - ranking algorithim, dumb sort for now
* @param {string} id - building "ID" number
* @param {array} bldgArray - processed/simplified building data
* @param {string} prop - the property to rank by
* @return {array} [rank, count]
*/
function rankBuildings (id, bldgArray, prop) {
  //TODO: rank the buildings in te
  let sorted = bldgArray.sort(function(a,b){
    return +a[prop] - +b[prop]
  })

  let rank = sorted.findIndex(function(el){return el.id === id}) + 1
  let count = sorted.length

  return [rank, count]
}


/****** helper functions *******/
function onlyNumbers (val) {
  return (typeof parseInt(val) === 'number' && !isNaN(val)) ? parseInt(val) : -1
}

function objArrayToSortedNumArray (objArray,prop) {
  return objArray.map(function (el){ return el[prop] }).sort(function (a,b) { return a - b })
}

// function anyPropNA (obj) {
//   var result = false
//   for (var prop in obj) {
//     if (obj[prop] === "N/A") result = true
//   }
//   return result
// }

// function sortNumber (a,b) {
//   return a - b;
// }

// function roundToTenth (num){
//   return Math.round(10*num)/10
// }

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function histogramHighlight (selection, data, chart) {
  if( isNaN(data) ) data = -100
  var x = chart.xScale(),
      y = chart.yScale(),
      margin = chart.margin(),
      width = chart.width(),
      height = chart.height()
  var svg = selection.select('svg')
  var hl = svg.select("g").selectAll('.highlight').data([data])
  hl.enter().append("rect").attr('class', 'highlight')
  hl.attr("width", 2)
    .attr("x", function(d) { return x(d) })
    .attr("y", 1)
    .attr("height", height - margin.top - margin.bottom )
    .attr('fill', colorSwatches.highlight )
  hl.exit().remove()
}

function stackedBarHighlight (selection, data, chart) {
  if( isNaN(data) ) data = -100
  var x = chart.xScale(),
      y = chart.yScale(),
      margin = chart.margin(),
      width = chart.width(),
      height = chart.height()
  var svg = selection.select('svg')
  var hl = svg.select("g").selectAll('.highlight').data([data])
  hl.enter().append("rect").attr('class', 'highlight')
  hl.attr("width", 2)
    .attr("x", function(d) { return x(d) })
    .attr("y", 1)
    .attr("height", height - margin.top - margin.bottom )
    .attr('fill', colorSwatches.highlight )
  hl.exit().remove()
}

function arrayQuartiles (sortedArr) {
  return [
    d3.quantile(sortedArr,0.25),
    d3.quantile(sortedArr,0.5),
    d3.quantile(sortedArr,0.75)
  ]
}