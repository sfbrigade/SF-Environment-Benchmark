'use strict'
// const fs = require('fs')
const data = require('./dashboard/offlinedata')
const METRICS = ['benchmark','energy_star_score','site_eui_kbtu_ft2','source_eui_kbtu_ft2','percent_better_than_national_median_site_eui','percent_better_than_national_median_source_eui','total_ghg_emissions_metric_tons_co2e','total_ghg_emissions_intensity_kgco2e_ft2','weather_normalized_site_eui_kbtu_ft2','weather_normalized_source_eui_kbtu_ft2']

let res = latest('site_eui_kbtu_ft2', data.multiple[0])
console.log( res )

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

  if (metric !== 'benchmark') {
    entry['pct_change_one_year_'+metric] = calcPctChange(entry, metric, 1)
    entry['pct_change_two_year_'+metric] = calcPctChange(entry, metric, 2)
  }

  return entry
}

function calcPctChange(entry, metric, yearsBack){
  let prev = getPrevYearMetric(entry, metric, yearsBack)
  let pctChange = (+entry['latest_'+metric] - prev)/prev
  return pctChange * 100
}

function getPrevYearMetric(entry, metric, yearsBack){
  let targetYear = entry['latest_'+metric+'_year'] - yearsBack
  let key = (metric === 'benchmark') ? `benchmark_${targetYear}_status` : `_${targetYear}_${metric}`
  return +entry[key]
}



//utility functions
function writeToFile(data, filename){
  if (typeof data != 'string') { data = JSON.stringify(data) }

  fs.writeFile(filename, data, function(err) {
    if(err) {
      console.log('error saving document', err)
    } else {
      console.log('The file was saved as ' + filename)
    }
  })
}
