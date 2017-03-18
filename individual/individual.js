"use strict";

//TODO: CHANGE limit on returned properties in function propertyTypeQuery()
const DATASOURCE = '75rg-imyz' // 'j2j3-acqj'
const METRICS = ['benchmark','energy_star_score','site_eui_kbtu_ft2','source_eui_kbtu_ft2','percent_better_than_national_median_site_eui','percent_better_than_national_median_source_eui','total_ghg_emissions_metric_tons_co2e','total_ghg_emissions_intensity_kgco2e_ft2','weather_normalized_site_eui_kbtu_ft2','weather_normalized_source_eui_kbtu_ft2']
const LIMITEDMETRICS = ['latest_energy_star_score', 'latest_total_ghg_emissions_metric_tons_co2e', 'latest_weather_normalized_site_eui_kbtu_ft2']
const BLK = /(.+)\//
const LOT = /[\/\.](.+)/

/* glogal reference objects */
/* colorSwatches should be shared between map.js & dashboard.js */
const colorSwatches = {
      foo: ['#FD6C16','#FEB921','#46AEE6','#134D9C'],
      highlight: '#ff00fc'
    };

let color = {
  energy_star_score: d3.scale.threshold().range(colorSwatches.foo),
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
var chartHistogram = d3.select('#chart-histogram')
var width = 500 //parseInt(chartHistogram.style('width'))
var histogram = histogramChart()
  .width(width)
  .height(200)
  .range([0,104])
  .bins(50)
  .tickFormat(d3.format(',d'))

/* variables for the ring chart */
var ringRange = [0,100];
var ringColorDomain = colorSwatches.foo;
var ringColorRange = [40, 60, 80, 100];
var ringHeight = 200;
var ringWidth = 200;

/**
 * Use c3.js for ring chart
 */
var ringChart = c3.generate({
   bindto: '#ringchart',
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
     width: 20, // for adjusting arc thickness
     startingAngle: 0,
     fullCircle: true
   },
   color: {
       pattern: ringColorDomain, // the three color levels for the percentage values.
       threshold: {
          unit: 'value', // percentage is default
          max: ringRange[1], // 100 is default
           values: ringColorRange
       }
   },
   size: {
       height: ringHeight,
       width: ringWidth
   }
});




/* query machine go! */
let singleBuildingData
let categoryData


if(! offline){
  propertyQuery( 1, {parcel_s: '3721/014'}, null, handleSingleBuildingResponse )
}else{
    handleSingleBuildingResponse(offline.single)
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
  singleBuildingData = parseSingleRecord(rows[0]) //save data in global var

  let type = singleBuildingData.property_type_self_selected
  // let minMax = ts.invertExtent(ts(+singleBuildingData.floor_area))
  let minMax = groups[type].scale.invertExtent(groups[type].scale(+singleBuildingData.floor_area))
  if(! offline){
    propertyQuery( null, null, formQueryString({where: whereArray( type, minMax )}), handlePropertyTypeResponse )
  } else {
    handlePropertyTypeResponse(offline.multiple)
  }


  ringChart.load({
    columns: [['data', +singleBuildingData.latest_energy_star_score]]
  });
}

/**
* handlePropertyTypeResponse - do something with the returned data
* @param {array} rows - returned from consumer.query.getRows
*/
function handlePropertyTypeResponse(rows) {
  categoryData = apiDataToArray( rows.map(parseSingleRecord) ) //save data in global var

  let estarVals = objArrayToSortedNumArray(categoryData, 'latest_energy_star_score')
  estarVals = estarVals.filter(function (d) { return d > 0 })

  /* draw histogram for energy star */
  histogram.colorScale(color.energy_star_score).bins(100).xAxisLabel('Energy Star Score').yAxisLabel('Buildings')
  chartHistogram.datum(estarVals).call(histogram)
  // chartHistogram.call(histogramHighlight,-10)
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

// function numberWithCommas(x) {
//     var parts = x.toString().split(".");
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     return parts.join(".");
// }
