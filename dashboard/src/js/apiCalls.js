const DATASOURCE = '75rg-imyz'

/**
* whereArray - form the 'where array' that goes into formQueryString
* @param {string} propertyType - property_type_self_selected
* @param {array} range - [min,max] of floor_area
* @return {array} the 'where array'
*/
function whereArray (propertyType, range) {
  if (range[0] === undefined) { range[0] = 10000 }
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
function formQueryString (params) {
  let query = 'SELECT '

  if (params.columns) {
    // params.columns is a string of comma separated column headings
    query += params.columns + ' '
  } else {
    query += '* '
  }

  if (params.where) {
    // params.where is an array of conditions written out as strings
    query += 'WHERE ' + params.where[0] + ' '
    let i = 1
    let len = params.where.length
    if (len > 1) {
      for (; i < len; i++) {
        query += 'AND ' + params.where[i] + ' '
      }
    }
  }

  if (params.limit) {
    // params.limit is an integer
    query += 'LIMIT ' + params.limit
  }

  return query
}

/**
* propertyQuery - query sfdata for a parcel or parcels
* @param {object} consumer - the soda-js consumer object
* @param {number} limit - how many entries to return
* @param {object} whereparams - query params, generally of the form {parcel_s: "####/###"} or {property_type_self_selected: "Office"}
* @param {string} soqlQuery - complete SOQL query string.  it seems this will override parameters in 'limit' and 'whereparams' if not null
* @param {function} handler - callback handler function for returned json
* @return some sort of promise
*/
function propertyQuery (consumer, limit, whereparams, soqlQuery, handler) {
  consumer.query()
    .withDataset(DATASOURCE)
    .limit(limit)
    .where(whereparams)
    .soql(soqlQuery)
    .getRows()
      // this might be starting down the road to callback hell
      .on('success', handler)
      .on('error', function (error) { console.error(error) })
}

export { whereArray, formQueryString, propertyQuery }
